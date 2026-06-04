# Design

## Theme

Dark warm-neutral. Canvas is the near-black from the Argus logo (`#0E0C0A`). Accent is copper sampled exactly from the logo mark, with a brick-red companion for risk/alert surfaces. Film-grain texture rides on all copper/accent-filled surfaces, matching the logo's gritty metal speckle. A persisted light/dark toggle remaps surfaces to warm cream.

Color strategy: **restrained** — tinted near-black canvas with copper accent used deliberately on 1-2 emphasis surfaces per screen. The gradient accent (`--grad-accent`) is reserved for hero surfaces only: primary CTA, active nav tab, single highlighted KPI tile, premium card.

## Color Palette

### Dark mode (default)

| Token | Value | Role |
|---|---|---|
| `--surface-0` | `#0E0C0A` | Page canvas (matches logo near-black) |
| `--surface-1` | `#181410` | Card / panel fill |
| `--surface-2` | `#201C17` | Inset / input background |
| `--surface-3` | `rgba(255,255,255,0.08)` | Hairline borders, dividers |
| `--paper` | `#F0EAE0` | Primary text on dark surfaces |
| `--on-dark-900` | `#F0EAE0` | High-emphasis text |
| `--on-dark-600` | `#B0A898` | Secondary text |
| `--on-dark-400` | `#7A7168` | Muted / placeholder text |

### Copper accent (sampled from logo)

| Token | Value | Role |
|---|---|---|
| `--copper` | `#BE7740` | Exact logo copper — flat accent |
| `--amber-300` | `#D89A5C` | Highlight copper |
| `--amber-400` | `#C8824A` | Accent text / icons on dark |
| `--amber-500` | `#BE7740` | Primary accent fill |
| `--amber-600` | `#A86838` | Primary action fill |
| `--amber-700` | `#8A5429` | Hover state |
| `--amber-tint-dark` | `rgba(190,119,64,0.10)` | Tint wash on dark |
| `--accent-red` | `#A8412B` | Brick-red companion — risk/alert surfaces only |
| `--grad-accent` | `linear-gradient(140deg, #C8824A 0%, #BE7740 58%, #A8412B 100%)` | Hero surfaces only |

### Semantic

| Token | Value | Role |
|---|---|---|
| `--positive-bright` | `#4ADE80` | Income, positive delta |
| `--negative-bright` | `#F87171` | Risk, negative delta |
| `--info` | `#60A5FA` | Neutral data / info |
| `--amber-400` | `#C8824A` | Warning (reuses copper) |
| `--taupe` | `#A8956E` | Neutral category color |

### Light mode (warm cream remap, `body.light`)

| Token | Value |
|---|---|
| `--surface-0` | `#ECE3D2` |
| `--surface-1` | `#FCF8F0` |
| `--surface-2` | `#F2E8D7` |
| `--surface-3` | `rgba(20,17,13,0.12)` |
| `--paper` | `#1C1815` |
| `--on-dark-900` | `#1C1815` |
| `--on-dark-600` | `#4A433B` |
| `--on-dark-400` | `#6B6052` |

## Typography

Three families, strict roles. No mixing within a role.

| Family | Role | Usage |
|---|---|---|
| **Instrument Serif** | Display / headlines | Page greeting, section headers, large emphasis figures |
| **Hanken Grotesk** | UI / body / figures | All interface text, balances, amounts (`tabular-nums`) |
| **IBM Plex Mono** | Labels / data / eyebrows | Short uppercase labels (≤4 words), data tags, amounts in tables |

Scale (Hanken Grotesk base):
- `34px` — hero figures (balance, primary stat)
- `28px` — KPI figures
- `20px` — section headings
- `16px` — body / card content
- `13.5px` — nav tabs, secondary labels
- `11px` — IBM Plex Mono eyebrows (uppercase only, ≤4 words)

Instrument Serif italic is used for name/emphasis in the greeting: "Good morning, *Jordan*".

## Components

### Film grain utility (`.grain`)
Applied only to copper / `--grad-accent` filled boxes. Never on neutral panels or the canvas.

```css
.grain { position: relative; isolation: isolate; }
.grain > * { position: relative; z-index: 1; }
.grain::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  opacity: 0.42;
  background-size: 130px 130px, 145px 145px;
  background-image:
    url("data:image/svg+xml,...bright specks..."),
    url("data:image/svg+xml,...dark specks...");
}
body.light .grain::after { opacity: 0.55; mix-blend-mode: multiply; }
```

### Panels / Cards
`--surface-1` fill, `1px var(--surface-3)` border, `border-radius: var(--r-lg)`, `padding: 18px`. No nested cards.

### Primary CTA ("Ask Argus")
`--grad-accent` fill + `.grain`, white text, pill shape, sparkles icon, `box-shadow: 0 6px 16px rgba(168,65,43,0.28)`.

### Active nav tab
`--grad-accent` fill + `.grain`, white text. Inactive tabs: transparent, `--on-dark-400`, lighten on hover.

### Icon rail (left sidebar)
64px wide, pill-shaped (`border-radius: var(--r-pill)`), vertically centered (`align-self: center`). Top: light/dark toggle. Middle: nav icons. Bottom (hairline-separated): help, sign-out.

### AI Insight Banner — risk variant
`background: rgba(168,65,43,0.10)`, `border: 1px rgba(168,65,43,0.42)`, `border-radius: var(--r-lg)`. Red eye icon, bold lead copy, "Fix it →" button in `--accent-red`.

### Spending donut
SVG `<circle pathLength="100">` arcs, `stroke-linecap: round`, ~5% gap between segments, total in center, no legend list.

### Upcoming-transactions calendar
Bordered table grid via gap-as-line trick: container `background: var(--surface-3)` + `gap: 1px`, cells `background: var(--surface-1)`. Today in a 24px round `--surface-3` pill. Past days diagonally hatched. Overlapping circular merchant badges (24px, white icon, `-8px` overlap, 2px ring).

### KPI tiles (MiniStat)
2x2 grid. One highlighted tile uses `--grad-accent` + `.grain`. Others use `--surface-1`. Label + icon chip + big figure + delta.

## Layout

Single-frame dashboard grid (no vertical scroll on desktop):
```css
grid-template-columns: minmax(320px, 1fr) minmax(290px, 1.12fr) minmax(330px, 1.28fr);
gap: 14px;
```
Collapses to 2-column at ≤1080px. Outer shell: `padding: 14px`, `max-width: 1560px`, centered.

## Spacing & Radii

| Token | Value |
|---|---|
| `--r-sm` | `6px` |
| `--r-md` | `10px` |
| `--r-lg` | `14px` |
| `--r-xl` | `18px` |
| `--r-pill` | `9999px` |
| Grid gap | `14px` |
| Panel padding | `18px` |

## Motion

Transitions: `0.15s ease-out` for color/background state changes (tab active, rail icon active). No layout animation. All animations respect `prefers-reduced-motion`. Entry animations (`argFade`) do not gate content visibility.

## Assets

- `logo-argus.png` — circular copper "A" mark, 36px in nav, displayed on `#0C0A07` circle.
- Icons: Lucide icon set.
- Merchant logos: substituted with Lucide glyphs in brand-colored circles.
