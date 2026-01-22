'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { VesselCard, GlassCard, Button, cn } from '@36zero/ui';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';

// Placeholder vessel data - in production, this would come from the database via API
const allVessels = [
  {
    id: 'Adventure One',
    name: 'Adventure One',
    manufacturer: 'Adventure Yachts',
    model: 'AY60',
    year: 2026,
    price: 2950000,
    currency: 'USD',
    length: 18.29,
    capacity: 10,
    maxSpeed: 18,
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
  },
  {
    id: 'ocean-pioneer',
    name: 'Ocean Pioneer',
    manufacturer: 'Hallberg-Rassy',
    model: '57',
    year: 2020,
    price: 980000,
    currency: 'EUR',
    length: 17.32,
    capacity: 6,
    maxSpeed: 9,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    status: 'available' as const,
  },
  {
    id: 'blue-moon',
    name: 'Blue Moon',
    manufacturer: 'Swan',
    model: '65',
    year: 2019,
    price: 2200000,
    currency: 'EUR',
    length: 19.81,
    capacity: 8,
    maxSpeed: 12,
    imageUrl: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80',
    status: 'available' as const,
  },
  {
    id: 'trade-wind',
    name: 'Trade Wind',
    manufacturer: 'Adventure Yachts',
    model: 'AY48',
    year: 2023,
    price: 890000,
    currency: 'EUR',
    length: 14.63,
    capacity: 4,
    maxSpeed: 9,
    imageUrl: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&q=80',
    status: 'available' as const,
  },
];

const manufacturers = ['All', 'Adventure Yachts', 'Oyster', 'Hallberg-Rassy', 'Swan'];
const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under €1M', min: 0, max: 1000000 },
  { label: '€1M - €1.5M', min: 1000000, max: 1500000 },
  { label: '€1.5M - €2M', min: 1500000, max: 2000000 },
  { label: 'Over €2M', min: 2000000, max: Infinity },
];
const lengthRanges = [
  { label: 'All Lengths', min: 0, max: Infinity },
  { label: 'Under 15m', min: 0, max: 15 },
  { label: '15m - 17m', min: 15, max: 17 },
  { label: '17m - 19m', min: 17, max: 19 },
  { label: 'Over 19m', min: 19, max: Infinity },
];

