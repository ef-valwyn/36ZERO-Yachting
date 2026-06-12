# Plan 004: Centralize duplicated form-input styles and add missing form a11y attributes

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat b8b6316..HEAD -- packages/ui apps/yachting/components/EnquireModal.tsx apps/yachting/app/contact apps/yachting/app/imhs-2026 apps/yachting/app/vessels apps/yachting/app/admin/_components`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/001-delete-dead-popups-and-css.md (deletes the popups so their copies of these strings don't need migrating, and removes the stale `.input-field` CSS class this plan would otherwise collide with conceptually)
- **Category**: tech-debt
- **Planned at**: commit `b8b6316`, 2026-06-11

## Why this matters

The same ~170-character Tailwind class string for text inputs is copy-pasted
**19 times across 8 files**, with two drifted variants (public forms use
`px-4 py-3 … rounded-xl`; admin forms use `px-3 py-2.5 … rounded-lg text-sm`).
Any change to focus rings or input styling currently means editing 8 files
and hoping none is missed. Separately, two country-code `<select>` elements
ship without any accessible name, and form error containers appear without
`role="alert"`, so screen-reader users aren't told a submission failed. This
plan centralizes the strings as exported constants (zero visual change — the
admin's compact density is kept as its own constant) and adds the missing
ARIA attributes.

## Current state

The canonical public input string (verbatim, used at all public sites):

```
w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors
```

Where it lives today:

- `packages/ui/components/StepForm.tsx:64-65` — module constants:
  ```ts
  const inputClasses = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors';
  const selectClasses = 'px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors appearance-none';
  ```
- `apps/yachting/app/contact/page.tsx:176` — identical `inputClasses` constant.
- `apps/yachting/app/imhs-2026/onboard/page.tsx:31-32` — identical constant
  named `baseInputCx`.
- `apps/yachting/components/EnquireModal.tsx:228,245,260,275,292,308,332` —
  the string inlined directly on each input/select/textarea (the selects use
  a width-variant without `placeholder-white/40`).
- `apps/yachting/app/imhs-2026/page.tsx` and `apps/yachting/app/vessels/page.tsx` —
  additional inline copies (find them with the step-1 grep).
- Admin compact variant, `apps/yachting/app/admin/_components/AddLeadForm.tsx:9-10`:
  ```ts
  const baseInput =
    'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors';
  ```
  with similar copies in `ManualLeadForm.tsx`, `NotesEditor.tsx`, and
  `LeadListClient.tsx`.

A11y gaps to fix in the same pass:

- `apps/yachting/components/EnquireModal.tsx:256-261` — the country-code
  `<select name="countryCode">` has **no id, no label, no aria-label** (the
  adjacent "Phone Number" label points at the tel input only).
- `packages/ui/components/StepForm.tsx` — same pattern on its country-code
  select (find `countryCodes.map` in the file).
- Error containers lack `role="alert"`:
  - `apps/yachting/components/EnquireModal.tsx:338-347` (coral card)
  - `apps/yachting/app/contact/page.tsx:447-457` (coral card)
  - `apps/yachting/app/admin/_components/AddLeadForm.tsx:87-91` (red card)
  - `ManualLeadForm.tsx` has the equivalent red card (find `bg-red-500/10`)

Honeypot drift (cosmetic consolidation, same pass): three forms hide the
honeypot with an inline style `style={{ position: 'absolute', left: '-9999px' }}`
(`EnquireModal.tsx:210`, `contact/page.tsx:304`, `imhs-2026/page.tsx:579`)
while `imhs-2026/onboard/page.tsx:504` uses the cleaner Tailwind form:
`className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"`.

Conventions: the UI package exports utilities from `packages/ui/lib/`
(see `packages/ui/lib/utils.ts` and how `packages/ui/index.ts` re-exports
them). Match that pattern.

## Commands you will need

| Purpose   | Command | Expected on success |
|-----------|---------|---------------------|
| Typecheck | `cd apps/yachting && npx tsc --noEmit` | exit 0, no output |
| Lint      | `cd apps/yachting && npx eslint .` | exit 0 (2 pre-existing warnings are OK) |
| Find sites| `grep -rn "bg-white/5 border border-white/10 rounded" apps packages --include="*.tsx"` | lists every duplication site |

