# Plan 007: Design-system overhaul — "Refined Expedition Luxury"

> Authored and executed in-session (user mandate 2026-06-11: "entirely
> overhaul the UI, design and UX as long as it maintains the same
> functionality"). This document records the design direction and the
> system-level changes so reviewers and future work can reference the intent.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED (visual change is the point; functionality must not change)
- **Depends on**: 001, 002, 005 (foundation hygiene)
- **Category**: direction (design)
- **Planned at**: commit `b8b6316`, 2026-06-11

## Design direction

The current language is **sporty/technical**: extrabold uppercase
tracking-tighter headlines, heavy 20px glass blur, perpetual shimmer on
primary buttons, mixed section rhythms. The overhaul moves to **refined
expedition luxury** — the visual register of premium yachting marques —
while keeping the brand assets (navy `#071923`, blue `#2f97dd`, gold
`#c9a962`, Inter Tight, existing logos) untouched:

1. **Typography**: display headings go from extrabold/tracking-tighter to
   **light weight, generous tracking, larger sizes** (uppercase retained —
   light-weight caps with positive tracking is the classic luxury idiom and
   avoids source-casing problems). Emphasis inside headings uses a
   `font-semibold` span or the blue→teal `text-gradient`, not weight 800.
   - h1: `font-light uppercase`, `letter-spacing: 0.02em`, `clamp(2.75rem, 7vw, 5.25rem)`, `line-height: 1.05`
   - h2: `font-light uppercase`, `letter-spacing: 0.015em`, `clamp(1.9rem, 4.5vw, 3.25rem)`, `line-height: 1.12`
   - h3: `font-medium` (normal case), `clamp(1.2rem, 2.5vw, 1.6rem)`
   - New `.eyebrow` utility: `text-xs font-semibold uppercase tracking-[0.25em] text-brand-blue` (+ `.eyebrow-gold` variant) — formalizes the ad-hoc kicker pattern already on the homepage.
2. **Surfaces**: glass cards get lighter — `blur(12px)`, `bg-brand-navy/60`,
   `border-white/8`, softer shadow — so photography reads through and the UI
   feels less heavy. Radius standardizes on `rounded-2xl` for cards,
   `rounded-xl` for inputs, `rounded-full` for buttons/badges.
3. **Buttons**: kill the perpetual shimmer keyframe on `.btn-primary`
   (gimmick + constant GPU work); replace with a clean solid → brighter +
   glow hover. Secondary becomes a quieter `border-white/25` outline.
4. **Rhythm**: one section scale — `py-20 md:py-28` for major sections —
   applied via a shared `Section` component; section headers unify on a
   `SectionHeading` component (eyebrow + title + lede, left or center).
5. **Gold discipline**: gold is reserved for price values, "Featured"
   markers, and premium eyebrows — a scarcity accent, not a third theme color.
6. **Motion**: entrances calm down — fades and small y-offsets (≤24px),
   no x-slides from ±100px; durations 0.5–0.7s; everything honors
   prefers-reduced-motion (plan 005).

## System changes (packages/ui)

- `styles/globals.css`: new typographic base scale, `.eyebrow` utilities,
  refined `.glass-card`, de-shimmered `.btn-primary`, refined
  `.btn-secondary`/`.btn-ghost`, refined `.vessel-card-*` chrome.
- `tailwind.config.ts`: no token removals (pages reference them); adds
  `tracking-luxe` (0.25em) alias and softer `shadow-glass` value.
- `components/Button.tsx`: same API/variants, refined visual classes.
- `components/GlassCard.tsx`: same API, refined surface + calmer entrance.
- `components/VesselCard.tsx`: same API/data, refined badge/spec/price chrome.
- NEW `components/SectionHeading.tsx` + `components/Section.tsx`: shared
  section scaffolding (exported from the package barrel).

## Constraints

- **Functionality is frozen**: no route, prop-contract, data-flow, form,
  or API changes in this plan. Component public APIs stay
  backward-compatible so untouched pages keep working.
- Brand tokens and logo components are untouched.
- Admin keeps its compact density; it gets chrome polish only via the
  shared classes it already uses.

## Verification

- `cd apps/yachting && npx tsc --noEmit` → exit 0
- `cd apps/yachting && npx eslint .` → exit 0
- Dev-server visual pass over `/`, `/adventure-yachts`, `/vessels`,
  `/contact`, `/news`, `/lap` (screenshots in PR where possible)
