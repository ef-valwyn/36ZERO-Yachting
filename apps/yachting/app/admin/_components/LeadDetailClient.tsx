'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { ChevronLeft, Mail, Phone, Globe, AlarmClock } from 'lucide-react';
import { cn } from '@36zero/ui';
import { leadSourceLabel } from '@/lib/leads/sources';
import NotesEditor from './NotesEditor';
import NotesThread from './NotesThread';
import RatingStars from './RatingStars';
import ScheduleAppointment from './ScheduleAppointment';
import HubSpotDealPanel from './HubSpotDealPanel';

interface InquiryDetail {
  inquiry: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    country: string | null;
    company: string | null;
    interestAdventureYachts: boolean;
    interestShift: boolean;
    message: string | null;
    source: string | null;
    rating: number | null;
    ratingUpdatedAt: string | null;
    ratingAuthorEmail: string | null;
    appointmentStartAt: string | null;
    appointmentEndAt: string | null;
    appointmentStatus: string | null;
    appointmentAssignedStaffEmail: string | null;
    hubspotContactId: string | null;
    lifecycleStage: string | null;
    lifecycleStageUpdatedAt: string | null;
    lifecycleStageAuthorEmail: string | null;
    ownerUserId: string | null;
    ownerEmail: string | null;
    nextActionAt: string | null;
    nextActionNote: string | null;
    createdAt: string;
  };
  notes: Array<{
    id: string;
    body: string;
    createdAt: string;
    authorEmail: string | null;
    authorFirstName: string | null;
    authorLastName: string | null;
    hubspotNoteId: string | null;
    hubspotSynced: boolean;
  }>;
  auditLog: Array<{
    id: string;
    actorEmail: string;
    action: string;
    createdAt: string;
    metadata: Record<string, unknown> | null;
  }>;
}

interface StaffOption {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

const STAGES = ['new', 'contacted', 'qualified', 'nurture', 'lost'] as const;
type LifecycleStage = (typeof STAGES)[number];

const STAGE_BADGE: Record<string, string> = {
  new: 'border-white/15 bg-white/5 text-white/70',
  contacted: 'border-brand-blue/40 bg-brand-blue/10 text-brand-blue',
  qualified: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  nurture: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  lost: 'border-red-500/30 bg-red-500/10 text-red-300',
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format a Date as a value for `<input type="datetime-local">`.
 * The widget expects local-time YYYY-MM-DDTHH:mm — no timezone suffix.
 */
function toLocalInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function LeadDetailClient({
  inquiryId,
  isAdmin = false,
}: {
  inquiryId: string;
  isAdmin?: boolean;
}) {
  const { data, error, isLoading, mutate } = useSWR<InquiryDetail>(
    `/api/admin/leads/${inquiryId}`,
    fetcher,
    { refreshInterval: 15_000, revalidateOnFocus: true }
  );
  const { data: staffData } = useSWR<{ staff: StaffOption[] }>(
    '/api/admin/staff',
    fetcher
  );

  const [savingRating, setSavingRating] = useState(false);
  const [savingStage, setSavingStage] = useState(false);
  const [savingOwner, setSavingOwner] = useState(false);
  const [savingAction, setSavingAction] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  if (isLoading && !data) {
    return <p className="text-sm text-white/60">Loading…</p>;
  }
  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-400">Failed to load lead.</p>
        <Link href="/admin" className="text-xs text-white/60 hover:text-white">
          ← Back to leads
        </Link>
      </div>
    );
  }
  if (!data) return null;

