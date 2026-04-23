# ArgusAI

> An AI-powered Financial Intelligence System — not a budgeting app.

ArgusAI is a real-time **financial guardian and decision engine** that predicts risk, reasons about your financial behavior, and helps you make smarter money decisions *before* problems occur.

**The core thesis:** Every existing finance app is backward-looking — they show you what you already spent. ArgusAI is forward-looking. It simulates, forecasts, and reasons about what is *about to happen* to your finances, and what you should do about it now.

---

## Build Progress

| Phase | Status | Weeks |
|---|---|---|
| Phase 1 — Foundation | ✅ Complete | 1–2 |
| Phase 1.5 — Design System | 🟡 In Progress | Pre-Phase 2 |
| Phase 2 — Bank Data Pipeline | ⬜ Not Started | 3–4 |
| Phase 3 — Intelligence Layer | ⬜ Not Started | 5–6 |
| Phase 4 — AI Reports | ⬜ Not Started | 7–8 |
| Phase 5 — Copilot + Simulations | ⬜ Not Started | 9–10 |
| Phase 6 — New Features | ⬜ Not Started | 11–12 |
| Phase 7 — Production Hardening | ⬜ Not Started | 13–14 |

---

## Phase 1 — Foundation ✅

All Phase 1 deliverables are complete and live in production.

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

## Phase 1.5 — Design System 🟡

Locking in the visual identity, component libraries, and page designs before Phase 2 begins.

| Deliverable | Status |
|---|---|
| Page mockups in Pencil.dev (all 14 pages) | ⬜ Not Started |
| Tailwind theme — color tokens, typography, spacing | ⬜ Not Started |
| shadcn/ui — initialized + 11 core components dark-themed | ⬜ Not Started |
| Aceternity UI — hero + landing page effects | ⬜ Not Started |
| Custom app components — `StatCard`, `RiskBadge`, `SectionHeader`, `EmptyState` | ⬜ Not Started |
| Sidebar finalized with all nav links (all phases) | ⬜ Not Started |
| Landing page + auth pages redesigned | ⬜ Not Started |

---

## Why ArgusAI?

Most personal finance apps (Mint, YNAB, Copilot, Monarch Money) share the same fundamental failures:

- **Reactive** — they report past spending instead of predicting future outcomes
- **No reasoning** — dashboards and charts with no strategic intelligence
- **No simulations** — can't model "what if I buy this?"
- **No behavioral analysis** — categorizes transactions but never models your patterns
- **Late risk detection** — alerts fire *after* the overdraft, not before
- **No memory** — can't reason across your financial history
- **Budget-focused** — tracks compliance, not actual financial outcomes

ArgusAI addresses all seven with dedicated intelligence systems.

---

## Feature Set

### Core MVP
| Feature | Description |
|---|---|
| User Authentication | Supabase Auth — JWT, OAuth (Google), refresh token rotation |
| Bank Account Linking | Plaid API — real checking, savings, and credit accounts |
| Transaction Pipeline | Sync, normalize, and store raw Plaid transactions |
| Automated Categorization | AI-powered spending classification |
| Recurring Bill Detection | Merchant + pattern-based detection of recurring charges |
| Subscription Dashboard | Visual overview of all active subscriptions with billing cycles |
| Monthly AI Report | Auto-generated monthly financial summary with AI insights |

### Advanced Intelligence
| Feature | Description |
|---|---|
| AI Financial Copilot | Conversational agent with tool-calling — queries your real data, runs simulations |
| Cashflow Prediction Engine | 30–60 day forward simulation with probability-weighted balance curves |
| Debt Payoff Simulator | Snowball vs. Avalanche with projected payoff dates and interest saved |
| Dynamic Financial Health Score | Real-time 0–100 score across Liquidity, Stability, Debt Load, and Spending Volatility |
| Risk Radar Feed | Proactive alerts for overdraft risk, utilization spikes, and missed bills — before they happen |

### Elite Differentiators
| Feature | Description |
|---|---|
| Interactive Scenario Simulator | Adjustable income/expense sliders that re-run the 30–60 day forecast in real time |
| Behavioral Spending Intelligence | Detects impulse patterns, velocity spikes, and category-level drift over time |
| Subscription Creep Detection | Flags gradual price increases users typically miss |
| Goal-Based AI Savings Planner | Set a savings target — ArgusAI builds a structured monthly roadmap |
| Anomaly Detection | Statistical outlier detection for duplicate charges, spikes, and unusual transactions |
| AI Decision Engine | "Can I afford a $1,400 MacBook right now?" → structured affordability analysis against your real numbers |
| Smart Payment Allocation | Priority-ordered allocation across credit cards, bills, and savings with buffer floor |
| Bonus Recommender | Finds bank/card signup bonuses filtered to institutions you don't already have |
| Credit Score Integration | Experian Connect — soft-pull credit report, score history, AI-powered recommendations |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (TypeScript), Tailwind CSS, shadcn/ui, Aceternity UI → Vercel |
| Backend | FastAPI (Python 3.12) → Railway |
| Database | Supabase (managed PostgreSQL + pgvector + Realtime + RLS) |
| Auth | Supabase Auth — JWT-based, OAuth (Google), refresh token rotation |
| Vector Search | pgvector via Supabase — co-located with transaction data, no separate service |
| Cache / Jobs | Redis + Celery (Plaid sync, embedding generation) |
| AI / LLM | Claude Sonnet (Anthropic API) with tool-calling + LangGraph multi-agent |
| RAG | Custom retrieval pipeline over Supabase pgvector |
| Embeddings | text-embedding-3-small (OpenAI) |
| Bank Data | Plaid API |
| Monitoring | Sentry + Axiom |
| CI/CD | GitHub Actions |

---

## AI System Architecture

```
User Query
    │
    ▼
[RAG Retrieval] ──── Supabase pgvector (transactions + insights)
    │
    ▼
[LangGraph Multi-Agent Supervisor]
    ├── CashflowAgent  →  CashflowEngine (30–60 day forecast)
    ├── RiskAgent      →  RiskRadarEngine (overdraft probability, alerts)
    ├── DebtAgent      →  DebtSimulator (Snowball vs. Avalanche)
    ├── PaymentAgent   →  PaymentAllocationEngine
    ├── BonusAgent     →  BonusSearchEngine (Brave Search + Claude)
    └── CreditAgent    →  CreditEngine (Experian Connect)
    │
    ▼
[Structured JSON Output]  ←── schema-validated, no hallucinated financial data
    │
    ▼
[SSE Response to User]
```

**Key principles:**
- All financial figures are retrieved, never generated
- Every copilot response includes a confidence field and cited data sources
- All outputs include a disclaimer: ArgusAI is not a licensed financial advisor

---

## What ArgusAI Is NOT

- **Not a robo-advisor** — does not invest or manage assets
- **Not a licensed financial advisor** — all AI outputs carry appropriate disclaimers
- **Not credit monitoring** — soft-pull only via Experian Connect, no hard inquiries
- **Not a bank** — read-only via Plaid; no fund transfers

---

## Project Context

For full architectural details, data models, security requirements, competitive differentiators, and use cases, see [CLAUDE.md](CLAUDE.md).

For the phase-by-phase build plan, see the [Phase Plans](Phase%20Plans/) folder.
