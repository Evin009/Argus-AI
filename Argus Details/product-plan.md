# ArgusAI — Product Implementation Plan

## Overview

11 phases. Each builds on the last. Phases 1–3.5 complete.
Phases 4+ reflect the revised feature set from product audit.

**Tech Stack**
- Backend: FastAPI (Python 3.11+), Supabase PostgreSQL, Redis + Celery
- AI: Claude Sonnet 4.6, LangGraph multi-agent, text-embedding-3-small
- Frontend: Next.js 14+, TypeScript, Tailwind CSS
- Bank Data: Plaid API
- Hosting: Vercel (frontend), Railway (backend + Celery)

---

## Phase 1 — Foundation ✅
*Weeks 1–2*

Supabase project, 8 DB tables with RLS, FastAPI skeleton, JWT auth middleware, Next.js scaffold, auth pages, GitHub Actions CI, environment variables.

**Deliverable:** Running server, working auth, deployed skeleton.

---

## Phase 1.5 — Design System ✅
*Weeks 3–4*

Color tokens, typography, component library, sidebar nav, dashboard shell, responsive breakpoints.

**Deliverable:** Design system live, all pages using shared components.

---

## Phase 2 — Bank Data Pipeline ✅
*Weeks 5–6*

Plaid Link integration, AES-256 token storage, transaction sync Celery task, embedding generation, pgvector RPC, bank linking UI, accounts page, transactions table.

**Deliverable:** User can link a bank, transactions sync, embeddings stored.

---

## Phase 3 — Intelligence Layer ✅
*Weeks 7–8*

Recurring bill detection, subscription tracking with price creep, AI categorization via Claude, bills page, bill calendar, subscriptions page, dashboard cards.

**Deliverable:** Bills and subscriptions identified, transactions categorized.

---

## Phase 3.5 — AI Intelligence Upgrade ✅
*Week 9*

LangGraph multi-agent pipeline (enrichment + analyst + memory nodes), pgvector RAG on ai_insights, user_financial_profiles table, intelligence feed page, enriched drawers on bills and subscriptions.

**Deliverable:** Analyst reasoning after every sync, behavioral profile growing over time.

---

## Phase 4 — Schema Fixes + Onboarding ⬜
*Week 10 — Immediate, unblocked*

**Goal:** Fix missing schema fields and build onboarding questionnaire before any Phase 5+ work begins.

### Schema migrations
1. Add `closing_date DATE` and `minimum_payment DECIMAL` to `accounts` table — required for Pay Timing Intelligence and Credit Intelligence Hub
2. Create `onboarding_responses` table — `user_id`, `income`, `pay_schedule`, `rent`, `major_expenses JSONB`, `goals JSONB`, `risk_tolerance TEXT`, `completed_at TIMESTAMPTZ`

### Onboarding questionnaire
3. Build 4-chapter onboarding flow (~12 questions, ~5 min):
   - Chapter 1: Income and pay schedule
   - Chapter 2: Fixed expenses (rent, car, utilities)
   - Chapter 3: Financial goals (debt payoff, savings, credit building)
   - Chapter 4: Spending nature and risk tolerance
4. Store responses to `onboarding_responses`, seed `user_financial_profiles`
5. Gate bank linking behind onboarding completion — skip option available with reminder
6. Build `POST /onboarding` and `GET /onboarding/status`
7. Build onboarding UI — stepped flow, progress indicator per chapter

**Deliverable:** Schema migrations applied, onboarding flow live, profile seeded day one.

---

## Phase 5 — Daily Intelligence ⬜
*Weeks 11–12*

**Goal:** Safe to Spend Today and Smart Payment Calendar — the two features users open every morning.

### Safe to Spend
1. Build `SafeToSpendEngine` — current balance minus bills due in 14 days, active goal contributions, configurable buffer reserve; recompute nightly via Celery beat
2. Build `GET /insights/safe-to-spend` — number + itemized breakdown
3. Add Safe to Spend as hero number on dashboard — prominent, tappable for full breakdown

### Smart Payment Calendar
4. Build Pay Timing Intelligence engine:
   - Credit utilization optimizer — infer closing dates from transaction history, compute payment amount for target utilization (8%), output `pay_by` date and `pay_amount` per card
   - Bill stacking detector — find 3-day windows where total bills exceed projected balance, output priority-ordered payment schedule with grace period awareness
