# ArgusAI — Product Implementation Plan

## Overview

This plan covers the full build of ArgusAI across 9 phases. Each phase builds on the last. Features are grouped by dependency — nothing is built until its foundation is ready.

**Tech Stack Summary**
- Backend: FastAPI (Python 3.11+), Supabase PostgreSQL, Redis + Celery
- AI: Claude Sonnet 4.6 (Anthropic), LangGraph multi-agent, OpenAI text-embedding-3-small
- Frontend: Next.js 14+, TypeScript, Tailwind CSS
- Bank Data: Plaid API
- Hosting: Vercel (frontend), Railway (backend + Celery worker)

---

## Phase 1 — Foundation ✅
*Weeks 1–2 | Infrastructure baseline*

**Goal:** Running skeleton. Auth, DB, CI/CD, and local dev ready.

### Steps
1. Initialize Supabase project — 8 DB tables with foreign keys and RLS policies
2. Create FastAPI app with CORS middleware and health check endpoint
3. Build auth middleware — JWT verification via Supabase, `get_current_user` dependency
4. Create shared DB client — centralized Supabase client factory
5. Scaffold Next.js 14+ frontend with TypeScript and Tailwind
6. Build auth pages: Login, Sign Up, OAuth callback, verify-email
7. Set up GitHub Actions CI — ruff lint + pytest, deploy on merge to `main`
8. Configure environment variables across `.env`, Railway secrets, and Vercel

**Deliverable:** Running server, working auth, deployed skeleton

---

## Phase 1.5 — Design System ✅
*Weeks 3–4 | UI foundation*

**Goal:** Consistent, polished dark-mode design system before any intelligence surfaces are built.

### Steps
1. Define color tokens, typography scale, and spacing system in Tailwind config
2. Build reusable component library — cards, stat tiles, badges, drawers, skeleton loaders
3. Build sidebar nav — icons, active states, section dividers, responsive collapse
4. Build dashboard shell — grid layout, empty states, onboarding flow
5. Verify responsive layout across mobile, tablet, and desktop breakpoints

**Deliverable:** Design system live, all existing pages using shared components

---

## Phase 2 — Bank Data Pipeline ✅
*Weeks 5–6 | Real financial data*

**Goal:** Connect bank accounts via Plaid, sync and embed all transactions.

### Steps
1. Build Plaid Link integration — generate link token, handle OAuth redirect, exchange token
2. Encrypt and store access tokens in `plaid_items` (AES-256)
3. Build transaction sync Celery task — call Plaid `/transactions/sync`, normalize, upsert idempotent by `plaid_transaction_id`
4. Build embedding generation task — `text-embedding-3-small`, store 1536-dim vector in `transactions.embedding`
5. Create Supabase RPC `match_transactions_by_embedding` for pgvector cosine search
6. Build frontend: Bank linking flow, accounts overview page, transactions table with pagination + filters

**Deliverable:** User can link a bank, transactions sync automatically, embeddings stored

---

## Phase 3 — Intelligence Layer 🔄
*Weeks 7–8 | Pattern detection and classification*

**Goal:** Detect recurring bills and subscriptions, categorize spending with AI.

### Steps
1. Build recurring bill detection — group transactions by merchant, compute median intervals, classify as `monthly` / `weekly` / `annual`, upsert to `bills` table
2. Build subscription tracker — subset bills to known service/software merchants, compute `price_change_pct` vs. 3 months ago, flag creeping subscriptions, upsert to `subscriptions` table
3. Build AI categorization — Claude few-shot classification for `OTHER` transactions, batched in groups of 50, update `transactions.category` and `transactions.subcategory`
4. Chain Celery tasks: `sync_transactions` → `detect_bills` → `detect_subscriptions` → `recategorize_transactions`
5. Build `GET /bills` and `GET /subscriptions` endpoints
6. Build Bills page — urgency color-coding (red <7 days, amber <14 days, green safe)
7. Build Bills Calendar — monthly grid with bills plotted on `next_due_date`, today highlighted
8. Build Subscriptions page — monthly total, active count, price creep badges
9. Update Dashboard — upcoming bills total card, subscriptions spend card, spending vs. last month card

**Deliverable:** Bills and subscriptions identified automatically, transactions categorized, all pages verified in browser

