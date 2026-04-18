-- ─────────────────────────────────────────────────────────────
-- ArgusAI — Migration 002: Row-Level Security Policies
-- Run this after 001_initial_schema.sql
-- ─────────────────────────────────────────────────────────────
-- Every table gets RLS enabled + a policy that restricts each
-- authenticated user to their own rows only.
-- auth.uid() returns the UUID of the currently authenticated user.
-- ─────────────────────────────────────────────────────────────

-- ── Enable RLS on all tables ──────────────────────────────────
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plaid_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights    ENABLE ROW LEVEL SECURITY;

-- ── users ─────────────────────────────────────────────────────
CREATE POLICY "users: own row only"
  ON public.users
  FOR ALL
  USING (auth.uid() = id);

-- ── plaid_items ───────────────────────────────────────────────
CREATE POLICY "plaid_items: own rows only"
  ON public.plaid_items
  FOR ALL
  USING (auth.uid() = user_id);

-- ── accounts ──────────────────────────────────────────────────
CREATE POLICY "accounts: own rows only"
  ON public.accounts
  FOR ALL
  USING (auth.uid() = user_id);

-- ── transactions ──────────────────────────────────────────────
-- Transactions don't have a direct user_id — access is via account ownership.
CREATE POLICY "transactions: own rows only"
  ON public.transactions
  FOR ALL
  USING (
    account_id IN (
      SELECT id FROM public.accounts WHERE user_id = auth.uid()
    )
  );

-- ── bills ─────────────────────────────────────────────────────
CREATE POLICY "bills: own rows only"
  ON public.bills
  FOR ALL
  USING (auth.uid() = user_id);

-- ── subscriptions ─────────────────────────────────────────────
CREATE POLICY "subscriptions: own rows only"
  ON public.subscriptions
  FOR ALL
  USING (auth.uid() = user_id);

-- ── goals ─────────────────────────────────────────────────────
CREATE POLICY "goals: own rows only"
  ON public.goals
  FOR ALL
  USING (auth.uid() = user_id);

-- ── ai_insights ───────────────────────────────────────────────
CREATE POLICY "ai_insights: own rows only"
  ON public.ai_insights
  FOR ALL
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- Verification: run this to confirm RLS is blocking correctly.
-- Should return 0 rows when run as anon role.
--
--   SET LOCAL role anon;
--   SELECT * FROM public.users;
--
-- ─────────────────────────────────────────────────────────────
