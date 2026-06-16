/**
 * OpenRouter AI Service
 * Central client for all AI-powered features in the Interview AI platform.
 * 
 * Uses OpenRouter API which provides access to 100+ models.
 * Primary model: meta-llama/llama-3.3-70b-instruct (free, fast, excellent for interviews)
 * Fallback model: mistralai/mistral-7b-instruct (lightweight backup)
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Model selection by task type (using user-specified model)
const MODELS = {
  primary: 'nvidia/nemotron-3-ultra-550b-a55b:free',
  fast: 'nvidia/nemotron-3-ultra-550b-a55b:free',
  code: 'nvidia/nemotron-3-ultra-550b-a55b:free',
  free: 'nvidia/nemotron-3-ultra-550b-a55b:free',
};

/**
 * Core OpenRouter chat completion call with retry logic
 * @param {Array} messages - OpenAI-format messages array
 * @param {string} model - Model identifier
 * @param {object} options - Extra options (temperature, max_tokens)
 * @returns {string} - AI response text
 */
async function callOpenRouter(messages, model = MODELS.primary, options = {}, retries = 2) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const body = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 1500,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://interview-ai.platform',
        'X-Title': 'AI Interview Platform',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error('Empty response from OpenRouter');
      return text.trim();
    }

    const errText = await response.text();

    // Rate limit: wait and retry
    if (response.status === 429 && attempt < retries) {
      const retryAfter = parseInt(errText.match(/retry_after_seconds["\s:]+([\d.]+)/)?.[1] || '5') * 1000;
      console.warn(`OpenRouter rate limit hit. Retrying in ${retryAfter}ms... (attempt ${attempt + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, retryAfter + 500));
      // Fallback to a different model on retry
      if (attempt === 0 && model === MODELS.primary) body.model = 'google/gemma-2-9b-it:free';
      continue;
    }

    throw new Error(`OpenRouter API error ${response.status}: ${errText}`);
  }

  throw new Error('OpenRouter: max retries exceeded');
}

/**
 * Parse JSON from AI response safely, stripping markdown fences
 */
function parseJsonResponse(text) {
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Find first JSON array or object in the text
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) return JSON.parse(arrMatch[0]);
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    throw new Error('Could not parse JSON from AI response');
  }
}

// ─────────────────────────────────────────────────────────────
// TASK 1: Interview Question Generation
// ─────────────────────────────────────────────────────────────

/**
 * Generate 5 tailored interview questions
 * @param {string} type - HR | Technical | Behavioral | Aptitude | Coding
 * @param {string} difficulty - Easy | Medium | Hard
 * @param {string} role - Target job role
 * @param {string} company - Target company
 * @param {string} language - Programming language / domain
 * @param {string} resumeText - Resume context (optional)
 * @returns {string[]} Array of 5 question strings
 */
async function generateInterviewQuestions(type, difficulty, role, company, language, resumeText = '') {
  const companyCtx = company && company !== 'Common' ? `at ${company}` : 'at a top tech company';
  const resumeCtx = resumeText
    ? `\n\nCandidate Resume Context (use this to ask highly specific, personalized questions):\n${resumeText}`
    : '';

  const systemPrompt = `You are an elite senior technical interviewer from a world-class technology company. 
You conduct precise, realistic, and genuinely challenging interviews. 
You always ask questions that reference the candidate's actual experience, projects, and skills when available.
Never ask generic textbook questions — make every question feel authentic and contextual.`;

  const userPrompt = `Generate exactly 5 ${difficulty}-level ${type} interview questions for a ${role} position ${companyCtx}.
Interview Domain: ${type}
Programming Language/Domain: ${language || 'General'}${resumeCtx}

CRITICAL INSTRUCTIONS:
- If resume context is provided, reference the candidate's specific projects, companies, skills, and metrics by name
- Questions must feel like they come from a real interviewer who has read the resume carefully
- For Technical questions: ask about real-world system design, optimization problems, and edge cases
- For HR/Behavioral: reference their actual experience timeline and specific achievements
- For Coding: give algorithmic problem statements with clear examples

Return ONLY a valid JSON array of exactly 5 strings — no markdown, no explanation:
["question 1", "question 2", "question 3", "question 4", "question 5"]`;

  const text = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], MODELS.primary, { temperature: 0.75, max_tokens: 1200 });

  return parseJsonResponse(text);
}

// ─────────────────────────────────────────────────────────────
// TASK 2: AI Answer Evaluation & Scoring
// ─────────────────────────────────────────────────────────────

/**
 * AI-powered deep analysis of an interview answer
 * @param {string} question - The interview question
 * @param {string} answer - The candidate's answer
 * @param {string} type - Interview type
 * @param {string} role - Target role
 * @returns {object} Detailed evaluation with scores and feedback
 */
async function evaluateAnswer(question, answer, type, role) {
  const systemPrompt = `You are a senior technical interviewer evaluating interview answers. 
Be analytical, fair, and specific. Focus on both technical accuracy and communication quality.`;

  const userPrompt = `Evaluate this ${type} interview answer for a ${role} position.

QUESTION: ${question}

CANDIDATE'S ANSWER: ${answer}

Evaluate and return ONLY a valid JSON object (no markdown):
{
  "technicalScore": <0-100, technical accuracy and depth>,
  "communicationScore": <0-100, clarity, structure, and coherence>,
  "completenessScore": <0-100, how thoroughly the question was answered>,
  "overallScore": <0-100, weighted average>,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "idealAnswerHints": "Brief 2-3 sentence description of what an ideal answer would include",
  "keyMissingPoints": ["missing point 1", "missing point 2"]
}`;

  const text = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], MODELS.primary, { temperature: 0.3, max_tokens: 800 });

  return parseJsonResponse(text);
}

// ─────────────────────────────────────────────────────────────
// TASK 3: Resume Parsing & ATS Analysis
// ─────────────────────────────────────────────────────────────

/**
 * Parse raw resume text into structured data
 * @param {string} rawText - Raw resume text content
 * @returns {object} Structured resume data
 */
async function parseResumeText(rawText) {
  const systemPrompt = `You are a high-performance resume parsing AI. Extract structured data from resumes accurately.`;

  const userPrompt = `Parse this resume and extract structured information.

RESUME TEXT:
${rawText}

Return ONLY a valid JSON object with this exact structure (no markdown):
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number",
  "skills": ["Skill1", "Skill2"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Start - End",
      "desc": "Key accomplishments with metrics"
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "desc": "Description with metrics",
      "tech": "Technologies used"
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Degree/Major",
      "year": "Graduation Year"
    }
  ],
  "targetRole": "One of: Software Engineer | Web Developer | Data Analyst | AI/ML Engineer | Cybersecurity Analyst"
}`;

  const text = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], MODELS.primary, { temperature: 0.1, max_tokens: 1500 });

  return parseJsonResponse(text);
}

/**
 * Generate AI-powered ATS improvement suggestions
 * @param {object} resumeData - Structured resume data
 * @param {string} targetRole - Target job role
 * @param {number} atsScore - Computed ATS score
 * @param {string[]} missingKeywords - Missing keywords identified
 * @returns {string[]} AI-generated suggestions
 */
async function generateATSSuggestions(resumeData, targetRole, atsScore, missingKeywords) {
  const systemPrompt = `You are an expert resume coach and ATS optimization specialist with 10+ years experience helping candidates land jobs at top tech companies.`;

  const userPrompt = `A candidate is applying for a ${targetRole} position. Their resume has an ATS score of ${atsScore}/100.

Candidate Skills: ${resumeData.skills?.join(', ') || 'Not specified'}
Missing Keywords: ${missingKeywords?.join(', ') || 'None'}
Experience Count: ${resumeData.experience?.length || 0} roles
Projects Count: ${resumeData.projects?.length || 0} projects

Provide exactly 4 highly specific, actionable ATS improvement suggestions tailored to THIS candidate.
Return ONLY a JSON array of 4 strings (no markdown):
["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]`;

  const text = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], MODELS.fast, { temperature: 0.6, max_tokens: 600 });

  return parseJsonResponse(text);
}

// ─────────────────────────────────────────────────────────────
// TASK 4: Code Review & Hints
// ─────────────────────────────────────────────────────────────

/**
 * AI-powered code review for submitted solutions
 * @param {string} code - User's code solution
 * @param {string} language - Programming language
 * @param {string} challengeTitle - Challenge name
 * @param {string} challengeDesc - Problem description
 * @param {boolean} allPassed - Whether all tests passed
 * @returns {object} Code review with feedback
 */
async function reviewCode(code, language, challengeTitle, challengeDesc, allPassed) {
  const systemPrompt = `You are a senior software engineer conducting a code review. 
Be thorough, constructive, and educational. Help candidates improve their coding skills.`;

  const userPrompt = `Review this ${language} solution for the problem "${challengeTitle}".

PROBLEM: ${challengeDesc}

SUBMITTED CODE:
\`\`\`${language}
${code}
\`\`\`

Tests ${allPassed ? 'PASSED ✅' : 'FAILED ❌'}.

Provide a code review and return ONLY a valid JSON object (no markdown):
{
  "overallRating": <1-10>,
  "timeComplexity": "O(?) with explanation",
  "spaceComplexity": "O(?) with explanation",
  "codeQuality": <0-100>,
  "strengths": ["strength 1", "strength 2"],
  "issues": ["issue 1", "issue 2"],
  "optimizationTip": "One key optimization suggestion",
  "hint": "${allPassed ? 'How to optimize further' : 'Hint to fix the failing tests (no spoilers)'}",
  "interviewReadiness": "Brief assessment of whether this solution would pass a FAANG interview"
}`;

  const text = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], MODELS.code, { temperature: 0.3, max_tokens: 900 });

  return parseJsonResponse(text);
}

