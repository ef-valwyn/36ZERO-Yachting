'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Button } from '@36zero/ui';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import type { ArticleFrontmatter } from '@/lib/news';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface ArticleClientProps {
  frontmatter: ArticleFrontmatter;
  children: React.ReactNode;
}

export default function ArticleClient({
  frontmatter,
  children,
}: ArticleClientProps) {
  return (
    <div className="min-h-screen bg-brand-navy">
      <Header variant="transparent" />

      {/* Hero Section with Cover Image */}
      <section className="relative h-[50vh] min-h-[400px] max-h-[600px]">
        <Image
          src={frontmatter.coverImage}
          alt={frontmatter.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-brand-navy/20" />

        {/* Return to News - Top */}
        <motion.div
          className="absolute top-6 left-6 z-10"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link href="/news">
            <Button variant="ghost" size="md" className="text-white/90 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to News
            </Button>
          </Link>
        </motion.div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 px-6 pb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="max-w-3xl mx-auto">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-brand-blue bg-brand-blue/15 px-3 py-1 rounded-full backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tighter leading-tight mb-4">
              {frontmatter.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-white/50 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(frontmatter.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {frontmatter.author}
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Article Content */}
      <motion.article
        className="relative px-6 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="max-w-3xl mx-auto">
          {/* MDX Content rendered by server component */}
          <div className="prose-custom">{children}</div>

          {/* Divider */}
          <hr className="border-white/10 my-12" />

          {/* Back to News */}
          <div className="flex items-center justify-between">
            <Link href="/news">
              <Button variant="ghost" size="md">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Button>
            </Link>

            <Link href="/adventure-yachts">
              <Button variant="secondary" size="md">
                Explore AY60
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.article>

      <SiteFooter />
    </div>
  );
}
