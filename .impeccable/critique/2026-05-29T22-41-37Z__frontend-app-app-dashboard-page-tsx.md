---
target: frontend/app/(app)/dashboard/page.tsx
total_score: 21
p0_count: 0
p1_count: 2
timestamp: 2026-05-29T22-41-37Z
slug: frontend-app-app-dashboard-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | No last-synced timestamp; no sync progress feedback |
| 2 | Match System / Real World | 3 | Labels clear; "Net flow" and mono eyebrows may need context |
| 3 | User Control and Freedom | 2 | Read-only dashboard; no escape/undo in any flow |
| 4 | Consistency and Standards | 3 | Tab active state not synced to URL; "View all" vs "View all →" inconsistency |
| 5 | Error Prevention | 2 | Empty state exists; no error boundary if API fails mid-load |
| 6 | Recognition Rather Than Recall | 2 | Icon-only rail forces memorization; tooltips not keyboard-accessible |
| 7 | Flexibility and Efficiency | 1 | No keyboard shortcuts, no command palette |
| 8 | Aesthetic and Minimalist Design | 3 | Genuinely restrained; hardcoded $5k limit is fake data presented as real |
| 9 | Error Recovery | 1 | console.error only; zero user-visible error states if backend fails |
| 10 | Help and Documentation | 1 | No help link, no tooltips on financial terms |
| **Total** | | **21/40** | Acceptable — significant gaps in error handling and accessibility |

## Anti-Patterns Verdict
Does not read as AI-generated. Copper+red gradient, grain texture, and Instrument Serif italic are distinctive. No hero-metric template violation — the highlighted KPI tile is intentional. Detector: clean (0 findings after transition:width fix).

## Priority Issues
- [P1] Icon-only navigation — no persistent labels, memorization required, tooltip not keyboard-accessible
- [P1] No error states — silent API failures show blank dashboard to user
- [P2] Hardcoded $5,000 spending limit — fake data presented as real in a financial app
- [P2] No last-synced timestamp — user can't tell if balance data is fresh
- [P3] TopNav active tab not synced to URL — wrong tab highlighted on back-navigation

## Persona Red Flags
- Alex (Power User): No keyboard shortcuts; sync button has no loading state
- Sam (Accessibility): SVG donut has no accessible data; icon rail aria-labels inconsistent

## Minor Observations
- TopNav logo uses inline EyeMark SVG instead of logo-argus.png
- "Good morning, there" fallback is awkward
- "View all" vs "View all →" inconsistency
