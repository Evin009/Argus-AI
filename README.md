# ArgusAI

An AI-powered Financial Intelligence System built for people who want to stay ahead of their finances — not just review them after the fact.

ArgusAI connects to your bank accounts, learns your financial patterns, and runs continuous simulations in the background. It surfaces risks before they become problems, answers financial questions grounded in your real data, and builds forward-looking projections so you always know where you stand — not just where you were.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (TypeScript), Tailwind CSS, shadcn/ui, Aceternity UI |
| Backend | FastAPI (Python 3.12) |
| Database | Supabase — PostgreSQL + pgvector + Realtime + Row-Level Security |
| Auth | Supabase Auth — JWT, OAuth (Google), refresh token rotation |
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

## What Sets ArgusAI Apart

Apps like Rocket Money, Mint, YNAB, and Monarch Money are all built around the same idea: show you what you spent and alert you after something goes wrong. They are reporting tools. ArgusAI is an intelligence system — it tells you what is about to happen and what to do about it.

- **It predicts, not just reports.** ArgusAI runs a 30–60 day cashflow simulation automatically using your transaction history, income patterns, and known bills. You can see a projected overdraft 10 days out — before your bank knows it's coming.

- **It reasons about your actual situation.** Ask the Copilot "Can I afford a $1,400 laptop right now?" and it queries your real balances, checks upcoming bills, reviews your savings goals, and returns a direct recommendation grounded in your specific numbers — not generic financial advice.

- **It models your behavior, not just your transactions.** Most apps categorize what you spent. ArgusAI learns your spending baseline and flags when something changes — velocity spikes, impulse patterns, category drift. It gets more useful the longer you use it.

- **It warns you before problems happen.** Risk Radar scores your overdraft probability daily and fires an alert when the risk crosses a threshold — not a notification after the overdraft, but a warning with enough time to act.

- **It catches subscription creep.** Price increases on streaming and software services are usually small enough to go unnoticed individually. ArgusAI tracks each service over a rolling 3-month window and flags anything that has quietly gone up.

- **It remembers your financial history.** Standard finance apps reset every session. ArgusAI stores embeddings of your transaction history so the Copilot can reason across time — comparing months, spotting seasonal patterns, and answering questions about the past without you digging through statements.

---

## Features

### Core

| Feature | Description |
|---|---|
| Authentication | Supabase Auth — JWT, OAuth (Google), refresh token rotation |
| Bank Account Linking | Plaid API — checking, savings, and credit accounts |
| Transaction Pipeline | Sync, normalize, and store raw Plaid transactions automatically |
| Automated Categorization | AI-powered classification of every transaction into spending categories |
| Recurring Bill Detection | Merchant and pattern-based detection of recurring charges |
| Subscription Dashboard | Full overview of active subscriptions with amounts, cycles, and price history |
| Monthly AI Report | Auto-generated monthly summary with AI-written insights and trend analysis |

### Intelligence

| Feature | Description |
|---|---|
| AI Financial Copilot | Conversational agent with tool-calling — queries your real data, runs simulations, explains reasoning |
| Cashflow Prediction Engine | 30–60 day forward simulation with probability-weighted daily balance curves |
| Debt Payoff Simulator | Snowball vs. Avalanche comparison with month-by-month payoff schedules and interest saved |
| Financial Health Score | Real-time 0–100 score across four dimensions: Liquidity, Stability, Debt Load, Spending Volatility |
| Risk Radar | Proactive scoring of overdraft probability, credit utilization, and upcoming bill risk |
| Scenario Simulator | Adjust income or expenses and see the real-time impact on your 30–60 day forecast |
| Behavioral Intelligence | Detects impulse patterns, spending velocity spikes, and category-level drift over time |
| Subscription Creep Detection | Flags gradual price increases per service over a rolling 3-month window |
| Goal-Based Savings Planner | Set a savings target and date — ArgusAI generates a structured monthly milestone roadmap |
| Anomaly Detection | Statistical outlier detection for duplicate charges, foreign transactions, and unusual spikes |
| AI Decision Engine | Affordability analysis grounded in your real balances, bills, and goals |
| Smart Payment Allocation | Priority-ordered allocation of available funds across credit cards, bills, and savings |
| Bonus Recommender | Finds bank and card signup bonuses filtered to institutions you don't already have |
| Credit Score Integration | Experian Connect — soft-pull credit report, score history, AI-powered improvement recommendations |

---

## AI Architecture

Every Copilot response is grounded in retrieved data, not generated figures. When you ask a question, ArgusAI embeds it, retrieves the most relevant transactions and insights from your history via pgvector cosine search, and routes to the appropriate specialist agent. Each agent has access to a set of database-grounded tools — balance queries, cashflow forecasts, risk scores — and reasons step-by-step before returning a structured response.

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

### Phase 1 — Foundation

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

### Phase 1.5 — Design System

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

## Scope

ArgusAI is a read-only intelligence layer over your existing accounts. It does not invest or manage assets, initiate fund transfers, pull hard credit inquiries, or provide licensed financial advice. All AI outputs include appropriate disclaimers.

---

## Documentation

Full architectural details, data models, and security requirements are in [CLAUDE.md](CLAUDE.md).
Phase-by-phase build plans are in the [Phase Plans](Phase%20Plans/) folder.
