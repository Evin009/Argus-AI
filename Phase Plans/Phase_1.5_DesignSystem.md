# ArgusAI — Phase 1.5: Design System

> Pre-Phase 2. Goal: lock in the visual identity, Tailwind theme, and base component library before
> any feature pages are built. Every page from Phase 2 onward inherits this foundation.

---

## Progress — Last Updated 2026-04-26

| Area | Status |
|---|---|
| Stitch landing page design | ✅ Completed — Visual Design Implementation project |
| Brand tokens in `globals.css` | ✅ Completed — Tailwind v4 `@theme inline` + CSS variables |
| Fonts (Space Grotesk + Manrope + Playfair Display) | ✅ Completed — loaded via `next/font/google` in `app/layout.tsx` |
| Aurora background component | ✅ Completed — `components/ui/aurora-background.tsx` |
| FadeIn scroll component | ✅ Completed — `components/ui/fade-in.tsx` |
| Landing page (`app/page.tsx`) | ✅ Completed — all 7 sections, framer-motion animations, shadcn Button/Input |
| `framer-motion`, `clsx`, `tailwind-merge` | ✅ Installed |
| `class-variance-authority`, `@radix-ui/react-slot` | ✅ Installed |
| shadcn/ui `Button` | ✅ Completed — brand-token variants, used across landing page |
| shadcn/ui `Input` | ✅ Completed — used in CTA email capture |
| `lib/utils.ts` (`cn` helper) | ✅ Completed |
| shadcn CSS variables wired to brand tokens | ✅ Completed — in `globals.css` |
| Floating animated nav (scroll-aware) | ✅ Completed — widens at top, compresses on scroll |
| shadcn/ui remaining components | 🔲 Deferred to app shell phase |
| Aceternity UI components | 🔲 Deferred to app shell phase |
| App layout shell + sidebar | 🔲 Deferred — landing page is current focus |
| Custom components (StatCard, RiskBadge, etc.) | 🔲 Deferred — app shell phase |
| Auth pages redesign | 🔲 Deferred — after landing page is done |

### Design System Decisions Made

- **Fonts:** Space Grotesk (display/headings) + Manrope (body) — matches the Stitch visual design output.
  The Phase 1.5 plan originally specified Inter + JetBrains Mono. Space Grotesk gives a more technical,
  terminal-adjacent feel that better matches the product direction.
- **Accent color:** Warm peach (`#ecbca7` / `#fde4d0`) from the Stitch design, replacing the originally
  planned purple (`#6C63FF`). The earthy warm tone fits the professional-but-approachable product tone.
  Purple is available as an option if the direction changes.
- **Tailwind config:** Tailwind v4 uses CSS-first config (`@theme inline` in `globals.css`). There is no
  `tailwind.config.ts` — all tokens live in `globals.css`.

---

---

## What This Phase Covers

| Layer | Goal |
|---|---|
| Design Mockups | Design all key pages in Pencil.dev before writing any code |
| Visual Identity | Color palette, typography, spacing scale, border radius, shadow system |
| Tailwind Config | Extend `tailwind.config.ts` with brand tokens — colors, fonts, radii |
| Global Styles | `globals.css` — CSS variables, base resets, scrollbar styling, font loading |
| shadcn/ui | Install and configure shadcn — functional components (forms, tables, dialogs, nav) |
| Aceternity UI | Install selectively — animated/visual components for landing page and dashboard hero |
| Layout Shell | Finalize `app/(app)/layout.tsx` sidebar with correct nav links for all planned pages |
| Landing Page | Polish `app/page.tsx` with Aceternity hero + brand identity |
| Auth Pages | Apply consistent design to login, signup, verify-email pages |

---

## Design Direction

ArgusAI is a **predictive fintech AI product** — the design should feel:
- **Dark-first** — dark background with high-contrast data surfaces
- **Precise** — clean typography, tight spacing, no decorative clutter
- **Trustworthy** — not flashy; professional like a terminal or Bloomberg-style dashboard
- **Intelligent** — subtle accent colors for data states (positive, warning, danger, neutral)

---

## Component Library Strategy

Two libraries, each used where it wins:

| Library | Role | Used For |
|---|---|---|
| **shadcn/ui** | Functional app components | Inputs, buttons, tables, dialogs, dropdowns, sidebar, forms, badges, toasts |
| **Aceternity UI** | Visual / animated components | Landing page hero, feature cards, dashboard header, background effects |

> **Rule:** shadcn for anything inside the app shell. Aceternity selectively on the landing page
> and dashboard hero only — not on data-heavy pages where animation would distract.

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `background` | `#0A0A0F` | App background |
| `surface` | `#13131A` | Cards, panels, sidebar |
| `surface-raised` | `#1C1C26` | Hover states, elevated cards |
| `border` | `#2A2A38` | Dividers, input borders |
| `text-primary` | `#F0F0F5` | Headings, primary content |
| `text-secondary` | `#8B8B9E` | Labels, captions, metadata |
| `text-muted` | `#52526A` | Placeholder text, disabled |
| `accent` | `#6C63FF` | Brand accent — CTAs, active nav, links |
| `accent-hover` | `#5B53E8` | Accent hover state |
| `positive` | `#22C55E` | Income, positive delta, success |
| `warning` | `#F59E0B` | Caution alerts, medium risk |
| `danger` | `#EF4444` | Overdraft risk, high alerts, errors |
| `neutral` | `#3B82F6` | Info states, neutral insights |

