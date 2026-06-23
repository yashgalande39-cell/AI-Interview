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

// ─── Connection Pool ──────────────────────────────────────────────────────────
let pool = null;

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
 */
const connectPG = async () => {
  if (pool) return pool;
  pool = createPool();

  // Test connectivity
  const client = await pool.connect();
  console.log('🐘 PostgreSQL connected successfully.');
  client.release();

  // Run auto-migration (idempotent CREATE TABLE IF NOT EXISTS)
  await runMigrations(pool);

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
const query = (text, params) => {
  if (!pool) throw new Error('PostgreSQL pool is not initialised. Call connectPG() first.');
  return pool.query(text, params);
};

/**
 * Run multiple queries inside a single transaction.
 * @param {(client: import('pg').PoolClient) => Promise<any>} callback
 */
const withTransaction = async (callback) => {
  if (!pool) throw new Error('PostgreSQL pool is not initialised.');
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
};

/**
 * Get the raw pool (for advanced use).
 */
const getPool = () => pool;

module.exports = { connectPG, query, withTransaction, getPool };
