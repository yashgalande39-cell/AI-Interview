const { callOpenRouter, parseJsonResponse } = require('./openrouter');
const { sanitizePromptInput } = require('../../utils/sanitizePromptInput');

/**
 * Parse raw resume text into structured resume objects.
 * @param {string} rawText - Raw text extracted from PDF/text file
 * @returns {Promise<object>} Structured resume data object
 */
async function parseResumeText(rawText) {
  const safeResume = sanitizePromptInput(rawText, 3000);
  const systemPrompt = `You are a high-performance resume parsing AI engine. You accurately extract and organize contact info, skills, experience, projects, and education from unstructured text.`;
  const userPrompt = `Parse the following raw resume text and extract structured fields.
Resume Text:
${safeResume}

Return ONLY a valid JSON object matching the exact structure below (no markdown fences, no extra text):
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number",
  "skills": ["Skill 1", "Skill 2"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Start - End",
      "desc": "Key accomplishments and responsibilities with metrics"
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "desc": "Detailed project description and contributions",
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

  try {
    const text = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.1, max_tokens: 1500 });

    return parseJsonResponse(text);
  } catch (error) {
    console.error('[resumeAnalyzer] Error parsing resume text:', error.message);
    throw error;
  }
}

/**
 * Generate AI-powered ATS improvement suggestions.
 * @param {object} resumeData - Structured resume data
 * @param {string} targetRole - Target job role
 * @param {number} atsScore - Computed ATS score (0-100)
 * @param {string[]} missingKeywords - Missing keywords identified
 * @returns {Promise<string[]>} Array of exactly 4 specific, actionable suggestions
 */
async function generateATSSuggestions(resumeData, targetRole, atsScore, missingKeywords) {
  const safeRole = sanitizePromptInput(targetRole, 100);
  const systemPrompt = `You are an expert resume coach, technical recruiter, and ATS optimization specialist.`;
  const userPrompt = `A candidate is applying for a "${safeRole}" role. Their current ATS compatibility score is ${atsScore}/100.
Current Resume Skills: ${resumeData.skills?.join(', ') || 'None specified'}
Missing Key Skills/Keywords: ${missingKeywords?.join(', ') || 'None'}
Work Experience Count: ${resumeData.experience?.length || 0} positions
Projects Count: ${resumeData.projects?.length || 0} projects

Generate exactly 4 highly personalized, actionable improvement suggestions to optimize their resume for ATS parser algorithms and recruiter visibility.
Return ONLY a valid JSON array of 4 strings (do not write markdown or prefix details):
["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]`;

  try {
    const text = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.6, max_tokens: 600 });

    return parseJsonResponse(text);
  } catch (error) {
    console.error('[resumeAnalyzer] Error generating ATS suggestions:', error.message);
    throw error;
  }
}

/**
 * Run a full, deep ATS scan on resume text for a target role.
 * @param {string} resumeText - Unstructured resume text
 * @param {string} targetRole - Target job role
 * @returns {Promise<object>} ATS analysis dashboard scores and details
 */
async function analyzeResume(resumeText, targetRole) {
  const safeRole = sanitizePromptInput(targetRole, 100);
  const safeResume = sanitizePromptInput(resumeText, 3000);
  const systemPrompt = `You are a premium ATS scanner and hiring manager assistant. Evaluate resumes rigorously.`;
  const userPrompt = `Analyze the resume text below against the target role of "${safeRole}".
Resume Text:
${safeResume}

Evaluate performance, formatting, keywords density, and accomplishments quantification.
Return ONLY a valid JSON object matching the exact structure below (no markdown fences, no extra text):
{
  "atsScore": 85, // Overall ATS score from 0-100
  "keywordScore": 80, // Keyword match score 0-100
  "formatScore": 90, // Structure/format score 0-100
  "impactScore": 75, // Accomplishment quantification score 0-100
  "overallGrade": "A", // A+ | A | B+ | B | C | D
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["missing1", "missing2"],
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "recommendations": ["specific recommendation 1", "recommendation 2"],
  "hiringSummary": "Hiring manager's summary perspective on candidate compatibility"
}`;

  try {
    const text = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.3, max_tokens: 1000 });

    return parseJsonResponse(text);
  } catch (error) {
    console.error('[resumeAnalyzer] Error analyzing resume:', error.message);
    throw error;
  }
}

/**
 * Analyze a job description to extract core parameters and requirements.
 * @param {string} jobDescription - Unstructured JD text
 * @returns {Promise<object>} Parsed JD metrics
 */
async function analyzeJobDescription(jobDescription) {
  const safeJD = sanitizePromptInput(jobDescription, 3000);
  const systemPrompt = `You are a professional HR intelligence analyst. Extract accurate requirements and structures from job postings.`;
  const userPrompt = `Analyze the job description text below and extract target metrics.
Job Description:
${safeJD}

Return ONLY a valid JSON object matching the exact structure below (no markdown fences, no extra text):
{
  "role": "Job Title",
  "company": "Company Name",
  "requiredSkills": ["skill1", "skill2"],
  "niceToHave": ["skill1", "skill2"],
  "experienceLevel": "Entry | Junior | Mid | Senior | Lead",
  "keyResponsibilities": ["responsibility 1", "responsibility 2"],
  "interviewTopics": ["topic likely to be asked 1", "topic 2"],
  "salaryRange": "Salary range if mentioned, otherwise null",
  "redFlags": ["any red flags or warnings"],
  "matchScore": 85 // standard score of job post quality from 0-100
}`;

  try {
    const text = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.2, max_tokens: 800 });

    return parseJsonResponse(text);
  } catch (error) {
    console.error('[resumeAnalyzer] Error analyzing job description:', error.message);
    throw error;
  }
}

module.exports = {
  parseResumeText,
  generateATSSuggestions,
  analyzeResume,
  analyzeJobDescription,
};
