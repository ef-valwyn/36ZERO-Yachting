'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, 
  Calendar, 
  Users, 
  Anchor, 
  MapPin,
  CheckCircle,
  Ship,
  FileText,
  CreditCard,
  Play
} from 'lucide-react';
import { 
  Button, 
  GlassCard, 
  RouteMap, 
  StepForm,
  type Passage,
  type RouteStage,
} from '@36zero/ui';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import LapLogo from '@/components/LapLogo';

// Passage data for the booking flow
const passages: Passage[] = [
  {
    id: 'pacific-gateway',
    name: 'Passage 1: The Pacific Gateway',
    description: 'Saint Lucia to Bora Bora via Galapagos and Marquesas. Pacific trade winds to French Polynesia.',
    startDate: '9 Jan 2027',
    endDate: '8 May 2027',
    distanceNm: 6100, // 2,100 + 3,000 + 1,000
    pricePerPerson: 45000,
    maxGuests: 4,
    requiresOffshoreCompetency: false,
  },
  {
    id: 'coral-crossing',
    name: 'Passage 2: Coral Crossing',
    description: 'Bora Bora to Lombok via Tonga and Australia. South Pacific islands to Indonesia.',
    startDate: '11 May 2027',
    endDate: '14 Sep 2027',
    distanceNm: 5600, // 1,300 + 1,900 + 2,400
    pricePerPerson: 52000,
    maxGuests: 4,
    requiresOffshoreCompetency: true,
  },
  {
    id: 'indian-ocean-odyssey',
    name: 'Passage 3: Indian Ocean Odyssey',
    description: 'Lombok to Cape Town via Cocos Islands and Réunion. Indian Ocean crossing to South Africa.',
    startDate: '18 Sep 2027',
    endDate: '15 Dec 2027',
    distanceNm: 5740, // 1,150 + 2,500 + 1,370 + 720
    pricePerPerson: 68000,
    maxGuests: 4,
    requiresOffshoreCompetency: true,
  },
  {
    id: 'atlantic-return',
    name: 'Passage 4: Atlantic Return',
    description: 'Cape Town to Saint Lucia via Recife and Grenada. South Atlantic tradewind crossing.',
    startDate: '16 Jan 2028',
    endDate: '15 Apr 2028',
    distanceNm: 6000, // 3,000 + 2,300 + 700
    pricePerPerson: 72000,
    maxGuests: 4,
    requiresOffshoreCompetency: true,
  },
];

