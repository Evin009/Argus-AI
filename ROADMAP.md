# ArgusAI — Full Project Execution Roadmap

> Step-by-step build plan organized into 6 phases.
> Each phase is divided into three layers: **Backend**, **AI Layer**, and **Frontend**.
> Each phase also includes a **Learning Track** — concepts to study before coding.
> Follow sequentially. Each phase builds on the previous.

---

## Layer Legend

| Tag | What it means |
|---|---|
| `[BACKEND]` | FastAPI routes, Supabase schema, Celery tasks, Redis, Plaid — the server-side data layer |
| `[AI]` | Claude API, embeddings, RAG pipeline, tool definitions, agentic loop, prompt engineering |
| `[FRONTEND]` | Next.js pages, React components, Tailwind UI, Supabase client, state management |

---

## Progress Summary

| Phase | Status | Weeks |
|---|---|---|
| Phase 1 — Foundation | ⬜ Not Started | 1–2 |
| Phase 2 — Plaid Data Pipeline | ⬜ Not Started | 3–4 |
| Phase 3 — Intelligence Layer | ⬜ Not Started | 5–6 |
| Phase 4 — AI Reports | ⬜ Not Started | 7–8 |
| Phase 5 — Copilot + Simulations | ⬜ Not Started | 9–10 |
| Phase 6 — Production Hardening | ⬜ Not Started | 11–12 |

---

## All Frontend Pages (Master Reference)

Every page that will exist in the ArgusAI Next.js app, organized by section.
These get built progressively across phases — see each phase for when a page is built.

### Public / Auth
| Route | Page | Built In |
|---|---|---|
| `/` | Landing page — hero, features, CTA, pricing | Phase 1 |
| `/login` | Sign in — email + Google OAuth | Phase 1 |
| `/signup` | Sign up — email registration | Phase 1 |
| `/auth/callback` | OAuth redirect handler (Supabase callback) | Phase 1 |
| `/verify-email` | Email verification confirmation screen | Phase 1 |

### Onboarding (first-time user flow)
| Route | Page | Built In |
|---|---|---|
| `/onboarding` | Welcome screen + guided setup steps | Phase 2 |
| `/onboarding/link-bank` | Connect first bank account (Plaid Link widget) | Phase 2 |
| `/onboarding/goals` | Set initial savings goals + monthly income | Phase 5 |

### Core App (authenticated)
| Route | Page | Built In |
|---|---|---|
| `/dashboard` | Main overview: health score card, active risk alerts, upcoming bills, quick stats | Phase 3 |
| `/accounts` | All linked bank + credit accounts with live balances | Phase 2 |
| `/transactions` | Full transaction history — search, filters, date range, category tags | Phase 2 |
| `/bills` | Detected recurring bills — calendar view, next due dates, amounts | Phase 3 |
| `/subscriptions` | Subscription tracker — active subs, billing cycles, creep alerts | Phase 3 |

### AI Intelligence
| Route | Page | Built In |
|---|---|---|
| `/cashflow` | 30–60 day cashflow forecast — area chart with confidence bands | Phase 5 |
| `/risk-radar` | Live risk alerts feed — overdraft risk, utilization spikes, missed bill predictions | Phase 5 |
| `/health-score` | Financial Health Score — composite gauge + 4-dimension breakdown bars | Phase 5 |
| `/reports` | Monthly AI report index — list of past reports | Phase 4 |
| `/reports/[month]` | Individual monthly report — AI summary, highlights, warnings, recommendations | Phase 4 |
| `/copilot` | AI Copilot chat — full-page conversation with streaming responses + tool-call indicators | Phase 5 |

### AI Intelligence (continued)
| Route | Page | Built In |
|---|---|---|
| `/goals` | Savings goals — AI-generated monthly plan, progress tracking, milestones | Phase 5 |
| `/behavioral-insights` | Behavioral spending patterns — velocity spikes, impulse detection, category drift | Phase 5 |

### Simulators
| Route | Page | Built In |
|---|---|---|
| `/simulators/scenario` | Scenario simulator — income/expense sliders, real-time cashflow forecast update | Phase 5 |
| `/simulators/debt` | Debt payoff simulator — Snowball vs. Avalanche comparison table + timeline chart | Phase 5 |

### Settings
| Route | Page | Built In |
|---|---|---|
| `/settings` | Account profile — display name, email, avatar | Phase 1 |
| `/settings/accounts` | Manage linked bank accounts — add new, remove, view sync status | Phase 2 |
| `/settings/notifications` | Alert preferences — Risk Radar thresholds, email/push settings | Phase 5 |

---

## PHASE 1 — Foundation (Weeks 1–2)

> **Goal:** Running skeleton. Auth works, DB schema exists, CI/CD live, local dev ready.

