'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="relative z-10">
              {logo}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn('nav-link', item.isActive && 'active')}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Actions & CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              {actions}
              <Button variant="primary" size="sm" asChild>
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden relative z-10 p-2 -mr-2"
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
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

            {/* Menu Content */}
            <motion.div
              className="relative flex flex-col items-center justify-center h-full gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'text-2xl font-semibold tracking-tight',
                      'text-white/70 transition-colors hover:text-white',
                      item.isActive && 'text-white'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {actions && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.1 + items.length * 0.05 }}
                  className="mt-4 flex flex-col items-center gap-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {actions}
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1 + items.length * 0.05 + (actions ? 0.05 : 0) }}
                className="mt-4"
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsMobileMenuOpen(false)}
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
