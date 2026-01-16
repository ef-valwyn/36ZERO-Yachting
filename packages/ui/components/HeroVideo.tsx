'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export interface HeroVideoProps {
  videoSrc: string;
  posterSrc?: string;
  fallbackColor?: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
  className?: string;
}

export const HeroVideo: React.FC<HeroVideoProps> = ({
  videoSrc,
  posterSrc,
  fallbackColor = '#071923',
  overlayOpacity = 0.5,
  children,
  className,
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
    };

    const handlePlay = () => {
      setIsVideoPlaying(true);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('playing', handlePlay);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('playing', handlePlay);
    };
  }, []);

  return (
    <div
      className={cn('relative w-full h-screen overflow-hidden', className)}
      style={{ backgroundColor: fallbackColor }}
    >
      {/* Low Quality Image Placeholder (LQIP) */}
      <AnimatePresence>
        {!isVideoPlaying && posterSrc && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
              style={{ backgroundImage: `url(${posterSrc})` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Element */}
      <video
        ref={videoRef}
        className={cn(
          'absolute inset-0 w-full h-full object-cover',
          'transition-opacity duration-1000',
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        )}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={posterSrc}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-brand-navy/30 via-transparent to-brand-navy"
        style={{ opacity: overlayOpacity }}
      />

      {/* Side Vignette */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/50 via-transparent to-brand-navy/50" />

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>

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
    </div>
  );
};

export default HeroVideo;
