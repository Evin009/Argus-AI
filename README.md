# ArgusAI

An AI-powered Financial Intelligence System. ArgusAI is a real-time financial guardian and decision engine that predicts risk, reasons about your financial behavior, and helps you make smarter money decisions before problems occur.

Most personal finance apps are backward-looking — they show you what you already spent. ArgusAI is forward-looking. It simulates, forecasts, and reasons about what is about to happen to your finances, and what you should do about it now.

---

## What Sets ArgusAI Apart

Apps like Rocket Money, Mint, YNAB, and Monarch Money are all built around the same idea: show you what you spent and alert you after something goes wrong. They are reporting tools. ArgusAI is an intelligence system — it tells you what is about to happen and what to do about it.

**It predicts, not just reports.**
ArgusAI automatically runs a 30–60 day cashflow simulation using your transaction history, income patterns, and known bills. You can see a projected overdraft 10 days out — before your bank knows it's coming.

**It reasons about your actual situation.**
Ask the Copilot "Can I afford a $1,400 laptop right now?" and it queries your real balances, checks upcoming bills, reviews your savings goals, and returns a direct recommendation. Not generic advice — a structured answer grounded in your specific numbers.

**It models your behavior, not just your transactions.**
Most apps categorize what you spent. ArgusAI learns your spending baseline and flags when something changes — velocity spikes, impulse patterns, category drift. It gets more useful the longer you use it.

**It warns you before problems happen.**
Risk Radar scores your overdraft probability daily and fires alerts when the risk crosses a threshold. Not a notification after the overdraft — a warning with enough time to do something about it.

**It catches subscription creep.**
Price increases on streaming, software, and subscription services are usually small enough to go unnoticed. ArgusAI tracks each service over a rolling 3-month window and flags anything that has quietly gone up.

**It remembers your financial history.**
Standard finance apps reset every session. ArgusAI stores embeddings of your transaction history so the Copilot can reason across time — comparing months, spotting seasonal patterns, and answering questions about the past without you having to look anything up.

---

## Build Status

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Foundation | Complete |
| Phase 1.5 | Design System | In Progress |
| Phase 2 | Bank Data Pipeline | Not Started |
| Phase 3 | Intelligence Layer | Not Started |
| Phase 4 | AI Reports | Not Started |
| Phase 5 | Copilot + Simulations | Not Started |
| Phase 6 | New Features | Not Started |
| Phase 7 | Production Hardening | Not Started |

---

## Phase 1 — Foundation

| Deliverable | Status |
|---|---|
| FastAPI backend scaffold + JWT auth middleware | Done |
| `GET /me` and `POST /users/sync` endpoints | Done |
| Next.js 14 frontend (TypeScript + Tailwind + App Router) | Done |
| Supabase browser + server clients | Done |
| Route protection middleware | Done |
| Auth pages — login, signup, OAuth callback, verify-email | Done |
| Landing page + sidebar nav shell + settings page | Done |
| Supabase DB schema — 8 tables + RLS policies + pgvector index | Done |
| Dockerfile + docker-compose (FastAPI + Redis) | Done |
| GitHub Actions CI — ruff lint + pytest (5/5 passing) | Done |
| Frontend deployed to Vercel | Done |
| Backend deployed to Railway | Done |
| End-to-end auth flow verified on production | Done |

---

## Phase 1.5 — Design System

| Deliverable | Status |
|---|---|
| Page mockups in Pencil.dev (all 14 pages) | Not Started |
| Tailwind theme — color tokens, typography, spacing | Not Started |
| shadcn/ui — initialized + core components dark-themed | Not Started |
| Aceternity UI — hero + landing page effects | Not Started |
| Custom app components — StatCard, RiskBadge, SectionHeader, EmptyState | Not Started |
| Sidebar finalized with all nav links | Not Started |
| Landing page + auth pages redesigned | Not Started |

---

## Features

### Core MVP

