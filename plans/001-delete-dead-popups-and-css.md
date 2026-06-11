# Plan 001: Delete dead popup components and unused design-system CSS

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat b8b6316..HEAD -- apps/yachting/components/WorldPremierePopup.tsx apps/yachting/components/MOTYVotePopup.tsx packages/ui/styles/globals.css`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `b8b6316`, 2026-06-11

## Why this matters

Two large client components — `WorldPremierePopup.tsx` (~906 lines, 44KB) and
`MOTYVotePopup.tsx` (~7.5KB) — were deliberately disabled in commit `1b8b1d5`
("chore(yachting): disable World Premiere + MOTY Vote popups") by removing
their imports. The files remain in the repo with **zero importers**, so they
are dead code that still gets type-checked, linted, and read by every future
maintainer and audit. Separately, `packages/ui/styles/globals.css` contains
~15 custom classes that nothing in the codebase references. Deleting both
removes noise before the other UI plans touch the same areas. Everything is
recoverable from git history if either popup is ever re-enabled.

## Current state

- `apps/yachting/components/WorldPremierePopup.tsx` — 906-line client
  component (event-announcement popup). No file in `apps/` or `packages/`
  imports it (verified 2026-06-11 with
  `grep -rn "WorldPremierePopup" apps packages --include="*.tsx" --include="*.ts"` —
  only self-references inside the file itself).
- `apps/yachting/components/MOTYVotePopup.tsx` — same situation.
- `packages/ui/styles/globals.css` — the shared design-system stylesheet
  (~425 lines). It contains the following rules with **zero usages** anywhere
  in `apps/` or `packages/` (each verified by grep; the components that might
  have used them build their classes differently — e.g. `GlassCard.tsx:38-40`
  applies `border-brand-blue/20` directly instead of `.glass-card-blue`, and
  `Navigation.tsx` builds its own link classes instead of `.nav-link`):

  | Dead rule(s) | Approx. lines (at commit b8b6316) |
  |---|---|
  | `.glass-card-blue` | 84–87 |
  | "NAVIGATION" section: `.nav-link`, `.nav-link::after`, `.nav-link:hover::after`, `.nav-link.active::after`, `.nav-link.active` | 152–174 |
  | "FORM INPUTS" section: `.input-field`, `.input-label` | 198–211 |
  | `.price-suffix` | 268–270 |
  | "LOADING STATES" section: `.skeleton`, `.skeleton::after` | 272–289 |
  | "STEP INDICATOR" section: `.step-indicator`, `.step-dot`, `.step-dot.active`, `.step-dot.completed` | 291–309 |
  | "SCROLL ANIMATIONS" section: `.fade-in-up`, `.stagger-1` … `.stagger-6` | 311–324 |
  | `.aspect-vessel`, `.aspect-hero` (incl. their comment) | 383–390 |
  | `.safe-top`, `.safe-bottom` (incl. their comment) | 392–399 |

  Do NOT delete anything else. In particular these ARE used and must stay:
  `.glass-card`, `.glass-overlay`, `.btn-primary`, `.btn-secondary`,
  `.btn-ghost` (used via `packages/ui/components/Button.tsx:21` `ghost`
  variant), `.marker-hub`, `.marker-stop`, `.vessel-card*`, `.price-tag`,
  `.price-prefix`, `.price-currency`, `.price-value`, `.text-gradient`,
  `.glow`, `.glow-lg`, `.scrollbar-*`, and the `shimmer` animation reference
  inside `.btn-primary::before`.

- Repo conventions: feature branches off `develop`, conventional-commit
  messages (e.g. `chore(yachting): disable World Premiere + MOTY Vote popups`).

## Commands you will need

| Purpose   | Command | Expected on success |
|-----------|---------|---------------------|
| Typecheck | `cd apps/yachting && npx tsc --noEmit` | exit 0, no output |
| Lint      | `cd apps/yachting && npx eslint .` | exit 0 (2 pre-existing warnings about `aria-expanded` in onboard/page.tsx and `<img>` in layout.tsx are OK) |

There is no test suite in this repo. Typecheck + lint + the greps below are
the verification gates.

## Scope

**In scope** (the only files you should modify):
- `apps/yachting/components/WorldPremierePopup.tsx` (delete)
- `apps/yachting/components/MOTYVotePopup.tsx` (delete)
- `packages/ui/styles/globals.css` (remove only the rules listed above)

**Out of scope** (do NOT touch, even though they look related):
- `packages/ui/tailwind.config.ts` — its `keyframes`/`animation` entries are
  emitted on demand by Tailwind; leave them alone.
- Any other component or page file.
- `apps/yachting/app/globals.css` (the app-local stylesheet) — different file,
  not part of this plan.

## Git workflow

- Branch: `feature/001-delete-dead-popups-and-css` off `develop` (this repo
  never commits to `main` directly; feature branches come off `develop`).
- One commit per step is fine; message style: `chore(yachting): remove dead popup components` / `chore(ui): prune unused design-system CSS`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Confirm the popups are unimported, then delete them

Run:
```
grep -rn "WorldPremierePopup\|MOTYVotePopup" apps packages --include="*.tsx" --include="*.ts" | grep -v "components/WorldPremierePopup.tsx" | grep -v "components/MOTYVotePopup.tsx"
```
Expected: **no output**. If any line appears, STOP (see STOP conditions).

Then delete both files:
```
rm apps/yachting/components/WorldPremierePopup.tsx apps/yachting/components/MOTYVotePopup.tsx
```

**Verify**: `cd apps/yachting && npx tsc --noEmit` → exit 0, no output.

### Step 2: Remove the dead CSS rules, one block at a time

For EACH row in the table under "Current state", first run a usage gate, e.g.
for `nav-link`:
```
grep -rn "nav-link" apps packages --include="*.tsx" --include="*.ts" | grep -v node_modules
```
Expected: no output (the class name appears only in `globals.css` itself).
If a gate finds a usage, SKIP that block (leave it in the file) and note it in
your final report — do not delete a used rule.

Then delete the block from `packages/ui/styles/globals.css`, including its
banner comment when the whole section becomes empty (the "NAVIGATION",
"FORM INPUTS", "LOADING STATES", "STEP INDICATOR", and "SCROLL ANIMATIONS"
banner comments should go with their sections).

Gate-and-delete for these names: `glass-card-blue`, `nav-link`, `input-field`,
`input-label`, `price-suffix`, `skeleton` (gate on `"skeleton"` with quotes
and `className` context to avoid matching unrelated words), `step-indicator`,
`step-dot`, `fade-in-up`, `stagger-1` … `stagger-6`, `aspect-vessel`,
`aspect-hero`, `safe-top`, `safe-bottom`.

**Verify**: `cd apps/yachting && npx tsc --noEmit` → exit 0. Then
`cd apps/yachting && npx eslint .` → exit 0.

### Step 3: Visual smoke check

Start the dev server (`npm run dev:yachting` from the repo root, or
`cd apps/yachting && npm run dev`) and load `http://localhost:3000/`. The
homepage must render with glassmorphism cards, navy background, and styled
buttons exactly as before (none of the deleted classes were rendered anywhere,
so nothing should change). Also spot-check `/adventure-yachts` and `/vessels`.
If the dev server fails to start due to missing env vars (this app reads a
Neon database at runtime), note it and rely on typecheck+lint instead.

