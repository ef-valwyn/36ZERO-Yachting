'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Phone, CheckCircle, AlertCircle, Loader2, Send } from 'lucide-react';
import Image from 'next/image';
import { Button, GlassCard, countryCodes } from '@36zero/ui';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import { useUser, useSignIn, useSignUp } from '@clerk/nextjs';

const interestOptions = [
  { value: 'ay60', label: 'Adventure Yachts AY60' },
  { value: '36zero-lap', label: '36ZERO LAP' },
];

export default function ContactPage() {
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    interests: [] as string[],
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formTouched, setFormTouched] = useState(false);

  // Anti-bot measures
  const [honeypot, setHoneypot] = useState('');
  const [loadTime, setLoadTime] = useState<number>(Date.now());

  // Prefill form data when user is signed in
  useEffect(() => {
    if (isUserLoaded && isSignedIn && user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.primaryEmailAddress?.emailAddress || '',
      }));
    }
  }, [isUserLoaded, isSignedIn, user]);

  // Reset load time on mount
  useEffect(() => {
    setLoadTime(Date.now());
  }, []);

  // Handle Google Sign In/Up
  const handleGoogleAuth = async () => {
    if (!isSignInLoaded || !isSignUpLoaded) return;

    setIsGoogleLoading(true);
    setAuthError(null);

    try {
      await signIn?.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/contact',
      });
    } catch {
      try {
        await signUp?.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/sso-callback',
          redirectUrlComplete: '/contact',
        });
      } catch (signUpErr: unknown) {
        const msg = signUpErr instanceof Error ? signUpErr.message : 'Failed to authenticate with Google';
        setAuthError(msg);
        setIsGoogleLoading(false);
      }
    }
  };

  const toggleInterest = (value: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter(i => i !== value)
        : [...prev.interests, value],
    }));
  };

  const isFieldInvalid = (field: string) => {
    if (!formTouched) return false;
    switch (field) {
      case 'fullName': return !formData.fullName.trim();
      case 'email': return !formData.email || !formData.email.includes('@');
      case 'interests': return formData.interests.length === 0;
      default: return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormTouched(true);
    setErrorMessage('');

    // Anti-bot: honeypot
    if (honeypot) {
      setSubmitStatus('success');
      return;
    }

    // Anti-bot: timing
    const timeSpent = Date.now() - loadTime;
    if (timeSpent < 3000) {
      setSubmitStatus('success');
      return;
    }

    // Validate required fields
    const hasErrors =
      !formData.fullName.trim() ||
      !formData.email ||
      !formData.email.includes('@') ||
      formData.interests.length === 0;

    if (hasErrors) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const interestLabels = formData.interests
        .map(v => interestOptions.find(o => o.value === v)?.label || v)
        .join(', ');

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          firstName,
          lastName,
          phone: formData.phone ? `${formData.countryCode} ${formData.phone}` : undefined,
          interest: interestLabels,
          message: formData.message || undefined,
          leadSource: 'contact_form',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to submit. Please try again.');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors';

  return (
    <main className="min-h-screen bg-brand-navy">
      <Header variant="solid" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-4">
              Get In Touch
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter text-white mb-6">
              Contact <span className="text-gradient">Our Team</span>
            </h1>
            <p className="text-lg text-white/70 font-light max-w-2xl mx-auto">
              Whether you&apos;re interested in the Adventure Yachts AY60 or joining the 36ZERO LAP circumnavigation,
              we&apos;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard variant="blue" padding="lg">
              {submitStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-teal/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-accent-teal" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    Thank You for Reaching Out
                  </h3>
                  <p className="text-white/70 mb-8 max-w-md mx-auto">
                    We&apos;ve received your message and our team will be in touch within 24 hours.
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

                  <form id="form-contact" name="Contact Form" data-hs-cf-bound="true" onSubmit={handleSubmit} noValidate className="space-y-6">
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
                      <label htmlFor="contact-fullName" className="block text-sm font-medium text-white/80 mb-2">
                        Full Name <span className="text-accent-coral">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          id="contact-fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="John Smith"
                          className={`${inputClasses} pl-12 ${isSignedIn && formData.fullName ? 'bg-white/10' : ''} ${isFieldInvalid('fullName') ? 'border-red-500' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-white/80 mb-2">
                        Email Address <span className="text-accent-coral">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          id="contact-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          className={`${inputClasses} pl-12 ${isSignedIn && formData.email ? 'bg-white/10' : ''} ${isFieldInvalid('email') ? 'border-red-500' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Phone (Optional) */}
                    <div>
                      <label htmlFor="contact-phone" className="block text-sm font-medium text-white/80 mb-2">
                        Phone Number <span className="text-white/40">(Optional)</span>
                      </label>
                      <div className="flex gap-3">
                        <select
                          value={formData.countryCode}
                          onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
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
                            id="contact-phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="123 456 7890"
                            className={`${inputClasses} pl-12`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interest Multi-Select */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-3">
                        I&apos;m Interested In <span className="text-accent-coral">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {interestOptions.map((option) => {
                          const isSelected = formData.interests.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => toggleInterest(option.value)}
                              className={`
                                relative px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all
                                ${isSelected
                                  ? 'bg-brand-blue/20 border-brand-blue text-white'
                                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                                }
                                ${isFieldInvalid('interests') ? 'border-red-500' : ''}
                              `}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`
                                  w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0
                                  ${isSelected
                                    ? 'bg-brand-blue border-brand-blue'
                                    : 'border-white/30'
                                  }
                                `}>
                                  {isSelected && (
                                    <motion.svg
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </motion.svg>
                                  )}
                                </div>
                                {option.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {isFieldInvalid('interests') && (
                        <p className="text-xs text-red-400 mt-2">Please select at least one interest.</p>
                      )}
                    </div>

                    {/* Message (Optional) */}
                    <div>
                      <label htmlFor="contact-message" className="block text-sm font-medium text-white/80 mb-2">
                        Message <span className="text-white/40">(Optional)</span>
                      </label>
                      <textarea
                        id="contact-message"
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className={`${inputClasses} resize-none`}
                        placeholder="Tell us how we can help..."
                      />
                    </div>

                    {/* Error Message */}
                    {submitStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 bg-accent-coral/10 border border-accent-coral/20 rounded-xl"
                      >
                        <AlertCircle className="w-5 h-5 text-accent-coral shrink-0" />
                        <p className="text-sm text-accent-coral">{errorMessage}</p>
                      </motion.div>
                    )}

                    {errorMessage && submitStatus !== 'error' && (
                      <p className="text-sm text-red-400 text-center">{errorMessage}</p>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="w-4 h-4 ml-2" />
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

          {/* Contact Info Cards */}
          <motion.div
            className="grid sm:grid-cols-2 gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassCard padding="md" className="text-center">
              <Mail className="w-6 h-6 text-brand-blue mx-auto mb-3" />
              <p className="text-sm text-white/60 mb-1">Email Us</p>
              <a
                href="mailto:info@36zeroyachting.com"
                className="text-white font-medium hover:text-brand-blue transition-colors"
              >
                info@36zeroyachting.com
              </a>
            </GlassCard>

            <GlassCard padding="md" className="text-center">
              <Phone className="w-6 h-6 text-brand-blue mx-auto mb-3" />
              <p className="text-sm text-white/60 mb-1">Call Us</p>
              <a
                href="tel:+13158257260"
                className="text-white font-medium hover:text-brand-blue transition-colors"
              >
                +1 315 825 7260
              </a>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