### Learning Track
- [ ] **PostgreSQL fundamentals** — tables, foreign keys, indexes, UUID primary keys
- [ ] **Row-Level Security (RLS)** — what it is, how Supabase implements it, why it's stronger than app-level auth guards
- [ ] **JWT authentication** — header/payload/signature, access vs. refresh tokens, expiry
- [ ] **Supabase Auth** — how it issues JWTs, `auth.users` schema, OAuth with Google, JS/Python client
- [ ] **FastAPI basics** — routes, Pydantic models, dependency injection, middleware, async handlers
- [ ] **Docker + docker-compose** — containerizing FastAPI + Redis locally
- [ ] **GitHub Actions** — writing a CI workflow (lint → test → build)
- [ ] **Next.js App Router** — file-based routing, layouts, server vs. client components, `use client`
- [ ] **Environment variable management** — `.env`, `python-dotenv`, never committing secrets

---

### `[BACKEND]` Tasks

#### 1.1 — Project Scaffolding
- [x] Initialize monorepo: `/frontend`, `/backend`, `/infra` directories
- [x] Set up `pyproject.toml` (or `requirements.txt`) — FastAPI, Pydantic, supabase-py, python-dotenv
- [x] Create `.env.example` with all required variable names (no real values)
- [x] Add `.gitignore` covering `.env`, `__pycache__`, `.next`, `node_modules`

#### 1.2 — Supabase Setup
- [ ] Create Supabase project
- [ ] Enable pgvector: run `CREATE EXTENSION vector;` in SQL editor
- [ ] Run schema migration (from `CLAUDE.md` Section 7) to create all 6 tables
- [ ] Enable Row-Level Security on all tables
- [ ] Write RLS policies: users can only read/write their own rows (`auth.uid() = user_id`)
- [ ] Copy Supabase URL + anon key + service role key to `.env`
- [ ] Confirm `auth.users` ↔ `public.users` foreign key works

#### 1.3 — FastAPI Auth Middleware
- [ ] Install dependencies: `fastapi`, `uvicorn`, `python-jose`, `httpx`
- [ ] Write JWT middleware: extract `Authorization: Bearer <token>` → verify against Supabase JWKS → inject `user_id` into request state
- [ ] Create `GET /me` — returns authenticated user profile from `public.users`
- [ ] Create `POST /users/sync` — called after signup to create `public.users` row from `auth.users`

#### 1.4 — CI/CD Pipeline
- [ ] Write GitHub Actions: `pytest` on push to `main`
- [ ] Add `ruff` linter step for backend
- [ ] Configure Railway or Fly.io to auto-deploy FastAPI on push
- [ ] Add `docker-compose.yml` to `/infra` for local dev: FastAPI + Redis

---

### `[AI]` Tasks

*No AI work in Phase 1 — focus entirely on infrastructure.*

---

### `[FRONTEND]` Tasks

#### 1.5 — Next.js Setup
- [ ] `npx create-next-app@latest frontend --typescript --tailwind --app`
- [ ] Install Supabase client: `@supabase/supabase-js @supabase/ssr`
- [ ] Set up `lib/supabase/client.ts` (browser client) and `lib/supabase/server.ts` (server client)
- [ ] Configure Vercel project, link to GitHub repo, add env variables

#### 1.6 — Auth Pages  `[/login]` `[/signup]` `[/auth/callback]` `[/verify-email]`
- [ ] Build `/login` page — email/password form + "Sign in with Google" button
- [ ] Build `/signup` page — registration form, client-side validation
- [ ] Build `/auth/callback` route — handles Supabase OAuth redirect, exchanges code for session
- [ ] Build `/verify-email` page — shown after signup, prompts user to check email
- [ ] Write `middleware.ts` — protects all `/dashboard`, `/accounts`, etc. routes; redirects to `/login`

#### 1.7 — Landing Page  `[/]`
- [ ] Build `/` landing page — hero section, feature highlights (3 tiers), CTA buttons (Sign Up / Login)
- [ ] No dynamic data — purely static marketing content

#### 1.8 — Settings Shell  `[/settings]`
- [ ] Build `/settings` page shell — display name, email (read-only), sign-out button
- [ ] Navigation sidebar component (reused across all app pages)

---

## PHASE 2 — Plaid Data Pipeline (Weeks 3–4)

> **Goal:** Real bank accounts linked, transactions syncing into Supabase, data normalized and stored.

### Learning Track
- [ ] **Plaid API** — Link flow, `public_token` → `access_token` exchange, `/transactions/sync`, sandbox mode
- [ ] **Celery + Redis** — task queue model, workers, Celery Beat for scheduled jobs
- [ ] **Idempotency** — why transaction sync must never create duplicates (`ON CONFLICT DO NOTHING`)
- [ ] **Data normalization** — merchant name cleaning, amount sign conventions (Plaid uses positive = debit)
- [ ] **Async Python** — `async def`, `await`, `asyncio`, how FastAPI handles concurrent requests
- [ ] **TanStack Query** — server state management in React, `useQuery`, `useMutation`, cache invalidation

---

### `[BACKEND]` Tasks