| Feature | Description |
|---|---|
| Authentication | Supabase Auth — JWT, OAuth (Google), refresh token rotation |
| Bank Account Linking | Plaid API — checking, savings, and credit accounts |
| Transaction Pipeline | Sync, normalize, and store raw Plaid transactions |
| Automated Categorization | AI-powered spending classification |
| Recurring Bill Detection | Merchant and pattern-based detection of recurring charges |
| Subscription Dashboard | Overview of all active subscriptions with billing cycles |
| Monthly AI Report | Auto-generated monthly financial summary with AI insights |

### Advanced Intelligence

| Feature | Description |
|---|---|
| AI Financial Copilot | Conversational agent with tool-calling — queries real data, runs simulations |
| Cashflow Prediction Engine | 30–60 day forward simulation with probability-weighted balance curves |
| Debt Payoff Simulator | Snowball vs. Avalanche with projected payoff dates and total interest saved |
| Financial Health Score | Real-time 0–100 score across Liquidity, Stability, Debt Load, and Spending Volatility |
| Risk Radar | Proactive alerts for overdraft risk, utilization spikes, and upcoming bills |

### Differentiators

| Feature | Description |
|---|---|
| Scenario Simulator | Income and expense sliders that re-run the 30–60 day forecast in real time |
| Behavioral Intelligence | Detects impulse patterns, velocity spikes, and category-level drift over time |
| Subscription Creep Detection | Flags gradual price increases across subscriptions |
| Goal-Based Savings Planner | Set a target and date — ArgusAI generates a monthly milestone roadmap |
| Anomaly Detection | Statistical outlier detection for duplicate charges, spikes, and unusual transactions |
| AI Decision Engine | Structured affordability analysis grounded in real account data |
| Smart Payment Allocation | Priority-ordered allocation across credit cards, bills, and savings |
| Bonus Recommender | Surfaces bank and card signup bonuses filtered to institutions you don't have |
| Credit Score Integration | Experian Connect — soft-pull credit report, score history, AI-powered recommendations |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (TypeScript), Tailwind CSS, shadcn/ui, Aceternity UI |
| Backend | FastAPI (Python 3.12) |
| Database | Supabase — PostgreSQL + pgvector + Realtime + Row-Level Security |
| Auth | Supabase Auth — JWT, OAuth, refresh token rotation |
| Vector Search | pgvector via Supabase — co-located with transaction data |
| Cache / Jobs | Redis + Celery |
| AI | Claude Sonnet (Anthropic) + LangGraph multi-agent system |
| RAG | Custom retrieval pipeline over Supabase pgvector |
| Embeddings | OpenAI text-embedding-3-small |
| Bank Data | Plaid API |
| Hosting | Vercel (frontend), Railway (backend) |
| Monitoring | Sentry + Axiom |
| CI/CD | GitHub Actions |

---

## AI Architecture

```
User Query
    │
    ▼
RAG Retrieval  ──  Supabase pgvector (transactions + insights)
    │
    ▼
LangGraph Multi-Agent Supervisor
    ├── CashflowAgent   →  30–60 day balance forecast
    ├── RiskAgent       →  overdraft probability, proactive alerts
    ├── DebtAgent       →  Snowball vs. Avalanche simulation
    ├── PaymentAgent    →  payment allocation across accounts
    ├── BonusAgent      →  bank and card bonus search
    └── CreditAgent     →  Experian credit profile + recommendations
    │
    ▼
Structured JSON Output  (schema-validated — no hallucinated financial data)
    │
    ▼
SSE Response to User
```

All financial figures are retrieved from the database, never generated. Every copilot response cites its data sources. ArgusAI is not a licensed financial advisor.

---

## Scope

ArgusAI does not invest or manage assets, pull hard credit inquiries, transfer funds, or provide licensed financial advice. It is a read-only intelligence layer over your existing accounts.

---

## Documentation

Full architectural details, data models, security requirements, and use cases are in [CLAUDE.md](CLAUDE.md).
Phase-by-phase build plans are in the [Phase Plans](Phase%20Plans/) folder.
