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
