/**
 * TRESK AI — Multi-Agent Evaluation System
 * =====================================================================
 * Specialized AI agents, each with a focused responsibility.
 * Agents use the shared OpenRouter gateway for cost-efficient LLM calls.
 *
 * Available Agents:
 *  - InterviewAgent      — adaptive question generation & session control
 *  - ResumeAgent         — ATS analysis, impact scoring, keyword density
 *  - CodingAgent         — code review, complexity, code smell detection
 *  - BehaviorAgent       — STAR methodology & soft-skill evaluation
 *  - RecommendationAgent — gap analysis → course/practice suggestions
 *  - CareerCoachAgent    — holistic career planning & goal alignment
 *  - ReportAgent         — unified evaluation report with confidence score
 */

const { callOpenRouter } = require('./openrouter');

// ─── Model Cost Estimates (USD per 1M tokens) ────────────────────────────────
const COST_PER_M_TOKENS = {
  'google/gemini-flash-1.5':        { input: 0.075, output: 0.30 },
  'meta-llama/llama-3.1-8b-instruct': { input: 0.06,  output: 0.06 },
  'anthropic/claude-3-haiku':       { input: 0.25,  output: 1.25 },
  default:                          { input: 0.10,  output: 0.30 },
};

/**
 * Compute approximate cost from usage metadata returned by OpenRouter.
 */
function estimateCost(model, promptTokens, completionTokens) {
  const rates = COST_PER_M_TOKENS[model] || COST_PER_M_TOKENS.default;
  return (
    (promptTokens / 1_000_000) * rates.input +
    (completionTokens / 1_000_000) * rates.output
  );
}

/**
 * Shared agent runner — wraps callOpenRouter with metadata tracking.
 * Returns { result, usage: { promptTokens, completionTokens, costUsd } }
 */
async function runAgent(systemPrompt, userPrompt, options = {}) {
  const { model, temperature = 0.4, maxTokens = 1500 } = options;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userPrompt },
  ];

  const raw = await callOpenRouter(messages, { model, temperature, maxTokens });

  // callOpenRouter returns the text content; try to parse JSON if expected
  let result = raw;
  try {
    if (typeof raw === 'string' && (raw.trim().startsWith('{') || raw.trim().startsWith('['))) {
      result = JSON.parse(raw);
    }
  } catch (_) { /* keep as string */ }

  // Usage tracking (OpenRouter may expose token counts in future; default 0 if not available)
  const usage = {
    promptTokens:     options._promptTokens     || 0,
    completionTokens: options._completionTokens || 0,
    costUsd: 0,
  };
  usage.costUsd = estimateCost(model || 'default', usage.promptTokens, usage.completionTokens);

  return { result, usage };
}

// =============================================================================
// INTERVIEW AGENT
// Generates adaptive questions based on session context & user profile.
// =============================================================================
const InterviewAgent = {
  name: 'InterviewAgent',

  async generateQuestions({ role, company, type, difficulty, resume, previousQuestions = [] }) {
    const systemPrompt = `You are an expert technical interviewer at ${company || 'a top tech company'}.
Your role is to generate highly relevant, adaptive interview questions for a ${difficulty} ${type} interview.
Focus on: role-specific depth, behavioral insight, real-world application.
Avoid repeating these previously asked questions: ${previousQuestions.slice(-3).join(' | ') || 'none'}.
Return a JSON array of exactly 5 question strings.`;

    const userPrompt = `Candidate role: ${role || 'Software Engineer'}
Resume summary: ${JSON.stringify(resume || {})}
Generate ${difficulty} ${type} questions.`;

    return runAgent(systemPrompt, userPrompt, { temperature: 0.6, maxTokens: 800 });
  },
};

