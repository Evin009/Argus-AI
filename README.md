# ArgusAI

An AI-powered Financial Intelligence System. ArgusAI is a real-time financial guardian and decision engine that predicts risk, reasons about your financial behavior, and helps you make smarter money decisions before problems occur.

Most personal finance apps are backward-looking — they show you what you already spent. ArgusAI is forward-looking. It simulates, forecasts, and reasons about what is about to happen to your finances, and what you should do about it now.

---

## What Sets ArgusAI Apart

Apps like Rocket Money, Mint, YNAB, Monarch Money, and Copilot are all built around the same idea: show you what you spent, help you set a budget, and alert you after something goes wrong. They are reporting tools, not intelligence systems.

ArgusAI is built around a fundamentally different premise — that the most valuable thing a finance app can do is tell you what is about to happen, not what already did.

**Prediction over reporting.**
ArgusAI runs a 30–60 day cashflow simulation automatically, using your transaction history, known recurring bills, and income patterns. It outputs a probability-weighted daily balance curve — not a static chart of last month's spending. You can see a projected overdraft 10 days out before your bank even knows it's coming.

**Reasoning over dashboards.**
The AI Copilot doesn't just surface data — it reasons about it. Ask "Can I afford a $1,400 laptop right now?" and it queries your real balances, runs an affordability simulation against your upcoming bills, checks your savings goals, and returns a structured answer with a recommendation. No other consumer finance app does this.

**Behavioral intelligence.**
Most apps categorize your transactions. ArgusAI models your behavior. It learns your spending baseline and detects deviations — velocity spikes, impulse patterns, category-level drift, and day-of-week anomalies — and surfaces them with natural language explanations. The system gets more accurate the longer you use it.

**Proactive risk, not reactive alerts.**
Rocket Money tells you after a subscription renews. ArgusAI tells you before your balance drops below your bill obligations. Risk Radar scores your overdraft probability daily and fires warnings when the risk crosses a threshold, giving you time to act.

**Subscription creep detection.**
Most users have no idea their subscriptions are quietly getting more expensive. ArgusAI tracks price changes per subscription over a rolling 3-month window and flags services that have crept up — often by small enough amounts that no individual charge triggers concern.

**Your financial data has memory.**
Standard finance apps forget everything between sessions. ArgusAI stores vector embeddings of your transaction history and retrieves relevant context at query time. The Copilot can reason about "last March" or compare "this month vs. Q3" because it has structured, searchable memory of your financial history.

**Strategy, not just tracking.**
When you want to pay off debt, ArgusAI doesn't just show you a Snowball vs. Avalanche table. It runs a 24-month cashflow simulation for each strategy, accounting for your actual spending volatility, and tells you which approach is safer given your specific financial profile.

The result is a system that acts less like a finance tracker and more like a financially-literate advisor that knows your numbers, reasons about your situation, and tells you what to do next.

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
