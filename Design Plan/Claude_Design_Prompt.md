# ArgusAI — Claude Design Context Prompt

## Purpose
This is the context prompt to paste into Claude Design when designing ArgusAI pages. Copy everything under the "Prompt" section below.

---

## Prompt

You are designing the UI for **ArgusAI** — an AI-powered Financial Intelligence System. ArgusAI is not a budgeting app. It is a predictive fintech product that forecasts cashflow, detects financial risk before it happens, and gives users an AI Copilot that reasons about their real financial data.

---

### Product Context

ArgusAI connects to users' bank accounts via Plaid, syncs transactions, runs continuous background simulations, and surfaces forward-looking insights through a conversational AI Copilot. The target users are young professionals managing multiple credit cards, subscriptions, and savings goals who want to stay ahead of their finances — not review them after the fact.

Key capabilities:
- 30–60 day cashflow prediction with probability-weighted balance curves
- AI Copilot that answers questions like "Can I afford a $1,400 laptop right now?" using real account data
- Risk Radar that scores overdraft probability daily and warns before it happens
- Subscription creep detection — flags silent price increases per service
- Debt Payoff Simulator — Snowball vs. Avalanche with month-by-month projections
- Dynamic Financial Health Score — 0–100 across Liquidity, Stability, Debt Load, Spending Volatility
- Behavioral Intelligence — detects spending velocity spikes and impulse patterns over time
- Scenario Simulator — adjust income/expenses, see real-time forecast impact

---

### Design Direction

The product should feel like a **professional AI intelligence dashboard** — not a consumer budgeting app. Think Bloomberg Terminal meets modern AI product UI.

- **Dark-first.** Deep dark backgrounds with high-contrast data surfaces. No light mode for now.
- **Precise and clean.** Tight spacing, minimal decoration, data always front and center.
- **Trustworthy.** This handles real money — nothing playful or flashy. Professional and calm.
- **Intelligent.** Accent colors communicate meaning: green for positive, amber for caution, red for risk. The UI should feel like it's actively monitoring something.

---

### Component Style Rules

- **Cards:** Background `#13131A`, border `#2A2A38`, border-radius 10px, subtle shadow
- **Buttons (primary):** Background `#6C63FF`, white text, border-radius 8px, hover to `#5B53E8`
- **Buttons (secondary):** Transparent background, `#2A2A38` border, `#F0F0F5` text
- **Inputs:** Background `#13131A`, border `#2A2A38`, focus border `#6C63FF`, border-radius 8px
- **Badges:** Small, pill-shaped. Green for positive, amber for warning, red for danger, blue for neutral, gray for default
- **Sidebar:** Background `#13131A`, active nav item highlighted with `#6C63FF` left border + subtle accent background tint
- **Tables:** Alternating row backgrounds (`#13131A` / `#0A0A0F`), header text in `#8B8B9E`
- **Charts/graphs:** Use accent purple for primary data line, positive green for income, danger red for risk zones. No gridline clutter — minimal axes only.
- **Stat cards:** Large monospace value, small label above, optional colored delta badge (up/down with arrow)

---

### App Layout

The app shell has a **fixed left sidebar** and a **main content area**.

**Sidebar contains:**
- ArgusAI wordmark/logo at the top
- Navigation links grouped by category:
  - **Overview:** Dashboard
  - **Money:** Accounts, Transactions, Bills, Subscriptions
  - **Intelligence:** Cashflow, Health Score, Risk Radar, Behavioral Insights
  - **AI Tools:** Copilot, Goals, Reports
  - **Simulators:** Debt Simulator, Scenario Simulator
  - **More:** Settings (pinned to bottom)
- Active page has `#6C63FF` left accent border + subtle purple tint on the nav item
- Inactive links in `#8B8B9E`
- User avatar + email at the very bottom above Settings
- Future/unbuilt pages are shown muted with a small "Soon" badge

**Main content area:**
- Starts with a page header: H1 page title + optional subtitle + optional action button (right-aligned)
- Content below uses a grid layout — typically 12-column, responsive

---

### Pages to Design

Design each page as a full desktop layout (1440px wide). All pages use the app shell (sidebar + main content area) except Landing, Login, Signup, and Verify Email.

#### 1. Landing Page (public, no sidebar)
- Full-width dark hero with animated background effect (aurora or beam effect)
- Bold headline: "Your finances, one step ahead."
- Subheadline: 1–2 sentences on what ArgusAI does
- Two CTA buttons: "Get Started" (accent) + "Log In" (secondary)
- Feature highlights section: 4 cards in a grid, each with an icon, title, and 2-line description
  - Cashflow Prediction, AI Copilot, Risk Radar, Behavioral Intelligence
- Minimal footer: ArgusAI wordmark + tagline

#### 2. Login Page (public, centered card)
- Centered card on dark background
- ArgusAI logo at top of card
- Email + password inputs
- "Sign In" primary button
- Google OAuth button (secondary)
- Link to Signup

#### 3. Signup Page (public, centered card)
- Same layout as Login
- Email + password + confirm password
- "Create Account" button
- Link to Login

#### 4. Verify Email Page (public, centered card)
- Simple card: icon, "Check your email" heading, short instruction, resend link

#### 5. Dashboard (app shell)
- Top: 4 stat cards in a row — Total Balance, Monthly Spend, Health Score (with color indicator), Upcoming Bills
- Middle left: Cashflow chart — 30-day projected balance curve (line chart, with red danger zone if balance dips near zero)
- Middle right: Risk Radar summary — top 2–3 active alerts as stacked alert cards (colored by severity)
- Bottom left: Recent Transactions — last 5 transactions as a compact list (merchant, amount, category badge, date)
- Bottom right: Active Subscriptions — 3–4 subscription rows with amount and next billing date

#### 6. Accounts Page (app shell)
- "Connect a bank" CTA banner at top if no accounts linked
- Account cards in a grid — institution name, account type badge, balance
- "Add Account" button top right

#### 7. Transactions Page (app shell)
- Filter bar: account dropdown, category dropdown, date range picker, search input
- Full-width table: Date | Merchant | Category (badge) | Amount (red for debit, green for credit) | Recurring indicator
- Pagination at bottom

---

Ensure the sidebar, header pattern, card style, and spacing are consistent across all pages. The product should feel like one cohesive system.
