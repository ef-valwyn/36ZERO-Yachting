'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button, GlassCard } from '@36zero/ui';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import AdventureYachtsLogoMark from '@/components/AdventureYachtsLogoMark';

// Build variants data
const buildVariants = [
  {
    id: 'adventure-one',
    name: 'Adventure One',
    model: 'AY60 Sport',
    variant: 'Outboard',
    tagline: 'Pure performance meets refined luxury',
    description: 'The AY60 Sport delivers an uncompromising blend of speed, efficiency, and sophistication. Powered by dual COX CXO300 diesel outboard engines, this configuration offers maximum manoeuvrability and easy maintenance, making it the ideal choice for those who demand performance without sacrifice.',
    specs: {
      lengthOverall: { value: '18.3 m', imperial: "(60' 0\")" },
      beamOverall: { value: '8.47m', imperial: "(30' 0\")" },
      range: { value: '2,000', unit: 'nm' },
      cruisingSpeed: { value: '14', unit: 'kn' },
      berths: { value: '4+2', unit: '' },
      construction: { value: 'Composite', detail: '(Carbon - eGlass)' },
    },
    imageUrl: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/hero-landing.png',
  },
  {
    id: 'adventure-two',
    name: 'Adventure Two',
    model: 'AY60 Flybridge',
    variant: 'Hybrid Inboard',
    tagline: 'Extended horizons with sustainable power',
    description: 'The AY60 Flybridge combines elegant design with innovative hybrid propulsion technology. The expansive flybridge deck provides exceptional entertaining space, while the hybrid inboard system delivers remarkable range and reduced environmental impact for the conscientious voyager.',
    specs: {
      lengthOverall: { value: '18.3 m', imperial: "(60' 0\")" },
      beamOverall: { value: '8.47m', imperial: "(30' 0\")" },
      range: { value: '2,500', unit: 'nm' },
      cruisingSpeed: { value: '12', unit: 'kn' },
      berths: { value: '4+2', unit: '' },
      construction: { value: 'Composite', detail: '(Carbon - eGlass)' },
    },
    imageUrl: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-two/Adventure%20Two%20AY60F.png',
  },
  {
    id: 'adventure-three',
    name: 'Adventure Three',
    model: 'AY60 Sport',
    variant: 'Outboard',
    tagline: 'Bespoke excellence awaits your vision',
    description: 'A blank canvas ready for your personal touch. This AY60 Sport offers full customisation opportunities, allowing you to work directly with our design team to create a vessel that perfectly reflects your lifestyle and aspirations. From layout to finishes, every detail is yours to define.',
    specs: {
      lengthOverall: { value: '18.3 m', imperial: "(60' 0\")" },
      beamOverall: { value: '8.47m', imperial: "(30' 0\")" },
      range: { value: '2,000', unit: 'nm' },
      cruisingSpeed: { value: '14', unit: 'kn' },
      berths: { value: '4+2', unit: '' },
      construction: { value: 'Composite', detail: '(Carbon - eGlass)' },
    },
    imageUrl: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/portthreequarter.jpeg',
  },
  {
    id: 'adventure-four',
    name: 'Adventure Four',
    model: 'AY60 SportX',
    variant: 'Outboard Explorer',
    tagline: 'Engineered for ocean passages',
    description: 'The AY60 SportX is purpose-built for serious bluewater cruising. With enhanced fuel capacity and extended range capabilities, this explorer variant is designed for those who seek distant horizons. Robust construction and comprehensive systems ensure you can venture far from shore with complete confidence.',
    specs: {
      lengthOverall: { value: '18.3 m', imperial: "(60' 0\")" },
      beamOverall: { value: '8.47m', imperial: "(30' 0\")" },
      range: { value: '2,000', unit: 'nm' },
      cruisingSpeed: { value: '14', unit: 'kn' },
      berths: { value: '4+2', unit: '' },
      construction: { value: 'Composite', detail: '(Carbon - eGlass)' },
    },
    imageUrl: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/afterthreequarter.jpeg',
  },
];

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

