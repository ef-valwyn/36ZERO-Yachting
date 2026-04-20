'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@36zero/ui';

interface RatingStarsProps {
  value: number | null;
  size?: number;
  readOnly?: boolean;
  onChange?: (value: number | null) => void;
  disabled?: boolean;
}

export default function RatingStars({
  value,
  size = 24,
  readOnly = false,
  onChange,
  disabled = false,
}: RatingStarsProps) {
  const [hover, setHover] = useState<number | null>(null);
  const visible = hover ?? value ?? 0;

  function handleClick(star: number) {
    if (readOnly || disabled || !onChange) return;
    // Click same rating again → clear.
    if (value === star) onChange(null);
    else onChange(star);
  }

  return (
    <div
      className="inline-flex items-center gap-1"
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => handleClick(i)}
          onMouseEnter={() => !readOnly && setHover(i)}
          disabled={readOnly || disabled}
          aria-label={`${i} of 5`}
          className={cn(
            'transition-transform',
            !readOnly && !disabled && 'hover:scale-110 cursor-pointer',
            (readOnly || disabled) && 'cursor-default'
          )}
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(
              'transition-colors',
              i <= visible
                ? 'fill-brand-blue text-brand-blue'
                : 'text-white/20'
            )}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
