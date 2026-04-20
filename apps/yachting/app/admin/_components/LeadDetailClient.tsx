'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { ChevronLeft, Mail, Phone, Globe } from 'lucide-react';
import { cn } from '@36zero/ui';
import NotesEditor from './NotesEditor';
import NotesThread from './NotesThread';
import RatingStars from './RatingStars';
import ScheduleAppointment from './ScheduleAppointment';

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

export default function LeadDetailClient({ inquiryId }: { inquiryId: string }) {
  const { data, error, isLoading, mutate } = useSWR<InquiryDetail>(
    `/api/admin/leads/${inquiryId}`,
    fetcher,
    { refreshInterval: 15_000, revalidateOnFocus: true }
  );

  const [savingRating, setSavingRating] = useState(false);
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
    // Optimistic update.
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
      await mutate(); // re-fetch canonical
    } catch (err) {
      console.error('[LeadDetailClient] rating save failed:', err);
      await mutate(); // revert by refetching
    } finally {
      setSavingRating(false);
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
              Registered {formatDateTime(inquiry.createdAt)} via{' '}
              {inquiry.source === 'imhs_onboard_registration'
                ? 'IMHS onboard QR'
                : inquiry.source}
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

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Registration
        </p>
        <dl className="mt-3 space-y-1.5 text-sm">
          <Row label="Interests">{interests || '—'}</Row>
          {inquiry.company && <Row label="Company">{inquiry.company}</Row>}
          {inquiry.message && <Row label="Message">{inquiry.message}</Row>}
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
