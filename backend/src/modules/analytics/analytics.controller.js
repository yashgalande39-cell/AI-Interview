const { getReadinessReport } = require('./readiness.service');
const { query } = require('../../config/pgDb');

/**
 * GET /api/analytics/readiness
 * Returns the full AI Readiness Score report for the authenticated user.
 */
exports.getReadiness = async (req, res) => {
  try {
    const report = await getReadinessReport(req.user.userId);
    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    console.error('Readiness Score Error:', err);
    return res.status(500).json({ message: 'Failed to compute readiness score' });
  }
};

/**
 * GET /api/analytics/stats
 * Returns aggregate session and coding stats for the dashboard.
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [sessionStats, codingStats, recentSessions] = await Promise.all([
      query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'completed') AS sessions_completed,
          ROUND(AVG(score_overall) FILTER (WHERE status = 'completed'), 1) AS avg_score,
          MAX(score_overall) AS best_score,
          COUNT(*) FILTER (WHERE status = 'completed' AND type = 'technical') AS technical_count,
          COUNT(*) FILTER (WHERE status = 'completed' AND type = 'hr') AS hr_count,
          COUNT(*) FILTER (WHERE status = 'completed' AND type = 'behavioral') AS behavioral_count
        FROM interview_sessions
        WHERE user_id = $1
      `, [userId]),

      query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'accepted') AS problems_solved,
          COUNT(*) AS total_submissions,
          ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'accepted') / NULLIF(COUNT(*), 0), 1) AS acceptance_rate
        FROM coding_submissions
        WHERE user_id = $1
      `, [userId]),

      query(`
        SELECT id, company, role, type, score_overall, score_technical, score_communication,
               status, started_at, completed_at
        FROM interview_sessions
        WHERE user_id = $1
        ORDER BY started_at DESC
        LIMIT 5
      `, [userId]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        sessions: sessionStats.rows[0],
        coding: codingStats.rows[0],
        recent_sessions: recentSessions.rows,
      }
    });
  } catch (err) {
    console.error('Analytics Stats Error:', err);
    return res.status(500).json({ message: 'Failed to fetch analytics stats' });
  }
};

/**
 * GET /api/analytics/history
 * Returns score history over time (for charts).
 */
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const days = parseInt(req.query.days) || 30;

    const result = await query(`
      SELECT
        DATE(started_at) AS date,
        ROUND(AVG(score_overall), 1) AS avg_score,
        COUNT(*) AS sessions
      FROM interview_sessions
      WHERE user_id = $1
        AND status = 'completed'
        AND started_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(started_at)
      ORDER BY date ASC
    `, [userId]);

    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error('History Error:', err);
    return res.status(500).json({ message: 'Failed to fetch score history' });
  }
};
