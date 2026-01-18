'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

export interface Passage {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  distanceNm: number;
  pricePerPerson: number;
  maxGuests: number;
  requiresOffshoreCompetency?: boolean;
}

export interface StepFormProps {
  passages: Passage[];
  onSubmit: (data: {
    selectedPassages: string[];
    guestCount: number;
    totalPrice: number;
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

export const StepForm: React.FC<StepFormProps> = ({
  passages,
  onSubmit,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedPassages, setSelectedPassages] = useState<string[]>([]);
  const [guestCount, setGuestCount] = useState(1);

  const steps = ['Select Passages', 'Number of Guests', 'Review & Book'];
  const maxPassages = 4;
  const maxGuests = 4;

  const calculateTotalPrice = () => {
    return selectedPassages.reduce((total, passageId) => {
      const passage = passages.find((p) => p.id === passageId);
      return total + (passage?.pricePerPerson || 0) * guestCount;
    }, 0);
  };

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

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      selectedPassages,
      guestCount,
      totalPrice: calculateTotalPrice(),
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedPassages.length > 0;
      case 1:
        return guestCount >= 1 && guestCount <= maxGuests;
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <GlassCard variant="blue" padding="lg" className={cn('max-w-2xl mx-auto', className)}>
      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-3 mb-8">
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
                  'w-12 h-0.5 transition-colors duration-300',
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
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{passage.name}</h4>
                        <p className="text-sm text-white/60">{passage.description}</p>
                        <p className="text-xs text-white/40 mt-1">
                          {passage.distanceNm} NM · {passage.startDate} - {passage.endDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-brand-blue">
                          ${passage.pricePerPerson.toLocaleString()}
                        </p>
                        <p className="text-xs text-white/40">per person</p>
                      </div>
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

            {/* Step 3: Review */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Selected Passages Summary */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white/60">Selected Passages</h4>
                  {selectedPassages.map((id) => {
                    const passage = passages.find((p) => p.id === id);
                    if (!passage) return null;
                    return (
                      <div key={id} className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white">{passage.name}</span>
                        <span className="text-white/60">
                          ${(passage.pricePerPerson * guestCount).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Guest Count */}
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/60">Guests</span>
                  <span className="text-white">{guestCount}</span>
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

                {/* Total */}
                <div className="pt-4 border-t border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-white">Total</span>
                    <span className="text-2xl font-bold text-brand-blue">
                      ${calculateTotalPrice().toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 text-right mt-1">
                    Deposit due at booking
                  </p>
                </div>
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
            disabled={!canProceed()}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canProceed()}
          >
            Book Now
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </GlassCard>
  );
};

export default StepForm;
