-- =============================================================================
-- TRESK AI Platform — PostgreSQL Schema (Full Production)
-- =============================================================================
-- Idempotent: all statements use IF NOT EXISTS / OR REPLACE.
-- Run: psql -U postgres -d tresk_ai -f schema.sql
-- Or auto-runs on server startup via pgDb.js
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- for text similarity search
-- NOTE: Enable pgvector in your DB with:
--   CREATE EXTENSION IF NOT EXISTS vector;
-- Uncomment below once pgvector is installed in your PostgreSQL instance:
-- CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL,
  email               TEXT        UNIQUE NOT NULL,
  password_hash       TEXT,                      -- null for OAuth users
  google_id           TEXT        UNIQUE,
  avatar              TEXT,
  college_name        TEXT,
  branch              TEXT,
  graduation_year     TEXT,
  "current_role"      TEXT,
  location            TEXT,
  bio                 TEXT,

  -- Gamification
  xp                  INTEGER     NOT NULL DEFAULT 100,
  streak              INTEGER     NOT NULL DEFAULT 1,
  badges              TEXT[]      NOT NULL DEFAULT '{"Novice Prep"}',
  last_active         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Subscription
  plan                TEXT        NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'teams')),
  subscription_id     TEXT,
  plan_activated_at   TIMESTAMPTZ,
  plan_expires_at     TIMESTAMPTZ,

  -- Email verification
  email_verified      BOOLEAN     NOT NULL DEFAULT FALSE,
  email_verify_token  TEXT,
  email_verify_expiry TIMESTAMPTZ,

  -- Password reset
  reset_token         TEXT,
  reset_token_expiry  TIMESTAMPTZ,

  -- Auth
  role                TEXT        NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  auth_provider       TEXT        NOT NULL DEFAULT 'local',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =============================================================================
-- INTERVIEW SESSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS interview_sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company         TEXT,
  role            TEXT,
  type            TEXT        NOT NULL DEFAULT 'hr' CHECK (type IN ('hr', 'technical', 'behavioral', 'system_design', 'aptitude', 'coding')),
  status          TEXT        NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'abandoned')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,

  -- Scorecard (stored as JSONB for flexibility)
  score_card      JSONB,

  -- Individual score components (denormalized for analytics performance)
  score_overall       INTEGER DEFAULT 0,
  score_technical     INTEGER DEFAULT 0,
  score_communication INTEGER DEFAULT 0,
  score_confidence    INTEGER DEFAULT 0,
  score_problem_solving INTEGER DEFAULT 0,

  -- AI-generated feedback
  feedback        TEXT,

  -- Full transcript for RAG memory
  transcript      JSONB,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_time ON interview_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_company ON interview_sessions(company);

-- =============================================================================
-- REPLAY EVENTS (time-series per session)
-- =============================================================================
CREATE TABLE IF NOT EXISTS replay_events (
  id          BIGSERIAL   PRIMARY KEY,
  session_id  UUID        NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  t           INTEGER     NOT NULL,        -- milliseconds since session start
  type        TEXT        NOT NULL,        -- 'question' | 'answer' | 'score' | 'expression' | 'pause' | 'filler'
  payload     JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_replay_session ON replay_events(session_id, t);

-- =============================================================================
-- RESUMES
-- =============================================================================
CREATE TABLE IF NOT EXISTS resumes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name       TEXT,
  file_url        TEXT,
  raw_text        TEXT,
  target_role     TEXT,
  target_company  TEXT,

  -- ATS Analysis
  ats_score       INTEGER,
  ats_analysis    JSONB,
  keywords        TEXT[],

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id);

-- =============================================================================
-- CODING SUBMISSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS coding_submissions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id      TEXT        NOT NULL,
  problem_title   TEXT,
  language        TEXT        NOT NULL DEFAULT 'javascript',
  code            TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'accepted', 'wrong_answer', 'tle', 'error')),
  runtime_ms      INTEGER,
  memory_kb       INTEGER,
  test_cases_total    INTEGER NOT NULL DEFAULT 0,
  test_cases_passed   INTEGER NOT NULL DEFAULT 0,
  xp_awarded      INTEGER     NOT NULL DEFAULT 0,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coding_user ON coding_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_problem ON coding_submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_coding_status ON coding_submissions(status);

