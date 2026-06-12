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
