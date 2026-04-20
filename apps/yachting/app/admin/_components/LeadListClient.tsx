'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Search, Star, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';
import { cn } from '@36zero/ui';

interface Lead {
  id: string;
  name: string;
  email: string;
  country: string | null;
  interestAdventureYachts: boolean;
  interestShift: boolean;
  rating: number | null;
  ratingUpdatedAt: string | null;
  appointmentStartAt: string | null;
  appointmentStatus: string | null;
  appointmentAssignedStaffEmail: string | null;
  hubspotContactId: string | null;
  createdAt: string;
  notesCount: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const SHOW_DAYS: Array<{ label: string; value: string }> = [
  { label: 'All days', value: '' },
  { label: 'Wed 22', value: '2026-04-22' },
  { label: 'Thu 23', value: '2026-04-23' },
  { label: 'Fri 24', value: '2026-04-24' },
  { label: 'Sat 25', value: '2026-04-25' },
  { label: 'Sun 26', value: '2026-04-26' },
];

const RATING_BUCKETS = [
  { label: 'Any rating', value: 'any' },
  { label: 'Unrated', value: 'unrated' },
  { label: '1–2', value: '1-2' },
  { label: '3', value: '3' },
  { label: '4–5', value: '4-5' },
];

const APPT_STATES = [
  { label: 'Any', value: 'any' },
  { label: 'Booked', value: 'booked' },
  { label: 'Unbooked', value: 'unbooked' },
];

const baseInput =
  'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors';

function RatingDisplay({ value }: { value: number | null }) {
  if (value == null) return <span className="text-xs text-white/40">Unrated</span>;
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i <= value ? 'fill-brand-blue text-brand-blue' : 'text-white/20'
          )}
        />
      ))}
    </span>
  );
}

function AppointmentBadge({ startAt, status }: { startAt: string | null; status: string | null }) {
  if (!startAt || status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
        Unbooked
      </span>
    );
  }
  const d = new Date(startAt);
  const label = d.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-brand-blue/40 bg-brand-blue/10 px-2 py-0.5 text-[11px] text-brand-blue">
      <CalendarIcon className="h-3 w-3" />
      {label}
    </span>
  );
}

export default function LeadListClient() {
  const [q, setQ] = useState('');
  const [day, setDay] = useState('');
  const [rated, setRated] = useState('any');
  const [appointment, setAppointment] = useState('any');

  const query = new URLSearchParams();
  if (q.trim()) query.set('q', q.trim());
  if (day) query.set('day', day);
  if (rated !== 'any') query.set('rated', rated);
  if (appointment !== 'any') query.set('appointment', appointment);

  const { data, error, isLoading } = useSWR<{ leads: Lead[] }>(
    `/api/admin/leads?${query.toString()}`,
    fetcher,
    { refreshInterval: 30_000, revalidateOnFocus: true }
  );

  const leads = data?.leads ?? [];
  const interestBadges = useMemo(() => {
    return (l: Lead) => {
      const out: string[] = [];
      if (l.interestAdventureYachts) out.push('AY');
      if (l.interestShift) out.push('Shift');
      return out.join(' · ');
    };
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Registrants</h1>
        <p className="mt-1 text-sm text-white/60">
          {isLoading
            ? 'Loading…'
            : error
            ? 'Couldn’t load. Retrying…'
            : `${leads.length} ${leads.length === 1 ? 'lead' : 'leads'}`}
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, country…"
            className={cn(baseInput, 'pl-11')}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {SHOW_DAYS.map((d) => (
            <Chip
              key={d.value || 'all'}
              active={day === d.value}
              onClick={() => setDay(d.value)}
            >
              {d.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {RATING_BUCKETS.map((r) => (
            <Chip key={r.value} active={rated === r.value} onClick={() => setRated(r.value)}>
              {r.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {APPT_STATES.map((a) => (
            <Chip
              key={a.value}
              active={appointment === a.value}
              onClick={() => setAppointment(a.value)}
            >
              {a.label}
            </Chip>
          ))}
        </div>
      </div>

      {leads.length === 0 && !isLoading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
          No registrants match.
        </div>
      )}

      <ul className="space-y-2">
        {leads.map((lead) => (
          <li key={lead.id}>
            <Link
              href={`/admin/leads/${lead.id}`}
              className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{lead.name}</span>
                    {interestBadges(lead) && (
                      <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/50">
                        {interestBadges(lead)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-white/50">{lead.email}</p>
                  {lead.country && (
                    <p className="text-xs text-white/40">{lead.country}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <RatingDisplay value={lead.rating} />
                  <AppointmentBadge
                    startAt={lead.appointmentStartAt}
                    status={lead.appointmentStatus}
                  />
                  {lead.notesCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-white/40">
                      <MessageSquare className="h-3 w-3" />
                      {lead.notesCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition',
        active
          ? 'border-brand-blue bg-brand-blue text-white'
          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}
