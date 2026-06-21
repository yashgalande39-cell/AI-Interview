const { callOpenRouter, parseJsonResponse } = require('./openrouter');
const { generateRecommendations } = require('./recommendationEngine');

/**
 * Generate deep personalized performance feedback.
 * @param {object} scoreCard - Candidate scores from current session
 * @param {string} role - Target role
 * @param {string} type - Interview type
 * @returns {Promise<object>} Combined feedback and study recommendations
 */
async function generatePerformanceFeedback(scoreCard, role, type) {
  const systemPrompt = `You are an elite talent acquisition partner and executive career coach. 
Analyze the scorecard metrics and write clear, realistic, and highly actionable feedback in a professional recruiter tone.`;

  const userPrompt = `Generate a performance scorecard review for a candidate who just completed a ${type} mock interview for the role of ${role}.
Scores:
- Overall Average: ${scoreCard.overallScore}/100
- Technical Accuracy: ${scoreCard.technicalScore}/100
- Communication/Fluency: ${scoreCard.communicationScore}/100
- Eye Contact Quality: ${scoreCard.eyeContactScore}/100
- Speaking Speed: ${scoreCard.averageWpm} WPM
- Stress Telemetry Score: ${scoreCard.stressScore}/100
- Total Filler Words Used: ${scoreCard.totalFillers}
- Weak Areas: ${scoreCard.weakTopics?.join(', ') || 'None identified'}

Provide structured feedback including a definitive verdict and hiring likelihood.
Return ONLY a valid JSON object matching the exact structure below (no markdown fences, no extra text):
{
  "overallVerdict": "Pass | Borderline | Needs Improvement",
  "hiringLikelihood": 85, // percentage probability from 0-100
  "personalizedFeedback": "A concise 3-4 sentence paragraph providing realistic coaching feedback on their performance.",
  "top3Strengths": ["strength 1", "strength 2", "strength 3"],
  "top3Improvements": ["improvement 1", "improvement 2", "improvement 3"]
}`;

  try {
    // 1. Get feedback and verdict
    const feedbackText = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.5, max_tokens: 1000 });

    const feedbackObj = parseJsonResponse(feedbackText);

    // 2. Fetch study path and certifications from recommendation engine
    const recsObj = await generateRecommendations(scoreCard, role, type);

    // 3. Merge and return the complete AI performance evaluation package
    return {
      overallVerdict: feedbackObj.overallVerdict || 'Borderline',
      hiringLikelihood: feedbackObj.hiringLikelihood ?? 50,
      personalizedFeedback: feedbackObj.personalizedFeedback || 'Please continue practicing and refining your answers.',
      top3Strengths: feedbackObj.top3Strengths || [],
      top3Improvements: feedbackObj.top3Improvements || [],
      studyPlan: recsObj.studyPlan || [],
      nextInterviewReady: recsObj.nextInterviewReady || '2 weeks of prep',
      recommendedProjects: recsObj.recommendedProjects || [],
      recommendedCertifications: recsObj.recommendedCertifications || []
    };

  } catch (error) {
    console.error('[feedbackEngine] Error compiling performance feedback:', error.message);
    throw error;
  }
}

module.exports = {
  generatePerformanceFeedback,
};
