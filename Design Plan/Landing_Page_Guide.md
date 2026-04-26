# ArgusAI — Landing Page Guide

> A YC-style minimal marketing site. One strong idea per section. No fluff. Every word earns its place.

---

## Philosophy

The best startup landing pages do one thing: make the visitor feel the problem, then show them the solution exists. YC-style means:

- **One headline that says everything.** No taglines, no slogans. A sentence that describes the product exactly.
- **Show, don't tell.** UI screenshots or animations beat paragraphs.
- **Minimal copy.** Short sentences. No marketing speak.
- **One CTA.** Every section points to the same action — sign up.
- **Fast.** No bloat. Loads in under 2 seconds.

---

## Content You Need to Fill In

Before building, gather these. Placeholders are marked with `[ ]`.

### Brand
- [ ] Final product name (currently: **ArgusAI**)
- [ ] One-line tagline (suggestion: *"Your finances, one step ahead."*)
- [ ] Logo / wordmark (SVG preferred)
- [ ] Product screenshot or demo GIF — the dashboard, ideally showing the cashflow forecast
- [ ] Second screenshot — the AI Copilot chat or Risk Radar

### Social Proof (fill in when available)
- [ ] Number of users / beta signups (e.g. "2,400 people on the waitlist")
- [ ] Any press mentions or YC acceptance (if applicable)
- [ ] 2–3 user quotes with name + title (e.g. "Caught a $300 duplicate charge I never would have noticed — Alex, Software Engineer")

### CTAs
- [ ] Primary CTA label (suggestion: *"Get Early Access"* or *"Join the Waitlist"*)
- [ ] Link target — waitlist form, signup page, or `/signup`
- [ ] Email capture or direct signup? Decide before building.

---

## Landing Page Structure

### Page 1 — The Main Landing Page (`/`)

This is the only page most visitors will ever see. It must do everything.

---

#### Section 1 — Hero

**Goal:** Communicate what ArgusAI is in under 5 seconds.

| Element | Content |
|---|---|
| Headline | "Your finances, one step ahead." |
| Subheadline | "ArgusAI predicts cashflow, detects risk before it happens, and gives you an AI that reasons about your real money — not generic advice." |
| Primary CTA | "Get Early Access" → `/signup` |
| Secondary CTA | "See how it works" → scrolls to demo section |
| Background | Subtle animated dark effect (aurora / beam) — Aceternity UI |
| Visual | Product screenshot — Dashboard with cashflow forecast visible |

**Keep it tight.** Headline + subheadline + two buttons + one image. Nothing else.

---

#### Section 2 — The Problem (1 line each)

**Goal:** Make the visitor feel the pain before showing the solution.

No header needed. Just 3–4 short statements in a row:

```
Most finance apps show you what you already spent.
They alert you after the overdraft.
They find your subscriptions but miss the price creep.
They have no memory of your financial history.
```

Small text, centered, muted color. Sets up the next section.

---

#### Section 3 — The Solution (Feature Highlights)

**Goal:** Show the 4–5 things ArgusAI does that nothing else does.

4 cards in a 2×2 grid. Each card: icon + bold title + 1–2 sentence description.

| Card | Title | Description |
|---|---|---|
| 1 | Cashflow Prediction | "See your balance 30–60 days out. Know about an overdraft before your bank does." |
| 2 | AI Financial Copilot | "Ask anything. Get answers grounded in your real account data — not generic advice." |
| 3 | Risk Radar | "Daily overdraft probability scoring. Alerts fire before the problem, not after." |
| 4 | Behavioral Intelligence | "ArgusAI learns your spending rhythm. It surfaces patterns you've never noticed." |

Use Aceternity `card-hover-effect` here for the hover animation.

---

#### Section 4 — Product Demo / Screenshot

**Goal:** Show the product working. A real UI screenshot converts better than any copy.

- Full-width or wide-centered screenshot of the Dashboard
- Caption below: *"Your financial picture, always current."*
- Optional: a second screenshot of the Copilot chat with a real question/answer visible

If you have a demo video or GIF — use it here instead.

---

#### Section 5 — Feature Teaser Grid

**Goal:** Signal depth. Show visitors there's more than just the 4 hero features.

Small 3-column grid of feature names with a one-line description each. These link to their dedicated feature pages (see nested pages below).

| Feature | Teaser line |
|---|---|
| Debt Payoff Simulator | Snowball vs. Avalanche, simulated against your real cashflow. |
| Financial Health Score | A 0–100 score across 4 dimensions. Updates every day. |
| Scenario Simulator | What if your income dropped $500? See the impact in real time. |
| Subscription Creep Detection | Your streaming bundle is $4.99 more than 3 months ago. |
| Smart Payment Allocation | Deposit landed. Here's exactly how to split it. |
| Bill Due Date Calendar | Every bill, every due date, color-coded by urgency. |

Each item links to its feature page or scrolls to a detail section. No deep copy here — just enough to make them click.

---

#### Section 6 — Social Proof

**Goal:** Build trust with numbers and real quotes.

