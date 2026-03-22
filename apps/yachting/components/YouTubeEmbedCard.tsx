'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { GlassCard } from '@36zero/ui';

interface YouTubeEmbedCardProps {
  youtubeUrl: string;
  posterSrc: string;
  posterAlt: string;
  title: string;
  durationLabel?: string;
  className?: string;
}

function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      return parsed.pathname.slice(1) || null;
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v');
      }

      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2] || null;
      }

      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2] || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export default function YouTubeEmbedCard({
  youtubeUrl,
  posterSrc,
  posterAlt,
  title,
  durationLabel,
  className,
}: YouTubeEmbedCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoId = extractYouTubeVideoId(youtubeUrl);

  if (!videoId) {
    return null;
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <GlassCard variant="blue" padding="none" className="overflow-hidden">
        <div className="relative aspect-video bg-black">
          {isPlaying ? (
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <>
              <Image
                src={posterSrc}
                alt={posterAlt}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 1120px, 100vw"
              />
              <div className="absolute inset-0 bg-brand-navy/45" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-blue text-white shadow-glow"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  aria-label={`Play ${title}`}
                >
                  <Play className="ml-1 h-10 w-10" />
                </motion.button>
              </div>
              <div className="absolute bottom-6 left-6">
                <p className="text-lg font-semibold text-white">{title}</p>
                {durationLabel ? (
                  <p className="text-sm text-white/70">{durationLabel}</p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
