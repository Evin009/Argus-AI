# ArgusAI — Product Implementation Plan

## Overview

12 phases. Each builds on the last. Phases 1–3.5 complete.
Phases 4+ reflect the revised feature set from the product audit, including the Argus brain reframe (see `product-detail.md`).

**Key structural change from the prior plan:** Argus (formerly "AI Copilot") is no longer a single feature shipped mid-roadmap. It is core infrastructure built early (Phase 5) and extended with new tools as each later engine ships — Cashflow, Goal Planning, Card Routing, and Credit Intelligence each register themselves as new capabilities Argus can call on, rather than Argus waiting until everything exists.

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

## Phase 4 — Schema Fixes + Onboarding ✅
*Week 10 — Immediate, unblocked*

**Goal:** Fix missing schema fields and build onboarding questionnaire before any Phase 5+ work begins.

**Shipped — diverged from the original spec below as the build progressed; see `Phase Plans/Phase_4_SchemaOnboarding.md` for the full history:**
- 10-chapter onboarding flow (expanded twice from the original 4 — added Debt/behavioral fields, then split dense chapters for uniform card sizing)
- Bank linking moved from "gated behind onboarding completion" to a **mandatory Connect Accounts step inside onboarding itself**, using Plaid Link directly — Plaid Liabilities wired up so balance/APR/minimum payment are fetched automatically instead of typed by hand. Manual debt entry survives only as a fallback toggle for accounts Plaid can't see.
- `closing_date`, `minimum_payment`, and `interest_rate` added to `accounts`; `onboarding_responses` table with the originally-spec'd fields plus debt/behavioral/risk fields from the expansion

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

## Phase 5 — Argus Brain: Skeleton ⬜
*Weeks 11–12*

**Goal:** Stand up Argus as living infrastructure early — alive with whatever tools exist today, built to grow as later phases add engines. This is the most important phase in the remaining roadmap; everything after this is Argus gaining new senses.

### Core brain
1. Build LangGraph supervisor graph — routes queries to specialist agents; starts with whatever agents have real tools (categorization, bills, subscriptions from Phase 3.5)
2. Build `backend/agents/tools.py` registry — a pattern for registering new engine tools as they ship in later phases, so Argus's toolset grows without rearchitecting
3. Build outcome ledger — `ai_predictions` table (`user_id`, `prediction_type`, `prediction_payload JSONB`, `predicted_at`, `resolves_at`, `actual_outcome JSONB`, `was_accurate BOOLEAN`). Every prediction or recommendation Argus makes gets logged here.
4. Build outcome-resolution Celery task — runs periodically, checks unresolved predictions against actual transaction/balance data, fills in `actual_outcome` and `was_accurate`
5. Wire outcome ledger into RAG retrieval — when reasoning about a new decision, Argus retrieves its own relevant past predictions and their accuracy for that user, feeding calibration into its response
6. Build `POST /argus/chat` SSE streaming endpoint with RAG retrieval (hot transactions + distilled summaries + profile + outcome ledger)

### Frontend
7. Build Argus chat page `app/(app)/argus/page.tsx` — responds with charts, tables, verdict cards; no paragraph-only responses
8. Build Argus side panel component — slides in from right (380px), Cmd+K trigger on any screen, context-aware per current screen, conversation persists across navigation

**Deliverable:** Argus alive and answering questions with its current toolset, logging predictions, and ready to absorb new tools as later phases ship.

---

## Phase 6 — Daily Intelligence ⬜
*Weeks 13–14*

**Goal:** Safe to Spend Today and Smart Payment Calendar — the two features users open every morning. Both register as new Argus tools on completion.

### Safe to Spend
1. Build `SafeToSpendEngine` — current balance minus bills due before next payday (dynamic window from `onboarding_responses.pay_schedule`, not a fixed day count), active goal contributions, buffer reserve (AI-suggested starting value from early spending volatility or a sane default, user-overridable in settings); recompute nightly via Celery beat
2. Build `GET /insights/safe-to-spend` — number + itemized breakdown
3. Add Safe to Spend as hero number on dashboard — prominent, tappable for full breakdown
4. Register Safe to Spend as an Argus tool

### Smart Payment Calendar
5. Build Pay Timing Intelligence engine:
   - Credit utilization optimizer — infer closing dates from transaction history, compute payment amount for target utilization (8%), output `pay_by` date and `pay_amount` per card
   - Bill stacking detector — find 3-day windows where total bills exceed projected balance, output priority-ordered payment schedule with grace period awareness
