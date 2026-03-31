'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Mail,
  User,
  Phone,
  Globe,
  Building2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Ship,
  Anchor,
} from 'lucide-react';
import { Button, GlassCard, countryCodes, countries } from '@36zero/ui';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import { useUser, useSignIn, useSignUp } from '@clerk/nextjs';

const BLOB_BASE = 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one';

const SHOW_START = new Date('2026-04-22T14:00:00+02:00');

const interestOptions = [
  { value: 'individual', label: 'Individual' },
  { value: 'broker-dealer', label: 'Broker/Dealer' },
  { value: 'charter-operator', label: 'Charter Operator' },
  { value: 'other', label: 'Other (Please Specify)' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false });

  useEffect(() => {
    function calc() {
      const now = Date.now();
      const diff = target.getTime() - now;
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isLive: false,
      };
    }
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

export default function IMHSPage() {
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

  const countdown = useCountdown(SHOW_START);

  // Tour request form state
  const [tourForm, setTourForm] = useState({
    fullName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    country: '',
    interest: '',
    otherInterest: '',
    company: '',
  });
  const [tourSubmitting, setTourSubmitting] = useState(false);
  const [tourStatus, setTourStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [tourError, setTourError] = useState('');
  const [tourTouched, setTourTouched] = useState(false);

  // Email signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [signupStatus, setSignupStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Auth state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Anti-bot
  const [honeypot, setHoneypot] = useState('');
  const [loadTime, setLoadTime] = useState(Date.now());

  useEffect(() => {
    setLoadTime(Date.now());
  }, []);

  // Prefill from Clerk
  useEffect(() => {
    if (isUserLoaded && isSignedIn && user) {
      setTourForm(prev => ({
        ...prev,
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.primaryEmailAddress?.emailAddress || '',
      }));
      setSignupEmail(user.primaryEmailAddress?.emailAddress || '');
    }
  }, [isUserLoaded, isSignedIn, user]);

  const handleGoogleAuth = async () => {
    if (!isSignInLoaded || !isSignUpLoaded) return;
    setIsGoogleLoading(true);
    setAuthError(null);
    try {
      await signIn?.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/imhs-2026',
      });
    } catch {
      try {
        await signUp?.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/sso-callback',
          redirectUrlComplete: '/imhs-2026',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to authenticate with Google';
        setAuthError(msg);
        setIsGoogleLoading(false);
      }
    }
  };

  const isTourFieldInvalid = (field: string) => {
    if (!tourTouched) return false;
    switch (field) {
      case 'fullName': return !tourForm.fullName.trim();
      case 'email': return !tourForm.email || !tourForm.email.includes('@');
      case 'phone': return !tourForm.phone.trim();
      case 'country': return !tourForm.country;
      case 'interest': return !tourForm.interest;
      default: return false;
    }
  };

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTourTouched(true);
    setTourError('');

    if (honeypot) { setTourStatus('success'); return; }
    if (Date.now() - loadTime < 3000) { setTourStatus('success'); return; }

    const hasErrors =
      !tourForm.fullName.trim() ||
      !tourForm.email ||
      !tourForm.email.includes('@') ||
      !tourForm.phone.trim() ||
      !tourForm.country ||
      !tourForm.interest;

    if (hasErrors) {
      setTourError('Please complete all required fields.');
      return;
    }

    setTourSubmitting(true);

    try {
      const nameParts = tourForm.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const interestLabel =
        tourForm.interest === 'other'
          ? `Other: ${tourForm.otherInterest}`
          : interestOptions.find(o => o.value === tourForm.interest)?.label || tourForm.interest;

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: tourForm.email,
          firstName,
          lastName,
          phone: `${tourForm.countryCode} ${tourForm.phone}`,
          countryCode: tourForm.countryCode,
          country: tourForm.country,
          company: tourForm.company || undefined,
          interest: interestLabel,
          leadSource: 'imhs_tour_request',
        }),
      });

      if (response.ok) {
        setTourStatus('success');
      } else {
        const data = await response.json();
        setTourStatus('error');
        setTourError(data.error || 'Failed to submit. Please try again.');
      }
    } catch {
      setTourStatus('error');
      setTourError('Network error. Please try again.');
    } finally {
      setTourSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupEmail.includes('@')) return;

    setSignupSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          leadSource: 'imhs_updates',
        }),
      });

      if (response.ok) {
        setSignupStatus('success');
      } else {
        setSignupStatus('error');
      }
    } catch {
      setSignupStatus('error');
    } finally {
      setSignupSubmitting(false);
    }
  };

  const inputClasses =
    'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors';

  return (
    <main className="min-h-screen bg-brand-navy">
      <Header variant="solid" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={`${BLOB_BASE}/hero-landing.png`}
            alt="AY60 Power Catamaran"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/80 via-brand-navy/60 to-brand-navy" />
        </div>

        <motion.div
          className="max-w-5xl mx-auto relative text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={itemVariants}
            className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-4"
          >
            April 22-26, 2026 &middot; La Grande Motte, France
          </motion.p>
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold uppercase tracking-tighter text-white mb-6"
          >
            International Multihull{' '}
            <span className="text-gradient">Show 2026</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-white/70 font-light max-w-3xl mx-auto mb-8"
          >
            Visit Adventure Yachts &amp; 36ZERO Yachting at the world&apos;s premier multihull event.
            See the AY60 power catamaran and meet our team.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}>
              Register for a Viewing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => document.getElementById('visit')?.scrollIntoView({ behavior: 'smooth' })}>
              Visit Adventure One
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Countdown Timer */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {countdown.isLive ? (
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tighter text-white mb-4">
                  The Show Is <span className="text-gradient">Live!</span>
                </h2>
                <p className="text-lg text-white/70 font-light">
                  Visit us at the International Multihull Show in La Grande Motte.
                </p>
              </div>
            ) : (
              <>
                <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-8">
                  Countdown to Opening
                </p>
                <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-xl mx-auto">
                  {[
                    { value: countdown.days, label: 'Days' },
                    { value: countdown.hours, label: 'Hours' },
                    { value: countdown.minutes, label: 'Minutes' },
                    { value: countdown.seconds, label: 'Seconds' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6"
                    >
                      <div className="text-3xl sm:text-5xl font-extrabold text-white tabular-nums">
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <div className="text-xs sm:text-sm text-white/50 uppercase tracking-wider mt-1">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Event Info Cards */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: Calendar, title: 'Dates', text: 'April 22-26, 2026' },
              { icon: MapPin, title: 'Location', text: 'La Grande Motte, France' },
              { icon: Ship, title: 'Featured Vessel', text: 'AY60 Power Catamaran' },
              { icon: Anchor, title: 'Exhibitors', text: 'Adventure Yachts & 36ZERO Yachting' },
            ].map((card) => (
              <motion.div key={card.title} variants={itemVariants}>
                <GlassCard padding="md" className="text-center h-full">
                  <card.icon className="w-8 h-8 text-brand-blue mx-auto mb-3" />
                  <h3 className="text-sm text-white/50 uppercase tracking-wider mb-1">{card.title}</h3>
                  <p className="text-white font-medium">{card.text}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About the AY60 */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 gap-8 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src={`${BLOB_BASE}/real-DJI_20260226162622_0007_D.jpg`}
                alt="AY60 Aerial - Starboard Cruising"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-3">
                World Premiere
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tighter text-white mb-4">
                The AY60 Power{' '}
                <span className="text-gradient">Catamaran</span>
              </h2>
              <p className="text-white/70 font-light mb-4">
                The AY60 is a revolutionary 60-foot power catamaran designed for long-range ocean cruising.
                With lightweight carbon/eGlass composite construction at just 18,500 kg displacement,
                it delivers exceptional performance with a range of over 2,000 nautical miles.
              </p>
              <p className="text-white/70 font-light mb-6">
                Accommodating 8-10 guests across 4+2 cabins, the AY60 combines
                blue-water capability with the comfort and space of a much larger vessel.
              </p>
              <Link href="/adventure-yachts">
                <Button variant="secondary" size="md">
                  Learn More About the AY60
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Register for a Viewing */}
      <section id="register" className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-3">
                Book Your Appointment
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tighter text-white mb-4">
                Register for a{' '}
                <span className="text-gradient">Private Viewing</span>
              </h2>
              <p className="text-white/70 font-light">
                Secure your spot for an exclusive tour of the AY60 at the International Multihull Show.
              </p>
            </div>

            <GlassCard variant="blue" padding="lg">
              {tourStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-teal/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-accent-teal" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    Viewing Request Received
                  </h3>
                  <p className="text-white/70 max-w-md mx-auto">
                    Thank you for your interest in the AY60. Our team will be in touch to confirm your appointment at the show.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Google Sign In */}
                  {!isSignedIn && (
                    <>
                      <div className="text-center">
                        <p className="text-sm text-white/60 mb-4">
                          Sign in with Google to pre-fill your details
                        </p>
                        <button
                          onClick={handleGoogleAuth}
                          disabled={isGoogleLoading || !isSignInLoaded}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGoogleLoading ? (
                            <motion.div
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                          ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                          )}
                          Continue with Google
                        </button>
                        {authError && (
                          <p className="text-sm text-red-400 mt-2">{authError}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/20" />
                        <span className="text-xs text-white/40">or fill in your details</span>
                        <div className="flex-1 h-px bg-white/20" />
                      </div>
                    </>
                  )}

                  {/* Signed in user greeting */}
                  {isSignedIn && user && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-teal/10 border border-accent-teal/30">
                      {user.imageUrl && (
                        <Image
                          src={user.imageUrl}
                          alt="Profile"
                          width={36}
                          height={36}
                          className="rounded-full"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.fullName || user.firstName || 'Welcome back!'}
                        </p>
                        <p className="text-xs text-white/60 truncate">
                          {user.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleTourSubmit} noValidate className="space-y-5">
                    {/* Honeypot */}
                    <input
                      type="text"
                      name="website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      style={{ position: 'absolute', left: '-9999px' }}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />

                    {/* Full Name */}
                    <div>
                      <label htmlFor="tour-fullName" className="block text-sm font-medium text-white/80 mb-2">
                        Full Name <span className="text-accent-coral">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          id="tour-fullName"
                          type="text"
                          value={tourForm.fullName}
                          onChange={(e) => setTourForm({ ...tourForm, fullName: e.target.value })}
                          placeholder="John Smith"
                          className={`${inputClasses} pl-12 ${isSignedIn && tourForm.fullName ? 'bg-white/10' : ''} ${isTourFieldInvalid('fullName') ? 'border-red-500' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="tour-email" className="block text-sm font-medium text-white/80 mb-2">
                        Email Address <span className="text-accent-coral">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          id="tour-email"
                          type="email"
                          value={tourForm.email}
                          onChange={(e) => setTourForm({ ...tourForm, email: e.target.value })}
                          placeholder="john@example.com"
                          className={`${inputClasses} pl-12 ${isSignedIn && tourForm.email ? 'bg-white/10' : ''} ${isTourFieldInvalid('email') ? 'border-red-500' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="tour-phone" className="block text-sm font-medium text-white/80 mb-2">
                        Phone Number <span className="text-accent-coral">*</span>
                      </label>
                      <div className="flex gap-3">
                        <select
                          value={tourForm.countryCode}
                          onChange={(e) => setTourForm({ ...tourForm, countryCode: e.target.value })}
                          className="w-28 px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                        >
                          {countryCodes.map((cc) => (
                            <option key={cc.code} value={cc.code} className="bg-brand-navy">
                              {cc.code} {cc.country}
                            </option>
                          ))}
                        </select>
                        <div className="relative flex-1">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <input
                            id="tour-phone"
                            type="tel"
                            value={tourForm.phone}
                            onChange={(e) => setTourForm({ ...tourForm, phone: e.target.value })}
                            placeholder="123 456 7890"
                            className={`${inputClasses} pl-12 ${isTourFieldInvalid('phone') ? 'border-red-500' : ''}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Country */}
                    <div>
                      <label htmlFor="tour-country" className="block text-sm font-medium text-white/80 mb-2">
                        Country <span className="text-accent-coral">*</span>
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <select
                          id="tour-country"
                          value={tourForm.country}
                          onChange={(e) => setTourForm({ ...tourForm, country: e.target.value })}
                          className={`${inputClasses} pl-12 appearance-none ${isTourFieldInvalid('country') ? 'border-red-500' : ''}`}
                        >
                          <option value="" className="bg-brand-navy">Select your country</option>
                          {countries.map((c) => (
                            <option key={c} value={c} className="bg-brand-navy">
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Interest */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        I am a... <span className="text-accent-coral">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {interestOptions.map((option) => {
                          const isSelected = tourForm.interest === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setTourForm({ ...tourForm, interest: option.value })}
                              className={`
                                px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all
                                ${isSelected
                                  ? 'bg-brand-blue/20 border-brand-blue text-white'
                                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                                }
                                ${isTourFieldInvalid('interest') ? 'border-red-500' : ''}
                              `}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                      {tourForm.interest === 'other' && (
                        <input
                          type="text"
                          value={tourForm.otherInterest}
                          onChange={(e) => setTourForm({ ...tourForm, otherInterest: e.target.value })}
                          placeholder="Please specify..."
                          className={`${inputClasses} mt-3`}
                        />
                      )}
                    </div>

                    {/* Company */}
                    <div>
                      <label htmlFor="tour-company" className="block text-sm font-medium text-white/80 mb-2">
                        Company <span className="text-white/40">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          id="tour-company"
                          type="text"
                          value={tourForm.company}
                          onChange={(e) => setTourForm({ ...tourForm, company: e.target.value })}
                          placeholder="Your company name"
                          className={`${inputClasses} pl-12`}
                        />
                      </div>
                    </div>

                    {/* Error */}
                    {tourStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 bg-accent-coral/10 border border-accent-coral/20 rounded-xl"
                      >
                        <AlertCircle className="w-5 h-5 text-accent-coral shrink-0" />
                        <p className="text-sm text-accent-coral">{tourError}</p>
                      </motion.div>
                    )}

                    {tourError && tourStatus !== 'error' && (
                      <p className="text-sm text-red-400 text-center">{tourError}</p>
                    )}

                    {/* Submit */}
                    <div className="pt-2">
                      <Button type="submit" variant="primary" size="lg" disabled={tourSubmitting} className="w-full">
                        {tourSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Register for a Viewing
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-white/40 text-center">
                      By submitting this form, you consent to receiving communications from 36ZERO Yachting.
                      We will never share your personal data without consent.
                    </p>
                  </form>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Visit Adventure One */}
      <section id="visit" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 gap-8 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="order-2 md:order-1">
              <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-3">
                At the Show
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tighter text-white mb-4">
                Visit{' '}
                <span className="text-gradient">Adventure One</span>
              </h2>
              <p className="text-white/70 font-light mb-4">
                Adventure One is the first AY60 Sport, and she will be on display at the International
                Multihull Show. Come aboard and experience the spacious living areas, innovative design,
                and exceptional build quality for yourself.
              </p>
              <p className="text-white/70 font-light mb-6">
                Our team from Adventure Yachts and 36ZERO Yachting will be on hand to answer your questions
                and discuss how the AY60 can be configured to suit your cruising plans.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="primary" size="md" onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}>
                  Book a Private Viewing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Link href="/adventure-yachts">
                  <Button variant="secondary" size="md">
                    Explore the AY60
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden order-1 md:order-2">
              <Image
                src={`${BLOB_BASE}/real-DJI_20260226185233_0004_D.jpg`}
                alt="AY60 Adventure One at twilight"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Email Updates */}
      <section className="py-16 px-6">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard padding="lg" className="text-center">
              {signupStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-teal/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-accent-teal" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">You&apos;re Signed Up!</h3>
                  <p className="text-white/60 text-sm">
                    We&apos;ll keep you updated on everything IMHS 2026.
                  </p>
                </motion.div>
              ) : (
                <>
                  <Mail className="w-8 h-8 text-brand-blue mx-auto mb-4" />
                  <h3 className="text-2xl font-extrabold uppercase tracking-tighter text-white mb-2">
                    Stay Updated
                  </h3>
                  <p className="text-white/60 text-sm mb-6">
                    Sign up for email updates about the show, the AY60, and exclusive content.
                  </p>

                  {!isSignedIn && (
                    <>
                      <button
                        onClick={handleGoogleAuth}
                        disabled={isGoogleLoading || !isSignInLoaded}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                      >
                        {isGoogleLoading ? (
                          <motion.div
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                        ) : (
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                        )}
                        Sign Up with Google
                      </button>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-white/20" />
                        <span className="text-xs text-white/40">or enter your email</span>
                        <div className="flex-1 h-px bg-white/20" />
                      </div>
                    </>
                  )}

                  <form onSubmit={handleSignupSubmit} className="flex gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="your@email.com"
                        className={`${inputClasses} pl-12`}
                        required
                      />
                    </div>
                    <Button type="submit" variant="primary" size="md" disabled={signupSubmitting}>
                      {signupSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Subscribe'
                      )}
                    </Button>
                  </form>

                  {signupStatus === 'error' && (
                    <p className="text-sm text-red-400 mt-3">Something went wrong. Please try again.</p>
                  )}
                </>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