5. Build `GET /insights/pay-timing` — per-card pay date and amount recommendations
6. Build merchant logo service — Clearbit Logo API primary, Plaid merchant data secondary, copper letter tile fallback; cache in DB, refresh every 90 days
7. Merge bills calendar with pay timing into unified Smart Payment Calendar `app/(app)/calendar/page.tsx`:
   - Brand logos on every entry
   - Dropdown filters: all / subscriptions / credit bills / AI-recommended dates
   - AI-recommended dates highlighted with goal context — tap for reasoning
   - Color coded by urgency
8. Build `GET /calendar` — unified feed combining bills, subscriptions, AI-recommended dates

**Deliverable:** Safe to Spend live as hero metric, Smart Payment Calendar replacing separate bills calendar.

---

## Phase 6 — Financial Profile + Copilot ⬜
*Weeks 13–14*

**Goal:** Financial Profile Page with Merchant Intelligence and AI Copilot with side panel mode.

### Financial Profile Page
1. Build `GET /profile/overview` — spending breakdown by category, habit streaks, subscription summary, health score trajectory, utilization summary
2. Build `GET /profile/merchants` — all user merchants ranked by total spend with transaction count and trend
3. Build `GET /profile/merchants/{merchant_id}` — weekly/monthly/yearly spend, frequency heatmap data, cost trend, Argus insight for that merchant
4. Build Financial Profile page `app/(app)/profile/page.tsx`:
   - Level 1: spending ring, streaks grid (GitHub-style), subscription logo grid, health score sparkline, utilization gauge, biggest spend day chart
   - Level 2: category drill-down — merchants ranked by spend within category
   - Level 3: Merchant Intelligence per merchant — charts, heatmap, cost trend, one specific insight. Dynamically generated — only exists for merchants the user actually uses.

### AI Copilot
5. Build LangGraph supervisor graph — routes to CashflowAgent, RiskAgent, DebtAgent, GoalAgent (extend existing agents package from Phase 3.5)
6. Wire all engines as agent tools in `backend/agents/tools.py`
7. Build `POST /copilot/chat` SSE streaming endpoint with RAG retrieval
8. Build Copilot page `app/(app)/copilot/page.tsx` — responds with charts, tables, verdict cards; no paragraph text responses
9. Build Copilot side panel component — slides in from right (380px), Cmd+K trigger on any screen, context-aware per current screen, conversation persists across navigation, mic activates when panel is open

**Deliverable:** Financial Profile and Merchant Intelligence live, Copilot with side panel working.

---

## Phase 7 — Simulation & Planning ⬜
*Weeks 15–17*

**Goal:** Cashflow engine, health score, scenario simulator, goal planning with recovery plans.

### Engines
1. Build `CashflowEngine` — 90-day history input, probability-weighted daily balance curve, P10/P50/P90 confidence bands, 60-day projection; `POST /engines/cashflow`
2. Build `HealthScoreEngine` — 0–100 across four dimensions (Liquidity 30%, Stability 25%, Debt Load 25%, Spending Volatility 20%), nightly computation; `GET /engines/health-score`
3. Build `ScenarioEngine` — accept modified income/expense inputs, re-run cashflow projection, return updated health score, goal timelines, risk windows; `POST /engines/scenario`
4. Build Life Events templates — 6 scenarios (car, child, house, job quit, moving, school) as parameter presets injected into ScenarioEngine
5. Build `GoalPlannerEngine` — target amount + date → monthly contribution roadmap, identifies specific shortfall months, outputs recovery adjustments; `POST /goals`, `GET /goals`
6. Build `RecoveryPlanEngine` — on goal shortfall or negative signal, generates three ranked options with exact amounts, outcome projections (goal date, Safe to Spend, health score impact); updates goal plan when option selected, triggers Guardian monitoring

### Frontend
7. Build Cashflow page `app/(app)/cashflow/page.tsx` — probability curve, confidence bands shaded, bill markers, scrub interaction, 30/60 toggle
8. Build Health Score page `app/(app)/health/page.tsx` — score ring, four dimension bars, streak contribution grid, weekly delta, milestone history, social share card generator
9. Build Scenario Simulator `app/(app)/simulator/page.tsx` — Custom tab (sliders pre-populated from real data) + Life Events tab (templates), four real-time output panels updating simultaneously
10. Build Goals page `app/(app)/goals/page.tsx` — goal cards with visual progress (UI TBD), on-track indicator, recovery plan activation, Guardian monitoring status

**Deliverable:** All simulation engines live, health score gamified, scenario simulator with life events, goal planning with recovery plans.

---

