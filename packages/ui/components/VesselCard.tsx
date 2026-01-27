'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Ruler, Users, Gauge } from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';

export interface VesselCardProps {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  year: number;
  price: number;
  currency?: string;
  length: number; // in meters
  capacity: number;
  maxSpeed?: number | null; // in knots
  imageUrl: string;
  status?: 'available' | 'under-contract' | 'sold';
  availabilityText?: string | null; // Custom text to show instead of status (e.g. "Q2 2026")
  isFeatured?: boolean;
  className?: string;
}

const statusLabels = {
  available: 'Available',
  'under-contract': 'Under Contract',
  sold: 'Sold',
};

const statusColors = {
  available: 'bg-accent-teal',
  'under-contract': 'bg-accent-gold',
  sold: 'bg-accent-coral',
};

export const VesselCard: React.FC<VesselCardProps> = ({
  id,
  name,
  manufacturer,
  model,
  year,
  price,
  currency = 'USD',
  length,
  capacity,
  maxSpeed,
  imageUrl,
  status = 'available',
  availabilityText,
  isFeatured = false,
  className,
}) => {
  return (
    <motion.article
      className={cn(
        'vessel-card group',
        isFeatured && 'lg:col-span-2',
        className
      )}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/vessels/${id}`} className="block">
        {/* Image Container */}
        <div
          className={cn(
            'vessel-card-image',
            isFeatured && 'lg:aspect-[21/9]'
          )}
        >
          <Image
            src={imageUrl}
            alt={`${manufacturer} ${model}`}
            fill
            sizes={isFeatured ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay on hover */}
          <div className="vessel-card-overlay" />
          
          {/* Status Badge */}
          <span
            className={cn(
              'vessel-card-badge',
              availabilityText && status !== 'available' ? 'bg-accent-gold' : statusColors[status]
            )}
          >
            {availabilityText && status !== 'available' ? availabilityText : statusLabels[status]}
          </span>

          {/* Featured Badge */}
          {isFeatured && (
            <span className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-accent-gold text-brand-navy rounded-full">
              Featured
            </span>
          )}

          {/* Quick View Arrow */}
          <motion.div
            className="absolute bottom-4 right-4 p-3 rounded-full bg-brand-blue text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ scale: 1.1 }}
          >
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="vessel-card-content">
          {/* Manufacturer & Model */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-blue uppercase tracking-wider">
              {manufacturer}
            </p>
            <h3 className="text-xl font-semibold text-white">
              {name}
            </h3>
            <p className="text-sm text-white/60">
              {model} · {year}
            </p>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-white/60">
              <Ruler className="w-4 h-4" />
              <span className="text-sm">{length}m</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60">
              <Users className="w-4 h-4" />
              <span className="text-sm">{capacity} guests</span>
            </div>
            {maxSpeed && (
              <div className="flex items-center gap-1.5 text-white/60">
                <Gauge className="w-4 h-4" />
                <span className="text-sm">{maxSpeed} kn</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="pt-3">
            <div className="price-tag">
              <span className="price-currency">{currency}</span>
              <span className="price-value">
                {formatPrice(price, currency).replace(/[^0-9,]/g, '')}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default VesselCard;
