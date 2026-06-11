# Plan 003: Add an accessible Modal primitive and migrate the two live modals onto it

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat b8b6316..HEAD -- apps/yachting/components/EnquireModal.tsx apps/yachting/app/admin/_components/ScheduleAppointment.tsx packages/ui/components packages/ui/index.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none (001 recommended first so the deleted popups don't confuse greps)
- **Category**: tech-debt (accessibility)
- **Planned at**: commit `b8b6316`, 2026-06-11

## Why this matters

The site's primary conversion surface — the vessel `EnquireModal` — and the
admin `ScheduleAppointment` modal both hand-roll their dialog shell
(backdrop + animated panel) with **no** `role="dialog"`, no `aria-modal`, no
Escape-to-close, no focus trap, and no focus restoration. Keyboard and
screen-reader users can tab out of an open modal into the page behind it, and
cannot dismiss it without finding the close button. This plan adds one shared,
accessible `Modal` primitive to `@36zero/ui` and migrates both call sites onto
it **without changing how the modals look or animate** — the existing classes
and Framer Motion values are preserved.

## Current state

- `apps/yachting/components/EnquireModal.tsx` — vessel enquiry bottom sheet.
  Its shell at lines 142–178:
  ```tsx
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        {/* Modal */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto"
        >
          <div className="bg-brand-navy border-t border-white/10 rounded-t-3xl">
  ```
  It also owns a body-scroll-lock effect at lines 63–73 (sets
  `document.body.style.overflow`), and its title is the `<h2>` at line 168
  (`Enquire About {vesselName}`). The close button at lines 171–177 already
  has `aria-label="Close"`.
- `apps/yachting/app/admin/_components/ScheduleAppointment.tsx` — admin
  Cal.com booking modal. Shell at lines 97–132: same pattern, backdrop at
  `z-40` (`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm`), panel at `z-50`
  with `transition={{ type: 'spring', damping: 30, stiffness: 280 }}` and
  className
  `"fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92vh] w-full max-w-4xl flex-col rounded-t-2xl border border-white/10 bg-brand-navy shadow-2xl sm:inset-4 sm:rounded-2xl"`.
  Its title is the `<h2>` at line 118 (`Schedule private showing`). It has
  **no** body scroll lock today.
- `packages/ui/index.ts` — the UI package barrel; components are exported like
  `export { Button } from './components/Button';` (open the file and match its
  exact style).
- Conventions: components in `packages/ui/components/` are `'use client'`
  TypeScript function components with exported prop interfaces — see
  `packages/ui/components/GlassCard.tsx` as the exemplar. The `cn()` helper
  lives at `packages/ui/lib/utils.ts`.

## Commands you will need

| Purpose   | Command | Expected on success |
|-----------|---------|---------------------|
| Typecheck | `cd apps/yachting && npx tsc --noEmit` | exit 0, no output |
| Lint      | `cd apps/yachting && npx eslint .` | exit 0 (2 pre-existing warnings are OK) |
| Dev server| `cd apps/yachting && npm run dev` | serves on http://localhost:3000 |

No test suite exists in this repo.

## Scope

**In scope** (the only files you should modify):
- `packages/ui/components/Modal.tsx` (create)
- `packages/ui/index.ts` (add export)
- `apps/yachting/components/EnquireModal.tsx`
- `apps/yachting/app/admin/_components/ScheduleAppointment.tsx`

**Out of scope** (do NOT touch, even though they look related):
- `apps/yachting/components/WorldPremierePopup.tsx` and
  `MOTYVotePopup.tsx` — dead code; plan 001 deletes them. If they still exist
  when you run, ignore them.
- The form contents/markup inside EnquireModal (plan 004 touches those) —
  only replace the shell.
- `packages/ui/components/Navigation.tsx` mobile menu — different pattern,
  separate concern.

## Git workflow

- Branch: `feature/003-accessible-modal-primitive` off `develop`.
- Commit message style: `feat(ui): accessible Modal primitive` then
  `refactor(yachting): migrate EnquireModal + ScheduleAppointment to Modal`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `packages/ui/components/Modal.tsx`

Create the file with exactly this content (it is designed to reproduce the
existing backdrop/panel animation defaults so visuals don't change):

```tsx
'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Transition } from 'framer-motion';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** id of the element inside the panel that titles the dialog (an h2) */
  labelledBy: string;
  /** positioning/size classes for the animated panel wrapper */
  panelClassName: string;
  /** override the backdrop classes; default matches the site standard */
  backdropClassName?: string;
  /** override the panel spring; default matches EnquireModal */
  panelTransition?: Transition;
  children: React.ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  isOpen,
  onClose,
  labelledBy,
  panelClassName,
  backdropClassName,
  panelTransition,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Move focus into the dialog on open; restore it on close
  useEffect(() => {
    if (isOpen) {
      lastActiveRef.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => {
        const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
        (first ?? panelRef.current)?.focus();
      });
    } else {
      lastActiveRef.current?.focus?.();
      lastActiveRef.current = null;
    }
  }, [isOpen]);

  // Escape closes; Tab cycles within the dialog
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={
              backdropClassName ?? 'fixed inset-0 bg-black/70 backdrop-blur-sm z-50'
            }
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={
              panelTransition ?? { type: 'spring', damping: 30, stiffness: 300 }
            }
            className={panelClassName}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Modal;
```

Add to `packages/ui/index.ts`, matching the existing export style:
```ts
export { Modal, type ModalProps } from './components/Modal';
```

**Verify**: `cd apps/yachting && npx tsc --noEmit` → exit 0.

### Step 2: Migrate EnquireModal

In `apps/yachting/components/EnquireModal.tsx`:

1. Import `Modal` from `@36zero/ui` (extend the existing
   `import { Button, countryCodes } from '@36zero/ui';` at line 6).
2. Delete the body-scroll-lock effect (lines 63–73) — `Modal` owns that now.
3. Replace the shell: remove the outer `<AnimatePresence>`, the backdrop
   `motion.div`, and the panel `motion.div` (lines 142–163 and the matching
   closers at the bottom, lines 377–380). Wrap the existing content
   (`<div className="bg-brand-navy border-t border-white/10 rounded-t-3xl">`
   and everything inside it) in:
   ```tsx
   <Modal
     isOpen={isOpen}
     onClose={onClose}
     labelledBy="enquire-modal-title"
     panelClassName="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto"
   >
   ```
4. Add `id="enquire-modal-title"` to the `<h2>` at line 168.
5. Remove now-unused imports if any (`motion`/`AnimatePresence` are still used
   by the success panel and error message animations at lines 183 and 339 —
   keep `motion`, drop `AnimatePresence` only if nothing else uses it).

**Verify**: `cd apps/yachting && npx tsc --noEmit` → exit 0, and
`cd apps/yachting && npx eslint .` → exit 0 (no new unused-import warnings).

### Step 3: Migrate ScheduleAppointment

In `apps/yachting/app/admin/_components/ScheduleAppointment.tsx`:

1. Import `Modal` from `@36zero/ui` (extend line 6).
2. Replace the `<AnimatePresence>` block (lines 97–161) with:
   ```tsx
   <Modal
     isOpen={open}
     onClose={() => setOpen(false)}
     labelledBy="schedule-showing-title"
     panelClassName="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92vh] w-full max-w-4xl flex-col rounded-t-2xl border border-white/10 bg-brand-navy shadow-2xl sm:inset-4 sm:rounded-2xl"
     panelTransition={{ type: 'spring', damping: 30, stiffness: 280 }}
   >
     ...existing header + content divs unchanged...
   </Modal>
   ```
   Note the backdrop moves from `z-40` to the default `z-50` — intentional
   (it should always sit above page chrome).
3. Add `id="schedule-showing-title"` to the `<h2>` at line 118.
4. Remove the now-unused `motion`/`AnimatePresence` imports from line 4 if
   nothing else in the file uses them.

**Verify**: `cd apps/yachting && npx tsc --noEmit` → exit 0, and
`cd apps/yachting && npx eslint .` → exit 0.

### Step 4: Behavioral check in the browser

Dev-server check (`cd apps/yachting && npm run dev`):

1. Open a vessel page (e.g. `/adventure-yachts`, then a vessel detail) and
   trigger "Enquire". Confirm: slides up from the bottom exactly as before;
   page behind doesn't scroll; **Escape closes it**; **Tab cycles only within
   the modal**; closing returns focus to the Enquire button; backdrop click
   still closes.
2. If you have admin access locally, repeat for "Schedule private showing" on
   a lead detail page. If you cannot sign in to admin, verify EnquireModal
   only and note the limitation in your report.

If the dev server cannot start for missing env vars, note it and rely on
typecheck + lint + code review of the diff.

**Verify**: all behaviors above observed for EnquireModal.

## Test plan

No test infrastructure exists in this repo. Manual verification per step 4 is
the behavioral gate; the done criteria below are the static gates.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `test -f packages/ui/components/Modal.tsx` → exit 0
- [ ] `grep -n "role=\"dialog\"" packages/ui/components/Modal.tsx` → 1 match
- [ ] `grep -n "Modal" packages/ui/index.ts` → at least 1 match
- [ ] `grep -c "AnimatePresence" apps/yachting/app/admin/_components/ScheduleAppointment.tsx` → 0
- [ ] `grep -n "document.body.style.overflow" apps/yachting/components/EnquireModal.tsx` → no output (moved into Modal)
- [ ] `grep -n "enquire-modal-title" apps/yachting/components/EnquireModal.tsx` → 2 matches (prop + h2 id)
- [ ] `cd apps/yachting && npx tsc --noEmit` → exit 0
- [ ] `cd apps/yachting && npx eslint .` → exit 0
- [ ] `git status` shows only the four in-scope files modified/created
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The shells in either file no longer match the "Current state" excerpts
  (someone refactored them since commit `b8b6316`).
- The Cal.com embed inside ScheduleAppointment stops loading after migration
  (the focus trap touching the embedded iframe is the likely culprit) — report
  rather than hacking around it.
- Typecheck reveals `framer-motion`'s `Transition` type is not exported the
  way step 1 assumes (older/newer framer version) — report the version and
  exact error.
- You find yourself wanting to change anything inside the modal bodies beyond
  the listed shell edits and `id` additions.

## Maintenance notes

- Future dialogs (including any revival of the deleted popups from plan 001)
  should be built on this `Modal` — review any new `fixed inset-0` +
  `AnimatePresence` pattern in PRs as a smell.
- The focus trap queries the DOM on each Tab press; if a modal ever contains
  hundreds of focusable elements, revisit with a cached approach.
- Plan 004 edits the form inside EnquireModal; execute these two plans
  sequentially (either order, but not concurrently) to avoid merge conflicts.