6. Build `GET /insights/pay-timing` — per-card pay date and amount recommendations
7. Build merchant logo service — Clearbit Logo API primary, Plaid merchant data secondary, copper letter tile fallback; cache in DB, refresh every 90 days
8. Merge bills calendar with pay timing into unified Smart Payment Calendar `app/(app)/calendar/page.tsx`:
   - Brand logos on every entry
   - Dropdown filters: all / subscriptions / credit bills / AI-recommended dates
   - AI-recommended dates highlighted with goal context — tap for Argus's reasoning
   - Color coded by urgency
9. Build `GET /calendar` — unified feed combining bills, subscriptions, AI-recommended dates
10. Register Pay Timing as an Argus tool

**Deliverable:** Safe to Spend live as hero metric, Smart Payment Calendar replacing separate bills calendar, both reasoned over by Argus.

---

## Phase 6.5 — UI Design Overhaul ⬜
*After Phase 6*

**Goal:** Bring every app page into the Argus design language. Pages were built functional-first with zero token usage. This phase makes the product look cohesive before Phase 7 ships new surfaces.

Pages redesigned: login, signup, verify-email, transactions, bills, bills calendar, subscriptions, accounts, settings, intelligence feed, Argus chat page + response cards, Argus side panel.

**Deliverable:** Every page uses design tokens consistently — no raw color/spacing utilities, typography scale applied everywhere, side panel visually matches the main chat page.

---

## Phase 7 — Financial Profile + Guardian ⬜
*Weeks 15–16*

**Goal:** Financial Profile Page with Merchant Intelligence, and Argus Guardian Chrome extension — Argus's first ambient surface.

### Financial Profile Page
1. Build `GET /profile/overview` — spending breakdown by category, habit streaks, subscription summary, utilization summary
2. Build `GET /profile/merchants` — all user merchants ranked by total spend with transaction count and trend
3. Build `GET /profile/merchants/{merchant_id}` — weekly/monthly/yearly spend, frequency heatmap data, cost trend, Argus insight for that merchant
4. Build Financial Profile page `app/(app)/profile/page.tsx`:
   - Level 1: spending ring, streaks grid (GitHub-style), subscription logo grid, utilization gauge, biggest spend day chart
   - Level 2: category drill-down — merchants ranked by spend within category
   - Level 3: Merchant Intelligence per merchant — charts, heatmap, cost trend, one specific insight. Dynamically generated — only exists for merchants the user actually uses.
5. Register profile/merchant data as Argus tools

### Argus Guardian (Chrome Extension)
6. Scaffold Chrome extension — manifest v3, background service worker, content script
7. Build checkout and product page detection — content script identifies checkout and product pages across major retailers
8. Build Guardian verdict API — `POST /guardian/analyze` with page context (merchant, detected amount), routes through Argus, returns verdict, Safe to Spend, one-line reason
9. Build slide-in verdict panel — compact, visual, brand logo, one reason, Safe to Spend, tap to expand
10. Build native notification trigger — Mac/Windows native notification on checkout detection
11. Build post-purchase Plaid webhook handler — fires within seconds of transaction, generates impact analysis + recovery options via Argus
12. Build notification sensitivity settings in main app — quiet hours, minimum amount threshold, notification type controls
13. Build Guardian status card on dashboard — current highest-priority signal, last updated, active status indicator
14. Extension settings sync with main app account

**Deliverable:** Financial Profile and Merchant Intelligence live, Argus Guardian intercepting checkout decisions in the browser.

---

## Phase 8 — Simulation & Goal Planning ⬜
*Weeks 17–18*

**Goal:** Cashflow engine and goal planning with recovery plans. No dedicated Scenario Simulator UI — "what if" questions are answered by Argus in chat using the same engine.

### Engines
1. Build `CashflowEngine` — 90-day history input, probability-weighted daily balance curve, P10/P50/P90 confidence bands, 60-day projection; `POST /engines/cashflow`
2. Build `ScenarioEngine` — accept modified income/expense inputs, re-run cashflow projection, return updated goal timelines and risk windows; callable only as an Argus tool (no standalone UI) — this is how "what if I lose $500/month" gets answered in chat
3. Build Life Events presets — 6 scenarios (car, child, house, job quit, moving, school) as parameter presets Argus can apply when a user references one conversationally
4. Build `GoalPlannerEngine` — target amount + date → monthly contribution roadmap, identifies specific shortfall months, outputs recovery adjustments; `POST /goals`, `GET /goals`
5. Build `RecoveryPlanEngine` — on goal shortfall or negative signal, generates three ranked options with exact amounts, outcome projections (goal date, Safe to Spend impact); updates goal plan when option selected, triggers ambient monitoring
6. Register Cashflow, Scenario, Goal Planner, and Recovery Plan as Argus tools

