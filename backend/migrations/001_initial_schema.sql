-- ─────────────────────────────────────────────────────────────
-- ArgusAI — Migration 001: Initial Schema
-- Run this first in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

-- Enable pgvector extension (required for transaction embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- ── users ─────────────────────────────────────────────────────
-- App profile only. Auth identity lives in Supabase auth.users.
-- id references auth.users.id — managed by Supabase Auth.
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT UNIQUE NOT NULL,
  auth_provider   TEXT DEFAULT 'email',  -- 'email' | 'google'
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── plaid_items ───────────────────────────────────────────────
-- One row per Plaid institution link (one access_token per bank).
-- A user linking Chase = 1 plaid_item covering all Chase accounts.
CREATE TABLE IF NOT EXISTS public.plaid_items (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  access_token_encrypted  TEXT NOT NULL,   -- AES-256 encrypted Plaid access token
  institution_id          TEXT,            -- Plaid institution ID (e.g. "ins_3")
  institution_name        TEXT,            -- Human-readable (e.g. "Chase")
  cursor                  TEXT,            -- /transactions/sync pagination cursor
  linked_at               TIMESTAMPTZ DEFAULT now()
);

-- ── accounts ──────────────────────────────────────────────────
-- Linked bank accounts — one or many per plaid_item.
CREATE TABLE IF NOT EXISTS public.accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plaid_item_id     UUID REFERENCES public.plaid_items(id) ON DELETE SET NULL,
  plaid_account_id  TEXT UNIQUE,
  institution       TEXT,
  account_type      TEXT,     -- 'checking' | 'savings' | 'credit'
  balance           DECIMAL,
  credit_limit      DECIMAL,  -- populated for credit accounts, NULL otherwise
  last_synced       TIMESTAMPTZ
);

-- ── transactions ──────────────────────────────────────────────
-- Raw transactions from Plaid + AI-generated embedding for RAG.
CREATE TABLE IF NOT EXISTS public.transactions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id            UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  plaid_transaction_id  TEXT UNIQUE,
  merchant              TEXT,
  amount                DECIMAL,          -- positive = debit (Plaid convention)
  category              TEXT,
  subcategory           TEXT,
  timestamp             TIMESTAMPTZ,
  is_recurring          BOOLEAN DEFAULT false,
  embedding             vector(1536)      -- text-embedding-3-small output
);

-- ── bills ─────────────────────────────────────────────────────
-- Detected recurring bills (auto-populated by detection engine).
CREATE TABLE IF NOT EXISTS public.bills (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  merchant            TEXT,
  recurrence_pattern  TEXT,   -- 'monthly' | 'weekly' | 'annual'
  avg_amount          DECIMAL,
  next_due_date       DATE,
  last_seen           TIMESTAMPTZ
);

-- ── subscriptions ─────────────────────────────────────────────
-- Tracked subscriptions with creep detection.
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  merchant          TEXT,
  avg_amount        DECIMAL,
  billing_cycle     TEXT,
  price_change_pct  DECIMAL,   -- % change vs. 3 months ago; positive = crept up
  first_detected    TIMESTAMPTZ DEFAULT now(),
  is_active         BOOLEAN DEFAULT true
);

-- ── goals ─────────────────────────────────────────────────────
-- User savings goals — AI generates monthly contribution plan.
CREATE TABLE IF NOT EXISTS public.goals (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title                 TEXT,             -- e.g. "$5,000 Emergency Fund"
  target_amount         DECIMAL,
  current_amount        DECIMAL DEFAULT 0,
  target_date           DATE,
  monthly_contribution  DECIMAL,          -- AI-recommended monthly savings amount
  status                TEXT DEFAULT 'active',  -- 'active' | 'completed' | 'paused'
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- ── ai_insights ───────────────────────────────────────────────
-- All AI-generated outputs: reports, alerts, health scores, anomalies.
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  insight_type          TEXT,    -- 'monthly_report' | 'risk_alert' | 'health_score' | 'anomaly' | 'behavioral_pattern' | 'goal_plan'
  summary               TEXT,
  structured_output_json JSONB,
  created_at            TIMESTAMPTZ DEFAULT now()
);
