# Meeting Notes — Product Vision & UI Session
**Date:** 2026-05-29
**Status:** Planning in progress — main docs not yet updated

---

## 1. Project Status At Start of Session

Phases 1–3.5 complete and deployed:
- FastAPI backend, Next.js 14 frontend
- Supabase DB, Auth, pgvector
- Plaid bank linking and transaction sync
- Recurring bill detection, subscription tracking, AI categorization
- LangGraph multi-agent intelligence pipeline (Claude Sonnet)
- Intelligence feed UI, enrichment drawers

Phases 4–9 not started.

---

## 2. UI/UX Redesign Decisions

### What happened
- Existing dashboard was visually poor — generic gray/indigo Tailwind defaults
- Decision: full redesign against a Claude Design mockup (copper+red dark theme)
- Design handoff reviewed: copper brand (`#BE7740`), red companion (`#A8412B`), film-grain texture on accent surfaces, Instrument Serif + Hanken Grotesk + IBM Plex Mono

### Design system established
- New tokens in `globals.css` — copper ramp, semantic colors, radii, grain utility
- `PRODUCT.md` and `DESIGN.md` written at project root (impeccable init)
- `docs/design-workflow.md` created — skill stack reference for all future design work

### Dashboard rebuilt
- New 3-column compact grid layout (fits viewport, no scroll)
- Components: TopNav with tabs, AI insight banner, BalanceCard, KPI cluster, spending donut (SVG arc animation), spending limit, credit cards, upcoming bills calendar, recent activity
- Framer Motion for card stagger entrance, animated donut arcs, press states
- `NumberTicker` component — financial figures count up on load
- `CardSpotlight` component — cursor-following copper glow on panel hover

### Key fixes applied this session
- Error boundary with retry (was silent failure before)
- Icon rail hover tooltips with slide-in animation
- TopNav active tab synced to URL via `usePathname()`
- Redundant API call removed (was fetching transactions twice)
- Hard-coded hex colors → CSS tokens (light mode compatible)
- Responsive grid reverted — user wants compact single-frame desktop layout

---

## 3. Critical Product Insight — The Core Problem Reframed

### What existing apps get wrong
Apps like Rocket Money, Monarch Money, Mint, YNAB all have the same fundamental failure:
**They show data. They don't do thinking.**

A user sees "you spent $840 on dining this month" and closes the app just as confused as before. The app answered no question they actually had.

The questions real people have:
- Am I okay right now?
- Will I have enough at the end of the month?
- Should I buy this thing I want?
- Why am I always broke two weeks after payday?
- Which subscriptions are actually worth keeping?

None of those apps answer those. They are rear-view mirrors.

### What Argus actually is
**Argus is a personal financial analyst — your fine-tuned, personalized brain that helps you actually manage money.**

Not a tracker. Not a budgeting tool. A reasoning system that:
- Watches everything (transactions, bills, subscriptions, patterns)
- Reasons about your specific situation (not generic advice)
- Warns you before problems happen (not after)
- Tells you what to do, not just what happened

The one-sentence pitch:
> "Argus watches your money 24/7, warns you before things go wrong, and answers financial questions using your real numbers — not generic advice."

---

## 4. The Three-Layer Product Model

### Layer 1 — The Hub (central financial OS)
Replaces having 5 different apps. Everything in one place:
- All bank accounts and balances
- All credit cards (balance, limit, utilization %, due date, closing date, minimum payment)
- All subscriptions (amount, frequency, price changes)
- All recurring bills (rent, utilities, insurance)
- Income tracking (paychecks, patterns, next expected)

**Key point:** Most people don't actually know what they owe, to whom, and when. Argus knows for them.

### Layer 2 — The Brain (AI that reasons about your situation)
What separates Argus from every other app:
- Pattern detection: "You spend $200+ on weekends. Fridays are your most expensive day."
- Behavioral alerts: "You've exceeded dining budget 3 months in a row. This isn't a one-off."
- Risk warnings: "Rent clears in 4 days. Your balance won't cover it at current spending pace."
- Cashflow forecasting: "Based on your patterns, you'll have $840 left by month end."
- Anomaly detection: "This $312 charge from a merchant you've never used looks unusual."
- Health scoring: One honest number — how financially healthy are you right now and why.

### Layer 3 — The Guide (personalized action plans per user goal)
Different for every user based on their stated goal:

| Goal | What Argus does |
|---|---|
| Build credit score | Optimal payment timing (before closing date), utilization targets, which card to use for what |
| Pay off debt | Snowball vs Avalanche comparison, month-by-month payoff plan, interest saved calculations |
| Stop overspending | Daily Safe to Spend number, spending velocity alerts, subscription audit |
| Save for something | Monthly savings target, progress tracking, "here's where to cut to accelerate" |
| Just understand my money | Plain-English monthly summary, what changed, what to do differently |

---

## 5. Onboarding Questionnaire — New Feature Decision

### The problem it solves
Without onboarding, Argus has no context on day 1. First insights are generic. Generic first insights are forgettable.

