/**
 * TRESK AI — AI Readiness Score Engine
 * =====================================================================
 * Computes a candidate's holistic hiring readiness score (0–100)
 * by aggregating real data across four dimensions:
 *
 *   1. Coding       (35%) — based on accepted coding submissions
 *   2. Interview    (30%) — average scorecard from completed sessions
 *   3. Resume       (20%) — latest ATS score from uploaded resumes
 *   4. Communication(15%) — average communication score from sessions
 *
 * Scores are cached in the `readiness_scores` table and recomputed
 * on demand (each API call) for real-time accuracy.
 */

const { query } = require('../../config/pgDb');

// ── Weight Configuration ──────────────────────────────────────────────────────
const WEIGHTS = {
  coding:        0.35,
  interview:     0.30,
  resume:        0.20,
  communication: 0.15,
};

/**
 * Compute raw component scores for a user.
 * @param {string} userId
 * @returns {{ coding, interview, resume, communication, sessions_count, problems_solved }}
 */
const computeComponents = async (userId) => {
  // ── Coding Score ─────────────────────────────────────────────────────────
  // Acceptance rate across all submissions
  const codingResult = await query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'accepted') AS accepted,
      COUNT(*) AS total,
      AVG(CASE WHEN status = 'accepted' THEN
        ROUND(100.0 * test_cases_passed / NULLIF(test_cases_total, 0))
      END) AS avg_pass_rate
    FROM coding_submissions
    WHERE user_id = $1
  `, [userId]);

  const cr = codingResult.rows[0];
  const codingRatio   = cr.total > 0 ? parseFloat(cr.accepted) / parseFloat(cr.total) : 0;
  const avgPassRate   = parseFloat(cr.avg_pass_rate) || 0;
  const codingScore   = Math.round((codingRatio * 60) + (avgPassRate * 0.40));
  const problemsSolved = parseInt(cr.accepted) || 0;

  // ── Interview Score ───────────────────────────────────────────────────────
  // Average overall + technical score across completed sessions
  const interviewResult = await query(`
    SELECT
      COUNT(*) AS session_count,
      AVG(score_overall) AS avg_overall,
      AVG(score_technical) AS avg_technical,
      AVG(score_problem_solving) AS avg_problem_solving
    FROM interview_sessions
    WHERE user_id = $1 AND status = 'completed'
  `, [userId]);

  const ir = interviewResult.rows[0];
  const sessionCount   = parseInt(ir.session_count) || 0;
  const avgOverall     = parseFloat(ir.avg_overall) || 0;
  const avgTechnical   = parseFloat(ir.avg_technical) || 0;
  const avgProblemSolving = parseFloat(ir.avg_problem_solving) || 0;
  const interviewScore = sessionCount > 0
    ? Math.round((avgOverall * 0.5) + (avgTechnical * 0.3) + (avgProblemSolving * 0.2))
    : 0;

  // ── Communication Score ───────────────────────────────────────────────────
  const commResult = await query(`
    SELECT AVG(score_communication) AS avg_comm, AVG(score_confidence) AS avg_conf
    FROM interview_sessions
    WHERE user_id = $1 AND status = 'completed'
  `, [userId]);

  const comm = commResult.rows[0];
  const communicationScore = sessionCount > 0
    ? Math.round(((parseFloat(comm.avg_comm) || 0) * 0.6) + ((parseFloat(comm.avg_conf) || 0) * 0.4))
    : 0;

  // ── Resume Score ──────────────────────────────────────────────────────────
  // Latest ATS score
  const resumeResult = await query(`
    SELECT ats_score
    FROM resumes
    WHERE user_id = $1 AND ats_score IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1
  `, [userId]);

  const resumeScore = resumeResult.rows[0]?.ats_score || 0;

  return {
    coding: Math.min(100, codingScore),
    interview: Math.min(100, interviewScore),
    resume: Math.min(100, resumeScore),
    communication: Math.min(100, communicationScore),
    sessions_count: sessionCount,
    problems_solved: problemsSolved,
  };
};

/**
 * Calculate final weighted readiness score.
 * @param {{ coding, interview, resume, communication }} components
 * @returns {number} 0–100
 */
const calculateFinalScore = (components) => {
  return Math.round(
    (components.coding        * WEIGHTS.coding)       +
    (components.interview     * WEIGHTS.interview)    +
    (components.resume        * WEIGHTS.resume)       +
    (components.communication * WEIGHTS.communication)
  );
};

/**
 * Compute company-specific placement probability benchmarks.
 * These are sigmoid-shaped calculations based on known score thresholds.
 * @param {number} overallScore
 * @param {{ coding, interview }} components
 */
const computePlacementProbabilities = (overallScore, { coding, interview }) => {
  const sigmoid = (score, threshold, steepness = 0.1) =>
    Math.round(100 / (1 + Math.exp(-steepness * (score - threshold))));

  return [
    { company: 'Google',    logo: '🔵', threshold: 85, probability: sigmoid(overallScore, 85) },
    { company: 'Microsoft', logo: '🟦', threshold: 78, probability: sigmoid(overallScore, 78) },
    { company: 'Amazon',    logo: '🟠', threshold: 75, probability: sigmoid(overallScore, 75) },
    { company: 'Flipkart',  logo: '🟡', threshold: 68, probability: sigmoid(overallScore, 68) },
    { company: 'Swiggy',    logo: '🟠', threshold: 62, probability: sigmoid(overallScore, 62) },
    { company: 'TCS',       logo: '🔷', threshold: 45, probability: sigmoid(overallScore, 45) },
    { company: 'Infosys',   logo: '🔹', threshold: 42, probability: sigmoid(overallScore, 42) },
  ];
};

/**
 * Generate tier label and improvement tips.
 * @param {number} score
 */
const getReadinessTier = (score) => {
  if (score >= 85) return { tier: 'Placement Ready',    color: '#10b981', emoji: '🚀', tips: ['You are in the top tier! Focus on system design and negotiation skills.'] };
  if (score >= 70) return { tier: 'Strong Candidate',   color: '#3b82f6', emoji: '💪', tips: ['Boost your DSA acceptance rate and add 1–2 strong resume projects.'] };
  if (score >= 55) return { tier: 'Active Learner',     color: '#f59e0b', emoji: '📚', tips: ['Complete 3+ interview sessions and solve 10 more DSA problems to level up.'] };
  if (score >= 35) return { tier: 'Building Foundation',color: '#ef4444', emoji: '🏗️', tips: ['Upload a resume for ATS analysis, and start your first mock interview.'] };
  return { tier: 'Just Starting',          color: '#6b7280', emoji: '🌱', tips: ['Begin with the Career Roadmap, complete your profile, and try one mock interview.'] };
};

// ── Main Service Function ─────────────────────────────────────────────────────

/**
 * Full readiness report for a user.
 * @param {string} userId
 */
exports.getReadinessReport = async (userId) => {
  const components = await computeComponents(userId);
  const overall = calculateFinalScore(components);
  const placements = computePlacementProbabilities(overall, components);
  const tier = getReadinessTier(overall);

  // Upsert into cache table
  await query(`
    INSERT INTO readiness_scores (user_id, score_overall, score_coding, score_interview, score_resume, score_communication, sessions_count, problems_solved, last_computed)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      score_overall       = EXCLUDED.score_overall,
      score_coding        = EXCLUDED.score_coding,
      score_interview     = EXCLUDED.score_interview,
      score_resume        = EXCLUDED.score_resume,
      score_communication = EXCLUDED.score_communication,
      sessions_count      = EXCLUDED.sessions_count,
      problems_solved     = EXCLUDED.problems_solved,
      last_computed       = NOW()
  `, [userId, overall, components.coding, components.interview, components.resume, components.communication, components.sessions_count, components.problems_solved]);

  return {
    score: overall,
    tier,
    components: {
      coding:        { score: components.coding,        weight: WEIGHTS.coding,        label: 'Coding & DSA' },
      interview:     { score: components.interview,     weight: WEIGHTS.interview,     label: 'Interview Performance' },
      resume:        { score: components.resume,        weight: WEIGHTS.resume,        label: 'Resume Strength' },
      communication: { score: components.communication, weight: WEIGHTS.communication, label: 'Communication' },
    },
    stats: {
      sessions_completed: components.sessions_count,
      problems_solved:    components.problems_solved,
    },
    placements,
    weights: WEIGHTS,
  };
};
