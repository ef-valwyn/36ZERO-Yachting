'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronDown, MapPin } from 'lucide-react';
import { Button, GlassCard } from '@36zero/ui';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import AdventureYachtsLogoMark from '@/components/AdventureYachtsLogoMark';
import EnquireModal from '@/components/EnquireModal';

interface BuildVariant {
  id: string;
  slug: string;
  name: string;
  model: string;
  variant: string;
  tagline: string;
  location: string;
  description: string;
  additionalParagraph?: string;
  specs: {
    lengthOverall: { value: string; imperial: string };
    beamOverall: { value: string; imperial: string };
    range: { value: string; unit: string };
    cruisingSpeed: { value: string; unit: string };
    berths: { value: string; unit: string };
    construction: { value: string; detail?: string };
  };
  imageUrl: string;
}

interface Props {
  build: BuildVariant;
  allBuilds: BuildVariant[];
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
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

const specItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: 'easeOut',
    },
  }),
};

export default function AdventureYachtDetail({ build, allBuilds }: Props) {
  const [isEnquireModalOpen, setIsEnquireModalOpen] = useState(false);
  const searchParams = useSearchParams();

  // Auto-scroll to specs section when navigating between builds
  useEffect(() => {
    const shouldScroll = searchParams.get('scroll') === 'specs';
    if (shouldScroll) {
      // Small delay to ensure page is rendered
      const timer = setTimeout(() => {
        const element = document.getElementById('specs-section');
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const scrollToSpecs = () => {
    const element = document.getElementById('specs-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-brand-navy">
      <Header variant="transparent" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy-50 to-brand-navy" />
          
          {/* Decorative elements */}
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-teal/5 rounded-full blur-3xl" />
          
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(47, 151, 221, 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(47, 151, 221, 0.3) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 mb-8"
            >
              <AdventureYachtsLogoMark size={16} className="text-brand-blue" />
              <span className="text-sm font-medium text-brand-blue">{build.model} Power Catamaran</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tighter text-white leading-[0.9] mb-6"
            >
              {build.name}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto mb-12"
            >
              {build.tagline}
            </motion.p>

            {/* Build Selector - Now links to individual pages */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12"
            >
              {allBuilds.map((variant) => (
                <Link
                  key={variant.id}
                  href={build.id === variant.id ? '#' : `/adventure-yachts/${variant.slug}?scroll=specs`}
                  className={`group relative px-5 md:px-8 py-4 md:py-5 rounded-2xl transition-all duration-500 ${
                    build.id === variant.id
                      ? 'bg-brand-blue shadow-glow'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-left">
                    <p className={`text-sm font-semibold tracking-wide transition-colors ${
                      build.id === variant.id ? 'text-white' : 'text-white/90'
                    }`}>
                      {variant.name}
                    </p>
                    <p className={`text-xs transition-colors ${
                      build.id === variant.id ? 'text-white/80' : 'text-white/50'
                    }`}>
                      {variant.model} — {variant.variant}
                    </p>
                  </div>
                  
                  {/* Selection indicator */}
                  {build.id === variant.id && (
                    <motion.div
                      layoutId="selector-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button variant="secondary" onClick={scrollToSpecs}>
                View Specifications
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-2 bg-white/60 rounded-full"
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Specifications Section */}
      <section id="specs-section" className="py-24 md:py-32 px-6 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Section */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 mb-20">
              {/* Left: Title & Tagline */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Title row with CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                      {build.model}
                    </h2>
                    <Button 
                      variant="primary" 
                      className="shrink-0"
                      onClick={() => setIsEnquireModalOpen(true)}
                    >
                      Enquire Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  <p className="text-xl md:text-2xl text-white/60 font-light mb-4">
                    {build.tagline}
                  </p>
                  {/* Location */}
                  <div className="flex items-center gap-2 text-brand-blue">
                    <MapPin className="w-5 h-5" />
                    <span className="text-base font-medium">{build.location}</span>
                  </div>
                </motion.div>
              </div>

              {/* Right: Description */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <p className="text-lg text-white/80 font-light leading-relaxed">
                    {build.description}
                  </p>
                  {build.additionalParagraph && (
                    <p className="text-lg text-white/80 font-light leading-relaxed mt-6">
                      {build.additionalParagraph}
                    </p>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-16">
              {/* Length Overall */}
              <motion.div
                custom={0}
                variants={specItemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="spec-item"
              >
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-4">
                  Length Overall
                </p>
                <div className="h-0.5 bg-brand-blue mb-6 w-full" />
                <p className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight">
                  {build.specs.lengthOverall.value}{' '}
                  <span className="text-xl md:text-2xl text-white/60">{build.specs.lengthOverall.imperial}</span>
                </p>
              </motion.div>

              {/* Beam Overall */}
              <motion.div
                custom={1}
                variants={specItemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="spec-item"
              >
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-4">
                  Beam Overall
                </p>
                <div className="h-0.5 bg-brand-blue mb-6 w-full" />
                <p className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight">
                  {build.specs.beamOverall.value}{' '}
                  <span className="text-xl md:text-2xl text-white/60">{build.specs.beamOverall.imperial}</span>
                </p>
              </motion.div>

              {/* Range */}
              <motion.div
                custom={2}
                variants={specItemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="spec-item"
              >
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-4">
                  Range
                </p>
                <div className="h-0.5 bg-brand-blue mb-6 w-full" />
                <p className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight">
                  {build.specs.range.value}{' '}
                  <span className="text-xl md:text-2xl text-white/60">{build.specs.range.unit}</span>
                </p>
              </motion.div>

              {/* Cruising Speed */}
              <motion.div
                custom={3}
                variants={specItemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="spec-item"
              >
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-4">
                  Cruising Speed
                </p>
                <div className="h-0.5 bg-brand-blue mb-6 w-full" />
                <p className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight">
                  {build.specs.cruisingSpeed.value}{' '}
                  <span className="text-xl md:text-2xl text-white/60">{build.specs.cruisingSpeed.unit}</span>
                </p>
              </motion.div>

              {/* Berths */}
              <motion.div
                custom={4}
                variants={specItemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="spec-item"
              >
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-4">
                  Berths
                </p>
                <div className="h-0.5 bg-brand-blue mb-6 w-full" />
                <p className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight">
                  {build.specs.berths.value}
                </p>
              </motion.div>

              {/* Construction */}
              <motion.div
                custom={5}
                variants={specItemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="spec-item"
              >
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-4">
                  Construction
                </p>
                <div className="h-0.5 bg-brand-blue mb-6 w-full" />
                <p className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight">
                  {build.specs.construction.value}
                  {build.specs.construction.detail && (
                    <>
                      <br />
                      <span className="text-xl md:text-2xl text-white/60">{build.specs.construction.detail}</span>
                    </>
                  )}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vessel Image Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard variant="blue" padding="none" className="overflow-hidden">
              <div className="relative aspect-[21/9]">
                <Image
                  src={build.imageUrl}
                  alt={`${build.name} - ${build.model}`}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/40 via-transparent to-brand-navy/20" />
                
                {/* Vessel Label */}
                <div className="absolute top-6 left-6 md:top-8 md:left-8">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-brand-navy/80 backdrop-blur-md rounded-xl px-5 py-3 border border-white/10"
                  >
                    <p className="text-brand-blue text-xs font-medium uppercase tracking-wider mb-1">
                      {build.variant}
                    </p>
                    <p className="text-white text-xl font-semibold">{build.name}</p>
                  </motion.div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-4">
              Ready to Begin?
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Reserve Your {build.model}
            </h2>
            <p className="text-lg text-white/60 font-light max-w-2xl mx-auto mb-10">
              36ZERO Yachting prides itself on a seamless purchase process, delivery and 
              after-sales support. Submit your enquiry and we&apos;ll bring you closer to your horizon.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => setIsEnquireModalOpen(true)}
              >
                Enquire Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/adventure-yachts">
                  Back to Overview
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <SiteFooter />

      {/* Enquire Modal */}
      <EnquireModal
        isOpen={isEnquireModalOpen}
        onClose={() => setIsEnquireModalOpen(false)}
        vesselId={build.id}
        vesselName={build.name}
        vesselModel={build.model}
      />
    </main>
  );
}
