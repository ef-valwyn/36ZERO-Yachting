'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Vote } from 'lucide-react';
import { Button, GlassCard } from '@36zero/ui';

const VOTE_URL = 'https://www.multihulls-world.com/164/the-multihulls/votes/votes';
const SESSION_DISMISSED_KEY = '36zero_moty_vote_dismissed';
const SESSION_STORAGE_EVENT = '36zero-moty-vote-storage';

function subscribe(onStoreChange: () => void) {
  const handleStorageChange = (event: Event) => {
    if (event instanceof StorageEvent && event.key && event.key !== SESSION_DISMISSED_KEY) {
      return;
    }

    onStoreChange();
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener(SESSION_STORAGE_EVENT, handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener(SESSION_STORAGE_EVENT, handleStorageChange);
  };
}

function getDismissedSnapshot() {
  return sessionStorage.getItem(SESSION_DISMISSED_KEY) === 'true';
}

function getServerSnapshot() {
  return true;
}

export default function MOTYVotePopup() {
  const pathname = usePathname();
  const isDismissed = useSyncExternalStore(subscribe, getDismissedSnapshot, getServerSnapshot);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDismiss = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true');
    window.dispatchEvent(new Event(SESSION_STORAGE_EVENT));
    setIsExpanded(false);
  };

  // Never render on the IMHS 2026 pages — the onboard registration form is
  // a QR-only landing page that must stay free of overlays.
  if (pathname?.startsWith('/imhs-2026')) {
    return null;
  }

  if (isDismissed) {
    return null;
  }

  return (
    <>
      {/* Minimized Floating Card - always visible, layered above World Premiere */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-32 right-6 z-50"
      >
        <div
          className="relative bg-brand-navy/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden max-w-xs cursor-pointer hover:border-white/20 transition-colors"
          onClick={() => setIsExpanded(true)}
        >
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute right-2 top-2 z-10 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Dismiss vote banner for this session"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-blue to-accent-teal" />

          <div className="p-4 pr-10">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center">
                <Vote className="w-4 h-4 text-accent-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-white leading-tight">
                  Vote for the AY60 in the MOTY 2026!
                </p>
                <p className="text-xs text-brand-blue font-semibold mt-0.5">
                  Click to learn more →
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expanded Popup */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-brand-navy/80 backdrop-blur-sm z-[60]"
              onClick={() => setIsExpanded(false)}
            />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="pointer-events-auto w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <GlassCard variant="blue" padding="none" className="relative overflow-hidden">
                  {/* Close Button */}
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Close popup"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>

                  {/* Decorative gradient */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue via-accent-teal to-brand-blue" />

                  <div className="p-8 md:p-10">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-gold/10 border border-accent-gold/30 mb-4">
                        <span className="text-xs font-semibold text-accent-gold uppercase tracking-wider">
                          Multihull of the Year 2026
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Vote for the AY60
                      </h2>

                      <p className="text-white/80 text-base leading-relaxed mb-6">
                        The AY60 has been nominated for Multihull of the Year 2026. Your vote helps!
                        Cast your vote in the <strong className="text-white">Power - Over 60&apos;</strong> category
                        at Multihulls World.
                      </p>

                      <Button
                        variant="primary"
                        asChild
                        className="w-full"
                      >
                        <a
                          href={VOTE_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Vote for the AY60
                        </a>
                      </Button>

                      <p className="text-xs text-white/40 mt-4">
                        <a
                          href={VOTE_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-blue hover:underline"
                        >
                          {VOTE_URL}
                        </a>
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
