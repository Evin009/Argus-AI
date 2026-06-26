# ArgusAI

**Every other finance app is a mirror. ArgusAI is a window.**

Mint, Monarch, Rocket Money — they show you what you already spent. ArgusAI watches your money the way a senior financial analyst would: continuously, proactively, and with memory. It predicts what is coming, warns before problems happen, and gets smarter about your specific financial behavior every single day.

---

## The Difference

| Every other app | ArgusAI |
|---|---|
| Shows past spending | Predicts the next 60 days |
| Alerts after overdrafts | Warns before they happen |
| Generic insights | Grounded in your real numbers |
| Forgets between sessions | Builds a behavioral profile over time |
| App you open | System that watches for you |

---

## What's Live

### Argus Brain
The core intelligence layer. Every feature feeds into it — and it feeds back into every feature.

- **Chat** — ask any financial question, get structured answers with charts, tables, and verdict cards. Never plain paragraphs.
- **Side Panel** — Cmd+K on any screen. Context-aware to what you're looking at, persists across navigation.
- **Outcome Ledger** — every prediction Argus makes is logged, then graded against what actually happened. It learns from being right and wrong.
- **Tool Registry** — Safe to Spend, pay timing, profile data, and merchant history are all callable by Argus in chat.

### Daily Intelligence
- **Safe to Spend** — one number, updated every morning. Real spending power after bills, goals, and buffer. Not your balance.
- **Smart Payment Calendar** — bills, subscriptions, and AI-recommended payment dates in one view. Brand logos, urgency coloring, pay timing intelligence per card.
- **Intelligence Feed** — multi-agent analyst pipeline runs after every sync. Surfaces risk, opportunity, behavioral patterns, and anomalies with full reasoning visible.

### Know Your Money
- **Financial Profile** — spending ring by category, merchant rankings by total spend, 30-day trend per merchant. Drill into any merchant for a frequency heatmap, monthly trend, and an Argus insight specific to your pattern with them.
- **Bills** — recurring charges detected automatically, due dates tracked, AI enrichment per merchant.
- **Subscriptions** — active subscriptions tracked with price creep detection and cancel recommendations.
- **Transactions** — full transaction history with AI categorization and category filters.

### Foundation
- **Onboarding** — 10-chapter flow covering income, expenses, goals, debt, and risk tolerance. Plaid bank linking built in.
- **Accounts** — connect checking, savings, and credit. Auto-sync after linking.
- **Auth** — email/password and Google OAuth.

---

## Coming Next

| Feature | Phase |
|---|---|
| Feature refinement + polish | 6.5 — In Progress |
| Argus Guardian Chrome Extension — verdict at checkout | 7B |
| Cashflow forecasting — 60-day probability curve | 8 |
| Goal planning + automatic recovery plans | 8 |
| Subscription alternative finder | 9 |
| Credit Intelligence Hub + card routing | 9 |
| Desktop app — voice overlay, menu bar presence | 10 |
| Production hardening + v1.0 | 11 |

---

## Build Status

| Phase | Description | Status |
|---|---|---|
| 1 | Foundation — auth, DB, CI | ✅ |
| 1.5 | Design system | ✅ |
| 2 | Bank data pipeline — Plaid, transaction sync | ✅ |
| 3 | Intelligence layer — bills, subscriptions, AI categorization | ✅ |
| 3.5 | AI upgrade — LangGraph multi-agent analyst pipeline | ✅ |
| 4 | Schema fixes + onboarding | ✅ |
| 5 | Argus Brain — chat, side panel, tool registry, outcome ledger | ✅ |
| 6 | Daily intelligence — Safe to Spend, pay timing, calendar | ✅ |
| 6.5 | Feature refinement pass | 🔄 In progress |
| 7A | Financial profile + merchant intelligence | ✅ |
| 7B | Argus Guardian Chrome Extension | ⬜ |
| 8 | Simulation + goal planning | ⬜ |
| 9 | Decision intelligence | ⬜ |
| 10 | Desktop app | ⬜ |
| 11 | Production hardening | ⬜ |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (TypeScript), Tailwind CSS |
| Backend | FastAPI (Python 3.11+) |
| Database | Supabase — PostgreSQL + pgvector |
| Auth | Supabase Auth — JWT, Google OAuth |
| AI | Claude Sonnet 4.6 + LangGraph multi-agent |
| Bank Data | Plaid API |
| Cache / Jobs | Redis + Celery |
| Hosting | Vercel (frontend) + Railway (backend + Celery) |
| CI/CD | GitHub Actions |

---

## Scope

ArgusAI is a read-only intelligence layer over your existing accounts. It does not move money, initiate transfers, pull hard credit inquiries, or provide licensed financial advice.
