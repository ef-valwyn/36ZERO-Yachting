'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, AlertTriangle, Mail, User, Phone } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { countryCodes, countries } from '../lib/countryCodes';

export interface Passage {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  distanceNm: number;
  pricePerPerson?: number;
  maxGuests: number;
  requiresOffshoreCompetency?: boolean;
}

export interface LapUserInfo {
  email: string;
  fullName: string;
  countryCode: string;
  phone: string;
  countryOfResidence: string;
  yachtType: 'sail' | 'power' | 'own_yacht';
  ownYachtDetails: string;
  crewAugmentationRequired: boolean | null;
}

export interface StepFormProps {
  passages: Passage[];
  onSubmit: (data: {
    selectedPassages: string[];
    guestCount: number;
    userInfo: LapUserInfo;
  }) => void;
  onStepChange?: (step: number, data: {
    selectedPassages: string[];
    guestCount: number;
    userInfo: LapUserInfo;
  }) => void;
  className?: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const inputClasses = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors';
const selectClasses = 'px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors appearance-none';

export const StepForm: React.FC<StepFormProps> = ({
  passages,
  onSubmit,
  onStepChange,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedPassages, setSelectedPassages] = useState<string[]>([]);
  const [guestCount, setGuestCount] = useState(1);
  const [userInfo, setUserInfo] = useState<LapUserInfo>({
    email: '',
    fullName: '',
    countryCode: '+1',
    phone: '',
    countryOfResidence: '',
    yachtType: 'sail',
    ownYachtDetails: '',
    crewAugmentationRequired: null,
  });
  const [formTouched, setFormTouched] = useState(false);

  const steps = ['Select Passages', 'Number of Guests', 'Your Information', 'Reserve Your Entry'];
  const maxPassages = 4;
  const maxGuests = 8;

  const hasOffshoreRequirement = selectedPassages.some((id) => {
    const passage = passages.find((p) => p.id === id);
    return passage?.requiresOffshoreCompetency;
  });

  const handlePassageToggle = (passageId: string) => {
    setSelectedPassages((prev) => {
      if (prev.includes(passageId)) {
        return prev.filter((id) => id !== passageId);
      }
      if (prev.length < maxPassages) {
        return [...prev, passageId];
      }
      return prev;
    });
  };

  const getFormData = () => ({
    selectedPassages,
    guestCount,
    userInfo,
  });

  const nextStep = () => {
    if (currentStep === 2) {
      setFormTouched(true);
      if (!canProceed()) return;
    }
    if (currentStep < steps.length - 1) {
      setDirection(1);
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      if (newStep === 3 && onStepChange) {
        onStepChange(newStep, getFormData());
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(getFormData());
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedPassages.length > 0;
      case 1:
        return guestCount >= 1 && guestCount <= maxGuests;
      case 2:
        return (
          userInfo.email.includes('@') &&
          userInfo.fullName.trim().length > 0 &&
          userInfo.phone.trim().length > 0 &&
          userInfo.countryOfResidence.trim().length > 0 &&
          userInfo.crewAugmentationRequired !== null &&
          (userInfo.yachtType !== 'own_yacht' || userInfo.ownYachtDetails.trim().length > 0)
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const updateUserInfo = (field: keyof LapUserInfo, value: string | boolean | null) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const yachtTypeOptions: { value: LapUserInfo['yachtType']; label: string }[] = [
    { value: 'sail', label: 'Sail' },
    { value: 'power', label: 'Power' },
    { value: 'own_yacht', label: 'Own Yacht' },
  ];

  return (
    <GlassCard variant="blue" padding="lg" className={cn('max-w-2xl mx-auto', className)}>
      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300',
                index < currentStep && 'bg-brand-blue text-white',
                index === currentStep && 'bg-brand-blue text-white ring-4 ring-brand-blue/30',
                index > currentStep && 'bg-white/10 text-white/50'
              )}
            >
              {index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-8 sm:w-12 h-0.5 transition-colors duration-300',
                  index < currentStep ? 'bg-brand-blue' : 'bg-white/10'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Title */}
      <h3 className="text-center text-lg font-semibold text-white mb-6">
        {steps[currentStep]}
      </h3>

      {/* Step Content */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* Step 1: Select Passages */}
            {currentStep === 0 && (
              <div className="h-full flex flex-col">
                <p className="text-sm text-white/60 mb-4">
                  Select up to {maxPassages} passages for your journey
                </p>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {passages.map((passage) => (
                  <button
                    key={passage.id}
                    onClick={() => handlePassageToggle(passage.id)}
                    className={cn(
                      'w-full p-4 rounded-xl border transition-all duration-300 text-left',
                      selectedPassages.includes(passage.id)
                        ? 'bg-brand-blue/20 border-brand-blue'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    )}
                  >
                    <div>
                      <h4 className="font-medium text-white">{passage.name}</h4>
                      <p className="text-sm text-white/60">{passage.description}</p>
                      <p className="text-xs text-white/40 mt-1">
                        {passage.distanceNm.toLocaleString()} NM · {passage.startDate} - {passage.endDate}
                      </p>
                    </div>
                    {passage.requiresOffshoreCompetency && (
                      <div className="flex items-center gap-1.5 mt-2 text-accent-gold text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        Offshore competency required
                      </div>
                    )}
                  </button>
                ))}
                </div>
              </div>
            )}

            {/* Step 2: Number of Guests */}
            {currentStep === 1 && (
              <div className="flex flex-col items-center justify-center h-full space-y-8">
                <p className="text-sm text-white/60">
                  How many guests will be joining?
                </p>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    disabled={guestCount <= 1}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <span className="text-5xl font-bold text-white">{guestCount}</span>
                    <p className="text-sm text-white/60 mt-1">
                      {guestCount === 1 ? 'Guest' : 'Guests'}
                    </p>
                  </div>
                  <button
                    onClick={() => setGuestCount(Math.min(maxGuests, guestCount + 1))}
                    className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    disabled={guestCount >= maxGuests}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-white/40">Maximum {maxGuests} guests per booking</p>
              </div>
            )}

            {/* Step 3: Your Information */}
            {currentStep === 2 && (
              <div className="h-full overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {/* Email */}
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={userInfo.email}
                      onChange={(e) => updateUserInfo('email', e.target.value)}
                      className={cn(inputClasses, 'pl-10', formTouched && !userInfo.email.includes('@') && 'border-red-400/50')}
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="John Smith"
                      value={userInfo.fullName}
                      onChange={(e) => updateUserInfo('fullName', e.target.value)}
                      className={cn(inputClasses, 'pl-10', formTouched && !userInfo.fullName.trim() && 'border-red-400/50')}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={userInfo.countryCode}
                      onChange={(e) => updateUserInfo('countryCode', e.target.value)}
                      className={cn(selectClasses, 'w-28 flex-shrink-0')}
                    >
                      {countryCodes.map((cc) => (
                        <option key={cc.code} value={cc.code} className="bg-brand-navy">
                          {cc.code} {cc.country}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={userInfo.phone}
                        onChange={(e) => updateUserInfo('phone', e.target.value)}
                        className={cn(inputClasses, 'pl-10', formTouched && !userInfo.phone.trim() && 'border-red-400/50')}
                      />
                    </div>
                  </div>
                </div>

                {/* Country of Residence */}
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Country of Residence</label>
                  <select
                    value={userInfo.countryOfResidence}
                    onChange={(e) => updateUserInfo('countryOfResidence', e.target.value)}
                    className={cn(selectClasses, 'w-full', formTouched && !userInfo.countryOfResidence && 'border-red-400/50')}
                  >
                    <option value="" className="bg-brand-navy">Select country</option>
                    {countries.map((c) => (
                      <option key={c} value={c} className="bg-brand-navy">{c}</option>
                    ))}
                  </select>
                </div>

                {/* Yacht Type */}
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Yacht Type</label>
                  <div className="flex gap-2">
                    {yachtTypeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateUserInfo('yachtType', opt.value)}
                        className={cn(
                          'flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all duration-200',
                          userInfo.yachtType === opt.value
                            ? 'bg-brand-blue/20 border-brand-blue text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Own Yacht Details */}
                {userInfo.yachtType === 'own_yacht' && (
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Please Specify</label>
                    <input
                      type="text"
                      placeholder="e.g. Oyster 565, 2021"
                      value={userInfo.ownYachtDetails}
                      onChange={(e) => updateUserInfo('ownYachtDetails', e.target.value)}
                      className={cn(inputClasses, formTouched && !userInfo.ownYachtDetails.trim() && 'border-red-400/50')}
                    />
                  </div>
                )}

                {/* Crew Augmentation */}
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Crew Augmentation Required</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => updateUserInfo('crewAugmentationRequired', true)}
                      className={cn(
                        'flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all duration-200',
                        userInfo.crewAugmentationRequired === true
                          ? 'bg-brand-blue/20 border-brand-blue text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                      )}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => updateUserInfo('crewAugmentationRequired', false)}
                      className={cn(
                        'flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all duration-200',
                        userInfo.crewAugmentationRequired === false
                          ? 'bg-brand-blue/20 border-brand-blue text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                      )}
                    >
                      No
                    </button>
                  </div>
                  {formTouched && userInfo.crewAugmentationRequired === null && (
                    <p className="text-xs text-red-400/70 mt-1">Please select an option</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Reserve Your Entry */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Selected Passages Summary */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white/60">Selected Passages</h4>
                  {selectedPassages.map((id) => {
                    const passage = passages.find((p) => p.id === id);
                    if (!passage) return null;
                    return (
                      <div key={id} className="py-2 border-b border-white/10">
                        <span className="text-white">{passage.name}</span>
                        <p className="text-xs text-white/40">{passage.startDate} - {passage.endDate}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Guest Count */}
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/60">Guests</span>
                  <span className="text-white">{guestCount}</span>
                </div>

                {/* User Info Summary */}
                <div className="space-y-1.5">
                  <h4 className="text-sm font-medium text-white/60">Your Details</h4>
                  <div className="text-sm text-white space-y-1">
                    <p>{userInfo.fullName}</p>
                    <p className="text-white/60">{userInfo.email}</p>
                    <p className="text-white/60">{userInfo.countryCode} {userInfo.phone}</p>
                    <p className="text-white/60">{userInfo.countryOfResidence}</p>
                    <p className="text-white/60">
                      Yacht: {userInfo.yachtType === 'own_yacht' ? `Own Yacht - ${userInfo.ownYachtDetails}` : userInfo.yachtType === 'sail' ? 'Sail' : 'Power'}
                    </p>
                    <p className="text-white/60">
                      Crew Augmentation: {userInfo.crewAugmentationRequired ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>

                {/* Warning if offshore competency required */}
                {hasOffshoreRequirement && (
                  <div className="p-4 rounded-xl bg-accent-gold/10 border border-accent-gold/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-accent-gold">Offshore Competency Required</p>
                        <p className="text-sm text-white/60 mt-1">
                          One or more selected passages require offshore sailing certification.
                          You'll need to verify your qualifications during the booking process.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={currentStep === 0}
          className={cn(currentStep === 0 && 'opacity-0 pointer-events-none')}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            variant="primary"
            onClick={nextStep}
            disabled={currentStep !== 2 && !canProceed()}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
          >
            Confirm Reservation
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </GlassCard>
  );
};

export default StepForm;
