# ArgusAI — Project Bible

> This file is the single source of truth for the ArgusAI codebase. Every AI session, contributor,
> and engineer should start here before touching any code.

---

## 1. What Is ArgusAI?

ArgusAI is an **AI-powered Financial Intelligence System** — not a budgeting app, not a spending
tracker. It is a real-time **financial guardian and decision engine** that predicts risk, reasons
about your financial behavior, and helps you make smarter money decisions before problems occur.

**Core thesis:** Existing finance apps are backward-looking. They show you what you already spent.
ArgusAI is forward-looking — it simulates, forecasts, and reasons about what is *about to happen*
to your finances, and what you should do about it now.

**Product category:** Predictive fintech + AI agent + behavioral intelligence platform.

---

## 2. The Problem ArgusAI Solves

Most personal finance apps (Mint, YNAB, Copilot, Monarch Money, Rocket Money) share the same
fundamental flaws:

| Failure | Description |
|---|---|
| Reactive reporting | Shows past spending, not future risk |
| Dashboard theater | Charts and graphs with no strategic reasoning |
| No simulations | Cannot model "what if I buy this?" scenarios |
| No behavioral intelligence | Cannot detect impulse patterns or spending volatility |
| Weak risk detection | Alerts come after overdrafts happen, not before |
| No memory | Cannot reason using your personal financial history |
| Budget-focused | Optimizes for budget compliance, not financial outcomes |

ArgusAI addresses all seven of these failures with dedicated intelligence systems.

---

## 3. Target Users

| Persona | Description |
|---|---|
| Young professionals | Managing 2–5 credit cards with inconsistent spending |
| Subscription-heavy users | Paying for 10+ recurring services, losing track of costs |
| Predictive planners | Want to know their financial trajectory 30–60 days out |
| Debt optimizers | Actively working to pay down debt with a smart strategy |

---

## 4. Feature Set

### 4.1 Core MVP Features

These are the baseline features required for a production-grade v1:

- **User Authentication** — JWT-based auth with secure session handling and refresh tokens
- **Bank Account Linking** — Plaid API integration for connecting real bank/credit card accounts
- **Transaction Ingestion Pipeline** — Sync, normalize, and store raw transactions from Plaid
- **Automated Categorization** — AI-powered classification of transactions into spending categories
- **Recurring Bill Detection** — Merchant + pattern-based logic to identify recurring charges
- **Subscription Tracking Dashboard** — Visual overview of all active subscriptions with amounts and cycles
- **Monthly AI Financial Report** — Automated monthly summary with AI-generated insights and trends

### 4.2 Advanced Intelligence Features

These are the core differentiating AI capabilities:

- **AI Financial Copilot Chat** — Conversational AI agent with tool-calling for structured financial reasoning. Can run calculations, query your data, simulate scenarios, and explain its reasoning.
- **Cashflow Prediction Engine** — 30–60 day forward simulation of income vs. expenses using historical patterns and upcoming known bills. Outputs probability-weighted cashflow curves.
- **Debt Payoff Simulator** — Side-by-side comparison of Snowball (smallest balance first) vs. Avalanche (highest interest first) strategies with projected payoff dates and total interest saved.
- **Dynamic Financial Health Score** — Multi-factor adaptive score computed across four dimensions: Liquidity, Stability, Debt Load, and Spending Volatility. Score updates in real time as transactions come in.
- **Risk Radar Feed** — Proactive alert system for upcoming financial threats: low balance warnings, credit utilization spikes, overdraft probability, and missed bill predictions.

### 4.3 Elite Differentiator Features

Features that put ArgusAI in a class of its own:

- **Interactive Scenario Simulator** — Adjustable income/expense sliders that show real-time impact on your 30–60 day cashflow forecast. "What if I lose $500/month in income?"
- **Behavioral Spending Intelligence** — Detects impulse patterns, spending velocity spikes, emotional spending correlations, and category-level behavioral drift over time.
- **Subscription Creep Detection** — Flags gradual monthly cost increases across subscriptions that users typically miss ("Your streaming bundle is up $4.99 vs. 3 months ago").
- **Goal-Based AI Savings Planner** — User sets a savings target (e.g., "$5,000 emergency fund by October") and ArgusAI generates a structured, adaptive roadmap with monthly milestones.
- **Anomaly Detection** — Statistical outlier detection for unusual transactions: one-time spikes, duplicate charges, foreign transactions, and merchant-level anomalies.
- **Cashflow Probability Modeling** — Risk-scored cashflow projections that account for spending volatility. Outputs confidence intervals, not just single-line forecasts.
- **AI Decision Engine** — Before a major purchase, user can ask "Can I afford to spend $800 on X right now?" and get a structured affordability analysis with downstream impact simulation.

