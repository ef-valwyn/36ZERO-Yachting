'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { cn } from '@36zero/ui';
import {
  ExternalLink,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';

interface PipelineStage {
  id: string;
  label: string;
  displayOrder: number;
  probability: number;
}

interface Pipeline {
  id: string;
  label: string;
  stages: PipelineStage[];
}

interface DealSummary {
  id: string;
  dealName: string | null;
  pipeline: string | null;
  dealStage: string | null;
  amount: number | null;
  closeDate: string | null;
  ownerId: string | null;
  lastActivityAt: string | null;
}

type DealResponse =
  | {
      hasDeal: false;
      hasHubspotContact: boolean;
      pipelines: Pipeline[];
    }
  | { hasDeal: true; deal: DealSummary; dealUrl: string | null }
  | { hasDeal: true; deleted: true; dealId: string }
  | { hasDeal: true; error: string; dealId: string };

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' });
  // 503 (HubSpot reachability) returns a JSON body too — surface it to the UI.
  const json = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 503) throw new Error(`HTTP ${res.status}`);
  return { ...json, _httpStatus: res.status };
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatAmount(amount: number | null): string {
  if (amount == null) return '—';
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export default function HubSpotDealPanel({
  inquiryId,
  isAdmin,
}: {
  inquiryId: string;
  isAdmin: boolean;
}) {
  const { data, error, isLoading, mutate } = useSWR<DealResponse & { _httpStatus: number }>(
    `/api/admin/leads/${inquiryId}/deal`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const [convertOpen, setConvertOpen] = useState(false);
  const [pipelinesForConvert, setPipelinesForConvert] = useState<Pipeline[]>([]);

  if (isLoading || !data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading deal…
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-300">
        Failed to load deal panel.
      </div>
    );
  }

  // Not converted yet.
  if ('hasDeal' in data && data.hasDeal === false) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
              HubSpot deal
            </p>
            <p className="mt-1 text-sm text-white/70">
              Not converted yet. Promote this lead to a HubSpot deal once they’re
              qualified.
            </p>
            {!data.hasHubspotContact && (
              <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                No HubSpot contact yet — add a note or rating first to trigger sync.
              </p>
            )}
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setPipelinesForConvert(data.pipelines);
                setConvertOpen(true);
              }}
              disabled={!data.hasHubspotContact}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white',
                !data.hasHubspotContact && 'cursor-not-allowed opacity-50'
              )}
            >
              <Plus className="h-3 w-3" />
              Convert to deal
            </button>
          )}
          {!isAdmin && (
            <span className="text-[11px] text-white/40">Admin role required</span>
          )}
        </div>
        {convertOpen && (
          <ConvertModal
            inquiryId={inquiryId}
            pipelines={pipelinesForConvert}
            onClose={() => setConvertOpen(false)}
            onSuccess={() => {
              setConvertOpen(false);
              mutate();
            }}
          />
        )}
      </div>
    );
  }

  // Converted but HubSpot deleted the deal.
  if ('deleted' in data && data.deleted) {
    return (
      <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200">
          HubSpot deal
        </p>
        <p className="mt-1 text-sm text-amber-100">
          The linked deal ({data.dealId}) was removed in HubSpot.
        </p>
        <ClearAssociationButton inquiryId={inquiryId} onCleared={() => mutate()} />
      </div>
    );
  }

  // 503 or unexpected error from HubSpot.
  if ('error' in data && data.error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-200">
          HubSpot deal
        </p>
        <p className="mt-1 text-sm text-red-100">
          Linked to deal {data.dealId} but HubSpot returned an error: {data.error}.
        </p>
        <button
          type="button"
          onClick={() => mutate()}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      </div>
    );
  }

  // Deal exists and we got a summary.
  if ('deal' in data) {
    const deal = data.deal;
    return (
      <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
              HubSpot deal
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-white/90">
              <Briefcase className="mr-1 inline h-3.5 w-3.5 text-emerald-300" />
              {deal.dealName ?? 'Untitled deal'}
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/70">
              <dt className="text-white/50">Stage</dt>
              <dd>{deal.dealStage ?? '—'}</dd>
              <dt className="text-white/50">Amount</dt>
              <dd>{formatAmount(deal.amount)}</dd>
              <dt className="text-white/50">Close date</dt>
              <dd>{formatDate(deal.closeDate)}</dd>
              <dt className="text-white/50">Last activity</dt>
              <dd>{formatDate(deal.lastActivityAt)}</dd>
            </dl>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {data.dealUrl && (
              <a
                href={data.dealUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:border-white/20 hover:text-white"
              >
                <ExternalLink className="h-3 w-3" />
                Open in HubSpot
              </a>
            )}
            <button
              type="button"
              onClick={() => mutate()}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-white"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function ClearAssociationButton({
  inquiryId,
  onCleared,
}: {
  inquiryId: string;
  onCleared: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  async function clear() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/leads/${inquiryId}/deal`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) onCleared();
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <button
      type="button"
      onClick={clear}
      disabled={submitting}
      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-200"
    >
      {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
      Clear association
    </button>
  );
}

function ConvertModal({
  inquiryId,
  pipelines,
  onClose,
  onSuccess,
}: {
  inquiryId: string;
  pipelines: Pipeline[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const defaultPipeline = pipelines[0] ?? { id: 'default', label: 'Default', stages: [] };
  const [pipelineId, setPipelineId] = useState(defaultPipeline.id);
  const activePipeline =
    pipelines.find((p) => p.id === pipelineId) ?? defaultPipeline;
  const [stageId, setStageId] = useState(activePipeline.stages[0]?.id ?? '');
  const [dealName, setDealName] = useState('');
  const [amount, setAmount] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (submitting) return;
    setError(null);
    if (!stageId) {
      setError('Pick a stage');
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        stage: stageId,
        pipeline: pipelineId,
      };
      if (dealName.trim()) body.dealName = dealName.trim();
      if (amount.trim()) {
        const n = Number.parseFloat(amount);
        if (!Number.isFinite(n) || n < 0) {
          setError('Amount must be a non-negative number');
          setSubmitting(false);
          return;
        }
        body.amount = n;
      }
      if (closeDate) body.closeDate = closeDate;

      const res = await fetch(`/api/admin/leads/${inquiryId}/convert-to-deal`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(result.message || result.error || `HTTP ${res.status}`);
        return;
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-brand-navy p-5 text-white shadow-2xl">
        <h2 className="text-lg font-semibold">Convert to HubSpot deal</h2>
        <p className="mt-1 text-xs text-white/60">
          Creates a new deal in HubSpot, associated to this lead’s contact.
        </p>

        {error && (
          <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {pipelines.length > 1 && (
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
                Pipeline
              </label>
              <select
                value={pipelineId}
                onChange={(e) => {
                  const next = e.target.value;
                  setPipelineId(next);
                  const p = pipelines.find((x) => x.id === next);
                  setStageId(p?.stages[0]?.id ?? '');
                }}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
              >
                {pipelines.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
              Stage
            </label>
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            >
              {activePipeline.stages.length === 0 && (
                <option value="">(no stages found)</option>
              )}
              {activePipeline.stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} {s.probability ? `(${Math.round(s.probability * 100)}%)` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
              Deal name
            </label>
            <input
              type="text"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              placeholder="Auto-generated from lead name + vessel if blank"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
                Amount (USD)
              </label>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
                Close date
              </label>
              <input
                type="date"
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Create deal
          </button>
        </div>
      </div>
    </div>
  );
}
