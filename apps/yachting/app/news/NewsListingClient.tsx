'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar } from 'lucide-react';
import { GlassCard } from '@36zero/ui';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import type { ArticleFrontmatter } from '@/lib/news';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface NewsListingClientProps {
  articles: ArticleFrontmatter[];
}

export default function NewsListingClient({ articles }: NewsListingClientProps) {
  return (
    <div className="min-h-screen bg-brand-navy">
      <Header variant="solid" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6">
        {/* Background accent */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-blue/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="relative max-w-6xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-brand-blue text-sm font-semibold uppercase tracking-widest mb-4">
            36ZERO Yachting
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white uppercase tracking-tighter mb-4">
            News & Updates
          </h1>
          <p className="text-white/60 font-light text-lg max-w-2xl mx-auto">
            The latest from Adventure Yachts, boat shows, award nominations, and
            the world of expedition cruising.
          </p>
        </motion.div>
      </section>

      {/* Articles Grid */}
      <section className="relative px-6 pb-24">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {articles.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-16">
              <p className="text-white/40 text-lg">
                No articles published yet. Check back soon.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <motion.div key={article.slug} variants={itemVariants}>
                  <Link
                    href={`/news/${article.slug}`}
                    className="block group h-full"
                  >
                    <GlassCard variant="hover" padding="none" className="h-full flex flex-col overflow-hidden">
                      {/* Cover Image */}
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-1 p-5">
                        {/* Date & Tags */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="flex items-center gap-1.5 text-white/40 text-xs font-light">
                            <Calendar className="w-3 h-3" />
                            {formatDate(article.date)}
                          </span>
                          {article.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs text-brand-blue/80 bg-brand-blue/10 px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Title */}
                        <h2 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-brand-blue transition-colors line-clamp-2">
                          {article.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-white/50 text-sm font-light leading-relaxed mb-4 line-clamp-3 flex-1">
                          {article.excerpt}
                        </p>

                        {/* Read More */}
                        <div className="flex items-center gap-1.5 text-brand-blue text-sm font-medium group-hover:gap-2.5 transition-all">
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}
