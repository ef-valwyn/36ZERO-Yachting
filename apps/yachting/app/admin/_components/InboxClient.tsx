'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@36zero/ui';
import {
  Inbox,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Link2,
  ChevronRight,
} from 'lucide-react';

interface ParsedFields {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  companyOrBroker: string | null;
  vesselOfInterest: string | null;
  intent: string | null;
  urgency: string | null;
  summary: string | null;
}

interface DraftListRow {
  id: string;
  fromEmail: string;
  fromName: string | null;
  subject: string | null;
  receivedAt: string;
  status: string;
  statusReason: string | null;
  parsedJson: ParsedFields | null;
  resultingInquiryId: string | null;
  spamScore: string | null;
  bodyDeletedAt: string | null;
  createdAt: string;
}

interface DraftDetail extends DraftListRow {
  rawTextBody: string | null;
  rawHtmlBody: string | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const STATUS_FILTERS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'All', value: 'all' },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  parsing: {
    label: 'Parsing',
    cls: 'border-white/15 bg-white/5 text-white/60',
  },
  parsed: {
    label: 'Parsed',
    cls: 'border-brand-blue/40 bg-brand-blue/10 text-brand-blue',
  },
  parse_failed: {
    label: 'Parse failed',
    cls: 'border-red-500/40 bg-red-500/10 text-red-300',
  },
  duplicate: {
    label: 'Duplicate',
    cls: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  },
  approved: {
    label: 'Approved',
    cls: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  },
  rejected: {
    label: 'Rejected',
    cls: 'border-white/15 bg-white/5 text-white/40',
  },
};

function StatusBadge({ status }: { status: string }) {
  const v = STATUS_BADGE[status] ?? STATUS_BADGE.parsing;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider',
        v.cls
      )}
    >
      {v.label}
    </span>
  );
}

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

