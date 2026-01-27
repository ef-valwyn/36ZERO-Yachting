'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Navigation, Anchor, Plane } from 'lucide-react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import { cn } from '../lib/utils';
import { GlassCard } from './GlassCard';
import { Button } from './Button';

import 'mapbox-gl/dist/mapbox-gl.css';

export interface RouteStage {
  id: string;
  passageId: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  arrivalDate: string;
  departureDate?: string;
  distanceNm: number;
  type: 'hub' | 'stop' | 'transit';
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
  totalDistance?: number;
}

// Custom dark map style matching 36ZERO brand
const mapStyle = {
  version: 8 as const,
  name: '36ZERO Dark',
  sources: {
    'mapbox-streets': {
      type: 'vector' as const,
      url: 'mapbox://mapbox.mapbox-streets-v8',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background' as const,
      paint: {
        'background-color': '#071923', // brand-navy for oceans
      },
    },
    {
      id: 'water',
      type: 'fill' as const,
      source: 'mapbox-streets',
      'source-layer': 'water',
      paint: {
        'fill-color': '#071923', // brand-navy for oceans
      },
    },
    {
      id: 'land',
      type: 'fill' as const,
      source: 'mapbox-streets',
      'source-layer': 'land',
      paint: {
        'fill-color': '#1a1a2e', // dark land color
      },
    },
    {
      id: 'landuse',
      type: 'fill' as const,
      source: 'mapbox-streets',
      'source-layer': 'landuse',
      paint: {
        'fill-color': '#1a1a2e',
        'fill-opacity': 0.5,
      },
    },
    {
      id: 'admin-boundaries',
      type: 'line' as const,
      source: 'mapbox-streets',
      'source-layer': 'admin',
      paint: {
        'line-color': '#2f97dd',
        'line-opacity': 0.3,
        'line-width': 0.5,
      },
    },
    {
      id: 'country-labels',
      type: 'symbol' as const,
      source: 'mapbox-streets',
      'source-layer': 'place_label',
      filter: ['==', ['get', 'class'], 'country'],
      layout: {
        'text-field': ['get', 'name_en'],
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
        'text-size': 12,
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.1,
      },
      paint: {
        'text-color': 'rgba(255, 255, 255, 0.5)',
        'text-halo-color': 'rgba(0, 0, 0, 0.5)',
        'text-halo-width': 1,
      },
    },
  ],
};