---

## 5. Competitive Differentiators In Depth

### 5.1 Predictive Financial Modeling
**What it is:** 30–60 day forward cashflow simulation based on historical transactions, known recurring bills, and income patterns.

**Why it's different:** No consumer finance app currently offers user-facing probability-weighted cashflow forecasting. Apps like YNAB ask users to manually project — ArgusAI generates the forecast automatically from behavioral history.

**How it works:** The system ingests 90+ days of transaction history, extracts recurring patterns (bills, income cycles), applies volatility weighting to variable spending categories, and outputs a projected daily balance curve with confidence bands.

---

### 5.2 Decision Engine
**What it is:** An AI-powered affordability evaluator. User asks a question like "Should I buy a $1,200 MacBook?" and receives a structured financial impact analysis.

**Why it's different:** No existing app offers natural-language, structured financial decision support grounded in real account data. This is not generic advice — it reasons against your specific numbers.

**How it works:** Tool-calling LLM queries the user's current balance, upcoming bills, cashflow forecast, and savings goals. It runs a multi-step reasoning chain and returns a structured JSON decision with an explanation.

---

### 5.3 Behavioral Intelligence Layer
**What it is:** A pattern detection system that models individual spending behavior over time.

**Why it's different:** Competitors categorize transactions but don't model *behavior*. ArgusAI learns your baseline spending rhythm and surfaces deviations — "You tend to overspend on dining 2 weeks after paycheck."

**How it works:** Time-series analysis on transaction streams. Detects velocity spikes, category-level drift, day-of-week patterns, and merchant frequency shifts. Flags behavioral changes with natural language explanations.

---

### 5.4 Financial Risk Radar
**What it is:** A proactive alert system that fires warnings before financial problems materialize.

**Why it's different:** Most apps alert you after an overdraft. Risk Radar forecasts overdraft *probability* 5–10 days out and alerts you when the probability crosses a threshold.

**How it works:** Cashflow prediction output is combined with current balance data to generate risk scores. Alerts fire when balance is projected to drop below threshold, credit utilization is trending toward 30%+, or a large bill is due within 7 days with insufficient buffer.

---

### 5.5 AI Strategy Generator
**What it is:** A plan generation engine for debt repayment and savings goals.

**Why it's different:** Existing debt tools show you Snowball vs. Avalanche as static calculations. ArgusAI generates the strategy *and* runs the simulation forward, showing you month-by-month projections with "on track / off track" indicators.

**How it works:** User enters debt balances, interest rates, and minimum payments. The AI generates optimized repayment schedules under both methods, runs cashflow simulations for each, and recommends the approach that fits their specific financial situation.

---

### 5.6 Dynamic Financial Health Score
**What it is:** A real-time composite score (0–100) computed across four financial dimensions.

**Why it's different:** Credit scores are static and opaque. This health score is transparent, updates daily, and shows users *exactly* which dimension is dragging their score down and how to improve it.

**Dimensions:**
- **Liquidity** (30%) — Liquid assets vs. monthly expenses ratio
- **Stability** (25%) — Income consistency and expense volatility
- **Debt Load** (25%) — Utilization rate and debt-to-income ratio
- **Spending Volatility** (20%) — Variance in category-level spending vs. baseline

---

### 5.7 Context-Aware Financial Memory (RAG)
**What it is:** A retrieval-augmented generation layer that gives the AI Copilot long-term memory of the user's financial history.

**Why it's different:** Standard LLM chatbots have no memory between sessions. ArgusAI stores transaction embeddings in a vector database and retrieves relevant context at query time — the copilot can reason about "last March" or "how does this month compare to Q3?"

**How it works:** Transactions and financial events are chunked and embedded (text-embedding model). At copilot query time, the RAG layer retrieves relevant historical context and injects it into the LLM prompt alongside the user's question.

---

## 6. Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router, TypeScript) |
| Styling | Tailwind CSS |
| State Management | Zustand or TanStack Query |
| Charts | Recharts or Tremor |
| Hosting | Vercel |

### Backend
| Layer | Technology |
|---|---|
| API Framework | FastAPI (Python) — preferred for AI/ML ecosystem compatibility |
| Alternative | Node.js with NestJS if TS-only stack desired |
| Auth | Supabase Auth — JWT-based, refresh token rotation built-in, OAuth (Google) supported. FastAPI validates Supabase-issued JWTs via middleware; no custom auth implementation needed. |
| Bank Integration | Plaid API |
| Hosting | Railway or Fly.io |