// Route stages for the map
const routeStages: RouteStage[] = [
  // Passage 1: The Pacific Gateway (Saint Lucia to Bora Bora)
  {
    id: 'saint-lucia-start',
    passageId: 'pacific-gateway',
    name: 'Saint Lucia',
    coordinates: [-61.0, 14.0],
    arrivalDate: '9 Jan 2027',
    departureDate: '9 Jan 2027',
    distanceNm: 0,
    type: 'hub',
    logistics: { flightHub: 'Hewanorra UVF', notes: 'Circumnavigation start' },
    isActive: true,
  },
  {
    id: 'panama-canal',
    passageId: 'pacific-gateway',
    name: 'Panama Canal',
    coordinates: [-79.5, 9.1],
    arrivalDate: '25 Jan 2027',
    distanceNm: 1100,
    type: 'transit',
    logistics: { notes: 'Canal transit - Atlantic to Pacific' },
  },
  {
    id: 'galapagos',
    passageId: 'pacific-gateway',
    name: 'Galápagos Islands',
    coordinates: [-90.4, -0.6],
    arrivalDate: '2 Mar 2027',
    departureDate: '3 Mar 2027',
    distanceNm: 1000,
    type: 'stop',
    logistics: { flightHub: 'Baltra GPS', notes: 'Ecuador territory' },
  },
  {
    id: 'marquesas',
    passageId: 'pacific-gateway',
    name: 'Marquesas Islands',
    coordinates: [-140.1, -8.9],
    arrivalDate: '31 Mar 2027',
    departureDate: '1 Apr 2027',
    distanceNm: 3000,
    type: 'stop',
    logistics: { flightHub: 'Nuku Hiva NHV', notes: 'French Polynesia' },
  },
  {
    id: 'bora-bora',
    passageId: 'pacific-gateway',
    name: 'Bora Bora',
    coordinates: [-151.8, -16.5],
    arrivalDate: '8 May 2027',
    departureDate: '11 May 2027',
    distanceNm: 1000,
    type: 'hub',
    logistics: { flightHub: 'Bora Bora BOB via Tahiti PPT' },
  },
  // Passage 2: Coral Crossing (Bora Bora to Lombok)
  {
    id: 'tonga',
    passageId: 'coral-crossing',
    name: 'Tonga',
    coordinates: [-174.0, -18.6],
    arrivalDate: '29 May 2027',
    departureDate: '9 Jun 2027',
    distanceNm: 1300,
    type: 'stop',
    logistics: { flightHub: 'Tongatapu TBU', notes: 'Kingdom of Tonga' },
  },
  {
    id: 'fiji',
    passageId: 'coral-crossing',
    name: 'Fiji',
    coordinates: [178.0, -18.0],
    arrivalDate: '21 Jun 2027',
    distanceNm: 450,
    type: 'transit',
    logistics: { notes: 'Date Line crossing' },
  },
  {
    id: 'mackay',
    passageId: 'coral-crossing',
    name: 'Mackay, Australia',
    coordinates: [149.2, -21.1],
    arrivalDate: '21 Jul 2027',
    departureDate: '22 Jul 2027',
    distanceNm: 1450,
    type: 'stop',
    logistics: { flightHub: 'Mackay MKY', notes: 'Great Barrier Reef region' },
  },
  {
    id: 'lombok',
    passageId: 'coral-crossing',
    name: 'Lombok, Indonesia',
    coordinates: [116.1, -8.6],
    arrivalDate: '14 Sep 2027',
    departureDate: '18 Sep 2027',
    distanceNm: 2400,
    type: 'hub',
    logistics: { flightHub: 'Bali DPS + ferry', transfer: '2hr ferry from Bali' },
  },
  // Passage 3: Indian Ocean Odyssey (Lombok to Cape Town)
  {
    id: 'cocos-keeling',
    passageId: 'indian-ocean-odyssey',
    name: 'Cocos (Keeling) Islands',
    coordinates: [96.8, -12.1],
    arrivalDate: '30 Sep 2027',
    departureDate: '4 Oct 2027',
    distanceNm: 1150,
    type: 'stop',
    logistics: { flightHub: 'Cocos CCK via Perth', notes: 'Australian territory' },
  },
  {
    id: 'reunion',
    passageId: 'indian-ocean-odyssey',
    name: 'Réunion',
    coordinates: [55.3, -20.9],
    arrivalDate: '27 Oct 2027',
    departureDate: '3 Nov 2027',
    distanceNm: 2500,
    type: 'stop',
    logistics: { flightHub: 'Roland Garros RUN', notes: 'French territory' },
  },
  {
    id: 'richards-bay',
    passageId: 'indian-ocean-odyssey',
    name: 'Richards Bay',
    coordinates: [32.1, -28.8],
    arrivalDate: '14 Nov 2027',
    departureDate: '15 Nov 2027',
    distanceNm: 1370,
    type: 'stop',
    logistics: { flightHub: 'Richards Bay RCB', notes: 'South Africa' },
  },
  {
    id: 'cape-town',
    passageId: 'indian-ocean-odyssey',
    name: 'Cape Town',
    coordinates: [18.4, -33.9],
    arrivalDate: '15 Dec 2027',
    departureDate: '16 Jan 2028',
    distanceNm: 720,
    type: 'hub',
    logistics: { flightHub: 'Cape Town CPT', notes: 'Cape of Good Hope' },
  },
  // Passage 4: Atlantic Return (Cape Town to Saint Lucia)
  {
    id: 'recife',
    passageId: 'atlantic-return',
    name: 'Recife, Brazil',
    coordinates: [-34.9, -8.1],
    arrivalDate: '13 Feb 2028',
    departureDate: '2 Mar 2028',
    distanceNm: 3000,
    type: 'stop',
    logistics: { flightHub: 'Recife REC', notes: 'South Atlantic crossing' },
  },
  {
    id: 'grenada',
    passageId: 'atlantic-return',
    name: 'Grenada',
    coordinates: [-61.8, 12.1],
    arrivalDate: '23 Mar 2028',
    departureDate: '24 Mar 2028',
    distanceNm: 2300,
    type: 'stop',
    logistics: { flightHub: 'Maurice Bishop GND', notes: 'Caribbean arrival' },
  },
  {
    id: 'saint-lucia-end',
    passageId: 'atlantic-return',
    name: 'Saint Lucia',
    coordinates: [-61.0, 14.0],
    arrivalDate: '15 Apr 2028',
    distanceNm: 700,
    type: 'hub',
    logistics: { flightHub: 'Hewanorra UVF', notes: 'Circumnavigation complete!' },
  },
];

const journeySteps = [
  {
    icon: Ship,
    title: 'Choose Your Passage',
    description: 'Select one or more of the 4 passages that make up the circumnavigation route.',
  },
  {
    icon: FileText,
    title: 'Submit Documents',
    description: 'Upload your sailing certifications, passport, and complete required waivers.',
  },
  {
    icon: CreditCard,
    title: 'Secure Your Spot',
    description: 'Pay the deposit to confirm your place. Final payment due 60 days before departure.',
  },
  {
    icon: Anchor,
    title: 'Set Sail',
    description: 'Join the crew at your departure hub and begin your ocean adventure.',
  },
];

