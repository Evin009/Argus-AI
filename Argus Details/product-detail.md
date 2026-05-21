# ArgusAI — Product Detail

## What Is ArgusAI?

ArgusAI is an AI-powered financial intelligence system. Unlike every budgeting app on the market — Mint, Monarch, Rocket Money, Origin — ArgusAI does not show you what you already spent and call that insight. It watches your money the way a senior financial analyst would: continuously, proactively, and with memory of who you are. It predicts what is coming, fires decisions before you ask, and gets smarter about your specific financial behavior every single day.

**The one-line difference:** Every other app is a mirror. ArgusAI is a window.

---

## All Product Features

### Tier 1 — Core Foundation
*The infrastructure that makes everything else possible.*

**1. User Authentication**
Secure sign-up and login via email or Google OAuth. JWT-based sessions with automatic refresh token rotation. Powered by Supabase Auth — no custom auth implementation.

**2. Bank Account Linking**
Connect real bank accounts and credit cards via Plaid. ArgusAI is read-only — it never moves money, never stores credentials. AES-256 encryption on all Plaid access tokens at rest.

**3. Transaction Ingestion Pipeline**
Every transaction from every linked account is automatically pulled, deduplicated by Plaid transaction ID, normalized, and stored. Runs in the background after every sync trigger. Idempotent — re-running never creates duplicates.

**4. AI-Powered Categorization**
Claude reads every transaction and classifies it — Dining, Subscriptions, Groceries, Transportation, Healthcare, and more — without any manual input. Re-runs on demand to correct miscategorized charges. Subcategory granularity (e.g., "restaurants" within FOOD_AND_DRINK).

**5. Predictive Bill Detection**
Scans transaction history, groups by merchant, and identifies recurring charges — even when amounts vary slightly month to month. Goes beyond detection: models historical amount variance and projects whether the next charge will be higher, lower, or on track. Cross-references with projected balance on the due date and fires an alert if the bill will land when the balance is at risk.

> "Your electric bill is due June 3. It has increased 18% over 6 months. Your projected balance that day is $94. This bill will likely overdraft you."

**6. Subscription Tracking with ROI Scoring**
One screen showing every subscription — cost, billing cycle, price history. Enhanced with ROI scoring: for each subscription, ArgusAI infers usage from transaction patterns and calculates cost-per-use. Flags subscriptions where you are paying for something you're not using.

> "You pay $199/year for Amazon Prime. Based on your order history, you've placed 6 deliveries in 12 months. Your cost per delivery is $33. Standard shipping would have cost $42. Prime is barely worth it for you."

**7. Spending Velocity Alerts**
Real-time intra-month warnings — not a monthly review of what happened, but a mid-month flag that you're on pace to exceed a category before it's too late to do anything about it.

> "It's the 9th. You've spent $218 on dining out of a $300 baseline. At this rate you'll finish at $412. The next 5 days have no bills — easy window to reset."

---

### Tier 2 — Daily Intelligence
*The features users open every morning. What makes ArgusAI a daily habit instead of a monthly check-in.*

**8. Safe to Spend Today**
A single prominently displayed number — updated every morning — showing exactly how much you can spend on anything today without affecting any upcoming bills, savings goals, or safety buffer. Not your account balance. Your real spending power after everything that's already spoken for is subtracted.

> **Safe to Spend: $124**
> Based on: $900 rent due Jun 2 · $180 insurance due Jun 6 · $50 savings goal Jun 15 · $150 buffer reserve

This is the feature people check before every discretionary purchase. No competitor offers it. It eliminates the most common cause of overspending: a balance that looks healthy but is already committed.

**9. Financial Weather Forecast**
A daily human-readable summary of your financial conditions for the next 7 and 30 days, using weather as the risk metaphor. Makes financial risk approachable and scannable without charts.

> **Today: Clear** — Balance healthy, no bills due this week.
> **Thursday: Mild turbulence** — $420 in bills land. Projected balance: $340.
> **June 13: Storm warning** — Electric bill, gym, and Netflix all land one day before your paycheck. Balance dips to -$28 if paycheck is even 1 day late.

**10. Financial Stress Index**
A separate signal from the Health Score — not "how healthy are your finances overall" but "how much financial pressure are you under right now." Inputs: ratio of upcoming bills to current balance, days until next income vs. current balance, spending volatility in the last 7 days, accounts below safe threshold. Displayed as a clear label, not a number.