---

## Phase 3.5 — AI Intelligence Upgrade ✅
*Week 9 | Reasoning analyst with persistent semantic memory*

**Goal:** Transform detection output from statistics into analyst-quality reasoning that learns each user's financial behavior over time — using a LangGraph multi-agent pipeline and pgvector RAG for semantic episodic memory.

### Architecture

```
detect_subscriptions → run_intelligence_pipeline (Celery)
                              ↓
                    LangGraph StateGraph
                 EnrichmentNode → AnalystNode → MemoryNode
```

**State** flows as `IntelligenceState` TypedDict. Each node returns only the keys it modifies; LangGraph merges automatically.

### Steps

**Database**
1. Apply `backend/migrations/010_phase_3_5_intelligence.sql`:
   - `ALTER TABLE bills ADD COLUMN IF NOT EXISTS ai_enrichment JSONB`
   - `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS ai_enrichment JSONB`
   - Create `user_financial_profiles` table (`user_id UNIQUE`, `profile JSONB`, `analyst_version`, `last_enriched_at`, `last_updated`) with RLS
2. Apply `backend/migrations/011_ai_insights_embedding.sql`:
   - `ALTER TABLE ai_insights ADD COLUMN IF NOT EXISTS embedding vector(1536)`
   - Create `ivfflat` index on embedding (cosine ops, lists=100)
   - Create `match_insights_by_embedding(query_embedding, match_threshold, match_count, p_user_id)` RPC

**Agents package (`backend/agents/`)**
3. Create `state.py` — `IntelligenceState` TypedDict (user_id, accounts, bills, subscriptions, tx_summary, relevant_past_insights, profile, enrichment_result, decisions, updated_profile)
4. Create `enrichment_agent.py` — `enrichment_node(state)`: one Claude call, annotates all bills + subscriptions with `ai_enrichment`, merges enriched data back into state; early-returns empty result when no bills or subscriptions exist
5. Create `analyst_agent.py` — `analyst_node(state)`: reads `state["relevant_past_insights"]` (includes similarity scores from RAG — not a DB query), calls Claude with full financial brief, returns `{"decisions": [...], "updated_profile": {...}}`
6. Create `memory_agent.py` — `memory_node(state)`: embeds each decision title via OpenAI text-embedding-3-small, inserts to `ai_insights` with embedding (silently skips embedding on failure — row still written), upserts profile to `user_financial_profiles`
7. Create `graph.py` — compiled `StateGraph` module-level singleton `intelligence_graph`

**Pipeline task**
8. Create `backend/tasks/run_intelligence_pipeline.py`:
   - `_build_rag_query_text(accounts, bills, subscriptions)` — pure function building text summary of current financial state for embedding
   - `_retrieve_relevant_insights(user_id, query_text, threshold=0.6, count=5)` — embeds query, calls `match_insights_by_embedding` RPC, returns `[]` on any exception
   - `run_intelligence_pipeline_for_user(user_id)` Celery task — fetches accounts/bills/subscriptions/transactions/profile, computes tx_summary, runs RAG (fallback to recency if no embeddings yet), invokes graph, returns `{"user_id": ..., "decisions_written": N}`
9. Update `celery_app.py` include list — replace `enrich_detected_records` and `synthesize_insights` with `run_intelligence_pipeline`
10. Update `detect_subscriptions_for_user` — call `run_intelligence_pipeline_for_user.delay(user_id)`

**API**
11. Create `backend/routers/insights.py` — `GET /insights` filtered by `insight_type=analyst_decision`, ordered by recency; supports `?limit=` (max 50) and `?signal_type=` params
12. Register `insights` router in `backend/main.py`

**Tests**
13. Update imports in `test_enrich_detected_records.py` → `agents.enrichment_agent`
14. Update imports in `test_synthesize_insights.py` → `agents.analyst_agent`
15. Write `test_agents.py` — 10 tests: enrichment_node (3), analyst_node (3), memory_node (3), graph smoke test (1)
16. Write `test_run_intelligence_pipeline.py` — 5 tests: RAG helpers (4), pipeline task (1)