const cyclingPhrases = [
  'NO OWNERSHIP REQUIRED',
  'KEEP YOUR DAY JOB',
  'STAY IN SCHOOL',
  'FIND YOUR HORIZON',
];

export default function LAPPage() {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % cyclingPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBookingSubmit = (data: {
    selectedPassages: string[];
    guestCount: number;
    totalPrice: number;
  }) => {
    console.log('Booking submitted:', data);
    // In production, this would trigger the Stripe checkout flow
    alert(`Booking submitted! Total: $${data.totalPrice.toLocaleString()}`);
  };

  return (
    <main className="min-h-screen bg-brand-navy">
      <Header variant="solid" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background SVG */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            className="w-full h-full max-w-[1464px] opacity-30"
            viewBox="0 0 1464 950"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <path d="M1018 553.422L982.258 620.485L884.335 804.998C863.932 843.11 824.275 867 781.193 867H305L560.415 386.572L605.788 301.022L700.908 122.238C714.083 97.4708 739.809 82 767.811 82H894.329L784.982 287.936L739.943 372.669L725.745 399.33H725.908L644.14 553.422H1018Z" stroke="#2F97DD" strokeWidth="3"/>
            <path d="M598 82L342.226 562.421L296.79 647.971L201.692 826.725C188.507 851.514 162.73 867 134.673 867H7.84434L117.345 661.057L162.455 576.324L176.672 549.662H176.509L258.384 395.578H-116L-80.2076 328.508L18.0156 144.158C38.2839 105.882 77.9963 82 121.31 82H598Z" stroke="#2F97DD" strokeWidth="3"/>
          </svg>
        </div>
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* LAP Logo Badge */}
            <div className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-brand-blue/10 border border-brand-blue/20 mb-6">
              <LapLogo variant="full" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tighter text-white mb-6">
              Sail Around The World
              <br />
              {/* Cycling gradient text with roll-down animation */}
              <span className="h-[1.2em] inline-block overflow-hidden align-bottom">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phraseIndex}
                    className="text-gradient inline-block"
                    initial={{ y: '-100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    {cyclingPhrases[phraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>
            
            <p className="text-lg text-white/70 font-light mb-10 max-w-2xl mx-auto">
              The 36ZERO LAP is an ambitious oceanic circumnavigation broken into 4 passages. 
              Supported by 36ZERO Yachting every step along the World ARC™, join us for one leg or sail them all.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => setShowBookingForm(true)}
              >
                Book Your Passage
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <a href="#route">Explore The Route</a>
              </Button>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {[
              { value: '4', label: 'Passages' },
              { value: '14', label: 'Stages' },
              { value: '26,000+', label: 'Nautical Miles' },
              { value: '15', label: 'Months Total' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-brand-blue mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-white/50 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Route Map Section */}
      <section id="route" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-2">
              The Route
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              14 Stages Across 4 Passages
            </h2>
            <p className="text-white/60 font-light max-w-2xl mx-auto">
              Click on any hub marker to see detailed logistics, flight connections, 
              and what to expect at each stop.
            </p>
          </motion.div>

          <RouteMap
            stages={routeStages}
            mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}
            initialCenter={[50, 0]}
            initialZoom={2}
            totalDistance={26000}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-2">
              Why 36ZERO LAP
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Adventure Without Compromise
            </h2>
          </motion.div>

          {/* Feature 1: No Ownership Required - Card Left, Text Right */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <GlassCard variant="blue" padding="lg" className="h-full">
                <div className="aspect-[4/3] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center">
                      <Ship className="w-10 h-10 text-brand-blue" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">No Ownership Required</h3>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                No Ownership Required
              </h3>
              <p className="text-white/70 font-light leading-relaxed">
                Make your next lease an apartment that moves. The 36ZERO LAP offers sail and power vessels perfectly suited for long-range oceanic exploration in exceptional comfort.
              </p>
              <p className="text-white/70 font-light leading-relaxed">
                Have your own yacht? Join the 36ZERO LAP to benefit from pre-departure assessments, 24/7 global support, route planning, repairs and more.
              </p>
            </motion.div>
          </div>

          {/* Feature 2: Global Connectivity - Text Left, Card Right */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4 order-2 md:order-1"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                Global Connectivity by Design
              </h3>
              <p className="text-white/70 font-light leading-relaxed">
                All 36ZERO LAP vessels are part of our global connectivity suite powered by Starlink. Whether you are running a business, following the Ocean Education curriculum, or taking a sabbatical, we make sure you're always connected.
              </p>
              <p className="text-white/70 font-light leading-relaxed">
                From location positioning data, onboard diagnostics are plugged into 36ZERO by default.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="order-1 md:order-2"
            >
              <GlassCard variant="blue" padding="lg" className="h-full">
                <div className="aspect-[4/3] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center">
                      <svg className="w-10 h-10 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Global Connectivity</h3>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Feature 3: Crew Augmentation - Card Left, Text Right */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <GlassCard variant="blue" padding="lg" className="h-full">
                <div className="aspect-[4/3] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center">
                      <Users className="w-10 h-10 text-brand-blue" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Crew Augmentation</h3>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                Crew Augmentation
              </h3>
              <p className="text-white/70 font-light leading-relaxed">
                Whether it's your first voyage or you're a seasoned skipper, we know finding competent crew is important. We can place any crew from skipper to stew to support your journey from any major rally node.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Section - Coming Soon (set to true to enable) */}
      {false && (
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-2">
                The Journey
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Experience the Adventure
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Watch the story of the 36ZERO Life Adventure Passage and discover 
                what awaits you on this once-in-a-lifetime circumnavigation.
              </p>
            </motion.div>

            <motion.div
              className="relative aspect-video rounded-2xl overflow-hidden bg-brand-navy-50/20 border border-white/10"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              {/* Replace with actual video embed - e.g. YouTube: */}
              {/* <iframe src="https://www.youtube.com/embed/VIDEO_ID" ... /> */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-brand-blue/20 flex items-center justify-center mb-4 mx-auto">
                    <Play className="w-8 h-8 text-brand-blue ml-1" />
                  </div>
                  <p className="text-white/40 text-sm">Video coming soon</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Passages Overview */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-brand-navy-50/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-2">
              Choose Your Adventure
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              The Four Passages
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {passages.map((passage, index) => (
              <motion.div
                key={passage.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard variant="hover" padding="lg" className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-brand-blue text-sm font-medium mb-1">
                        {passage.startDate} - {passage.endDate}
                      </p>
                      <h3 className="text-xl font-semibold text-white">
                        {passage.name}
                      </h3>
                    </div>
                    {passage.requiresOffshoreCompetency && (
                      <span className="px-2 py-1 text-xs font-medium bg-accent-gold/20 text-accent-gold rounded-full whitespace-nowrap flex-shrink-0">
                        Offshore Required
                      </span>
                    )}
                  </div>
                  
                  <p className="text-white/60 font-light mb-6">
                    {passage.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-white/50 mb-6">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {passage.distanceNm.toLocaleString()} NM
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      Max {passage.maxGuests} guests
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    {/* Price hidden temporarily - data preserved in passage object
                    <div>
                      <p className="text-xs text-white/40">From</p>
                      <p className="text-2xl font-bold text-white">
                        ${passage.pricePerPerson.toLocaleString()}
                        <span className="text-sm font-normal text-white/50"> /person</span>
                      </p>
                    </div>
                    */}
                    <div /> {/* Spacer to maintain layout */}
                    <Button 
                      variant="ghost"
                      onClick={() => setShowBookingForm(true)}
                    >
                      Book Now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-2">
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Your Journey Starts Here
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {journeySteps.map((step, index) => (
              <motion.div
                key={step.title}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {index < journeySteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-brand-blue/50 to-transparent" />
                )}
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-brand-blue" />
                  </div>
                  <p className="text-xs text-brand-blue font-medium mb-2">
                    Step {index + 1}
                  </p>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/60 font-light">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-24 px-6 bg-gradient-to-b from-brand-blue/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <GlassCard variant="blue" padding="lg">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  What's Included
                </h3>
                <ul className="space-y-4">
                  {[
                    'Professional skipper and crew',
                    'All meals and provisions onboard',
                    'Safety equipment and briefings',
                    'Port fees and marina charges',
                    'Water sports equipment',
                    'Satellite communication access',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-teal flex-shrink-0 mt-0.5" />
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Requirements
                </h3>
                <ul className="space-y-4">
                  {[
                    'Valid passport with 6+ months validity',
                    'Travel insurance covering sailing activities',
                    'Basic sailing experience (Passage 1)',
                    'Offshore certification (Passages 2-4)',
                    'Medical fitness declaration',
                    'Emergency contact information',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full border border-white/30 flex-shrink-0 mt-0.5" />
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Booking Form Modal/Section */}
      {showBookingForm && (
        <section className="py-24 px-6" id="book">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-2">
                Build Your LAP
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Plan Your Passages
              </h2>
            </motion.div>

            <StepForm
              passages={passages}
              onSubmit={handleBookingSubmit}
            />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Sail the World?
            </h2>
            <p className="text-white/60 font-light mb-8 max-w-xl mx-auto">
              Join the most ambitious circumnavigation experience. 
              Limited spots available on each passage.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => setShowBookingForm(true)}
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/contact">Speak to Our Team</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