### Data Layer
| Layer | Technology |
|---|---|
| Primary Database | Supabase (managed PostgreSQL) — ACID compliant, Row-Level Security enforced at DB layer, pgvector built-in, Realtime CDC for live alert streaming |
| Cache / Queues | Redis |
| Vector Database | pgvector via Supabase — built-in, no separate service. Vector similarity queries JOIN directly with the transactions table in the same DB. |
| Background Jobs | Redis + Celery (Python) or BullMQ (Node) |

### AI Layer
| Component | Technology |
|---|---|
| LLM | Claude claude-sonnet-4-6 (Anthropic API) |
| Tool-calling | Anthropic tool use API |
| Embeddings | text-embedding-3-small (OpenAI) or Voyage AI |
| RAG | Custom retrieval pipeline over Supabase pgvector |
| Guardrails | Structured JSON output validation + prompt constraints |

### Infrastructure
| Concern | Solution |
|---|---|
| Secrets | Environment isolation (.env, Railway secrets) |
| Monitoring | Sentry (errors) + Axiom/Datadog (logs) |
| CI/CD | GitHub Actions |

---

## 7. Core Data Models

```sql
-- Users (app profile only — auth identity lives in Supabase's internal auth.users schema)
-- id references auth.users.id, managed by Supabase Auth
users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT UNIQUE NOT NULL,
  auth_provider TEXT,  -- 'email' | 'google' (mirrors Supabase Auth provider)
  created_at TIMESTAMPTZ
)

-- Linked bank accounts
accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  plaid_account_id TEXT,
  institution TEXT,
  account_type TEXT,  -- 'checking' | 'savings' | 'credit'
  balance DECIMAL,
  last_synced TIMESTAMPTZ
)

-- Raw transactions from Plaid
transactions (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts,
  plaid_transaction_id TEXT UNIQUE,
  merchant TEXT,
  amount DECIMAL,
  category TEXT,
  subcategory TEXT,
  timestamp TIMESTAMPTZ,
  is_recurring BOOLEAN,
  embedding_id TEXT  -- reference to vector store
)

-- Detected recurring bills
bills (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  merchant TEXT,
  recurrence_pattern TEXT,  -- 'monthly' | 'weekly' | 'annual'
  avg_amount DECIMAL,
  next_due_date DATE,
  last_seen TIMESTAMPTZ
)

-- Tracked subscriptions
subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  merchant TEXT,
  avg_amount DECIMAL,
  billing_cycle TEXT,
  first_detected TIMESTAMPTZ,
  is_active BOOLEAN
)

-- AI-generated insights
ai_insights (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  insight_type TEXT,  -- 'monthly_report' | 'risk_alert' | 'copilot_response'
  summary TEXT,
  structured_output_json JSONB,
  created_at TIMESTAMPTZ
)
```

---

## 8. AI System Architecture

```
User Query
    │
    ▼
[RAG Retrieval] ──── Supabase Vector (pgvector — co-located with transaction DB)
    │                  (transaction embeddings, history)
    ▼
[Context Assembly]
    │  - Retrieved financial history
    │  - Current account state
    │  - Active goals and debts
    ▼
[LLM with Tool-Calling] (Claude claude-sonnet-4-6)
    │
    ├── Tool: get_cashflow_forecast()
    ├── Tool: get_balance_summary()
    ├── Tool: run_debt_simulation()
    ├── Tool: get_risk_alerts()
    └── Tool: get_spending_patterns()
    │
    ▼
[Structured JSON Output]
    │  - Validated against schema
    │  - Guardrails: no speculative financial advice
    │  - No hallucinated account numbers or balances
    ▼
[Response to User]
```

**Key AI design principles:**
- All AI outputs referencing account data must be grounded in retrieved facts
- Copilot responses include a "confidence" field and data sources cited
- Sensitive financial figures are never generated — only retrieved and formatted
- Output always includes a disclaimer that ArgusAI is not a licensed financial advisor

---

## 9. Security & Compliance Requirements

| Requirement | Implementation |
|---|---|
| Encryption at rest | Supabase encrypts all data at rest (AES-256). Sensitive columns (Plaid tokens) additionally encrypted at the application layer before insert. |
| Encryption in transit | TLS 1.3 enforced on all endpoints |
| Plaid token storage | Encrypted at rest, never exposed in API responses |
| API rate limiting | Per-user rate limits on all AI endpoints |
| Input validation | Middleware validation on all request payloads |
| Audit logging | All financial data access logged with user_id + timestamp |
| Secrets management | No secrets in code — environment variables + Railway/Fly secrets |
| Data minimization | Only store what is required; no raw Plaid credentials stored |
| Session security | Supabase Auth manages JWT issuance and refresh token rotation natively. Access tokens configurable to 15-minute expiry. |

---

## 10. Use Cases

