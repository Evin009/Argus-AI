# ArgusAI — Project Roadmap

> 12-week build plan across 6 phases. Each phase builds on the previous.

---

## Progress

| Phase | Status | Weeks |
|---|---|---|
| Phase 1 — Foundation | ✅ Complete | 1–2 |
| Phase 2 — Plaid Data Pipeline | ⬜ Not Started | 3–4 |
| Phase 3 — Intelligence Layer | ⬜ Not Started | 5–6 |
| Phase 4 — AI Reports | ⬜ Not Started | 7–8 |
| Phase 5 — Copilot + Simulations | ⬜ Not Started | 9–10 |
| Phase 6 — Production Hardening | ⬜ Not Started | 11–12 |

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
| Backend deployed to Railway | ⬜ Pending |
| End-to-end auth flow verified on production | ⬜ Pending |

---

## Phase 2 — Plaid Data Pipeline ⬜
**Goal:** Real bank accounts linked, transactions syncing into Supabase, data normalized and stored.

- Plaid Link integration (sandbox)
- `public_token` → `access_token` exchange + AES-256 encryption
- Transaction sync pipeline (Celery + Redis)
- Embedding generation (`text-embedding-3-small`)
- `/accounts` and `/transactions` endpoints
- Accounts, Transactions, Onboarding pages

---

## Phase 3 — Intelligence Layer ⬜
**Goal:** Bill detection, subscription tracking, AI categorization, and dashboard live.

- Recurring bill detection engine
- Subscription tracker + creep detection
- AI-powered transaction categorization (Claude)
- Behavioral spending intelligence
- Dashboard, Bills, Subscriptions pages

---

## Phase 4 — AI Reports ⬜
**Goal:** Monthly AI financial reports auto-generated. RAG pipeline operational. Anomaly detection live.

- Anomaly detection (z-score outlier flagging)
- RAG retrieval pipeline (pgvector cosine search)
- Monthly report generation (Claude + Pydantic schema)
- Reports index + individual report pages

---

## Phase 5 — Copilot + Simulations ⬜
**Goal:** All AI intelligence surfaces live — Copilot, engines, Health Score, Risk Radar, simulators.

- CashflowEngine (30–60 day forward simulation)
- DebtSimulator (Snowball vs. Avalanche)
- HealthScoreEngine (4-dimension composite score)
- RiskRadarEngine (proactive alert system)
- ScenarioEngine (what-if sliders)
- Goal-Based AI Savings Planner
- Multi-agent system (LangGraph — Supervisor + specialists)
- AI Copilot chat with streaming SSE
- All intelligence pages: Cashflow, Risk Radar, Health Score, Copilot, Goals, Behavioral Insights, Simulators

---

## Phase 6 — Production Hardening ⬜
**Goal:** Secure, monitored, rate-limited, load-tested, fully deployed. Tag `v1.0.0`.

- Security audit (RLS, auth, IDOR, SQL injection)
- Rate limiting (`slowapi` — 60/min standard, 10/min AI endpoints)
- Performance indexing + Redis caching
- Load testing with Locust (100 concurrent users, P95 < 500ms)
- Sentry + Axiom monitoring
- Full production smoke test
- Tag `v1.0.0`