export default function InboxClient() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR<{ drafts: DraftListRow[] }>(
    `/api/admin/inbox?status=${statusFilter}`,
    fetcher,
    { refreshInterval: 30_000, revalidateOnFocus: true }
  );

  const drafts = data?.drafts ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          <p className="mt-1 text-sm text-white/60">
            {isLoading
              ? 'Loading…'
              : error
              ? 'Couldn’t load. Retrying…'
              : `${drafts.length} ${drafts.length === 1 ? 'draft' : 'drafts'}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatusFilter(s.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition',
              statusFilter === s.value
                ? 'border-brand-blue bg-brand-blue text-white'
                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {drafts.length === 0 && !isLoading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
          <Inbox className="mx-auto mb-2 h-6 w-6 text-white/40" />
          No drafts in this queue.
        </div>
      )}

      <ul className="space-y-2">
        {drafts.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => setSelectedId(d.id)}
              className="flex w-full items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {d.fromName || d.fromEmail}
                  </span>
                  <StatusBadge status={d.status} />
                  {d.parsedJson?.intent && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/50">
                      {d.parsedJson.intent}
                    </span>
                  )}
                  {d.parsedJson?.urgency && d.parsedJson.urgency !== 'unknown' && (
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider',
                        d.parsedJson.urgency === 'high'
                          ? 'border-red-500/40 bg-red-500/10 text-red-300'
                          : 'border-white/15 bg-white/5 text-white/60'
                      )}
                    >
                      {d.parsedJson.urgency}
                    </span>
                  )}
                </div>
                {d.subject && (
                  <p className="mt-0.5 truncate text-xs text-white/70">{d.subject}</p>
                )}
                <p className="text-xs text-white/40">
                  {d.fromEmail} · {formatDateTime(d.receivedAt)}
                </p>
                {d.parsedJson?.summary && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-white/60">
                    {d.parsedJson.summary}
                  </p>
                )}
                {d.statusReason && d.status === 'parse_failed' && (
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-red-300">
                    <AlertTriangle className="h-3 w-3" />
                    {d.statusReason}
                  </p>
                )}
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-white/30" />
            </button>
          </li>
        ))}
      </ul>

      {selectedId && (
        <Drawer
          draftId={selectedId}
          onClose={() => setSelectedId(null)}
          onActionDone={() => {
            mutate();
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
}

function Drawer({
  draftId,
  onClose,
  onActionDone,
}: {
  draftId: string;
  onClose: () => void;
  onActionDone: () => void;
}) {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<{ draft: DraftDetail }>(
    `/api/admin/inbox/${draftId}`,
    fetcher
  );
  const [submitting, setSubmitting] = useState<null | 'approve' | 'reject' | 'merge'>(
    null
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const draft = data?.draft;
  const parsed = draft?.parsedJson;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailVal, setEmailVal] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  // One-shot hydrate of editable fields when the draft loads. Keyed on
  // draftId so re-opening a different drawer resets the form correctly.
  useEffect(() => {
    if (!draft) return;
    setFirstName(parsed?.firstName ?? '');
    setLastName(parsed?.lastName ?? '');
    setEmailVal(draft.fromEmail);
    setPhone(parsed?.phone ?? '');
    setCountry('');
    setCompany(parsed?.companyOrBroker ?? '');
    setMessage(parsed?.summary ?? draft.subject ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, draft?.id]);

  async function approve() {
    if (submitting) return;
    setActionError(null);
    setSubmitting('approve');
    try {
      const res = await fetch(`/api/admin/inbox/${draftId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName || null,
          lastName: lastName || null,
          email: emailVal || null,
          phone: phone || null,
          country: country || null,
          company: company || null,
          message: message || null,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(result.error || `HTTP ${res.status}`);
        return;
      }
      router.push(`/admin/leads/${result.inquiryId}`);
    } catch (err) {
      console.error(err);
      setActionError('Network error.');
    } finally {
      setSubmitting(null);
    }
  }

  async function reject() {
    if (submitting) return;
    setActionError(null);
    setSubmitting('reject');
    try {
      const res = await fetch(`/api/admin/inbox/${draftId}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'staff_rejected' }),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        setActionError(result.error || `HTTP ${res.status}`);
        return;
      }
      onActionDone();
    } catch (err) {
      console.error(err);
      setActionError('Network error.');
    } finally {
      setSubmitting(null);
    }
  }

  async function merge() {
    if (submitting || !draft?.resultingInquiryId) return;
    setActionError(null);
    setSubmitting('merge');
    try {
      const res = await fetch(`/api/admin/inbox/${draftId}/merge`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryId: draft.resultingInquiryId,
          appendNote: true,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(result.error || `HTTP ${res.status}`);
        return;
      }
      router.push(`/admin/leads/${result.inquiryId}`);
    } catch (err) {
      console.error(err);
      setActionError('Network error.');
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      <div
        className="flex-1 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close drawer"
      />
      <aside className="flex w-full max-w-xl flex-col border-l border-white/10 bg-brand-navy text-white shadow-2xl sm:w-[36rem]">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {draft?.fromName || draft?.fromEmail || 'Loading…'}
            </p>
            <p className="truncate text-[11px] text-white/40">{draft?.subject}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:border-white/20 hover:text-white"
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading && <p className="text-sm text-white/60">Loading…</p>}
          {error && <p className="text-sm text-red-400">Failed to load draft.</p>}
          {draft && (
            <div className="space-y-5">
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  Parsed fields
                </p>
                {draft.status === 'parse_failed' && (
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-red-300">
                    <AlertTriangle className="h-3 w-3" />
                    Parse failed: {draft.statusReason}. Edit manually below.
                  </p>
                )}
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <Field label="First name" value={firstName} onChange={setFirstName} />
                  <Field label="Last name" value={lastName} onChange={setLastName} />
                  <Field label="Email" value={emailVal} onChange={setEmailVal} />
                  <Field label="Phone" value={phone} onChange={setPhone} />
                  <Field label="Country" value={country} onChange={setCountry} />
                  <Field label="Company / broker" value={company} onChange={setCompany} />
                </div>
                <div className="mt-2">
                  <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
                    Summary / context
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
                  />
                </div>
                {parsed?.vesselOfInterest && (
                  <p className="mt-2 text-[11px] text-white/50">
                    Vessel mentioned:{' '}
                    <span className="text-white/80">{parsed.vesselOfInterest}</span>
                  </p>
                )}
              </section>

              {draft.status === 'duplicate' && draft.resultingInquiryId && (
                <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs text-amber-200">
                  Cross-source dedup matched an existing lead.{' '}
                  <Link
                    href={`/admin/leads/${draft.resultingInquiryId}`}
                    className="underline"
                  >
                    View existing lead
                  </Link>
                  . Use “Merge” to attach this email as a note.
                </div>
              )}

              <section>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  Original email
                </p>
                {draft.bodyDeletedAt && (
                  <p className="mt-1 text-[11px] text-white/40">
                    Body deleted {formatDateTime(draft.bodyDeletedAt)} (PII retention).
                  </p>
                )}
                <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-[12px] leading-relaxed text-white/80">
                  {draft.rawTextBody || '(no plain-text body — try HTML view server-side)'}
                </pre>
              </section>
            </div>
          )}
        </div>

        <footer className="space-y-2 border-t border-white/10 px-5 py-3">
          {actionError && (
            <p className="text-xs text-red-300">{actionError}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={approve}
              disabled={!!submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting === 'approve' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Approve & create lead
            </button>
            {draft?.status === 'duplicate' && draft.resultingInquiryId && (
              <button
                type="button"
                onClick={merge}
                disabled={!!submitting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200 disabled:opacity-50"
              >
                {submitting === 'merge' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Link2 className="h-3.5 w-3.5" />
                )}
                Merge into existing
              </button>
            )}
            <button
              type="button"
              onClick={reject}
              disabled={!!submitting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:border-white/20 hover:text-white disabled:opacity-50"
            >
              {submitting === 'reject' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              Reject
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
      />
    </div>
  );
}
