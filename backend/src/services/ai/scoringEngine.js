const { callOpenRouter, parseJsonResponse } = require('./openrouter');

/**
 * AI-powered deep evaluation of a candidate's answer.
 * @param {string} question - The interview question asked
 * @param {string} answer - The candidate's response
 * @param {string} type - HR | Technical | Behavioral | Aptitude | Coding
 * @param {string} role - Target job role
 * @returns {Promise<object>} Evaluation object containing rubrics, scores, and feedback
 */
async function evaluateAnswer(question, answer, type, role) {
  const systemPrompt = `You are an elite, demanding tech interviewer evaluating interview answers. 
Be highly analytical, fair, and extremely specific. Grade strictly but provide constructive feedback.`;

  const userPrompt = `Evaluate this mock interview answer for a ${role} position.
Question Type: ${type}
Question: ${question}
Candidate's Answer: ${answer}

Evaluate and return ONLY a valid JSON object matching the exact structure below (no markdown fences, no extra text):
{
  "technicalScore": 80, // score from 0-100 evaluating depth, correctness, and accuracy
  "communicationScore": 85, // score from 0-100 evaluating clarity, professionalism, structure, and pacing
  "completenessScore": 75, // score from 0-100 evaluating how thoroughly the question was answered
  "overallScore": 80, // weighted average score 0-100
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "idealAnswerHints": "A 2-3 sentence explanation of what an ideal answer would include",
  "keyMissingPoints": ["missing point 1", "missing point 2"]
}`;

  try {
    const text = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.3, max_tokens: 800 });

    return parseJsonResponse(text);
  } catch (error) {
    console.error('[scoringEngine] Error evaluating answer:', error.message);
    throw error;
  }
}

/**
 * AI-powered software engineering code review.
 * @param {string} code - Submitted code solution
 * @param {string} language - Programming language used
 * @param {string} challengeTitle - Name of the DSA challenge
 * @param {string} challengeDesc - Description of the problem
 * @param {boolean} allPassed - True if all test cases passed in code runner
 * @returns {Promise<object>} Code review feedback
 */
async function reviewCode(code, language, challengeTitle, challengeDesc, allPassed) {
  const systemPrompt = `You are a principal software engineer conducting a detailed technical code review. 
Evaluate algorithmic complexity, code quality, readability, edge-case coverage, and best practices.`;

  const userPrompt = `Review this solution written in ${language} for the coding challenge "${challengeTitle}".
Problem Description:
${challengeDesc}

Submitted Code:
\`\`\`${language}
${code}
\`\`\`

Test Cases Execution Result: ${allPassed ? 'PASSED ALL TEST CASES ✅' : 'FAILED TEST CASES ❌'}

Evaluate and return ONLY a valid JSON object matching the exact structure below (no markdown fences, no extra text):
{
  "overallRating": 8, // rating from 1-10
  "timeComplexity": "O(N) with explanation",
  "spaceComplexity": "O(1) with explanation",
  "codeQuality": 85, // score from 0-100
  "strengths": ["strength 1", "strength 2"],
  "issues": ["issue 1", "issue 2"],
  "optimizationTip": "One key tip to optimize time/space or readability",
  "hint": "${allPassed ? 'Suggestion for further micro-optimizations or refactorings' : 'Constructive hint to fix failing test cases without writing the actual code for them'}",
  "interviewReadiness": "Short assessment of whether this code would pass a FAANG whiteboard or technical interview"
}`;

  try {
    const text = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.3, max_tokens: 900 });

    return parseJsonResponse(text);
  } catch (error) {
    console.error('[scoringEngine] Error reviewing code:', error.message);
    throw error;
  }
}

module.exports = {
  evaluateAnswer,
  reviewCode,
};
