# ArgusAI — Product Implementation Plan

## Overview

This plan covers the full build of ArgusAI across 7 phases. Each phase builds on the last. Features are grouped by dependency — nothing is built until its foundation is ready.

**Tech Stack Summary**
- Backend: FastAPI (Python 3.11+), Supabase PostgreSQL, Redis + Celery
- AI: Claude Sonnet (Anthropic), LangGraph multi-agent, OpenAI embeddings
- Frontend: Next.js 14+, TypeScript, Tailwind CSS
- Bank Data: Plaid API
- Hosting: Vercel (frontend), Railway/Fly.io (backend)

---

## Phase 1 — Foundation
*Weeks 1–2 | Sets up the entire infrastructure*

**Goal:** Get the project structure, database, auth, and CI/CD running.

### Steps
1. Initialize Supabase project — create all 8 DB tables with proper foreign keys and Row-Level Security policies
2. Create FastAPI app (`backend/main.py`) with CORS middleware and health check endpoint
3. Build auth middleware (`backend/middleware/auth.py`) — JWT verification via Supabase, `get_current_user` dependency used by all routes
4. Create shared DB client (`backend/db/client.py`) — centralized Supabase client factory
5. Scaffold Next.js 14+ frontend with TypeScript and Tailwind
6. Build auth pages: Login, Sign Up, OAuth callback
7. Set up GitHub Actions CI/CD — lint, test, deploy on merge to main
8. Configure environment variables across local `.env` and Railway/Vercel secrets

**Deliverable:** Running server, working auth, deployed skeleton app

---

## Phase 2 — Bank Data Pipeline
*Weeks 3–4 | Gets real financial data into the system*

**Goal:** Connect bank accounts via Plaid and store all transactions.

### Steps
1. Build Plaid Link integration — generate link token, handle OAuth redirect, exchange public token for access token
2. Encrypt and store access tokens in `plaid_items` table (AES-256)
3. Build transaction sync Celery task — call Plaid `/transactions/sync`, normalize data, upsert into `transactions` table (idempotent by `plaid_transaction_id`)
4. Build embedding generation task — for each new transaction, call OpenAI `text-embedding-3-small`, store 1536-dim vector in `transactions.embedding`
5. Create Supabase RPC function `match_transactions_by_embedding` for pgvector cosine search
6. Build frontend: Bank linking flow, accounts overview page, transactions list

**Deliverable:** User can link a bank, transactions sync automatically, embeddings stored

---

## Phase 3 — Intelligence Layer
*Weeks 5–6 | Turns raw transactions into insights*

**Goal:** Detect patterns, categorize spending, and surface subscriptions and bills.

### Steps
1. Build recurring bill detection — analyze transaction history for same-merchant charges on consistent intervals, write detected bills to `bills` table
2. Build subscription tracker — identify software/streaming/service charges, detect price creep vs. 3 months ago, write to `subscriptions` table
3. Build AI categorization — Claude classifies each transaction into a category using few-shot prompting; update `transactions.category`
4. Build behavioral spending intelligence — detect velocity spikes, day-of-week patterns, category-level drift from baseline
5. Build Spending Streak Tracker — track consecutive weeks under budget per category; store as `insight_type = 'streak'` in `ai_insights`; surface in Dashboard and Behavioral Insights page
6. Build Bill Due Date Calendar view — monthly calendar page (`/bills/calendar`) showing all upcoming bills color-coded by urgency (red <7 days, amber 8–14 days)
7. Build frontend: Dashboard (spending summary), Bills page, Bills Calendar page, Subscriptions page

**Deliverable:** Bills and subscriptions identified automatically, transactions categorized, spending streaks tracked, bill calendar live

---

## Phase 3.5 — AI Intelligence Upgrade
*Week 7 | Upgrades the intelligence layer from stats + classification into a reasoning financial analyst*

**Goal:** Make the system reason like a senior financial analyst — interpret detected patterns, simulate forward implications, build a persistent model of each user's financial behavior, and produce structured actionable decisions.

### Steps