// =============================================================================
// RESUME AGENT
// Advanced ATS analysis beyond keyword matching.
// =============================================================================
const ResumeAgent = {
  name: 'ResumeAgent',

  async analyze({ resumeText, targetRole, targetCompany }) {
    const systemPrompt = `You are an elite ATS resume analyst and recruiter with 15 years of experience at FAANG companies.
Analyze the provided resume with the precision of a real ATS system.
Return a JSON object with this exact structure:
{
  "ats_score": <0-100>,
  "impact_score": <0-100>,
  "grammar_score": <0-100>,
  "readability_score": <0-100>,
  "keyword_density": <0-100>,
  "seniority_estimate": "<junior|mid|senior|staff>",
  "industry_alignment": <0-100>,
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"],
  "missing_keywords": ["<keyword1>", "<keyword2>"],
  "recommended_improvements": ["<improvement1>", "<improvement2>"],
  "recruiter_impression": "<short paragraph describing first impression>",
  "confidence": <0.0-1.0>
}`;

    const userPrompt = `Target Role: ${targetRole || 'Software Engineer'}
Target Company: ${targetCompany || 'Top Tech Company'}

Resume:
${resumeText}`;

    return runAgent(systemPrompt, userPrompt, { temperature: 0.2, maxTokens: 1200 });
  },
};

// =============================================================================
// CODING AGENT
// Reviews code for correctness, complexity, code smells, and security.
// =============================================================================
const CodingAgent = {
  name: 'CodingAgent',

  async review({ code, language, problemTitle, testResults }) {
    const systemPrompt = `You are a senior software engineer and code reviewer with expertise in algorithms and system design.
Analyze the submitted code and return a JSON object:
{
  "correctness_score": <0-100>,
  "time_complexity": "<O(...)>",
  "space_complexity": "<O(...)>",
  "code_quality_score": <0-100>,
  "issues": [
    { "type": "<code_smell|security|performance|readability>", "description": "<issue>", "line": <line_number_estimate> }
  ],
  "refactoring_suggestions": ["<suggestion1>", "<suggestion2>"],
  "security_concerns": ["<concern>"] ,
  "overall_verdict": "<accepted|needs_improvement|rejected>",
  "explanation": "<brief explanation of code approach>",
  "confidence": <0.0-1.0>
}`;

    const userPrompt = `Problem: ${problemTitle || 'Coding Challenge'}
Language: ${language}
Test Results: ${JSON.stringify(testResults || {})}

Code:
\`\`\`${language}
${code}
\`\`\``;

    return runAgent(systemPrompt, userPrompt, { temperature: 0.2, maxTokens: 1000 });
  },
};

// =============================================================================
// BEHAVIOR AGENT
// STAR methodology evaluation, soft-skill scoring.
// =============================================================================
const BehaviorAgent = {
  name: 'BehaviorAgent',

  async evaluate({ question, answer, role }) {
    const systemPrompt = `You are an expert behavioral interviewer trained in STAR methodology (Situation, Task, Action, Result).
Evaluate the candidate's answer for a ${role || 'Software Engineer'} position.
Return a JSON object:
{
  "star_score": <0-100>,
  "situation_clarity": <0-100>,
  "task_definition": <0-100>,
  "action_detail": <0-100>,
  "result_impact": <0-100>,
  "communication_score": <0-100>,
  "leadership_indicator": <0-100>,
  "problem_solving_score": <0-100>,
  "filler_words_detected": ["um", "like"],
  "vocabulary_score": <0-100>,
  "hiring_recommendation": "<strong_yes|yes|maybe|no>",
  "reasoning": "<brief explanation of the evaluation>",
  "improvement_tips": ["<tip1>", "<tip2>"],
  "confidence": <0.0-1.0>
}`;

    const userPrompt = `Interview Question: ${question}

Candidate Answer: ${answer}`;

    return runAgent(systemPrompt, userPrompt, { temperature: 0.3, maxTokens: 900 });
  },
};

// =============================================================================
// RECOMMENDATION AGENT
// Maps weaknesses → actionable learning recommendations.
// =============================================================================
const RecommendationAgent = {
  name: 'RecommendationAgent',

  async recommend({ weakTopics, strongTopics, targetRole, targetCompany }) {
    const systemPrompt = `You are an AI career advisor specializing in technical interview preparation.
Based on the candidate's identified weak and strong areas, generate a targeted improvement plan.
Return a JSON object:
{
  "priority_topics": ["<topic1>", "<topic2>", "<topic3>"],
  "learning_plan": [
    {
      "topic": "<topic>",
      "reason": "<why this needs improvement>",
      "resources": ["<resource1>", "<resource2>"],
      "practice_type": "<coding|behavioral|system_design|reading>",
      "estimated_days": <number>
    }
  ],
  "recommended_projects": ["<project_idea1>", "<project_idea2>"],
  "readiness_estimate_days": <number>,
  "confidence": <0.0-1.0>
}`;

    const userPrompt = `Candidate targeting: ${targetRole || 'Software Engineer'} at ${targetCompany || 'Top Tech Companies'}
Weak topics: ${weakTopics.join(', ')}
Strong topics: ${strongTopics.join(', ')}`;

    return runAgent(systemPrompt, userPrompt, { temperature: 0.5, maxTokens: 1000 });
  },
};