**Frontend**
17. Build Intelligence Feed page `app/(app)/intelligence/page.tsx` — cards grouped by signal type (risk → behavioral → anomaly → subscription → opportunity), severity color chips, reasoning + recommendation + simulation per card
18. Add Intelligence nav item to `app/(app)/layout.tsx` — after Subscriptions, before first divider
19. Update Dashboard — add `AnalystDecision` type, fetch `GET /insights?limit=2`, render Latest Intelligence card (full-width, above Recent Transactions)
20. Update Bills page — add `BillEnrichment` type, `selectedBill` state, clickable rows, enrichment drawer
21. Update Subscriptions page — add `SubscriptionEnrichment` type, `selectedSub` state, clickable rows, enrichment drawer

**Deliverable:** Analyst reasoning after every sync, personalized profile growing over time, semantic episodic memory via pgvector RAG, Intelligence Feed live, enriched drawers on bills and subscriptions

---

## Phase 4 — Continuous Intelligence & Memory ⬜
*Weeks 10–11 | Anomaly detection, memory timeline, behavioral intelligence, stress index*

**Goal:** Detect unusual patterns, build the user's financial memory, track behavioral signals, and surface a real-time pressure indicator.

### Steps
1. Build anomaly detection — z-score outlier detection per category (flag transactions > 2 SD from 90-day mean), duplicate charge detection (same merchant + amount within 3 days), foreign transaction flagging; write anomalies to `ai_insights` with `insight_type = 'anomaly'`
2. ~~Upgrade RAG pipeline~~ — **built in Phase 3.5**: pgvector similarity search on `ai_insights` is already live via `match_insights_by_embedding()` RPC; `run_intelligence_pipeline` retrieves top-5 semantically relevant past decisions via cosine similarity. Phase 4 should extend this with anomaly embeddings and memory timeline entries.
3. Build Financial Memory Timeline engine — on every sync, scan for significant financial events (new subscriptions, price increases, rent changes, spending spikes, goal milestones, debt payoffs); append events to a `financial_memory` table ordered by date
4. Build Continuous Intelligence Briefing — after every sync, if a significant event occurred (large transaction, bill change, pattern crossing threshold), generate a brief and write to `ai_insights` with `insight_type = 'continuous_briefing'`; replaces monthly report cadence
5. Build Behavioral Spending Intelligence — velocity spike detection (current 7-day spend > 130% of 7-day moving average), day-of-week pattern modeling (average spend by weekday over 90 days), impulse purchase cluster detection (3+ transactions at same merchant type within 48h); write behavioral signals to `ai_insights`
6. Build Financial Stress Index engine — compute ratio of upcoming bills (14 days) to current balance, days until next income vs. current balance, 7-day spending volatility, accounts below safe threshold; output stress label (`LOW` / `MODERATE` / `HIGH` / `CRITICAL`) with contributing factors
7. Create `financial_memory` DB table — `user_id`, `event_type`, `description`, `amount`, `occurred_at`, `created_at`; RLS scoped to user
8. Build `GET /insights/memory` endpoint — paginated financial memory timeline, newest first
9. Build `GET /insights/stress` endpoint — current stress index with breakdown of contributing factors
10. Build `GET /insights/anomalies` endpoint — anomalies ordered by severity
11. Build Memory Timeline page `app/(app)/memory/page.tsx` — chronological event feed with event type icons and amounts
12. Build Behavioral Insights page `app/(app)/behavioral/page.tsx` — behavioral signals, velocity chart, day-of-week spend heatmap
13. Add Financial Stress Index card to Dashboard — large label + contributing factors

**Deliverable:** Anomalies flagged, memory timeline auto-populated, behavioral intelligence active, stress index live on dashboard

---

## Phase 5 — Daily Financial Pulse ⬜
*Weeks 12–13 | Safe to Spend, Weather Forecast, Pay Timing, Risk Radar*

**Goal:** The features users open every morning. Makes ArgusAI a daily habit rather than a monthly check-in.

