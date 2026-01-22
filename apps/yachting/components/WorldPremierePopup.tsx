'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Mail, ChevronLeft, User, Phone, Globe, Building2 } from 'lucide-react';
import { Button, GlassCard } from '@36zero/ui';

const COOKIE_POPUP_SEEN = '36zero_premiere_seen';
const COOKIE_MINIMIZED_CLOSED = '36zero_premiere_minimized_closed';

// Country codes for phone input
const countryCodes = [
  { code: '+1', country: 'US/CA' },
  { code: '+44', country: 'UK' },
  { code: '+33', country: 'FR' },
  { code: '+34', country: 'ES' },
  { code: '+39', country: 'IT' },
  { code: '+49', country: 'DE' },
  { code: '+31', country: 'NL' },
  { code: '+61', country: 'AU' },
  { code: '+64', country: 'NZ' },
  { code: '+971', country: 'UAE' },
  { code: '+65', country: 'SG' },
  { code: '+852', country: 'HK' },
  { code: '+81', country: 'JP' },
  { code: '+86', country: 'CN' },
  { code: '+91', country: 'IN' },
  { code: '+27', country: 'ZA' },
  { code: '+55', country: 'BR' },
  { code: '+52', country: 'MX' },
  { code: '+41', country: 'CH' },
  { code: '+43', country: 'AT' },
  { code: '+32', country: 'BE' },
  { code: '+45', country: 'DK' },
  { code: '+46', country: 'SE' },
  { code: '+47', country: 'NO' },
  { code: '+358', country: 'FI' },
  { code: '+351', country: 'PT' },
  { code: '+30', country: 'GR' },
  { code: '+48', country: 'PL' },
  { code: '+420', country: 'CZ' },
  { code: '+36', country: 'HU' },
];

