'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export interface SectionHeadingProps {
  /** Small uppercase kicker above the title */
  eyebrow?: string;
  eyebrowVariant?: 'blue' | 'gold' | 'muted';
  /** Section title — rendered as an h2 on the global display scale */
  title: React.ReactNode;
  /** Supporting paragraph under the title */
  lede?: React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
}

const eyebrowVariants = {
  blue: 'eyebrow',
  gold: 'eyebrow-gold',
  muted: 'eyebrow-muted',
};

/**
 * Standard section header: eyebrow + display title + optional lede,
 * with the site-standard entrance animation.
 */
export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  eyebrowVariant = 'blue',
  title,
  lede,
  align = 'center',
  className,
}) => {
  return (
    <motion.div
      className={cn(
        align === 'center' ? 'text-center' : 'text-left',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {eyebrow && (
        <p className={cn(eyebrowVariants[eyebrowVariant], 'mb-4')}>{eyebrow}</p>
      )}
      <h2 className="text-white">{title}</h2>
      {lede && (
        <p
          className={cn(
            'mt-5 text-white/60 font-light max-w-3xl',
            align === 'center' && 'mx-auto'
          )}
        >
          {lede}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeading;