### UC-1: "Will I overdraft this month?"
**User:** Opens the app mid-month and checks Risk Radar.
**System:** Cashflow prediction engine has already run overnight. It shows a projected balance dip to -$42 on the 27th based on a $600 rent payment and current spending velocity.
**Output:** Red risk alert — "High overdraft probability on March 27. Recommend transferring $100 from savings or reducing dining spend by $80 this week."

---

### UC-2: "Should I buy this laptop right now?"
**User:** Types into AI Copilot: "I want to buy a $1,400 MacBook Pro. Is this a good time?"
**System:** Decision Engine queries current balance, upcoming bills for 30 days, savings goal progress, and cashflow forecast. Runs an affordability simulation.
**Output:** "Your balance after known bills this month is $820. This purchase would put you $580 in deficit. Consider waiting until April 15 after your paycheck, which gives you $1,950 in available buffer."

---

### UC-3: "Am I wasting money on subscriptions?"
**User:** Opens Subscription Tracker.
**System:** Subscription Creep Detection has flagged that their total subscription spend increased from $187/mo to $231/mo over 4 months — driven by 3 price increases and 1 forgotten trial that converted.
**Output:** Itemized list with "Hidden Creep" tags on the flagged services. One-tap cancellation links where available.

---

### UC-4: "How do I pay off my credit card debt fastest?"
**User:** Opens Debt Payoff Simulator. Enters 3 card balances, interest rates, minimum payments.
**System:** Generates Snowball vs. Avalanche schedules. Runs a 24-month cashflow simulation for each to show month-by-month balance projections.
**Output:** "Avalanche method saves you $847 in interest and gets you debt-free 3 months sooner. However, with your current cashflow volatility, Snowball is safer — you'll miss fewer payments."

---

### UC-5: "What would happen if I got a raise?"
**User:** Opens Scenario Simulator. Drags income slider from $5,200 to $6,000/month.
**System:** Re-runs cashflow forecast with new income figure. Updates Financial Health Score. Recalculates debt payoff timelines and savings goal projections in real time.
**Output:** "A $800/month raise improves your payoff date by 8 months and raises your Health Score from 61 to 74. Your overdraft risk drops from 23% to 4%."

---

### UC-6: "Why did I spend so much last month?"
**User:** Asks AI Copilot: "What happened to my spending in February?"
**System:** RAG layer retrieves February transaction embeddings + spending patterns. Behavioral Intelligence Layer compares to baseline.
**Output:** "February was 34% above your baseline. The spike was primarily dining (+$210) and entertainment (+$180). This matches your pattern from last February — possible seasonal behavior. Your subscription costs were stable."

---

## 11. Success Metrics

| Metric | Target |
|---|---|
| Recurring bill detection accuracy | > 95% |
| Cashflow prediction error | < 10% vs. actual |
| AI Copilot response latency | < 3 seconds |
| Subscription identification rate | > 90% |
| Financial Health Score update frequency | Daily |
| User-reported decision confidence | > 4/5 in surveys |

---

## 12. Development Timeline (12 Weeks)

| Phase | Weeks | Deliverables |
|---|---|---|
| Foundation | 1–2 | Architecture setup, Supabase project init (Auth + DB + RLS policies), schema migration, CI/CD |
| Data Pipeline | 3–4 | Plaid integration, transaction sync, normalization pipeline |
| Intelligence Layer | 5–6 | Recurring bill detection, subscription tracking, categorization |
| AI Reports | 7–8 | Monthly AI reports, automated categorization improvements |
| Copilot + Simulations | 9–10 | Financial Copilot agent, cashflow engine, debt simulator, scenario simulator |
| Production Hardening | 11–12 | Security audit, rate limiting, load testing, production deployment |

---

## 13. What ArgusAI Is NOT

- **Not a robo-advisor** — ArgusAI does not invest your money or manage assets
- **Not a licensed financial advisor** — All AI outputs include appropriate disclaimers
- **Not a credit monitoring service** — Does not pull credit reports (no hard inquiries)
- **Not a bank** — ArgusAI is read-only by default via Plaid; no fund transfers

---

## 14. Key External Dependencies

| Service | Purpose | Criticality |
|---|---|---|
| Plaid API | Bank data access and transaction sync | Critical |
| Anthropic API (Claude) | AI Copilot and reasoning engine | Critical |
| Supabase | Managed PostgreSQL + pgvector + Auth + Realtime — replaces self-hosted DB, custom JWT auth, and separate vector DB | Critical |
| Redis | Caching, background job queues (Celery workers for Plaid sync, embedding generation) | High |
| Vercel | Frontend hosting | High |
| Railway / Fly.io | FastAPI backend hosting | High |