## Phase 8 — Decision Intelligence ⬜
*Weeks 18–19*

**Goal:** Subscription Alternative Detection, Card Routing, Credit Intelligence Hub.

### Subscription Alternative Detection
1. Extend subscription detection — add usage inference from transaction patterns, flag subscriptions with no usage signals in 30+ days
2. Build alternatives database — static JSON of common subscription alternatives with pricing; Brave Search for live pricing updates
3. Build `GET /subscriptions/alternatives` — unused subscriptions with alternatives and annual saving
4. Update Subscriptions page — flagged cards with brand logos, alternative shown, one-tap cancel

### Card Routing
5. Build card rewards database — rewards structure per major card issuer and category mapping
6. Build `CardRoutingEngine` — match user's connected cards to spending categories, compute optimal routing, estimate annual rewards gain
7. Build `GET /insights/card-routing` — per-category card recommendation + annual rewards estimate
8. Add Card Routing section to Financial Profile — visual card chips per category, annual rewards summary

### Credit Intelligence Hub
9. DB migration — create `credit_scores` table (`user_id`, `score`, `pulled_at`, `factors JSONB`)
10. Apply for Experian Connect API (sandbox during development)
11. Build `CreditEngine` — OAuth initiation + callback, soft-pull credit report, score history, factor breakdown, Claude-powered improvement recommendations tied to Pay Timing data
12. Build `POST /credit/connect`, `GET /credit/connect/callback`, `GET /credit/score`, `GET /credit/history`
13. Build Bonus Recommender engine — Brave Search for current card bonuses, checking bonuses, HYSA offers; Claude extracts structured data; filter out existing accounts; cache 24h
14. Build `GET /bonuses` — live bonus offers filtered to user profile
15. Build Credit Intelligence Hub `app/(app)/credit/page.tsx`:
    - Apple Wallet-style card stack — realistic card designs, stacked with peek underneath
    - Per-card: utilization gauge, balance, available credit, closing date, active offers (green chips), unused benefits (red chips)
    - Total spending power across all cards
    - Bonus Recommender section
    - Credit score + history sparkline + factor breakdown + improvement actions

**Deliverable:** Subscription alternatives live, card routing active, Credit Intelligence Hub with Apple Wallet-style cards.

---

## Phase 9 — Argus Guardian Chrome Extension ⬜
*Weeks 20–21*

**Goal:** Ambient intelligence outside the app — intercepts financial decisions at the moment they happen.

### Steps
1. Scaffold Chrome extension — manifest v3, background service worker, content script
2. Build checkout and product page detection — content script identifies checkout and product pages across major retailers
3. Build Guardian verdict API — `POST /guardian/analyze` with page context (merchant, detected amount), returns verdict, Safe to Spend, one-line reason
4. Build slide-in verdict panel — compact, visual, brand logo, one reason, Safe to Spend, tap to expand
5. Build native notification trigger — Mac/Windows native notification on checkout detection
6. Build post-purchase Plaid webhook handler — fires within seconds of transaction, generates impact analysis + recovery options
7. Build notification sensitivity settings in main app — quiet hours, minimum amount threshold, notification type controls
8. Build Guardian status card on dashboard — current highest-priority signal, last updated, active status indicator
9. Extension settings sync with main app account

**Deliverable:** Guardian extension live, checkout interception working, post-purchase recovery plans firing.

---

## Phase 10 — Desktop App ⬜
*Weeks 22–23*

**Goal:** Voice interface, wake word detection, menu bar presence, native OS notifications outside browser.

### Steps
1. Scaffold lightweight Electron or Tauri desktop app — Mac and Windows; background process only, no full UI window
2. Build menu bar icon — copper mark; click shows Safe to Spend instantly
3. Build wake word detection — on-device processing only, never sends raw audio to server; triggers voice overlay
4. Build voice overlay — floating system-level panel on top of all windows, copper branded, compact
5. Connect voice to Copilot intelligence layer — transcribe locally, send text query to API, receive visual verdict
6. Build "go deeper" voice command — overlay transitions to Copilot side panel in web app
7. Build native notification bridge — fires OS notifications even when browser is closed
8. Privacy controls — visual mic indicator always visible when active, one-click disable, no audio stored

**Deliverable:** Desktop app in menu bar, voice overlay working, native notifications outside browser.

---

## Phase 11 — Production Hardening ⬜
*Weeks 24–25*

**Goal:** Secure, monitored, load-tested. Tag v1.0.0.

