# ArgusAI — Product Detail

## What Is ArgusAI?

AI-powered financial intelligence system. Not a budgeting app.
Every other app shows what you spent. ArgusAI tells you what is
about to happen and what to do about it.

**One line:** Every other app is a mirror. ArgusAI is a window.

---

## Three-Layer Model

| Layer | Purpose |
|---|---|
| Hub | All accounts, cards, bills, subscriptions unified in one place |
| Brain | AI watching continuously — detects patterns, forecasts, warns before problems happen |
| Guide | Goal-based action plans grounded in real numbers — debt, credit, savings |

---

## AI Architecture

**Core principles:**
- All outputs grounded in real account data — no generated numbers
- Financial math runs in Python code. LLM explains results, never computes them
- Behavioral fingerprint builds passively from transaction history over time
- Tiered RAG memory — never a full context dump

**Memory tiers:**
| Tier | Contents | Purpose |
|---|---|---|
| Hot | Last 90 days (pgvector) | Retrieved at query time via cosine search |
| Distilled | Monthly AI summaries in ai_insights | Compressed history — one row per month |
| Profile | user_financial_profiles table | Static facts: income, goals, risk tolerance, behavioral tags |

**AI traits powering every feature invisibly:**
- Behavioral fingerprint — spending rhythm, patterns, habits per user
- Anomaly detection — z-score and Isolation Forest for statistical outliers
- Velocity tracking — current spend pace vs. rolling baseline
- Pattern recognition — day-of-week habits, category drift, impulse clusters
- RAG memory — pgvector retrieves relevant history at query time

These are never user-facing. They make every feature smarter and more personalized. The LLM is the narrator, never the sensor.

---

## Features

### Tier 1 — Daily Intelligence
*What users open every morning.*

**Safe to Spend Today**
One number updated every morning. Current balance minus all committed bills, goal contributions, and buffer reserve. Not your bank balance — your actual free money today. The feature users check before every purchase.

**Smart Payment Calendar**
Unified calendar showing every subscription, bill, credit card payment, and AI-recommended payment date. Brand logos for instant recognition — no reading required. Dropdown filters by type: subscriptions / credit bills / AI dates. Every AI-suggested date is goal-aware — tap to see what goal it serves and what happens if missed.

---

### Tier 2 — Know Yourself
*Intelligence layer delivered through three surfaces.*

**Argus Guardian**
Ambient intelligence that lives outside the app. Chrome extension on desktop detects checkout pages and product pages across all retailers. Fires a compact visual verdict on top of the screen — brand logo, one reason, Safe to Spend number. Post-purchase: immediate recovery plan with three specific options ranked by least disruption. All AI traits run silently behind it. The user sees one verdict. The system ran the full analysis.

**Financial Profile Page**
Three levels deep — visual, interactive, zero jargon:

Level 1 — Overview:
- Spending breakdown ring by category
- Habit streaks grid (GitHub-style contribution graph)
- Subscription logo grid — active lit up, unused dimmed with wasted cost badge
- Health score trajectory sparkline
- Credit utilization gauge — color shifts green to red toward 30%
- Biggest spend day bar chart

Level 2 — Category drill-down:
- All merchants within a category, ranked by total spend
- Month-over-month comparison per merchant

Level 3 — Merchant Intelligence:
- Per-merchant page, dynamically generated per user
- Only exists for merchants the user actually uses
- Builds from first transaction, gets richer over time
- Weekly/monthly/yearly spend charts
- Frequency heatmap
- Cost trend line
- One specific Argus insight backed by real data

**AI Copilot**
On-demand financial analyst. Responds with charts, tables, and visual verdicts — never paragraphs. RAG-powered across full transaction history. Handles spending analysis, affordability decisions, debt strategy, goal questions, historical patterns. Side panel mode available on any screen via Cmd+K — context-aware, conversation persists across navigation.

---

### Tier 3 — Simulation & Planning
*Forward-looking tools that model your financial future.*

**Cashflow Prediction Engine**
30–60 day forward balance curve. Confidence bands shaded around it. Risk windows turn amber and red where balance gets dangerous. Bill markers on the curve — tap for merchant detail and amount. Scrub any day for projected balance. Toggle between 30 and 60 day view. Visual only — no text required to understand the full picture.

**Financial Health Score**
0–100 composite score across four dimensions:
- Liquidity (30%) — liquid assets vs. monthly expenses
- Stability (25%) — income consistency and expense volatility
- Debt Load (25%) — credit utilization and debt-to-income ratio
- Spending Volatility (20%) — category variance vs. personal baseline

Updates daily. Fully gamified:
- Score ring — animated copper arc, fills as score improves
- Four dimension challenge bars — shows exactly what to do to move each
- Streak contribution graph (GitHub-style) — copper squares for good days
- Weekly delta — one number, green or red
- Milestone animations when thresholds crossed — subtle copper pulse
- Social sharing card at milestones

**Scenario Simulator**
Two tabs — Custom and Life Events.

Custom tab: income, rent, expense category, and extra debt payment sliders. All pre-populated from real account data. Hypothetical inputs layered on top.

Life Events tab: templated major decisions — getting a car, having a child, buying a house, quitting job, moving cities, going back to school. Pre-populates relevant variables automatically.