> **Low Pressure** / **Moderate Pressure** / **High Pressure** / **Critical**

A user can have a strong Health Score and still be under critical pressure because their paycheck is 9 days out and $800 in bills land in 4 days. No app captures that distinction.

**11. Pay Timing Intelligence**
Tells you the optimal day to pay each bill and credit card — not just to avoid late fees, but to maximize credit score impact and maintain the highest average daily balance.

*Credit Utilization Optimization:* Your credit utilization is reported to bureaus on your statement closing date, not your due date. ArgusAI identifies your closing dates and tells you exactly when to pay and how much to report at the utilization you want.

> "Pay $X on your Chase Sapphire by June 14 — one day before your closing date. This drops your reported utilization from 34% to 9%, likely adding 15–25 points to your score."

*Bill Stacking Detection:* When multiple bills land in the same 3-day window and the total exceeds your projected balance, ArgusAI tells you which ones have grace periods and the exact payment order to avoid penalties while smoothing the cash hit.

**12. Budget Strategy Updates from Bill Changes**
When any bill changes — rent goes up, a subscription price increases, an insurance premium adjusts — ArgusAI immediately recalculates the downstream impact and generates a revised spending strategy. Not just "your bill went up." A specific plan to absorb it.

> "Your fixed expenses increased by $128/month. Here are three ways to absorb this without affecting your goals: (1) Reduce dining by $60 and entertainment by $70. (2) Cancel your Hulu plan — no usage detected in 6 weeks. (3) Delay your emergency fund goal by 5 weeks and maintain current patterns."

**13. Financial Memory Timeline**
A chronological story of your financial life — automatically generated from your transaction and account history. Every significant event logged: price increases, new subscriptions, rent changes, goal milestones, spending spikes, debt payoffs.

> **May 2026** — Rent increased $125. Netflix price increase detected (+$2.99).
> **March 2026** — Gym membership added ($49/month). No usage signals detected since April.
> **January 2026** — Emergency fund reached $1,000 for the first time.
> **October 2025** — Spending spike: +$340 above baseline. Pattern: seasonal.

This gives ArgusAI deep context for everything and gives the Copilot long-term memory to reason across. It turns your financial history from a list of transactions into a readable narrative.

---

### Tier 3 — Predictive Intelligence
*The system running in the background before you ask a question.*

**14. Continuous Intelligence Briefing**
Replaces the monthly report entirely. Instead of a once-a-month summary, ArgusAI generates a brief after every significant financial event: a large transaction, a salary deposit, a bill that came in higher than expected, a pattern crossing a threshold. A living feed of intelligence that fires when something worth knowing happens — not on a schedule.

**15. Proactive Analyst Decisions**
After every sync, a Claude-powered financial analyst reviews your complete picture — enriched bills, subscriptions, 90-day transaction patterns, account balances, and your persistent financial profile — and generates 3–5 structured decisions without you asking anything. Not summaries. Decisions with reasoning, recommendations, and forward simulations.

> **Risk / Warning:** "Dining spend is 40% above your 90-day baseline. This is a 3-week trend, not an event. At current trajectory, dining reaches $480/month by August. Consider a $300 soft limit — you'd save $1,080 over 6 months."

The analyst learns who you are over time. After 6 months it knows your income schedule, your post-payday spending patterns, your subscription signup habits. Every session is more personalized than the last.

**16. Behavioral Spending Intelligence**
Learns your personal spending rhythm and flags when you deviate. Detects velocity spikes, day-of-week patterns, impulse purchase clusters, category drift. Stored in a persistent user profile that updates after every sync.

> "You tend to overspend on dining in the 5 days after every paycheck. This pattern has repeated for 4 consecutive pay periods. Your next paycheck lands Friday."

**17. Anomaly Detection**
Statistical outlier detection for unusual transactions: one-time spikes, duplicate charges, foreign transactions, merchant-level anomalies that break your normal spending pattern. Fires into the Intelligence Feed with severity scores.

---

### Tier 4 — Simulation & Planning
*Forward-looking tools that model your financial future.*

**18. Cashflow Prediction Engine**
30–60 day forward simulation of your balance, updated after every sync. Not a single projected number — a probability-weighted daily balance curve with confidence bands. Accounts for income regularity, known bills, and spending volatility.

> "78% probability your balance stays above $500 all month. June 13–14 is your highest-risk window: $340 in bills with a projected low of $190."

