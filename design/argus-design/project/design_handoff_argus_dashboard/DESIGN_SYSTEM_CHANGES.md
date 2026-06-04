# Argus Design System — Change Spec

**copper + red accent · film-grain texture · dashboard UI-kit**

This document is a **copy-paste-ready implementation guide** for folding the changes made while building
the Argus Dashboard back into the official Argus Design System (which lives in a separate, read-only
project). Everything below reflects the **final, shipped** values.

Apply order: **§1 tokens → §2 grain utility → §3 light mode → §4 usage rules → §5 register UI-kit**.
A quick checklist is at the end (§7).

> **Intent — read first.** The current system declares **amber the single accent, used with restraint**.
> These changes deliberately evolve that into a **copper + red two-tone accent** plus a **film-grain
> texture** on accent surfaces, both sampled from the circular "A" logo. This is an intentional brand
> evolution — make the call consciously, don't auto-merge.

---

## 1. Color tokens  →  `colors_and_type.css`

### 1a. Re-point the amber ramp to COPPER (exact, sampled from the logo)
The logo's metal is a muted, earthy copper (`#BE7740`), cooler and redder than the old gold amber. The
**lowest-risk change is to re-point the existing `--amber-*` ramp in place** so every component that
already references amber inherits copper for free — no per-component edits.

| Token | Old (amber, approx) | **New (copper)** | Role |
|---|---|---|---|
| `--amber-300` | bright gold | `#D89A5C` | logo highlight copper |
| `--amber-400` | `~#E2A23C` | `#C8824A` | accent text / icons on dark |
| `--amber-500` | — | `#BE7740` | **EXACT logo copper (sampled)** |
| `--amber-600` | `~#B6701A` | `#A86838` | primary action fill (logo mid-tone) |
| `--amber-700` | — | `#8A5429` | hover |
| `--amber-tint-dark` | amber @10% | `rgba(190,119,64,0.10)` | tint wash on dark |

Paste-ready:
```css
:root {
  --amber-300: #D89A5C;   /* logo highlight copper */
  --amber-400: #C8824A;   /* accent text / icons on dark */
  --amber-500: #BE7740;   /* EXACT logo copper (sampled from the A) */
  --amber-600: #A86838;   /* primary action fill */
  --amber-700: #8A5429;   /* hover */
  --amber-tint-dark: rgba(190,119,64,0.10);
}
```
> Prefer explicit names? Add a parallel `--copper-*` ramp with these values and alias
> `--amber-*: var(--copper-*)`. Re-pointing in place is safer for existing mocks.

### 1b. New tokens — exact copper, red companion, the accent gradient
```css
:root {
  --copper:      #BE7740;   /* EXACT logo copper — use anywhere a flat copper is wanted */
  --accent-red:  #A8412B;   /* brick-red companion to copper */

  /* COPPER-DOMINANT gradient: holds the exact copper across ~60% of the surface,
     red only tips in at the far corner. This is the key fix — a 50/50 copper→red
     blend reads as "muddy red" and stops matching the logo. Keep copper dominant. */
  --grad-accent: linear-gradient(140deg, #C8824A 0%, var(--copper) 58%, var(--accent-red) 100%);
}
```
`--accent-red` is intentionally close to the system's existing `--negative` brick red, so red doubles as
both "primary co-accent" and "risk/negative" without clashing.

### 1c. Deepen the dark canvas to the logo black
```css
:root { --surface-0: #0E0C0A; }   /* was ~#14110D — matches the logo's near-black field */
```

---

## 2. Film-grain texture utility (`.grain`)  →  `components.css`

Matches the logo's gritty metal speckle. **Two hard rules:**
1. Apply **only to copper / `--grad-accent` filled boxes** — never a full-screen overlay (a full-screen
   `mix-blend-mode: overlay` is mathematically invisible on near-black and just washes contrast).
2. **Content must sit above the grain** so text/icons stay crisp — the grain textures the *fill only*.

Final, paste-ready utility (dual-tone: light **and** dark specks layered = realistic grit):
```css
/* ---- film grain on copper/accent boxes only ---- */
.grain { position: relative; isolation: isolate; }
.grain > * { position: relative; z-index: 1; }   /* lift content ABOVE the grain */

.grain::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  opacity: 0.42;                          /* readable ceiling; ~0.30 = subtle, >0.5 buries text */
  background-size: 130px 130px, 145px 145px;
  /* layer 1 = bright specks · layer 2 = dark specks */
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='130' height='130'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.15' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0.85 0 0 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='145' height='145'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.3' numOctaves='3' stitchTiles='stitch' seed='7'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.8 0 0 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23m)'/%3E%3C/svg%3E");
}

/* light mode: dark-alpha specks via multiply so they read on cream */
body.light .grain::after {
  opacity: 0.55; mix-blend-mode: multiply; background-size: 150px 150px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.75 0 0 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

**Tuning knobs:** `opacity` = strength (0.30 subtle → 0.42 shipped → 0.5 max before text suffers);
`baseFrequency` = grain fineness (higher = finer); `background-size` = speckle scale.

**Gotchas (learned the hard way):**
- `mix-blend-mode: overlay` on near-black = invisible. Use **alpha-baked** noise (the `feColorMatrix`
  pushes RGB to a fixed color and writes noise into the **alpha** channel) at normal blend.
- `border-radius: inherit` on `::after` clips the grain to the box's corners.
- Without `.grain > * { z-index:1 }` + `isolation:isolate`, the `::after` paints over the text. Those two
  lines are what keep **text clean, fill grainy**.
- Never gate content behind an entry animation that ends at `opacity:0` (a backgrounded iframe can
  freeze it mid-animation). The dashboard defines `argFade` but does **not** bind it to `#root`.