#### 2.1 — Plaid Integration
- [ ] Create Plaid developer account, get sandbox `client_id` + `secret`
- [ ] Add `plaid-python` to dependencies
- [ ] `POST /plaid/link-token` — creates a Plaid Link token scoped to the authenticated user
- [ ] `POST /plaid/exchange-token`:
  - Exchange `public_token` → `access_token` via Plaid API
  - AES-256 encrypt the `access_token` before storing
  - Insert row into `plaid_items` (one row per institution link, stores encrypted token + cursor)
  - Call Plaid `/accounts/get` → insert one row per account into `accounts` (referencing `plaid_item_id`)
- [ ] `GET /accounts` — returns all linked accounts for the authenticated user (balance, type, institution)

#### 2.2 — Transaction Sync Pipeline
- [ ] Write Celery task `sync_transactions(user_id)`:
  - Decrypt stored access token
  - Call Plaid `/transactions/sync` (cursor-based)
  - Upsert transactions using `plaid_transaction_id` as unique key (`ON CONFLICT DO NOTHING`)
  - Normalize: strip merchant suffixes, standardize casing, handle sign convention
- [ ] Celery Beat schedule: run `sync_transactions` for all active users every 6 hours
- [ ] `GET /transactions` — paginated (limit/offset), filterable by date range and category

#### 2.3 — Embedding Generation
- [ ] Set up `openai` client for `text-embedding-3-small` (or Voyage AI)
- [ ] Run migration to add `embedding vector(1536)` column to `transactions` (schema in CLAUDE.md already reflects this)
- [ ] Run migration to create `plaid_items` table and add `plaid_item_id` FK to `accounts` (from CLAUDE.md Section 7)
- [ ] Run migration to add `price_change_pct` to `subscriptions` and create `goals` table
- [ ] Create `ivfflat` vector index: `CREATE INDEX ON transactions USING ivfflat (embedding vector_cosine_ops)`
- [ ] Write Celery task `generate_embedding(transaction_id)`:
  - Build string: `"{merchant} {amount} {category} {date}"`
  - Call embedding API, store result in `transactions.embedding`
- [ ] Chain: `sync_transactions` → on completion → enqueue `generate_embedding` for each new transaction

---

### `[AI]` Tasks

*Embedding generation (above) is the first AI infrastructure component — no LLM calls yet.*

---

### `[FRONTEND]` Tasks

#### 2.4 — Accounts Page  `[/accounts]`
- [ ] Build `/accounts` page — card grid showing each linked account (institution logo, name, balance, type)
- [ ] "Add Account" button triggers Plaid Link widget (`react-plaid-link`)
- [ ] On Plaid success callback: call `POST /plaid/exchange-token`, invalidate accounts query

#### 2.5 — Transactions Page  `[/transactions]`
- [ ] Build `/transactions` page — infinite scroll or paginated table
- [ ] Columns: date, merchant, category badge, amount (color: red = debit, green = credit)
- [ ] Search bar (client-side filter on merchant name)
- [ ] Date range picker + category filter dropdown
- [ ] Category badge component (reused across the app)

#### 2.6 — Onboarding Flow  `[/onboarding]` `[/onboarding/link-bank]`
- [ ] Build `/onboarding` welcome screen — progress steps (1. Link Bank, 2. Set Goals, 3. Done)
- [ ] Build `/onboarding/link-bank` — Plaid Link widget embedded, skip option
- [ ] After successful link: redirect to `/dashboard` (with empty state until first sync)

#### 2.7 — Settings: Accounts  `[/settings/accounts]`
- [ ] Build `/settings/accounts` — list linked accounts, "Remove" button per account, "Add Account" trigger

---

## PHASE 3 — Intelligence Layer (Weeks 5–6)

> **Goal:** Bill detection working, subscriptions tracked, AI categorization live, dashboard surfacing data.

### Learning Track
- [ ] **SQL window functions** — `LAG`, `LEAD`, `PARTITION BY` — essential for recurring pattern detection
- [ ] **Frequency analysis** — how to detect periodicity in a time-series (group by merchant, compute intervals)
- [ ] **Prompt engineering** — zero-shot vs. few-shot, JSON mode, temperature settings for classification tasks
- [ ] **Claude API basics** — `anthropic.Anthropic()`, `messages.create()`, content blocks, structured output
- [ ] **Pydantic validation** — `BaseModel`, `model_validate`, `ValidationError`, response schema enforcement
- [ ] **React component patterns** — compound components, composition, prop drilling vs. context

---

### `[BACKEND]` Tasks

#### 3.1 — Recurring Bill Detection
- [ ] Write `detect_recurring_bills(user_id)`:
  - Group transactions by normalized merchant name
  - Compute intervals between occurrences
  - Flag as monthly if interval is 28–32 days (±3 day window)
  - Compute `next_due_date = last_seen + avg_interval`
  - Upsert into `bills` table
- [ ] `GET /bills` — returns all detected recurring bills sorted by `next_due_date`
- [ ] Schedule as daily Celery task

#### 3.2 — Subscription Tracking
- [ ] Write `detect_subscriptions(user_id)`:
  - Classify merchant as subscription-type (streaming, SaaS, gym, insurance)
  - Flag if same merchant billed consistently monthly
  - Compute `price_change_pct` vs. 3 months ago
  - Upsert into `subscriptions` table, set `is_active = True`