- Stat strip: `[ X ] people on the waitlist` · `[ X ] transactions analyzed` · `[ X ] overdrafts prevented`
- 2–3 user quotes in card format — name, title, one-sentence quote

*(Fill in when you have real numbers. Leave this section out until you do — fake social proof destroys trust.)*

---

#### Section 7 — Final CTA

**Goal:** Catch everyone who scrolled this far but didn't click the hero CTA.

- Headline: *"Stop reviewing your finances. Start staying ahead of them."*
- Single button: "Get Early Access" → `/signup`
- Subtext: *"Free during beta. No credit card required."*

---

#### Footer

Minimal. 

- ArgusAI wordmark (left)
- Links: Features · Pricing · Blog (if exists) · GitHub (if open source) · Privacy · Terms
- *"Not a licensed financial advisor. ArgusAI is a read-only intelligence layer."*

---

### Nested / Routed Pages

These are pages linked from the landing page but not shown on it. Each one goes deep on a single feature.

---

#### `/features/cashflow` — Cashflow Prediction Engine
- How the 30–60 day forecast works
- Screenshot of the cashflow chart with confidence bands
- Example: "On March 27, your balance is projected to drop to -$42"
- How it uses your transaction history and bill patterns
- CTA: Get Early Access

#### `/features/copilot` — AI Financial Copilot
- What kinds of questions it can answer
- Screenshot of a real Copilot conversation
- Explain tool-calling: "It doesn't guess — it queries your real data"
- Mention RAG memory: "It remembers last March"
- CTA: Get Early Access

#### `/features/risk-radar` — Risk Radar
- What it monitors: overdraft probability, credit utilization, bill risk
- How alerts work (before, not after)
- Example alert: "High overdraft risk on April 14 — 3 bills due, low buffer"
- CTA: Get Early Access

#### `/features/health-score` — Financial Health Score
- The 4 dimensions: Liquidity, Stability, Debt Load, Spending Volatility
- How the 0–100 score is calculated (transparent, not a black box)
- Screenshot of the score dial and dimension breakdown
- CTA: Get Early Access

#### `/features/behavioral-intelligence` — Behavioral Intelligence
- What behavioral patterns it detects
- Example output: "You overspend on dining 2 weeks after every paycheck"
- How it learns over time
- CTA: Get Early Access

#### `/features/simulators` — Simulators (Debt + Scenario)
- Debt Simulator: Snowball vs. Avalanche with real cashflow integration
- Scenario Simulator: income/expense sliders → real-time forecast update
- Screenshots of both
- CTA: Get Early Access

#### `/features/subscriptions` — Subscription Intelligence
- Subscription tracker overview
- Creep detection: price change tracking over 3 months
- Example: "Netflix +$2, Apple One +$3, Adobe +$4.99 since January"
- CTA: Get Early Access

#### `/pricing` — Pricing
- Free beta / waitlist access
- Planned pricing tiers (when decided)
- What's included in each tier

#### `/privacy` — Privacy Policy
- How data is stored and protected
- Plaid read-only access explanation
- No data selling, no ads
- AES-256 encryption for access tokens

#### `/terms` — Terms of Service
- Standard terms
- Not a licensed financial advisor disclaimer

---

## What Goes on Page 1 vs. Later Pages

| Content | Page 1 | Feature Page |
|---|---|---|
| Headline + tagline | Yes | — |
| The problem (3–4 lines) | Yes | — |
| 4 hero feature cards | Yes | — |
| Product screenshot / demo | Yes | — |
| Feature teaser grid (6 items) | Yes (brief) | Full detail |
| Social proof | Yes | — |
| Final CTA | Yes | Yes |
| Deep feature explanation | No | Yes |
| How it technically works | No | Yes |
| Pricing | No (link in footer) | Yes (own page) |
| Privacy / Terms | No (link in footer) | Yes (own pages) |

---

## Marketing Copy Notes

These phrases test well for fintech AI products. Use or adapt:

- *"Your finances, one step ahead."* — hero headline
- *"Know about the overdraft before your bank does."* — Risk Radar
- *"Not generic advice. Answers grounded in your real numbers."* — Copilot
- *"Stop reviewing your finances. Start staying ahead of them."* — final CTA
- *"It gets smarter the longer you use it."* — Behavioral Intelligence
- *"The price increase was $2.99. You never noticed. ArgusAI did."* — Subscription Creep

Avoid:
- "Revolutionary" / "Powerful" / "Seamless" — meaningless
- Passive voice — "Your finances are analyzed" → "ArgusAI analyzes your finances"
- Long sentences in hero copy — keep hero under 20 words per line

---

## Page Routes Summary

```
/                          ← main landing page
/features/cashflow         ← cashflow prediction deep dive
/features/copilot          ← AI copilot deep dive
/features/risk-radar       ← risk radar deep dive
/features/health-score     ← health score deep dive
/features/behavioral       ← behavioral intelligence deep dive
/features/simulators       ← debt + scenario simulators
/features/subscriptions    ← subscription intelligence
/pricing                   ← pricing tiers
/privacy                   ← privacy policy
/terms                     ← terms of service
/login                     ← existing auth page
/signup                    ← existing auth page
```
