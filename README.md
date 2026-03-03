# ArgusAI

> An AI-powered Financial Intelligence System — not a budgeting app.

ArgusAI is a real-time **financial guardian and decision engine** that predicts risk, reasons about your financial behavior, and helps you make smarter money decisions *before* problems occur.

**The core thesis:** Every existing finance app is backward-looking — they show you what you already spent. ArgusAI is forward-looking. It simulates, forecasts, and reasons about what is *about to happen* to your finances, and what you should do about it now.

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

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (TypeScript), Tailwind CSS → Vercel |
| Backend | FastAPI (Python) → Railway / Fly.io |
| Database | Supabase (managed PostgreSQL + pgvector + Realtime + RLS) |
| Auth | Supabase Auth — JWT-based, OAuth, refresh token rotation |
| Vector Search | pgvector via Supabase — co-located with transaction data, no separate service |
| Cache / Jobs | Redis + Celery (Plaid sync, embedding generation) |
| AI / LLM | Claude claude-sonnet-4-6 (Anthropic API) with tool-calling |
| RAG | Custom retrieval pipeline over Supabase pgvector |
| Embeddings | text-embedding-3-small (OpenAI) or Voyage AI |
| Bank Data | Plaid API |
| Monitoring | Sentry + Axiom / Datadog |
| CI/CD | GitHub Actions |

---

## AI System Architecture

```
User Query
    │
    ▼
[RAG Retrieval] ──── Supabase Vector (pgvector, co-located with transaction DB)
    │
    ▼
[Context Assembly]  ←── current balances, active goals, upcoming bills
    │
    ▼
[Claude claude-sonnet-4-6 with Tool-Calling]
    ├── get_cashflow_forecast()
    ├── get_balance_summary()
    ├── run_debt_simulation()
    ├── get_risk_alerts()
    └── get_spending_patterns()
    │
    ▼
[Structured JSON Output]  ←── schema-validated, no hallucinated financial data
    │
    ▼
[Response to User]
```

**Key principles:**
- All financial figures are retrieved, never generated
- Every copilot response includes a confidence field and cited data sources
- All outputs include a disclaimer: ArgusAI is not a licensed financial advisor

---

## Development Timeline

| Phase | Weeks | Deliverables |
|---|---|---|
| Foundation | 1–2 | Supabase setup (Auth, DB, RLS), FastAPI scaffold, CI/CD |
| Data Pipeline | 3–4 | Plaid integration, transaction sync, normalization pipeline |
| Intelligence Layer | 5–6 | Bill detection, subscription tracking, AI categorization |
| AI Reports | 7–8 | Monthly AI reports, categorization improvements |
| Copilot + Simulations | 9–10 | Financial Copilot, cashflow engine, debt + scenario simulators |
| Production Hardening | 11–12 | Security audit, rate limiting, load testing, production deploy |

---

## What ArgusAI Is NOT

- **Not a robo-advisor** — does not invest or manage assets
- **Not a licensed financial advisor** — all AI outputs carry appropriate disclaimers
- **Not credit monitoring** — no credit report pulls, no hard inquiries
- **Not a bank** — read-only via Plaid; no fund transfers

---

## Project Context

For full architectural details, data models, security requirements, competitive differentiators, and use cases, see [CLAUDE.md](CLAUDE.md).
