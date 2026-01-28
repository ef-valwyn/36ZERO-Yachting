'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Download, 
  Play, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Anchor,
  Zap,
  Shield,
  Loader2
} from 'lucide-react';
import { Button, GlassCard } from '@36zero/ui';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import AdventureYachtsLogoMark from '@/components/AdventureYachtsLogoMark';

// Animation variants
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

// Types for vessel data from API
interface AdventureYacht {
  id: string;
  name: string;
  slug: string;
  model: string;
  variant: string;
  availability: string;
  availabilityDate: string | null;
  status: 'available' | 'coming-soon';
  imageUrl: string;
  description: string;
  shortDescription: string | null;
  manufacturer: string;
  year: number;
  price: number;
  currency: string;
  length: number;
  beam: number | null;
  draft: number | null;
  capacity: number;
  cabins: number | null;
  crew: number | null;
  maxSpeed: number | null;
  cruisingSpeed: number | null;
  fuelCapacity: number | null;
  waterCapacity: number | null;
  range: number | null;
  specs: Record<string, unknown> | null;
  galleryImages: string[];
}

// Gallery images for AY60 showcase
const BLOB_BASE = 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one';
const galleryImages = [
  { id: 1, url: `${BLOB_BASE}/hero-landing.png`, alt: 'AY60 Hero - Exterior View' },
  { id: 2, url: `${BLOB_BASE}/ay60-gallery-1.png`, alt: 'AY60 Gallery - At Sea' },
  { id: 3, url: `${BLOB_BASE}/front.jpeg`, alt: 'AY60 Front View' },
  { id: 4, url: `${BLOB_BASE}/side.jpeg`, alt: 'AY60 Side Profile' },
  { id: 5, url: `${BLOB_BASE}/sideaft.jpeg`, alt: 'AY60 Side Aft View' },
  { id: 6, url: `${BLOB_BASE}/portthreequarter.jpeg`, alt: 'AY60 Port Three-Quarter' },
  { id: 7, url: `${BLOB_BASE}/afterthreequarter.jpeg`, alt: 'AY60 Aft Three-Quarter' },
  { id: 8, url: `${BLOB_BASE}/cockpitmain.jpg`, alt: 'AY60 Main Cockpit' },
  { id: 9, url: `${BLOB_BASE}/cockpit1.jpg`, alt: 'AY60 Cockpit View 1' },
  { id: 10, url: `${BLOB_BASE}/cockpit2.jpg`, alt: 'AY60 Cockpit View 2' },
  { id: 11, url: `${BLOB_BASE}/cockpit3.jpg`, alt: 'AY60 Cockpit View 3' },
  { id: 12, url: `${BLOB_BASE}/kitchen.jpg`, alt: 'AY60 Kitchen' },
  { id: 13, url: `${BLOB_BASE}/kitchen2.jpg`, alt: 'AY60 Kitchen Detail' },
  { id: 14, url: `${BLOB_BASE}/grill.jpg`, alt: 'AY60 Outdoor Grill' },
  { id: 15, url: `${BLOB_BASE}/bedroomforward.jpg`, alt: 'AY60 Forward Cabin' },
  { id: 16, url: `${BLOB_BASE}/bedroomaft.jpg`, alt: 'AY60 Aft Cabin' },
  { id: 17, url: `${BLOB_BASE}/head1.jpg`, alt: 'AY60 Bathroom 1' },
  { id: 18, url: `${BLOB_BASE}/head2.jpg`, alt: 'AY60 Bathroom 2' },
  { id: 19, url: `${BLOB_BASE}/head3.jpg`, alt: 'AY60 Bathroom 3' },
  { id: 20, url: `${BLOB_BASE}/head4.jpg`, alt: 'AY60 Bathroom 4' },
];

// AY60 Specifications
const specifications = [
  { label: 'Length Overall', value: '60 ft / 18.3m' },
  { label: 'Beam', value: '30 ft / 8.47m' },
  { label: 'Draft', value: '2.8 ft / 0.9m' },
  { label: 'Displacement', value: '18,500 kg' },
  { label: 'Fuel Capacity', value: '1,660 L' },
  { label: 'Water Capacity', value: '1,290 L' },
  { label: 'Max Speed', value: '18 knots' },
  { label: 'Cruising Speed', value: '14 knots' },
  { label: 'Range', value: '2,000+ nm' },
  { label: 'Guests', value: '8-10' },
  { label: 'Cabins', value: '4+2' },
  { label: 'Crew', value: '2' },
];