  const { inquiry, notes, auditLog } = data;
  const interests = [
    inquiry.interestAdventureYachts ? 'Adventure Yachts' : null,
    inquiry.interestShift ? 'Shift Yachts' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  async function onRatingChange(next: number | null) {
    if (savingRating) return;
    setSavingRating(true);
    await mutate(
      (current) =>
        current
          ? {
              ...current,
              inquiry: {
                ...current.inquiry,
                rating: next,
                ratingUpdatedAt: new Date().toISOString(),
              },
            }
          : current,
      false
    );
    try {
      const res = await fetch(`/api/admin/leads/${inquiryId}/rating`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await mutate();
    } catch (err) {
      console.error('[LeadDetailClient] rating save failed:', err);
      await mutate();
    } finally {
      setSavingRating(false);
    }
  }

  async function onStageChange(stage: LifecycleStage) {
    if (savingStage || stage === inquiry.lifecycleStage) return;
    setSavingStage(true);
    try {
      const res = await fetch(`/api/admin/leads/${inquiryId}/stage`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await mutate();
    } catch (err) {
      console.error('[LeadDetailClient] stage save failed:', err);
    } finally {
      setSavingStage(false);
    }
  }

  async function onOwnerChange(ownerUserId: string | null) {
    if (savingOwner) return;
    setSavingOwner(true);
    try {
      const res = await fetch(`/api/admin/leads/${inquiryId}/owner`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerUserId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await mutate();
    } catch (err) {
      console.error('[LeadDetailClient] owner save failed:', err);
    } finally {
      setSavingOwner(false);
    }
  }

  async function onNextActionSave(at: string | null, note: string | null) {
    if (savingAction) return;
    setSavingAction(true);
    try {
      const res = await fetch(`/api/admin/leads/${inquiryId}/next-action`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextActionAt: at, nextActionNote: note }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await mutate();
    } catch (err) {
      console.error('[LeadDetailClient] next action save failed:', err);
    } finally {
      setSavingAction(false);
    }
  }

  async function onAddNote(body: string) {
    const res = await fetch(`/api/admin/leads/${inquiryId}/notes`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await mutate();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white"
      >
        <ChevronLeft className="h-3 w-3" />
        Back to leads
      </Link>

      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{inquiry.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/60">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {inquiry.email}
              </span>
              {inquiry.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {inquiry.phone}
                </span>
              )}
              {inquiry.country && (
                <span className="inline-flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {inquiry.country}
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-white/40">
              Registered {formatDateTime(inquiry.createdAt)} via {leadSourceLabel(inquiry.source)}
              {inquiry.hubspotContactId && (
                <span> · HubSpot {inquiry.hubspotContactId}</span>
              )}
            </p>
          </div>
          <div className="shrink-0">
            <ScheduleAppointment inquiryId={inquiryId} onBooked={() => mutate()} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <RatingStars
              value={inquiry.rating}
              onChange={onRatingChange}
              disabled={savingRating}
            />
            {inquiry.rating != null && inquiry.ratingAuthorEmail && (
              <p className="text-[11px] text-white/40">
                set by {inquiry.ratingAuthorEmail} · {formatDateTime(inquiry.ratingUpdatedAt)}
              </p>
            )}
          </div>
          <AppointmentBanner
            startAt={inquiry.appointmentStartAt}
            endAt={inquiry.appointmentEndAt}
            status={inquiry.appointmentStatus}
            staffEmail={inquiry.appointmentAssignedStaffEmail}
          />
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Lifecycle stage
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {STAGES.map((s) => {
              const active = inquiry.lifecycleStage === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStageChange(s)}
                  disabled={savingStage}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wider transition',
                    active
                      ? STAGE_BADGE[s]
                      : 'border-white/10 bg-transparent text-white/50 hover:border-white/20 hover:text-white',
                    savingStage && 'cursor-wait opacity-70'
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {inquiry.lifecycleStageAuthorEmail && (
            <p className="mt-1 text-[11px] text-white/40">
              set by {inquiry.lifecycleStageAuthorEmail} ·{' '}
              {formatDateTime(inquiry.lifecycleStageUpdatedAt)}
            </p>
          )}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Owner
          </p>
          <select
            value={inquiry.ownerUserId ?? ''}
            onChange={(e) => onOwnerChange(e.target.value || null)}
            disabled={savingOwner}
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
          >
            <option value="">Unassigned</option>
            {(staffData?.staff ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.email}
                {s.role === 'admin' ? ' (admin)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <NextActionEditor
            initialAt={inquiry.nextActionAt}
            initialNote={inquiry.nextActionNote}
            saving={savingAction}
            onSave={onNextActionSave}
          />
        </div>
      </div>

      <HubSpotDealPanel inquiryId={inquiryId} isAdmin={isAdmin} />

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Registration
        </p>
        <dl className="mt-3 space-y-1.5 text-sm">
          {interests && <Row label="Interests">{interests}</Row>}
          {inquiry.company && <Row label="Company">{inquiry.company}</Row>}
          {inquiry.message && <Row label="Message">{inquiry.message}</Row>}
          {!interests && !inquiry.company && !inquiry.message && (
            <p className="text-xs text-white/50">No registration details.</p>
          )}
        </dl>
      </div>

      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Notes
        </p>
        <NotesEditor onSubmit={onAddNote} />
        <NotesThread notes={notes} />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowAudit((v) => !v)}
          className="text-[11px] text-white/40 hover:text-white/70"
        >
          {showAudit ? '▾' : '▸'} Audit trail ({auditLog.length})
        </button>
        {showAudit && (
          <ul className="mt-2 space-y-1 text-[11px] text-white/50">
            {auditLog.map((a) => (
              <li key={a.id} className="font-mono">
                {formatDateTime(a.createdAt)} · {a.actorEmail} · {a.action}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-white/50">{label}</dt>
      <dd className="whitespace-pre-wrap text-white/90">{children}</dd>
    </div>
  );
}

function NextActionEditor({
  initialAt,
  initialNote,
  saving,
  onSave,
}: {
  initialAt: string | null;
  initialNote: string | null;
  saving: boolean;
  onSave: (atIso: string | null, note: string | null) => void;
}) {
  const [at, setAt] = useState<string>(toLocalInputValue(initialAt));
  const [note, setNote] = useState<string>(initialNote ?? '');
  const dirty =
    at !== toLocalInputValue(initialAt) || (note ?? '') !== (initialNote ?? '');

  function handleSave() {
    if (saving) return;
    const iso = at ? new Date(at).toISOString() : null;
    onSave(iso, note.trim() || null);
  }

  function handleClear() {
    if (saving) return;
    setAt('');
    setNote('');
    onSave(null, null);
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
        Next action
      </p>
      <div className="mt-2 grid gap-2 md:grid-cols-[auto_1fr_auto]">
        <input
          type="datetime-local"
          value={at}
          onChange={(e) => setAt(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (e.g. Call after viewing)"
          maxLength={500}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder-white/30"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className={cn(
              'rounded-lg bg-brand-blue px-3 py-2 text-xs font-semibold text-white',
              (!dirty || saving) && 'cursor-not-allowed opacity-50'
            )}
          >
            <AlarmClock className="mr-1 inline h-3 w-3" />
            Save
          </button>
          {(initialAt || initialNote) && (
            <button
              type="button"
              onClick={handleClear}
              disabled={saving}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:border-white/20 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentBanner({
  startAt,
  endAt,
  status,
  staffEmail,
}: {
  startAt: string | null;
  endAt: string | null;
  status: string | null;
  staffEmail: string | null;
}) {
  if (!startAt || status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
        No private showing booked
      </span>
    );
  }
  const label = formatDateTime(startAt);
  const endLabel = endAt
    ? new Date(endAt).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs',
        status === 'rescheduled'
          ? 'border-accent-gold/40 bg-accent-gold/10 text-accent-gold'
          : 'border-brand-blue/40 bg-brand-blue/10 text-brand-blue'
      )}
    >
      {label}
      {endLabel ? ` – ${endLabel}` : ''}
      {staffEmail ? ` · ${staffEmail}` : ''}
      {status === 'rescheduled' ? ' · rescheduled' : ''}
    </span>
  );
}