No test suite exists in this repo.

## Scope

**In scope** (the only files you should modify):
- `packages/ui/lib/formStyles.ts` (create)
- `packages/ui/index.ts` (add exports)
- `packages/ui/components/StepForm.tsx`
- `apps/yachting/components/EnquireModal.tsx`
- `apps/yachting/app/contact/page.tsx`
- `apps/yachting/app/imhs-2026/page.tsx`
- `apps/yachting/app/imhs-2026/onboard/page.tsx`
- `apps/yachting/app/vessels/page.tsx`
- `apps/yachting/app/admin/_components/AddLeadForm.tsx`
- `apps/yachting/app/admin/_components/ManualLeadForm.tsx`
- `apps/yachting/app/admin/_components/NotesEditor.tsx`
- `apps/yachting/app/admin/_components/LeadListClient.tsx`

**Out of scope** (do NOT touch, even though they look related):
- Visual unification of error colors (coral vs red) or validation timing —
  recorded as a design decision in `plans/README.md`, not this plan. Keep
  every form pixel-identical.
- `WorldPremierePopup.tsx` / `MOTYVotePopup.tsx` — deleted by plan 001; if
  still present, leave them alone.
- The modal shell of EnquireModal — plan 003's territory.
- Form submission logic, API routes, validation behavior.

## Git workflow

- Branch: `feature/004-shared-form-primitives` off `develop`.
- Commit message style: `refactor(ui): centralize form input styles; add form a11y attributes`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create the shared constants

Create `packages/ui/lib/formStyles.ts`:

```ts
/**
 * Canonical form-control class strings for the 36ZERO design system.
 * Two densities exist on purpose: public-site forms are roomy (`inputCx`),
 * admin CRM forms are compact (`inputCompactCx`). Don't merge them.
 */

export const inputCx =
  'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors';

export const selectCx =
  'px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors appearance-none';

export const inputCompactCx =
  'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors';

/** Visually-hidden honeypot field (anti-bot). Pair with tabIndex={-1},
 *  autoComplete="off", aria-hidden="true". */
export const honeypotCx =
  'absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden';
```

Export from `packages/ui/index.ts`, matching the file's existing style:
```ts
export { inputCx, selectCx, inputCompactCx, honeypotCx } from './lib/formStyles';
```

**Verify**: `cd apps/yachting && npx tsc --noEmit` → exit 0.

### Step 2: Replace the public-form copies

Run the site-finder grep (see Commands) and work through every public-site
file in scope:

- `StepForm.tsx`: delete its local `inputClasses`/`selectClasses` constants
  (lines 64–65) and import `inputCx`, `selectCx` from `../lib/formStyles`
  (relative import — this file is inside the ui package). Rename usages.
- `contact/page.tsx`: delete the local `inputClasses` constant (line 176),
  import `inputCx` from `@36zero/ui`, rename usages.
- `imhs-2026/onboard/page.tsx`: delete `baseInputCx` (lines 31–32), import
  `inputCx` from `@36zero/ui`, rename usages.
- `EnquireModal.tsx`: replace each inlined string on inputs/textarea with
  `className={inputCx}`. Use `cn` from `@36zero/ui` for the variants — `cn`
  is `clsx` + `tailwind-merge` (see `packages/ui/lib/utils.ts`), so classes
  passed later correctly override earlier ones:
  - textarea (line 332): `className={cn(inputCx, 'resize-none')}`
  - country-code select (line 260): `className={cn(inputCx, 'w-28 px-3')}`
    (`w-28`/`px-3` override `w-full`/`px-4` via tailwind-merge)
  - deliveryRegion select (line 308): `className={inputCx}`
  Do NOT use `selectCx` for these two selects — `selectCx` adds
  `appearance-none`, which would hide the native dropdown arrow these selects
  show today. `selectCx` exists for StepForm, which already uses it.
- `imhs-2026/page.tsx` and `vessels/page.tsx`: same replacement at the sites
  the grep finds.