// =============================================================================
// CAREER COACH AGENT
// Holistic career guidance based on full profile.
// =============================================================================
const CareerCoachAgent = {
  name: 'CareerCoachAgent',

  async coach({ profile, interviewHistory, careerGoal }) {
    const systemPrompt = `You are an elite AI career coach who has helped thousands of candidates land roles at top companies.
Based on the candidate's profile and interview history, provide strategic career guidance.
Return a JSON object:
{
  "overall_readiness": <0-100>,
  "hiring_probability": <0-100>,
  "strengths_summary": "<paragraph>",
  "growth_areas": ["<area1>", "<area2>"],
  "career_roadmap": [
    { "milestone": "<milestone>", "timeline": "<e.g. 2 weeks>", "action": "<specific action>" }
  ],
  "company_fit": [
    { "company": "<name>", "fit_score": <0-100>, "reason": "<reason>" }
  ],
  "motivational_message": "<personalized encouragement>",
  "confidence": <0.0-1.0>
}`;

    const userPrompt = `Career Goal: ${careerGoal || 'Software Engineer at a top tech company'}
Profile: ${JSON.stringify(profile || {})}
Recent Interview History (summary): ${JSON.stringify(interviewHistory || [])}`;

    return runAgent(systemPrompt, userPrompt, { temperature: 0.5, maxTokens: 1200 });
  },
};

// =============================================================================
// REPORT AGENT
// Consolidates all agent outputs into a unified evaluation report.
// =============================================================================
const ReportAgent = {
  name: 'ReportAgent',

  /**
   * Generate a complete interview report from all agent outputs.
   * Adds a top-level confidence index (average of individual confidences).
   */
  generate({ interviewScores, behaviorScores, codingScores, recommendations }) {
    const sources = [interviewScores, behaviorScores, codingScores].filter(Boolean);
    const avgConfidence = sources.length
      ? sources.reduce((sum, s) => sum + (s.confidence || 0.5), 0) / sources.length
      : 0.5;

    const technicalScore  = interviewScores?.score_technical  || codingScores?.correctness_score  || 0;
    const behavioralScore = behaviorScores?.star_score        || 0;
    const communicationScore = behaviorScores?.communication_score || interviewScores?.score_communication || 0;

    const overallScore = Math.round(
      (technicalScore * 0.4) + (behavioralScore * 0.3) + (communicationScore * 0.3)
    );

    return {
      overall_score:        overallScore,
      technical_score:      technicalScore,
      behavioral_score:     behavioralScore,
      communication_score:  communicationScore,
      leadership_score:     behaviorScores?.leadership_indicator || 0,
      problem_solving_score: behaviorScores?.problem_solving_score || 0,
      hiring_recommendation: behaviorScores?.hiring_recommendation || 'maybe',
      star_breakdown: {
        situation: behaviorScores?.situation_clarity || 0,
        task:      behaviorScores?.task_definition   || 0,
        action:    behaviorScores?.action_detail      || 0,
        result:    behaviorScores?.result_impact      || 0,
      },
      code_quality:          codingScores?.code_quality_score || null,
      time_complexity:       codingScores?.time_complexity    || null,
      improvement_tips:      [
        ...(behaviorScores?.improvement_tips      || []),
        ...(codingScores?.refactoring_suggestions || []),
      ].slice(0, 5),
      priority_topics:       recommendations?.priority_topics || [],
      evaluation_confidence: parseFloat(avgConfidence.toFixed(2)),
      confidence_label:      avgConfidence >= 0.80 ? 'High' : avgConfidence >= 0.55 ? 'Medium' : 'Low',
    };
  },
};

module.exports = {
  InterviewAgent,
  ResumeAgent,
  CodingAgent,
  BehaviorAgent,
  RecommendationAgent,
  CareerCoachAgent,
  ReportAgent,
  runAgent,
  estimateCost,
};
