'use client';

import React from 'react';
// import { useState } from 'react';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';

// =============================================================================
// BOAT CONFIGURATOR - COMMENTED OUT / NOT FUNCTIONAL
// This component allows users to configure hull colours for the AY60
// Uncomment the code below to enable the configurator functionality
// =============================================================================

/*
const colorOptions = [
  {
    id: 'tasman-blue',
    name: 'Tasman Blue',
    color: '#7BA3B5',
    image: '/images/configurator/tasman-blue.jpg'
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    color: '#2C3E50',
    image: '/images/configurator/midnight-blue.jpg'
  },
  {
    id: 'metallic-grey',
    name: 'Metallic Grey',
    color: '#A8A9AD',
    image: '/images/configurator/metallic-grey.jpg'
  }
];
*/

export default function ConfiguratorPage() {
  // ==========================================================================
  // CONFIGURATOR STATE - COMMENTED OUT
  // Uncomment to enable hull colour selection functionality
  // ==========================================================================
  // const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

  return (
    <main className="min-h-screen bg-brand-navy">
      <Header variant="transparent" />

      {/* =======================================================================
          BOAT CONFIGURATOR UI - ENTIRELY COMMENTED OUT / HIDDEN
          Uncomment the entire block below to enable the configurator page
          ======================================================================= */}
      
      {/*
      <div className="min-h-screen flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-4xl">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            
            {/* Image Display *}
            <div className="relative aspect-video bg-gradient-to-b from-sky-400/20 to-transparent overflow-hidden">
              <img
                src={selectedColor.image}
                alt={`Boat in ${selectedColor.name}`}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              {/* Gradient Overlay *}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              
              {/* Selected Color Badge *}
              <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                <span className="text-white text-sm font-medium">{selectedColor.name}</span>
              </div>
            </div>

            {/* Configuration Panel *}
            <div className="p-8">
              <div className="flex items-start gap-8">
                {/* Color Swatches *}
                <div className="flex flex-col gap-3">
                  {colorOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedColor(option)}
                      className={`group relative w-14 h-14 rounded-xl transition-all duration-300 ${
                        selectedColor.id === option.id
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: option.color }}
                      aria-label={`Select ${option.name}`}
                    >
                      {/* Shine Effect *}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-black/20" />
                      
                      {/* Check Mark *}
                      {selectedColor.id === option.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg 
                            className="w-6 h-6 text-white drop-shadow-lg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Tooltip *}
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                          {option.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Label Section *}
                <div className="flex-1">
                  <h2 className="text-white/50 text-sm font-medium uppercase tracking-widest mb-2">
                    Configure Your Vessel
                  </h2>
                  <h1 className="text-white text-2xl font-bold mb-4">
                    Select Hull Colour
                  </h1>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Choose from our premium marine-grade hull finishes. Each colour is 
                    expertly applied using advanced coating technology for lasting durability 
                    and stunning aesthetics.
                  </p>
                  
                  {/* Selected Color Details *}
                  <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg"
                        style={{ backgroundColor: selectedColor.color }}
                      />
                      <div>
                        <p className="text-white font-semibold">{selectedColor.name}</p>
                        <p className="text-white/50 text-xs">Premium Marine Finish</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer *}
          <p className="text-center text-white/30 text-xs mt-6">
            Colours shown are representative. Actual appearance may vary.
          </p>
        </div>
      </div>
      */}

      <SiteFooter />
    </main>
  );
}
