const { callOpenRouter, parseJsonResponse } = require('./openrouter');

/**
 * Generate a personalized study plan, projects, and certifications recommendation.
 * @param {object} scoreCard - Current session scorecard metrics
 * @param {string} role - Target job role
 * @param {string} type - Interview type
 * @returns {Promise<object>} Recommendations details including week-by-week study plan
 */
async function generateRecommendations(scoreCard, role, type) {
  const systemPrompt = `You are a premium career development advisor and technical mentor. 
Your goal is to build highly structured, concrete, and customized learning roadmaps for candidates.`;

  const userPrompt = `Generate a customized study plan and recommendations for a candidate who just completed a ${type} mock interview for the role of ${role}.
Scores:
- Overall: ${scoreCard.overallScore}/100
- Technical: ${scoreCard.technicalScore}/100
- Communication: ${scoreCard.communicationScore}/100
- Eye Contact: ${scoreCard.eyeContactScore}/100
- Filler Words: ${scoreCard.totalFillers}
- Weak Topics identified: ${scoreCard.weakTopics?.join(', ') || 'General improvements'}

Provide a structured learning path with action items.
Return ONLY a valid JSON object matching the exact structure below (no markdown fences, no extra text):
{
  "studyPlan": [
    {
      "week": 1,
      "focus": "Topic or area to focus on in Week 1",
      "resources": "Specific resources, books, documentation, or links to study"
    },
    {
      "week": 2,
      "focus": "Topic or area to focus on in Week 2",
      "resources": "Specific resources, books, documentation, or links to study"
    },
    {
      "week": 3,
      "focus": "Topic or area to focus on in Week 3",
      "resources": "Specific resources, books, documentation, or links to study"
    }
  ],
  "recommendedProjects": [
    {
      "title": "Project Name",
      "desc": "A specific project description designed to fill their skills gap",
      "techStack": ["React", "TypeScript", "Node.js"]
    }
  ],
  "recommendedCertifications": [
    "AWS Certified Solutions Architect",
    "Certified Kubernetes Administrator"
  ],
  "nextInterviewReady": "Estimated time until ready for real interviews (e.g. '2 weeks of focused practice')"
}`;

  try {
    const text = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.5, max_tokens: 800 });

    return parseJsonResponse(text);
  } catch (error) {
    console.error('[recommendationEngine] Error generating recommendations:', error.message);
    // Return standard fallback on error to ensure system stability
    return {
      studyPlan: [
        { week: 1, focus: `Fundamentals of ${type}`, resources: 'Official documentation and online tutorials' },
        { week: 2, focus: `Advanced optimization in ${role}`, resources: 'Case studies and engineering blogs' },
        { week: 3, focus: `Mock interview simulations`, resources: 'Practice speaking clearly and pacing answers' }
      ],
      recommendedProjects: [
        { title: `Full-Stack ${role} Application`, desc: 'Build an end-to-end service with CRUD operations and authentication.', techStack: ['JavaScript', 'Node.js'] }
      ],
      recommendedCertifications: [],
      nextInterviewReady: '2-3 weeks of structured preparation'
    };
  }
}

module.exports = {
  generateRecommendations,
};
