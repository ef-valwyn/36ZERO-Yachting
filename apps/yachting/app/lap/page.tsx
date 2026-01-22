'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  CreditCard
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
    description: 'Saint Lucia to Bora Bora. Panama Canal Transit, Pacific trade winds to Tahiti\'s coral atolls.',
    startDate: '9 Jan 2027',
    endDate: '8 May 2027',
    distanceNm: 1973,
    pricePerPerson: 45000,
    maxGuests: 4,
    requiresOffshoreCompetency: false,
  },
  {
    id: 'coral-crossing',
    name: 'Passage 2: Coral Crossing',
    description: 'Bora Bora to Lombok. South Pacific islands, Great Barrier Reef and Indonesia.',
    startDate: '11 May 2027',
    endDate: '14 Sep 2027',
    distanceNm: 1680,
    pricePerPerson: 52000,
    maxGuests: 4,
    requiresOffshoreCompetency: true,
  },
  {
    id: 'indian-ocean-odyssey',
    name: 'Passage 3: Indian Ocean Odyssey',
    description: 'Lombok to Cape Town. True blue water adventure, Indian Ocean to Cape of Good Hope.',
    startDate: '18 Sep 2027',
    endDate: '15 Dec 2027',
    distanceNm: 5450,
    pricePerPerson: 68000,
    maxGuests: 4,
    requiresOffshoreCompetency: true,
  },
  {
    id: 'atlantic-return',
    name: 'Passage 4: Atlantic Return',
    description: 'Cape Town to Saint Lucia. Saint Helena stop, South Atlantic tradewind crossing.',
    startDate: '16 Jan 2028',
    endDate: '15 Apr 2028',
    distanceNm: 8780,
    pricePerPerson: 72000,
    maxGuests: 4,
    requiresOffshoreCompetency: true,
  },
];

// Route stages for the map
const routeStages: RouteStage[] = [
  {
    id: 'tahiti',
    passageId: 'pacific-dreams',
    name: 'Papeete, Tahiti',
    coordinates: [-149.5585, -17.5516],
    arrivalDate: 'April 1, 2025',
    departureDate: 'April 5, 2025',
    distanceNm: 0,
    type: 'hub',
    logistics: { flightHub: 'Tahiti PPT', transfer: 'Marina Taina pickup' },
    isActive: true,
  },
  {
    id: 'bora-bora',
    passageId: 'pacific-dreams',
    name: 'Bora Bora',
    coordinates: [-151.7415, -16.5004],
    arrivalDate: 'April 10, 2025',
    distanceNm: 173,
    type: 'hub',
  },
  {
    id: 'fiji',
    passageId: 'pacific-dreams',
    name: 'Suva, Fiji',
    coordinates: [178.4419, -18.1416],
    arrivalDate: 'June 25, 2025',
    distanceNm: 1800,
    type: 'hub',
    logistics: { flightHub: 'Fiji SUV', notes: 'Date Line crossing' },
  },
  {
    id: 'vanuatu',
    passageId: 'coral-crossing',
    name: 'Port Vila, Vanuatu',
    coordinates: [168.3220, -17.7340],
    arrivalDate: 'July 20, 2025',
    distanceNm: 580,
    type: 'hub',
  },
  {
    id: 'cairns',
    passageId: 'coral-crossing',
    name: 'Cairns, Australia',
    coordinates: [145.7781, -16.9186],
    arrivalDate: 'September 25, 2025',
    distanceNm: 1100,
    type: 'hub',
    logistics: { flightHub: 'Cairns CNS' },
  },
  {
    id: 'lombok',
    passageId: 'indian-ocean-odyssey',
    name: 'Lombok, Indonesia',
    coordinates: [116.3249, -8.5852],
    arrivalDate: 'October 25, 2025',
    distanceNm: 1450,
    type: 'hub',
    logistics: { flightHub: 'Bali DPS + boat', transfer: '20min boat from DPS' },
  },
  {
    id: 'maldives',
    passageId: 'indian-ocean-odyssey',
    name: 'Male, Maldives',
    coordinates: [73.5093, 4.1755],
    arrivalDate: 'December 15, 2025',
    distanceNm: 2200,
    type: 'hub',
    logistics: { flightHub: 'Male MLE' },
  },
  {
    id: 'djibouti',
    passageId: 'indian-ocean-odyssey',
    name: 'Djibouti City',
    coordinates: [43.1456, 11.5886],
    arrivalDate: 'February 20, 2026',
    distanceNm: 1800,
    type: 'hub',
    logistics: { flightHub: 'Djibouti JIB', notes: 'Gulf of Aden transit' },
  },
  {
    id: 'suez',
    passageId: 'atlantic-return',
    name: 'Port Said, Egypt',
    coordinates: [32.3019, 31.2653],
    arrivalDate: 'April 15, 2026',
    distanceNm: 1300,
    type: 'hub',
    logistics: { notes: 'Suez Canal transit' },
  },
  {
    id: 'gibraltar',
    passageId: 'atlantic-return',
    name: 'Gibraltar',
    coordinates: [-5.3536, 36.1408],
    arrivalDate: 'May 25, 2026',
    distanceNm: 1950,
    type: 'hub',
    logistics: { flightHub: 'Gibraltar GIB or Malaga AGP' },
  },
  {
    id: 'canaries',
    passageId: 'atlantic-return',
    name: 'Las Palmas, Gran Canaria',
    coordinates: [-15.4134, 28.1235],
    arrivalDate: 'June 15, 2026',
    distanceNm: 650,
    type: 'hub',
    logistics: { flightHub: 'Las Palmas LPA' },
  },
  {
    id: 'barbados',
    passageId: 'atlantic-return',
    name: 'Barbados',
    coordinates: [-59.5432, 13.1939],
    arrivalDate: 'July 20, 2026',
    distanceNm: 2700,
    type: 'hub',
    logistics: { flightHub: 'Barbados BGI', notes: 'Atlantic crossing' },
  },
  {
    id: 'antigua',
    passageId: 'atlantic-return',
    name: 'English Harbour, Antigua',
    coordinates: [-61.7648, 17.0078],
    arrivalDate: 'August 25, 2026',
    distanceNm: 180,
    type: 'hub',
    logistics: { flightHub: 'Antigua ANU', notes: 'Circumnavigation complete!' },
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

export default function LAPPage() {
  const [showBookingForm, setShowBookingForm] = useState(false);

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
              Sail Around
              <br />
              <span className="text-gradient">The World</span>
            </h1>
            
            <p className="text-lg text-white/70 font-light mb-10 max-w-2xl mx-auto">
              The Life Adventure Passage is a multi-year circumnavigation broken into 4 passages. 
              Join us for one leg or sail them all – no yacht ownership required.
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
              { value: '13', label: 'Stages' },
              { value: '26,000+', label: 'Nautical Miles' },
              { value: '18', label: 'Months Total' },
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
              13 Stages Across 4 Passages
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
          />
        </div>
      </section>

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
                    <div>
                      <p className="text-xs text-white/40">From</p>
                      <p className="text-2xl font-bold text-white">
                        ${passage.pricePerPerson.toLocaleString()}
                        <span className="text-sm font-normal text-white/50"> /person</span>
                      </p>
                    </div>
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