export default function VesselsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [selectedLengthRange, setSelectedLengthRange] = useState(lengthRanges[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest' | 'length'>('newest');

  // Filter and sort vessels
  const filteredVessels = useMemo(() => {
    let result = allVessels.filter((vessel) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !vessel.name.toLowerCase().includes(query) &&
          !vessel.manufacturer.toLowerCase().includes(query) &&
          !vessel.model.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Manufacturer filter
      if (selectedManufacturer !== 'All' && vessel.manufacturer !== selectedManufacturer) {
        return false;
      }

      // Price filter
      if (vessel.price < selectedPriceRange.min || vessel.price > selectedPriceRange.max) {
        return false;
      }

      // Length filter
      if (vessel.length < selectedLengthRange.min || vessel.length > selectedLengthRange.max) {
        return false;
      }

      return true;
    });

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'length':
        result.sort((a, b) => b.length - a.length);
        break;
    }

    return result;
  }, [searchQuery, selectedManufacturer, selectedPriceRange, selectedLengthRange, sortBy]);

  const activeFiltersCount = [
    selectedManufacturer !== 'All',
    selectedPriceRange !== priceRanges[0],
    selectedLengthRange !== lengthRanges[0],
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedManufacturer('All');
    setSelectedPriceRange(priceRanges[0]);
    setSelectedLengthRange(lengthRanges[0]);
    setSearchQuery('');
  };

  return (
    <main className="min-h-screen bg-brand-navy">
      <Header variant="solid" />

      {/* Page Header */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-brand-blue font-medium tracking-widest uppercase text-sm mb-2">
              Brokerage
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Available Vessels
            </h1>
            <p className="text-white/60 font-light max-w-2xl">
              Explore our curated selection of expedition and sailing yachts. 
              Each vessel has been carefully vetted for quality and ocean-going capability.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="pb-8 px-6 sticky top-20 z-30 bg-brand-navy/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 py-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search vessels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 text-white placeholder-white/40 border border-white/10 rounded-xl focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-brand-blue text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Manufacturer */}
              <div className="relative">
                <select
                  value={selectedManufacturer}
                  onChange={(e) => setSelectedManufacturer(e.target.value)}
                  className="appearance-none px-4 py-3 pr-10 bg-white/5 text-white border border-white/10 rounded-xl focus:border-brand-blue focus:outline-none cursor-pointer"
                >
                  {manufacturers.map((m) => (
                    <option key={m} value={m} className="bg-brand-navy">
                      {m === 'All' ? 'All Manufacturers' : m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>

              {/* Price Range */}
              <div className="relative">
                <select
                  value={selectedPriceRange.label}
                  onChange={(e) => {
                    const range = priceRanges.find((r) => r.label === e.target.value);
                    if (range) setSelectedPriceRange(range);
                  }}
                  className="appearance-none px-4 py-3 pr-10 bg-white/5 text-white border border-white/10 rounded-xl focus:border-brand-blue focus:outline-none cursor-pointer"
                >
                  {priceRanges.map((r) => (
                    <option key={r.label} value={r.label} className="bg-brand-navy">
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>

              {/* Length Range */}
              <div className="relative">
                <select
                  value={selectedLengthRange.label}
                  onChange={(e) => {
                    const range = lengthRanges.find((r) => r.label === e.target.value);
                    if (range) setSelectedLengthRange(range);
                  }}
                  className="appearance-none px-4 py-3 pr-10 bg-white/5 text-white border border-white/10 rounded-xl focus:border-brand-blue focus:outline-none cursor-pointer"
                >
                  {lengthRanges.map((r) => (
                    <option key={r.label} value={r.label} className="bg-brand-navy">
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none px-4 py-3 pr-10 bg-white/5 text-white border border-white/10 rounded-xl focus:border-brand-blue focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-brand-navy">Newest First</option>
                <option value="price-asc" className="bg-brand-navy">Price: Low to High</option>
                <option value="price-desc" className="bg-brand-navy">Price: High to Low</option>
                <option value="length" className="bg-brand-navy">Length</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="py-4 space-y-4 border-t border-white/10">
                  {/* Mobile filter selects */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <label className="block text-xs text-white/40 mb-1.5">Manufacturer</label>
                      <select
                        value={selectedManufacturer}
                        onChange={(e) => setSelectedManufacturer(e.target.value)}
                        className="w-full appearance-none px-3 py-2.5 pr-8 bg-white/5 text-white text-sm border border-white/10 rounded-lg"
                      >
                        {manufacturers.map((m) => (
                          <option key={m} value={m} className="bg-brand-navy">
                            {m === 'All' ? 'All' : m}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 bottom-3 w-4 h-4 text-white/40 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <label className="block text-xs text-white/40 mb-1.5">Price</label>
                      <select
                        value={selectedPriceRange.label}
                        onChange={(e) => {
                          const range = priceRanges.find((r) => r.label === e.target.value);
                          if (range) setSelectedPriceRange(range);
                        }}
                        className="w-full appearance-none px-3 py-2.5 pr-8 bg-white/5 text-white text-sm border border-white/10 rounded-lg"
                      >
                        {priceRanges.map((r) => (
                          <option key={r.label} value={r.label} className="bg-brand-navy">
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 bottom-3 w-4 h-4 text-white/40 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <label className="block text-xs text-white/40 mb-1.5">Length</label>
                      <select
                        value={selectedLengthRange.label}
                        onChange={(e) => {
                          const range = lengthRanges.find((r) => r.label === e.target.value);
                          if (range) setSelectedLengthRange(range);
                        }}
                        className="w-full appearance-none px-3 py-2.5 pr-8 bg-white/5 text-white text-sm border border-white/10 rounded-lg"
                      >
                        {lengthRanges.map((r) => (
                          <option key={r.label} value={r.label} className="bg-brand-navy">
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 bottom-3 w-4 h-4 text-white/40 pointer-events-none" />
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-brand-blue"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Results */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Results count */}
          <p className="text-sm text-white/40 mb-6">
            {filteredVessels.length} vessel{filteredVessels.length !== 1 ? 's' : ''} found
          </p>

          {/* Vessel Grid */}
          {filteredVessels.length > 0 ? (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredVessels.map((vessel, index) => (
                  <motion.div
                    key={vessel.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <VesselCard {...vessel} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <GlassCard padding="lg" className="text-center">
              <div className="py-12">
                <p className="text-lg text-white/60 mb-4">
                  No vessels match your current filters
                </p>
                <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </GlassCard>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard variant="blue" padding="lg">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Looking for Something Specific?
            </h2>
            <p className="text-white/60 font-light mb-8 max-w-xl mx-auto">
              Our team can help you find the perfect vessel. Whether you're looking 
              for a specific model or have custom requirements, we're here to assist.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" asChild>
                <a href="/contact">Contact Our Team</a>
              </Button>
              <Button variant="secondary" asChild>
                <a href="/sell">Sell Your Yacht</a>
              </Button>
            </div>
          </GlassCard>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