With onboarding, Argus already knows the user's situation, goals, and self-identified patterns before a single transaction syncs — enabling personalized insights from day 1.

### Agreed structure
**~12 questions across 4 chapters, ~5 minutes total. Conversational, not clinical.**

**Chapter 1 — Where you are right now**
- Biggest money stress?
- Relationship with money (self-description)?
- Do you carry credit card debt?
- Do you have savings / emergency fund?

**Chapter 2 — What you're working with**
- How many bank/credit accounts?
- Stable or variable income?
- Any big financial events coming up? (move, car, wedding, job change)

**Chapter 3 — What you want**
- Primary goal?
- What does financial success look like in 12 months?
- How hands-on do you want Argus? (daily nudges / weekly summary / alert-only)

**Chapter 4 — What you know about yourself**
- Which spending category do you know you overspend on?
- Do you tend to avoid finances when things are bad?
- Have you tried budgeting apps before? What didn't work?

### Why the last question matters
"I tried Mint but the charts meant nothing to me" tells Argus exactly why this user needs a different experience.

### Technical home
`user_financial_profiles` table already exists in schema. Add columns:
```sql
primary_goal TEXT,
spending_self_image TEXT,
financial_stress TEXT,
carries_debt BOOLEAN,
income_stability TEXT,
checks_finances_frequency TEXT,
onboarding_completed_at TIMESTAMPTZ
```

### User flow
`Sign up → Onboarding (~5 min) → Link bank account → First personalized insight`

---

## 6. Behavioral Refinement Loop — Target 3–4 Weeks

### The goal
Reach a real behavioral fingerprint (enough for accurate predictions) within 3–4 weeks of usage — not months.

### Week-by-week breakdown

**Week 1 — Facts**
- Subscription detection
- Bill detection
- Income confirmation (paycheck timing + amount)
- Spending categories emerge

**Week 2 — Weekly behavior**
- High-spend days identified
- Impulse indicators (late-night transactions, food delivery frequency)
- First paycheck cycle visible

**Week 3 — Cycle patterns**
- Pay cycle spending curve (spend fast post-payday, tighten end of month?)
- Category drift (is dining creeping week over week?)
- Month's cashflow shape becomes visible

**Week 4 — Behavioral fingerprint**
- Baseline established: this is how this person spends
- Deviations from their own baseline become detectable
- First personalized prediction: "based on your pattern, you'll have ~$X left on the 28th"

**The key accelerator:** Onboarding answers give the AI a hypothesis to test in week 1, instead of searching blind. Week 1 confirms or challenges the self-assessment. By week 4, Argus knows whether the user's self-image matches reality — and that gap is often the most useful insight of all.

---

## 7. The "First Insight" Moment

Agreed: the most important moment in the product is not the signup, not the dashboard — it's the **first time Argus says something specific, true, and useful about this particular user's finances that they didn't already know.**

That moment needs to be designed deliberately. It's what makes someone tell a friend about it.

---

## 8. What the Dashboard Should Actually Show

**Current dashboard problem:** Built from a banking app template. Shows wallets, transfer buttons, card numbers — none of which are ArgusAI.

**What the dashboard should answer in under 3 seconds:** "Is my money okay right now?"

**Proposed surfaces for the real dashboard:**
1. Financial Health Score (center stage — the product's signature)
2. Safe to Spend Today (daily utility — reason to open the app every morning)
3. Risk Radar — top 2–3 active alerts ranked by severity
4. Due this week — compact bill list, not a calendar
5. Latest AI intelligence — 2 most recent analyst signals
6. Balance + this month's delta (secondary context)
7. Last 3 transactions (supporting detail)

**What moves to dedicated pages:**
- Spending category breakdown → /transactions
- Credit cards detail → /accounts
- Full bills calendar → /bills
- All subscriptions → /subscriptions
- Full intelligence feed → /intelligence
- Cashflow curve → /cashflow (Phase 6)

---

## 9. Open Items / Decisions Pending

- [ ] Finalize onboarding question list (exact wording)
- [ ] Decide: placeholder dashboard UI now, or wait until Phase 5 backend for Health Score + Safe to Spend?
- [ ] Credit card intelligence fields needed in DB (closing date, minimum payment) — not currently tracked
- [ ] Update ROADMAP.md to reflect reprioritization
- [ ] Update CLAUDE.md product bible with refined vision and three-layer model
- [ ] Update PRODUCT.md with new brand personality articulation from this session

---

## 10. Quotes Worth Keeping

> "Argus is not a budgeting app. Budgeting apps tell you what happened. Argus tells you what's happening, what's about to happen, and what to do about it."

> "Argus is the financial analyst that a normal person could never afford to hire — one that watches your money 24/7, thinks ahead, and tells you what to do before problems happen."

> "Argus reasons, analyses and lays out what went wrong, how to avoid financial traps and pitfalls, and smartly navigates your way through the financial mess by giving tailored suggestions, financial alerts when going overboard, tracks spending and derives an individual's financial burdens and patterns/behaviours — and guides them to a financially brighter and responsible future."
— Evin Bento, 2026-05-29
