const { callOpenRouter, parseJsonResponse } = require('./openrouter');
const { sanitizePromptInput } = require('../../utils/sanitizePromptInput');

/**
 * Generate 5 tailored interview questions based on role, experience, industry, and resume.
 * @param {string} type - HR | Technical | Behavioral | Aptitude | Coding
 * @param {string} difficulty - Beginner | Intermediate | Advanced | Expert
 * @param {string} role - Target job role
 * @param {string} company - Target company
 * @param {string} language - Programming language / domain
 * @param {string} resumeText - Resume context (optional)
 * @returns {Promise<string[]>} Array of 5 question strings
 */
async function generateInterviewQuestions(type, difficulty, role, company, language, resumeText = '') {
  const safeRole = sanitizePromptInput(role, 100);
  const safeCompany = sanitizePromptInput(company, 100);
  const safeResume = sanitizePromptInput(resumeText, 3000);
  const safeType = sanitizePromptInput(type, 100);
  const safeLanguage = sanitizePromptInput(language, 100);
  const safeDifficulty = sanitizePromptInput(difficulty, 100);

  const companyCtx = safeCompany && safeCompany !== 'Common' ? `at ${safeCompany}` : 'at a premium technology company';
  const resumeCtx = safeResume
    ? `\n\nCandidate Resume Context (reference specific details, projects, or metrics where appropriate):\n${safeResume}`
    : '';

  const systemPrompt = `You are a world-class senior interviewer at a top-tier tech company. You conduct realistic, highly tailored, and challenging interviews. 
You always ask precise, professional questions and avoid generic, textbook questions. Ensure your questions are conversational, recruiter-style, and context-aware.`;

  const userPrompt = `Generate exactly 5 ${safeDifficulty}-level mock interview questions for a ${safeRole} position ${companyCtx}.
Interview Domain: ${safeType}
Programming Language/Domain: ${safeLanguage || 'General'}${resumeCtx}

Instructions:
- Tailor the questions specifically to the candidate's background if resume context is provided.
- Maintain a realistic, professional, recruiter-like tone.
- For Technical/Coding: Focus on real-world systems, architecture trade-offs, optimization, and real problems rather than simple syntax questions.
- For Behavioral: Use STAR method prompting based on their experience or relevant scenarios.
- Return ONLY a valid JSON array of exactly 5 strings. Do not write any markdown blocks or explanations:
["question 1", "question 2", "question 3", "question 4", "question 5"]`;

  try {
    const text = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.75, max_tokens: 1200 });

    const questions = parseJsonResponse(text);
    if (Array.isArray(questions) && questions.length > 0) {
      return questions;
    }
    throw new Error('Invalid questions structure returned from OpenRouter');
  } catch (error) {
    console.error('[interviewAgent] Error generating questions:', error.message);
    throw error;
  }
}

/**
 * Generate a contextual follow-up question based on the candidate's previous response.
 * @param {string} originalQuestion - The question that was asked
 * @param {string} answer - The candidate's answer
 * @param {number} answerScore - Score of the answer (0-100)
 * @param {string} role - Target role
 * @returns {Promise<string>} Dynamic follow-up question
 */
async function generateFollowUp(originalQuestion, answer, answerScore, role) {
  const safeRole = sanitizePromptInput(role, 100);
  const safeQuestion = sanitizePromptInput(originalQuestion, 500);
  const safeAnswer = sanitizePromptInput(answer, 2000);

  const depth = answerScore >= 80 ? 'deeper, more challenging and technical' : 'clarifying and supportive to help them elaborate';
  
  const systemPrompt = `You are an adaptive, elite recruiter conducting a conversational live interview. Keep follow-ups natural, professional, and directly linked to what the candidate just said.`;
  
  const userPrompt = `A candidate for a ${safeRole} position has just answered an interview question.
Original Question: ${safeQuestion}
Candidate's Answer: ${safeAnswer}
Answer Quality Score: ${answerScore}/100

Generate ONE direct, conversational, recruiter-style follow-up question that goes ${depth}.
Return ONLY the raw follow-up question text (do not include JSON, quotes, prefix comments, or markdown):`;

  try {
    const text = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.8, max_tokens: 200 });

    return text.replace(/^["']|["']$/g, '').trim();
  } catch (error) {
    console.error('[interviewAgent] Error generating follow-up:', error.message);
    throw error;
  }
}

module.exports = {
  generateInterviewQuestions,
  generateFollowUp,
};
