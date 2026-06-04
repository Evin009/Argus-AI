# Landing Page Discussions

## What to Highlight — Section by Section

### Hero — The Big Idea
- Forward-looking, not backward-looking — every other app shows what you spent; ArgusAI tells you what's about to happen
- Positioning: financial intelligence system, not a budgeting app

### The Problem — Why Existing Apps Fail
- They report the past, you need to know the future
- Alerts come after overdrafts happen, not before
- No behavioral intelligence — they categorize, they don't learn
- Dashboard theater — charts with no actionable reasoning

### Three-Layer Model (how to frame the product)
- **Hub** — everything in one place, complete visibility across all accounts
- **Brain** — AI that watches continuously, fires before problems happen
- **Guide** — goal-based action plans: debt payoff, credit building, savings, overspending

### How the AI Actually Learns You (trust + credibility)
- All AI outputs grounded in your real account data — no generated numbers
- Deterministic math done in code, not by the LLM (cashflow, debt, health score)
- Behavioral fingerprint built over time — gets smarter the longer you use it
- Memory across sessions via RAG — reasons about "last March" vs "this March"

### Security
- Read-only access via Plaid — ArgusAI cannot move your money
- Bank-level encryption (AES-256)
- Not a financial advisor — intelligence layer, not advice

---

## All Product Features

Bulleted with one-line explanation of what each does.

### Intelligence Layer (Brain)
- **Cashflow Prediction** — 30–60 day forward simulation of your balance based on spending patterns and known bills
- **Risk Radar** — daily overdraft probability scoring that fires warnings before the problem, not after
- **Behavioral Intelligence** — learns your personal spending rhythm and surfaces patterns you've never consciously noticed
- **Pattern Detection** — identifies day-of-week spend habits, category drift, and velocity spikes over time
- **Behavioral Alerts** — proactively flags when behavior has crossed a meaningful threshold ("dining budget exceeded 3 months in a row")
- **Anomaly Detection** — flags statistically unusual charges: new merchants, duplicate transactions, one-time spikes
- **Subscription Creep Detection** — detects gradual price increases across subscriptions users typically miss
- **Cashflow Probability Modeling** — outputs confidence intervals on forecasts, not just a single projected number
- **Monthly AI Financial Report** — automated monthly summary with AI-generated insights and trend analysis

### AI Copilot
- **AI Financial Copilot** — conversational AI that reasons against your actual account data, not generic financial advice
- **Decision Engine** — answers "can I afford this?" with a structured affordability analysis and downstream impact simulation
- **Context-Aware Financial Memory (RAG)** — AI remembers your financial history across sessions and can reason about past periods

### Simulations & Planning (Guide)
- **Debt Payoff Simulator** — Snowball vs Avalanche strategies simulated against your real cashflow with projected payoff dates
- **Scenario Simulator** — income/expense sliders that show real-time impact on your 30–60 day cashflow forecast
- **Goal-Based Savings Planner** — set a savings target and get a structured adaptive roadmap with monthly milestones

### Visibility & Awareness (Hub)
- **Financial Health Score** — 0–100 composite score across four dimensions (Liquidity, Stability, Debt Load, Spending Volatility), updates daily
- **Subscription Tracker** — visual overview of all active subscriptions with amounts, billing cycles, and price change flags
- **Bill Calendar** — every upcoming bill and due date, color-coded by urgency and risk
- **Smart Allocation** — when a deposit lands, recommends exactly how to split it across goals and obligations

---

## Not Features — Foundational Elements

These are necessary for the product to work but are not highlights and should not be framed as selling points.

- **Bank account linking** — connecting accounts via Plaid (infrastructure, not a feature)
- **Credit and debit card connection** — adding cards to the platform so data can flow in
- **Transaction sync and ingestion** — pulling, normalizing, and storing raw transactions from Plaid
- **Automated transaction categorization** — classifying transactions into spending categories (backend pipeline, powers features but is not itself one)
- **Recurring bill detection** — backend logic that identifies recurring charges (surfaces as Bill Calendar and Risk Radar, not a user-facing feature on its own)
- **User authentication** — email and Google sign-in, JWT session management
- **Read-only access model** — ArgusAI cannot initiate transfers or modify accounts
- **AES-256 encryption** — encryption at rest for sensitive data including Plaid tokens
- **Row-level security** — database-layer access control ensuring users only see their own data
- **Background job processing** — Celery/Redis workers that run sync, embedding, and report generation jobs