// ─────────────────────────────────────────────────────────────
// TASK 5: Performance Analysis & Career Roadmap
// ─────────────────────────────────────────────────────────────

/**
 * Generate personalized performance feedback after an interview session
 * @param {object} scoreCard - Session scorecard data
 * @param {string} role - Target role
 * @param {string} type - Interview type
 * @returns {object} Personalized feedback and roadmap
 */
async function generatePerformanceFeedback(scoreCard, role, type) {
  const systemPrompt = `You are a career coach specializing in technical interview preparation. 
Provide specific, actionable feedback that helps candidates improve.`;

  const userPrompt = `Generate performance feedback for a candidate after a ${type} interview for ${role}.

Performance Scores:
- Overall: ${scoreCard.overallScore}/100
- Technical Accuracy: ${scoreCard.technicalScore}/100
- Communication: ${scoreCard.communicationScore}/100
- Eye Contact: ${scoreCard.eyeContactScore}/100
- Speaking Pace: ${scoreCard.averageWpm} WPM
- Filler Words Used: ${scoreCard.totalFillers}
- Stress Level: ${scoreCard.stressScore}/100
- Weak Areas: ${scoreCard.weakTopics?.join(', ') || 'None identified'}

Return ONLY a valid JSON object (no markdown):
{
  "overallVerdict": "Pass | Borderline | Needs Improvement",
  "hiringLikelihood": <0-100>,
  "personalizedFeedback": "3-4 sentence personalized feedback paragraph",
  "top3Strengths": ["strength 1", "strength 2", "strength 3"],
  "top3Improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "studyPlan": [
    {"week": 1, "focus": "topic", "resources": "what to study"},
    {"week": 2, "focus": "topic", "resources": "what to study"},
    {"week": 3, "focus": "topic", "resources": "what to study"}
  ],
  "nextInterviewReady": "Estimated time until ready for real interviews"
}`;

  const text = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], MODELS.primary, { temperature: 0.5, max_tokens: 1000 });

  return parseJsonResponse(text);
}