- [ ] `GET /subscriptions` — returns active subscriptions with creep flag
- [ ] Schedule as daily Celery task

---

### `[AI]` Tasks

#### 3.3 — AI-Powered Categorization
- [ ] Define category taxonomy: 15–20 categories (dining, groceries, transport, streaming, utilities, entertainment, healthcare, travel, shopping, etc.)
- [ ] Write `categorize_transaction(merchant, amount, raw_category)`:
  - Build few-shot prompt with 10 labeled examples
  - Call Claude claude-sonnet-4-6 requesting JSON output: `{category, subcategory, confidence}`
  - Validate with Pydantic `CategoryResponse` schema
  - Fallback: if Plaid provides a valid category, use it without calling Claude
- [ ] Write Celery batch task: `categorize_new_transactions(user_id)` — runs after each sync on uncategorized rows

#### 3.4 — Behavioral Spending Intelligence
- [ ] Write `analyze_spending_behavior(user_id)`:
  - Compute per-category 30-day rolling average (baseline)
  - Detect **velocity spikes**: current week spend > 2× weekly baseline for a category
  - Detect **day-of-week patterns**: spending consistently higher on specific weekdays (e.g. Fridays)
  - Detect **post-paycheck impulse pattern**: elevated dining/entertainment spend within 3 days of income transaction
  - Detect **category drift**: category spend trending up for 3+ consecutive months
  - Store each detected pattern in `ai_insights` with `insight_type = 'behavioral_pattern'`
- [ ] Write `generate_behavioral_summary(user_id)` — Claude call that formats detected patterns into plain-English insights
- [ ] `GET /behavioral-insights` — returns active behavioral patterns with natural language explanations
- [ ] Schedule as weekly Celery task

---

### `[FRONTEND]` Tasks

#### 3.4 — Dashboard Page  `[/dashboard]`
- [ ] Build `/dashboard` — the main app home:
  - Health Score summary card (placeholder score until Phase 5)
  - Active risk alerts strip (placeholder until Phase 5)
  - Upcoming bills widget — next 3 bills due, days until due
  - Monthly spend so far vs. last month (simple stat cards)
  - Recent transactions list (last 5)
- [ ] Dashboard layout: sidebar nav + main content area

#### 3.5 — Bills Page  `[/bills]`
- [ ] Build `/bills` — list of detected recurring bills
- [ ] Calendar-style view: each bill shown as a card with merchant, amount, next due date, recurrence label
- [ ] Color coding: due within 7 days = amber, overdue = red

#### 3.6 — Subscriptions Page  `[/subscriptions]`
- [ ] Build `/subscriptions` — subscription tracker
- [ ] Card per subscription: logo/icon, merchant name, billing cycle, monthly cost
- [ ] "Subscription Creep" badge on cards with `price_change_pct > 0`
- [ ] Total monthly subscription cost stat at the top
- [ ] Sort by cost descending by default

---

## PHASE 4 — AI Reports (Weeks 7–8)

> **Goal:** Monthly AI financial reports auto-generated and viewable. RAG pipeline operational. Anomaly detection live.

### Learning Track
- [ ] **RAG (Retrieval-Augmented Generation)** — chunking, embedding documents, vector similarity search, injecting context into prompts
- [ ] **pgvector cosine similarity** — `<->` operator, `ORDER BY embedding <-> $1 LIMIT k`, why cosine distance for semantic search
- [ ] **Prompt construction** — system vs. user role, how to inject retrieved context without hallucination, context window limits
- [ ] **Structured Claude output** — using `tool_use` to guarantee schema-conformant JSON responses (more reliable than asking in prompt)
- [ ] **Statistical outlier detection** — standard deviation, z-score, how to flag transactions as anomalies

---

### `[BACKEND]` Tasks

#### 4.1 — Anomaly Detection
- [ ] Write `detect_anomalies(user_id)`:
  - Compute per-category mean and std deviation over 90 days
  - Flag transactions where `amount > mean + 2*std` for that category
  - Also flag: same merchant + same amount within 48 hours (duplicate charge)
  - Store in `ai_insights` with `insight_type = 'anomaly'`
- [ ] `GET /anomalies` — returns active unresolved anomalies
- [ ] Schedule as daily Celery task

#### 4.2 — RAG Retrieval
- [ ] Write `retrieve_relevant_transactions(user_id, query, k=20)`:
  - Embed the query string using same embedding model as transactions
  - Run: `SELECT * FROM transactions WHERE user_id = $1 ORDER BY embedding <-> $2 LIMIT $3`
  - Return top-k rows with metadata
- [ ] Write `assemble_context(user_id)`:
  - Current account balances
  - Active bills (upcoming 30 days)
  - Top 5 categories this month by spend
  - Any anomalies from this month
  - Returns a structured dict ready to inject into a prompt

