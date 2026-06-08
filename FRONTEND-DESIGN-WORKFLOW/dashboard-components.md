# ArgusAI — Dashboard Components (Finalised)

All components below are design-locked. HTML previews live in:
`.superpowers/brainstorm/` — open `cashflow-icons.html`, `health-score-wide.html`, etc. in the companion server to review.

---

## 1. Safe to Spend

**File:** `safe-to-spend-locked.html`
**Purpose:** Hero number on dashboard. First thing user reads every morning.

### Collapsed (default)
- Eyebrow: `SAFE TO SPEND` + live green dot pill `This morning`
- Main number: `$840` — Instrument Serif, copper gradient, 54px
- Delta: `↑ $120 from yesterday` — green, 12.5px
- Available balance: `$2,340` — IBM Plex Mono, muted
- CTA: `View breakdown ↓` — full-width button, surface-2 bg

### Expanded (on tap — inline, no navigation)
- Same top section
- Divider
- Section label: `BREAKDOWN`
- Mini donut ring (88px) — left side
  - 4 segments: copper (safe to spend), red (bills), blue (goals), muted (buffer)
  - Center: `36%` + `free` label
- Right side rows: Safe to spend / Bills due / Goals / Buffer — each with pip + name + amount
- CTA: `Hide breakdown ↑`