Also switch the three inline-style honeypots
(`EnquireModal.tsx:205-214`, `contact/page.tsx:299-308`,
`imhs-2026/page.tsx:~579`) from
`style={{ position: 'absolute', left: '-9999px' }}` to
`className={honeypotCx}` (keep `tabIndex={-1}`, `autoComplete="off"`,
`aria-hidden="true"` exactly as they are).

**Verify**: `cd apps/yachting && npx tsc --noEmit` → exit 0, then
`grep -rn "placeholder-white/40 focus:outline-none" apps/yachting/app/contact apps/yachting/app/imhs-2026 apps/yachting/components/EnquireModal.tsx packages/ui/components/StepForm.tsx --include="*.tsx" | grep -v formStyles` → no output (no literal copies left in those files).

### Step 3: Replace the admin copies

In `AddLeadForm.tsx`, `ManualLeadForm.tsx`, `NotesEditor.tsx`,
`LeadListClient.tsx`: delete each local compact-input constant (e.g.
`baseInput` at `AddLeadForm.tsx:9-10`) and import `inputCompactCx` from
`@36zero/ui`, renaming usages. Where a local string differs from
`inputCompactCx` by extra classes (e.g. a search input with `pl-9` for an
icon), compose with `cn(inputCompactCx, 'pl-9')` rather than keeping the
whole copy.

**Verify**: `cd apps/yachting && npx tsc --noEmit` → exit 0 and
`cd apps/yachting && npx eslint .` → exit 0.

### Step 4: Add the missing a11y attributes

1. `EnquireModal.tsx` country-code select (line ~256): add
   `aria-label="Country code"`.
2. `StepForm.tsx` country-code select: add `aria-label="Country code"`.
3. Add `role="alert"` to the four error containers listed in "Current state"
   (EnquireModal coral card, contact coral card, AddLeadForm red card,
   ManualLeadForm red card). Don't change their classes or copy.

**Verify**: `grep -rn 'aria-label="Country code"' apps packages --include="*.tsx"` → 2 matches;
`grep -c 'role="alert"' apps/yachting/components/EnquireModal.tsx` → 1.

### Step 5: Visual smoke check

Dev server (`cd apps/yachting && npm run dev`): open `/contact`, the enquiry
modal on a vessel page, and `/imhs-2026/onboard`. Inputs must look exactly as
before (same padding, radius, focus ring). Type into the contact form and
submit invalid data to see the error card still renders. If admin access is
available, check `/admin/leads/add` renders its compact inputs unchanged.
If the dev server cannot start for missing env vars, record that and rely on
the static gates.

## Test plan

No test infrastructure exists in this repo. The static greps in each step are
the gates; step 5 is the visual confirmation.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `test -f packages/ui/lib/formStyles.ts` → exit 0
- [ ] `grep -rn "placeholder-white/40 focus:outline-none focus:border-brand-blue" apps packages --include="*.tsx" | grep -v formStyles | wc -l` → `0`
- [ ] `grep -rn "left: '-9999px'" apps --include="*.tsx"` → no output
- [ ] `grep -rn 'aria-label="Country code"' apps packages --include="*.tsx" | wc -l` → `2`
- [ ] `cd apps/yachting && npx tsc --noEmit` → exit 0
- [ ] `cd apps/yachting && npx eslint .` → exit 0
- [ ] `git status` shows only in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The grep in step 2 finds duplication sites in files NOT listed in scope
  (other than the plan-001 popups) — report the list instead of expanding
  scope yourself.
- `cn` in `packages/ui/lib/utils.ts` turns out NOT to include
  `tailwind-merge` (then the `cn(inputCx, 'w-28 px-3')` override trick is
  unsafe — report rather than improvising precedence hacks).
- Any input visibly changes size/radius in step 5 — you replaced a variant
  with the wrong constant.

## Maintenance notes

- New forms must import `inputCx`/`inputCompactCx` instead of pasting
  strings; flag any new `bg-white/5 border border-white/10` string literal in
  review.
- Deliberately deferred (see `plans/README.md` backlog): unifying error-state
  colors (public coral vs admin red), validation timing across forms, and
  consolidating the two country-combobox implementations
  (`imhs-2026/onboard/page.tsx` `CountryCombobox` vs `ManualLeadForm.tsx`
  `CountryCombo`) — each needs a product/design decision first.
