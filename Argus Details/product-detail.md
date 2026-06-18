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
| Argus (the Brain) | A living, self-improving AI that watches continuously, knows your full financial history, and reasons about what's coming |
| Guide | Goal-based action plans grounded in real numbers — debt, credit, savings |

---

## Argus — The Brain

Argus is not a chatbot bolted onto the app. Argus **is** the product — a personal financial analyst that lives inside ArgusAI, knows your complete financial history, goals, and behavior, and reasons about your money continuously. Every other feature in this document is a **display or action surface for Argus** — a way Argus shows you something or acts on your behalf. None of them are independent AI systems.

### Architecture

- Built early as core infrastructure, not a single feature shipped in one phase. Argus starts alive with whatever tools exist on day one (categorization, bills, subscriptions) and **gains new tools as each engine ships** — Cashflow, Goal Planning, Card Routing, Credit Intelligence each register themselves as new senses/capabilities Argus can call on.
- LangGraph supervisor graph routes each query or internal decision to specialist agents (Cashflow, Risk, Debt, Goal, Card, Credit) as those domains come online.
- All financial math runs in deterministic Python code (engines). Argus narrates and reasons over the output — it never invents a number.

### Self-Improving, Not Self-Retraining

Argus does not retrain or fine-tune its underlying model — that's neither safe nor practical for a product giving financial guidance. Instead, Argus grades its own track record:

1. Every prediction or recommendation Argus makes ("you'll overdraft on the 27th," "cancel this subscription," "use Avalanche not Snowball") is logged to an **outcome ledger**.
2. A follow-up job later checks what actually happened — did the prediction come true, did the user act on the recommendation, what was the result.
3. That ledger feeds back into Argus's own context. Future reasoning for that user references its own track record — calibrating confidence and adapting strategy per-user over time ("my last 4 overdraft warnings for this user were accurate," "this user follows debt advice but ignores subscription-cancel suggestions").

This makes Argus genuinely adaptive and personalized without ever touching model weights.

### Memory

| Tier | Contents | Purpose |
|---|---|---|
| Hot | Last 90 days (pgvector) | Retrieved at query time via cosine search |
| Distilled | Monthly AI summaries in `ai_insights` | Compressed history — one row per month |
| Profile | `user_financial_profiles` table | Static facts: income, goals, risk tolerance, behavioral tags |
| Outcomes | Outcome ledger | Argus's own track record of predictions vs. what actually happened |

### Invisible AI Traits

These run silently behind every Argus response — never user-facing on their own:
- Behavioral fingerprint — spending rhythm, patterns, habits per user
- Anomaly detection — statistical outliers, duplicate charges, unusual transactions
- Velocity tracking — current spend pace vs. rolling baseline
- Pattern recognition — day-of-week habits, category drift, impulse clusters
- RAG memory — pgvector retrieves relevant history at query time

**Specificity rule (applies everywhere Argus speaks):** every insight must have a specific merchant, specific dollar amount, and specific timeframe — or it does not surface. Silence is better than a generic insight.

### Surfaces

Argus is one brain, expressed through several different surfaces depending on platform and context:

| Surface | Platform | What it does |
|---|---|---|
| Chat + Side Panel | Web | On-demand conversation. Cmd+K opens a context-aware side panel from any screen, conversation persists across navigation. Responds with charts, tables, and verdict cards — never paragraphs. Handles affordability questions, debt strategy, goal questions, historical patterns, and live "what-if" scenario re-projection (no dedicated simulator UI needed — Argus runs the same engine math and answers inline). |
| Guardian overlay | Chrome Extension | Real-time checkout/product-page interception. Fires a compact verdict (brand logo, one reason, Safe to Spend number) before a purchase. Post-purchase: immediate recovery plan with three ranked options. |
| Voice overlay | Desktop (Mac/Windows) | "Hey Argus" or system-level wake word → floating overlay → compact visual answer → "go deeper" opens the full Copilot side panel in the web app. |
| Ambient alerts | Cross-platform | Goal-trajectory warnings, recovery plan triggers, native OS notifications — fires the moment a relevant signal occurs, not on a fixed schedule. |