Four outputs update simultaneously in real time as any slider moves:
- Cashflow curve redraws
- Health score ring adjusts
- Debt payoff date shifts
- Goal target date moves

**Obstacle-Aware Goal Planning**
Visual goal cards — UI design TBD (liquid fill, orbit ring, or terrain visualization). Shows target amount, target date, current pace, and on-track status. Argus Guardian ambient alerts fire whenever any payment impacts goal trajectory. Recovery plan activates automatically when goal falls behind — three specific options with exact amounts and outcome projections. User picks one → goal plan updates immediately → Guardian monitors the commitment → one reminder if slipping.

---

### Tier 4 — Decision Intelligence
*Turns insight into action.*

**Subscription Alternative Detection**
Detects unused or overpriced subscriptions automatically from transaction patterns. Shows brand logo of flagged service, exact reason flagged (days since last use, cost vs. alternatives), and a cheaper alternative the user doesn't already have. One tap — cancel or keep. Annual saving calculated automatically. Zero friction.

**Card Routing**
Visual card chip per spending category showing which connected card maximizes rewards for that category. Uses actual card designs and bank branding. Annual rewards gain calculated monthly. Guardian notifies at point of purchase via overlay which card to grab. Updates automatically as new merchants appear in transactions.

**Merchant Intelligence**
See Financial Profile Page — Tier 2. Lives as Level 3 drill-down inside the profile, not a separate screen.

---

### Tier 5 — Ecosystem
*Broadens ArgusAI's value beyond daily accounts.*

**Credit Intelligence Hub**
Apple Wallet-style card collection. Realistic card designs with bank branding, stacked with peek of cards underneath. Tap any card to expand full intelligence view:
- Utilization gauge — visual arc, green to red approaching 30%
- Current balance and available credit
- Statement closing date — highlighted if within 7 days
- Active offers — green chips
- Unused benefits — red chips with estimated annual saving
- Total spending power across all cards without crossing 30% utilization

Includes **Bonus Recommender** — personalized credit card signup bonuses, checking account bonuses, and high-yield savings offers based on real spending patterns. Live web search so results are always current. Filters out institutions the user already has.

Includes **Credit Score** — soft pull via Experian Connect, no credit impact. Score history sparkline over time. Factor breakdown — payment history, utilization, account age, inquiries. Specific improvement actions connected directly to Smart Payment Calendar dates.

---

## Desktop Enhancements

Eight enhancements that make the product feel fundamentally different from every competitor:

| Enhancement | What it does |
|---|---|
| Argus Guardian Extension | Intercepts financial decisions at checkout in real time |
| First Insight Engineering | Single most surprising, specific, true insight on day one — hooks user permanently |
| Merchant Logo Database | Clearbit + Plaid logos everywhere — no generic icons anywhere |
| Proactive Recovery Plans | Every negative signal comes with an immediate specific recovery path |
| Notification Design | Specific, visual, consistently right — builds compounding trust over weeks |
| Specificity Standard | Merchant + amount + date required — or the insight does not ship |
| Voice Interface | Floating system-level overlay — quick answers without opening the app |
| Copilot Side Panel | Cmd+K on any screen — context-aware, conversation persists |

**Voice + Side Panel unified flow:**
"Hey Argus" or Cmd+K → floating overlay appears on top of system → compact visual answer → user says "go deeper" → Copilot side panel opens with full analysis already loaded.

**Specificity rule (applies everywhere):**
Every insight must have a specific merchant, specific dollar amount, and specific timeframe — or it does not surface. Silence is better than a generic insight.

---

## Platform Strategy

| Phase | Platform | What ships |
|---|---|---|
| 1 | Web App | All 13 features, full dashboard |
| 2 | Chrome Extension | Argus Guardian, checkout detection, browser notifications |
| 3 | Desktop App (Mac + Windows) | Voice overlay, wake word, native OS notifications, menu bar icon |
| 4 | Mobile (iOS + Android) | Push notifications, Apple Pay intercept, condensed views, Apple Watch |

Desktop app is a lightweight background process — menu bar copper icon, wake word detection, voice overlay. Not a second full app. The web app is the product. The desktop app is the ambient layer.

---

## What ArgusAI Is Not
- Not a robo-advisor — does not invest or manage assets
- Not a licensed financial advisor — all AI outputs include disclaimers
- Not a payment processor — read-only via Plaid, no fund transfers initiated
- Not a credit monitoring service — no hard credit inquiries
- Not a bank

---

## Competitive Position

| Capability | Rocket Money | Origin | ArgusAI |
|---|---|---|---|
| Safe to Spend Today | ❌ | ❌ | ✅ |
| Ambient decision interception | ❌ | ❌ | ✅ Guardian |
| Forward cashflow simulation | ❌ | ❌ | ✅ |
| Gamified health score | ❌ | ❌ | ✅ |
| Merchant Intelligence | ❌ | ❌ | ✅ |
| Voice financial assistant | ❌ | ❌ | ✅ |
| Credit Intelligence Hub | ❌ | ❌ | ✅ |
| Card routing optimization | ❌ | ❌ | ✅ |
| Scenario simulation | ❌ | ❌ | ✅ |
| Recovery plans | ❌ | ❌ | ✅ |
| Investment tracking | ❌ | ✅ | ❌ Future |
| Bill negotiation | ✅ takes 35–60% | ❌ | ❌ Cut — too much friction |