export default function SelectYourBuildPage() {
  const searchParams = useSearchParams();
  const [selectedBuild, setSelectedBuild] = useState(buildVariants[0]);

  // Handle vessel query parameter to pre-select the build
  useEffect(() => {
    const vesselParam = searchParams.get('vessel');
    if (vesselParam) {
      const matchedBuild = buildVariants.find(
        (build) => build.id === vesselParam || build.name.toLowerCase().replace(/\s+/g, '-') === vesselParam
      );
      if (matchedBuild) {
        setSelectedBuild(matchedBuild);
      }
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
              <span className="text-sm font-medium text-brand-blue">AY60 Power Catamaran</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tighter text-white leading-[0.9] mb-6"
            >
              Select Your
              <br />
              <span className="text-gradient">Build</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto mb-12"
            >
              Choose from four distinct configurations, each engineered to deliver 
              the ultimate power catamaran experience tailored to your adventure.
            </motion.p>

            {/* Build Selector */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12"
            >
              {buildVariants.map((build) => (
                <button
                  key={build.id}
                  onClick={() => setSelectedBuild(build)}
                  className={`group relative px-5 md:px-8 py-4 md:py-5 rounded-2xl transition-all duration-500 ${
                    selectedBuild.id === build.id
                      ? 'bg-brand-blue shadow-glow'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-left">
                    <p className={`text-sm font-semibold tracking-wide transition-colors ${
                      selectedBuild.id === build.id ? 'text-white' : 'text-white/90'
                    }`}>
                      {build.name}
                    </p>
                    <p className={`text-xs transition-colors ${
                      selectedBuild.id === build.id ? 'text-white/80' : 'text-white/50'
                    }`}>
                      {build.model} — {build.variant}
                    </p>
                  </div>
                  
                  {/* Selection indicator */}
                  {selectedBuild.id === build.id && (
                    <motion.div
                      layoutId="selector-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
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

      {/* Specifications Section - Arksen 65 inspired */}
      <section id="specs-section" className="py-24 md:py-32 px-6 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedBuild.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header Section */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 mb-20">
                {/* Left: Title & Tagline */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                      {selectedBuild.model}
                    </h2>
                    <p className="text-xl md:text-2xl text-white/60 font-light">
                      {selectedBuild.tagline}
                    </p>
                  </motion.div>
                </div>

                {/* Right: Description */}
                <div>
                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-lg text-white/80 font-light leading-relaxed"
                  >
                    {selectedBuild.description}
                  </motion.p>
                </div>
              </div>

              {/* Specifications Grid - Arksen style with orange accent */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-16">
                {/* Length Overall */}
                <motion.div
                  custom={0}
                  variants={specItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="spec-item"
                >
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-4">
                    Length Overall
                  </p>
                  <div className="h-0.5 bg-brand-blue mb-6 w-full" />
                  <p className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight">
                    {selectedBuild.specs.lengthOverall.value}{' '}
                    <span className="text-xl md:text-2xl text-white/60">{selectedBuild.specs.lengthOverall.imperial}</span>
                  </p>
                </motion.div>

                {/* Beam Overall */}
                <motion.div
                  custom={1}
                  variants={specItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="spec-item"
                >
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-4">
                    Beam Overall
                  </p>
                  <div className="h-0.5 bg-brand-blue mb-6 w-full" />
                  <p className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight">
                    {selectedBuild.specs.beamOverall.value}{' '}
                    <span className="text-xl md:text-2xl text-white/60">{selectedBuild.specs.beamOverall.imperial}</span>
                  </p>
                </motion.div>

                {/* Range */}
                <motion.div
                  custom={2}
                  variants={specItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="spec-item"
                >
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-4">
                    Range
                  </p>
                  <div className="h-0.5 bg-brand-blue mb-6 w-full" />
                  <p className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight">
                    {selectedBuild.specs.range.value}{' '}
                    <span className="text-xl md:text-2xl text-white/60">{selectedBuild.specs.range.unit}</span>
                  </p>
                </motion.div>

                {/* Cruising Speed */}
                <motion.div
                  custom={3}
                  variants={specItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="spec-item"
                >
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-4">
                    Cruising Speed
                  </p>
                  <div className="h-0.5 bg-brand-blue mb-6 w-full" />
                  <p className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight">
                    {selectedBuild.specs.cruisingSpeed.value}{' '}
                    <span className="text-xl md:text-2xl text-white/60">{selectedBuild.specs.cruisingSpeed.unit}</span>
                  </p>
                </motion.div>

                {/* Berths */}
                <motion.div
                  custom={4}
                  variants={specItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="spec-item"
                >
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-4">
                    Berths
                  </p>
                  <div className="h-0.5 bg-brand-blue mb-6 w-full" />
                  <p className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight">
                    {selectedBuild.specs.berths.value}
                  </p>
                </motion.div>

                {/* Construction */}
                <motion.div
                  custom={5}
                  variants={specItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="spec-item"
                >
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-4">
                    Construction
                  </p>
                  <div className="h-0.5 bg-brand-blue mb-6 w-full" />
                  <p className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight">
                    {selectedBuild.specs.construction.value}
                    {selectedBuild.specs.construction.detail && (
                      <>
                        <br />
                        <span className="text-xl md:text-2xl text-white/60">{selectedBuild.specs.construction.detail}</span>
                      </>
                    )}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Vessel Image Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedBuild.id + '-image'}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6 }}
            >
              <GlassCard variant="blue" padding="none" className="overflow-hidden">
                <div className="relative aspect-[21/9]">
                  <Image
                    src={selectedBuild.imageUrl}
                    alt={`${selectedBuild.name} - ${selectedBuild.model}`}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-brand-navy/20" />
                  
                  {/* Vessel Label */}
                  <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="bg-brand-navy/80 backdrop-blur-md rounded-xl px-5 py-3 border border-white/10"
                    >
                      <p className="text-brand-blue text-xs font-medium uppercase tracking-wider mb-1">
                        {selectedBuild.variant}
                      </p>
                      <p className="text-white text-xl font-semibold">{selectedBuild.name}</p>
                    </motion.div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
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
              Configure Your {selectedBuild.model}
            </h2>
            <p className="text-lg text-white/60 font-light max-w-2xl mx-auto mb-10">
              Work with our team to customise every detail of your {selectedBuild.name}. 
              From propulsion to interior finishes, we&apos;ll help bring your vision to life.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="lg" asChild>
                <Link href={`/contact?vessel=${selectedBuild.id}`}>
                  Start Configuration
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
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
    </main>
  );
}
