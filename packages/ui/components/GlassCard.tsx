'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../lib/utils';

export interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: 'default' | 'blue' | 'hover';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  withOverlay?: boolean;
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      withOverlay = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      'relative overflow-hidden rounded-2xl',
      'bg-brand-navy/80 backdrop-blur-xl',
      'border transition-all duration-300',
      variant === 'default' && 'border-white/10',
      variant === 'blue' && 'border-brand-blue/20',
      variant === 'hover' && 'border-white/10 hover:border-brand-blue/30 hover:shadow-glow',
      paddings[padding],
      className
    );

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        {...props}
      >
        {withOverlay && <div className="glass-overlay" />}
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