### Steps
1. Build Safe to Spend Today engine — pull current balance, subtract all bills due in 14 days, subtract active savings goal contributions, subtract configurable buffer reserve; output single number + itemized breakdown; recompute nightly via Celery beat
2. Build Financial Weather Forecast engine — generate 7-day and 30-day forward narrative using balance projection + bill schedule + spending velocity; classify each day/window into a weather-metaphor risk level (Clear / Mild Turbulence / Storm Warning); output structured forecast with plain-English summary per window
3. Build Pay Timing Intelligence engine:
   - *Credit utilization optimizer:* for each credit card, identify statement closing date (inferred from transaction history), compute payment amount needed to hit target utilization (default 8%), output `pay_by` date and `pay_amount`
   - *Bill stacking detector:* find 3-day windows where total bills exceed projected balance; for stacked bills, identify which have grace periods and output priority-ordered payment schedule to avoid penalties
4. Build Budget Strategy from Bill Changes engine — on every sync, compare current avg bill amounts to previous 30 days; if any bill increased > 2%, generate 3 absorption strategies (reduce category X, cancel unused subscription Y, delay goal by N weeks); write to `ai_insights` with `insight_type = 'budget_strategy'`
5. Build `RiskRadarEngine` — daily overdraft probability (Monte Carlo over 10-day cashflow with spending volatility), credit utilization trend toward 30%, large bill due within 7 days with insufficient buffer; fire structured alerts to `ai_insights` with `insight_type = 'risk_alert'`
6. Build `GET /insights/safe-to-spend` — current safe spend number with line-item breakdown
7. Build `GET /insights/weather` — structured 30-day forecast with weather labels and narratives
8. Build `GET /insights/pay-timing` — per-card pay date + amount recommendations
9. Build `GET /insights/risk` — Risk Radar alerts ordered by severity
10. Add Safe to Spend as the hero number on Dashboard — large display, tappable to see breakdown
11. Build Weather Forecast page `app/(app)/forecast/page.tsx` — 7-day daily view + 30-day summary, weather icons
12. Build Risk Radar page `app/(app)/risk/page.tsx` — alert cards grouped by severity with action steps
13. Add Pay Timing card to Dashboard — next critical pay date for top credit card

**Deliverable:** Safe to Spend live as hero metric, Weather Forecast page, Risk Radar active, Pay Timing recommendations surfaced

---

## Phase 6 — Copilot & Advanced Simulations ⬜
*Weeks 14–16 | Full AI copilot, simulation engines, health scoring, goal planning*

**Goal:** Activate all forward-looking intelligence systems — cashflow engine, simulators, health score, goal planner, and the multi-agent copilot.

### Steps

**Engines**
1. Build `CashflowEngine` — pull 90 days of transaction history, model income regularity + bill schedule + category volatility; output probability-weighted daily balance curve for 60 days with P10/P50/P90 confidence bands; expose as `POST /engines/cashflow`
2. Build `HealthScoreEngine` — compute 0–100 score across 4 dimensions: Liquidity (30%) = liquid assets ÷ monthly expenses, Stability (25%) = income consistency × (1 - expense volatility), Debt Load (25%) = credit utilization + debt-to-income, Spending Volatility (20%) = category variance vs. personal baseline; update nightly; expose as `GET /engines/health-score`
3. Build `DebtSimulator` — Snowball vs. Avalanche schedules, run each through `CashflowEngine` to flag months where strategy leaves balance below buffer floor, propose modified schedule that maintains floor; expose as `POST /engines/debt-sim`
4. Build `ScenarioEngine` — accept modified income/expense inputs, re-run cashflow projection, return updated Health Score, updated goal timelines, updated Risk Radar; expose as `POST /engines/scenario`
5. Build Life Event Simulator — templates for 7 life events (marriage, child, house, job loss, sabbatical, relocation, school); each template injects standard cost/income adjustments into `ScenarioEngine`; expose as `POST /engines/life-event`
6. Build Obstacle-Aware Goal Planning engine — user sets target amount + date; engine generates monthly contribution roadmap; re-runs cashflow to identify shortfall months caused by known upcoming expenses; outputs recovery adjustments; track progress in `goals` table; expose as `POST /goals` and `GET /goals`
7. Build AI Decision Engine — `POST /copilot/decide` — queries balance, upcoming bills, goal progress, cashflow forecast; runs simulation with proposed purchase; returns structured affordability analysis with recommendation and wait-until date if purchase is not safe now

