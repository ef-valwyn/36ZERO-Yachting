'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@36zero/ui';
import { Loader2 } from 'lucide-react';
import { LEAD_SOURCES, leadSourceLabel } from '@/lib/leads/sources';

const baseInput =
  'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SOURCES_FOR_GENERIC: ReadonlyArray<(typeof LEAD_SOURCES)[number]> = [
  'inbound_email',
  'referral',
  'direct_outreach',
  'boat_show_other',
  'vessel_enquiry',
  'contact_form',
  'manual_admin_entry',
  'website',
  'imhs_2026',
];

/**
 * Generic single-lead admin form. Distinct from ManualLeadForm (which is
 * the IMHS bulk paper-entry tool). Use this for one-off leads coming in via
 * email, referral, direct outreach, etc.
 */
export default function AddLeadForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [source, setSource] = useState<string>('inbound_email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [markContacted, setMarkContacted] = useState(false);

  const valid = !!name.trim() && EMAIL_REGEX.test(email.trim()) && !!source;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/leads/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          country: country.trim() || null,
          company: company.trim() || null,
          message: message.trim() || null,
          initialLifecycleStage: markContacted ? 'contacted' : 'new',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}`);
        return;
      }

      router.push(`/admin/leads/${data.inquiryId}`);
    } catch (err) {
      console.error('[AddLeadForm] submit failed:', err);
      setError('Network error, please retry.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
          Source
        </label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className={cn(baseInput, 'py-2.5')}
        >
          {SOURCES_FOR_GENERIC.map((s) => (
            <option key={s} value={s}>
              {leadSourceLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
            Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            autoComplete="off"
            className={baseInput}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 7700 900000"
            className={baseInput}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
            Country
          </label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="United Kingdom"
            className={baseInput}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
            Company / broker
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Optional"
            className={baseInput}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">
            Message / context
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="What did they ask about? Which vessel? Any next steps?"
            className={cn(baseInput, 'resize-y')}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={markContacted}
          onChange={(e) => setMarkContacted(e.target.checked)}
          className="h-4 w-4"
        />
        Mark as already contacted
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!valid || submitting}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition',
            (!valid || submitting) && 'cursor-not-allowed opacity-50'
          )}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Save lead
        </button>
      </div>
    </form>
  );
}
