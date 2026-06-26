/**
 * TRESK AI — AI Analysis Routes (PostgreSQL)
 * =====================================================================
 * Replaces the legacy aiRoutes.js with database integration for plan validation.
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const { callOpenRouter, MODELS } = require('../../services/ai/openrouter');
const { generateInterviewQuestions } = require('../../services/ai/interviewAgent');
const { analyzeResume, analyzeJobDescription } = require('../../services/ai/resumeAnalyzer');
const { evaluateAnswer, reviewCode } = require('../../services/ai/scoringEngine');
const { generatePerformanceFeedback } = require('../../services/ai/feedbackEngine');
const { query } = require('../../config/pgDb');
const { requirePlan } = require('../../middleware/planMiddleware');

router.use(authMiddleware);

/**
 * POST /api/ai/evaluate-answer
 */
router.post('/evaluate-answer', async (req, res) => {
  try {
    const { question, answer, type, role } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }
    const evaluation = await evaluateAnswer(
      question, answer, type || 'Technical', role || 'Software Engineer'
    );
    return res.status(200).json({ evaluation });
  } catch (err) {
    console.error('AI evaluate-answer error:', err.message);
    return res.status(500).json({ message: 'AI evaluation failed', error: err.message });
  }
});

/**
 * POST /api/ai/review-code
 */
router.post('/review-code', requirePlan('pro'), async (req, res) => {
  try {
    const { code, language, challengeTitle, challengeDesc, allPassed } = req.body;
    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }
    const review = await reviewCode(
      code, language,
      challengeTitle || 'Coding Challenge',
      challengeDesc || 'Solve the given problem',
      allPassed ?? false
    );
    return res.status(200).json({ review });
  } catch (err) {
    console.error('AI review-code error:', err.message);
    return res.status(500).json({ message: 'AI code review failed', error: err.message });
  }
});

/**
 * POST /api/ai/generate-questions
 * HR type: free | Technical/Behavioral/Coding type: pro
 */
router.post('/generate-questions', async (req, res) => {
  try {
    const { type, difficulty, role, company, language, resumeText } = req.body;
    if (!type || !role) {
      return res.status(400).json({ message: 'Type and role are required' });
    }

    // HR questions are free; all other types require Pro
    // Use planMiddleware inline to support per-type gating cleanly
    if (type.toUpperCase() !== 'HR') {
      const uResult = await query(
        'SELECT plan, plan_expires_at FROM users WHERE id = $1',
        [req.user.userId]
      );
      const dbUser = uResult.rows[0];
      let userPlan = dbUser?.plan || 'free';

      // Enforce expiry
      if (userPlan !== 'free' && dbUser?.plan_expires_at) {
        if (new Date(dbUser.plan_expires_at) < new Date()) {
          await query("UPDATE users SET plan = 'free' WHERE id = $1", [req.user.userId]).catch(() => {});
          userPlan = 'free';
        }
      }

      if ((PLAN_LEVEL[userPlan] ?? 0) < PLAN_LEVEL['pro']) {
        return res.status(403).json({
          message: 'Upgrade to Pro to generate Technical, Behavioral, or Coding questions.',
          requiredPlan: 'pro',
          userPlan,
          upgradeUrl: '/pricing',
        });
      }
    }

    const questions = await generateInterviewQuestions(
      type, difficulty || 'Medium', role, company || 'Common', language || 'General', resumeText || ''
    );
    return res.status(200).json({ questions });
  } catch (err) {
    console.error('AI generate-questions error:', err.message);
    return res.status(500).json({ message: 'Question generation failed', error: err.message });
  }
});


/**
 * POST /api/ai/analyze-jd
 */
router.post('/analyze-jd', requirePlan('pro'), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ message: 'Job description text is required' });
    }
    const analysis = await analyzeJobDescription(jobDescription);
    return res.status(200).json({ analysis });
  } catch (err) {
    console.error('AI analyze-jd error:', err.message);
    return res.status(500).json({ message: 'JD analysis failed', error: err.message });
  }
});

/**
 * POST /api/ai/analyze-resume
 */
router.post('/analyze-resume', requirePlan('pro'), async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) {
      return res.status(400).json({ message: 'Resume text is required' });
    }
    const analysis = await analyzeResume(
      resumeText,
      targetRole || 'Software Engineer'
    );
    return res.status(200).json({ analysis });
  } catch (err) {
    console.error('AI analyze-resume error:', err.message);
    return res.status(500).json({ message: 'Resume analysis failed', error: err.message });
  }
});

/**
 * POST /api/ai/performance-feedback
 */
router.post('/performance-feedback', async (req, res) => {
  try {
    const { scoreCard, role, type } = req.body;
    if (!scoreCard) {
      return res.status(400).json({ message: 'ScoreCard data is required' });
    }
    const feedback = await generatePerformanceFeedback(
      scoreCard, role || 'Software Engineer', type || 'Technical'
    );
    return res.status(200).json({ feedback });
  } catch (err) {
    console.error('AI performance-feedback error:', err.message);
    return res.status(500).json({ message: 'Performance feedback generation failed', error: err.message });
  }
});

/**
 * GET /api/ai/status
 */
router.get('/status', async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ status: 'unavailable', reason: 'No API key configured' });
    }
    const testText = await callOpenRouter([
      { role: 'user', content: 'Say "OK" in one word.' }
    ], MODELS.fast, { max_tokens: 10 });
    return res.status(200).json({
      status: 'online',
      model: MODELS.primary,
      testResponse: testText,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(200).json({ status: 'error', error: err.message });
  }
});

module.exports = router;
