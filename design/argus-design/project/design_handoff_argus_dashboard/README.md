# Handoff: Argus Dashboard (one-page AI fintech dashboard)

## Overview
A compact, single-frame personal-finance dashboard for **Argus** — an AI personal-finance assistant
("Your money, watched."). One screen, no scrolling on desktop: balance + wallets, a KPI cluster, a
spending-by-category donut, monthly spending limit, cards, an upcoming-transactions calendar, recent
activity, and a signature AI overdraft-risk insight banner. Dark warm-neutral brand with a **copper +
red** accent and a **film-grain** texture on accent surfaces, plus a persisted light/dark toggle.

## About the design files
The files in this bundle are **design references created in HTML** (React + Babel served from CDN).
They are prototypes showing the intended look and behavior — **not production code to copy directly**.
The task is to **recreate these designs in the target codebase's existing environment** (React, Vue,
Svelte, SwiftUI, etc.) using its established components, tokens, and patterns. If no environment exists
yet, pick the most appropriate framework and implement there. Lucide is the icon set; swap for the
codebase's icon library if it has one.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and layout. Recreate pixel-accurately using the
codebase's primitives. Data is illustrative (sample transactions, the name "Jordan Reyes") — wire to
real data.

## Two deliverables in this bundle
1. **`DESIGN_SYSTEM_CHANGES.md`** — every brand change made during this build (copper+red tokens, the
   grain utility, new UI-kit patterns), written as a diff to fold into the Argus Design System.
2. **This README** — how to implement the dashboard screen itself.

---

## Screen: Dashboard (`Argus Dashboard.html`)

### Layout
- **Outer shell** (`.arg-shell`): full-viewport flex row, `gap:14px`, `padding:14px`, `max-width:1560px`
  centered, `align-items:stretch`.
  - **Left rail** (64px, fixed): compact pill-shaped icon rail, **vertically centered**
    (`align-self:center`, `border-radius:var(--r-pill)`). Top = light/dark toggle (sun/moon, active =
    copper fill). Middle = nav icons (`layout-grid` active). Bottom (hairline-separated) = help, sign-out.
  - **Main column** (`.arg-main`): flex column, `gap:14px`.
    1. **Top nav bar** (`.arg-chrome` → `<header>`): logo + wordmark, segmented tab group, then a
       right cluster: **Ask Argus** CTA, search/bell/info icon buttons, profile chip.
    2. **Greeting**: `<h1>` "Good morning, *Jordan*" (serif, italic emphasis on the name). No subtitle.
    3. **Insight banner** (full width) — red overdraft-risk variant.
    4. **Compact grid** (`.arg-grid`): 3 columns
       `minmax(320px,1fr) minmax(290px,1.12fr) minmax(330px,1.28fr)`, `gap:14px`, `align-items:stretch`.
       - **Row 1:** Balance card · KPI cluster (2×2) · Spending donut
       - **Row 2:** [Spending limit + My cards] (stacked `.arg-col`) · Upcoming-transactions calendar · Recent activity
       - Under 1080px: collapse to 2 columns (all children span 2).

### Components

**Top nav bar** — `--surface-1` fill, `1px var(--surface-3)` border, `border-radius: var(--r-xl)`,
`padding:12px 16px`, flex row `gap:18`.
- *Logo*: 36px circular `logo-argus.png` (cover) on `#0C0A07`, + "Argus" wordmark (serif, ~26px).
- *Tabs*: pill container `--surface-2`, `padding:4`. Items `padding:8px 16px`, 13.5px. **Active tab** =
  `var(--grad-accent)` copper→red fill, white text, `+ .grain`. Inactive = transparent, `--on-dark-400`.
- *Ask Argus CTA*: `var(--grad-accent)` fill, white, pill, `sparkles` icon, `+ .grain`,
  shadow `0 6px 16px rgba(168,65,43,0.28)`.
- *Icon buttons*: 38px round, `--surface-2`, `1px --surface-3`; bell has a `--negative-bright` dot.
- *Profile chip*: pill, 32px avatar (copper gradient, mono initials "JR"), name + truncated email, chevron.

**Balance card** (`Panel`: `--surface-1`, `1px --surface-3`, `var(--r-lg)`, `padding:18`) — flex column,
`justify-content:space-between` so wallets anchor to the bottom.
- "Total balance" label + currency pill (USD ▾).
- Figure **$689,372**`.00` (Hanken, `tabular-nums`, 34px, the `.00` muted 20px).
- Ticker chip `↑ 5%` (positive) + "than last month".
- Two buttons: **Transfer** (`var(--grad-accent)` + `.grain`, white) and **Request** (`--surface-2`, hairline).
- **Wallets** (hairline-topped): "TOTAL 6 WALLETS" + 3 chips (USD/EUR/GBP) each with a copper currency
  dot, amount, "LIMIT …" mono, and Active/Inactive status (`--positive-bright`/`--negative-bright`).

**KPI cluster** — 2×2 grid, `gap:14`, fills row height. Each `MiniStat`: label + 28px rounded icon
chip, big figure, delta (`↑/↓ n%`) + "This month". **One highlighted tile** ("Income"): `var(--grad-accent)`
fill, white text, `+ .grain`, shadow `0 10px 28px rgba(168,65,43,0.30)`. Tiles: Income (hi), Spending
(neg delta), Savings, Net flow.