---

## Features

Each feature below is tagged with its **primary platform**: 🌐 Web App, 🧩 Chrome Extension, 🔔 Ambient/Cross-platform.

### Tier 1 — Daily Intelligence
*What users open every morning.*

**🌐 Safe to Spend Today**
One number, recomputed daily. Current balance minus bills due before your next payday, active goal contributions, and a buffer reserve. Bill window is dynamic — always looks ahead to the next payday rather than a fixed number of days. Buffer starts as an AI-suggested estimate (from early spending volatility, or a sane default before data exists) and is user-overridable in settings at any time. The number you check before every purchase.

**🌐 Smart Payment Calendar**
Unified calendar of every subscription, bill, credit card payment, and AI-recommended payment date, with brand logos. Two engines power the recommendations: a credit utilization optimizer (when to pay cards down before statement close) and a bill-stacking detector (warns when too many bills cluster in a tight window relative to your balance). Filterable by type. Every AI-recommended date is goal-aware — tap to see Argus's reasoning.

---

### Tier 2 — Know Yourself
*Argus, delivered through three surfaces.*

**🧩 Argus Guardian**
Chrome extension. Detects checkout and product pages across retailers, fires a compact visual verdict overlay (brand logo, one reason, Safe to Spend number) before a purchase. Also the surface where Card Routing speaks — overlays "use this card" at the point of purchase. Post-purchase: immediate recovery plan with three ranked options.

**🌐 Financial Profile Page**
Three levels deep — visual, interactive, zero jargon.

- Level 1 — Overview: spending breakdown ring, habit streaks grid (GitHub-style), subscription logo grid (active vs. unused), credit utilization gauge, biggest spend day chart.
- Level 2 — Category drill-down: all merchants within a category, ranked by spend, month-over-month comparison.
- Level 3 — Merchant Intelligence: per-merchant page, dynamically generated only for merchants the user actually uses. Weekly/monthly/yearly spend charts, frequency heatmap, cost trend, one specific Argus insight.

**🌐 Argus Chat + Side Panel**
See "Argus — The Brain" above for full detail. On-demand financial analyst, RAG-powered across full transaction history, Cmd+K side panel, charts/tables/verdict cards only — no paragraph responses. Also where "what if" scenario questions are answered conversationally, instead of a dedicated simulator screen.

---

### Tier 3 — Simulation & Planning
*Forward-looking tools, computed by engines Argus reasons over.*

**🌐 Cashflow Prediction Engine**
30–60 day forward balance curve. Confidence bands (P10/P50/P90) shaded around it. Risk windows turn amber/red where balance gets dangerous. Bill markers on the curve — tap for merchant detail and amount. Scrub any day for projected balance. Toggle between 30 and 60 day view. This is also the engine Argus calls when answering "what if" questions in chat.

**🌐 Obstacle-Aware Goal Planning**
Visual goal cards — target amount, target date, current pace, on-track status. Ambient alerts fire whenever a payment or event impacts goal trajectory. Recovery plan activates automatically when a goal falls behind — three specific options with exact amounts and outcome projections. User picks one, the goal plan updates immediately, and Argus keeps watching the commitment.

---

### Tier 4 — Decision Intelligence
*Turns insight into action.*

**🌐 Subscription Alternative Detection**
Lives on the existing Subscriptions page (not a separate page) — adds a flag for unused or overpriced subscriptions, the exact reason (days since last use, cost vs. alternatives), and a cheaper alternative the user doesn't already have. One tap to cancel or keep. Annual saving calculated automatically.

---

### Tier 5 — Ecosystem
*Beyond daily accounts.*

