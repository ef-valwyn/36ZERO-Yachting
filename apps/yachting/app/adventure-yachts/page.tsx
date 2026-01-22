'use client';

import React from 'react';
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
  Shield
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

// Vessel data - in production, this would come from CMS
const vessels = [
  {
    id: 'adventure-one',
    name: 'Adventure One',
    model: 'AY60 Sport',
    variant: 'Outboard Version',
    availability: 'Available Now',
    availabilityDate: null,
    status: 'available',
    imageUrl: '/images/ay60-gallery-1.png',
    description: 'The flagship AY60 Sport with triple outboard configuration for maximum performance and efficiency.',
  },
  {
    id: 'adventure-two',
    name: 'Adventure Two',
    model: 'AY60 Flybridge',
    variant: 'Hybrid Inboard Version',
    availability: 'Q3 2026',
    availabilityDate: '2026-07-01',
    status: 'coming-soon',
    imageUrl: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&q=80',
    description: 'The luxurious flybridge variant with hybrid inboard propulsion for extended range and comfort.',
  },
  {
    id: 'adventure-three',
    name: 'Adventure Three',
    model: 'AY60 Sport',
    variant: 'Outboard Version',
    availability: 'Q3 2026',
    availabilityDate: '2026-07-01',
    status: 'coming-soon',
    imageUrl: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&q=80',
    description: 'Another stunning AY60 Sport ready for customization to your exact specifications.',
  },
  {
    id: 'adventure-four',
    name: 'Adventure Four',
    model: 'AY60 Sport',
    variant: 'Long-Range Outboard Version',
    availability: 'Q4 2026',
    availabilityDate: '2026-10-01',
    status: 'coming-soon',
    imageUrl: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80',
    description: 'Extended fuel capacity and range optimization for serious ocean passages.',
  },
];

// Gallery images for AY60 showcase
const galleryImages = [
  { id: 1, url: '/images/ay60-gallery-1.png', alt: 'AY60 Exterior' },
  { id: 2, url: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1200&q=80', alt: 'AY60 Bow View' },
  { id: 3, url: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&q=80', alt: 'AY60 Interior' },
  { id: 4, url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1200&q=80', alt: 'AY60 Cockpit' },
  { id: 5, url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80', alt: 'AY60 Flybridge' },
  { id: 6, url: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=1200&q=80', alt: 'AY60 At Sea' },
];

// AY60 Specifications
const specifications = [
  { label: 'Length Overall', value: '60 ft / 18.3m' },
  { label: 'Beam', value: '26 ft / 7.9m' },
  { label: 'Draft', value: '4.2 ft / 1.3m' },
  { label: 'Displacement', value: '28,000 kg' },
  { label: 'Fuel Capacity', value: '3,000 L' },
  { label: 'Water Capacity', value: '800 L' },
  { label: 'Max Speed', value: '32 knots' },
  { label: 'Cruising Speed', value: '24 knots' },
  { label: 'Range', value: '400+ nm' },
  { label: 'Guests', value: '8-10' },
  { label: 'Cabins', value: '4' },
  { label: 'Crew', value: '2' },
];

// AY60 Vessel Areas for Interactive Explorer
// TODO: Update image URLs to Vercel Blob storage URLs
const vesselAreas = [
  {
    id: 'cockpit',
    name: 'Cockpit',
    imageUrl: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1920&q=80',
    hotspots: [
      { id: 1, x: 25, y: 30, label: 'Rain Shower' },
      { id: 2, x: 70, y: 45, label: 'Helm Controls' },
      { id: 3, x: 50, y: 70, label: 'Seating Area' },
    ],
  },
  {
    id: 'outdoor-deck',
    name: 'Outdoor Deck',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80',
    hotspots: [
      { id: 1, x: 30, y: 40, label: 'Sun Loungers' },
      { id: 2, x: 65, y: 35, label: 'Dining Area' },
      { id: 3, x: 80, y: 60, label: 'BBQ Station' },
    ],
  },
  {
    id: 'saloon',
    name: 'Saloon',
    imageUrl: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1920&q=80',
    hotspots: [
      { id: 1, x: 20, y: 50, label: 'Entertainment System' },
      { id: 2, x: 55, y: 40, label: 'L-Shaped Sofa' },
      { id: 3, x: 75, y: 65, label: 'Panoramic Windows' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1920&q=80',
    hotspots: [
      { id: 1, x: 25, y: 45, label: 'Induction Cooktop' },
      { id: 2, x: 60, y: 35, label: 'Wine Cooler' },
      { id: 3, x: 45, y: 70, label: 'Full-Size Refrigerator' },
    ],
  },
  {
    id: 'helm',
    name: 'Helm',
    imageUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920&q=80',
    hotspots: [
      { id: 1, x: 35, y: 40, label: 'Glass Cockpit Displays' },
      { id: 2, x: 65, y: 50, label: 'Joystick Control' },
      { id: 3, x: 50, y: 25, label: 'Chart Plotter' },
    ],
  },
  {
    id: 'beach-club',
    name: 'Beach Club',
    imageUrl: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=1920&q=80',
    hotspots: [
      { id: 1, x: 30, y: 55, label: 'Swim Platform' },
      { id: 2, x: 70, y: 40, label: 'Tender Garage' },
      { id: 3, x: 50, y: 75, label: 'Freshwater Shower' },
    ],
  },
  {
    id: 'berths',
    name: 'Berths',
    imageUrl: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1920&q=80',
    hotspots: [
      { id: 1, x: 40, y: 45, label: 'King-Size Bed' },
      { id: 2, x: 25, y: 60, label: 'En-Suite Bathroom' },
      { id: 3, x: 70, y: 35, label: 'Walk-In Wardrobe' },
    ],
  },
];

export default function AdventureYachtsPage() {
  const [activeGalleryIndex, setActiveGalleryIndex] = React.useState(0);
  const [slideDirection, setSlideDirection] = React.useState<'left' | 'right'>('right');
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const [galleryHoverZone, setGalleryHoverZone] = React.useState<'left' | 'right' | null>(null);
  const [activeVesselArea, setActiveVesselArea] = React.useState(vesselAreas[0]);

  // Auto-scroll gallery every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSlideDirection('right');
      setActiveGalleryIndex((prev) => (prev + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadSpecSheet = () => {
    // In production, this would link to a Vercel Blob URL
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
            src="/images/ay60-hero.png"
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p className="text-lg text-white/80 font-light leading-relaxed">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
                culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde 
                omnis iste natus error sit voluptatem accusantium doloremque laudantium.
              </p>
              <p className="text-lg text-white/80 font-light leading-relaxed">
                Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto 
                beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit 
                aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione.
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
                      src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920&q=80"
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
                    {/* In production, embed actual video player */}
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
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                            <div className="bg-brand-navy/95 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
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

      {/* Reserve Your Vessel Section */}
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

          {/* Vessel Cards */}
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
                      {vessel.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <Button 
                        variant={vessel.status === 'available' ? 'primary' : 'secondary'}
                        asChild
                      >
                        <Link href={`/contact?vessel=${vessel.id}`}>
                          {vessel.status === 'available' ? 'Inquire Now' : 'Register Interest'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild>
                        <Link href={`/vessels/${vessel.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

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