### Steps
1. Security audit — RLS on all tables, IDOR vulnerabilities, Plaid token exposure in responses, missing auth on any endpoint
2. Rate limiting via slowapi — 60 req/min standard, 10 req/min AI endpoints
3. DB connection pooling — PgBouncer
4. Performance indexes — `transactions(user_id, timestamp)`, `ai_insights(user_id, insight_type, created_at)`, `bills(user_id, next_due_date)`
5. Load test with Locust — 100 concurrent users, target P95 < 500ms on non-AI paths
6. Sentry + Axiom — error tracking with source maps, structured logs from FastAPI and Celery
7. Custom SMTP — Resend or Postmark; customize all Supabase auth email templates
8. UI polish — loading skeletons on all data-dependent pages, empty states, error boundaries, accessibility audit
9. Full smoke test — link account, trigger sync, bills detected, copilot responds, health score updates, Guardian fires
10. Tag v1.0.0

**Deliverable:** Production-ready, monitored, load-tested, v1.0.0 tagged.

---

## Environment Variables (Phases 4–11)

```
# Phase 8
BRAVE_API_KEY=
EXPERIAN_CLIENT_ID=
EXPERIAN_CLIENT_SECRET=
EXPERIAN_API_BASE_URL=https://sandbox.experian.com
EXPERIAN_REDIRECT_URI=http://localhost:8000/credit/connect/callback
CLEARBIT_API_KEY=

# Phase 9
GUARDIAN_WEBHOOK_SECRET=
GUARDIAN_API_KEY=

# Phase 11
SENTRY_DSN=
AXIOM_DATASET=
AXIOM_TOKEN=
RESEND_API_KEY=
```

---

## New Files Summary (Phases 4–11)

| File | Phase | Purpose |
|---|---|---|
| `backend/migrations/012_schema_fixes.sql` | 4 | closing_date + minimum_payment on accounts |
| `backend/migrations/013_onboarding.sql` | 4 | onboarding_responses table |
| `backend/routers/onboarding.py` | 4 | POST /onboarding, GET /onboarding/status |
| `backend/engines/safe_to_spend.py` | 5 | Safe to Spend daily computation |
| `backend/engines/pay_timing.py` | 5 | Credit utilization optimizer + bill stacking |
| `backend/services/merchant_logos.py` | 5 | Clearbit + Plaid logo fetching + cache |
| `backend/routers/calendar.py` | 5 | Unified calendar feed endpoint |
| `backend/routers/profile.py` | 6 | Financial profile + merchant intelligence endpoints |
| `backend/agents/supervisor.py` | 6 | LangGraph multi-agent supervisor graph |
| `backend/agents/tools.py` | 6 | All agent tool definitions |
| `backend/routers/copilot.py` | 6 | SSE chat endpoint |
| `backend/engines/cashflow_engine.py` | 7 | 60-day probability-weighted projection |
| `backend/engines/health_score.py` | 7 | 0–100 composite health score |
| `backend/engines/scenario_engine.py` | 7 | What-if cashflow re-runs |
| `backend/engines/life_events.py` | 7 | Life event templates + scenario injection |
| `backend/engines/goal_planner.py` | 7 | Obstacle-aware milestone planning |
| `backend/engines/recovery_plan.py` | 7 | Three-option recovery plan generation |
| `backend/routers/engines.py` | 7 | Cashflow, health score, scenario endpoints |
| `backend/routers/goals.py` | 7 | Goals CRUD |
| `backend/engines/subscription_alternatives.py` | 8 | Usage inference + alternatives matching |
| `backend/engines/card_routing.py` | 8 | Rewards structure matching + routing |
| `backend/engines/credit_engine.py` | 8 | Experian Connect + score analysis |
| `backend/engines/bonus_search.py` | 8 | Brave Search + bonus extraction |
| `backend/routers/credit.py` | 8 | Credit score endpoints |
| `backend/routers/bonuses.py` | 8 | GET /bonuses |
| `chrome-extension/manifest.json` | 9 | Extension manifest v3 |
| `chrome-extension/background.js` | 9 | Service worker |
| `chrome-extension/content.js` | 9 | Page detection content script |
| `chrome-extension/panel.js` | 9 | Verdict slide-in panel |
| `backend/routers/guardian.py` | 9 | Guardian verdict + webhook endpoints |
| `desktop/src/main.js` | 10 | Electron/Tauri background process |
| `desktop/src/voice-overlay.js` | 10 | Floating voice overlay |
| `desktop/src/wake-word.js` | 10 | On-device wake word detection |