#### 4.3 — Monthly Report Generation
- [ ] Write `generate_monthly_report(user_id, month)` Celery task:
  - Compute: total spent, total income, net cashflow, per-category breakdown
  - Assemble context via `assemble_context(user_id)`
  - Build prompt injecting all computed data
  - Call Claude claude-sonnet-4-6 requesting schema: `{summary, highlights[], warnings[], recommendations[], total_spent, net_cashflow}`
  - Validate with Pydantic `MonthlyReport` schema
  - Store in `ai_insights` with `insight_type = 'monthly_report'`
- [ ] `GET /reports/monthly?month=YYYY-MM` — returns stored report for that month
- [ ] Celery Beat: run on 1st of each month for all users with > 30 days of data

---

### `[AI]` Tasks

The AI work in this phase is the RAG pipeline + report generation. The key AI concepts:

- [ ] Prompt grounding: every number in the report must come from computed data — Claude formats, never generates financial figures
- [ ] Confidence field: each `highlights[]` item includes a `source` field citing which data point it's based on
- [ ] Disclaimer: reports always include `"ArgusAI is not a licensed financial advisor"` in `structured_output_json`

---

### `[FRONTEND]` Tasks

#### 4.4 — Reports Index  `[/reports]`
- [ ] Build `/reports` — list of past monthly reports
- [ ] Card per month: month label, net cashflow stat, 2-line AI summary preview, "View Report" link

#### 4.5 — Monthly Report Page  `[/reports/[month]]`
- [ ] Build `/reports/[month]` — full monthly report view:
  - Top stat bar: total spent, total income, net cashflow
  - AI Summary paragraph
  - Highlights section (green cards — positive insights)
  - Warnings section (amber/red cards — risks and anomalies)
  - Recommendations section (action items from AI)
  - Category breakdown bar chart (Recharts `BarChart`)
  - Month-over-month comparison table
  - Flagged anomalies list at the bottom

---

## PHASE 5 — Copilot + Simulations (Weeks 9–10)

> **Goal:** All AI intelligence surfaces live. Copilot chat, all engines, health score, Risk Radar, simulators.

### Learning Track
- [ ] **Anthropic Tool Use API** — `tools` parameter, `tool_use` content blocks, `stop_reason == "tool_use"`, the full agentic loop
- [ ] **Streaming with SSE** — `text/event-stream`, `EventSource` in browser, `StreamingResponse` in FastAPI
- [ ] **Supabase Realtime** — `supabase.channel()`, `.on('postgres_changes', ...)`, `.subscribe()` in React
- [ ] **Cashflow simulation math** — forward projection: daily balance = running total of income − expenses
- [ ] **Debt repayment algorithms** — Snowball vs. Avalanche: amortization schedules, interest accrual
- [ ] **Zustand** — global client state in React, `create()`, `useStore()`, slices pattern
- [ ] **Recharts** — `AreaChart` with confidence bands, `ComposedChart`, `ResponsiveContainer`, `Tooltip`
- [ ] **Debouncing** — `useDebounce` hook for slider-triggered API calls

---

### `[BACKEND]` Tasks

#### 5.1 — Simulation Engines
- [ ] **`CashflowEngine`** class (`backend/engines/cashflow.py`):
  - Ingest 90 days of transactions
  - Extract known recurring income (paycheck) and fixed bills
  - Apply volatility: variable category spending gets ±20% confidence band
  - Output: `[{date, projected_balance, lower_bound, upper_bound}]` for next 30–60 days
  - `GET /cashflow/forecast?days=30`
- [ ] **`DebtSimulator`** class (`backend/engines/debt.py`):
  - Input: list of `{balance, apr, min_payment}` + `extra_monthly`
  - Snowball: apply extra to smallest balance until paid, cascade
  - Avalanche: apply extra to highest APR until paid, cascade
  - Output per strategy: month-by-month balance per debt, payoff date, total interest paid
  - `POST /debt/simulate`
- [ ] **`HealthScoreEngine`** class (`backend/engines/health_score.py`):
  - Liquidity (30%): liquid balance / avg monthly spend
  - Stability (25%): 1 - (income std / income mean) over 3 months
  - Debt Load (25%): 1 - (total credit utilization %)
  - Spending Volatility (20%): 1 - (category spend std / category spend mean)
  - Normalize each 0–100, weight, sum
  - Store daily snapshot in `ai_insights`
  - `GET /health-score`
- [ ] **`RiskRadarEngine`** class (`backend/engines/risk_radar.py`):
  - Run cashflow forecast → flag any day where `projected_balance < 100`
  - Flag credit utilization trending toward 30%
  - Flag bills due within 7 days with < 1x bill amount in buffer
  - Severity: `low` / `medium` / `high`
  - Upsert into `ai_insights` with `insight_type = 'risk_alert'`
  - `GET /risk-alerts`
- [ ] **`ScenarioEngine`** class (`backend/engines/scenario.py`):
  - Takes `{income_delta, expense_delta, one_time_expense}`
  - Re-runs `CashflowEngine` with modified inputs
  - Re-computes health score delta
  - `POST /scenario/simulate`