### Tokens used
- Background: `--surface-1` (#181410)
- Number: `--grad-accent`
- Positive: `#4ADE80`
- Font: Instrument Serif (number), Hanken Grotesk (labels), IBM Plex Mono (balance)
- Border radius: `--r-xl` (18px)

### Behaviour
- Updated nightly via Celery beat (`SafeToSpendEngine`)
- Available balance = sum of all linked checking + savings accounts (no credit cards)
- Breakdown: bills due in 14 days + active goal contributions + buffer reserve

---

## 2. Financial Health Score

**File:** `health-score-wide.html`
**Purpose:** Live 0–100 score across 4 dimensions. Gamified. Taps to `/health`.

### Layout
- Wide card (max-width 420px), not tall
- Left: 4 concentric rings (160px SVG), score in center
- Right: legend column with 4 dimension rows

### Rings (outer → inner)
| Ring | Dimension | Weight | Color |
|---|---|---|---|
| Outermost | Liquidity | 30% | Copper `#C8824A` |
| 2 | Stability | 25% | Gold `#FBBF24` |
| 3 | Debt Load | 25% | Blue `#60A5FA` |
| Innermost | Spending Volatility | 20% | Red `#F87171` (when low) |

- Each ring: track (10% opacity) + fill (glow filter)
- Center: solid dark disc (`#181410`) + score in Instrument Serif gradient + `/ 100` mono label
- Rings radiate outward — score does NOT overlap rings

### Legend (right column)
- Each row: colored pip (glowing) + dimension name + weight % + score value
- Weakest dimension score in red

### Below rings
- Divider
- Callout: red dot + `Spending Volatility is pulling your score down`
- Footer: `Updated daily` + `Full view →`

### Header
- Eyebrow: `HEALTH SCORE`
- Delta chip: `↑ 3 this week` — green pill

### Tokens
- Ring colors: #C8824A, #FBBF24, #60A5FA, #F87171
- Center disc: `#181410`
- Delta chip: `rgba(74,222,128,0.1)` bg, `rgba(74,222,128,0.2)` border

---

## 3. Cashflow Preview

**File:** `cashflow-icons.html`
**Purpose:** 30–60 day balance forecast at a glance. Taps to `/cashflow`.

### Structure (mirrors total-sales-chart reference component)
- Header: `CASHFLOW` title left + `Full View` button right
- KPI: projected balance (Instrument Serif, copper gradient if healthy / plain if at risk)
- Badge: `⚠ Risk` (red) or `✓ On track` (green) — rounded pill
- Period tabs: `30D / 60D` — divide-x pill row, active = surface-3 + on-900
- Chart: 180px AreaChart (Recharts in prod, SVG in preview)
- Bottom rows: 3 data rows — Calendar / Wallet / TrendingUp Lucide icons

### Chart states
**Risk present:**
- Copper curve → transitions to red at risk zone
- Subtle red background rect on risk zone
- Dashed vertical reference line at low point day
- Glowing red dot at lowest balance
- Bottom row values: Dip date (red ↘), Lowest balance (red), Month end (muted)

**Clean:**
- Smooth copper upward curve + glow dot at end
- Bottom row values: Risk windows = None (green ↗), Lowest balance (green), Month end (green + delta)

### Lucide icons used
- Row icons: `Calendar`, `Wallet`, `TrendingUp`
- Risk badge: `TriangleAlert`
- Clear badge: `CheckCircle`
- Change arrows: chevron SVGs

### Tokens
- Healthy KPI: `linear-gradient(135deg, #D89A5C, #C8824A)`
- Risk curve: `#F87171`
- Area fill: copper 0.2 → 0 opacity
- Risk area fill: red 0.15 → 0 opacity

---

## 4. Smart Payment Calendar

**File:** `calendar-grid-v3.html`
**Purpose:** Month-grid calendar showing upcoming payments. Taps to `/calendar`.

### Structure
- Header: `UPCOMING` + `Full Calendar` button
- Month nav: `← March 2025 →` with icon buttons
- 7-column day grid (same as existing `bills/calendar/page.tsx`)
- AI note banner at bottom (auto-rotates every 10s)

### Day cells
- Day number: 22px circle, `today` = copper filled
- Brand/bank logo circles (20px) on due dates

### Logo types
| Type | Logo | Treatment |
|---|---|---|
| Subscription | Merchant brand color + letter/icon | Plain — no indicator |
| Credit card bill (due date) | Bank brand color + letter | Red ring (`box-shadow: 0 0 0 1.5px rgba(248,113,113,0.6)`) |
| Credit card (AI pay date) | Bank brand color + ✦ sparkle badge | Copper cell tint (`rgba(200,130,74,0.05)`) |

### AI note (auto-rotating)
- Copper bordered banner with sparkle icon
- Cycles every 10 seconds through all AI-recommended payment messages
- Format: `Pay [Card] by [AI Date] to [reason] — due date is [Due Date]`
- Dates highlighted in copper `#C8824A`
- AI dates = credit card payments only (never subscriptions — those are fixed by merchant)

### No legend
- Logos are self-identifying (Netflix red N, Spotify green, Chase blue C, etc.)
- ✦ sparkle badge = AI date
- Red ring = actual due date

### Tokens
- AI cell tint: `rgba(200,130,74,0.05)`
- AI note bg: `rgba(200,130,74,0.06)`, border: `rgba(200,130,74,0.15)`
- Due date ring: `rgba(248,113,113,0.6)`
- Today dot: `--amber-500`

---

## 5. Goals Overview

**File:** `goals-progress-options.html` (Option C locked)
**Purpose:** Active goals at a glance. Taps to `/goals`. Phase 7 feature — design locked, build when Phase 7 ships.

### Structure
- Header: `GOALS` + `View all` button
- 3 goal rows separated by dividers

### Per goal row
- Goal name (left) + % progress (right, IBM Plex Mono)
- Milestone segment bar (5 segments, gap 3px, height 6px, border-radius 999px)
  - Filled segments: copper gradient `linear-gradient(90deg, #D89A5C, #C8824A)`
  - Partial segment: copper fading to `rgba(240,234,224,0.1)` at fill %
  - Empty segments: `rgba(240,234,224,0.1)`
  - Behind goals: red segments `#F87171`
- Amount labels: milestone $ values spaced below bar (9.5px mono)
- Status line: `$X saved · on track` or `$X paid · behind` (11px)

### States
- On track: copper segments, green `on track` label
- Behind: red-tinted segments, red `behind` label

---

## Components Still To Design

| # | Feature | Buildable now? | Status |
|---|---|---|---|
| 6 | Recent Transactions feed | ✅ Phase 2 done | ⬜ |
| 7 | Subscriptions summary | ✅ Phase 3 done | ⬜ |
| 8 | Account Balances | ✅ Phase 2 done | ⬜ |
| 9 | AI Intelligence Feed | ✅ Phase 3.5 done | ⬜ |
| 10 | Guardian Status card | ❌ Phase 9 | ⬜ |

---

## Design System Reference

All components use tokens from `frontend/app/globals.css`:

```
Surfaces:   #0E0C0A / #181410 / #201C17 / #2A2318
Copper:     #D89A5C → #C8824A → #BE7740 → #A86838 → #8A5429
Gradient:   linear-gradient(140deg, #C8824A 0%, #BE7740 58%, #A8412B 100%)
Text:       rgba(240,234,224, 0.92/0.55/0.35/0.10)
Positive:   #4ADE80
Negative:   #F87171
Info:       #60A5FA
Fonts:      Instrument Serif (display) / Hanken Grotesk (sans) / IBM Plex Mono (mono)
Radii:      6 / 10 / 14 / 18px
```