**🌐 Credit Intelligence Hub**
Apple Wallet-style card stack on a dedicated screen. Selecting a card dynamically opens a per-card page with:
- Utilization gauge, current balance, available credit
- Statement closing date — highlighted if within 7 days
- Active offers (green chips), unused benefits (red chips, estimated annual saving)
- **Card Routing** — which spending categories this card is best for and estimated annual rewards. Computed continuously in the background by Argus; surfaced in two places — the Guardian overlay at real checkout (🧩), and inline on Subscriptions/Bills pages (🌐) when a payment is coming up.
- Total spending power across all cards without crossing 30% utilization

Also includes:
- **Bonus Recommender** — personalized credit card / checking / high-yield-savings signup bonus suggestions based on real spending, via live web search, filtered to exclude accounts already held.
- **Credit Score** — soft-pull via Experian Connect (no credit impact), score history sparkline, factor breakdown, improvement actions tied directly to the Smart Payment Calendar.

---

## Removed / Folded Features

For traceability — these existed in earlier drafts and were deliberately changed:

| Feature | Disposition | Why |
|---|---|---|
| Financial Health Score | **Cut entirely** — no public score, no internal signal | Decided not core to the product's value; gamification (streaks, milestones, social share) didn't fit the brand's "sharp, watchful, premium" voice |
| Scenario Simulator (dedicated slider UI) | **Folded into Argus chat** | Same underlying Cashflow Engine re-projection, but answered conversationally — a dedicated screen wasn't worth the UI investment when chat already covers it |
| Card Routing (standalone section) | **Merged into Credit Intelligence Hub** | Belongs on the per-card page it's describing rather than a separate section; surfaced live via Guardian (checkout) and in-app (Subscriptions/Bills) |
| "AI Copilot" (naming) | **Renamed to Argus** | Reframed as the product's central brain, not a chat utility — every feature is now explicitly a surface for Argus, not a separate AI system |

---

## Desktop Enhancements

Enhancements that make the product feel fundamentally different from every competitor:

| Enhancement | Platform | What it does |
|---|---|---|
| Argus Guardian Extension | 🧩 Chrome | Intercepts financial decisions at checkout in real time |
| First Insight Engineering | 🌐 Web | Single most surprising, specific, true insight on day one — hooks user permanently |
| Merchant Logo Database | 🌐 Web | Clearbit + Plaid logos everywhere — no generic icons anywhere |
| Proactive Recovery Plans | 🔔 Ambient | Every negative signal comes with an immediate specific recovery path |
| Notification Design | 🔔 Ambient | Specific, visual, consistently right — builds compounding trust over weeks |
| Specificity Standard | 🌐 Web / 🧩 Chrome | Merchant + amount + date required — or the insight does not ship |
| Voice Interface | 🔔 Ambient (Desktop) | Floating system-level overlay — quick answers without opening the app |
| Copilot Side Panel | 🌐 Web | Cmd+K on any screen — context-aware, conversation persists |

**Voice + Side Panel unified flow:**
"Hey Argus" or Cmd+K → floating overlay appears on top of system → compact visual answer → user says "go deeper" → Argus side panel opens with full analysis already loaded.

---

## Platform Strategy

| Phase | Platform | What ships |
|---|---|---|
| 1 | Web App | All web features, full dashboard, Argus chat + side panel |
| 2 | Chrome Extension | Argus Guardian — checkout detection, card routing overlay, browser notifications |
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
| Self-improving financial brain (Argus) | ❌ | ❌ | ✅ |
| Merchant Intelligence | ❌ | ❌ | ✅ |
| Voice financial assistant | ❌ | ❌ | ✅ |
| Credit Intelligence Hub | ❌ | ❌ | ✅ |
| Card routing optimization | ❌ | ❌ | ✅ |
| "What if" scenario answers via chat | ❌ | ❌ | ✅ |
| Recovery plans | ❌ | ❌ | ✅ |
| Investment tracking | ❌ | ✅ | ❌ Future |
| Bill negotiation | ✅ takes 35–60% | ❌ | ❌ Cut — too much friction |
