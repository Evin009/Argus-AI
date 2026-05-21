# ArgusAI — Project Roadmap

> 22-week build plan across 9 phases. Each phase builds on the previous.

---

## Progress

| Phase | Title | Status | Weeks |
|---|---|---|---|
| Phase 1 | Foundation | ✅ Complete | 1–2 |
| Phase 1.5 | Design System | ✅ Complete | 3–4 |
| Phase 2 | Bank Data Pipeline | ✅ Complete | 5–6 |
| Phase 3 | Intelligence Layer | 🔄 In Progress | 7–8 |
| Phase 3.5 | AI Intelligence Upgrade | ⬜ Not Started | 9 |
| Phase 4 | Continuous Intelligence & Memory | ⬜ Not Started | 10–11 |
| Phase 5 | Daily Financial Pulse | ⬜ Not Started | 12–13 |
| Phase 6 | Copilot & Advanced Simulations | ⬜ Not Started | 14–16 |
| Phase 7 | Decision Intelligence | ⬜ Not Started | 17–18 |
| Phase 8 | Platform Features | ⬜ Not Started | 19–20 |
| Phase 9 | Production Hardening | ⬜ Not Started | 21–22 |

---

## Phase 1 — Foundation ✅
**Goal:** Running skeleton. Auth works, DB schema exists, CI/CD live, local dev ready.

| Deliverable | Status |
|---|---|
| FastAPI backend scaffold + JWT auth middleware | ✅ Done |
| `GET /me` and `POST /users/sync` endpoints | ✅ Done |
| Next.js 14 frontend (TypeScript + Tailwind + App Router) | ✅ Done |
| Supabase browser + server clients | ✅ Done |
| Route protection middleware | ✅ Done |
| Auth pages — login, signup, OAuth callback, verify-email | ✅ Done |
| Landing page + sidebar nav shell + settings page | ✅ Done |
| Supabase DB schema — 8 tables + RLS policies + pgvector index | ✅ Done |
| Dockerfile + docker-compose (FastAPI + Redis) | ✅ Done |
| GitHub Actions CI — ruff lint + pytest (5/5 passing) | ✅ Done |
| Frontend deployed to Vercel | ✅ Done |
| Backend deployed to Railway | ✅ Done |
| End-to-end auth flow verified on production | ✅ Done |

---

## Phase 1.5 — Design System ✅
**Goal:** Consistent, polished UI foundation before any intelligence surfaces are built.

| Deliverable | Status |
|---|---|
| Dark-mode design system — color tokens, typography scale, spacing | ✅ Done |
| Reusable component library — cards, badges, stat tiles, drawers | ✅ Done |
| Sidebar nav — icons, active states, section dividers | ✅ Done |
| Dashboard shell — layout, empty states, skeleton loaders | ✅ Done |
| Responsive layout verified across breakpoints | ✅ Done |

---

## Phase 2 — Bank Data Pipeline ✅
**Goal:** Connect bank accounts via Plaid and store all transactions.

| Deliverable | Status |
|---|---|
| Plaid Link integration (sandbox) — link token, token exchange, AES-256 encryption | ✅ Done |
| `POST /plaid/link-token`, `POST /plaid/exchange-token`, `GET /plaid/accounts`, `POST /plaid/sync` | ✅ Done |
| `GET /transactions` endpoint with pagination + category filter | ✅ Done |
| Transaction sync Celery task — Plaid `/transactions/sync`, normalize, upsert | ✅ Done |
| Embedding generation task — `text-embedding-3-small`, store in `transactions.embedding` | ✅ Done |
| Supabase RPC `match_transactions_by_embedding` for pgvector cosine search | ✅ Done |
| Accounts page — linked bank cards, Plaid Link flow, sync trigger, utilization bar | ✅ Done |
| Transactions page — paginated table, category filter, recurring badge | ✅ Done |
| Dashboard page — onboarding empty state + summary cards (balance, credit, accounts) | ✅ Done |
| `frontend/lib/api.ts` — JWT-authenticated fetch wrapper | ✅ Done |
| Celery worker added to `infra/docker-compose.yml` | ✅ Done |
| Dockerfile fixed to install from `pyproject.toml` | ✅ Done |
| Auth middleware updated to use `supabase.auth.get_user()` (RS256 compatible) | ✅ Done |
| Migration 005 — unique constraint on `plaid_items(institution_id, user_id)` | ✅ Done |
| Migration 006 — `handle_new_user` trigger + backfill for `public.users` | ✅ Done |
| 48 sandbox transactions synced with embeddings verified end-to-end | ✅ Done |
| CI green on `main` | ✅ Done |
| Celery worker deployed as separate Railway service | ✅ Done |
| Railway Redis provisioned + wired to API and Celery worker | ✅ Done |
| Production smoke test passed on `argus-ai-baqq.vercel.app` | ✅ Done |