---

## 3. Light mode (warm cream remap)
The dashboard ships a persisted light/dark toggle. Light mode remaps surfaces to warm cream and adds soft
shadows. If the system wants this as a documented theme:
```css
body.light {
  --surface-0: #ECE3D2;          /* warm cream field */
  --surface-1: #FCF8F0;          /* card */
  --surface-2: #F2E8D7;          /* inset */
  --surface-3: rgba(20,17,13,0.12);  /* hairline */
  --paper:     #1C1815;          /* now the PRIMARY text color on cards */
  --on-dark-900: #1C1815;
  --on-dark-600: #4A433B;
  --on-dark-400: #6B6052;
}
body.light .arg-panel { box-shadow: var(--shadow-md); }
```
Toggle persists in `localStorage["argus-theme"]` (`"dark"` default), driving `body.light`.

---

## 4. Updated usage rules (for the README "Visual Foundations")

- **Copper is the everyday accent** — active states, primary fills, data series, icons. (Replaces "amber".)
- **`--grad-accent` (copper-dominant → red corner)** is reserved for **hero / emphasis surfaces**:
  the primary CTA, the active nav tab, the *single* highlighted KPI tile, the premium card. Apply
  `.grain` to these. Never more than one gradient-accent surface per functional cluster.
- **Flat `--accent-red`** is for **risk / alert** surfaces only (overdraft warning, destructive). Not decorative.
- **Grain rides on accent fills only** — never on neutral panels, the nav bar, or the rail.
- Everything else (semantics, type, spacing, radii, shadows) is unchanged from the base system.

---

## 5. New / updated UI-kit pieces (register under `ui_kits/app`)

Reusable patterns from the dashboard worth landing as a mock + preview cards:

1. **Top nav bar + short floating icon rail** — replaces the full-height sidebar with a compact,
   vertically-centered **pill rail** (`align-self:center`, `border-radius:var(--r-pill)`, fits its
   content). Top bar holds logo+wordmark, a segmented tab group, primary CTA, icon buttons, profile chip.
2. **Compact single-frame "Finexy" grid** — fits on one screen, no scroll:
   `grid-template-columns: minmax(320px,1fr) minmax(290px,1.12fr) minmax(330px,1.28fr)`, `gap:14px`,
   collapses to 2-col ≤1080px.
3. **Spending donut (segmented wheel)** — `<circle pathLength="100">` arcs, `stroke-linecap:round`,
   ~5% gap between segments, total in the center, no legend. (Replaces the old bar chart.)
4. **Upcoming-transactions calendar** — bordered table grid via the **gap-as-line trick** (container
   `background:var(--surface-3)` + `gap:1px`, cells `background:var(--surface-1)`); weekday headers,
   today in a round `--surface-3` pill, past day diagonally hatched, **overlapping circular merchant
   badges** (24px, white glyph, `-8px` overlap, 2px ring), amount pinned to each cell bottom.
5. **AI insight banner — risk variant** — flat `--accent-red`: red `EyeMark`, border `rgba(168,65,43,0.42)`,
   `background rgba(168,65,43,0.10)`, red "Fix it →" button. `EyeMark` now takes a `color` prop.

---

## 6. Exact-value reference (quick copy)
```
copper (exact)   #BE7740      red companion    #A8412B
copper highlight #D89A5C      canvas (dark)    #0E0C0A
copper text/icon #C8824A      grad-accent      linear-gradient(140deg,#C8824A 0%,#BE7740 58%,#A8412B 100%)
copper fill      #A86838      grain opacity    0.42 dark / 0.55 light(multiply)
copper hover     #8A5429      grain freq       1.15 & 1.3 (dual layer)
```

---

## 7. Apply checklist
- [ ] **§1a** Re-point `--amber-300…700` + `--amber-tint-dark` to copper in `colors_and_type.css`.
- [ ] **§1b** Add `--copper`, `--accent-red`, `--grad-accent`.
- [ ] **§1c** Set `--surface-0: #0E0C0A`.
- [ ] **§2** Add the `.grain` utility (with `.grain > *` lift + `isolation`) to `components.css`.
- [ ] **§3** Add the `body.light` remap if adopting the light theme.
- [ ] **§4** Update README "Visual Foundations": copper accent + red companion + grain rules.
- [ ] **§5** Drop the dashboard in as a new `ui_kits/app` mock; add preview cards for the new patterns.
- [ ] Sanity check: existing amber-referencing mocks now render copper; no unresolved `var()`.

---

## 8. Files in this handoff
- `Argus Dashboard.html` — entry; token overrides + `.grain` live in its `<style>` (source of truth for §1–3).
- `Atoms.jsx` — `Ic`, `Logo`, `EyeMark(color)`, `money`, `Panel`.
- `Chrome.jsx` — `TopNav` (tabs, CTA), `LeftRail` (centered pill rail + theme toggle).
- `Cards.jsx` — `InsightBanner`, `BalanceCard`, `StatCluster`/`MiniStat`, `SpendingWheel`,
  `SpendingLimit`, `MyCards`/`CreditCard`, `SubscriptionCalendar`, `RecentActivities`.
- `colors_and_type.css`, `components.css` — base Argus tokens & component classes (apply §1–3 here).
- `logo-argus.png` — circular copper "A" mark.
- `README.md` — dashboard implementation spec (layout, components, behavior).