#### 5.2 — Goal-Based AI Savings Planner
- [ ] Write `POST /goals` — creates a new savings goal (`title`, `target_amount`, `target_date`)
- [ ] Write `GET /goals` — returns all active goals for the user
- [ ] Write `generate_goal_plan(goal_id)` Celery task:
  - Compute months remaining until `target_date`
  - Pull average monthly discretionary spend from transaction history
  - Call Claude claude-sonnet-4-6 to generate structured plan: `{monthly_contribution, milestones[], feasibility_score, recommendations[]}`
  - Store result in `goals.monthly_contribution` + `ai_insights` with `insight_type = 'goal_plan'`
- [ ] `GET /goals/{goal_id}/plan` — returns AI-generated plan for a specific goal
- [ ] `PATCH /goals/{goal_id}` — update goal progress (current_amount, status)

#### 5.3 — Copilot Endpoint
- [ ] Write `POST /copilot/chat` (streaming SSE):
  - Accept `{message, conversation_history[]}`
  - Call `retrieve_relevant_transactions()` + `assemble_context()` for RAG
  - Inject context into first user message
  - Enter agentic loop:
    ```
    while True:
        response = client.messages.create(model, tools, messages)
        if response.stop_reason == "end_turn": break
        if response.stop_reason == "tool_use":
            execute tools, append results, continue
    ```
  - Stream output tokens via SSE
  - Append disclaimer to final response

---

### `[AI]` Tasks

#### 5.4 — Tool Definitions
Define each tool as a JSON schema for Claude (in `backend/copilot/tools.py`):

- [ ] `get_balance_summary` — input: none; output: `{checking, savings, credit, net_worth}`
- [ ] `get_cashflow_forecast` — input: `{days: int}`; output: daily balance array
- [ ] `get_spending_patterns` — input: `{months: int}`; output: category breakdown + MoM change
- [ ] `run_debt_simulation` — input: `{strategy: "snowball"|"avalanche"}`; output: payoff schedule
- [ ] `get_risk_alerts` — input: none; output: `[{type, severity, message, due_date}]`

Each tool:
- [ ] Validates input with Pydantic
- [ ] Returns deterministic JSON from real DB data — no generated numbers
- [ ] Logs the tool call with `user_id` + timestamp (audit trail)

---

### `[FRONTEND]` Tasks

#### 5.5 — Cashflow Page  `[/cashflow]`
- [ ] Build `/cashflow` — forecast chart
- [ ] Recharts `AreaChart` with 3 bands: `projected_balance` (solid line), `upper_bound` / `lower_bound` (shaded area)
- [ ] Time-range toggle: 30 days / 60 days
- [ ] Below chart: upcoming bills timeline (dots on x-axis)

#### 5.6 — Risk Radar Page  `[/risk-radar]`
- [ ] Build `/risk-radar` — real-time alert feed
- [ ] Supabase Realtime subscription on `ai_insights` table filtered by `user_id` + `insight_type = 'risk_alert'`
- [ ] Alert card component: severity icon (low = blue, medium = amber, high = red), message, due date, dismiss button
- [ ] Empty state: "No active risks detected. Your finances look healthy."

#### 5.7 — Health Score Page  `[/health-score]`
- [ ] Build `/health-score` — score breakdown
- [ ] Radial gauge showing composite 0–100 score (animated)
- [ ] 4 dimension bars: Liquidity, Stability, Debt Load, Spending Volatility — each showing score + weight
- [ ] "What's dragging my score down?" explanation text per dimension
- [ ] Score history sparkline (last 30 days)

#### 5.8 — AI Copilot Page  `[/copilot]`
- [ ] Build `/copilot` — full-page chat interface
- [ ] Message bubble components: user (right, primary color) vs. AI (left, neutral)
- [ ] Streaming text: characters appear as they arrive via SSE (`EventSource`)
- [ ] Tool-call status indicators: while Claude is executing a tool, show "Checking your balance..." etc.
- [ ] Disclaimer footer: *"ArgusAI is not a licensed financial advisor."*
- [ ] Suggested starter prompts: "Will I overdraft this month?", "How do I pay off my credit card fastest?"
- [ ] Conversation history persisted in Zustand store (clears on page refresh — no server-side chat history v1)

#### 5.9 — Goals Page  `[/goals]`
- [ ] Build `/goals` — savings goals overview
- [ ] Goal card: title, target amount, current amount, progress bar (%), target date, monthly contribution
- [ ] "Add Goal" button → modal with title, target amount, target date inputs
- [ ] On goal create: call `POST /goals`, then trigger `generate_goal_plan` task
- [ ] AI Plan section per goal: monthly contribution recommendation, milestone list, feasibility indicator
- [ ] "Mark Progress" button to update `current_amount`

#### 5.10 — Behavioral Insights Page  `[/behavioral-insights]`
- [ ] Build `/behavioral-insights` — spending behavior analysis
- [ ] Pattern cards: each detected behavioral pattern as a card with icon, explanation, affected category
- [ ] Pattern types: Velocity Spike (🔴), Post-Paycheck Impulse (🟡), Category Drift (🟠), Day-of-Week Pattern (🔵)
- [ ] Month-over-month category trend sparklines (Recharts `Sparkline`)
- [ ] "Ask Copilot about this" button per pattern → pre-fills copilot with the behavioral insight as context

