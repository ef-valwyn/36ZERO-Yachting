import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'month-year' = 'long'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const formats: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'short', day: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    'month-year': { month: 'long', year: 'numeric' },
  };
  
  return d.toLocaleDateString('en-US', formats[format]);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}
