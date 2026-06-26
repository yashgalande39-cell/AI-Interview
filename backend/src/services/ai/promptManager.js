/**
 * TRESK AI — Prompt Manager
 * =====================================================================
 * Database-driven prompt versioning system.
 *
 * Instead of hardcoded system prompts scattered across files, all prompts
 * are stored in the `ai_prompts` table with version control and A/B routing.
 *
 * Usage:
 *   const { getPrompt, createPrompt, activateVersion } = require('./promptManager');
 *   const prompt = await getPrompt('interview_system_prompt');
 */

const { query } = require('../../config/pgDb');

// In-memory prompt cache to avoid repeated DB round-trips
const promptCache = new Map(); // key: `${name}:${version}` → prompt_text
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get the currently active prompt for a given name.
 * Falls back to the provided defaultText if not found in DB (offline/first-run).
 */
async function getPrompt(name, defaultText = null) {
  const cacheKey = `active:${name}`;
  const cached = promptCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.text;
  }

  try {
    const result = await query(
      `SELECT prompt_text FROM ai_prompts WHERE name = $1 AND is_active = TRUE ORDER BY version DESC LIMIT 1`,
      [name]
    );
    if (result.rows.length > 0) {
      const text = result.rows[0].prompt_text;
      promptCache.set(cacheKey, { text, expiresAt: Date.now() + CACHE_TTL_MS });
      return text;
    }
  } catch (_) {
    // DB unavailable — use default silently
  }

  return defaultText;
}

/**
 * Get a specific version of a prompt.
 */
async function getPromptVersion(name, version) {
  const cacheKey = `${name}:${version}`;
  const cached = promptCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.text;

  try {
    const result = await query(
      `SELECT prompt_text FROM ai_prompts WHERE name = $1 AND version = $2`,
      [name, version]
    );
    if (result.rows.length > 0) {
      const text = result.rows[0].prompt_text;
      promptCache.set(cacheKey, { text, expiresAt: Date.now() + CACHE_TTL_MS });
      return text;
    }
  } catch (_) {}

  return null;
}

/**
 * Create or update a prompt version.
 * Does NOT automatically activate the new version — call activateVersion() separately.
 */
async function createPrompt(name, promptText, description = '') {
  const existing = await query(
    `SELECT MAX(version) AS max_version FROM ai_prompts WHERE name = $1`,
    [name]
  );
  const nextVersion = (existing.rows[0]?.max_version || 0) + 1;

  await query(
    `INSERT INTO ai_prompts (name, version, prompt_text, description, is_active)
     VALUES ($1, $2, $3, $4, FALSE)
     ON CONFLICT (name, version) DO UPDATE SET prompt_text = EXCLUDED.prompt_text`,
    [name, nextVersion, promptText, description]
  );

  return { name, version: nextVersion };
}

/**
 * Activate a specific version of a prompt.
 * Deactivates all other versions of the same prompt name.
 */
async function activateVersion(name, version) {
  await query(`UPDATE ai_prompts SET is_active = FALSE WHERE name = $1`, [name]);
  await query(`UPDATE ai_prompts SET is_active = TRUE WHERE name = $1 AND version = $2`, [name, version]);

  // Invalidate cache
  promptCache.delete(`active:${name}`);
  promptCache.delete(`${name}:${version}`);

  return { name, version, activated: true };
}

/**
 * List all prompt names and their active versions.
 */
async function listPrompts() {
  try {
    const result = await query(
      `SELECT name, version, is_active, description, created_at FROM ai_prompts ORDER BY name, version DESC`
    );
    return result.rows;
  } catch (_) {
    return [];
  }
}

/**
 * A/B routing: route user to version A or B based on user ID hash.
 * Useful for controlled prompt experiments.
 *
 * @param {string} userId - user UUID
 * @param {string} promptNameA - e.g. 'interview_system_prompt'
 * @param {string} promptNameB - e.g. 'interview_system_prompt_v2'
 * @param {number} bPercentage - % of users to receive prompt B (0-100)
 */
async function abRoute(userId, promptNameA, promptNameB, bPercentage = 50) {
  // Deterministic hash of userId → consistent group assignment per user
  const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const bucket = hash % 100;
  const targetName = bucket < bPercentage ? promptNameB : promptNameA;
  return getPrompt(targetName);
}

/**
 * Invalidate the prompt cache (call after admin updates).
 */
function invalidateCache(name = null) {
  if (name) {
    promptCache.delete(`active:${name}`);
  } else {
    promptCache.clear();
  }
}

module.exports = { getPrompt, getPromptVersion, createPrompt, activateVersion, listPrompts, abRoute, invalidateCache };
