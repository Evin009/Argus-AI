# ArgusAI

**Every other finance app is a mirror. ArgusAI is a window.**

Most finance apps show you what already happened. ArgusAI watches your money the way a financial analyst would — continuously, proactively, and with memory. It predicts what is coming, warns before problems happen, and gets smarter about your specific financial behavior over time.

---

## What's Built

### Auth + Onboarding
- Email/password and Google OAuth login
- 10-chapter onboarding flow covering income, expenses, goals, debt, and risk tolerance
- Bank account linking built directly into onboarding via Plaid

### Dashboard
- Safe to Spend — one number showing real spending power after bills, goals, and buffer
- Balance cards, recent activity, spending breakdown, cashflow curve
- Subscription calendar, stat cluster, Ask Argus bar

### Bank Data
- Plaid integration — link checking, savings, and credit accounts
- Automatic transaction sync with AI categorization
- Recurring bill and subscription detection

### Bills + Subscriptions
- Detected bills with due dates, urgency coloring, and next occurrence
- Subscription tracking with price creep detection and AI enrichment
- AI-generated context per bill and subscription (merchant type, cancel recommendations)

### Smart Payment Calendar
- Unified calendar combining bills, subscriptions, and AI-recommended payment dates
- Brand logos on every entry
- Pay timing intelligence — tells you when and how much to pay each card to hit target utilization

### Intelligence Feed
- LangGraph multi-agent pipeline runs after every sync
- Analyst decisions covering risk, opportunity, behavioral patterns, anomalies, and subscriptions
- Filterable feed with severity badges and full reasoning per insight

### Financial Profile
- Spending breakdown by category with visual ring chart
- Merchant rankings sorted by total spend with 30-day trend
- Per-merchant detail: frequency heatmap, monthly trend, and an Argus-generated insight specific to your pattern with that merchant
- Utilization gauge across all credit accounts

### Argus Brain
- Chat interface — ask any financial question, get structured answers (charts, tables, verdict cards)
- Side panel (Cmd+K) — context-aware, slides in on any screen, persists across navigation
- Outcome ledger — every prediction Argus makes is logged and graded against what actually happened
- Tool registry — Safe to Spend, pay timing, profile, and merchant history all callable by Argus in chat

---

## Coming Next

| Feature | Phase |
|---|---|
| Feature refinement + polish pass | 6.5 — In Progress |
| Argus Guardian Chrome Extension | 7B |
| Cashflow forecasting (60-day curve) | 8 |
| Goal planning + recovery plans | 8 |
| Subscription alternative detection | 9 |
| Credit Intelligence Hub + card routing | 9 |
| Desktop app — voice overlay, menu bar | 10 |
| Production hardening + v1.0 | 11 |

---

## Build Status

| Phase | Description | Status |
|---|---|---|
| 1 | Foundation — auth, DB, CI | ✅ |
| 1.5 | Design system | ✅ |
| 2 | Bank data pipeline — Plaid, transaction sync | ✅ |
| 3 | Intelligence layer — bills, subscriptions, AI categorization | ✅ |
| 3.5 | AI intelligence upgrade — LangGraph, analyst pipeline | ✅ |
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
