# Plan 006: Add `sizes` hints to the Adventure Yachts gallery and thumbnail images

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat b8b6316..HEAD -- apps/yachting/app/adventure-yachts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `b8b6316`, 2026-06-11

## Why this matters

Six `next/image` components on the Adventure Yachts pages use `fill` with no
`sizes` prop. Without `sizes`, the browser assumes the image spans the full
viewport (`100vw`) and downloads the largest candidate from the srcset — so
the 96px-wide thumbnail strip downloads viewport-sized images, one per
thumbnail, and the content-width galleries over-download on large screens.
Adding accurate `sizes` strings is a pure bandwidth/LCP-adjacent win with no
visual change whatsoever.

## Current state

All six sites use the pattern `<Image src={...} alt={...} fill className="object-cover" />`
with no `sizes`:

`apps/yachting/app/adventure-yachts/page.tsx`
- **Line ~553** — vessel-area explorer image, inside
  `<div className="relative aspect-[16/9]">` within a `GlassCard` in the
  page's content column (content max-width container, full width on mobile).
- **Line ~667** — main gallery image, inside
  `<div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4 cursor-pointer">`,
  same content-column width.
- **Line ~748** — thumbnail strip images, each inside a
  `<button className="relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden ...">`
  (fixed 96×64px).

`apps/yachting/app/adventure-yachts/[slug]/AdventureYachtDetail.tsx`
- **Line ~569** — main gallery image, same `aspect-[16/9]` content-column
  wrapper as above.
- **Line ~650** — thumbnail strip, same `w-24 h-16` buttons as above.

Also in these files but needing a different treatment:
- `page.tsx:315` and `AdventureYachtDetail.tsx:214` — full-bleed hero images
  with `fill` + `priority` and no `sizes`. A full-viewport hero's correct
  hint IS the default `100vw`, so **leave the heroes alone**.

## Commands you will need

| Purpose   | Command | Expected on success |
|-----------|---------|---------------------|
| Typecheck | `cd apps/yachting && npx tsc --noEmit` | exit 0, no output |
| Lint      | `cd apps/yachting && npx eslint .` | exit 0 (2 pre-existing warnings are OK) |
| Dev server| `cd apps/yachting && npm run dev` | serves on http://localhost:3000 |

No test suite exists in this repo.

## Scope

**In scope** (the only files you should modify):
- `apps/yachting/app/adventure-yachts/page.tsx`
- `apps/yachting/app/adventure-yachts/[slug]/AdventureYachtDetail.tsx`

**Out of scope** (do NOT touch, even though they look related):
- The two hero `<Image priority fill>` instances (lines noted above) — their
  implicit `100vw` is correct.
- `packages/ui/components/VesselCard.tsx` — already has proper `sizes`.
- Any other page's images; any image markup beyond adding the `sizes` prop.

## Git workflow

- Branch: `feature/006-gallery-image-sizes` off `develop`.
- Commit message style: `perf(yachting): add sizes hints to adventure-yachts gallery images`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Content-width gallery images (4 sites)

At `page.tsx` lines ~553 and ~667, and `AdventureYachtDetail.tsx` line ~569,
add to the `<Image>`:

```tsx
sizes="(max-width: 1280px) 100vw, 1152px"
```

(The galleries sit in the standard content column — full width on small
viewports, capped around the `max-w-6xl`/`max-w-7xl` container on desktop.
If you observe the actual wrapper is `max-w-7xl`, use `1280px` as the cap
instead; check the nearest `max-w-*` ancestor and match it.)

**Verify**: `cd apps/yachting && npx tsc --noEmit` → exit 0.

### Step 2: Thumbnail strips (2 sites)

At `page.tsx` line ~748 and `AdventureYachtDetail.tsx` line ~650 (the images
inside the `w-24 h-16` buttons), add:

```tsx
sizes="96px"
```

**Verify**: `cd apps/yachting && npx tsc --noEmit` → exit 0 and
`cd apps/yachting && npx eslint .` → exit 0.

### Step 3: Confirm in the browser

Dev server: open `/adventure-yachts`, scroll to the gallery. In devtools
Network tab (Img filter, disable cache), confirm the thumbnail requests are
now small variants (URL contains a small `w=` parameter like `w=96` or
`w=256`, not `w=1920`+). Click through gallery images and thumbnails —
rendering must be visually identical (object-cover crops, no blurriness on
the main gallery at your viewport size).

If the dev server cannot start for missing env vars (vessel data comes from
the live database), record that and rely on the static gates.

**Verify**: thumbnail image requests shrink; no visual change.

## Test plan

No test infrastructure exists in this repo. Step 3 is the behavioral gate.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c 'sizes=' apps/yachting/app/adventure-yachts/page.tsx` → `3`
- [ ] `grep -c 'sizes=' "apps/yachting/app/adventure-yachts/[slug]/AdventureYachtDetail.tsx"` → `2`
- [ ] `cd apps/yachting && npx tsc --noEmit` → exit 0
- [ ] `cd apps/yachting && npx eslint .` → exit 0
- [ ] `git status` shows only the two in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The six `<Image fill>` sites don't match the "Current state" line numbers
  or wrapper markup (the pages were refactored since commit `b8b6316`).
- The main gallery looks visibly blurry on a large desktop viewport after
  step 1 — the cap in the `sizes` string is too small for the actual
  container; report the container's real rendered width instead of guessing.

## Maintenance notes

- Any new `<Image fill>` must ship with a `sizes` prop; flag its absence in
  review. `packages/ui/components/VesselCard.tsx` is the in-repo exemplar.
- If the gallery layout changes width (e.g. goes full-bleed), update the
  `sizes` strings to match.
