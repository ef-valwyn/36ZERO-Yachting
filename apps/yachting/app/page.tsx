'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Compass, Ship, Globe } from 'lucide-react';
import { HeroVideo, Button, GlassCard, VesselCard } from '@36zero/ui';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';

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

// Placeholder vessel data - in production, this would come from the database
const featuredVessels = [
  {
    id: 'azure-horizon',
    name: 'Azure Horizon',
    manufacturer: 'Adventure Yachts',
    model: 'AY60',
    year: 2023,
    price: 1850000,
    currency: 'EUR',
    length: 18.29,
    capacity: 8,
    maxSpeed: 12,
    imageUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
    status: 'available' as const,
    isFeatured: true,
  },
  {
    id: 'southern-cross',
    name: 'Southern Cross',
    manufacturer: 'Adventure Yachts',
    model: 'AY52',
    year: 2022,
    price: 1250000,
    currency: 'EUR',
    length: 15.85,
    capacity: 6,
    maxSpeed: 10,
    imageUrl: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&q=80',
    status: 'available' as const,
    isFeatured: false,
  },
  {
    id: 'windward-spirit',
    name: 'Windward Spirit',
    manufacturer: 'Oyster',
    model: '565',
    year: 2021,
    price: 1650000,
    currency: 'GBP',
    length: 17.0,
    capacity: 6,
    maxSpeed: 11,
    imageUrl: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&q=80',
    status: 'under-contract' as const,
    isFeatured: false,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-navy">
      <Header variant="transparent" />

      {/* Hero Section - "Horizon Office" */}
      <HeroVideo
        videoSrc="/videos/hero-ocean.mp4"
        posterSrc="/images/hero-poster.jpg"
        fallbackColor="#071923"
        overlayOpacity={0.6}
      >
        <div className="flex items-center justify-center h-full px-6">
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
              Welcome to 36ZERO
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
                <Link href="/lap">Explore LAP</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </HeroVideo>

      {/* Value Propositions */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard variant="hover" padding="lg" className="text-center">
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

            <GlassCard variant="hover" padding="lg" className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-blue/10 flex items-center justify-center">
                <Compass className="w-8 h-8 text-brand-blue" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Adventure Yachts
              </h3>
              <p className="text-white/60 font-light">
                Exclusive partnership with Adventure Yachts – purpose-built 
                vessels for serious ocean passages.
              </p>
            </GlassCard>

            <GlassCard variant="hover" padding="lg" className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-blue/10 flex items-center justify-center">
                <Globe className="w-8 h-8 text-brand-blue" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                LAP Circumnavigation
              </h3>
              <p className="text-white/60 font-light">
                Join the most ambitious sailing journey – sail passages of 
                our global circumnavigation.
              </p>
            </GlassCard>
          </motion.div>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVessels.map((vessel, index) => (
              <motion.div
                key={vessel.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={vessel.isFeatured ? 'lg:col-span-2' : ''}
              >
                <VesselCard {...vessel} />
              </motion.div>
            ))}
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
                  <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-4">
                    36ZERO LAP
                  </p>
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
                  { value: '13', label: 'Stages' },
                  { value: '26,000', label: 'Nautical Miles' },
                  { value: '18', label: 'Months' },
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

      <SiteFooter />
    </main>
  );
}
