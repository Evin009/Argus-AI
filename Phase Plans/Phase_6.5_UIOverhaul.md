# ArgusAI — Phase 6.5: UI Design Overhaul

> After Phase 6. Goal: bring every app page into the Argus design language before Phase 7 ships new surfaces. Pages were built functional-first; this phase makes them look like the product.

---

## What This Phase Covers

All pages currently use zero design tokens. Every page below gets:
- Design tokens (`--surface-*`, `--r-*`, `--font-display`, `--font-sans`, `--copper`, `--paper`, etc.)
- Argus typography scale (`--text-hero`, `--text-kpi`, `--text-heading`, `--text-sub`, `--text-eyebrow`)
- Consistent card pattern (`--surface-1` background, `--surface-3` border, `--r-lg` radius)
- No raw Tailwind color utilities (`bg-white`, `text-gray-*`, `p-8`)

---

## Git Branch Structure

```
develop
└── phase/6.5-ui-overhaul
      ├── feature/overhaul-auth-pages
      ├── feature/overhaul-transactions
      ├── feature/overhaul-bills-subscriptions
      ├── feature/overhaul-accounts-settings
      ├── feature/overhaul-intelligence
      ├── feature/overhaul-argus-chat
      └── feature/overhaul-argus-side-panel
```

---

## Execution Checklist

### `feature/overhaul-auth-pages` ⬜
*Login + signup deferred from Phase 1.5 — still plain*

- [ ] `app/(auth)/login/page.tsx` — apply brand tokens, aurora background, Instrument Serif heading, copper accent CTA
- [ ] `app/(auth)/signup/page.tsx` — same treatment as login
- [ ] `app/(auth)/verify-email/page.tsx` — match auth page pattern
- [ ] Merge → `phase/6.5-ui-overhaul`

---

### `feature/overhaul-transactions` ⬜
*Functional table with no visual design*

- [ ] `app/(app)/transactions/page.tsx` — design token layout, merchant name + amount + category row pattern, recurring badge, category filter as styled chip group, pagination controls on-brand
- [ ] Merge → `phase/6.5-ui-overhaul`

---

### `feature/overhaul-bills-subscriptions` ⬜
*Both pages unstyled*

- [ ] `app/(app)/bills/page.tsx` — card-per-bill layout, copper accent for overdue, due-date chip, amount styled as KPI
- [ ] `app/(app)/bills/calendar/page.tsx` — on-brand calendar grid, urgency color coding, consistent with the unified Smart Payment Calendar arriving in Phase 6
- [ ] `app/(app)/subscriptions/page.tsx` — logo tile fallback, price creep badge, renewal date chip, cancel CTA on-brand
- [ ] Merge → `phase/6.5-ui-overhaul`

---

### `feature/overhaul-accounts-settings` ⬜
*Both pages bare*

- [ ] `app/(app)/accounts/page.tsx` — card-per-account, balance as KPI, institution name as eyebrow, last-synced timestamp sub-text
- [ ] `app/(app)/settings/page.tsx` — section grouping with `--surface-1` card blocks, labels/values in Argus type scale, destructive actions clearly marked
- [ ] Merge → `phase/6.5-ui-overhaul`

---

### `feature/overhaul-intelligence` ⬜
*AI insights feed with no visual hierarchy*

- [ ] `app/(app)/intelligence/page.tsx` — insight card pattern: eyebrow label (insight type), heading (the finding), sub-text (reasoning), copper accent bar on left edge, timestamp
- [ ] Merge → `phase/6.5-ui-overhaul`

---

### `feature/overhaul-argus-chat` ⬜
*Chat page functional but not visually cohesive*

- [ ] `app/(app)/argus/page.tsx` — page shell matches app layout tokens, input bar on-brand, streaming indicator using copper
- [ ] `app/(app)/argus/_components/Cards.tsx` — verdict/table/chart cards use `--surface-1`/`--surface-2` hierarchy, copper accent for Argus identity, Instrument Serif for verdict text
- [ ] Merge → `phase/6.5-ui-overhaul`

---

### `feature/overhaul-argus-side-panel` ⬜
*Panel functional but minimal token usage (3 references)*

- [ ] `app/(app)/_components/ArgusSidePanel.tsx` — full token adoption, copper header bar, Argus eye mark branding, input matches main chat bar, response cards match `Cards.tsx` pattern, slide animation polished
- [ ] Merge → `phase/6.5-ui-overhaul`

---

### Phase 6.5 Close
- [ ] Merge `phase/6.5-ui-overhaul` → `develop`
- [ ] Open PR `develop` → `main`, wait for CI, merge
- [ ] Delete all feature branches + `phase/6.5-ui-overhaul`
- [ ] Mark Phase 6.5 as ✅ Complete in `Argus Details/product-plan.md`

---

## Definition of Done

- [ ] Every page above uses only design tokens — zero raw color/spacing utilities
- [ ] Typography scale applied consistently across all pages
- [ ] Argus side panel visually matches the main chat page
- [ ] Auth pages match the landing page visual quality
- [ ] No page looks like it was built by a different team than the dashboard