-- =============================================================================
-- DAILY CHALLENGES
-- =============================================================================
CREATE TABLE IF NOT EXISTS daily_challenges (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date  DATE        UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  problem_id      TEXT        NOT NULL,
  problem_title   TEXT        NOT NULL,
  difficulty      TEXT        NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  xp_reward       INTEGER     NOT NULL DEFAULT 150,
  tags            TEXT[]      NOT NULL DEFAULT '{}',
  active          BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS daily_challenge_completions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id    UUID        NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (challenge_id, user_id)
);

-- =============================================================================
-- BILLING / PAYMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  razorpay_order_id   TEXT    UNIQUE NOT NULL,
  razorpay_payment_id TEXT,
  plan            TEXT        NOT NULL,
  amount_paise    INTEGER     NOT NULL,
  currency        TEXT        NOT NULL DEFAULT 'INR',
  status          TEXT        NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

-- =============================================================================
-- TRESK AI CHAT SESSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS tresk_sessions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode        TEXT        NOT NULL DEFAULT 'career',
  title       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tresk_messages (
  id          BIGSERIAL   PRIMARY KEY,
  session_id  UUID        NOT NULL REFERENCES tresk_sessions(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL CHECK (role IN ('user', 'model')),
  text        TEXT        NOT NULL,
  tokens_used INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tresk_session ON tresk_messages(session_id, created_at);



-- =============================================================================
-- AI READINESS SCORES (cached for dashboard display)
-- =============================================================================
CREATE TABLE IF NOT EXISTS readiness_scores (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  score_overall   NUMERIC(5,2) NOT NULL DEFAULT 0,
  score_coding    NUMERIC(5,2) NOT NULL DEFAULT 0,
  score_interview NUMERIC(5,2) NOT NULL DEFAULT 0,
  score_resume    NUMERIC(5,2) NOT NULL DEFAULT 0,
  score_communication NUMERIC(5,2) NOT NULL DEFAULT 0,
  sessions_count  INTEGER NOT NULL DEFAULT 0,
  problems_solved INTEGER NOT NULL DEFAULT 0,
  last_computed   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_readiness_user ON readiness_scores(user_id);

-- =============================================================================
-- USER MEMORIES (Vector embeddings or Trigram text search for RAG)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_memories (
  id          BIGSERIAL   PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_type TEXT        NOT NULL,   -- 'interview' | 'resume' | 'coding' | 'chat'
  source_id   TEXT,                   -- session_id, resume_id, etc.
  chunk_text  TEXT        NOT NULL,
  metadata    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memories_user ON user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_text_trgm ON user_memories USING gin (chunk_text gin_trgm_ops);

-- Note: if you have pgvector installed, you can enable embeddings with:
--   ALTER TABLE user_memories ADD COLUMN IF NOT EXISTS embedding VECTOR(1536);
--   CREATE INDEX IF NOT EXISTS idx_memories_embedding ON user_memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);


-- =============================================================================
-- QUESTIONS BANK
-- =============================================================================
CREATE TABLE IF NOT EXISTS questions (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type        TEXT        NOT NULL CHECK (type IN ('HR', 'Technical', 'Behavioral', 'Coding', 'System Design', 'Aptitude')),
  role        TEXT        NOT NULL DEFAULT 'All',
  company     TEXT        NOT NULL DEFAULT 'Common',
  difficulty  TEXT        NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  question    TEXT,
  title       TEXT,
  description TEXT,
  test_cases  JSONB,
  templates   JSONB,
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_company ON questions(company);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);

-- =============================================================================
-- TRIGGERS — auto-update updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_sessions_updated ON interview_sessions;
CREATE TRIGGER trg_sessions_updated
  BEFORE UPDATE ON interview_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_resumes_updated ON resumes;
CREATE TRIGGER trg_resumes_updated
  BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- REFRESH TOKEN SESSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS refresh_sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    TEXT        NOT NULL UNIQUE,  -- SHA-256 hash of refresh token
  user_agent    TEXT,
  ip_address    TEXT,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user ON refresh_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_sessions_token ON refresh_sessions(token_hash);

-- =============================================================================
-- SAFE MIGRATION — Add columns to existing DBs if they don't already exist
-- =============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified') THEN
    ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verify_token') THEN
    ALTER TABLE users ADD COLUMN email_verify_token TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verify_expiry') THEN
    ALTER TABLE users ADD COLUMN email_verify_expiry TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='reset_token') THEN
    ALTER TABLE users ADD COLUMN reset_token TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='reset_token_expiry') THEN
    ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
    ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));
  END IF;
END $$;
