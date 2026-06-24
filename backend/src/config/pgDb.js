/**
 * TRESK AI — PostgreSQL Connection Pool
 * =====================================================================
 * Manages a persistent connection pool to the PostgreSQL database.
 * Exposes query helpers, transaction support, and startup auto-migration.
 *
 * Env variables (add to .env):
 *   DATABASE_URL      — Full postgres connection string (preferred)
 *   PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD  — Individual vars
 *   PG_SSL            — 'true' for cloud DBs (Supabase, Neon, Railway)
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const localDb = require('./localDb');

// ─── Connection Pool ──────────────────────────────────────────────────────────
let pool = null;
let isOffline = false;

const createPool = () => {
  const config = {};

  if (process.env.DATABASE_URL) {
    config.connectionString = process.env.DATABASE_URL;
    if (process.env.PG_SSL === 'true') {
      config.ssl = { rejectUnauthorized: false };
    }
  } else {
    config.host     = process.env.PG_HOST     || 'localhost';
    config.port     = parseInt(process.env.PG_PORT || '5432', 10);
    config.database = process.env.PG_DATABASE || 'tresk_ai';
    config.user     = process.env.PG_USER     || 'postgres';
    config.password = process.env.PG_PASSWORD || '';
    if (process.env.PG_SSL === 'true') {
      config.ssl = { rejectUnauthorized: false };
    }
  }

  config.max                = 20;    // max pool connections
  config.idleTimeoutMillis  = 30000; // 30s idle timeout
  config.connectionTimeoutMillis = 5000; // 5s connection attempt timeout

  return new Pool(config);
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialise the pool and run schema migrations.
 * Called once at server startup from index.js.
 * Retries up to 5 times with exponential backoff (handles Docker startup race).
 */
const connectPG = async () => {
  if (pool) return pool;
  pool = createPool();

  const MAX_ATTEMPTS = 5;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const client = await pool.connect();
      console.log('🐘 PostgreSQL connected successfully.');
      client.release();
      isOffline = false;
      break; // Connected — exit retry loop
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) {
        console.error(`❌ PostgreSQL connection failed after ${MAX_ATTEMPTS} attempts.`);
        isOffline = true;
        throw err; // Let index.js handle offline mode
      }
      const delay = Math.min(1000 * 2 ** (attempt - 1), 16000); // 1s, 2s, 4s, 8s, 16s
      console.warn(`⚠️  PostgreSQL not ready (attempt ${attempt}/${MAX_ATTEMPTS}). Retrying in ${delay / 1000}s…`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Run auto-migration (idempotent CREATE TABLE IF NOT EXISTS)
  if (!isOffline) {
    await runMigrations(pool);
  }

  return pool;
};

/**
 * Run the schema.sql file as a one-shot migration.
 * Uses IF NOT EXISTS so it is safe to call on every startup.
 */
const runMigrations = async (pgPool) => {
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.warn('⚠️  schema.sql not found, skipping migrations.');
    return;
  }
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  await pgPool.query(sql);
  console.log('✅ Database schema migrated / verified.');
};

/**
 * Execute a parameterised query.
 * @param {string} text  - SQL text with $1, $2 … placeholders
 * @param {any[]}  params - Positional parameter values
 */
const query = async (text, params) => {
  if (isOffline) {
    return localDb.query(text, params);
  }
  try {
    if (!pool) pool = createPool();
    return await pool.query(text, params);
  } catch (err) {
    console.warn('⚠️ PostgreSQL query failed. Routing to local JSON database fallback.', err.message);
    isOffline = true;
    return localDb.query(text, params);
  }
};

/**
 * Run multiple queries inside a single transaction.
 * @param {(client: import('pg').PoolClient) => Promise<any>} callback
 */
const withTransaction = async (callback) => {
  if (isOffline) {
    return localDb.withTransaction(callback);
  }
  try {
    if (!pool) pool = createPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('⚠️ PostgreSQL transaction failed. Routing to local JSON database fallback.', err.message);
    isOffline = true;
    return localDb.withTransaction(callback);
  }
};

/**
 * Get the raw pool (for advanced use).
 */
const getPool = () => pool;

module.exports = { connectPG, query, withTransaction, getPool };
