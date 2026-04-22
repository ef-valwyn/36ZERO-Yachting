'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn, countryEntriesOnboard } from '@36zero/ui';
import { Plus, Trash2, Check, Loader2 } from 'lucide-react';

const NAME_REGEX = /^[\p{L}\p{M} .'\-]{2,100}$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const baseInput =
  'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors';

interface Row {
  id: string;
  fullName: string;
  email: string;
  country: string; // canonical English
  interestAdventureYachts: boolean;
  interestShift: boolean;
}

type RowStatus = 'created' | 'updated' | 'conflict' | 'error';
interface RowResult {
  index: number;
  status: RowStatus;
  inquiryId?: string;
  message?: string;
}

function newRow(): Row {
  return {
    id: Math.random().toString(36).slice(2),
    fullName: '',
    email: '',
    country: '',
    interestAdventureYachts: false,
    interestShift: false,
  };
}

function fold(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

interface CountryComboProps {
  value: string;
  onChange: (v: string) => void;
  invalid: boolean;
  id: string;
}

function CountryCombo({ value, onChange, invalid, id }: CountryComboProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const rows = useMemo(
    () =>
      countryEntriesOnboard
        .map((e) => e.en)
        .sort((a, b) => a.localeCompare(b)),
    []
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = fold(query);
    return rows.filter((r) => fold(r).includes(q));
  }, [rows, query]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <input
        id={id}
        type="text"
        value={open ? query : value}
        onFocus={() => {
          setOpen(true);
          setQuery('');
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder="Country"
        autoComplete="off"
        className={cn(baseInput, invalid && 'border-red-500')}
      />
      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-white/10 bg-brand-navy/95 shadow-2xl backdrop-blur"
        >
          {filtered.slice(0, 80).map((r) => (
            <li
              key={r}
              role="option"
              aria-selected={value === r}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(r);
                setOpen(false);
                setQuery('');
              }}
              className={cn(
                'cursor-pointer px-3 py-2 text-sm text-white/90 hover:bg-white/10 active:bg-white/15',
                value === r && 'bg-white/5'
              )}
            >
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function rowValid(r: Row): boolean {
  const name = r.fullName.trim();
  if (!name || !NAME_REGEX.test(name)) return false;
  if (!EMAIL_REGEX.test(r.email.trim())) return false;
  if (!r.country || !countryEntriesOnboard.some((e) => e.en === r.country)) {
    return false;
  }
  if (!r.interestAdventureYachts && !r.interestShift) return false;
  return true;
}

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export default function ManualLeadForm() {
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<Record<number, RowResult>>({});
  const [topError, setTopError] = useState<string | null>(null);

  const allValid = rows.every(rowValid);

  function updateRow(idx: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()]);
  }

  function removeRow(idx: number) {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
    setResults((prev) => {
      const next: Record<number, RowResult> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const n = Number(k);
        if (n === idx) return;
        next[n < idx ? n : n - 1] = v;
      });
      return next;
    });
  }

  async function onSubmit() {
    setTopError(null);
    setSubmitting(true);
    setResults({});

    try {
      const payload = {
        leads: rows.map((r) => {
          const { firstName, lastName } = splitName(r.fullName);
          return {
            email: r.email.trim().toLowerCase(),
            firstName,
            lastName,
            country: r.country,
            interestAdventureYachts: r.interestAdventureYachts,
            interestShift: r.interestShift,
          };
        }),
      };

      const res = await fetch('/api/admin/leads/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setTopError(body.error || `HTTP ${res.status}`);
        return;
      }

      const data = (await res.json()) as { results: RowResult[] };
      const byIndex: Record<number, RowResult> = {};
      data.results.forEach((r) => {
        byIndex[r.index] = r;
      });
      setResults(byIndex);

      // Drop rows that succeeded; keep conflicts/errors for editing.
      const keep: Array<{ row: Row; oldIdx: number }> = [];
      rows.forEach((row, i) => {
        const r = byIndex[i];
        if (r && (r.status === 'created' || r.status === 'updated')) return;
        keep.push({ row, oldIdx: i });
      });
      if (keep.length === 0) {
        setRows([newRow()]);
        // Re-index results display onto the empty set → clear it
        setResults({});
      } else if (keep.length !== rows.length) {
        const remapped: Record<number, RowResult> = {};
        keep.forEach(({ oldIdx }, newIdx) => {
          const r = byIndex[oldIdx];
          if (r) remapped[newIdx] = r;
        });
        setRows(keep.map((k) => k.row));
        setResults(remapped);
      }
    } catch (err) {
      console.error(err);
      setTopError('Network error, please retry.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {topError && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {topError}
        </div>
      )}

      <ul className="space-y-3">
        {rows.map((row, idx) => {
          const result = results[idx];
          return (
            <li
              key={row.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-wider text-white/40">
                  Lead {idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  {result && <ResultChip result={result} />}
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/60 hover:border-white/20 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={row.fullName}
                    onChange={(e) => updateRow(idx, { fullName: e.target.value })}
                    placeholder="Jane Smith"
                    className={baseInput}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
                    Email
                  </label>
                  <input
                    type="email"
                    value={row.email}
                    onChange={(e) => updateRow(idx, { email: e.target.value })}
                    placeholder="jane@example.com"
                    autoComplete="off"
                    className={baseInput}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
                    Country
                  </label>
                  <CountryCombo
                    id={`country-${row.id}`}
                    value={row.country}
                    onChange={(v) => updateRow(idx, { country: v })}
                    invalid={false}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
                    Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <InterestToggle
                      label="Adventure Yachts"
                      selected={row.interestAdventureYachts}
                      onToggle={() =>
                        updateRow(idx, {
                          interestAdventureYachts: !row.interestAdventureYachts,
                        })
                      }
                    />
                    <InterestToggle
                      label="Shift Yachts"
                      selected={row.interestShift}
                      onToggle={() =>
                        updateRow(idx, { interestShift: !row.interestShift })
                      }
                    />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 hover:border-white/20 hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Add another
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!allValid || submitting}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition',
            (!allValid || submitting) && 'cursor-not-allowed opacity-50'
          )}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Save {rows.length === 1 ? 'lead' : `${rows.length} leads`}
        </button>
      </div>
    </div>
  );
}

function InterestToggle({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
        selected
          ? 'border-brand-blue bg-brand-blue text-white'
          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white'
      )}
    >
      {selected && <Check className="h-3 w-3" />}
      {label}
    </button>
  );
}

function ResultChip({ result }: { result: RowResult }) {
  const map: Record<RowStatus, { label: string; cls: string }> = {
    created: {
      label: 'Created',
      cls: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
    },
    updated: {
      label: 'Updated',
      cls: 'border-brand-blue/40 bg-brand-blue/10 text-brand-blue',
    },
    conflict: {
      label: 'Already registered',
      cls: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
    },
    error: {
      label: result.message || 'Error',
      cls: 'border-red-500/40 bg-red-500/10 text-red-300',
    },
  };
  const v = map[result.status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]',
        v.cls
      )}
    >
      {v.label}
    </span>
  );
}
