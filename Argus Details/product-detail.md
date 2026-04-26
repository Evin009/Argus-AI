# ArgusAI — Product Detail

## What Is ArgusAI?

ArgusAI is an AI-powered financial intelligence system. Unlike standard budgeting apps that show you what you already spent, ArgusAI looks forward — it predicts risk, forecasts your cashflow, and helps you make smarter money decisions before problems happen.

It connects to your real bank accounts, learns your financial patterns, and gives you an AI copilot that reasons about your actual numbers — not generic advice.

---

## All Product Features

### Tier 1 — Core MVP

**1. User Authentication**
Secure sign-up and login using email or Google. Sessions stay alive with automatic token refresh. Powered by Supabase Auth.

**2. Bank Account Linking**
Connect your real bank accounts and credit cards via Plaid. ArgusAI reads your data — it never moves money.

**3. Transaction Ingestion Pipeline**
Every transaction from your bank is automatically pulled in, cleaned up, and stored. Runs in the background continuously.

**4. Automated Categorization**
Claude reads each transaction and labels it — Dining, Subscriptions, Groceries, etc. — without any manual input from you.

**5. Recurring Bill Detection**
Scans your transaction history and identifies bills that repeat — rent, utilities, insurance — even if the exact amount changes slightly month to month.

**6. Subscription Tracking Dashboard**
One screen showing every subscription you're paying for, how much each costs, and when each one renews.

**7. Monthly AI Financial Report**
At the end of each month, Claude writes you a personalized summary covering what changed, what patterns showed up, and what to keep an eye on.

---

### Tier 2 — Advanced Intelligence

**8. AI Financial Copilot Chat**
A chat interface powered by Claude. Ask anything — "Why did I overspend last month?" — and it answers using your actual account data and transaction history.

**9. Cashflow Prediction Engine**
Projects your bank balance 30–60 days forward based on your income patterns, known bills, and spending habits. Shows a daily balance curve, not just a single number.

**10. Debt Payoff Simulator**
Enter your debts and it runs two strategies side-by-side — Snowball (smallest balance first) vs. Avalanche (highest interest first) — showing which saves you more money and gets you debt-free faster.

**11. Dynamic Financial Health Score**
A 0–100 score that updates daily across four dimensions: how liquid you are, how stable your income is, how heavy your debt load is, and how volatile your spending is.

**12. Risk Radar Feed**
Proactive alerts that fire before something goes wrong — low balance warning, overdraft risk in 7 days, credit utilization spiking toward 30%.

---

### Tier 3 — Elite Differentiators

**13. Interactive Scenario Simulator**
Drag a slider — "What if I earned $800 more per month?" — and watch your cashflow forecast and health score update in real time.

**14. Behavioral Spending Intelligence**
Learns your personal spending rhythm over time. Surfaces patterns you don't notice — "You tend to overspend on dining 2 weeks after every paycheck."

**15. Subscription Creep Detection**
Notices when your subscriptions quietly get more expensive. Flags the ones that crept up — "Your streaming bundle is $4.99 higher than 3 months ago."

**16. Goal-Based AI Savings Planner**
Set a savings target — "$5,000 emergency fund by October" — and get a month-by-month roadmap with milestones that adjusts as your finances change.

**17. Anomaly Detection**
Automatically flags unusual transactions — one-time spikes, duplicate charges, foreign transactions, or anything that breaks your normal spending pattern.

**18. Cashflow Probability Modeling**
Instead of a single forecast line, shows a confidence band — "You have a 78% chance of staying above $500 all month." Accounts for spending volatility.

**19. AI Decision Engine**
Ask "Can I afford a $1,400 MacBook right now?" and get a structured yes/no with exact financial impact — projected deficit, best timing, effect on your savings goals.

---

### Tier 4 — New Features (Planned)

**20. Spending Streak / Momentum Tracker**
Tracks consecutive weeks you stay under budget in a given spending category. Surfaces positive reinforcement — "You've stayed under budget on dining for 3 weeks" — in your Dashboard and Behavioral Insights page. Stored as streak insights so the Copilot can reference your momentum.

**21. Bill Due Date Calendar View**
A monthly calendar showing every upcoming bill with its amount and due date. Color-coded by urgency — red if due within 7 days, amber if 8–14 days. Gives you a clear visual of when your money leaves, not just how much.

**22. Sync Reliability Indicator**
Each linked account shows a live sync health badge — green if synced within the last hour, amber if over 6 hours, red if over 24 hours or failed. Reconnecting a bank never loses your transaction history because all syncs are idempotent by Plaid transaction ID.

**23. Smart Payment Allocation**
Tracks all your credit card balances and due dates in one place. When a direct deposit lands in your checking account, ArgusAI recommends exactly how to split it — which cards to pay, how much to each, what to reserve for bills, and what to put toward savings. Enforces a configurable buffer so your checking never goes too low.

**21. Bonus Recommender**
Recommends current checking account bonuses, credit card signup bonuses, and high-yield savings bonuses tailored to your profile. Filters out banks you already have. Uses live web search so results are always current.

**22. Credit Score Integration**
Pulls your credit score via Experian Connect (soft pull — no impact on your score). Tracks your score over time, shows what factors are helping or hurting, and gives you specific, actionable steps to improve your score based on your real account data.
