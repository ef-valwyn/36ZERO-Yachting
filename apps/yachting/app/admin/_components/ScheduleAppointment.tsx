'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarPlus, X } from 'lucide-react';
import { Button } from '@36zero/ui';

interface ScheduleAppointmentProps {
  inquiryId: string;
  onBooked?: () => void; // caller uses SWR mutate to refresh
}

interface AppointmentLinkResp {
  calLink: string;
  prefill: {
    name: string;
    email: string;
    metadata: { inquiryId: string };
  };
}

export default function ScheduleAppointment({
  inquiryId,
  onBooked,
}: ScheduleAppointmentProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<AppointmentLinkResp | null>(null);
  const [calApiReady, setCalApiReady] = useState(false);
  const [calError, setCalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setCalError(null);
    setData(null);
    fetch(`/api/admin/leads/${inquiryId}/appointment-link`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setCalError(err?.message ?? 'Failed to load scheduler');
      });
    return () => {
      cancelled = true;
    };
  }, [inquiryId, open]);

  // Dynamically load the Cal.com embed JS only when the modal opens.
  useEffect(() => {
    if (!open || !data?.calLink) return;
    let cancelled = false;
    import('@calcom/embed-react')
      .then((mod) => {
        if (cancelled) return;
        mod.getCalApi({ namespace: 'imhs-private-showing' }).then((cal) => {
          if (cancelled) return;
          try {
            cal('ui', {
              theme: 'dark',
              styles: { branding: { brandColor: '#2f97dd' } },
              hideEventTypeDetails: false,
              layout: 'month_view',
            });
            cal('on', {
              action: 'bookingSuccessful',
              callback: () => {
                onBooked?.();
              },
            });
          } catch (err) {
            console.error('[ScheduleAppointment] cal() config failed:', err);
          }
          setCalApiReady(true);
        });
      })
      .catch((err) => {
        if (!cancelled) setCalError(err?.message ?? 'Cal.com embed failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, [open, data?.calLink, onBooked]);

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={() => setOpen(true)}
        leftIcon={<CalendarPlus className="h-4 w-4" />}
      >
        Schedule private showing
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="modal"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92vh] w-full max-w-4xl flex-col rounded-t-2xl border border-white/10 bg-brand-navy shadow-2xl sm:inset-4 sm:rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <div>
                  <h2 className="text-sm font-semibold">Schedule private showing</h2>
                  <p className="text-[11px] text-white/50">
                    {data?.prefill?.name ? `${data.prefill.name} · ` : ''}
                    Cal.com will send the confirmation email.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-full p-1.5 text-white/60 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-2 sm:p-4">
                {calError && (
                  <p className="p-4 text-sm text-red-400">
                    {calError}
                  </p>
                )}
                {!data && !calError && (
                  <p className="p-4 text-sm text-white/60">Loading scheduler…</p>
                )}
                {data && !data.calLink && (
                  <p className="p-4 text-sm text-white/60">
                    Cal.com event link not configured. Set{' '}
                    <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_CALCOM_EVENT_LINK</code>{' '}
                    on the environment.
                  </p>
                )}
                {data?.calLink && (
                  <CalEmbed
                    calLink={data.calLink}
                    prefill={data.prefill}
                    ready={calApiReady}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Lazy-imported Cal component wrapper. Keeps the @calcom/embed-react import
// out of the initial page bundle.
function CalEmbed({
  calLink,
  prefill,
  ready,
}: {
  calLink: string;
  prefill: AppointmentLinkResp['prefill'];
  ready: boolean;
}) {
  const [Cal, setCal] = useState<null | React.ComponentType<any>>(null);

  useEffect(() => {
    let cancelled = false;
    import('@calcom/embed-react').then((mod) => {
      if (!cancelled) setCal(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Cal || !ready) {
    return <p className="p-4 text-sm text-white/60">Loading scheduler…</p>;
  }

  return (
    <Cal
      namespace="imhs-private-showing"
      calLink={calLink}
      style={{ width: '100%', height: '100%', minHeight: 560 }}
      config={{
        name: prefill.name,
        email: prefill.email,
        metadata: prefill.metadata,
        theme: 'dark',
      }}
    />
  );
}