---

## Phase 3 — Intelligence Layer 🔄
**Goal:** Detect patterns, categorize spending, surface subscriptions and bills.

| Deliverable | Status |
|---|---|
| Recurring bill detection engine — merchant + amount pattern matching | ✅ Done |
| Subscription tracker + price creep detection (vs 3 months ago) | ✅ Done |
| AI-powered transaction categorization — Claude few-shot classification | ✅ Done |
| `GET /bills`, `GET /subscriptions` endpoints | ✅ Done |
| Bills page with urgency colors and next due dates | ✅ Done |
| Bills Calendar — monthly view, color-coded by urgency | ✅ Done |
| Subscriptions page with price creep badges and monthly total | ✅ Done |
| Dashboard updated with upcoming bills + subscription cards | ✅ Done |
| CI green on `main` | ⬜ Pending |

---

## Phase 3.5 — AI Intelligence Upgrade ⬜
**Goal:** Transform the intelligence layer from statistics + classification into a reasoning financial analyst with persistent memory.

| Deliverable | Status |
|---|---|
| Migration 010 — `ai_enrichment JSONB` on bills + subscriptions; `user_financial_profiles` table with RLS | ⬜ Pending |
| `enrich_detected_records` Celery task — Layer 1, one Claude call per sync, annotates all bills + subscriptions | ⬜ Pending |
| `synthesize_insights` Celery task — Layer 2, analyst reasoning session with three-tier memory | ⬜ Pending |
| Analyst persona system prompt with Anthropic prompt caching | ⬜ Pending |
| Episodic memory — last 5 `ai_insights` rows injected into analyst context | ⬜ Pending |
| Long-term profile — Claude writes behavioral patterns to `user_financial_profiles` after every session | ⬜ Pending |
| Updated Celery task chain: sync → detect_bills → detect_subscriptions → enrich → synthesize | ⬜ Pending |
| `GET /insights` endpoint — analyst decisions feed with `?signal_type=` + `?limit=` filters | ⬜ Pending |
| Intelligence Feed page — `app/(app)/intelligence/page.tsx` — cards grouped by signal type | ⬜ Pending |
| Dashboard "Latest Intelligence" card — 2 most recent warning/critical decisions | ⬜ Pending |
| Bills enrichment drawer — click any bill to see Layer 1 analyst annotations | ⬜ Pending |
| Subscriptions enrichment drawer — click any subscription to see annotations + cancel recommendation | ⬜ Pending |
| CI green on `main` | ⬜ Pending |

---

## Phase 4 — Continuous Intelligence & Memory ⬜
**Goal:** Anomaly detection, full RAG on insights history, financial memory timeline, and continuous briefing engine.

| Deliverable | Status |
|---|---|
| Anomaly detection — z-score outlier flagging, duplicate charge detection, foreign transaction flags | ⬜ Pending |
| RAG pipeline upgrade — pgvector similarity search on `ai_insights` for richer episodic memory | ⬜ Pending |
| `Financial Memory Timeline` — auto-generated chronological ledger of significant financial events | ⬜ Pending |
| Continuous Intelligence Briefing — brief fires after every significant event, not monthly schedule | ⬜ Pending |
| Behavioral Spending Intelligence — velocity spikes, day-of-week patterns, impulse cluster detection | ⬜ Pending |
| Financial Stress Index — pressure label (Low / Moderate / High / Critical) derived from balance ratio, days to next income, spending volatility | ⬜ Pending |
| `GET /insights/memory` endpoint — paginated financial memory timeline | ⬜ Pending |
| `GET /insights/stress` endpoint — current stress index with contributing factors | ⬜ Pending |
| Memory Timeline page — `app/(app)/memory/page.tsx` | ⬜ Pending |
| Behavioral Insights page — `app/(app)/behavioral/page.tsx` | ⬜ Pending |
| Financial Stress Index card on Dashboard | ⬜ Pending |
| CI green on `main` | ⬜ Pending |