**Spending donut** (`Panel`) — title "Spending by category" + "This month" + month pill. SVG donut
(viewBox 172, displayed 232px, rotated -90°): track circle `--surface-2` `stroke-width:13`; one
`pathLength=100` arc per category with `stroke-linecap:round`, `stroke-dasharray:"{pct-gap} {rest}"`,
`stroke-dashoffset:-accumulated`, ~5% gap between arcs. Center: **$5,070** + "TOTAL SPENT". Categories
(amounts → arc colors): Household `--info`, Auto&transport `--amber-400`, Groceries `--positive-bright`,
Drinks&dining `--amber-600`, Entertainment `--taupe`, Health care `--negative-bright`. *No legend list.*

**Spending limit** (`Panel`) — "Monthly spending limit" + "25% USED" (copper). Track `--surface-2` with
diagonal-hatch image; fill 25% `--amber-500`. Below: "$1,400.00 spent out of" / "$5,500.00".

**My cards** (`Panel`) — header `credit-card` icon + "My cards" + "+ Add new" (copper text). Two 116px
cards side by side: a dark card (`linear-gradient(140deg,#2A251D,#14110D)`) and a **copper card**
(`var(--grad-accent)` + `.grain`). Each: `wifi` (rotated), ACTIVE chip, scheme dots / sparkles, masked
number.

**Upcoming-transactions calendar** (`Panel`) — eyebrow "UPCOMING TRANSACTIONS" + "MAY 2026", hairline
under. Weekday header SUN–SAT (mono, centered). **Bordered table grid** (gap-as-line: container
`background:var(--surface-3)`, `gap:1px`, `border-radius:var(--r-md)`, `overflow:hidden`; cells
`background:var(--surface-1)`), 7 cols × 2 rows (days 27→10). Each cell: day number top (today **28** in
a 24px round `--surface-3` pill; past **27** muted + diagonal hatch), optional **overlapping circular
merchant badges** (24px, white icon, `-8px` overlap, 2px `--surface-1` ring), amount (mono) pinned bottom.
Sample: 29 deposit `arrow-down-left` blue "$2.3k"; 1 `play`+`music` (red+green) "$21.98"; 3 `play` red
"$82.99"; 4 `cloud`+`gamepad-2` (blue+purple) "$144.99"; 7 `command` black "$9.99".

**Recent activity** (`Panel`) — title "Recent activity" + "View all" (copper). Compact single-column
list, hairline between rows: 30px rounded category-icon chip, name + date (mono), signed amount
(income `+` = `--positive-bright`, else `--paper`).

**Insight banner (overdraft risk)** — `background: rgba(168,65,43,0.10)`, `1px rgba(168,65,43,0.42)`,
`var(--r-lg)`. Red `EyeMark` (24px, `color="var(--accent-red)"`), copy with bold lead, **Fix it →**
button `--accent-red` fill white. Copy: "**Heads up — overdraft risk on May 31.** Rent ($1,850) clears
two days before payday. Move $240 from savings now and you're clear."

## Interactions & behavior
- **Light/dark toggle** (rail): toggles `body.light`, **persisted in `localStorage["argus-theme"]`**,
  default dark. Light mode remaps `--surface-*` / `--paper` / `--on-dark-*` to warm cream and adds soft
  shadows to panels.
- **Tabs** and **rail icons**: local active state, color/background transitions (0.15s).
- **Hover**: color shifts only (no scale). Inactive tabs/rail icons lighten on hover.
- Icons initialized via `lucide.createIcons()` in a top-level `useEffect`.
- The grid is responsive (3-col → 2-col at ≤1080px).

## State management
- `theme: "dark" | "light"` — persisted (localStorage), drives `body.light`.
- `active` tab (TopNav) and `active` rail icon — local UI state.
- All financial figures are static sample data → replace with real account data / API.

## Design tokens
**Accent (copper, re-pointed amber ramp):** `--amber-300 #DBA678`, `--amber-400 #CC8A54`,
`--amber-500 #BC7A43`, `--amber-600 #A86A34`, `--amber-700 #875228`, `--amber-tint-dark rgba(204,138,84,0.10)`.
**Red companion:** `--accent-red #A8412B`. **Gradient:** `--grad-accent linear-gradient(140deg,var(--amber-400),var(--accent-red))`.
**Canvas:** `--surface-0 #0E0C0A`. Other surface / ink / semantic / radius / shadow / spacing tokens come
from the system's `colors_and_type.css` (bundled). **Type:** Instrument Serif (display/headlines, italic
emphasis), Hanken Grotesk (UI/body/figures, `tabular-nums`), IBM Plex Mono (eyebrows/labels/data).
**Grain:** see `DESIGN_SYSTEM_CHANGES.md` §2.

## Assets
- `logo-argus.png` — circular copper "A" Argus mark (user-supplied). Used in the nav.
- Icons: **Lucide** (CDN). Eye brand mark is an inline SVG component (`EyeMark`).
- Merchant logos in the calendar are **substituted** with Lucide glyphs in brand-colored circles
  (no real third-party logos shipped).

## Files
- `Argus Dashboard.html` — entry + global styles + token/grain overrides.
- `Atoms.jsx`, `Chrome.jsx`, `Cards.jsx` — components.
- `colors_and_type.css`, `components.css` — Argus design-system tokens & component classes.
- `logo-argus.png` — brand mark.
- `DESIGN_SYSTEM_CHANGES.md` — brand changes to fold back into the design system.