**Multi-Agent System**
8. Build LangGraph supervisor graph — routes queries to: `CashflowAgent` (forecast, projection), `RiskAgent` (alerts, overdraft), `DebtAgent` (payoff strategy), `GoalAgent` (savings, milestones). **Note:** The `backend/agents/` package and LangGraph `StateGraph` pattern are already established from Phase 3.5 — extend the same package rather than starting from scratch.
9. Wire all engines as agent tools in `backend/agents/tools.py`
10. Wire `POST /copilot/chat` SSE streaming endpoint to supervisor graph + RAG retrieval

**Frontend**
11. Build Cashflow page `app/(app)/cashflow/page.tsx` — probability curve chart + confidence band visualization + highest-risk day callout
12. Build Health Score page `app/(app)/health/page.tsx` — score dial + 4-dimension breakdown + "how to improve" per dimension
13. Build Debt Simulator page `app/(app)/debt/page.tsx` — side-by-side Snowball vs. Avalanche with cashflow-safe recommendation
14. Build Scenario Simulator page `app/(app)/simulator/page.tsx` — income/expense sliders with real-time preview of cashflow, health score, and goal impact
15. Build Life Event Simulator page `app/(app)/life-events/page.tsx` — event template picker, output forward financial impact
16. Build Goals page `app/(app)/goals/page.tsx` — active goals, milestone progress, shortfall alerts, recovery actions
17. Build AI Copilot page `app/(app)/copilot/page.tsx` — streaming chat interface, decision engine CTA

**Deliverable:** All simulation engines live, multi-agent copilot working, health score updating daily, goals with obstacle-aware planning

---

## Phase 7 — Decision Intelligence ⬜
*Weeks 17–18 | Journals, ROI scoring, negotiation intelligence, payment routing*

**Goal:** Close the loop between insight and action — help users act on what ArgusAI tells them.

### Steps

**AI Decision Journal**
1. Build `POST /decisions/journal` — accept decision type, amount, merchant, notes; store in new `decision_journal` table with `user_id`, `decision_type`, `amount`, `merchant`, `logged_at`, `check_in_due_at` (90 days after logging)
2. Build 90/180-day check-in Celery task — on `check_in_due_at`, pull all transactions from logged date to now, compute downstream impact vs. expected (fixed cost change, goal impact, spending shift), write impact report to `decision_journal.impact_report JSONB`
3. Build `GET /decisions/journal` — all logged decisions with impact reports where available
4. Build Decision Journal page `app/(app)/journal/page.tsx` — logged decisions timeline, impact report cards on check-in completion

**Subscription ROI Scoring**
5. Extend `detect_subscriptions_for_user` — for each active subscription, infer usage from transaction patterns (order frequency for delivery services, streaming order history for video services, gym check-in proxies from location merchants); compute `cost_per_use` and `roi_score`; write to `subscriptions` table
6. Build `GET /subscriptions/roi` — subscriptions ordered by ROI score (worst first) with usage evidence
7. Add ROI score badges to Subscriptions page — color-coded (red = low ROI, green = high ROI)

**Bill Negotiation + Alternative Detection**
8. Build negotiation intelligence engine:
   - *Stage 1 — Usage analysis:* pull ROI score from subscriptions table
   - *Stage 2 — Alternative detection:* for subscriptions with `roi_score < 0.4`, search maintained alternatives database (static JSON + Brave Search for current pricing); return cheaper alternatives covering the same need
   - *Stage 3 — Negotiation script:* for high-usage subscriptions priced above market, generate optimal call timing (last 3 days of billing cycle), what comparable customers pay, personalized script based on tenure and payment history
9. Build `GET /subscriptions/negotiate` — per-subscription: stage reached, alternatives (if any), negotiation brief (if applicable)
10. Build Bill Negotiation page `app/(app)/negotiate/page.tsx` — subscription list with stage indicator, alternatives panel, negotiation script drawer

**Payment Intelligence Layer**
11. Build Payment Intelligence engine:
    - *Card routing:* for each major spending category, map to the credit card in user's wallet that maximizes rewards cashback (pull card rewards structures from a maintained mapping); output category → card routing table with estimated annual rewards gain
    - *Credit card payment optimizer:* for each card, combine closing date (from pay timing engine) with current balance to compute optimal payment amount and dates to hit target utilization while preserving liquidity through the paycheck gap