export const RouteMap: React.FC<RouteMapProps> = ({
  stages,
  mapboxToken,
  initialCenter = [-61.0, 14.0], // Center on Saint Lucia (start point)
  initialZoom = 3,
  onStageSelect,
  className,
  totalDistance,
}) => {
  const mapRef = useRef<MapRef>(null);
  const [selectedStage, setSelectedStage] = useState<RouteStage | null>(null);
  const [viewState, setViewState] = useState({
    longitude: initialCenter[0],
    latitude: initialCenter[1],
    zoom: initialZoom,
  });

  // Helper function to handle antimeridian crossing
  // Splits line segments that cross the date line into two segments
  const splitAtAntimeridian = (coords: [number, number][]): [number, number][][] => {
    const segments: [number, number][][] = [];
    let currentSegment: [number, number][] = [];

    for (let i = 0; i < coords.length; i++) {
      const current = coords[i];
      
      if (i === 0) {
        currentSegment.push(current);
        continue;
      }

      const prev = coords[i - 1];
      const lonDiff = Math.abs(current[0] - prev[0]);

      // If longitude difference > 180, we're crossing the antimeridian
      if (lonDiff > 180) {
        // Calculate the latitude at the crossing point
        const prevLon = prev[0];
        const currLon = current[0];
        const prevLat = prev[1];
        const currLat = current[1];

        // Determine crossing direction
        const crossingLon = prevLon > 0 ? 180 : -180;
        const oppositelon = prevLon > 0 ? -180 : 180;

        // Linear interpolation to find latitude at crossing
        const adjustedCurrLon = currLon + (prevLon > 0 ? 360 : -360);
        const t = (crossingLon - prevLon) / (adjustedCurrLon - prevLon);
        const crossingLat = prevLat + t * (currLat - prevLat);

        // End current segment at the crossing
        currentSegment.push([crossingLon, crossingLat]);
        segments.push(currentSegment);

        // Start new segment from the opposite side
        currentSegment = [[oppositelon, crossingLat], current];
      } else {
        currentSegment.push(current);
      }
    }

    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }

    return segments;
  };

  // Generate GeoJSON for the route line (handles antimeridian crossing)
  const routeCoords = stages.map((stage) => stage.coordinates);
  const routeSegments = splitAtAntimeridian(routeCoords);
  
  const routeGeoJSON = routeSegments.length === 1
    ? {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: routeSegments[0],
        },
      }
    : {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'MultiLineString' as const,
          coordinates: routeSegments,
        },
      };

  // Generate GeoJSON for completed segments (handles antimeridian crossing)
  const completedStages = stages.filter((s) => s.isCompleted);
  const completedCoords = completedStages.map((stage) => stage.coordinates);
  const completedSegments = splitAtAntimeridian(completedCoords);
  
  const completedGeoJSON = completedSegments.length === 1
    ? {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: completedSegments[0] || [],
        },
      }
    : {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'MultiLineString' as const,
          coordinates: completedSegments,
        },
      };

  const handleStageClick = useCallback(
    (stage: RouteStage) => {
      setSelectedStage(stage);
      onStageSelect?.(stage);

      // Fly to the selected stage
      mapRef.current?.flyTo({
        center: stage.coordinates,
        zoom: 6,
        duration: 1500,
      });
    },
    [onStageSelect]
  );

  const handleClosePanel = useCallback(() => {
    setSelectedStage(null);
    // Reset view
    mapRef.current?.flyTo({
      center: [initialCenter[0], initialCenter[1]],
      zoom: initialZoom,
      duration: 1000,
    });
  }, [initialCenter, initialZoom]);

  // If no token provided, show placeholder
  if (!mapboxToken) {
    return (
      <div className={cn('relative w-full h-[600px] rounded-2xl overflow-hidden bg-brand-navy', className)}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-blue/20 flex items-center justify-center">
              <Navigation className="w-8 h-8 text-brand-blue" />
            </div>
            <p className="text-white/60 max-w-md">
              Add your Mapbox token to enable the interactive route map.
            </p>
            <code className="text-xs text-brand-blue/60 block">
              NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-[600px] rounded-2xl overflow-hidden', className)}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* Navigation Controls */}
        <NavigationControl position="bottom-right" showCompass={false} />

        {/* Route Line - Upcoming (dashed) */}
        <Source id="route" type="geojson" data={routeGeoJSON}>
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': 'rgba(255, 255, 255, 0.3)',
              'line-width': 2,
              'line-dasharray': [4, 4],
            }}
          />
        </Source>

        {/* Route Line - Completed (solid) */}
        {completedStages.length > 1 && (
          <Source id="completed-route" type="geojson" data={completedGeoJSON}>
            <Layer
              id="completed-line"
              type="line"
              paint={{
                'line-color': '#2f97dd',
                'line-width': 3,
              }}
            />
          </Source>
        )}

        {/* Stage Markers */}
        {stages.map((stage, index) => (
          <Marker
            key={stage.id}
            longitude={stage.coordinates[0]}
            latitude={stage.coordinates[1]}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleStageClick(stage);
            }}
          >
            <motion.div
              className={cn(
                'cursor-pointer transition-transform',
                stage.type === 'hub' ? 'marker-hub' : stage.type === 'stop' ? 'marker-stop' : 'marker-transit',
                selectedStage?.id === stage.id && 'ring-2 ring-white ring-offset-2 ring-offset-brand-navy'
              )}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.2 }}
              style={{
                width: stage.type === 'hub' ? 20 : stage.type === 'stop' ? 12 : 8,
                height: stage.type === 'hub' ? 20 : stage.type === 'stop' ? 12 : 8,
                borderRadius: '50%',
                backgroundColor: stage.isCompleted ? '#2f97dd' : stage.isActive ? '#c9a962' : stage.type === 'transit' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)',
                border: stage.type === 'hub' ? '3px solid #2f97dd' : stage.type === 'stop' ? '2px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.3)',
                boxShadow: stage.isActive ? '0 0 20px rgba(201, 169, 98, 0.6)' : 'none',
              }}
            />
          </Marker>
        ))}
      </Map>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10">
        <GlassCard padding="sm" className="space-y-2">
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Legend</h4>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full bg-white/60" 
              style={{ border: '3px solid #2f97dd' }} 
            />
            <span className="text-xs text-white/80">Major Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full bg-white/60" 
              style={{ border: '2px solid rgba(255,255,255,0.4)' }} 
            />
            <span className="text-xs text-white/80">Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full bg-white/40" 
              style={{ border: '1px solid rgba(255,255,255,0.3)' }} 
            />
            <span className="text-xs text-white/80">Transit</span>
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

      {/* Passage Filter (optional) */}
      <div className="absolute top-4 right-4 z-10">
        <GlassCard padding="sm">
          <p className="text-xs text-white/60 mb-1">Total Distance</p>
          <p className="text-lg font-bold text-brand-blue">
            {(totalDistance ?? stages.reduce((acc, s) => acc + s.distanceNm, 0)).toLocaleString()} NM
          </p>
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
                  onClick={handleClosePanel}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      selectedStage.type === 'hub' ? 'bg-brand-blue' : 'bg-white/20'
                    )}
                  >
                    {selectedStage.type === 'hub' ? (
                      <Anchor className="w-5 h-5 text-white" />
                    ) : (
                      <MapPin className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedStage.name}</h3>
                    <p className="text-sm text-white/60">
                      {selectedStage.type === 'hub' ? 'Major Hub' : selectedStage.type === 'stop' ? 'Intermediary Stop' : 'Transit Point'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 120px)' }}>
                {/* Status Badge */}
                {selectedStage.isCompleted && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/20 text-brand-blue text-sm">
                    <div className="w-2 h-2 rounded-full bg-brand-blue" />
                    Completed
                  </div>
                )}
                {selectedStage.isActive && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-gold/20 text-accent-gold text-sm">
                    <div className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
                    Current Location
                  </div>
                )}

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
                    <p className="text-sm text-white/60">
                      {selectedStage.distanceNm.toLocaleString()} NM from previous stage
                    </p>
                  </div>
                </div>

                {/* Logistics */}
                {selectedStage.logistics && (
                  <div className="p-4 rounded-xl bg-white/5 space-y-3">
                    <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                      Logistics
                    </h4>
                    {selectedStage.logistics.flightHub && (
                      <div className="flex items-start gap-2">
                        <Plane className="w-4 h-4 text-brand-blue mt-0.5" />
                        <div>
                          <p className="text-xs text-white/40">Nearest Airport</p>
                          <p className="text-sm text-white">{selectedStage.logistics.flightHub}</p>
                        </div>
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

                {/* Coordinates */}
                <div className="text-xs text-white/40">
                  {selectedStage.coordinates[1].toFixed(4)}°{selectedStage.coordinates[1] >= 0 ? 'N' : 'S'},{' '}
                  {selectedStage.coordinates[0].toFixed(4)}°{selectedStage.coordinates[0] >= 0 ? 'E' : 'W'}
                </div>

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