---

## Phase 5 — Daily Financial Pulse ⬜
**Goal:** Features users open every morning — Safe to Spend, Weather Forecast, Pay Timing Intelligence, and Risk Radar.

| Deliverable | Status |
|---|---|
| Safe to Spend Today engine — daily number after subtracting committed bills, savings goals, buffer reserve | ⬜ Pending |
| Financial Weather Forecast — human-readable 7-day and 30-day risk narrative using weather metaphors | ⬜ Pending |
| Pay Timing Intelligence — credit utilization optimizer (closing date vs. due date) + bill stacking detector | ⬜ Pending |
| Budget Strategy from Bill Changes — adaptive budget recalculation when any bill changes + 3 absorption options | ⬜ Pending |
| `RiskRadarEngine` — overdraft probability scoring, utilization alerts, upcoming bill warnings, fires into `ai_insights` | ⬜ Pending |
| `GET /insights/safe-to-spend` — daily safe spend calculation with breakdown | ⬜ Pending |
| `GET /insights/weather` — 30-day financial weather forecast | ⬜ Pending |
| `GET /insights/pay-timing` — optimal pay dates + amounts per credit card | ⬜ Pending |
| `GET /insights/risk` — Risk Radar alerts ordered by severity | ⬜ Pending |
| Safe to Spend widget prominent on Dashboard — large number with breakdown | ⬜ Pending |
| Weather Forecast page — `app/(app)/forecast/page.tsx` | ⬜ Pending |
| Risk Radar page — `app/(app)/risk/page.tsx` | ⬜ Pending |
| Pay Timing card on Dashboard | ⬜ Pending |
| CI green on `main` | ⬜ Pending |

---

## Phase 6 — Copilot & Advanced Simulations ⬜
**Goal:** Full AI copilot, all simulation engines, financial health scoring, and goal planning.

| Deliverable | Status |
|---|---|
| `CashflowEngine` — 30–60 day forward balance projection with probability-weighted confidence bands | ⬜ Pending |
| `HealthScoreEngine` — 0–100 composite score across 4 dimensions (Liquidity, Stability, Debt Load, Spending Volatility), updates daily | ⬜ Pending |
| `DebtSimulator` — Snowball vs. Avalanche run inside cashflow engine — shows cash-safe strategy, not just math-optimal | ⬜ Pending |
| `ScenarioEngine` — re-runs cashflow with modified income/expense sliders, real-time impact on Health Score + goals | ⬜ Pending |
| Life Event Simulator — templates for marriage, child, house, job change, sabbatical, relocation, school | ⬜ Pending |
| Obstacle-Aware Goal Planning — target + date → milestone roadmap with identified shortfall months + recovery plan | ⬜ Pending |
| AI Decision Engine — `POST /copilot/decide` — structured affordability analysis with downstream simulation | ⬜ Pending |
| LangGraph multi-agent system — Supervisor + CashflowAgent + RiskAgent + DebtAgent + GoalAgent | ⬜ Pending |
| `POST /copilot/chat` SSE streaming endpoint wired to real agents + RAG | ⬜ Pending |
| `GET /engines/cashflow` — 60-day balance curve with confidence bands | ⬜ Pending |
| `GET /engines/health-score` — current score + dimension breakdown | ⬜ Pending |
| `POST /engines/debt-sim` — Snowball vs. Avalanche schedule + cashflow safety analysis | ⬜ Pending |
| `POST /engines/scenario` — re-run forecast with modified inputs | ⬜ Pending |
| Cashflow page — `app/(app)/cashflow/page.tsx` — probability curve + confidence bands | ⬜ Pending |
| Health Score page — `app/(app)/health/page.tsx` — score + 4-dimension breakdown | ⬜ Pending |
| Debt Simulator page — `app/(app)/debt/page.tsx` | ⬜ Pending |
| Scenario Simulator page — `app/(app)/simulator/page.tsx` | ⬜ Pending |
| Life Event Simulator page — `app/(app)/life-events/page.tsx` | ⬜ Pending |
| Goals page — `app/(app)/goals/page.tsx` — obstacle-aware milestone tracking | ⬜ Pending |
| AI Copilot page — `app/(app)/copilot/page.tsx` — streaming chat | ⬜ Pending |
| CI green on `main` | ⬜ Pending |

---

