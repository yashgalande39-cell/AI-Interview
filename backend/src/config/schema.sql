-- =============================================================================
-- TRESK AI Platform — PostgreSQL Schema
-- =============================================================================
-- This schema is the production migration target.
-- Current stack uses mockDb.js (file-based) — migrate here when ready.
-- Run: psql -U postgres -d tresk_ai -f schema.sql
-- =============================================================================

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
  current_role        TEXT,
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

  -- Auth
  auth_provider       TEXT        NOT NULL DEFAULT 'local',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- =============================================================================
-- INTERVIEW SESSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS interview_sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company         TEXT,
  role            TEXT,
  type            TEXT        NOT NULL DEFAULT 'hr' CHECK (type IN ('hr', 'technical', 'behavioral', 'system_design')),
  status          TEXT        NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'abandoned')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,

  -- Scorecard (stored as JSONB for flexibility)
  score_card      JSONB,

  -- AI-generated feedback
  feedback        TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON interview_sessions(user_id);
CREATE INDEX idx_sessions_status ON interview_sessions(status);

-- =============================================================================
-- REPLAY EVENTS (time-series per session)
-- =============================================================================
CREATE TABLE IF NOT EXISTS replay_events (
  id          BIGSERIAL   PRIMARY KEY,
  session_id  UUID        NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  t           INTEGER     NOT NULL,        -- milliseconds since session start
  type        TEXT        NOT NULL,        -- 'question' | 'answer' | 'score' | 'expression' | 'pause'
  payload     JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_replay_session ON replay_events(session_id, t);

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

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resumes_user ON resumes(user_id);

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

CREATE INDEX idx_coding_user ON coding_submissions(user_id);
CREATE INDEX idx_coding_problem ON coding_submissions(problem_id);

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

CREATE INDEX idx_payments_user ON payments(user_id);

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

CREATE INDEX idx_tresk_session ON tresk_messages(session_id, created_at);

-- =============================================================================
-- GROUP DISCUSSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS gd_rooms (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code   TEXT        UNIQUE NOT NULL,
  topic       TEXT        NOT NULL,
  host_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
  status      TEXT        NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at    TIMESTAMPTZ
);

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

CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
