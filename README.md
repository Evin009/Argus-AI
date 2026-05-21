# ArgusAI

**Every other finance app is a mirror. ArgusAI is a window.**

Mint, Rocket Money, Monarch — they all show you what you already spent and call that insight. ArgusAI watches your money the way a senior financial analyst would: continuously, proactively, and with memory of who you are. It predicts what's coming, fires decisions before you ask, and gets smarter about your specific financial behavior every single day.

---

## What Makes ArgusAI Different

| Everyone Else | ArgusAI |
|---|---|
| Shows past spending | Simulates the next 60 days |
| Alerts after overdrafts | Warns 5–10 days before |
| Generic budget advice | Decisions grounded in your real numbers |
| No memory between sessions | Learns your behavior over time |
| Monthly reports | Intelligence fires after every sync |

---

## Feature Tiers

### Tier 1 — Core Foundation
Everything runs on this. Bank linking via Plaid, real-time transaction sync, AI categorization, recurring bill detection, and subscription tracking with price creep detection.

### Tier 2 — Daily Intelligence
The features you open every morning.
- **Safe to Spend Today** — your real spending power after everything committed is subtracted. Not your balance.
- **Financial Weather Forecast** — 7 and 30-day risk narrative. *Clear. Mild turbulence. Storm warning.*
- **Financial Stress Index** — how much pressure are you under *right now*, regardless of your overall health score.
- **Pay Timing Intelligence** — exactly when and how much to pay each card to optimize credit utilization before your closing date.
- **Budget Strategy from Bill Changes** — when any bill increases, ArgusAI immediately generates three ways to absorb it.
- **Financial Memory Timeline** — a chronological story of your financial life, auto-generated.

### Tier 3 — Predictive Intelligence
Running in the background before you ask a question.
- **Proactive Analyst Decisions** — after every sync, a Claude-powered analyst reviews your full picture and generates 3–5 structured decisions without you asking.
- **Behavioral Spending Intelligence** — learns your personal spending rhythm and flags when you deviate.
- **Continuous Intelligence Briefing** — briefs fire when something worth knowing happens, not on a monthly schedule.
- **Anomaly Detection** — duplicate charges, spending spikes, foreign transactions flagged with severity scores.

### Tier 4 — Simulation & Planning
Model your financial future before committing to it.
- **Cashflow Prediction Engine** — probability-weighted 60-day balance curve with confidence bands.
- **Dynamic Financial Health Score** — 0–100 across four dimensions: Liquidity, Stability, Debt Load, Spending Volatility. Updates daily.
- **Debt + Cashflow Integrated Simulator** — Snowball vs. Avalanche run *inside* the cashflow engine, not in isolation.
- **Life Event Simulator** — model a new child, home purchase, job change, or sabbatical before you commit.
- **Cashflow Scenario Simulator** — move income/expense sliders and see the real-time impact on your forecast, health score, and goals.
- **Obstacle-Aware Goal Planning** — savings roadmap that identifies the specific months you'll fall short and adjusts.
- **AI Financial Copilot** — conversational agent with full tool-calling access. Ask anything, get answers grounded in your actual data.
- **AI Decision Engine** — "Can I afford this $1,400 laptop?" → structured affordability analysis with a simulation.

### Tier 5 — Decision Intelligence
Turns insight into action.
- **AI Decision Journal** — log major commitments and get a 90-day check-in on their actual downstream impact.
- **Subscription ROI Scoring** — infers usage from transaction patterns and calculates cost-per-use for every subscription.
- **Bill Negotiation + Alternative Detection** — usage analysis → cheaper alternatives → personalized negotiation script. You keep 100% of any savings.
- **Payment Intelligence Layer** — which card to use for which category to maximize rewards, and exactly how much to pay before your closing date.
- **Smart Payment Allocation** — when your paycheck lands, ArgusAI recommends exactly how to split it.

### Tier 6 — Ecosystem
- **Bonus Recommender** — finds current checking, credit card, and HYSA bonuses tailored to your profile using live web search.
- **Credit Score Integration** — Experian soft-pull, score history, and a full improvement playbook tied to your Pay Timing data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (TypeScript), Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | FastAPI (Python 3.12) |
| Database | Supabase — PostgreSQL + pgvector + Realtime + Row-Level Security |
| Auth | Supabase Auth — JWT, Google OAuth, refresh token rotation |
| AI | Claude Sonnet 4.6 (Anthropic) + LangGraph multi-agent |
| RAG | Custom retrieval pipeline over Supabase pgvector |
| Embeddings | OpenAI text-embedding-3-small |
| Cache / Jobs | Redis + Celery |
| Bank Data | Plaid API |
| Hosting | Vercel (frontend) + Railway (backend + Celery worker) |
| Monitoring | Sentry + Axiom |
| CI/CD | GitHub Actions |

---

## AI Architecture

Every Copilot response is grounded in retrieved data — no hallucinated financial figures. Queries are embedded, matched against your transaction history via pgvector cosine search, and routed to the right specialist agent.

```
User Query
    │
    ▼
RAG Retrieval  ──  pgvector (transactions + past insights)
    │
    ▼
LangGraph Supervisor
    ├── CashflowAgent  →  60-day balance forecast
    ├── RiskAgent      →  overdraft probability, proactive alerts
    ├── DebtAgent      →  Snowball vs. Avalanche simulation
    ├── GoalAgent      →  savings milestones, shortfall detection
    ├── BonusAgent     →  bank and card bonus discovery
    └── CreditAgent    →  Experian profile + improvement plan
    │
    ▼
Schema-validated JSON  →  SSE stream to user
```

The analyst layer runs separately after every sync — not just when you ask. It loads three tiers of memory (current data, recent decisions, long-term behavioral profile) and generates structured decisions that grow more personalized with each session.

---

## Build Status

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Foundation | ✅ Complete |
| Phase 1.5 | Design System | ✅ Complete |
| Phase 2 | Bank Data Pipeline | ✅ Complete |
| Phase 3 | Intelligence Layer | 🔄 In Progress |
| Phase 3.5 | AI Intelligence Upgrade | ⬜ Up Next |
| Phase 4 | Continuous Intelligence & Memory | ⬜ |
| Phase 5 | Daily Financial Pulse | ⬜ |
| Phase 6 | Copilot & Advanced Simulations | ⬜ |
| Phase 7 | Decision Intelligence | ⬜ |
| Phase 8 | Platform Features | ⬜ |
| Phase 9 | Production Hardening | ⬜ |

Full phase plans are in [Phase Plans/](Phase%20Plans/) and the complete roadmap is in [ROADMAP.md](ROADMAP.md).

---

## Scope

ArgusAI is a **read-only intelligence layer** over your existing accounts. It does not invest money, initiate transfers, pull hard credit inquiries, or provide licensed financial advice. All AI outputs include appropriate disclaimers.

Full architecture, data models, and security requirements are in [CLAUDE.md](CLAUDE.md).
