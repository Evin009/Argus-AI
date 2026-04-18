-- ─────────────────────────────────────────────────────────────
-- ArgusAI — Migration 003: Vector + Performance Indexes
-- Run this after 002_rls_policies.sql
-- ─────────────────────────────────────────────────────────────

-- ── Vector index for RAG semantic search ─────────────────────
-- ivfflat is the recommended index type for pgvector cosine similarity.
-- lists = 100 is appropriate for up to ~1M vectors.
-- Used by: RAG retrieval pipeline, AI Copilot context assembly.
CREATE INDEX IF NOT EXISTS transactions_embedding_idx
  ON public.transactions
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ── Performance indexes ───────────────────────────────────────
-- Speeds up the most common query patterns across the app.

-- Transactions: paginated feed filtered by account + time
CREATE INDEX IF NOT EXISTS transactions_account_timestamp_idx
  ON public.transactions (account_id, timestamp DESC);

-- Accounts: all accounts for a user
CREATE INDEX IF NOT EXISTS accounts_user_id_idx
  ON public.accounts (user_id);

-- Bills: upcoming bills sorted by due date
CREATE INDEX IF NOT EXISTS bills_user_next_due_idx
  ON public.bills (user_id, next_due_date ASC);

-- Subscriptions: active subscriptions per user
CREATE INDEX IF NOT EXISTS subscriptions_user_active_idx
  ON public.subscriptions (user_id, is_active);

-- AI Insights: latest insights by type per user
CREATE INDEX IF NOT EXISTS ai_insights_user_type_created_idx
  ON public.ai_insights (user_id, insight_type, created_at DESC);

-- Goals: active goals per user
CREATE INDEX IF NOT EXISTS goals_user_status_idx
  ON public.goals (user_id, status);
