/**
 * TRESK AI — AI Cost Tracker
 * =====================================================================
 * Tracks per-operation token consumption and dollar cost.
 * Persists to the `ai_cost_logs` table for admin analytics and billing.
 *
 * Usage:
 *   const costTracker = require('./costTracker');
 *   await costTracker.log({ userId, sessionId, operation, model, promptTokens, completionTokens });
 *   const summary = await costTracker.getUserSummary(userId);
 */

const { query } = require('../../config/pgDb');

// ─── Per-model cost rates (USD per 1M tokens) ─────────────────────────────────
const RATES = {
  'google/gemini-flash-1.5':            { input: 0.075, output: 0.30 },
  'google/gemini-pro-1.5':             { input: 3.50,  output: 10.50 },
  'meta-llama/llama-3.1-8b-instruct':  { input: 0.06,  output: 0.06 },
  'meta-llama/llama-3.1-70b-instruct': { input: 0.35,  output: 0.40 },
  'anthropic/claude-3-haiku':          { input: 0.25,  output: 1.25 },
  'anthropic/claude-3-sonnet':         { input: 3.00,  output: 15.00 },
  'openai/gpt-4o-mini':                { input: 0.15,  output: 0.60 },
  'openai/gpt-4o':                     { input: 2.50,  output: 10.00 },
  default:                              { input: 0.10,  output: 0.30 },
};

/**
 * Calculate USD cost for a given token usage.
 */
function calculateCost(model, promptTokens, completionTokens) {
  const rate = RATES[model] || RATES.default;
  return parseFloat(
    ((promptTokens / 1_000_000) * rate.input + (completionTokens / 1_000_000) * rate.output).toFixed(8)
  );
}

/**
 * Log an AI operation's cost to the database.
 * Silently no-ops if DB is offline.
 */
async function log({ userId, sessionId = null, operation, model = 'unknown', promptTokens = 0, completionTokens = 0 }) {
  const totalTokens = promptTokens + completionTokens;
  const costUsd = calculateCost(model, promptTokens, completionTokens);

  try {
    await query(
      `INSERT INTO ai_cost_logs (user_id, session_id, operation, model, prompt_tokens, completion_tokens, total_tokens, cost_usd)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId || null, sessionId || null, operation, model, promptTokens, completionTokens, totalTokens, costUsd]
    );
  } catch (err) {
    // Non-critical — don't crash the request if cost logging fails
    console.warn('[CostTracker] Failed to log cost:', err.message);
  }

  return { totalTokens, costUsd };
}

/**
 * Get total cost and token usage for a user.
 */
async function getUserSummary(userId) {
  try {
    const result = await query(
      `SELECT
         COUNT(*) AS total_operations,
         SUM(total_tokens) AS total_tokens,
         SUM(cost_usd) AS total_cost_usd,
         SUM(CASE WHEN operation = 'evaluate_answer' THEN cost_usd ELSE 0 END) AS interview_cost_usd,
         SUM(CASE WHEN operation = 'resume_analysis' THEN cost_usd ELSE 0 END) AS resume_cost_usd
       FROM ai_cost_logs WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || { total_operations: 0, total_tokens: 0, total_cost_usd: 0 };
  } catch (_) {
    return null;
  }
}

/**
 * Get platform-wide cost summary (admin).
 */
async function getPlatformSummary({ days = 7 } = {}) {
  try {
    const result = await query(
      `SELECT
         DATE(created_at) AS date,
         COUNT(DISTINCT user_id) AS active_users,
         COUNT(*) AS total_operations,
         SUM(total_tokens) AS total_tokens,
         ROUND(SUM(cost_usd)::numeric, 4) AS total_cost_usd,
         ROUND(AVG(cost_usd)::numeric, 6) AS avg_cost_per_op
       FROM ai_cost_logs
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );
    return result.rows;
  } catch (_) {
    return [];
  }
}

/**
 * Get cost breakdown by operation type (admin).
 */
async function getCostByOperation({ days = 30 } = {}) {
  try {
    const result = await query(
      `SELECT
         operation,
         COUNT(*) AS count,
         SUM(total_tokens) AS total_tokens,
         ROUND(SUM(cost_usd)::numeric, 4) AS total_cost_usd
       FROM ai_cost_logs
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY operation
       ORDER BY total_cost_usd DESC`
    );
    return result.rows;
  } catch (_) {
    return [];
  }
}

module.exports = { log, calculateCost, getUserSummary, getPlatformSummary, getCostByOperation };
