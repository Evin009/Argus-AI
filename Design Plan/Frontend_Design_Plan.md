# ArgusAI — Frontend Design Plan

> Living document. Update this whenever a design decision is made, a page is designed, or a
> component is built. This is the single source of truth for all frontend visual decisions.

---

## 1. Style Guide

All tokens are defined in `frontend/app/globals.css` as CSS variables and mapped to Tailwind
utilities via `@theme inline`. **Never hardcode hex values in components — use tokens only.**

---

### 1.1 Color Palette

| Token (CSS var) | Tailwind Class | Hex | Usage |
|---|---|---|---|
| `--background` | `bg-background` | `#101415` | Page background |
| `--surface` | `bg-surface` | `#1c2021` | Cards, sidebar, panels |
| `--surface-low` | `bg-surface-low` | `#181c1d` | Slightly recessed surfaces |
| `--surface-lowest` | `bg-surface-lowest` | `#0b0f10` | Deepest bg — nav, terminal chrome |
| `--surface-high` | `bg-surface-high` | `#272b2c` | Elevated / hover state |
| `--surface-bright` | `bg-surface-bright` | `#363a3b` | Active/selected surface |
| `--on-background` | `text-on-background` | `#e0e3e4` | Primary text |
| `--on-surface` | `text-on-surface` | `#e0e3e4` | Text on cards |
| `--on-muted` | `text-on-muted` | `#9a8f86` | Labels, captions, metadata |
| `--border` | `border-border` | `#4e453e` | Dividers, input borders, card borders |
| `--accent` | `text-accent` / `bg-accent` | `#ecbca7` | Brand accent — icons, labels, active states |
| `--accent-light` | `text-accent-light` / `bg-accent-light` | `#fde4d0` | CTAs, logo, primary buttons |
| `--accent-on` | `text-accent-on` | `#3c2e20` | Text on accent-light buttons |
| `--accent-container` | `bg-accent-container` | `#634131` | Accent tint backgrounds |
| `--positive` | `text-positive` | `#22c55e` | Income, success, positive delta |
| `--warning` | `text-warning` | `#f59e0b` | Caution, medium risk |
| `--danger` | `text-danger` | `#ef4444` | Overdraft risk, high alerts, errors |
| `--neutral` | `text-neutral` | `#3b82f6` | Info states, neutral insights |

---

### 1.2 Typography

| Role | Font | Tailwind Class | Weight | Size |
|---|---|---|---|---|
| Display / Headings | Space Grotesk | `font-display` | 600–700 | 2rem–5rem |
| Body / Paragraphs | Manrope | `font-body` | 400–500 | 0.875rem–1.125rem |

Both fonts loaded via `next/font/google` in `app/layout.tsx`. Variables injected as
`--font-space-grotesk` and `--font-manrope`.

**Rules:**
- All headings, labels, nav items, stat values, badge text → `font-display`
- All body copy, descriptions, paragraph text → `font-body` (default body)
- Monospace financial figures (amounts, percentages) → `font-display` with tabular nums (`font-variant-numeric: tabular-nums`)

---

### 1.3 Spacing & Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-sm` | 4px | Badges, tags |
| `rounded` | 6px | Inputs, small buttons |
| `rounded-lg` | 8px | Buttons, chips |
| `rounded-xl` | 12px | Cards, panels |
| `rounded-2xl` | 16px | Large modals, CTA sections |
| `rounded-full` | 9999px | Pill badges, avatar |

---

### 1.4 Shadows

| Name | Value | Usage |
|---|---|---|
| Card | `shadow-sm` | Resting card elevation |
| Elevated | `shadow-lg` | Hover / focus card state |
| Float | `shadow-[0_8px_32px_rgba(0,0,0,0.4)]` | Floating nav, modals |
| Mockup | `drop-shadow-[0_-8px_32px_rgba(0,0,0,0.6)]` | Dashboard peek |

---

### 1.5 Component Patterns

| Component | Pattern |
|---|---|
| **Primary button** | `bg-accent-light text-accent-on rounded-lg font-display font-bold hover:brightness-110` |
| **Secondary button** | `border border-border text-on-surface rounded-lg font-display hover:bg-surface-high` |
| **Input** | `bg-surface-low border border-border rounded-lg text-on-surface placeholder:text-on-muted focus:ring-1 focus:ring-accent` |
| **Card** | `bg-surface border border-border rounded-xl` |
| **Badge — positive** | `bg-positive/10 text-positive rounded-full text-xs font-display` |
| **Badge — warning** | `bg-warning/10 text-warning rounded-full text-xs font-display` |
| **Badge — danger** | `bg-danger/10 text-danger rounded-full text-xs font-display` |
| **Badge — neutral** | `bg-neutral/10 text-neutral rounded-full text-xs font-display` |
| **Sidebar active item** | `border-l-2 border-accent bg-accent-container/30 text-accent-light` |
| **Sidebar inactive item** | `text-on-muted hover:text-on-surface` |

---

## 2. Page Inventory

Status key: `✅ Done` · `🎨 Designed` · `🔲 Not started`