// AY60 Vessel Areas for Interactive Explorer
const vesselAreas = [
  {
    id: 'cockpit',
    name: 'Cockpit',
    imageUrl: `${BLOB_BASE}/cockpitmain.jpg`,
    hotspots: [
      { id: 1, x: 92, y: 10, label: 'Rain Shower', tooltipPosition: 'left' as const },
      { id: 2, x: 55, y: 40, label: 'Helm Controls' },
      { id: 3, x: 50, y: 70, label: 'Seating Area' },
    ],
  },
  {
    id: 'outdoor-deck',
    name: 'Outdoor Deck',
    imageUrl: `${BLOB_BASE}/cockpit3.jpg`,
    hotspots: [
      { id: 1, x: 28, y: 10, label: 'Electric Storage Lockers' },
      { id: 2, x: 65, y: 45, label: 'BBQ Grill Station' },
      { id: 3, x: 84, y: 45, label: 'Day Bed' },
    ],
  },
  {
    id: 'saloon',
    name: 'Saloon',
    imageUrl: `${BLOB_BASE}/kitchen2.jpg`,
    hotspots: [
      { id: 1, x: 20, y: 50, label: 'Forward Deck Access' },
      { id: 2, x: 55, y: 40, label: 'Bar Service Area' },
      { id: 3, x: 45, y: 90, label: 'U-Shaped Dining' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    imageUrl: `${BLOB_BASE}/kitchen.jpg`,
    hotspots: [
      { id: 1, x: 25, y: 45, label: 'Panoramic Windows', tooltipPosition: 'left' as const },
      { id: 2, x: 75, y: 55, label: 'Convection Stove and Oven', tooltipPosition: 'left' as const },
      { id: 3, x: 89, y: 80, label: 'Dual Fridge/Freezer', tooltipPosition: 'left' as const },
    ],
  },
  {
    id: 'beach-club',
    name: 'Beach Club',
    imageUrl: `${BLOB_BASE}/front.jpeg`,
    hotspots: [
      { id: 1, x: 40, y: 55, label: 'Dual Anchor System' },
      { id: 2, x: 70, y: 45, label: 'Large Trampolines' },
      { id: 3, x: 50, y: 75, label: 'Electric Folding Stairway' },
    ],
  },
  {
    id: 'berths',
    name: 'Berths',
    imageUrl: `${BLOB_BASE}/bedroomaft.jpg`,
    hotspots: [
      { id: 1, x: 40, y: 45, label: 'Convertible Queen-Size Bed' },
      { id: 2, x: 20, y: 45, label: 'Sliding Door' },
      { id: 3, x: 70, y: 35, label: 'Large Windows' },
    ],
  },
];

export default function AdventureYachtsPage() {
  // State for vessel data from API
  const [vessels, setVessels] = useState<AdventureYacht[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeGalleryIndex, setActiveGalleryIndex] = React.useState(0);
  const [slideDirection, setSlideDirection] = React.useState<'left' | 'right'>('right');
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const [galleryHoverZone, setGalleryHoverZone] = React.useState<'left' | 'right' | null>(null);
  const [activeVesselArea, setActiveVesselArea] = React.useState(vesselAreas[0]);

  // Fetch adventure yachts from API
  useEffect(() => {
    async function fetchAdventureYachts() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/vessels/adventure-yachts');
        if (!response.ok) {
          throw new Error('Failed to fetch adventure yachts');
        }
        const data = await response.json();
        setVessels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vessels');
        console.error('Error fetching adventure yachts:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAdventureYachts();
  }, []);

  // Auto-scroll gallery every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSlideDirection('right');
      setActiveGalleryIndex((prev) => (prev + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadSpecSheet = () => {
    const specSheetUrl = '/documents/ay60-spec-sheet.pdf';
    window.open(specSheetUrl, '_blank');
  };

  const scrollToAY60 = () => {
    const element = document.getElementById('ay60-showcase');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextGalleryImage = () => {
    setSlideDirection('right');
    setActiveGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevGalleryImage = () => {
    setSlideDirection('left');
    setActiveGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToGalleryImage = (index: number) => {
    setSlideDirection(index > activeGalleryIndex ? 'right' : 'left');
    setActiveGalleryIndex(index);
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

  return (
    <main className="min-h-screen bg-brand-navy">
      <Header variant="transparent" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/hero-landing.png"
            alt="AY60 Power Catamaran"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/60 via-brand-navy/40 to-brand-navy" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/50 via-transparent to-brand-navy/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 mb-6"
            >
              <AdventureYachtsLogoMark size={16} className="text-brand-blue" />
              <span className="text-sm font-medium text-brand-blue">Adventure Yachts Partnership</span>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-4"
            >
              Introducing
            </motion.p>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tighter text-white leading-[0.9] mb-6"
            >
              The Brand New
              <br />
              <span className="text-gradient">AY60 Power Catamaran</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-white/70 font-light max-w-3xl mx-auto mb-10"
            >
              A revolutionary 60-foot power catamaran designed for those who demand 
              performance, luxury, and adventure without compromise. The future of ocean exploration starts here.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="primary" size="lg" onClick={scrollToAY60}>
                Discover AY60
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="secondary" size="lg" onClick={handleDownloadSpecSheet}>
                <Download className="w-4 h-4 mr-2" />
                Download Spec Sheet
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

      {/* About Adventure Yachts - DNA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        {/* DNA Helix Background Pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* DNA strand 1 */}
          <svg className="absolute -left-20 top-0 h-full w-40 opacity-5" viewBox="0 0 100 800">
            <path
              d="M50 0 Q80 50 50 100 Q20 150 50 200 Q80 250 50 300 Q20 350 50 400 Q80 450 50 500 Q20 550 50 600 Q80 650 50 700 Q20 750 50 800"
              fill="none"
              stroke="#2f97dd"
              strokeWidth="2"
            />
            <path
              d="M50 0 Q20 50 50 100 Q80 150 50 200 Q20 250 50 300 Q80 350 50 400 Q20 450 50 500 Q80 550 50 600 Q20 650 50 700 Q80 750 50 800"
              fill="none"
              stroke="#2f97dd"
              strokeWidth="2"
            />
            {/* Cross connections */}
            {[0, 100, 200, 300, 400, 500, 600, 700].map((y) => (
              <line key={y} x1="30" y1={y + 50} x2="70" y2={y + 50} stroke="#2f97dd" strokeWidth="1" />
            ))}
          </svg>
          
          {/* DNA strand 2 */}
          <svg className="absolute -right-20 top-20 h-full w-40 opacity-5" viewBox="0 0 100 800">
            <path
              d="M50 0 Q80 50 50 100 Q20 150 50 200 Q80 250 50 300 Q20 350 50 400 Q80 450 50 500 Q20 550 50 600 Q80 650 50 700 Q20 750 50 800"
              fill="none"
              stroke="#2f97dd"
              strokeWidth="2"
            />
            <path
              d="M50 0 Q20 50 50 100 Q80 150 50 200 Q20 250 50 300 Q80 350 50 400 Q20 450 50 500 Q80 550 50 600 Q20 650 50 700 Q80 750 50 800"
              fill="none"
              stroke="#2f97dd"
              strokeWidth="2"
            />
          </svg>

          {/* Floating DNA nodes */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-brand-blue/20"
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/3 right-1/3 w-2 h-2 rounded-full bg-brand-blue/30"
            animate={{ y: [0, 15, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-4 h-4 rounded-full bg-brand-blue/10"
            animate={{ y: [0, -25, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-4">
              Brand DNA
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About Adventure Yachts
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <p className="text-lg text-white/80 font-light leading-relaxed">
                Adventure Yachts designs and builds high-performance catamarans. Whether you&apos;re 
                looking to explore ownership, or operate private charters to dream destinations, 
                you&apos;re here because like us, you love freedom, comfort, craftsmanship, and 
                sustainability. An Adventure Yacht is like a high-end resort that moves with you. 
                It is off limits to others, but it holds no limits for you. Live life adrift yet 
                anchored to what matters as your perspective shifts with the passing shores.
              </p>
              <p className="text-lg text-white/80 font-light leading-relaxed">
                Our AY60 catamarans are built for years of performance by a team of Thai artisans 
                who incorporate multi-generational knowledge with the art and science of boatbuilding. 
                Engineered from exceptional materials, yachts are custom designed with optimal buoyancy, 
                adaptability, capacity, and efficiency. On our pursuit for function, we have not 
                overlooked style or comfort, matching ergonomics and ample storage capabilities with 
                feet-up, worries-down elegance.
              </p>
            </motion.div>

            {/* DNA Feature Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: Anchor, title: 'Heritage', desc: 'Decades of maritime excellence' },
                { icon: Zap, title: 'Innovation', desc: 'Cutting-edge technology' },
                { icon: Shield, title: 'Quality', desc: 'Uncompromising standards' },
                { icon: ArrowRight, title: 'Vision', desc: 'Future of ocean travel' },
              ].map((item, index) => (
                <GlassCard 
                  key={item.title} 
                  variant="hover" 
                  padding="md"
                  className="text-center"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-brand-blue" />
                    </div>
                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-white/60">{item.desc}</p>
                  </motion.div>
                </GlassCard>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* AY60 Showcase Section */}
      <section id="ay60-showcase" className="py-32 px-6 bg-gradient-to-b from-transparent via-brand-blue/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-4">
              The Flagship
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              AY60 Power Catamaran
            </h2>
            <p className="text-lg text-white/60 font-light max-w-3xl mx-auto mb-8">
              Experience the pinnacle of power catamaran design. The AY60 combines 
              revolutionary hull technology with luxurious amenities for the ultimate ocean adventure.
            </p>

            {/* Section Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-0">
              <a 
                href="#ay60-specifications" 
                className="px-4 py-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                Specifications
              </a>
              <span className="hidden md:inline text-white/30">|</span>
              <a 
                href="#ay60-tour" 
                className="px-4 py-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                Tour
              </a>
              <span className="hidden md:inline text-white/30">|</span>
              <a 
                href="#ay60-gallery" 
                className="px-4 py-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                Gallery
              </a>
              <span className="hidden md:inline text-white/30 mr-2">|</span>
              <a 
                href="#ay60-reserve" 
                className="px-5 py-2 bg-brand-blue text-white rounded-full text-sm font-semibold hover:bg-brand-blue/80 transition-colors shadow-glow"
              >
                Reserve Your AY60
              </a>
            </div>
          </motion.div>

          {/* Video Section */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard variant="blue" padding="none" className="overflow-hidden">
              <div className="relative aspect-video">
                {!isVideoPlaying ? (
                  <>
                    <Image
                      src="https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/hero-landing.png"
                      alt="AY60 Video Thumbnail"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-brand-navy/40 flex items-center justify-center">
                      <motion.button
                        onClick={() => setIsVideoPlaying(true)}
                        className="w-24 h-24 rounded-full bg-brand-blue flex items-center justify-center shadow-glow"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="w-10 h-10 text-white ml-1" />
                      </motion.button>
                    </div>
                    <div className="absolute bottom-6 left-6">
                      <p className="text-white font-semibold text-lg">Watch the AY60 in Action</p>
                      <p className="text-white/60 text-sm">3:45 min</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <p className="text-white/60">Video player placeholder - Connect to video source</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Specifications */}
          <motion.div
            id="ay60-specifications"
            className="mb-16 scroll-mt-24"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard variant="blue" padding="lg">
              <h3 className="text-2xl font-semibold text-white mb-8 text-center">
                Technical Specifications
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {specifications.map((spec, index) => (
                  <motion.div
                    key={spec.label}
                    className="text-center p-4 rounded-xl bg-white/5"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <p className="text-2xl font-bold text-brand-blue mb-1">{spec.value}</p>
                    <p className="text-sm text-white/60">{spec.label}</p>
                  </motion.div>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button variant="primary" onClick={handleDownloadSpecSheet}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Full Specifications
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Virtual Tour - Explore the AY60 */}
          <motion.div
            id="ay60-tour"
            className="mb-16 scroll-mt-24"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-4">
                Virtual Tour
              </p>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Explore the AY60
              </h3>
              <p className="text-white/60 font-light max-w-2xl mx-auto">
                Discover every detail of this exceptional power catamaran. Select an area below to explore.
              </p>
            </div>

            {/* Area Selection Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {vesselAreas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => setActiveVesselArea(area)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeVesselArea.id === area.id
                      ? 'bg-brand-blue text-white shadow-glow'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {area.name}
                </button>
              ))}
            </div>

            {/* Interactive Image Display */}
            <GlassCard variant="blue" padding="none" className="overflow-hidden">
              <div className="relative aspect-[16/9]">
                {/* Background Image with Transition */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeVesselArea.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={activeVesselArea.imageUrl}
                      alt={activeVesselArea.name}
                      fill
                      className="object-cover"
                    />
                    {/* Gradient overlay for better hotspot visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/40 via-transparent to-brand-navy/20" />
                  </motion.div>
                </AnimatePresence>

                {/* Hotspots */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeVesselArea.id + '-hotspots'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="absolute inset-0"
                  >
                    {activeVesselArea.hotspots.map((hotspot, index) => (
                      <motion.div
                        key={hotspot.id}
                        className="absolute group"
                        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      >
                        {/* Hotspot Marker */}
                        <div className="relative">
                          {/* Pulse ring */}
                          <div className="absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/30 animate-ping" />
                          
                          {/* Main circle */}
                          <div className="relative w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue border-2 border-white shadow-lg cursor-pointer flex items-center justify-center group-hover:scale-110 transition-transform">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>

                          {/* Expandable Label */}
                          <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                            hotspot.tooltipPosition === 'left' ? 'right-6' : 'left-6'
                          }`}>
                            <div className={`bg-brand-navy/95 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                              hotspot.tooltipPosition === 'left' 
                                ? '-translate-x-2 group-hover:translate-x-0' 
                                : 'translate-x-2 group-hover:translate-x-0'
                            }`}>
                              <p className="text-white text-sm font-medium">{hotspot.label}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Area Label */}
                <div className="absolute bottom-6 left-6">
                  <motion.div
                    key={activeVesselArea.id + '-label'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-brand-navy/80 backdrop-blur-md rounded-xl px-5 py-3 border border-white/10"
                  >
                    <p className="text-brand-blue text-xs font-medium uppercase tracking-wider mb-1">
                      Currently Viewing
                    </p>
                    <p className="text-white text-xl font-semibold">{activeVesselArea.name}</p>
                  </motion.div>
                </div>

                {/* Instruction hint */}
                <div className="absolute bottom-6 right-6">
                  <div className="bg-brand-navy/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                    <p className="text-white/60 text-xs">Hover over markers to explore features</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Photo Gallery */}
          <motion.div
            id="ay60-gallery"
            className="scroll-mt-24"
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
                  initial={{ 
                    x: slideDirection === 'right' ? '100%' : '-100%'
                  }}
                  animate={{ 
                    x: 0
                  }}
                  exit={{ 
                    x: slideDirection === 'right' ? '-100%' : '100%'
                  }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={galleryImages[activeGalleryIndex].url}
                    alt={galleryImages[activeGalleryIndex].alt}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              
              {/* Left Navigation Zone */}
              <motion.div
                className="absolute left-0 top-0 h-full w-1/8 flex items-center justify-start cursor-pointer z-10"
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
                    opacity: galleryHoverZone === 'left' ? 1 : 0 
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
                    opacity: galleryHoverZone === 'right' ? 1 : 0 
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
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reserve Your Vessel Section - Now powered by CMS */}
      <section id="ay60-reserve" className="py-32 px-6 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-4">
              Limited Availability
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Reserve Your Next Vessel
            </h2>
            <p className="text-lg text-white/60 font-light max-w-2xl mx-auto">
              Join the exclusive group of Adventure Yachts owners. Each vessel is 
              individually crafted to meet your exacting standards.
            </p>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-brand-blue animate-spin mb-4" />
              <p className="text-white/60">Loading available vessels...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <GlassCard padding="lg" className="text-center">
              <div className="py-12">
                <p className="text-lg text-accent-coral mb-4">{error}</p>
                <Button variant="secondary" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </GlassCard>
          )}

          {/* Vessel Cards - Dynamic from CMS */}
          {!isLoading && !error && vessels.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {vessels.map((vessel, index) => (
                <motion.div
                  key={vessel.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GlassCard variant="hover" padding="none" className="overflow-hidden group">
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={vessel.imageUrl}
                        alt={vessel.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent" />
                      
                      {/* Availability Badge */}
                      <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium ${
                        vessel.status === 'available' 
                          ? 'bg-accent-teal text-white' 
                          : 'bg-accent-gold/90 text-brand-navy'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {vessel.availability}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <p className="text-brand-blue text-sm font-medium mb-1">{vessel.model}</p>
                        <h3 className="text-2xl font-bold text-white mb-1">{vessel.name}</h3>
                        <p className="text-white/60 text-sm">{vessel.variant}</p>
                      </div>
                      
                      <p className="text-white/70 font-light mb-6">
                        {vessel.shortDescription || vessel.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <Button 
                          variant={vessel.status === 'available' ? 'primary' : 'secondary'}
                          asChild
                        >
                          <Link href={`/contact?vessel=${vessel.slug}`}>
                            {vessel.status === 'available' ? 'Inquire Now' : 'Register Interest'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                        <Button variant="ghost" asChild>
                          <Link href={`/vessels/${vessel.slug}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && vessels.length === 0 && (
            <GlassCard padding="lg" className="text-center">
              <div className="py-12">
                <Anchor className="w-12 h-12 text-brand-blue/50 mx-auto mb-4" />
                <p className="text-lg text-white/60 mb-2">
                  No Adventure Yachts available at the moment
                </p>
                <p className="text-sm text-white/40 mb-6">
                  Contact us to learn about upcoming availability
                </p>
                <Button variant="primary" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </GlassCard>
          )}

          {/* CTA */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-white/60 mb-4">
              Can&apos;t find what you&apos;re looking for?
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/contact">
                Discuss Custom Build Options
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