**Layer 1 — Per-Record Enrichment**
1. Run DB migration — add `ai_enrichment JSONB` to `bills` and `subscriptions` tables; create `user_financial_profiles` table with RLS
2. Build `enrich_detected_records` Celery task — one Claude call per sync, batches all bills and subscriptions; Claude annotates each with merchant context, confidence score, classification reasoning, duplicate flags, and cancel recommendations; writes back to `ai_enrichment` columns
3. Chain `enrich_detected_records` to fire after `detect_subscriptions_for_user`

**Layer 2 — Financial Analyst Reasoning Session**
4. Build `synthesize_insights` Celery task — loads three memory types: working memory (current balances, enriched bills/subscriptions, last 90 days transactions), episodic memory (past `ai_insights` via pgvector similarity search), long-term profile (`user_financial_profiles.profile` JSONB)
5. Construct analyst system prompt with financial analyst persona; apply Anthropic prompt caching on the static system prompt portion
6. Claude reasons across the full financial picture — identifies signals, simulates forward implications, produces `analyst_decisions` array written to `ai_insights` with `insight_type: "analyst_decision"`
7. After generating decisions, Claude writes back to `user_financial_profiles.profile` — appends new behavioral patterns, updates confidence scores on existing patterns, marks resolved issues, appends analyst notes
8. Chain `synthesize_insights` to fire after `enrich_detected_records`

**API + Frontend**
9. Build `GET /insights` endpoint — returns `ai_insights` rows filtered by `insight_type=analyst_decision`, ordered by recency; supports `?signal_type=` and `?limit=` params
10. Update `GET /bills` and `GET /subscriptions` to include `ai_enrichment` field in responses
11. Build Intelligence Feed page (`app/(app)/intelligence/page.tsx`) — renders analyst decision cards grouped by `signal_type`, color-coded severity chips, reasoning + recommendation + simulation per card
12. Add "Latest Intelligence" card to Dashboard — 2 most recent warning/critical decisions, links to feed
13. Add enrichment drawer to Bills and Subscriptions pages — click any record to see Layer 1 analyst annotations

**Deliverable:** Analyst reasoning after every sync, personalized profile growing over time, Intelligence Feed live, enriched bills and subscriptions

---

## Phase 4 — AI Reports
*Weeks 8–9 | Generates automated AI analysis*

**Goal:** Surface anomalies, build RAG pipeline, generate monthly reports.

### Steps
1. Build anomaly detection — statistical outlier detection on transaction amounts per category; flag duplicates, spikes, foreign charges
2. Wire RAG retrieval pipeline — `RAGRetriever` class using pgvector cosine search to pull relevant transaction context for any query
3. Build monthly report generator — Celery task that runs on the 1st of each month; Claude generates personalized summary using RAG context; stores in `ai_insights`
4. Build frontend: Reports index page, individual monthly report view

**Deliverable:** Anomalies flagged, RAG working, monthly reports generating automatically

---

## Phase 5 — Copilot + Simulations
*Weeks 9–10 | All AI intelligence systems live*

**Goal:** Activate the AI copilot and all simulation engines.

### Steps
1. Build `CashflowEngine` — 30–60 day forward balance projection using historical patterns and known bills; outputs daily balance curve with confidence bands
2. Build `DebtSimulator` — Snowball vs. Avalanche calculation; month-by-month payoff schedule
3. Build `HealthScoreEngine` — 0–100 score across 4 dimensions: Liquidity, Stability, Debt Load, Spending Volatility; updates daily
4. Build `RiskRadarEngine` — overdraft probability model, credit utilization alerts, upcoming bill warnings; fires alerts into `ai_insights`
5. Build `ScenarioEngine` — re-runs cashflow forecast with modified income/expense inputs for what-if simulations
6. Wire all engines to agent tools in `tools.py` (replacing placeholders)
7. Wire `supervisor.py` multi-agent graph — 3 specialist agents (CashflowAgent, RiskAgent, DebtAgent) routing to correct engine
8. Build `POST /copilot/chat` SSE streaming endpoint (already scaffolded — wire to real agents)
9. Build `Goal-Based Savings Planner` — user sets target + date, Claude generates monthly milestone roadmap
10. Build frontend: Cashflow page, Risk Radar, Health Score, Copilot chat, Goals, Behavioral Insights, Debt Simulator, Scenario Simulator

**Deliverable:** Full AI copilot working, all simulations live, health score updating daily

---