// Full list of countries
const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
  'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos',
  'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
  'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands',
  'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea',
  'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela',
  'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const interestOptions = [
  { value: 'individual', label: 'Individual' },
  { value: 'broker-dealer', label: 'Broker/Dealer' },
  { value: 'charter-operator', label: 'Charter Operator' },
  { value: 'other', label: 'Other (Please Specify)' },
];

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
  const [currentView, setCurrentView] = useState<'updates' | 'tour'>('updates');
  
  // Email signup form state
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tour request form state
  const [tourForm, setTourForm] = useState({
    fullName: '',
    email: '',
    countryCode: '+44',
    phone: '',
    country: '',
    interest: '',
    otherInterest: '',
    company: '',
  });
  const [tourSubmitting, setTourSubmitting] = useState(false);
  const [tourSubmitted, setTourSubmitted] = useState(false);
  const [tourError, setTourError] = useState<string | null>(null);

  useEffect(() => {
    const hasSeenPopup = getCookie(COOKIE_POPUP_SEEN);
    const hasClosedMinimized = getCookie(COOKIE_MINIMIZED_CLOSED);
    
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (!hasClosedMinimized) {
      setIsMinimized(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setCurrentView('updates');
    
    if (wasReopenedFromMinimized) {
      setIsMinimized(false);
      setCookie(COOKIE_POPUP_SEEN, 'true', 1);
      setCookie(COOKIE_MINIMIZED_CLOSED, 'true', 1);
    } else {
      setIsMinimized(true);
      setCookie(COOKIE_POPUP_SEEN, 'true', 1);
    }
  };

  const handleCloseMinimized = () => {
    setIsMinimized(false);
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTourError(null);

    // Validation
    if (!tourForm.fullName.trim()) {
      setTourError('Please enter your full name');
      return;
    }
    if (!tourForm.email || !tourForm.email.includes('@')) {
      setTourError('Please enter a valid email address');
      return;
    }
    if (!tourForm.phone.trim()) {
      setTourError('Please enter your phone number');
      return;
    }
    if (!tourForm.country) {
      setTourError('Please select your country of residence');
      return;
    }
    if (!tourForm.interest) {
      setTourError('Please select your interest');
      return;
    }
    if (tourForm.interest === 'other' && !tourForm.otherInterest.trim()) {
      setTourError('Please specify your interest');
      return;
    }

    setTourSubmitting(true);

    try {
      // TODO: Connect to CRM/email service
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTourSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch {
      setTourError('Something went wrong. Please try again.');
    } finally {
      setTourSubmitting(false);
    }
  };

  const inputClasses = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all";
  const selectClasses = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all appearance-none cursor-pointer";

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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto"
          >
            <div className="pointer-events-auto w-full max-w-lg my-8">
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

                {/* Content with sliding animation */}
                <div className="relative overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    {currentView === 'updates' ? (
                      <motion.div
                        key="updates"
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="p-8 md:p-10"
                      >
                        {/* Header Section */}
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-gold/10 border border-accent-gold/30 mb-4">
                            <span className="text-xs font-semibold text-accent-gold uppercase tracking-wider">
                              World Premiere
                            </span>
                          </div>

                          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                            Adventure Yachts AY60
                            <br />
                            <span className="text-gradient">World Premiere</span>
                          </h2>

                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 text-brand-blue">
                              <Calendar className="w-4 h-4" />
                              <span className="font-semibold">22 to 24 April 2026</span>
                            </div>
                            
                            <div className="flex items-center justify-center gap-2 text-white/60">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">La Grande Motte International Multihull Show</span>
                            </div>
                          </div>

                          <p className="text-white/70 text-sm mt-4 max-w-sm mx-auto">
                            Discover a new class of power catamaran at the world&apos;s premier multihull event
                          </p>
                        </div>

                        {/* Tour Request Link */}
                        <button
                          onClick={() => setCurrentView('tour')}
                          className="w-full mb-6 p-4 rounded-xl bg-accent-gold/10 border border-accent-gold/30 hover:bg-accent-gold/20 transition-colors text-left group"
                        >
                          <p className="text-sm font-medium text-accent-gold">
                            Visiting the show? Request a tour of the AY60 Sport →
                          </p>
                        </button>

                        {/* Form Section */}
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
                                           focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all"
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
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </motion.svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">You&apos;re on the list!</h3>
                            <p className="text-white/60 text-sm">We&apos;ll keep you updated on the AY60 premiere.</p>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="tour"
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="p-6 md:p-8"
                      >
                        {/* Back Button */}
                        <button
                          onClick={() => setCurrentView('updates')}
                          className="flex items-center gap-1 text-white/60 hover:text-white transition-colors mb-4 text-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Back
                        </button>

                        {/* Tour Form Header */}
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-white mb-2">
                            Request a Tour
                          </h3>
                          <p className="text-white/60 text-sm">
                            Meet us at La Grande Motte and experience the AY60 Sport firsthand
                          </p>
                        </div>

                        {/* Tour Form */}
                        {!tourSubmitted ? (
                          <form onSubmit={handleTourSubmit} className="space-y-4">
                            {/* Full Name */}
                            <div>
                              <label className="block text-xs font-medium text-white/60 mb-1.5">
                                Full Name <span className="text-red-400">*</span>
                              </label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                  type="text"
                                  value={tourForm.fullName}
                                  onChange={(e) => setTourForm({ ...tourForm, fullName: e.target.value })}
                                  placeholder="John Smith"
                                  className={`${inputClasses} pl-10`}
                                  required
                                />
                              </div>
                            </div>

                            {/* Email */}
                            <div>
                              <label className="block text-xs font-medium text-white/60 mb-1.5">
                                Email <span className="text-red-400">*</span>
                              </label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                  type="email"
                                  value={tourForm.email}
                                  onChange={(e) => setTourForm({ ...tourForm, email: e.target.value })}
                                  placeholder="john@example.com"
                                  className={`${inputClasses} pl-10`}
                                  required
                                />
                              </div>
                            </div>

                            {/* Phone with Country Code */}
                            <div>
                              <label className="block text-xs font-medium text-white/60 mb-1.5">
                                Phone <span className="text-red-400">*</span>
                              </label>
                              <div className="flex gap-2">
                                <div className="relative w-28">
                                  <select
                                    value={tourForm.countryCode}
                                    onChange={(e) => setTourForm({ ...tourForm, countryCode: e.target.value })}
                                    className={selectClasses}
                                  >
                                    {countryCodes.map((cc) => (
                                      <option key={cc.code} value={cc.code} className="bg-brand-navy">
                                        {cc.code} {cc.country}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="relative flex-1">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                  <input
                                    type="tel"
                                    value={tourForm.phone}
                                    onChange={(e) => setTourForm({ ...tourForm, phone: e.target.value })}
                                    placeholder="123 456 7890"
                                    className={`${inputClasses} pl-10`}
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Country of Residence */}
                            <div>
                              <label className="block text-xs font-medium text-white/60 mb-1.5">
                                Country of Residence <span className="text-red-400">*</span>
                              </label>
                              <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                                <select
                                  value={tourForm.country}
                                  onChange={(e) => setTourForm({ ...tourForm, country: e.target.value })}
                                  className={`${selectClasses} pl-10`}
                                  required
                                >
                                  <option value="" className="bg-brand-navy">Select country...</option>
                                  {countries.map((country) => (
                                    <option key={country} value={country} className="bg-brand-navy">
                                      {country}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Interest */}
                            <div>
                              <label className="block text-xs font-medium text-white/60 mb-1.5">
                                Interest <span className="text-red-400">*</span>
                              </label>
                              <select
                                value={tourForm.interest}
                                onChange={(e) => setTourForm({ ...tourForm, interest: e.target.value, otherInterest: '' })}
                                className={selectClasses}
                                required
                              >
                                <option value="" className="bg-brand-navy">Select your interest...</option>
                                {interestOptions.map((option) => (
                                  <option key={option.value} value={option.value} className="bg-brand-navy">
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Other Interest (conditional) */}
                            {tourForm.interest === 'other' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <label className="block text-xs font-medium text-white/60 mb-1.5">
                                  Please Specify <span className="text-red-400">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={tourForm.otherInterest}
                                  onChange={(e) => setTourForm({ ...tourForm, otherInterest: e.target.value.slice(0, 32) })}
                                  placeholder="Your interest..."
                                  maxLength={32}
                                  className={inputClasses}
                                  required
                                />
                                <p className="text-xs text-white/40 mt-1 text-right">
                                  {tourForm.otherInterest.length}/32
                                </p>
                              </motion.div>
                            )}

                            {/* Company (optional) */}
                            <div>
                              <label className="block text-xs font-medium text-white/60 mb-1.5">
                                Company <span className="text-white/30">(optional)</span>
                              </label>
                              <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                  type="text"
                                  value={tourForm.company}
                                  onChange={(e) => setTourForm({ ...tourForm, company: e.target.value })}
                                  placeholder="Company name"
                                  className={`${inputClasses} pl-10`}
                                />
                              </div>
                            </div>

                            {tourError && (
                              <p className="text-sm text-red-400">{tourError}</p>
                            )}

                            <Button
                              type="submit"
                              variant="primary"
                              className="w-full"
                              disabled={tourSubmitting}
                            >
                              {tourSubmitting ? (
                                <>
                                  <motion.div
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  />
                                  Submitting...
                                </>
                              ) : (
                                'Request Tour'
                              )}
                            </Button>

                            <p className="text-xs text-white/40 text-center leading-relaxed">
                              By submitting this request you consent to receiving communications from 36ZERO Yachting. We will never share your personal data without consent.
                            </p>
                          </form>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                          >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-teal/20 flex items-center justify-center">
                              <motion.svg
                                className="w-8 h-8 text-accent-teal"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </motion.svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Tour Requested!</h3>
                            <p className="text-white/60 text-sm">We&apos;ll be in touch shortly to confirm your visit.</p>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
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
