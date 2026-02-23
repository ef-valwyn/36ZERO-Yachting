'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, countryCodes } from '@36zero/ui';

interface EnquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  vesselId: string;
  vesselName: string;
  vesselModel: string;
}

const deliveryRegions = [
  { value: 'asia', label: 'Asia' },
  { value: 'europe', label: 'Europe' },
  { value: 'us', label: 'United States' },
  { value: 'caribbean', label: 'Caribbean' },
  { value: 'australia-nz', label: 'Australia / New Zealand' },
  { value: 'middle-east', label: 'Middle East' },
];

export function EnquireModal({ isOpen, onClose, vesselId, vesselName, vesselModel }: EnquireModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    company: '',
    deliveryRegion: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Anti-bot measures
  const [honeypot, setHoneypot] = useState('');
  const [loadTime, setLoadTime] = useState<number>(0);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: '',
        email: '',
        countryCode: '+1',
        phone: '',
        company: '',
        deliveryRegion: '',
        message: '',
      });
      setSubmitStatus('idle');
      setErrorMessage('');
      // Reset anti-bot measures
      setHoneypot('');
      setLoadTime(Date.now());
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-bot validation: honeypot check
    if (honeypot) {
      // Silently reject - don't tell the bot it failed
      setSubmitStatus('success');
      return;
    }

    // Anti-bot validation: time check (reject if submitted in less than 3 seconds)
    const timeSpent = Date.now() - loadTime;
    if (timeSpent < 3000) {
      // Silently reject - likely a bot
      setSubmitStatus('success');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Parse full name into first/last
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          firstName,
          lastName,
          phone: `${formData.countryCode} ${formData.phone}`,
          countryCode: formData.countryCode,
          company: formData.company || undefined,
          leadSource: 'vessel_enquiry',
          vesselId,
          vesselName,
          vesselModel,
          deliveryRegion: formData.deliveryRegion,
          message: formData.message || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to submit enquiry');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-brand-navy border-t border-white/10 rounded-t-3xl">
              {/* Header */}
              <div className="sticky top-0 bg-brand-navy/95 backdrop-blur-md border-b border-white/10 px-6 py-5 flex items-center justify-between rounded-t-3xl">
                <div>
                  <h2 className="text-2xl font-bold text-white">Enquire About {vesselName}</h2>
                  <p className="text-white/60 text-sm mt-1">{vesselModel}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6 text-white/70" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-8 max-w-3xl mx-auto">
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
                      Thank You for Your Enquiry
                    </h3>
                    <p className="text-white/70 mb-8 max-w-md mx-auto">
                      We&apos;ve received your interest in {vesselName}. Our team will be in touch 
                      within 24 hours to discuss your requirements.
                    </p>
                    <Button variant="primary" onClick={onClose}>
                      Close
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Honeypot field - hidden from humans, visible to bots */}
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
                      <label htmlFor="fullName" className="block text-sm font-medium text-white/80 mb-2">
                        Full Name <span className="text-accent-coral">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                        placeholder="John Smith"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                        Email Address <span className="text-accent-coral">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2">
                        Phone Number <span className="text-accent-coral">*</span>
                      </label>
                      <div className="flex gap-3">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleInputChange}
                          className="w-28 px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                        >
                          {countryCodes.map((cc) => (
                            <option key={cc.code} value={cc.code} className="bg-brand-navy">
                              {cc.code} {cc.country}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                          placeholder="123 456 7890"
                        />
                      </div>
                    </div>

                    {/* Company */}
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-white/80 mb-2">
                        Company <span className="text-white/40">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                        placeholder="Your company name"
                      />
                    </div>

                    {/* Delivery Region */}
                    <div>
                      <label htmlFor="deliveryRegion" className="block text-sm font-medium text-white/80 mb-2">
                        Preferred Delivery Region <span className="text-accent-coral">*</span>
                      </label>
                      <select
                        id="deliveryRegion"
                        name="deliveryRegion"
                        required
                        value={formData.deliveryRegion}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                      >
                        <option value="" disabled className="bg-brand-navy">
                          Select a region
                        </option>
                        {deliveryRegions.map((region) => (
                          <option key={region.value} value={region.value} className="bg-brand-navy">
                            {region.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                        Message <span className="text-white/40">(Optional)</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors resize-none"
                        placeholder="Tell us about your interest in the AY60"
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

                    {/* Submit Button */}
                    <div className="pt-4">
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
                            Submitting...
                          </>
                        ) : (
                          'Submit Enquiry'
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-white/40 text-center pt-2">
                      By submitting this form, you agree to be contacted by 36ZERO Yachting 
                      regarding your enquiry.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default EnquireModal;
