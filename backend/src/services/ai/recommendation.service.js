/**
 * TRESK AI — Recommendation Service
 * =====================================================================
 * Maps candidate interview feedback → skill gap analysis → curated
 * learning paths with real course links, projects, and practice challenges.
 *
 * This service wraps and extends the existing recommendationEngine.js,
 * adding DB persistence to the learning_paths table and providing
 * richer resource curation.
 */

const { callOpenRouter, parseJsonResponse } = require('./openrouter');
const { sanitizePromptInput } = require('../../utils/sanitizePromptInput');
const { generateRecommendations } = require('./recommendationEngine');

// ─── Curated Resource Map ────────────────────────────────────────────────────
// Maps weak topic keywords to pre-vetted high-quality resources.
// AI-generated paths supplement these with dynamic recommendations.

const CURATED_RESOURCES = {
  'system design': [
    { type: 'course', title: 'Grokking the System Design Interview', platform: 'Educative.io', url: 'https://www.educative.io/courses/grokking-system-design-interview' },
    { type: 'book', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann' },
    { type: 'video', title: 'System Design Primer', platform: 'GitHub', url: 'https://github.com/donnemartin/system-design-primer' },
  ],
  'algorithms': [
    { type: 'platform', title: 'NeetCode 150', platform: 'NeetCode', url: 'https://neetcode.io/practice' },
    { type: 'platform', title: 'LeetCode Top Interview 150', platform: 'LeetCode', url: 'https://leetcode.com/studyplan/top-interview-150/' },
    { type: 'book', title: 'Introduction to Algorithms (CLRS)', author: 'Cormen et al.' },
  ],
  'dynamic programming': [
    { type: 'video', title: 'Dynamic Programming — NeetCode Playlist', platform: 'YouTube', url: 'https://www.youtube.com/playlist?list=PLot-Xpze53leU0Ec0VkBhnf4npMRFiNcB' },
    { type: 'platform', title: 'Atcoder DP Contest', platform: 'AtCoder', url: 'https://atcoder.jp/contests/dp' },
  ],
  'behavioral': [
    { type: 'guide', title: 'STAR Method Interview Guide', platform: 'TRESK AI', url: '/guides/star-method' },
    { type: 'book', title: 'Cracking the PM Interview', author: 'Gayle McDowell & Jackie Bavaro' },
  ],
  'sql': [
    { type: 'platform', title: 'SQLZoo', platform: 'SQLZoo', url: 'https://sqlzoo.net/' },
    { type: 'platform', title: 'Mode SQL Tutorial', platform: 'Mode', url: 'https://mode.com/sql-tutorial/' },
  ],
  'machine learning': [
    { type: 'course', title: 'Machine Learning Specialization', platform: 'Coursera (Andrew Ng)', url: 'https://www.coursera.org/specializations/machine-learning-introduction' },
    { type: 'platform', title: 'Fast.ai Practical Deep Learning', platform: 'Fast.ai', url: 'https://course.fast.ai/' },
  ],
  'communication': [
    { type: 'guide', title: 'Technical Communication for Engineers', platform: 'TRESK AI', url: '/guides/technical-communication' },
    { type: 'platform', title: 'Toastmasters International', platform: 'Toastmasters', url: 'https://www.toastmasters.org/' },
  ],
};

/**
 * Find curated resources for a given topic.
 * @param {string} topic - Weak topic identified from evaluation
 * @returns {Array} Matching curated resources
 */
function findCuratedResources(topic) {
  const lowerTopic = topic.toLowerCase();
  const results = [];

  for (const [key, resources] of Object.entries(CURATED_RESOURCES)) {
    if (lowerTopic.includes(key) || key.includes(lowerTopic.split(' ')[0])) {
      results.push(...resources);
    }
  }

  return results.slice(0, 3); // Max 3 curated resources per topic
}

// ─── Core: Skill Gap Analysis ─────────────────────────────────────────────────

/**
 * Extract weak skills from interview session data and map them to gap categories.
 *
 * @param {object} sessionData - Interview session with scorecard and transcript
 * @param {string} role - Target job role
 * @param {string} type - Interview type
 * @returns {object} Categorized skill gaps with severity levels
 */
async function analyzeSkillGaps(sessionData, role, type) {
  const safeRole = sanitizePromptInput(role, 100);
  const safeType = sanitizePromptInput(type, 100);

  const scoreCard = sessionData.scoreCard || sessionData.score_card || {};
  const weakTopics = scoreCard.weakTopics || [];

  // Build context from score card
  const scores = {
    overall:       scoreCard.overallScore        || scoreCard.overall_score        || 0,
    technical:     scoreCard.technicalScore      || scoreCard.technical_score      || 0,
    communication: scoreCard.communicationScore  || scoreCard.communication_score  || 0,
    behavioral:    scoreCard.behavioralScore     || scoreCard.star_score           || 0,
  };

  const systemPrompt = `You are a talent analytics AI specializing in skill gap identification and learning path design.
Analyze interview performance data and extract concrete, actionable skill deficiencies.`;

  const userPrompt = `Analyze skill gaps for a ${safeRole} candidate after a ${safeType} interview.
Performance Scores:
- Overall: ${scores.overall}/100
- Technical: ${scores.technical}/100  
- Communication: ${scores.communication}/100
- Behavioral/STAR: ${scores.behavioral}/100
Identified Weak Topics: ${weakTopics.join(', ') || 'None specified'}

Return ONLY a valid JSON object:
{
  "skillGaps": [
    {
      "topic": "Topic Name",
      "severity": "Critical | High | Medium | Low",
      "currentLevel": "Beginner | Intermediate | Advanced",
      "targetLevel": "Intermediate | Advanced | Expert",
      "estimatedWeeksToClose": 2,
      "jobRelevance": 0.90
    }
  ],
  "priorityOrder": ["Topic 1", "Topic 2"],
  "overallGapSeverity": "Critical | High | Medium | Low",
  "readinessScore": 65,
  "timeToJobReady": "4-6 weeks with focused daily practice"
}`;

  try {
    const text = await callOpenRouter(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      { temperature: 0.3, max_tokens: 1000 }
    );
    return parseJsonResponse(text);
  } catch (err) {
    console.error('[RecommendationService] Skill gap analysis failed:', err.message);
    return {
      skillGaps: weakTopics.map(t => ({ topic: t, severity: 'High', estimatedWeeksToClose: 2, jobRelevance: 0.75 })),
      overallGapSeverity: 'High',
      readinessScore: scores.overall,
      timeToJobReady: '3-4 weeks',
    };
  }
}

// ─── Core: Personalized Learning Path ────────────────────────────────────────

/**
 * Generate a complete personalized learning path with curated + AI-generated resources.
 *
 * @param {object} params
 * @param {string} params.userId - User ID (for DB persistence)
 * @param {string} params.role - Target job role
 * @param {string} params.type - Interview type
 * @param {object} params.scoreCard - Session scorecard
 * @param {object} [params.gapAnalysis] - Output from analyzeSkillGaps()
 * @param {object} [params.db] - Postgres pool for persistence (optional)
 * @returns {Promise<object>} Complete learning path with curated resources
 */
async function generateLearningPath({ userId, role, type, scoreCard, gapAnalysis, db }) {
  const weakTopics = gapAnalysis?.skillGaps?.map(g => g.topic) ||
                     scoreCard?.weakTopics ||
                     [];

  // Get base recommendations from existing engine
  const baseRecs = await generateRecommendations(scoreCard, role, type);

  // Enrich each study plan item with curated resources
  const enrichedStudyPlan = (baseRecs.studyPlan || []).map((week, idx) => {
    const relevantTopic = weakTopics[idx] || week.focus || '';
    const curated = findCuratedResources(relevantTopic);

    return {
      ...week,
      curatedResources: curated,
      practiceChallenge: `Complete 5 ${relevantTopic || type} practice questions on TRESK AI`,
      dailyGoal: '45 minutes focused study + 1 mock interview question',
    };
  });

  // Generate mock exercises targeting weak areas
  const mockExercises = weakTopics.slice(0, 3).map(topic => ({
    type: topic.toLowerCase().includes('code') || topic.toLowerCase().includes('algo') ? 'coding' : 'mock_interview',
    topic,
    difficulty: scoreCard?.overallScore > 70 ? 'Hard' : 'Medium',
    platform: 'TRESK AI',
    estimatedMinutes: 30,
  }));

  const learningPath = {
    userId,
    role,
    type,
    weakTopics,
    urgencyLevel: gapAnalysis?.overallGapSeverity || 'Medium',
    estimatedTimeToReadiness: baseRecs.nextInterviewReady || '3-4 weeks',
    weeklyPlan: enrichedStudyPlan,
    recommendedProjects: baseRecs.recommendedProjects || [],
    recommendedCertifications: baseRecs.recommendedCertifications || [],
    mockExercises,
    gapAnalysis: gapAnalysis || null,
    generatedAt: new Date().toISOString(),
  };

  // Persist to DB if pool provided
  if (db && userId) {
    try {
      for (const gap of (gapAnalysis?.skillGaps || [])) {
        await db.query(
          `INSERT INTO learning_paths 
           (user_id, weakness_topic, target_role, recommendations, study_plan)
           VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)
           ON CONFLICT DO NOTHING`,
          [
            userId,
            gap.topic,
            role,
            JSON.stringify([...findCuratedResources(gap.topic)]),
            JSON.stringify(enrichedStudyPlan),
          ]
        );
      }
      console.log(`[RecommendationService] Persisted ${(gapAnalysis?.skillGaps || []).length} learning paths for user ${userId}`);
    } catch (dbErr) {
      console.error('[RecommendationService] DB persistence failed:', dbErr.message);
    }
  }

  return learningPath;
}

// ─── Core: Course & Resource Curation ────────────────────────────────────────

/**
 * Get topic-specific curated resources for a given weak area.
 * Combines pre-vetted static map with AI-generated dynamic suggestions.
 *
 * @param {string} topic - Weak topic
 * @param {string} role - Target role context
 * @returns {Promise<object>} Curated resources for the topic
 */
async function getTopicResources(topic, role) {
  const safeTopic = sanitizePromptInput(topic, 100);
  const safeRole  = sanitizePromptInput(role, 100);

  const curated = findCuratedResources(safeTopic);

  const systemPrompt = `You are a technical education curator. Recommend only real, high-quality resources that actually exist.`;
  const userPrompt = `Recommend the 3 best resources to improve in "${safeTopic}" for a ${safeRole} role.
Return ONLY a valid JSON array:
[
  { "type": "course|book|video|platform|guide", "title": "...", "platform": "...", "url": "https://...", "why": "One sentence explaining why this is the best resource for this gap." }
]`;

  let aiResources = [];
  try {
    const text = await callOpenRouter(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      { temperature: 0.4, max_tokens: 600 }
    );
    aiResources = parseJsonResponse(text);
  } catch {
    console.warn(`[RecommendationService] AI resource generation failed for topic: ${topic}`);
  }

  return {
    topic: safeTopic,
    curated,
    aiGenerated: Array.isArray(aiResources) ? aiResources : [],
  };
}

module.exports = {
  analyzeSkillGaps,
  generateLearningPath,
  getTopicResources,
  findCuratedResources,
  CURATED_RESOURCES,
};
