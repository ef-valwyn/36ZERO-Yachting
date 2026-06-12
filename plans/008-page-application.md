# Plan 008: Apply the overhaul across pages

> Authored and executed in-session. Page-by-page application of plan 007's
> design language. Same functionality, new presentation.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: 007
- **Category**: direction (design)
- **Planned at**: commit `b8b6316`, 2026-06-11

## Page checklist

Mechanical rules applied per page (functionality untouched):

1. Hardcoded display headings (`font-extrabold uppercase tracking-tighter`,
   `text-4xl md:text-5xl font-bold`, …) → rely on the new global h1/h2/h3
   scale or the matching utility classes.
2. Ad-hoc kicker lines (`text-brand-blue font-medium tracking-widest
   uppercase text-sm`) → `.eyebrow` / `.eyebrow-gold`.
3. Section paddings (`py-16`/`py-24`/`py-32` variants) → `py-20 md:py-28`.
4. Slide-in entrances from ±100px → fade + y≤24px.
5. Section headers → `SectionHeading` where the structure matches.

| Page | Scope |
|------|-------|
| `/` homepage | Hero re-set in display type; value-prop cards; LAP CTA; featured vessels header |
| `/adventure-yachts` | Hero, section nav pills, specs, gallery chrome, CTA |
| `/adventure-yachts/[slug]` | Same treatment on the detail template |
| `/vessels` | Listing header, filters, grid |
| `/contact` | Hero + form panel chrome |
| `/news` + `/news/[slug]` | Listing cards + article header |
| `/lap` | Hero, passage sections, stats |
| `/imhs-2026` | Light touch only (event page is deactivated) |
| Admin | Chrome polish via shared classes only; compact density preserved |

## Verification

Per page: typecheck + lint clean; dev-server before/after eyeball; no
console errors; all links/forms/interactions behave identically.