## Phase 6 — New Features
*Weeks 11–12 | Payment Allocation, Bonus Recommender, Credit Score*

**Goal:** Add the three new planned features.

### Steps

**Feature A — Smart Payment Allocation**
1. Build `PaymentAllocationEngine` — pure DB math, no LLM; priority-ordered allocation across credit cards, bills, and savings; enforces buffer floor
2. Build `GET /payments/cards` — list all credit accounts with balance and utilization
3. Build `POST /payments/plan` — run allocation engine, cache result 6h in `ai_insights`
4. Add `get_payment_plan` tool to `tools.py`
5. Add `PaymentAgent` to `supervisor.py` — routing keywords: pay, split, deposit, divide, allocate

**Feature B — Bonus Recommender**
1. Obtain Brave Search API key
2. Build `BonusSearchEngine` — calls Brave Search, uses Claude to extract structured bonus data, filters out institutions user already has, caches 24h
3. Add `search_financial_bonuses` tool to `tools.py`
4. Add `BonusAgent` to `supervisor.py` — routing keywords: bonus, signup, reward, bank offer

**Feature C — Credit Score**
1. Run DB migration — create `credit_scores` table, add Experian columns to `users`
2. Apply for Experian Connect API (use sandbox during development)
3. Build `CreditEngine` — OAuth initiation, soft-pull credit report, score history queries, Claude-powered recommendations grounded in real DB data
4. Build `POST /credit/connect`, `GET /credit/connect/callback`, `GET /credit/score`, `GET /credit/history` endpoints
5. Add `get_credit_profile` tool to `tools.py`
6. Add `CreditAgent` to `supervisor.py` — routing keywords: credit score, credit history, fico, improve credit
7. Run routing conflict audit across all 6 agents — resolve any keyword overlaps

**Deliverable:** All 3 new features live and integrated into the copilot

---

## Phase 7 — Production Hardening
*Weeks 13–14 | Ship-ready*

**Goal:** Make the product secure, fast, and stable for real users.

### Steps
1. Security audit — verify RLS on all tables, check for injection vulnerabilities, confirm Plaid tokens never exposed in API responses
2. Add per-user rate limiting on all AI endpoints
3. Add DB connection pooling via PgBouncer
4. Add performance indexes on hot query paths
5. Load testing with Locust — simulate 100 concurrent users
6. Set up Sentry (error tracking) and Axiom (logs)
7. Configure custom SMTP provider (Resend or Postmark) — replace Supabase default sender with branded `noreply@argusai.com`; customize all auth email templates (confirm signup, password reset, magic link)
8. Surface sync reliability indicator on Accounts page — last-synced timestamp + health badge per account (green <1hr, amber >6hr, red >24hr or failed)
9. UI polish — loading states, empty states, error boundaries, accessibility pass
10. Final smoke tests in production environment

**Deliverable:** Production-ready, deployed, monitored

---

## New Files Summary (Phase 6 additions)

| File | Purpose |
|---|---|
| `backend/middleware/auth.py` | JWT auth dependency |
| `backend/main.py` | FastAPI app entry |
| `backend/db/client.py` | Supabase client factory |
| `backend/engines/payment_allocation.py` | Payment allocation logic |
| `backend/engines/bonus_search.py` | Brave Search + bonus filtering |
| `backend/engines/credit_engine.py` | Experian Connect + score analysis |
| `backend/routers/payments.py` | Payment endpoints |
| `backend/routers/credit.py` | Credit score endpoints |
| `backend/migrations/003_credit_scores.sql` | Credit scores table + RLS |
| `backend/migrations/004_indexes.sql` | Performance indexes |

## New Dependencies (Phase 6)

```
thefuzz>=0.22.0           # fuzzy institution name matching
python-Levenshtein>=0.25.0  # speeds up thefuzz
python-dateutil>=2.9.0    # date math for due date calculations
```

## New Environment Variables (Phase 6)

```
PAYMENT_BUFFER_FLOOR_DEFAULT=500.0
BRAVE_API_KEY=
EXPERIAN_CLIENT_ID=
EXPERIAN_CLIENT_SECRET=
EXPERIAN_API_BASE_URL=https://sandbox.experian.com
EXPERIAN_REDIRECT_URI=http://localhost:8000/credit/connect/callback
```
