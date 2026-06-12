# Plan 005: Honor prefers-reduced-motion across CSS and Framer Motion animations

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat b8b6316..HEAD -- packages/ui/styles/globals.css apps/yachting/app/layout.tsx apps/yachting/components`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt (accessibility)
- **Planned at**: commit `b8b6316`, 2026-06-11

## Why this matters

The site is animation-heavy — Framer Motion stagger/slide effects on every
major page, CSS shimmer/ping/float keyframes, smooth scrolling — and there is
**zero** `prefers-reduced-motion` handling anywhere in the codebase (verified
by grep across all CSS/TSX). Users who enable "reduce motion" at the OS level
(vestibular disorders, motion sensitivity) get the full animation load anyway,
which is a WCAG 2.3.3 gap. Two small, low-risk changes fix this globally
without touching any individual animation: Framer Motion's `MotionConfig
reducedMotion="user"` (disables transform/layout animations for those users,
keeps opacity fades, so nothing gets stuck invisible) and one CSS media-query
block for the keyframe animations and smooth scrolling.

## Current state

- `grep -rn "prefers-reduced-motion\|useReducedMotion\|MotionConfig" packages apps --include="*.css" --include="*.tsx" --include="*.ts"` → no matches today.
- `apps/yachting/app/layout.tsx:65-81` — root layout body (server component):
  ```tsx
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
        <html lang="en" className="scroll-smooth">
          ...
          <body className="bg-brand-navy text-white antialiased">
            <AnalyticsProvider>
              {children}
            </AnalyticsProvider>
  ```
- `apps/yachting/components/Analytics.tsx` — exemplar of the repo's
  client-provider pattern (a `'use client'` component wrapping `children`,
  imported into the server layout). Match it.
- `packages/ui/styles/globals.css:30-34` — smooth scrolling is global:
  ```css
  html {
    scroll-behavior: smooth;
    ...
  }
  ```
  The file ends with a `@media print` block (lines ~415-424 at commit
  b8b6316); the new media query goes after the `@layer utilities` block,
  alongside the existing `@media (max-width: 768px)` block.
- Framer Motion v11 (`apps/yachting/package.json` — `"framer-motion": "^11.0.3"`),
  which supports `MotionConfig reducedMotion`.

## Commands you will need

| Purpose   | Command | Expected on success |
|-----------|---------|---------------------|
| Typecheck | `cd apps/yachting && npx tsc --noEmit` | exit 0, no output |
| Lint      | `cd apps/yachting && npx eslint .` | exit 0 (2 pre-existing warnings are OK) |
| Dev server| `cd apps/yachting && npm run dev` | serves on http://localhost:3000 |

No test suite exists in this repo.

## Scope

**In scope** (the only files you should modify):
- `apps/yachting/components/MotionProvider.tsx` (create)
- `apps/yachting/app/layout.tsx`
- `packages/ui/styles/globals.css`

**Out of scope** (do NOT touch, even though they look related):
- Individual `motion.*` components, page-level `variants`, or
  `packages/ui/components/Button.tsx` `whileHover`/`whileTap` — MotionConfig
  handles all of them via context; do not edit them one by one.
- Tailwind config `animation`/`keyframes` entries — the CSS media query
  neutralizes them at runtime for affected users.

## Git workflow

- Branch: `feature/005-prefers-reduced-motion` off `develop`.
- Commit message style: `feat(yachting): honor prefers-reduced-motion globally`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create the MotionProvider

Create `apps/yachting/components/MotionProvider.tsx`:

```tsx
'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Applies the user's OS-level "reduce motion" preference to every Framer
 * Motion component in the tree (transform/layout animations are skipped;
 * opacity transitions still run so content never gets stuck hidden).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
```

**Verify**: `cd apps/yachting && npx tsc --noEmit` → exit 0.

### Step 2: Wrap the app in it

In `apps/yachting/app/layout.tsx`, import the provider
(`import { MotionProvider } from '@/components/MotionProvider';`) and wrap
the children inside the existing `AnalyticsProvider`:

```tsx
<AnalyticsProvider>
  <MotionProvider>
    {children}
  </MotionProvider>
</AnalyticsProvider>
```

**Verify**: `cd apps/yachting && npx tsc --noEmit` → exit 0.

### Step 3: Add the CSS media query

In `packages/ui/styles/globals.css`, after the `@layer utilities` block
(next to the existing `@media (max-width: 768px)` responsive block), add:

```css
/* =========================================
   REDUCED MOTION
   ========================================= */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Verify**: `grep -n "prefers-reduced-motion" packages/ui/styles/globals.css` → 1 match, and `cd apps/yachting && npx eslint .` → exit 0.

### Step 4: Behavioral check

Dev server check with reduced motion enabled:
- macOS: System Settings → Accessibility → Display → Reduce motion ON, or in
  Chrome DevTools: Rendering panel → "Emulate CSS media feature
  prefers-reduced-motion" → reduce.
- Load `/` and `/adventure-yachts`: content must appear immediately (no
  slide/stagger entrances), the shimmer on primary buttons must not sweep,
  and all content must be fully visible — nothing stuck at `opacity: 0` or
  translated off-screen. Buttons must not scale on hover.
- Turn emulation off and confirm animations are back to normal.

If the dev server cannot start for missing env vars, record that and rely on
the static gates plus a careful re-read of the diff.

**Verify**: with reduce-motion emulated, no entrance animations play AND all
page content is visible.

## Test plan

No test infrastructure exists in this repo. Step 4 is the behavioral gate;
the greps and typecheck are the static gates.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `test -f apps/yachting/components/MotionProvider.tsx` → exit 0
- [ ] `grep -n "MotionProvider" apps/yachting/app/layout.tsx` → 2+ matches (import + usage)
- [ ] `grep -n "prefers-reduced-motion" packages/ui/styles/globals.css` → 1 match
- [ ] `cd apps/yachting && npx tsc --noEmit` → exit 0
- [ ] `cd apps/yachting && npx eslint .` → exit 0
- [ ] `git status` shows only the three in-scope files modified/created
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- With reduce-motion emulated, any section of `/` or `/adventure-yachts` is
  blank/invisible (an animation that MotionConfig skips left content at its
  `initial` hidden state). Report which section — do NOT start editing
  individual page variants; that decision needs the maintainer.
- `MotionConfig` is not exported by the installed framer-motion version
  (typecheck failure on the import).
- Clerk's own components visibly break inside the new provider nesting.

## Maintenance notes

- New Framer Motion animations are automatically covered by the provider;
  new CSS keyframe animations are automatically covered by the media query.
  Nothing to remember per-component.
- If a future hero animation must run even for reduced-motion users (rare,
  e.g. an opacity-only fade), use framer's `useReducedMotion()` hook locally
  rather than removing the global config.