---

## Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / Hero | Inter | 700 | 3rem–4rem |
| Heading H1 | Inter | 600 | 1.875rem |
| Heading H2 | Inter | 600 | 1.5rem |
| Heading H3 | Inter | 500 | 1.25rem |
| Body | Inter | 400 | 0.9375rem |
| Caption / Label | Inter | 400 | 0.8125rem |
| Mono (amounts) | JetBrains Mono | 500 | match context |

> Financial figures (balances, transaction amounts, percentages) use JetBrains Mono — distinguishes
> data from prose and prevents misread digits.

---

## Git Branch Structure

This phase uses a single branch — no sub-feature branches needed.

```
develop
└── feature/design-system
```

**Setup:**
```bash
git checkout develop
git checkout -b feature/design-system
git push -u origin feature/design-system
```

**Close:**
```bash
# Open PR on GitHub: feature/design-system → develop
# After CI passes and PR is reviewed, merge it
git branch -d feature/design-system
git push origin --delete feature/design-system
```

---

## Execution Checklist

### Design Mockups (Pencil.dev / Google Stitch)

- [x] Design `Landing page` — Stitch project "Visual Design Implementation" (ID: 14880738280645865795)
- [ ] Design `Login` + `Signup` + `Verify Email` pages
- [ ] Design `Dashboard` — summary cards, account overview, recent transactions strip
- [ ] Design `Accounts` page — account cards + bank linking flow
- [ ] Design `Transactions` page — table with filters
- [ ] Design `Bills` + `Subscriptions` pages
- [ ] Design `Cashflow` page — chart + projection cards
- [ ] Design `Health Score` page — score dial + dimension breakdown
- [ ] Design `Risk Radar` page — alert feed + risk indicators
- [ ] Design `Copilot` chat page — chat interface + context panel
- [ ] Design `Goals` page — goal cards + progress bars
- [ ] Design `Reports` page — monthly report list + individual report view
- [ ] Design `Debt Simulator` + `Scenario Simulator` pages
- [ ] Design `Settings` page — profile, linked accounts, preferences
- [ ] Review all mockups for visual consistency before moving to code

---

### Tailwind + Global Styles

- [x] Install fonts — Space Grotesk + Manrope via `next/font/google` in `app/layout.tsx`
- [x] Brand tokens in `globals.css` (Tailwind v4 `@theme inline` — no `tailwind.config.ts` needed):
  - Full color palette as CSS variables + Tailwind utilities
  - Font family tokens for `font-display` and `font-body`
  - Aurora animation keyframes
- [x] Update `globals.css`:
  - CSS variables for all color tokens in `:root`
  - Body background + text set to brand tokens
  - Custom scrollbar styling
  - Aurora animation classes and text-shadow utility

---

### shadcn/ui Setup

- [x] Initialize shadcn — configured manually via `components.json` (style "default", rsc true, tsx true)
- [x] Configure `components.json` — aliases set to `@/components` and `@/lib/utils`
- [x] Override shadcn CSS variables in `globals.css` to match ArgusAI color palette
- [x] Add core components used across the app:
  - [x] `npx shadcn@latest add button` — brand-token variants, `font-display`, `cva`
  - [x] `npx shadcn@latest add input` — brand tokens, focus ring uses `--accent`
  - [ ] `npx shadcn@latest add card` — deferred to app shell phase
  - [ ] `npx shadcn@latest add badge` — deferred to app shell phase
  - [ ] `npx shadcn@latest add dialog` — deferred to app shell phase
  - [ ] `npx shadcn@latest add dropdown-menu` — deferred to app shell phase
  - [ ] `npx shadcn@latest add table` — deferred to app shell phase
  - [ ] `npx shadcn@latest add toast` — deferred to app shell phase
  - [ ] `npx shadcn@latest add avatar` — deferred to app shell phase
  - [ ] `npx shadcn@latest add separator` — deferred to app shell phase
  - [ ] `npx shadcn@latest add skeleton` — deferred to app shell phase
- [ ] Verify all added shadcn components render correctly in the dark theme — in progress (Button + Input verified on landing page)

---

### Aceternity UI Setup

- [x] Install Aceternity dependencies — `npm install framer-motion clsx tailwind-merge`
- [x] Custom `aurora-background` built — `components/ui/aurora-background.tsx` (CSS @keyframes, no Aceternity CLI needed)
- [ ] Install `npx aceternity-ui@latest add` for remaining components (deferred to app shell phase):
  - `spotlight` — hero section spotlight effect
  - `card-hover-effect` — replace interim framer-motion hover on feature cards
  - `moving-border` — optional CTA button accent on landing page
  - `meteors` or `sparkles` — dashboard header ambient effect (subtle, not distracting)