**19. Risk Radar**
Proactive alert system that scores your overdraft probability daily and fires a structured warning when risk crosses a threshold — not after the overdraft happens, but 5–10 days before, when you still have time to act. Also monitors credit utilization trending toward 30%, large bill due within 7 days with insufficient buffer, and irregular income patterns.

**20. Dynamic Financial Health Score**
A 0–100 composite score updated daily across four dimensions:
- **Liquidity (30%)** — liquid assets vs. monthly expenses
- **Stability (25%)** — income consistency and expense volatility
- **Debt Load (25%)** — credit utilization and debt-to-income ratio
- **Spending Volatility (20%)** — category-level variance vs. your personal baseline

Unlike a credit score: transparent, explainable, updates daily, and shows you exactly which dimension is dragging it down and how to fix it.

**21. Cashflow Scenario Simulator**
Adjustable income and expense sliders that show real-time impact on your 30–60 day cashflow forecast, Health Score, debt payoff timeline, and savings goal progress simultaneously.

> "A $800/month raise improves your payoff date by 8 months, raises your Health Score from 61 to 74, and drops your overdraft risk from 23% to 4%."

**22. Life Event Simulator**
Model major life decisions and see their full financial downstream impact before you commit. Built-in templates for: getting married, having a child, buying a house, quitting your job, taking a sabbatical, moving to a new city, going back to school.

> "If you have a child in 18 months at your current savings rate, your emergency fund will cover 42 days of expenses — below the recommended 90. To reach a safe buffer before that date, you need to save $380/month starting now."

**23. Debt + Cashflow Integrated Simulator**
Snowball vs. Avalanche debt payoff strategies, but run inside the cashflow engine — not in isolation. Shows which strategy is mathematically optimal AND cashflow-safe for your specific situation. Flags months where a strategy leaves you with insufficient buffer and proposes a modified schedule.

> "Avalanche saves $847 more in interest. But it leaves you with a $47 buffer in March — not enough for your utility bills. Here's a modified schedule that maintains a $200 floor and still saves $631 more than Snowball."

**24. Obstacle-Aware Goal Planning**
Set a savings target and date. ArgusAI generates a monthly contribution plan, tracks whether you're on pace, identifies the specific months where you'll fall short based on known upcoming expenses, and proactively adjusts — not just "you're behind," but a specific recovery plan.

> "You'll miss your October emergency fund target because of your July vacation spending pattern. Contributing $40 extra in May and June puts you back on track."

**25. AI Financial Copilot Chat**
Conversational AI agent powered by Claude with full tool-calling access to your financial data. Ask anything — "Why did I overspend last month?", "Can I afford a $1,400 laptop right now?", "What's the best way to pay off my cards?" — and get answers grounded in your actual numbers, not generic advice. Streams responses via SSE. Uses RAG to retrieve relevant transaction history for context.

**26. AI Decision Engine**
Ask a purchase question and get a structured affordability analysis. The system queries your current balance, upcoming bills, savings goal progress, and cashflow forecast, runs a simulation, and returns a direct recommendation.

> "Your balance after known bills this month is $820. This purchase puts you $580 in deficit. Wait until April 15 after your paycheck — you'll have $1,950 in available buffer."

---

### Tier 5 — Decision Intelligence
*Features that turn insight into action.*

**27. AI Decision Journal**
When you make a major financial commitment — a new subscription, a car loan, a lease, a large purchase — log it with one tap. ArgusAI tracks the downstream financial effects for 90–180 days and reports back: was the impact what you expected? What unintended consequences appeared? How has it affected your goals?

> **Decision: New car payment — $387/month (logged March 12)**
> *90-day check-in:* Car payment on track. However, combined with your gym membership, you've added $436/month in fixed costs since March. This is the primary driver of your savings goal moving from October to February.

**28. Subscription ROI Scoring**
For every subscription: infer usage from transaction patterns and calculate cost-per-use. Score it against what you actually get. Flag the ones where you're paying for something you're not using. Feed this into the Bill Negotiation engine.

**29. Bill Negotiation + Alternative Detection**
Three-stage process, not just "we'll negotiate for you":

*Stage 1 — Usage Analysis:* Is this subscription worth keeping at all? Usage scored from transaction evidence.

*Stage 2 — Alternative Detection:* For low-usage subscriptions, find cheaper services that cover the same need from a maintained alternatives database.
> "You pay $17.99/month for Hulu. No usage detected in 47 days. Cheaper alternatives: Amazon Prime Video (already in your Prime), Peacock Free, Tubi. Estimated annual savings: $215."

