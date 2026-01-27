'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Ship, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button, GlassCard, VesselCard } from '@36zero/ui';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import LogoLapMark from '@/components/LogoLapMark';
import LapLogo from '@/components/LapLogo';
import AdventureYachtsLogoMark from '@/components/AdventureYachtsLogoMark';

// Animation variants for staggered entry
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.5,
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
interface Vessel {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  length: number;
  capacity: number;
  maxSpeed: number | null;
  imageUrl: string;
  status: string;
  isFeatured: boolean;
  availabilityText?: string | null;
}

export default function HomePage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch featured vessels from API
  useEffect(() => {
    async function fetchVessels() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/vessels');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        // Take first 3 vessels for featured section
        setVessels(data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching vessels:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVessels();
  }, []);

  return (
    <main className="min-h-screen bg-brand-navy">
      <Header variant="transparent" />

      {/* Hero Section - "Horizon Office" */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/heros/AY60-Hero.png"
            alt="Luxury catamaran on calm blue waters"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/70 via-brand-navy/40 to-brand-navy/80" />
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center justify-center px-6 pt-20">
          <motion.div
            className="text-center max-w-4xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={itemVariants}
              className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-4"
            >
              WELCOME TO 36ZERO YACHTING
            </motion.p>
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter text-white leading-[0.9] mb-6"
            >
              Your Horizon
              <br />
              <span className="text-gradient">Office Awaits</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto mb-10"
            >
              Premium yacht brokerage and the world's most ambitious 
              circumnavigation experience. Own the ocean, or sail it with us.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="primary" size="lg" asChild>
                <Link href="/vessels">
                  Browse Vessels
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/lap" className="flex items-center gap-3">
                  Explore
                  <LapLogo className="h-5 w-auto [&_svg]:h-5 [&_svg]:w-auto" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Premium Brokerage - slides from left */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Link href="/vessels" className="block h-full">
                <GlassCard variant="hover" padding="lg" className="text-center h-full cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-blue/10 flex items-center justify-center">
                    <Ship className="w-8 h-8 text-brand-blue" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Premium Brokerage
                  </h3>
                  <p className="text-white/60 font-light">
                    Curated selection of expedition and sailing yachts from 
                    world-renowned manufacturers.
                  </p>
                </GlassCard>
              </Link>
            </motion.div>

            {/* Adventure Yachts - slides from bottom */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              <Link href="/adventure-yachts" className="block h-full">
                <GlassCard variant="hover" padding="lg" className="text-center h-full cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-blue/10 flex items-center justify-center">
                    <AdventureYachtsLogoMark size={36} className="text-brand-blue" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Adventure Yachts
                  </h3>
                  <p className="text-white/60 font-light">
                    Exclusive partnership with Adventure Yachts – purpose-built 
                    vessels for serious ocean passages.
                  </p>
                </GlassCard>
              </Link>
            </motion.div>

            {/* 36ZERO LAP - slides from right */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            >
              <Link href="/lap" className="block h-full">
                <GlassCard variant="hover" padding="lg" className="text-center h-full cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-blue/10 flex items-center justify-center">
                    <LogoLapMark size={32} className="text-brand-blue" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    36ZERO LAP™
                  </h3>
                  <p className="text-white/60 font-light">
                    Join the most ambitious sailing journey – sail passages of 
                    our global circumnavigation.
                  </p>
                </GlassCard>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LAP CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 via-transparent to-brand-blue/5" />
        
        <div className="max-w-7xl mx-auto relative">
          <GlassCard variant="blue" padding="none" className="overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Content */}
              <div className="p-10 lg:p-16 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <LapLogo className="mb-6" />
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Sail the World
                    <br />
                    <span className="text-brand-blue">One Passage at a Time</span>
                  </h2>
                  <p className="text-white/70 font-light mb-8 max-w-lg">
                    Join our circumnavigation journey. Choose from 4 passages 
                    spanning the Pacific, Coral Sea, Indian Ocean, and Atlantic. 
                    No yacht required – just your sense of adventure.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="primary" asChild>
                      <Link href="/lap">
                        Explore The Route
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href="/lap/passages">View Passages</Link>
                    </Button>
                  </div>
                </motion.div>
              </div>

              {/* Stats */}
              <div className="bg-brand-navy/50 p-10 lg:p-16 grid grid-cols-2 gap-8">
                {[
                  { value: '4', label: 'Passages' },
                  { value: '14', label: 'Stages' },
                  { value: '26,000', label: 'Nautical Miles' },
                  { value: '15', label: 'Months' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <p className="text-4xl md:text-5xl font-bold text-brand-blue mb-2">
                      {stat.value}
                    </p>
                    <p className="text-sm text-white/60 uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Featured Vessels */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-brand-navy-50/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-2">
                Available Now
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Featured Vessels
              </h2>
            </div>
            <Button variant="ghost" asChild className="mt-4 md:mt-0">
              <Link href="/vessels">
                View All Vessels
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            </div>
          )}

          {/* Vessels Grid */}
          {!isLoading && vessels.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vessels.map((vessel, index) => (
                <motion.div
                  key={vessel.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={vessel.isFeatured ? 'lg:col-span-2' : ''}
                >
                  <VesselCard 
                    {...vessel} 
                    maxSpeed={vessel.maxSpeed ?? undefined}
                    status={vessel.status === 'reserved' ? 'under-contract' : vessel.status as 'available' | 'under-contract' | 'sold'}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && vessels.length === 0 && (
            <GlassCard padding="lg" className="text-center">
              <p className="text-white/60">No vessels available at the moment.</p>
              <Button variant="primary" asChild className="mt-4">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </GlassCard>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
