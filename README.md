# ArgusAI

**Every other finance app is a mirror. ArgusAI is a window.**

Mint, Rocket Money, Monarch — they show you what you already spent. ArgusAI watches your money the way a senior financial analyst would: continuously, proactively, and with memory of who you are. It predicts what is coming, warns before problems happen, and gets smarter about your specific financial behavior every single day.

---

## What Makes ArgusAI Different

| Everyone Else | ArgusAI |
|---|---|
| Shows past spending | Simulates the next 60 days |
| Alerts after overdrafts | Warns before they happen |
| Generic advice | Decisions grounded in your real numbers |
| No memory between sessions | Learns your behavior over time |
| App you open | System that watches you |

---

## Features

### Tier 1 — Daily Intelligence
- **Safe to Spend Today** — one number updated every morning. Your real spending power after all committed bills, goals, and buffer are subtracted. Not your balance.
- **Smart Payment Calendar** — unified calendar with brand logos, dropdown filters, and AI-recommended payment dates that are goal-aware.

### Tier 2 — Know Yourself
- **Argus Guardian** — ambient intelligence outside the app. Chrome extension intercepts financial decisions at checkout and fires a visual verdict before you spend. Post-purchase: immediate recovery plan.
- **Financial Profile Page** — three levels deep. Spending breakdown, habit streaks, subscription grid, utilization gauge, biggest spend day. Drill into any category, then into any merchant.
- **Merchant Intelligence** — per-merchant spending history page, dynamically generated. Charts, frequency heatmap, cost trend, Argus insight. Only exists for merchants you actually use.
- **AI Copilot** — on-demand financial analyst. Responds with charts, tables, and visual verdicts — never paragraphs. Side panel via Cmd+K on any screen. Voice-enabled.

### Tier 3 — Simulation & Planning
- **Cashflow Prediction Engine** — 30–60 day forward balance curve with confidence bands. Risk windows highlighted. Scrub any day for projected balance.
- **Financial Health Score** — 0–100 across four dimensions. Updates daily. Gamified with streak tracking, dimension challenges, and milestone animations.
- **Scenario Simulator** — income and expense sliders that update cashflow curve, health score, debt payoff date, and goal timeline simultaneously in real time. Custom and Life Events tabs.
- **Obstacle-Aware Goal Planning** — visual goal cards with Guardian ambient alerts. Recovery plan fires automatically when goal falls behind — three specific options, user picks one, plan updates, Guardian monitors.

### Tier 4 — Decision Intelligence
- **Subscription Alternative Detection** — detects unused subscriptions, shows a cheaper alternative, one-tap cancel. Annual saving calculated automatically.
- **Card Routing** — visual card chip per spending category showing which connected card maximizes rewards. Guardian notifies at point of purchase.
- **Credit Intelligence Hub** — Apple Wallet-style card stack. Per-card utilization, active offers, unused benefits. Total spending power across all cards. Bonus Recommender and credit score integrated.

---

## AI Architecture

All financial math runs in Python code. The LLM explains results — it never computes them.

```
User Query / Guardian Trigger
        │
        ▼
Tiered RAG Memory
├── Hot layer      → pgvector cosine search (last 90 days)
├── Distilled      → monthly AI summaries in ai_insights
└── Profile        → user_financial_profiles (static facts)
        │
        ▼
LangGraph Supervisor
├── CashflowAgent  → 60-day balance forecast
├── RiskAgent      → overdraft probability, proactive alerts
├── DebtAgent      → payoff strategy
├── GoalAgent      → savings milestones, shortfall detection
└── CreditAgent    → score analysis + improvement plan
        │
        ▼
Schema-validated JSON → SSE stream → visual response
```

AI traits running invisibly behind every feature: behavioral fingerprint, anomaly detection, velocity tracking, pattern recognition. Never user-facing — felt in every output.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (TypeScript), Tailwind CSS, Framer Motion |
| Backend | FastAPI (Python 3.11+) |
| Database | Supabase — PostgreSQL + pgvector + RLS |
| Auth | Supabase Auth — JWT, Google OAuth, refresh token rotation |
| AI | Claude Sonnet 4.6 + LangGraph multi-agent |
| RAG | Custom retrieval pipeline over Supabase pgvector |
| Embeddings | OpenAI text-embedding-3-small |
| Cache / Jobs | Redis + Celery |
| Bank Data | Plaid API |
| Logos | Clearbit Logo API |
| Credit | Experian Connect (soft pull) |
| Search | Brave Search API (bonuses, alternatives) |
| Hosting | Vercel (frontend) + Railway (backend + Celery) |
| Monitoring | Sentry + Axiom |
| CI/CD | GitHub Actions |

---

## Desktop Enhancements

Eight product-level enhancements that separate ArgusAI from every competitor:

- **Argus Guardian Chrome Extension** — intercepts decisions at checkout in real time
- **First Insight Engineering** — specific, true, surprising insight on day one
- **Merchant Logo Database** — Clearbit logos everywhere, no generic icons
- **Proactive Recovery Plans** — every negative signal comes with an immediate specific fix
- **Notification Design Obsession** — specific, visual, consistently right
- **Specificity Standard** — merchant + amount + date required or insight does not ship
- **Voice Interface** — floating system overlay, quick answers without opening the app
- **Copilot Side Panel** — Cmd+K on any screen, context-aware, conversation persists

---

## Platform Strategy

| Phase | Platform |
|---|---|
| 1 — Now | Web App — all features, full dashboard |
| 2 — Next | Chrome Extension — Argus Guardian |
| 3 — Later | Desktop App — voice overlay, menu bar, native notifications |
| 4 — Future | Mobile — iOS/Android, push notifications, Apple Pay intercept, Apple Watch |

---

## Build Status

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Foundation | ✅ Complete |
| Phase 1.5 | Design System | ✅ Complete |
| Phase 2 | Bank Data Pipeline | ✅ Complete |
| Phase 3 | Intelligence Layer | ✅ Complete |
| Phase 3.5 | AI Intelligence Upgrade | ✅ Complete |
| Phase 4 | Schema Fixes + Onboarding | ⬜ Up Next |
| Phase 5 | Daily Intelligence | ⬜ |
| Phase 6 | Financial Profile + Copilot | ⬜ |
| Phase 7 | Simulation & Planning | ⬜ |
| Phase 8 | Decision Intelligence | ⬜ |
| Phase 9 | Argus Guardian Extension | ⬜ |
| Phase 10 | Desktop App | ⬜ |
| Phase 11 | Production Hardening | ⬜ |

Full implementation plan: [Argus Details/product-plan.md](Argus%20Details/product-plan.md)
Full product detail: [Argus Details/product-detail.md](Argus%20Details/product-detail.md)

---

## Scope

ArgusAI is a **read-only intelligence layer** over your existing accounts. It does not invest money, initiate transfers, pull hard credit inquiries, or provide licensed financial advice. All AI outputs include appropriate disclaimers.
