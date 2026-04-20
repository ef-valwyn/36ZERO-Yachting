'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import { cn } from '@36zero/ui';
import { LayoutList, CalendarDays, LogOut } from 'lucide-react';
import type { StaffUser } from '@/lib/auth/require-staff';

interface AdminShellProps {
  staff: StaffUser;
  children: React.ReactNode;
}

const NAV = [
  { href: '/admin', label: 'Leads', icon: LayoutList, exact: true },
  { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays, exact: false },
];

export default function AdminShell({ staff, children }: AdminShellProps) {
  const pathname = usePathname();
  const displayName =
    [staff.firstName, staff.lastName].filter(Boolean).join(' ') || staff.email;

  return (
    <div className="min-h-screen min-h-[100svh] min-h-[100dvh] bg-brand-navy text-white">
      <header className="border-b border-white/10 bg-brand-navy/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">
              36ZERO · Admin
            </span>
            <span className="hidden text-xs text-white/40 sm:inline">IMHS 2026</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-white/70 sm:inline">{displayName}</span>
            <span className="hidden rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60 sm:inline">
              {staff.role}
            </span>
            <SignOutButton>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/20 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-0 px-0 sm:flex-row sm:gap-6 sm:px-5 sm:py-6">
        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 px-5 py-3 sm:w-48 sm:flex-col sm:border-b-0 sm:px-0 sm:py-0">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-brand-blue text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="min-w-0 flex-1 px-5 pb-16 pt-4 sm:px-0 sm:pt-0">{children}</main>
      </div>
    </div>
  );
}