12. Build `GET /insights/payment-routing` — per-category card routing recommendations + estimated annual rewards
13. Build Smart Payment Allocation engine — when paycheck deposits (inferred from transaction pattern), compute priority-ordered split: minimum payments on all cards first, then bills due within 14 days, then savings goal contribution, then discretionary; enforce configurable buffer floor so checking never drops below threshold
14. Build `POST /insights/payment-plan` — run allocation plan for given income amount
15. Build Payment Intelligence page `app/(app)/payments/page.tsx` — card routing table + paycheck allocation plan + credit payment optimizer

**Deliverable:** Decision Journal active, ROI scoring on all subscriptions, negotiation intelligence live, payment routing and allocation recommendations surfaced

---

## Phase 8 — Platform Features ⬜
*Weeks 19–20 | Bonus discovery, credit score, spending streaks*

**Goal:** Broaden ArgusAI's value beyond daily accounts into credit optimization and financial opportunity discovery.

### Steps

**Bonus Recommender**
1. Obtain Brave Search API key
2. Build `BonusSearchEngine` — query Brave Search for current checking account bonuses, credit card signup bonuses, and HYSA offers; use Claude to extract structured bonus data (institution, offer type, bonus amount, requirements, expiry); filter out institutions the user already has; cache results 24h in `ai_insights`
3. Build `GET /bonuses` — live bonus offers filtered to user's existing institutions
4. Add `BonusAgent` to LangGraph supervisor — routing keywords: bonus, signup offer, bank reward, high-yield savings
5. Build Bonus Recommender page `app/(app)/bonuses/page.tsx` — bonus cards with requirements and estimated value

**Credit Score Integration**
6. Run DB migration — create `credit_scores` table (`user_id`, `score`, `pulled_at`, `factors JSONB`); add Experian OAuth columns to `users`
7. Apply for Experian Connect API (sandbox during development)
8. Build `CreditEngine` — OAuth initiation + callback, soft-pull credit report, score history, factor breakdown (payment history, utilization, age, mix, inquiries); generate Claude-powered improvement recommendations grounded in actual account data + Pay Timing Intelligence
9. Build `POST /credit/connect`, `GET /credit/connect/callback`, `GET /credit/score`, `GET /credit/history` endpoints
10. Add `CreditAgent` to LangGraph supervisor — routing keywords: credit score, FICO, improve credit, utilization
11. Build Credit Score page `app/(app)/credit/page.tsx` — score + history chart + factor breakdown + improvement playbook

**Spending Streak Tracker**
12. Extend behavioral intelligence — track consecutive weeks where each category's spend stayed under its 90-day average; store streaks as `insight_type = 'streak'` in `ai_insights`
13. Surface streak badges on Dashboard and Behavioral Insights page — current streak length + record streak

**Deliverable:** Bonus recommender live with live web search, credit score integrated with improvement plan, spending streaks tracking and displayed

---

## Phase 9 — Production Hardening ⬜
*Weeks 21–22 | Secure, monitored, load-tested. Tag `v1.0.0`.*

**Goal:** Make the product secure, fast, and stable for real users.

### Steps
1. Security audit — verify RLS on all tables, check for IDOR vulnerabilities, SQL injection paths, Plaid token exposure in API responses, missing auth on any endpoint
2. Add per-user rate limiting via `slowapi` — 60 req/min on standard endpoints, 10 req/min on all AI endpoints
3. Add DB connection pooling via PgBouncer (Railway plugin or self-hosted)
4. Add performance indexes on hot query paths — `transactions(user_id, timestamp)`, `ai_insights(user_id, insight_type, created_at)`, `bills(user_id, next_due_date)`
5. Load test with Locust — 100 concurrent users simulating sync + copilot chat; target P95 < 500ms on non-AI paths
6. Set up Sentry (error tracking with source maps on frontend) + Axiom (structured logs from FastAPI + Celery)
7. Configure custom SMTP — Resend or Postmark via `noreply@argusai.com`; customize all Supabase auth email templates (confirm signup, password reset, magic link)
8. Surface sync reliability indicator on Accounts page — last-synced timestamp + health badge per account (green = synced <1h, amber = >6h, red = >24h or failed)
9. UI polish pass — loading skeletons on all data-dependent pages, empty states with actionable CTAs, error boundaries on every page, accessibility audit (keyboard nav, screen reader labels, color contrast)
10. Full production smoke test — link account, trigger sync, verify bills detected, subscriptions identified, analyst decisions generated, copilot responds, health score updates
11. Tag `v1.0.0`