### Frontend
7. Build Cashflow page `app/(app)/cashflow/page.tsx` — probability curve, confidence bands shaded, bill markers, scrub interaction, 30/60 toggle
8. Build Goals page `app/(app)/goals/page.tsx` — goal cards with visual progress (UI TBD), on-track indicator, recovery plan activation, ambient monitoring status

**Deliverable:** Cashflow forecasting live with a dedicated page, "what if" questions answerable via Argus chat with no separate simulator screen, goal planning with recovery plans live.

---

## Phase 9 — Decision Intelligence ⬜
*Weeks 19–20*

**Goal:** Subscription Alternative Detection and Credit Intelligence Hub (which now includes Card Routing — no longer a standalone feature).

### Subscription Alternative Detection
1. Extend subscription detection — add usage inference from transaction patterns, flag subscriptions with no usage signals in 30+ days
2. Build alternatives database — static JSON of common subscription alternatives with pricing; Brave Search for live pricing updates
3. Build `GET /subscriptions/alternatives` — unused subscriptions with alternatives and annual saving
4. Update existing Subscriptions page — flagged cards with brand logos, alternative shown, one-tap cancel (no new page)
5. Register subscription alternatives as an Argus tool

### Credit Intelligence Hub (includes Card Routing)
6. DB migration — create `credit_scores` table (`user_id`, `score`, `pulled_at`, `factors JSONB`)
7. Apply for Experian Connect API (sandbox during development)
8. Build `CreditEngine` — OAuth initiation + callback, soft-pull credit report, score history, factor breakdown, Argus-powered improvement recommendations tied to Pay Timing data
9. Build `POST /credit/connect`, `GET /credit/connect/callback`, `GET /credit/score`, `GET /credit/history`
10. Build card rewards database — rewards structure per major card issuer and category mapping
11. Build `CardRoutingEngine` — match user's connected cards to spending categories, compute optimal routing continuously in the background, estimate annual rewards gain
12. Build `GET /insights/card-routing` — per-category card recommendation + annual rewards estimate
13. Wire Card Routing into Guardian verdict API (Phase 7) — overlay shows best card to use at point of purchase
14. Wire Card Routing into Subscriptions/Bills pages — inline "use this card" recommendation per upcoming payment
15. Build Bonus Recommender engine — Brave Search for current card bonuses, checking bonuses, HYSA offers; Argus extracts structured data; filter out existing accounts; cache 24h
16. Build `GET /bonuses` — live bonus offers filtered to user profile
17. Build Credit Intelligence Hub `app/(app)/credit/page.tsx`:
    - Apple Wallet-style card stack — realistic card designs, stacked with peek underneath
    - Selecting a card dynamically opens its dedicated per-card page: utilization gauge, balance, available credit, closing date, active offers (green chips), unused benefits (red chips), category routing breakdown for that card
    - Total spending power across all cards
    - Bonus Recommender section
    - Credit score + history sparkline + factor breakdown + improvement actions
18. Register credit score, card routing, and bonus data as Argus tools

**Deliverable:** Subscription alternatives live, Credit Intelligence Hub with dynamic per-card pages including card routing, card routing surfaced at checkout (Guardian) and in-app (Subscriptions/Bills).

---

## Phase 10 — Desktop App ⬜
*Weeks 21–22*

**Goal:** Voice interface, wake word detection, menu bar presence, native OS notifications outside browser — Argus's ambient surface on desktop.

### Steps
1. Scaffold lightweight Electron or Tauri desktop app — Mac and Windows; background process only, no full UI window
2. Build menu bar icon — copper mark; click shows Safe to Spend instantly
3. Build wake word detection — on-device processing only, never sends raw audio to server; triggers voice overlay
4. Build voice overlay — floating system-level panel on top of all windows, copper branded, compact
5. Connect voice to Argus — transcribe locally, send text query to `/argus/chat`, receive visual verdict
6. Build "go deeper" voice command — overlay transitions to Argus side panel in web app
7. Build native notification bridge — fires OS notifications even when browser is closed
8. Privacy controls — visual mic indicator always visible when active, one-click disable, no audio stored

**Deliverable:** Desktop app in menu bar, voice overlay working, native notifications outside browser.

---

## Phase 11 — Production Hardening ⬜
*Weeks 23–24*

**Goal:** Secure, monitored, load-tested. Tag v1.0.0.