#### 5.11 — Debt Simulator Page  `[/simulators/debt]`
- [ ] Build `/simulators/debt` — input form + results
- [ ] Input: add up to 5 debts (name, balance, APR, min payment) + extra monthly payment slider
- [ ] Results: side-by-side Snowball vs. Avalanche cards showing payoff date + total interest
- [ ] Month-by-month chart: stacked area chart showing debt balances shrinking over time per strategy

#### 5.12 — Scenario Simulator Page  `[/simulators/scenario]`
- [ ] Build `/simulators/scenario` — slider-based what-if tool
- [ ] Income delta slider: -$2,000 to +$2,000/month
- [ ] Expense delta slider: -$1,000 to +$1,000/month
- [ ] One-time expense input: e.g. "$1,400 MacBook"
- [ ] On slider change: debounced 300ms → call `POST /scenario/simulate` → re-render cashflow chart and health score delta
- [ ] Delta indicators: "+8 Health Score", "-4% overdraft risk"

#### 5.13 — Onboarding: Goals  `[/onboarding/goals]`
- [ ] Build `/onboarding/goals` — post-bank-link step
- [ ] Monthly income input, savings goal input (amount + target date)
- [ ] Skip option → goes to dashboard

#### 5.14 — Dashboard: Wire Up AI Data  `[/dashboard]`
- [ ] Update dashboard to show real Health Score card (from Phase 5 engine)
- [ ] Update risk alerts strip to show live Supabase Realtime data
- [ ] Add "Ask Copilot" quick-launch button

#### 5.15 — Notifications Settings  `[/settings/notifications]`
- [ ] Build `/settings/notifications` — alert preferences
- [ ] Toggles: Risk Radar email alerts, overdraft threshold setting, weekly summary email

---

## PHASE 6 — Production Hardening (Weeks 11–12)

> **Goal:** Secure, monitored, rate-limited, load-tested, fully deployed. Tag `v1.0.0`.

### Learning Track
- [ ] **OWASP Top 10** — injection, broken auth, IDOR, XSS, CSRF — understand each, know the fix
- [ ] **Rate limiting** — token bucket algorithm, per-user vs. per-IP, `slowapi` for FastAPI
- [ ] **Load testing with locust** — writing user scenarios, interpreting P50/P95/P99 latency reports
- [ ] **Sentry** — error capture, performance tracing, release tracking, alerting rules
- [ ] **Database indexes** — B-tree (equality/range), GIN (JSONB), ivfflat (vectors) — when to use each
- [ ] **PgBouncer** — connection pooling, why it matters at scale, how Supabase enables it

---

### `[BACKEND]` Tasks

#### 6.1 — Security Audit
- [ ] Audit all routes: confirm every route has auth dependency (`current_user = Depends(get_current_user)`)
- [ ] Verify Plaid access tokens are AES-encrypted at rest; test that raw token never appears in any API response
- [ ] Review all SQL: parameterized queries everywhere — zero string interpolation in queries
- [ ] Test RLS: authenticate as User A, try to query User B's data — must return empty
- [ ] Rotate all test credentials; set production secrets in Railway + Vercel dashboards

#### 6.2 — Rate Limiting
- [ ] Install `slowapi`, add `Limiter` middleware to FastAPI
- [ ] Standard endpoints: `60/minute` per user
- [ ] AI endpoints (`/copilot/chat`, `/scenario/simulate`, `/debt/simulate`): `10/minute` per user
- [ ] Return `429` with `Retry-After` header

#### 6.3 — Performance & Indexing
- [ ] Add composite index: `(user_id, timestamp DESC)` on `transactions`
- [ ] Add index: `(user_id, is_active)` on `subscriptions`
- [ ] Add index: `(user_id, insight_type, created_at DESC)` on `ai_insights`
- [ ] Add Redis caching: cashflow forecasts (TTL 1h), health scores (TTL 1h), monthly reports (TTL 24h)
- [ ] Profile slow queries: Supabase Dashboard → Logs → Slow Queries → optimize top 5

#### 6.4 — Load Testing
- [ ] Write `locust` scenarios for: auth, `/transactions`, `/copilot/chat`, `/cashflow/forecast`
- [ ] Run at 100 concurrent users — target < 500ms P95 on all non-AI endpoints
- [ ] Fix any N+1 patterns (use `JOIN` or batch queries instead of per-row calls)
- [ ] Tune Celery worker concurrency for Plaid sync

#### 6.5 — Monitoring
- [ ] Confirm Sentry catches all unhandled exceptions in FastAPI + Next.js
- [ ] Set up Sentry performance monitoring — trace each API route
- [ ] Add Axiom or Datadog for structured JSON log ingestion
- [ ] Alert rule: P95 > 2s on `/copilot/chat` → Slack notification
- [ ] Add uptime check (Better Uptime or Checkly)

