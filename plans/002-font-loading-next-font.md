# Plan 002: Load Inter Tight via next/font instead of a render-blocking CSS @import

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat b8b6316..HEAD -- packages/ui/styles/globals.css apps/yachting/app/layout.tsx packages/ui/tailwind.config.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `b8b6316`, 2026-06-11

## Why this matters

The site's only typeface, Inter Tight, is loaded through a CSS `@import` of
Google Fonts at the very top of the global stylesheet — for the full variable
range including italics (`ital,wght@0,100..900;1,100..900`), although the app
uses only weights 300–800 and no italics. A CSS `@import` is render-blocking
and adds a third-party round trip before first paint; on slow connections this
delays FCP/LCP by hundreds of milliseconds and causes a flash of fallback
text. Next.js has a first-class fix: `next/font/google` self-hosts the font,
preloads it, subsets it, and eliminates the third-party request entirely.
The visual result is identical — same family, same weights.

## Current state

- `packages/ui/styles/globals.css:1` — the import to remove:
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap');
  ```
- `apps/yachting/app/layout.tsx:1-10` — root layout (server component), no
  font setup today:
  ```tsx
  import type { Metadata } from 'next';
  import Script from 'next/script';
  import { ClerkProvider } from '@clerk/nextjs';
  import '@36zero/ui/styles';
  import './globals.css';
  ```
  and at `layout.tsx:72`:
  ```tsx
  <html lang="en" className="scroll-smooth">
  ```
- `packages/ui/tailwind.config.ts:45-49` — font family tokens:
  ```ts
  fontFamily: {
    // Inter Tight for headings and body
    sans: ['Inter Tight', 'system-ui', 'sans-serif'],
    display: ['Inter Tight', 'system-ui', 'sans-serif'],
  },
  ```
- `packages/ui/styles/globals.css:37` — the body applies the token:
  `@apply bg-brand-navy text-white font-sans font-light;`
- The `yachting` app under `apps/` is the **only** app in the monorepo, and it
  is the only importer of `@36zero/ui/styles`, so changing the shared CSS does
  not affect any other consumer.
- Weights actually used (verified by grep): 300 (`font-light`),
  400, 500 (`font-medium`), 600 (`font-semibold`), 700 (`font-bold`),
  800 (`font-extrabold`). No italic styles are used anywhere.

## Commands you will need

| Purpose   | Command | Expected on success |
|-----------|---------|---------------------|
| Typecheck | `cd apps/yachting && npx tsc --noEmit` | exit 0, no output |
| Lint      | `cd apps/yachting && npx eslint .` | exit 0 (2 pre-existing warnings are OK) |
| Dev server| `cd apps/yachting && npm run dev` | serves on http://localhost:3000 |

No test suite exists in this repo.

## Scope

**In scope** (the only files you should modify):
- `packages/ui/styles/globals.css` (remove line 1 only)
- `apps/yachting/app/layout.tsx`
- `packages/ui/tailwind.config.ts`

**Out of scope** (do NOT touch, even though they look related):
- `apps/yachting/tailwind.config.ts` — it just re-exports/extends the base
  config; the `fontFamily` change in the base config flows through.
- Any per-page font classes (`font-light`, `font-bold`, …) — they keep
  working unchanged.
- `next.config.js` — no config change is needed for next/font.

## Git workflow

- Branch: `feature/002-next-font-inter-tight` off `develop`.
- Commit message style: `perf(yachting): self-host Inter Tight via next/font`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add next/font to the root layout

In `apps/yachting/app/layout.tsx`, add below the existing imports:

```tsx
import { Inter_Tight } from 'next/font/google';

const interTight = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-tight',
});
```

(Inter Tight is a variable font, so no `weight` array is required; all weights
300–800 come from the single variable file. If the build errors with
"missing weight", add `weight: ['300', '400', '500', '600', '700', '800']`.)

Then change line 72 from:
```tsx
<html lang="en" className="scroll-smooth">
```
to:
```tsx
<html lang="en" className={`scroll-smooth ${interTight.variable}`}>
```

**Verify**: `cd apps/yachting && npx tsc --noEmit` → exit 0.

### Step 2: Point the Tailwind font tokens at the CSS variable

In `packages/ui/tailwind.config.ts`, change the `fontFamily` block to:

```ts
fontFamily: {
  // Inter Tight (self-hosted via next/font in app layout)
  sans: ['var(--font-inter-tight)', 'Inter Tight', 'system-ui', 'sans-serif'],
  display: ['var(--font-inter-tight)', 'Inter Tight', 'system-ui', 'sans-serif'],
},
```

(The literal `'Inter Tight'` stays as a graceful fallback in case the variable
is missing in some context, e.g. Storybook later.)

**Verify**: `cd apps/yachting && npx tsc --noEmit` → exit 0.

### Step 3: Remove the @import from the shared stylesheet

Delete line 1 of `packages/ui/styles/globals.css` (the
`@import url('https://fonts.googleapis.com/css2?...')` line). The file must
then start with `@tailwind base;` (after the blank line).

**Verify**: `grep -n "fonts.googleapis" packages/ui apps -r` → no output.

### Step 4: Confirm the rendered font

Start the dev server and open `http://localhost:3000/`. In browser devtools,
inspect `<body>` → Computed → `font-family` must resolve to a name beginning
with `__Inter_Tight` (next/font's hashed family) or show the
`var(--font-inter-tight)` chain, and the rendered headings must still be Inter
Tight (geometric, tight tracking — compare with a screenshot before your
change if unsure). The Network tab must show **no request** to
`fonts.googleapis.com` or `fonts.gstatic.com`; the font now arrives as
`/_next/static/media/*.woff2`.

If the dev server cannot start because of missing env vars (the app reads a
Neon database at runtime), run `cd apps/yachting && npx next build` instead
and confirm it succeeds; if the build also needs env you don't have, rely on
steps 1–3 verification and record this limitation in your report.

**Verify**: no `fonts.googleapis.com` request; text renders in Inter Tight.

## Test plan

No test infrastructure exists. Verification is the grep in step 3 plus the
visual/network check in step 4.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -rn "fonts.googleapis" packages apps --include="*.css" --include="*.tsx"` → no output
- [ ] `grep -n "Inter_Tight" apps/yachting/app/layout.tsx` → at least 2 matches (import + constructor)
- [ ] `grep -n "font-inter-tight" packages/ui/tailwind.config.ts` → 2 matches
- [ ] `cd apps/yachting && npx tsc --noEmit` → exit 0
- [ ] `cd apps/yachting && npx eslint .` → exit 0
- [ ] `git status` shows only the three in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `next/font` errors at build/dev time with anything other than the
  documented "missing weight" fallback case.
- The rendered font is visibly NOT Inter Tight after step 4 (fallback
  system-ui rendering means the variable isn't reaching the body — check the
  `<html>` className was actually applied).
- You find another consumer of `@36zero/ui/styles` besides
  `apps/yachting/app/layout.tsx` (the assumption "yachting is the only app"
  is false).

## Maintenance notes

- Any future app added to `apps/*` that imports `@36zero/ui/styles` must also
  set up `next/font` in its own root layout and attach
  `--font-inter-tight` — the shared CSS no longer loads the font by itself.
  Consider documenting this in the UI package README when one exists.
- A reviewer should check the deployed page's network panel once to confirm
  the Google Fonts request is gone in production too.
