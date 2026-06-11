'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import type { ResolvedAdventureYachtPriceEntry } from '@36zero/database';
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
  pricing: {
    card: ResolvedAdventureYachtPriceEntry;
    detail: ResolvedAdventureYachtPriceEntry[];
  } | null;
}

// Gallery images for AY60 showcase
const BLOB_BASE = 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one';
const galleryImages = [
  { id: 1, url: `${BLOB_BASE}/hero-landing.png`, alt: 'AY60 Hero - Exterior View' },
  { id: 2, url: `${BLOB_BASE}/real-DJI_20260226162622_0007_D.jpg`, alt: 'AY60 Aerial - Starboard Cruising with Island Backdrop' },
  { id: 3, url: `${BLOB_BASE}/real-DJI_20260226162648_0010_D.jpg`, alt: 'AY60 Aerial - Port Three-Quarter Cruising' },
  { id: 4, url: `${BLOB_BASE}/real-DJI_20260226162945_0024_D.jpg`, alt: 'AY60 Aerial - Starboard Cruising at Sunset' },
  { id: 5, url: `${BLOB_BASE}/real-DJI_20260226163041_0029_D.jpg`, alt: 'AY60 Aerial - Port Side Underway' },
  { id: 6, url: `${BLOB_BASE}/real-DJI_20260226163300_0041_D.jpg`, alt: 'AY60 Aerial - Bow Head-On View' },
  { id: 7, url: `${BLOB_BASE}/real-DJI_20260226163405_0045_D.jpg`, alt: 'AY60 Aerial - Top-Down Overhead View' },
  { id: 8, url: `${BLOB_BASE}/real-DJI_20260226170642_0001_D.jpg`, alt: 'AY60 Aerial - Anchored Near Island' },
  { id: 9, url: `${BLOB_BASE}/real-DJI_20260226171500_0033_D.jpg`, alt: 'AY60 Aerial - Broadside Profile at Anchor' },
  { id: 10, url: `${BLOB_BASE}/real-DJI_20260226172815_0055_D.jpg`, alt: 'AY60 Aft Swim Platform and Boarding Steps' },
  { id: 11, url: `${BLOB_BASE}/real-DJI_20260226172926_0060_D.jpg`, alt: 'AY60 Aerial - Three-Quarter View with Solar Hardtop' },
  { id: 12, url: `${BLOB_BASE}/real-DJI_20260226180239_0092_D.jpg`, alt: 'AY60 Aerial - Aft Quarter View at Dusk' },
  { id: 13, url: `${BLOB_BASE}/real-DJI_20260226185233_0004_D.jpg`, alt: 'AY60 Twilight - Underwater LED Lights Illuminated' },
  { id: 14, url: `${BLOB_BASE}/real-DJI_20260226185347_0011_D.jpg`, alt: 'AY60 Twilight - Side Profile with Cabin Glow' },
  { id: 15, url: `${BLOB_BASE}/real-DJI_20260226185436_0014_D.jpg`, alt: 'AY60 Twilight - Stern View with Blue Underwater Lights' },
  { id: 16, url: `${BLOB_BASE}/real-DJI_20260226185604_0021_D.jpg`, alt: 'AY60 Twilight - Port Quarter with Dramatic Sky' },
  { id: 17, url: `${BLOB_BASE}/real-DSC05832.jpg`, alt: 'AY60 Flybridge Dining Area with Teak Table' },
  { id: 18, url: `${BLOB_BASE}/real-DSC05833.jpg`, alt: 'AY60 Flybridge Dining and Helm Station' },
  { id: 19, url: `${BLOB_BASE}/real-DSC05835.jpg`, alt: 'AY60 Aft Cockpit Lounge and Dining' },
  { id: 20, url: `${BLOB_BASE}/real-DSC05837.jpg`, alt: 'AY60 Salon Dining and Galley with Panoramic Windows' },
  { id: 21, url: `${BLOB_BASE}/real-DSC05841.jpg`, alt: 'AY60 Helm Station with Dual Displays' },
  { id: 22, url: `${BLOB_BASE}/real-DSC05843.jpg`, alt: 'AY60 Helm Navigation Screens Close-Up' },
  { id: 23, url: `${BLOB_BASE}/real-DSC05844.jpg`, alt: 'AY60 Interior Companionway and Stairwell' },
  { id: 24, url: `${BLOB_BASE}/real-DSC05845.jpg`, alt: 'AY60 Hull Interior - Galley and Seating Nook' },
  { id: 25, url: `${BLOB_BASE}/real-DSC05847.jpg`, alt: 'AY60 Cabin with Double Bed and Portholes' },
  { id: 26, url: `${BLOB_BASE}/real-DSC05849.jpg`, alt: 'AY60 Hull Galley and Shower Entrance' },
  { id: 27, url: `${BLOB_BASE}/real-DSC05856.jpg`, alt: 'AY60 Hull Cabin with Galley and Storage' },
  { id: 28, url: `${BLOB_BASE}/ay60-gallery-1.png`, alt: 'AY60 Gallery - At Sea' },
  { id: 29, url: `${BLOB_BASE}/front.jpeg`, alt: 'AY60 Front View' },
  { id: 30, url: `${BLOB_BASE}/side.jpeg`, alt: 'AY60 Side Profile' },
  { id: 31, url: `${BLOB_BASE}/sideaft.jpeg`, alt: 'AY60 Side Aft View' },
  { id: 32, url: `${BLOB_BASE}/portthreequarter.jpeg`, alt: 'AY60 Port Three-Quarter' },
  { id: 33, url: `${BLOB_BASE}/afterthreequarter.jpeg`, alt: 'AY60 Aft Three-Quarter' },
  { id: 34, url: `${BLOB_BASE}/cockpitmain.jpg`, alt: 'AY60 Main Cockpit' },
  { id: 35, url: `${BLOB_BASE}/cockpit1.jpg`, alt: 'AY60 Cockpit View 1' },
  { id: 36, url: `${BLOB_BASE}/cockpit2.jpg`, alt: 'AY60 Cockpit View 2' },
  { id: 37, url: `${BLOB_BASE}/cockpit3.jpg`, alt: 'AY60 Cockpit View 3' },
  { id: 38, url: `${BLOB_BASE}/kitchen.jpg`, alt: 'AY60 Kitchen' },
  { id: 39, url: `${BLOB_BASE}/kitchen2.jpg`, alt: 'AY60 Kitchen Detail' },
  { id: 40, url: `${BLOB_BASE}/grill.jpg`, alt: 'AY60 Outdoor Grill' },
  { id: 41, url: `${BLOB_BASE}/bedroomforward.jpg`, alt: 'AY60 Forward Cabin' },
  { id: 42, url: `${BLOB_BASE}/bedroomaft.jpg`, alt: 'AY60 Aft Cabin' },
  { id: 43, url: `${BLOB_BASE}/head1.jpg`, alt: 'AY60 Bathroom 1' },
  { id: 44, url: `${BLOB_BASE}/head2.jpg`, alt: 'AY60 Bathroom 2' },
  { id: 45, url: `${BLOB_BASE}/head3.jpg`, alt: 'AY60 Bathroom 3' },
  { id: 46, url: `${BLOB_BASE}/head4.jpg`, alt: 'AY60 Bathroom 4' },
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

export default function AdventureYachtDetail({ build, allBuilds, pricing }: Props) {
  const [isEnquireModalOpen, setIsEnquireModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount);
  const formatPricingEntry = (entry: ResolvedAdventureYachtPriceEntry) =>
    [entry.prefix, entry.currency, formatAmount(entry.amount)].filter(Boolean).join(' ');

  // Gallery state
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [galleryHoverZone, setGalleryHoverZone] = useState<'left' | 'right' | null>(null);
  const [galleryInteractionKey, setGalleryInteractionKey] = useState(0);

  // Auto-scroll gallery every 5 seconds — resets on user interaction
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideDirection('right');
      setActiveGalleryIndex((prev) => (prev + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [galleryInteractionKey]);

  const nextGalleryImage = () => {
    setSlideDirection('right');
    setActiveGalleryIndex((prev) => (prev + 1) % galleryImages.length);
    setGalleryInteractionKey((k) => k + 1);
  };

  const prevGalleryImage = () => {
    setSlideDirection('left');
    setActiveGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    setGalleryInteractionKey((k) => k + 1);
  };

  const goToGalleryImage = (index: number) => {
    setSlideDirection(index > activeGalleryIndex ? 'right' : 'left');
    setActiveGalleryIndex(index);
    setGalleryInteractionKey((k) => k + 1);
  };

  const handleGalleryMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    if (x < width / 3) {
      setGalleryHoverZone('left');
    } else if (x > (width * 2) / 3) {
      setGalleryHoverZone('right');
    } else {
      setGalleryHoverZone(null);
    }
  };

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
          <Image
            src={build.imageUrl}
            alt={`${build.name} hero image`}
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/70 via-brand-navy/45 to-brand-navy/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-brand-navy/35" />
          
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
                  {pricing && (
                    <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                      <p className="text-xs font-semibold tracking-[0.24em] uppercase text-brand-blue/80 mb-3">
                        Pricing
                      </p>
                      <div className="space-y-3">
                        {pricing.detail.map((entry) => (
                          <div key={`${entry.label ?? 'base'}-${entry.currency}-${entry.amount}`}>
                            {entry.label && (
                              <p className="text-sm font-medium text-white/60 mb-1">{entry.label}</p>
                            )}
                            <p className="text-xl md:text-2xl font-semibold text-white">
                              {formatPricingEntry(entry)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

      {/* Photo Gallery */}
      <section className="py-8 md:py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Main Gallery Image with Overlay Navigation */}
            <div
              className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4 cursor-pointer"
              onMouseMove={handleGalleryMouseMove}
              onMouseLeave={() => setGalleryHoverZone(null)}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={activeGalleryIndex}
                  initial={{ x: slideDirection === 'right' ? '100%' : '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: slideDirection === 'right' ? '-100%' : '100%' }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={galleryImages[activeGalleryIndex].url}
                    alt={galleryImages[activeGalleryIndex].alt}
                    fill
                    sizes="(max-width: 1280px) 100vw, 1152px"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Left Navigation Zone */}
              <motion.div
                className="absolute left-0 top-0 h-full flex items-center justify-start cursor-pointer z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: galleryHoverZone === 'left' ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                onClick={prevGalleryImage}
                style={{ width: '12.5%' }}
              >
                <motion.div
                  className="h-full flex items-center pl-4"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{
                    x: galleryHoverZone === 'left' ? 0 : -50,
                    opacity: galleryHoverZone === 'left' ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{
                    background: 'linear-gradient(to right, rgba(7, 25, 35, 0.8), transparent)',
                    width: '200%',
                  }}
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </motion.div>
              </motion.div>

              {/* Right Navigation Zone */}
              <motion.div
                className="absolute right-0 top-0 h-full flex items-center justify-end cursor-pointer z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: galleryHoverZone === 'right' ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                onClick={nextGalleryImage}
                style={{ width: '12.5%' }}
              >
                <motion.div
                  className="h-full flex items-center justify-end pr-4"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{
                    x: galleryHoverZone === 'right' ? 0 : 50,
                    opacity: galleryHoverZone === 'right' ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{
                    background: 'linear-gradient(to left, rgba(7, 25, 35, 0.8), transparent)',
                    width: '200%',
                  }}
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </motion.div>
              </motion.div>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-brand-navy/80 backdrop-blur-sm z-10">
                <span className="text-sm text-white">
                  {activeGalleryIndex + 1} / {galleryImages.length}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {galleryImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToGalleryImage(index)}
                  className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all ${
                    index === activeGalleryIndex
                      ? 'ring-2 ring-brand-blue'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
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
