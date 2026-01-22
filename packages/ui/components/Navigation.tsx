'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './Button';

export interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface NavigationProps {
  logo: React.ReactNode;
  items: NavItem[];
  ctaLabel?: string;
  ctaHref?: string;
  variant?: 'transparent' | 'solid';
  className?: string;
  actions?: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({
  logo,
  items,
  ctaLabel = 'Contact',
  ctaHref = '/contact',
  variant = 'transparent',
  className,
  actions,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const navScrollRef = useRef<HTMLDivElement>(null);

  // Check if nav items overflow and need scroll arrow
  const checkOverflow = useCallback(() => {
    if (navScrollRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = navScrollRef.current;
      const hasOverflow = scrollWidth > clientWidth;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
      setShowScrollArrow(hasOverflow && !isAtEnd);
    }
  }, []);

  // Scroll nav items to the right
  const scrollNavRight = () => {
    if (navScrollRef.current) {
      navScrollRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1024);
      checkOverflow();
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkOverflow]);

  // Check overflow on mount and when items change
  useEffect(() => {
    checkOverflow();
    const scrollEl = navScrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkOverflow);
      return () => scrollEl.removeEventListener('scroll', checkOverflow);
    }
  }, [checkOverflow, items]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isCompact) {
      setIsMobileMenuOpen(false);
    }
  }, [isCompact]);

  const navVariants = {
    transparent: cn(
      'bg-transparent',
      isScrolled && 'bg-brand-navy/90 backdrop-blur-xl border-b border-white/10'
    ),
    solid: 'bg-brand-navy/95 backdrop-blur-xl border-b border-white/10',
  };

  return (
    <>
      <motion.nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'transition-all duration-500 ease-out',
          navVariants[variant],
          className
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="relative z-10 flex-shrink-0">
              {logo}
            </Link>

            {/* Navigation Links Container */}
            <div className="flex items-center flex-1 mx-4 lg:mx-8 min-w-0 relative">
              {/* Scrollable Nav Links */}
              <div
                ref={navScrollRef}
                className="flex items-center gap-4 lg:gap-10 overflow-x-auto scrollbar-hide"
              >
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'whitespace-nowrap text-sm',
                      'font-medium text-white/70 hover:text-white transition-colors',
                      'py-1 px-2',
                      item.isActive && 'text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Scroll Arrow Indicator */}
              <AnimatePresence>
                {showScrollArrow && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    onClick={scrollNavRight}
                    className="absolute right-0 flex items-center justify-center w-8 h-8 bg-gradient-to-l from-brand-navy via-brand-navy/90 to-transparent pl-4 pr-0"
                    aria-label="Scroll to see more options"
                  >
                    <ChevronRight className="w-5 h-5 text-brand-blue animate-pulse" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Actions & CTA - only visible on large screens */}
            <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
              {actions}
              <Button variant="primary" size="sm" asChild>
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
            </div>

            {/* Mobile/Tablet Menu Button - visible below lg breakpoint */}
            <button
              className="lg:hidden relative z-10 p-2 -mr-2 flex-shrink-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile/Tablet Menu - Only shows Profile and Contact Us */}
      <AnimatePresence>
        {isMobileMenuOpen && isCompact && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-brand-navy/95 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content - Only Profile & Contact */}
            <motion.div
              className="relative flex flex-col items-center justify-center h-full gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <p className="text-white/50 text-sm uppercase tracking-wider mb-6">Account</p>
              </motion.div>

              {actions && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-col items-center gap-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {actions}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                  asChild
                >
                  <Link href={ctaHref}>{ctaLabel}</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