*Stage 3 — Negotiate if warranted:* Only for high-usage subscriptions priced above market. ArgusAI provides the optimal time to call, what similar customers pay, and a personalized negotiation script based on your tenure and payment history. You make the call. You keep 100% of the savings — no percentage taken.

> "Your Spectrum internet bill is $94/month. Comparable plans run $64–74. You've been a customer 28 months with no late payments — strong retention profile. Best time to call: last 3 days of the month. Estimated savings: $240–360/year."

**30. Payment Intelligence Layer**
ArgusAI analyzes your credit cards' rewards structures and upcoming bills, then tells you which card to use for each payment category to maximize cashback and rewards — and generates the optimal credit card payment amounts and timing to manage utilization.

*Card Routing:*
> "Put Hulu on your Chase Sapphire (3% streaming). Put electricity on your Citi Double Cash (2% everything). Put groceries on your Amazon card (5% at Whole Foods). Estimated annual rewards gain: $340."

*Credit Card Payment Optimizer:*
> "Pay $650 of your $900 Chase balance before your June 12 closing date to report at 8% utilization. Pay the remaining $250 by June 28. This protects your score and preserves $250 in checking through the June 22 paycheck gap."

Note: ArgusAI provides the intelligence and the exact steps. You execute the payments. No payment execution, no compliance exposure, no trust barrier.

**31. Smart Payment Allocation**
When a paycheck lands, ArgusAI recommends exactly how to split it: which credit cards to pay (and how much each), which bills to cover, how much to put toward savings, and what's safe to keep as discretionary. Priority-ordered to enforce a configurable buffer floor so your checking never drops too low.

---

### Tier 6 — Ecosystem Features
*Features that broaden ArgusAI's value beyond your day-to-day accounts.*

**32. Bonus Recommender**
Finds current checking account bonuses, credit card signup bonuses, and high-yield savings offers tailored to your profile. Filters out institutions you already have. Uses live web search so results are always current — not stale recommendations.

**33. Credit Score Integration**
Soft-pull credit score via Experian Connect (no impact on your score). Tracks your score history over time, shows which factors are helping or hurting, and generates specific improvement recommendations grounded in your actual account data — combined with Pay Timing Intelligence to give you a full credit optimization playbook.

---

## What ArgusAI Is Not

- Not a robo-advisor — does not invest or manage assets
- Not a licensed financial advisor — all AI outputs include appropriate disclaimers
- Not a payment processor — read-only by default via Plaid, no fund transfers initiated
- Not a credit monitoring service — no hard credit inquiries
- Not a bank

---

## Competitive Position

| Capability | Rocket Money | Monarch | Origin | **ArgusAI** |
|---|---|---|---|---|
| Subscription tracking | ✅ | ✅ | ✅ | ✅ + ROI scoring |
| AI Q&A assistant | ❌ | ✅ basic | ✅ SEC-registered | ✅ tool-calling + RAG |
| Forward cashflow simulation | ❌ | ❌ | ❌ | ✅ probability bands |
| Safe to Spend Today | ❌ | ❌ | ❌ | ✅ |
| Financial Weather Forecast | ❌ | ❌ | ❌ | ✅ |
| Proactive analyst decisions | ❌ | ❌ | ❌ | ✅ after every sync |
| Persistent learning profile | ❌ | ❌ | ❌ | ✅ |
| Life Event Simulator | ❌ | ❌ | ❌ | ✅ |
| Pay Timing Intelligence | ❌ | ❌ | ❌ | ✅ |
| Bill negotiation + alternatives | ✅ (takes 35–60%) | ❌ | ❌ | ✅ you keep 100% |
| Spending Velocity Alerts | ❌ | ❌ | ❌ | ✅ |
| Financial Stress Index | ❌ | ❌ | ❌ | ✅ |
| Payment Intelligence Layer | ❌ | ❌ | ❌ | ✅ |
| AI Decision Journal | ❌ | ❌ | ❌ | ✅ |
| Behavioral pattern learning | ❌ | ❌ | ❌ | ✅ |
| Overdraft probability scoring | ❌ | ❌ | ❌ | ✅ Risk Radar |
| Budget Strategy from bill changes | ❌ | ❌ | ❌ | ✅ |
| Financial Memory Timeline | ❌ | ❌ | ❌ | ✅ |
