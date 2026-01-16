'use client';

import React from 'react';
import { cn } from '@36zero/ui';

interface LogoProps {
  variant?: 'full' | 'mark';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'full', className }) => {
  if (variant === 'mark') {
    return (
      <div className={cn('flex items-center', className)}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-brand-blue"
        >
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 28L20 12L28 28"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="14"
            y1="24"
            x2="26"
            y2="24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-brand-blue"
      >
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 28L20 12L28 28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="14"
          y1="24"
          x2="26"
          y2="24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex flex-col">
        <span className="text-lg font-extrabold tracking-tighter text-white">
          36ZERO
        </span>
        <span className="text-xs font-medium tracking-widest uppercase text-white/60">
          Yachting
        </span>
      </div>
    </div>
  );
};

export default Logo;