// ─────────────────────────────────────────────────────────────
// TASK 6: Adaptive Follow-up Questions
// ─────────────────────────────────────────────────────────────

/**
 * Generate contextual follow-up question based on candidate's answer
 * @param {string} originalQuestion - The question that was asked
 * @param {string} answer - Candidate's answer
 * @param {number} answerScore - Score of the answer
 * @param {string} role - Target role
 * @returns {string} Follow-up question
 */
async function generateFollowUp(originalQuestion, answer, answerScore, role) {
  const depth = answerScore >= 80 ? 'deeper and more challenging' : 'clarifying and supportive';

  const userPrompt = `A ${role} candidate answered an interview question. Generate ONE ${depth} follow-up question.

ORIGINAL QUESTION: ${originalQuestion}
CANDIDATE ANSWER: ${answer.slice(0, 500)}
ANSWER QUALITY: ${answerScore}/100

Return ONLY the follow-up question as a plain string (no JSON, no quotes):`;

  const text = await callOpenRouter([
    { role: 'user', content: userPrompt },
  ], MODELS.fast, { temperature: 0.8, max_tokens: 150 });

  return text.replace(/^["']|["']$/g, '').trim();
}

// ─────────────────────────────────────────────────────────────
// TASK 7: Job Description Analysis
// ─────────────────────────────────────────────────────────────

/**
 * Analyze a job description and extract key requirements
 * @param {string} jobDescription - Raw JD text
 * @returns {object} Parsed JD data
 */
async function analyzeJobDescription(jobDescription) {
  const userPrompt = `Analyze this job description and extract structured information.

JD TEXT:
${jobDescription}

Return ONLY a valid JSON object (no markdown):
{
  "role": "Job Title",
  "company": "Company Name",
  "requiredSkills": ["skill1", "skill2"],
  "niceToHave": ["skill1", "skill2"],
  "experienceLevel": "Entry | Junior | Mid | Senior | Lead",
  "keyResponsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"],
  "interviewTopics": ["topic likely to be asked 1", "topic 2", "topic 3"],
  "salaryRange": "if mentioned, else null",
  "redFlags": ["any concerning aspects"],
  "matchScore": <0-100, how standard/competitive this JD is>
}`;

  const text = await callOpenRouter([
    { role: 'user', content: userPrompt },
  ], MODELS.fast, { temperature: 0.2, max_tokens: 800 });

  return parseJsonResponse(text);
}

module.exports = {
  callOpenRouter,
  generateInterviewQuestions,
  evaluateAnswer,
  parseResumeText,
  generateATSSuggestions,
  reviewCode,
  generatePerformanceFeedback,
  generateFollowUp,
  analyzeJobDescription,
  MODELS,
};