### Steps
1. Security audit — RLS on all tables, IDOR vulnerabilities, Plaid token exposure in responses, missing auth on any endpoint
2. Rate limiting via slowapi — 60 req/min standard, 10 req/min AI endpoints
3. DB connection pooling — PgBouncer
4. Performance indexes — `transactions(user_id, timestamp)`, `ai_insights(user_id, insight_type, created_at)`, `bills(user_id, next_due_date)`, `ai_predictions(user_id, resolves_at)`
5. Load test with Locust — 100 concurrent users, target P95 < 500ms on non-AI paths
6. Sentry + Axiom — error tracking with source maps, structured logs from FastAPI and Celery
7. Custom SMTP — Resend or Postmark; customize all Supabase auth email templates
8. UI polish — loading skeletons on all data-dependent pages, empty states, error boundaries, accessibility audit
9. Full smoke test — link account, trigger sync, bills detected, Argus responds, Guardian fires, outcome ledger resolves correctly
10. Tag v1.0.0

**Deliverable:** Production-ready, monitored, load-tested, v1.0.0 tagged.

---

## Cut / Folded from Prior Plan

| Item | Disposition |
|---|---|
| `backend/engines/health_score.py`, `backend/routers/engines.py` health-score routes, Health Score page | **Removed.** Feature cut entirely — see product-detail.md. |
| `app/(app)/simulator/page.tsx`, dedicated Scenario Simulator UI | **Removed as a page.** `ScenarioEngine` still built (Phase 8), but only callable as an Argus tool — no standalone screen. |
| Card Routing as a standalone section/page | **Merged** into Credit Intelligence Hub (Phase 9) — lives on the per-card page plus Guardian and Subscriptions/Bills surfaces. |
| `backend/routers/copilot.py`, "Copilot" naming throughout | **Renamed** to Argus (`backend/routers/argus.py`, `/argus/chat`) and moved to Phase 5 as early infrastructure instead of a single late-phase feature. |

---

## Environment Variables (Phases 4–11)

```
# Phase 9
BRAVE_API_KEY=
EXPERIAN_CLIENT_ID=
EXPERIAN_CLIENT_SECRET=
EXPERIAN_API_BASE_URL=https://sandbox.experian.com
EXPERIAN_REDIRECT_URI=http://localhost:8000/credit/connect/callback
CLEARBIT_API_KEY=

# Phase 7
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
| `backend/agents/supervisor.py` | 5 | LangGraph multi-agent supervisor graph |
| `backend/agents/tools.py` | 5 | Tool registry — new engines register themselves here as they ship |
| `backend/migrations/014_outcome_ledger.sql` | 5 | ai_predictions table |
| `backend/tasks/resolve_predictions.py` | 5 | Celery task — checks predictions against actual outcomes |
| `backend/routers/argus.py` | 5 | POST /argus/chat SSE endpoint |
| `backend/engines/safe_to_spend.py` | 6 | Safe to Spend daily computation, dynamic payday window |
| `backend/engines/pay_timing.py` | 6 | Credit utilization optimizer + bill stacking |
| `backend/services/merchant_logos.py` | 6 | Clearbit + Plaid logo fetching + cache |
| `backend/routers/calendar.py` | 6 | Unified calendar feed endpoint |
| `backend/routers/profile.py` | 7 | Financial profile + merchant intelligence endpoints |
| `chrome-extension/manifest.json` | 7 | Extension manifest v3 |
| `chrome-extension/background.js` | 7 | Service worker |
| `chrome-extension/content.js` | 7 | Page detection content script |
| `chrome-extension/panel.js` | 7 | Verdict slide-in panel |
| `backend/routers/guardian.py` | 7 | Guardian verdict + webhook endpoints |
| `backend/engines/cashflow_engine.py` | 8 | 60-day probability-weighted projection |
| `backend/engines/scenario_engine.py` | 8 | What-if cashflow re-runs, Argus-tool only |
| `backend/engines/life_events.py` | 8 | Life event presets for Argus to apply conversationally |
| `backend/engines/goal_planner.py` | 8 | Obstacle-aware milestone planning |
| `backend/engines/recovery_plan.py` | 8 | Three-option recovery plan generation |
| `backend/routers/engines.py` | 8 | Cashflow, scenario endpoints |
| `backend/routers/goals.py` | 8 | Goals CRUD |
| `backend/engines/subscription_alternatives.py` | 9 | Usage inference + alternatives matching |
| `backend/engines/card_routing.py` | 9 | Rewards structure matching + background routing computation |
| `backend/engines/credit_engine.py` | 9 | Experian Connect + score analysis |
| `backend/engines/bonus_search.py` | 9 | Brave Search + bonus extraction |
| `backend/routers/credit.py` | 9 | Credit score + per-card endpoints |
| `backend/routers/bonuses.py` | 9 | GET /bonuses |
| `desktop/src/main.js` | 10 | Electron/Tauri background process |
| `desktop/src/voice-overlay.js` | 10 | Floating voice overlay |
| `desktop/src/wake-word.js` | 10 | On-device wake word detection |
