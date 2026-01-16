'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Navigation, Anchor } from 'lucide-react';
import { cn } from '../lib/utils';
import { GlassCard } from './GlassCard';
import { Button } from './Button';

// Note: This component requires react-map-gl and mapbox-gl to be installed
// npm install react-map-gl mapbox-gl @types/mapbox-gl

export interface RouteStage {
  id: string;
  passageId: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  arrivalDate: string;
  departureDate?: string;
  distanceNm: number;
  type: 'hub' | 'stop';
  logistics?: {
    flightHub?: string;
    transfer?: string;
    notes?: string;
  };
  isActive?: boolean;
  isCompleted?: boolean;
}

export interface RouteMapProps {
  stages: RouteStage[];
  mapboxToken: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  onStageSelect?: (stage: RouteStage) => void;
  className?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  stages,
  mapboxToken,
  initialCenter = [140, -10], // Center on Pacific
  initialZoom = 3,
  onStageSelect,
  className,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [selectedStage, setSelectedStage] = useState<RouteStage | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // This is a placeholder implementation
  // In production, you would integrate with react-map-gl
  
  const handleStageClick = useCallback((stage: RouteStage) => {
    setSelectedStage(stage);
    onStageSelect?.(stage);
  }, [onStageSelect]);

  return (
    <div className={cn('relative w-full h-[600px] rounded-2xl overflow-hidden', className)}>
      {/* Map Container - In production, replace with Map component from react-map-gl */}
      <div
        ref={mapContainer}
        className="absolute inset-0 bg-gradient-ocean"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 40%, rgba(47, 151, 221, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(47, 151, 221, 0.05) 0%, transparent 40%)
          `,
        }}
      >
        {/* Placeholder Map UI */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-blue/20 flex items-center justify-center">
              <Navigation className="w-8 h-8 text-brand-blue" />
            </div>
            <p className="text-white/60 max-w-md">
              Interactive Mapbox map will render here. Add your Mapbox token and install react-map-gl to enable.
            </p>
            <code className="text-xs text-brand-blue/60 block">
              NEXT_PUBLIC_MAPBOX_TOKEN=your_token
            </code>
          </div>
        </div>

        {/* Stage Markers Preview */}
        <div className="absolute inset-0 pointer-events-none">
          {stages.slice(0, 5).map((stage, index) => (
            <motion.div
              key={stage.id}
              className={cn(
                'absolute pointer-events-auto cursor-pointer',
                stage.type === 'hub' ? 'marker-hub' : 'marker-stop'
              )}
              style={{
                left: `${20 + index * 15}%`,
                top: `${30 + (index % 3) * 15}%`,
              }}
              onClick={() => handleStageClick(stage)}
              whileHover={{ scale: 1.2 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10">
        <GlassCard padding="sm" className="space-y-2">
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Legend</h4>
          <div className="flex items-center gap-2">
            <div className="marker-hub w-4 h-4" style={{ animationPlayState: 'paused' }} />
            <span className="text-xs text-white/80">Major Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="marker-stop w-3 h-3" />
            <span className="text-xs text-white/80">Intermediary Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-brand-blue" />
            <span className="text-xs text-white/80">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 border-t-2 border-dashed border-white/40" />
            <span className="text-xs text-white/80">Upcoming</span>
          </div>
        </GlassCard>
      </div>

      {/* Stage Detail Panel */}
      <AnimatePresence>
        {selectedStage && (
          <motion.div
            className="absolute top-0 right-0 bottom-0 w-full sm:w-96 z-20"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <GlassCard className="h-full rounded-none sm:rounded-l-2xl" padding="none">
              {/* Header */}
              <div className="relative p-6 border-b border-white/10">
                <button
                  onClick={() => setSelectedStage(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    selectedStage.type === 'hub' ? 'bg-brand-blue' : 'bg-white/20'
                  )}>
                    {selectedStage.type === 'hub' ? (
                      <Anchor className="w-5 h-5 text-white" />
                    ) : (
                      <MapPin className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedStage.name}</h3>
                    <p className="text-sm text-white/60">
                      {selectedStage.type === 'hub' ? 'Major Hub' : 'Intermediary Stop'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Dates */}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-brand-blue mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Arrival</p>
                    <p className="text-sm text-white/60">{selectedStage.arrivalDate}</p>
                    {selectedStage.departureDate && (
                      <>
                        <p className="text-sm font-medium text-white mt-2">Departure</p>
                        <p className="text-sm text-white/60">{selectedStage.departureDate}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Distance */}
                <div className="flex items-start gap-3">
                  <Navigation className="w-5 h-5 text-brand-blue mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Distance</p>
                    <p className="text-sm text-white/60">{selectedStage.distanceNm} NM from previous</p>
                  </div>
                </div>

                {/* Logistics */}
                {selectedStage.logistics && (
                  <div className="p-4 rounded-xl bg-white/5 space-y-3">
                    <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                      Logistics
                    </h4>
                    {selectedStage.logistics.flightHub && (
                      <div>
                        <p className="text-xs text-white/40">Flight Hub</p>
                        <p className="text-sm text-white">{selectedStage.logistics.flightHub}</p>
                      </div>
                    )}
                    {selectedStage.logistics.transfer && (
                      <div>
                        <p className="text-xs text-white/40">Transfer</p>
                        <p className="text-sm text-white">{selectedStage.logistics.transfer}</p>
                      </div>
                    )}
                    {selectedStage.logistics.notes && (
                      <div>
                        <p className="text-xs text-white/40">Notes</p>
                        <p className="text-sm text-white">{selectedStage.logistics.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action */}
                <Button variant="primary" className="w-full">
                  View Passage Details
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RouteMap;
