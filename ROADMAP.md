# ArgusAI — Project Roadmap

> 16-week build plan across 8 phases. Each phase builds on the previous.

---

## Progress

| Phase | Status | Weeks |
|---|---|---|
| Phase 1 — Foundation | ✅ Complete | 1–2 |
| Phase 2 — Bank Data Pipeline | ✅ Complete | 3–4 |
| Phase 3 — Intelligence Layer | 🔄 In Progress | 5–6 |
| Phase 3.5 — AI Intelligence Upgrade | ⬜ Not Started | 7 |
| Phase 4 — AI Reports | ⬜ Not Started | 8–9 |
| Phase 5 — Copilot + Simulations | ⬜ Not Started | 10–11 |
| Phase 6 — New Features | ⬜ Not Started | 12–13 |
| Phase 7 — Production Hardening | ⬜ Not Started | 14–16 |

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
| `user_financial_profiles` table + RLS | ⬜ Pending |
| `bills.ai_enrichment` + `subscriptions.ai_enrichment` JSONB columns | ⬜ Pending |
| `enrich_detected_records` Celery task — Layer 1, one Claude call per sync | ⬜ Pending |
| `synthesize_insights` Celery task — Layer 2, analyst reasoning session | ⬜ Pending |
| Analyst persona system prompt with prompt caching | ⬜ Pending |
| Episodic memory — pgvector retrieval of past insights injected into analyst context | ⬜ Pending |
| Long-term profile — Claude writes back behavioral patterns after each session | ⬜ Pending |
| `GET /insights` endpoint — analyst decisions feed | ⬜ Pending |
| Intelligence Feed page — `app/(app)/intelligence/page.tsx` | ⬜ Pending |
| Dashboard "Latest Intelligence" card | ⬜ Pending |
| Bills + subscriptions enrichment drawer | ⬜ Pending |
| CI green on `main` | ⬜ Pending |

---

## Phase 4 — AI Reports ⬜
**Goal:** Surface anomalies, build RAG pipeline, generate monthly reports.

- Anomaly detection (z-score outlier flagging, duplicate detection)
- RAG retrieval pipeline (pgvector cosine search via `RAGRetriever`)
- Monthly report generator — Celery task, Claude + RAG context, stored in `ai_insights`
- Reports index + individual report pages

---

## Phase 5 — Copilot + Simulations ⬜
**Goal:** All AI intelligence systems live — Copilot, engines, Health Score, Risk Radar, simulators.

- `CashflowEngine` — 30–60 day forward balance projection with confidence bands
- `DebtSimulator` — Snowball vs. Avalanche with month-by-month payoff schedules
- `HealthScoreEngine` — 0–100 composite score across 4 dimensions, updates daily
- `RiskRadarEngine` — overdraft probability, utilization alerts, upcoming bill warnings
- `ScenarioEngine` — re-runs cashflow with modified income/expense inputs
- Goal-Based AI Savings Planner — target + date → monthly milestone roadmap
- Multi-agent system (LangGraph — Supervisor + CashflowAgent + RiskAgent + DebtAgent)
- `POST /copilot/chat` SSE streaming endpoint
- All intelligence pages: Cashflow, Risk Radar, Health Score, Copilot, Goals, Behavioral Insights, Simulators

---

## Phase 6 — New Features ⬜
**Goal:** Add three differentiating intelligence features.

**Smart Payment Allocation**
- `PaymentAllocationEngine` — priority-ordered allocation across cards, bills, savings with buffer floor
- Integrated as `PaymentAgent` in multi-agent supervisor

**Bonus Recommender**
- `BonusSearchEngine` — Brave Search API + Claude to extract structured bonus offers
- Filters institutions user already has, caches 24h
- Integrated as `BonusAgent` in multi-agent supervisor

**Credit Score**
- Experian Connect API integration (sandbox → development)
- Soft-pull credit report, score history, Claude-powered recommendations
- Integrated as `CreditAgent` in multi-agent supervisor

---

## Phase 7 — Production Hardening ⬜
**Goal:** Secure, monitored, rate-limited, load-tested, fully deployed. Tag `v1.0.0`.

- Security audit (RLS, auth, IDOR, SQL injection, Plaid token exposure)
- Sync reliability indicator per account — last-synced timestamp + health badge (green/amber/red)
- Per-user rate limiting (`slowapi` — 60/min standard, 10/min AI endpoints)
- DB connection pooling via PgBouncer
- Performance indexes on hot query paths
- Load testing with Locust (100 concurrent users, P95 < 500ms)
- Sentry (error tracking) + Axiom (logs)
- Custom transactional email via SMTP (Resend/Postmark) — replace Supabase default with branded `noreply@argusai.com`
- UI polish — loading states, empty states, error boundaries, accessibility
- Full production smoke test
- Tag `v1.0.0`