#### 6.6 — Production Deployment
- [ ] Enable PgBouncer on Supabase (connection pooling for prod traffic)
- [ ] All env variables set in Railway (backend) and Vercel (frontend) — verify no `.env` fallback in prod
- [ ] Switch Plaid: Sandbox → Development (real bank testing with test credentials)
- [ ] End-to-end smoke test on production:
  - [ ] Sign up → verify email → sign in
  - [ ] Link bank → wait for sync → transactions appear
  - [ ] Open copilot → ask "Will I overdraft?" → valid response
  - [ ] Open health score → score renders
  - [ ] Trigger a risk alert → appears in Risk Radar without page refresh
- [ ] Tag `v1.0.0` on GitHub

---

### `[FRONTEND]` Tasks

#### 6.7 — Polish Pass
- [ ] Audit all pages for loading states — every data fetch needs a skeleton loader
- [ ] Audit all pages for empty states — every list needs an empty state message
- [ ] Audit all pages for error states — failed fetches should show an error card with a retry button
- [ ] Add `<head>` meta tags and `og:image` for social sharing on landing page
- [ ] Accessibility audit: all interactive elements keyboard-navigable, ARIA labels on icons

---

## Directory Structure (Target End State)

```
ArgusAI/
├── CLAUDE.md                        # Project bible (source of truth)
├── ROADMAP.md                       # This file
├── README.md                        # Public-facing overview
│
├── frontend/                        # Next.js 14+ (TypeScript + Tailwind)
│   ├── app/
│   │   ├── (auth)/                  # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── verify-email/page.tsx
│   │   │   └── auth/callback/route.ts
│   │   ├── (app)/                   # Protected route group
│   │   │   ├── layout.tsx           # Sidebar + nav shell
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── accounts/page.tsx
│   │   │   ├── transactions/page.tsx
│   │   │   ├── bills/page.tsx
│   │   │   ├── subscriptions/page.tsx
│   │   │   ├── cashflow/page.tsx
│   │   │   ├── risk-radar/page.tsx
│   │   │   ├── health-score/page.tsx
│   │   │   ├── copilot/page.tsx
│   │   │   ├── goals/page.tsx
│   │   │   ├── behavioral-insights/page.tsx
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [month]/page.tsx
│   │   │   ├── simulators/
│   │   │   │   ├── debt/page.tsx
│   │   │   │   └── scenario/page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── accounts/page.tsx
│   │   │       └── notifications/page.tsx
│   │   ├── onboarding/
│   │   │   ├── page.tsx
│   │   │   ├── link-bank/page.tsx
│   │   │   └── goals/page.tsx
│   │   └── page.tsx                 # Landing page (/)
│   ├── components/                  # Shared UI components
│   ├── lib/
│   │   ├── supabase/client.ts
│   │   └── supabase/server.ts
│   └── middleware.ts                # Route protection
│
├── backend/                         # FastAPI (Python)
│   ├── main.py
│   ├── routers/                     # Route handlers per domain
│   │   ├── auth.py
│   │   ├── accounts.py
│   │   ├── transactions.py
│   │   ├── bills.py
│   │   ├── subscriptions.py
│   │   ├── reports.py
│   │   ├── health_score.py
│   │   ├── risk_alerts.py
│   │   ├── cashflow.py
│   │   ├── debt.py
│   │   ├── scenario.py
│   │   └── copilot.py
│   ├── middleware/
│   │   └── auth.py                  # JWT verification
│   ├── engines/                     # Core computation classes
│   │   ├── cashflow.py              # CashflowEngine
│   │   ├── debt.py                  # DebtSimulator
│   │   ├── health_score.py          # HealthScoreEngine
│   │   ├── risk_radar.py            # RiskRadarEngine
│   │   └── scenario.py             # ScenarioEngine
│   ├── copilot/
│   │   ├── tools.py                 # Tool JSON schemas + executors
│   │   └── loop.py                  # Agentic loop logic
│   ├── tasks/                       # Celery workers
│   │   ├── sync.py                  # sync_transactions
│   │   ├── embeddings.py            # generate_embedding
│   │   ├── categorization.py        # categorize_new_transactions
│   │   ├── detection.py             # detect_bills, detect_subscriptions
│   │   ├── behavioral.py            # analyze_spending_behavior, generate_behavioral_summary
│   │   ├── reports.py               # generate_monthly_report
│   │   ├── goals.py                 # generate_goal_plan
│   │   └── risk.py                  # detect_anomalies, run_risk_radar
│   ├── migrations/                  # SQL schema files (run in order)
│   │   ├── 001_initial_schema.sql   # users, plaid_items, accounts, transactions, bills, subscriptions, goals, ai_insights
│   │   └── 002_vector_indexes.sql   # ivfflat index on transactions.embedding
│   └── tests/
│
└── infra/
    ├── docker-compose.yml           # Local: FastAPI + Redis + Celery
    └── .github/
        └── workflows/
            └── ci.yml
```