**Deliverable:** Production-ready, fully monitored, load-tested, `v1.0.0` tagged

---

## New Files Summary (Phases 4–9)

| File | Phase | Purpose |
|---|---|---|
| `backend/migrations/011_ai_insights_embedding.sql` | 3.5 | pgvector embedding column + ivfflat index + match_insights_by_embedding() RPC |
| `backend/agents/state.py` | 3.5 | `IntelligenceState` TypedDict |
| `backend/agents/enrichment_agent.py` | 3.5 | Enrichment node — annotates bills + subscriptions |
| `backend/agents/analyst_agent.py` | 3.5 | Analyst node — reasoning session with RAG memory |
| `backend/agents/memory_agent.py` | 3.5 | Memory node — embeds decisions, upserts profile |
| `backend/agents/graph.py` | 3.5 | Compiled LangGraph `StateGraph` singleton |
| `backend/tasks/run_intelligence_pipeline.py` | 3.5 | Celery entry point wrapping graph + RAG retrieval |
| `backend/routers/insights.py` | 3.5 | `GET /insights` endpoint |
| `backend/tasks/anomaly_detection.py` | 4 | Z-score outlier + duplicate detection |
| `backend/tasks/financial_memory.py` | 4 | Financial memory timeline population |
| `backend/tasks/behavioral_intelligence.py` | 4 | Velocity, day-of-week, impulse detection |
| `backend/engines/stress_index.py` | 4 | Financial Stress Index computation |
| `backend/engines/safe_to_spend.py` | 5 | Safe to Spend daily computation |
| `backend/engines/weather_forecast.py` | 5 | Financial Weather Forecast generation |
| `backend/engines/pay_timing.py` | 5 | Credit utilization optimizer + bill stacking |
| `backend/engines/budget_strategy.py` | 5 | Bill-change adaptive budget |
| `backend/engines/risk_radar.py` | 5 | Overdraft probability + utilization alerts |
| `backend/engines/cashflow_engine.py` | 6 | 60-day probability-weighted projection |
| `backend/engines/health_score.py` | 6 | 0–100 composite health score |
| `backend/engines/debt_simulator.py` | 6 | Snowball vs. Avalanche inside cashflow |
| `backend/engines/scenario_engine.py` | 6 | What-if cashflow re-runs |
| `backend/engines/life_events.py` | 6 | Life event templates + scenario injection |
| `backend/engines/goal_planner.py` | 6 | Obstacle-aware milestone planning |
| `backend/agents/supervisor.py` | 6 | LangGraph multi-agent graph |
| `backend/agents/tools.py` | 6 | All agent tool definitions |
| `backend/routers/copilot.py` | 6 | SSE chat + decision engine endpoints |
| `backend/routers/engines.py` | 6 | Cashflow, health score, simulators |
| `backend/routers/goals.py` | 6 | Goals CRUD |
| `backend/engines/decision_journal.py` | 7 | 90-day impact tracking |
| `backend/engines/subscription_roi.py` | 7 | Usage inference + cost-per-use |
| `backend/engines/negotiation.py` | 7 | Alternatives DB + negotiation scripts |
| `backend/engines/payment_intelligence.py` | 7 | Card routing + payment optimizer |
| `backend/engines/payment_allocation.py` | 7 | Paycheck split recommendation |
| `backend/engines/bonus_search.py` | 8 | Brave Search + bonus extraction |
| `backend/engines/credit_engine.py` | 8 | Experian Connect + score analysis |
| `backend/routers/bonuses.py` | 8 | `GET /bonuses` |
| `backend/routers/credit.py` | 8 | Credit score endpoints |

## New Environment Variables (Phases 4–9)

```
# Phase 7
PAYMENT_BUFFER_FLOOR_DEFAULT=500.0

# Phase 8
BRAVE_API_KEY=
EXPERIAN_CLIENT_ID=
EXPERIAN_CLIENT_SECRET=
EXPERIAN_API_BASE_URL=https://sandbox.experian.com
EXPERIAN_REDIRECT_URI=http://localhost:8000/credit/connect/callback
```
