'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

type DivHTMLProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'>;

export interface GlassCardProps extends DivHTMLProps {
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
      'bg-brand-navy/60 backdrop-blur-md',
      'border transition-all duration-300',
      variant === 'default' && 'border-white/[0.08]',
      variant === 'blue' && 'border-brand-blue/20',
      variant === 'hover' && 'border-white/[0.08] hover:border-brand-blue/30 hover:shadow-glow',
      paddings[padding],
      className
    );

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
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
