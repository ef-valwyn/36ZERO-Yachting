'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Mail } from 'lucide-react';
import { Button, GlassCard } from '@36zero/ui';

const COOKIE_POPUP_SEEN = '36zero_premiere_seen';
const COOKIE_MINIMIZED_CLOSED = '36zero_premiere_minimized_closed';

function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export default function WorldPremierePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [wasReopenedFromMinimized, setWasReopenedFromMinimized] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if popup has been shown this session
    const hasSeenPopup = getCookie(COOKIE_POPUP_SEEN);
    const hasClosedMinimized = getCookie(COOKIE_MINIMIZED_CLOSED);
    
    if (!hasSeenPopup) {
      // Small delay before showing popup for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (!hasClosedMinimized) {
      // If popup was seen but minimized card wasn't closed, show minimized
      setIsMinimized(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    
    if (wasReopenedFromMinimized) {
      // User reopened from minimized and closed again - hide everything
      setIsMinimized(false);
      setCookie(COOKIE_POPUP_SEEN, 'true', 1);
      setCookie(COOKIE_MINIMIZED_CLOSED, 'true', 1);
    } else {
      // First time closing - show minimized card
      setIsMinimized(true);
      setCookie(COOKIE_POPUP_SEEN, 'true', 1);
    }
  };

  const handleCloseMinimized = () => {
    setIsMinimized(false);
    // Set cookie to not show minimized card again this session
    setCookie(COOKIE_MINIMIZED_CLOSED, 'true', 1);
  };

  const handleReopenFromMinimized = () => {
    setIsMinimized(false);
    setIsVisible(true);
    setWasReopenedFromMinimized(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Connect to email service (Resend, HubSpot, etc.)
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      
      // Close popup after success message
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-brand-navy/80 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-lg">
              <GlassCard variant="blue" padding="none" className="relative overflow-hidden">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Close popup"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue via-accent-teal to-brand-blue" />

                <div className="p-8 md:p-10">
                  {/* Header Section */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-gold/10 border border-accent-gold/30 mb-4"
                    >
                      <span className="text-xs font-semibold text-accent-gold uppercase tracking-wider">
                        World Premiere
                      </span>
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl md:text-3xl font-bold text-white mb-3"
                    >
                      Adventure Yachts AY60
                      <br />
                      <span className="text-gradient">World Premiere</span>
                    </motion.h2>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-center gap-2 text-brand-blue">
                        <Calendar className="w-4 h-4" />
                        <span className="font-semibold">22 to 24 April 2026</span>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 text-white/60">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">La Grande Motte International Multihull Show</span>
                      </div>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-white/70 text-sm mt-4 max-w-sm mx-auto"
                    >
                      Discover a new class of power catamaran at the world&apos;s premier multihull event
                    </motion.p>
                  </div>

                  {/* Form Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {!isSubmitted ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="popup-email" className="block text-sm font-medium text-white/80 mb-2">
                            Sign up for updates
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                              id="popup-email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter your email"
                              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40
                                       focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50
                                       transition-all"
                              required
                            />
                          </div>
                        </div>

                        {error && (
                          <p className="text-sm text-red-400">{error}</p>
                        )}

                        <Button
                          type="submit"
                          variant="primary"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <motion.div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              />
                              Subscribing...
                            </>
                          ) : (
                            'Get Updates'
                          )}
                        </Button>

                        <p className="text-xs text-white/40 text-center">
                          We respect your privacy. Unsubscribe at any time.
                        </p>
                      </form>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                      >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-teal/20 flex items-center justify-center">
                          <motion.svg
                            className="w-8 h-8 text-accent-teal"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </motion.svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">You&apos;re on the list!</h3>
                        <p className="text-white/60 text-sm">We&apos;ll keep you updated on the AY60 premiere.</p>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </>
      )}

      {/* Minimized Floating Card */}
      {isMinimized && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <div 
            className="relative bg-brand-navy/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden max-w-xs cursor-pointer hover:border-white/20 transition-colors"
            onClick={handleReopenFromMinimized}
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-blue to-accent-teal" />
            
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseMinimized();
              }}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5 text-white/60" />
            </button>

            <div className="p-4 pr-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-brand-blue" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white leading-tight">
                    Visit us at La Grande Motte
                  </p>
                  <p className="text-xs text-brand-blue font-semibold mt-0.5">
                    22 to 26 April 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
