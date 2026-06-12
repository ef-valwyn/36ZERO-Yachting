'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Search,
  Star,
  Calendar as CalendarIcon,
  MessageSquare,
  AlarmClock,
  User as UserIcon,
} from 'lucide-react';
import { cn, inputCx } from '@36zero/ui';
import { LEAD_SOURCES, leadSourceLabel } from '@/lib/leads/sources';

interface Lead {
  id: string;
  name: string;
  email: string;
  country: string | null;
  source: string | null;
  interestAdventureYachts: boolean;
  interestShift: boolean;
  rating: number | null;
  ratingUpdatedAt: string | null;
  appointmentStartAt: string | null;
  appointmentStatus: string | null;
  appointmentAssignedStaffEmail: string | null;
  hubspotContactId: string | null;
  manualEntry: boolean | null;
  lifecycleStage: string | null;
  ownerUserId: string | null;
  nextActionAt: string | null;
  nextActionNote: string | null;
  createdAt: string;
  notesCount: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const STAGE_FILTERS: Array<{ label: string; value: string }> = [
  { label: 'Any stage', value: '' },
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Nurture', value: 'nurture' },
  { label: 'Lost', value: 'lost' },
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

const DUE_FILTERS = [
  { label: 'All', value: 'any' },
  { label: 'Due today', value: 'today' },
  { label: 'Overdue', value: 'overdue' },
];

const STAGE_BADGE: Record<string, string> = {
  new: 'border-white/15 bg-white/5 text-white/70',
  contacted: 'border-brand-blue/40 bg-brand-blue/10 text-brand-blue',
  qualified: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  nurture: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  lost: 'border-red-500/30 bg-red-500/10 text-red-300',
};

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

function NextActionBadge({
  at,
  note,
  now,
}: {
  at: string | null;
  note: string | null;
  now: number;
}) {
  if (!at) return null;
  const dt = new Date(at);
  const isOverdue = dt.getTime() <= now;
  const label = dt.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return (
    <span
      title={note ?? undefined}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]',
        isOverdue
          ? 'border-red-500/40 bg-red-500/10 text-red-300'
          : 'border-white/15 bg-white/5 text-white/70'
      )}
    >
      <AlarmClock className="h-3 w-3" />
      {label}
    </span>
  );
}

function StageBadge({ stage }: { stage: string | null }) {
  const v = stage ?? 'new';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wider',
        STAGE_BADGE[v] ?? STAGE_BADGE.new
      )}
    >
      {v}
    </span>
  );
}

export default function LeadListClient() {
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('');
  const [source, setSource] = useState('');
  const [rated, setRated] = useState('any');
  const [appointment, setAppointment] = useState('any');
  const [due, setDue] = useState('any');
  const [mineOnly, setMineOnly] = useState(false);
  // Stable "now" reference per refetch — avoids react-hooks/purity warning for
  // calling Date.now() during render. Recomputed when SWR returns new data.
  const [renderNow, setRenderNow] = useState(() => Date.now());

  const query = new URLSearchParams();
  if (q.trim()) query.set('q', q.trim());
  if (stage) query.set('stage', stage);
  if (source) query.set('source', source);
  if (rated !== 'any') query.set('rated', rated);
  if (appointment !== 'any') query.set('appointment', appointment);
  if (due !== 'any') query.set('due', due);
  if (mineOnly) query.set('owner', '_me');

  const { data, error, isLoading } = useSWR<{ leads: Lead[] }>(
    `/api/admin/leads?${query.toString()}`,
    fetcher,
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      onSuccess: () => setRenderNow(Date.now()),
    }
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
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
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
            className={cn(inputCx, 'pl-11')}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STAGE_FILTERS.map((s) => (
            <Chip
              key={s.value || 'any-stage'}
              active={stage === s.value}
              onClick={() => setStage(s.value)}
            >
              {s.label}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {DUE_FILTERS.map((d) => (
            <Chip key={d.value} active={due === d.value} onClick={() => setDue(d.value)}>
              {d.label}
            </Chip>
          ))}
          <Chip active={mineOnly} onClick={() => setMineOnly((v) => !v)}>
            <UserIcon className="mr-1 inline h-3 w-3" />
            My leads
          </Chip>
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

        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
            Source
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={cn(inputCx, 'py-2')}
          >
            <option value="">Any source</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {leadSourceLabel(s)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {leads.length === 0 && !isLoading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
          No leads match.
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium">{lead.name}</span>
                    <StageBadge stage={lead.lifecycleStage} />
                    {interestBadges(lead) && (
                      <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/50">
                        {interestBadges(lead)}
                      </span>
                    )}
                    {lead.manualEntry && (
                      <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-300">
                        Manual
                      </span>
                    )}
                    {lead.source && lead.source !== 'imhs_onboard_registration' && (
                      <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/40">
                        {leadSourceLabel(lead.source)}
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
                  <NextActionBadge
                    at={lead.nextActionAt}
                    note={lead.nextActionNote}
                    now={renderNow}
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