## Phase 7 — Decision Intelligence ⬜
**Goal:** Close the loop between insight and action — journals, ROI scoring, negotiation intelligence, and payment routing.

| Deliverable | Status |
|---|---|
| AI Decision Journal — log major financial commitments, 90–180 day impact tracking + check-in reports | ⬜ Pending |
| Subscription ROI Scoring — infer usage from transaction patterns, compute cost-per-use, flag low-ROI subscriptions | ⬜ Pending |
| Bill Negotiation + Alternative Detection — 3-stage: usage analysis → cheaper alternatives → negotiation script with timing | ⬜ Pending |
| Payment Intelligence Layer — card routing optimizer (which card for which category) + credit card payment optimizer (closing date aware) | ⬜ Pending |
| Smart Payment Allocation — paycheck split recommendation: cards, bills, savings, discretionary with buffer floor | ⬜ Pending |
| `POST /decisions/journal` — log a financial decision | ⬜ Pending |
| `GET /decisions/journal` — all logged decisions with downstream impact reports | ⬜ Pending |
| `GET /subscriptions/roi` — subscriptions with ROI scores and cost-per-use | ⬜ Pending |
| `GET /subscriptions/negotiate` — negotiation intelligence per subscription | ⬜ Pending |
| `GET /insights/payment-routing` — card-to-category routing recommendations | ⬜ Pending |
| `POST /insights/payment-plan` — paycheck allocation plan | ⬜ Pending |
| Decision Journal page — `app/(app)/journal/page.tsx` — logged decisions + 90-day impact timeline | ⬜ Pending |
| Bill Negotiation page — `app/(app)/negotiate/page.tsx` — ROI scores + alternatives + scripts | ⬜ Pending |
| Payment Intelligence page — `app/(app)/payments/page.tsx` — card routing + paycheck split | ⬜ Pending |
| ROI badges added to Subscriptions page | ⬜ Pending |
| CI green on `main` | ⬜ Pending |

---

## Phase 8 — Platform Features ⬜
**Goal:** Bonus discovery, credit score integration, and spending streak tracking.

| Deliverable | Status |
|---|---|
| Bonus Recommender — Brave Search + Claude extracts current checking/card/savings bonuses tailored to user's profile | ⬜ Pending |
| Credit Score Integration — Experian Connect soft-pull, score history, factor breakdown, Claude-powered improvement recommendations | ⬜ Pending |
| Spending Streak Tracker — consecutive weeks under budget per category; stored as `insight_type = 'streak'` | ⬜ Pending |
| `BonusAgent` added to multi-agent supervisor | ⬜ Pending |
| `CreditAgent` added to multi-agent supervisor | ⬜ Pending |
| `GET /bonuses` — live bonus offers filtered to user's profile | ⬜ Pending |
| `GET /credit/score` + `GET /credit/history` + `POST /credit/connect` endpoints | ⬜ Pending |
| Bonus Recommender page — `app/(app)/bonuses/page.tsx` | ⬜ Pending |
| Credit Score page — `app/(app)/credit/page.tsx` — score + history + improvement plan | ⬜ Pending |
| Streak badges visible on Dashboard and Behavioral Insights page | ⬜ Pending |
| CI green on `main` | ⬜ Pending |

---

## Phase 9 — Production Hardening ⬜
**Goal:** Secure, monitored, rate-limited, load-tested. Tag `v1.0.0`.

| Deliverable | Status |
|---|---|
| Security audit — RLS on all tables, IDOR checks, SQL injection, Plaid token exposure | ⬜ Pending |
| Per-user rate limiting — `slowapi`, 60/min standard, 10/min AI endpoints | ⬜ Pending |
| DB connection pooling via PgBouncer | ⬜ Pending |
| Performance indexes on hot query paths | ⬜ Pending |
| Load testing with Locust — 100 concurrent users, P95 < 500ms | ⬜ Pending |
| Sentry (error tracking) + Axiom (structured logs) | ⬜ Pending |
| Custom branded email — Resend/Postmark via `noreply@argusai.com`, all Supabase auth templates customized | ⬜ Pending |
| Sync reliability indicator per account — last-synced timestamp + health badge (green/amber/red) | ⬜ Pending |
| UI polish — loading states, empty states, error boundaries, accessibility pass | ⬜ Pending |
| Full production smoke test | ⬜ Pending |
| Tag `v1.0.0` | ⬜ Pending |