**Verify**: pages render without visual regression; no 500s in terminal.

## Test plan

No test infrastructure exists in this repo (recorded in `plans/README.md`).
Verification is: typecheck, lint, the zero-usage greps in steps 1–2, and the
dev-server smoke check in step 3.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `test ! -f apps/yachting/components/WorldPremierePopup.tsx && test ! -f apps/yachting/components/MOTYVotePopup.tsx` → exit 0
- [ ] `grep -rn "WorldPremierePopup\|MOTYVotePopup" apps packages --include="*.tsx" --include="*.ts"` → no output
- [ ] `grep -n "step-dot\|stagger-1\|fade-in-up\|input-field\|glass-card-blue" packages/ui/styles/globals.css` → no output (assuming all gates passed)
- [ ] `cd apps/yachting && npx tsc --noEmit` → exit 0
- [ ] `cd apps/yachting && npx eslint .` → exit 0
- [ ] `git status` shows only the three in-scope files changed/deleted
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The step-1 grep finds ANY import or reference to either popup outside its
  own file — the component may have been re-enabled since this plan was
  written.
- A usage gate in step 2 finds a class in use AND deleting other blocks has
  already caused a typecheck/lint failure you cannot trace.
- `globals.css` no longer matches the structure described in "Current state"
  (the file has been refactored since commit `b8b6316`).

## Maintenance notes

- If marketing wants the World Premiere or MOTY popups back, restore from git
  (`git log --diff-filter=D -- apps/yachting/components/WorldPremierePopup.tsx`),
  and note they have known accessibility gaps (no dialog role/focus trap) —
  rebuild them on the shared `Modal` primitive from plan 003 instead.
- Plan 004 creates shared form-input style constants; it assumes
  `.input-field`/`.input-label` are gone from `globals.css` (this plan removes
  them).
