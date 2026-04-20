'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { cn } from '@36zero/ui';

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// Show days and half-hour slot boundaries for IMHS 2026 private-showing window.
const SHOW_DAYS = [
  { label: 'Wed 22', iso: '2026-04-22' },
  { label: 'Thu 23', iso: '2026-04-23' },
  { label: 'Fri 24', iso: '2026-04-24' },
  { label: 'Sat 25', iso: '2026-04-25' },
  { label: 'Sun 26', iso: '2026-04-26' },
];

const SLOTS = [
  '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30',
];

interface Booking {
  id: string;
  name: string;
  email: string;
  rating: number | null;
  appointmentStartAt: string;
  appointmentEndAt: string | null;
  appointmentStatus: string | null;
  appointmentAssignedStaffEmail: string | null;
}

// Map a booking to "YYYY-MM-DD|HH:MM" using UTC-to-Paris offset for the show.
// April 2026 is inside CEST (UTC+2), so a 30-min slot starting 15:00 Paris = 13:00 UTC.
// Derive the Paris-local ISO date + HH:MM from the stored UTC timestamp.
function parisKey(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}|${get('hour')}:${get('minute')}`;
}

export default function CalendarDayGrid() {
  const { data, error, isLoading } = useSWR<{ bookings: Booking[] }>(
    '/api/admin/calendar?from=2026-04-22&to=2026-04-27',
    fetcher,
    { refreshInterval: 30_000, revalidateOnFocus: true }
  );

  const bookings = data?.bookings ?? [];
  const byKey = new Map<string, Booking>();
  for (const b of bookings) {
    byKey.set(parisKey(b.appointmentStartAt), b);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Private showings</h1>
        <p className="mt-1 text-sm text-white/60">
          15:00–19:00 Europe/Paris · 30 min slots · 8 per day cap
        </p>
        {isLoading && <p className="mt-2 text-xs text-white/40">Loading…</p>}
        {error && <p className="mt-2 text-xs text-red-400">Failed to load calendar.</p>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/50">
              <th className="px-3 py-2 font-medium">Slot</th>
              {SHOW_DAYS.map((d) => (
                <th key={d.iso} className="px-3 py-2 font-medium">
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot) => (
              <tr key={slot} className="border-b border-white/5 last:border-b-0">
                <td className="px-3 py-2 font-mono text-white/70">{slot}</td>
                {SHOW_DAYS.map((d) => {
                  const key = `${d.iso}|${slot}`;
                  const booking = byKey.get(key);
                  return (
                    <td
                      key={d.iso + slot}
                      className={cn(
                        'px-3 py-2 align-top',
                        booking && 'bg-brand-blue/10'
                      )}
                    >
                      {booking ? (
                        <Link
                          href={`/admin/leads/${booking.id}`}
                          className="block rounded-lg border border-brand-blue/30 bg-brand-blue/10 px-2 py-1 text-white transition hover:border-brand-blue/60"
                        >
                          <p className="truncate text-[11px] font-medium">
                            {booking.name}
                          </p>
                          <p className="truncate text-[10px] text-white/60">
                            {booking.email}
                          </p>
                          {booking.appointmentAssignedStaffEmail && (
                            <p className="truncate text-[10px] text-white/40">
                              host · {booking.appointmentAssignedStaffEmail}
                            </p>
                          )}
                        </Link>
                      ) : (
                        <span className="text-[11px] text-white/20">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