| Page | Route | Stitch Design | Built | Notes |
|---|---|---|---|---|
| Landing Page | `/` | ✅ | ✅ | Hero, features, mockup, CTA, footer |
| Login | `/login` | 🔲 | 🔲 | shadcn Card + Input + Button |
| Signup | `/signup` | 🔲 | 🔲 | shadcn Card + Input + Button |
| Verify Email | `/verify-email` | 🔲 | 🔲 | Simple card, resend link |
| Dashboard | `/dashboard` | 🔲 | 🔲 | Stats row, cashflow chart, risk summary, recent transactions |
| Accounts | `/accounts` | 🔲 | 🔲 | Account cards, Plaid link CTA |
| Transactions | `/transactions` | 🔲 | 🔲 | Filterable table |
| Bills | `/bills` | 🔲 | 🔲 | Bill list + next due dates |
| Subscriptions | `/subscriptions` | 🔲 | 🔲 | Subscription tracker, creep detection |
| Cashflow | `/cashflow` | 🔲 | 🔲 | 30–60 day forecast chart |
| Health Score | `/health-score` | 🔲 | 🔲 | Score dial + 4-dimension breakdown |
| Risk Radar | `/risk-radar` | 🔲 | 🔲 | Alert feed + risk indicators |
| Copilot | `/copilot` | 🔲 | 🔲 | Chat interface + context panel |
| Goals | `/goals` | 🔲 | 🔲 | Goal cards + progress bars |
| Reports | `/reports` | 🔲 | 🔲 | Monthly report list + individual view |
| Debt Simulator | `/simulators/debt` | 🔲 | 🔲 | Snowball vs Avalanche |
| Scenario Simulator | `/simulators/scenario` | 🔲 | 🔲 | Income/expense sliders |
| Behavioral Insights | `/behavioral` | 🔲 | 🔲 | Spending pattern visualizations |
| Settings | `/settings` | 🔲 | 🔲 | Profile, linked accounts, preferences |

---

## 3. Component Library

### 3.1 shadcn/ui — Status

Initialize: `npx shadcn@latest init` (dark mode, CSS variable mode, aliases to `@/components`)

| Component | Status | Notes |
|---|---|---|
| `button` | 🔲 | Override with accent-light primary variant |
| `input` | 🔲 | Override border/focus to brand tokens |
| `card` | 🔲 | Override bg to `--surface`, border to `--border` |
| `badge` | 🔲 | Add positive/warning/danger/neutral variants |
| `dialog` | 🔲 | |
| `dropdown-menu` | 🔲 | |
| `table` | 🔲 | Alternating row bg: surface / surface-low |
| `toast` | 🔲 | |
| `avatar` | 🔲 | |
| `separator` | 🔲 | `bg-border` |
| `skeleton` | 🔲 | `bg-surface-high` |

### 3.2 Custom ArgusAI Components

| Component | File | Status | Description |
|---|---|---|---|
| `AuroraBackground` | `components/ui/aurora-background.tsx` | ✅ | CSS-animated aurora blobs for landing hero |
| `StatCard` | `components/ui/stat-card.tsx` | 🔲 | Metric card: label + large mono value + delta badge |
| `RiskBadge` | `components/ui/risk-badge.tsx` | 🔲 | Risk level badge: low/medium/high with color variant |
| `SectionHeader` | `components/ui/section-header.tsx` | 🔲 | Page heading + optional subtitle + action slot |
| `EmptyState` | `components/ui/empty-state.tsx` | 🔲 | Centered empty state with icon, message, CTA |

### 3.3 Aceternity UI — Planned

Install dependencies already done (`framer-motion`, `clsx`, `tailwind-merge`).

| Component | Status | Planned Usage |
|---|---|---|
| `aurora-background` | ✅ Custom impl | Landing hero |
| `card-hover-effect` | 🔲 | Landing feature grid — replace CSS hover |
| `spotlight` | 🔲 | Hero section focal point |
| `moving-border` | 🔲 | Optional CTA button accent |
| `meteors` | 🔲 | Dashboard header ambient effect |

---

## 4. App Layout Shell

File: `frontend/app/(app)/layout.tsx`

| Element | Status | Notes |
|---|---|---|
| Sidebar nav links (all pages) | 🔲 | Group by: Overview / Money / Intelligence / AI Tools / Simulators |
| Active page accent highlight | 🔲 | Left border `border-accent` + `bg-accent-container/30` |
| Coming Soon badges | 🔲 | Muted + small pill badge on unbuilt pages |
| ArgusAI logo / wordmark | 🔲 | Top of sidebar |
| User avatar + email | 🔲 | Bottom of sidebar, above Settings |

---

## 5. Design Decisions Log

| Decision | Choice | Why |
|---|---|---|
| Font — display | Space Grotesk | Terminal-adjacent feel; more technical than Inter; matches Stitch visual output |
| Font — body | Manrope | Clean, readable at small sizes; pairs well with Space Grotesk |
| Accent color | Warm peach `#ecbca7` / `#fde4d0` | Stitch design output; feels trustworthy and approachable vs cold purple |
| Tailwind config | CSS-first via `@theme inline` in `globals.css` | Tailwind v4 standard; no `tailwind.config.ts` needed |
| Nav style | Floating pill, glassmorphism | Modern SaaS pattern; contrasts cleanly against hero image |
| Dashboard preview | CSS mockup (not screenshot) | App not built yet; CSS mockup is swappable in one component |
| Hero background | Photo + aurora blobs overlay | Stitch design direction; more atmospheric than pure gradient |

---

## 6. Outstanding Design Decisions

- [ ] Final logo / wordmark SVG — currently using text-only "ArgusAI"
- [ ] Decide if accent color stays warm peach or shifts to purple (`#6C63FF`) for the app shell
- [ ] Chart library — Recharts vs Tremor (needed for Dashboard, Cashflow, Health Score pages)
- [ ] Decide on sidebar width — 240px vs 256px vs collapsible
- [ ] Mobile nav strategy — bottom tab bar vs hamburger drawer
- [ ] Dashboard mockup — swap CSS placeholder with real screenshot once Dashboard page is built