- [ ] Wrap Aceternity components in `React.Suspense` where needed to avoid SSR issues
- [ ] Verify: Aceternity effects only appear on landing page and dashboard hero — not on data pages

---

### Custom App Components (`frontend/components/`)

Built on top of shadcn primitives — these are ArgusAI-specific wrappers:

- [x] `FadeIn.tsx` — scroll-triggered fade+slide wrapper using framer-motion `useInView`; used across all landing page sections
- [ ] `StatCard.tsx` — metric card with label, large value (JetBrains Mono), optional delta badge (`positive`/`danger`); used on dashboard, health score, cashflow
- [ ] `RiskBadge.tsx` — risk level badge (`low` / `medium` / `high`) with color-coded variant
- [ ] `SectionHeader.tsx` — page section heading with optional subtitle and action button slot
- [ ] `EmptyState.tsx` — centered empty state with icon, message, and optional CTA; used when no data exists yet

---

### Layout Shell (`app/(app)/layout.tsx`)

- [ ] Polish sidebar with final brand colors (surface bg, accent active state, text-secondary inactive)
- [ ] Add all planned nav links (one per page across all phases):
  - Dashboard, Accounts, Transactions, Bills, Subscriptions
  - Cashflow, Health Score, Risk Radar, Copilot, Goals
  - Debt Simulator, Scenario Simulator, Reports, Behavioral Insights
  - Settings (bottom of sidebar)
- [ ] Mark future pages as visually distinct (muted + `Coming Soon` badge) — avoids dead links
- [ ] Add ArgusAI logo / wordmark to top of sidebar
- [ ] Add user avatar + email to bottom of sidebar above Settings

---

### Landing Page (`app/page.tsx`)

- [x] Brand color palette (warm peach) + Space Grotesk font applied throughout
- [x] Hero section: custom CSS aurora background (`components/ui/aurora-background.tsx`) + bold headline + two CTA buttons
- [x] Problem section: 3-column statement strip
- [x] Feature highlights: 4 cards (2×2) with CSS-animated previews (chart, terminal, radar, heatmap)
- [x] Dashboard mockup: fake terminal window showing stats, cashflow chart, risk alerts
- [x] Feature teaser grid: 6-item (3×2) for Debt Simulator, Health Score, Scenario Simulator, Subscription Creep, Smart Allocation, Bill Calendar
- [x] Final CTA section: email input + Get Early Access button
- [x] Footer: minimal with nav links + disclaimer
- [ ] Aceternity `card-hover-effect` — placeholder CSS hover; replace with full Aceternity component when installed

---

### Auth Pages

- [ ] Apply consistent card-centered layout to login, signup, verify-email pages using shadcn `Card`
- [ ] Use shadcn `Input` and `Button` components throughout
- [ ] Consistent error/success message styling using shadcn `Badge` + `danger`/`positive` color tokens

---

### Component Showcase (optional but recommended)

- [ ] Create `app/(app)/design/page.tsx` — internal-only page that renders all shadcn components, Aceternity components, and custom components with all variants; used for visual QA; remove before v1.0

---

## Definition of Done

- [ ] All key pages designed in Pencil.dev and reviewed for consistency
- [x] `globals.css` CSS variables match ArgusAI palette (overriding shadcn defaults) — Tailwind v4 `@theme inline`, no `tailwind.config.ts`
- [x] Space Grotesk + Manrope + Playfair Display loaded via `next/font/google` with no layout shift
- [ ] shadcn initialized and all 11 core components added and dark-themed correctly — Button + Input done; remaining deferred
- [x] Custom aurora background component rendering on landing page
- [ ] Remaining Aceternity components installed (spotlight, card-hover-effect, etc.) — deferred
- [ ] 4 custom app components built: `StatCard`, `RiskBadge`, `SectionHeader`, `EmptyState` — `FadeIn` done; rest deferred
- [ ] Sidebar shows all planned nav links; future pages marked Coming Soon
- [x] Landing page built with brand palette, framer-motion animations, hero bg, scroll-aware nav, shadcn Button + Input
- [ ] Auth pages use shadcn Card + Input + Button
- [ ] No hardcoded color hex values in any component — all use Tailwind tokens
- [ ] PR merged into `develop`, CI green

---

## Critical Files

| File | Why it can't be skipped |
|---|---|
| `tailwind.config.ts` | All component styling depends on these tokens — change it later = restyle everything |
| `globals.css` | shadcn CSS variable overrides live here — wrong values = wrong colors everywhere |
| `components.json` | shadcn config — controls where components are generated and how they import |
| `frontend/components/ui/` | All shadcn components live here — every page depends on them |
| `app/(app)/layout.tsx` | Sidebar nav must have all routes locked in before Phase 2 pages are built |

---

## New Dependencies

**npm:**
```
framer-motion       # required by Aceternity UI
clsx                # className utility (also used by shadcn)
tailwind-merge      # merges Tailwind classes safely (also used by shadcn)
```

> shadcn/ui components are copied into your codebase via CLI — they are not an npm dependency.
> Aceternity UI components are also copied in selectively — install only what you use.
