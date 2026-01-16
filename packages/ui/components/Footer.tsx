'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  logo: React.ReactNode;
  sections: FooterSection[];
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  logo,
  sections,
  socialLinks,
  contactInfo,
  className,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('relative bg-brand-navy border-t border-white/10', className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-1/2 h-full bg-gradient-radial from-brand-blue/5 to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/">{logo}</Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Redefining ocean ownership and adventure. From brokerage to circumnavigation, 
              36ZERO brings the horizon to your office.
            </p>

            {/* Social Links */}
            {socialLinks && (
              <div className="flex items-center gap-4">
                {socialLinks.instagram && (
                  <motion.a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/5 text-white/60 hover:bg-brand-blue/20 hover:text-brand-blue transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Instagram className="w-5 h-5" />
                  </motion.a>
                )}
                {socialLinks.linkedin && (
                  <motion.a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/5 text-white/60 hover:bg-brand-blue/20 hover:text-brand-blue transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Linkedin className="w-5 h-5" />
                  </motion.a>
                )}
                {socialLinks.youtube && (
                  <motion.a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/5 text-white/60 hover:bg-brand-blue/20 hover:text-brand-blue transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Youtube className="w-5 h-5" />
                  </motion.a>
                )}
              </div>
            )}
          </div>

          {/* Navigation Sections */}
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-brand-blue transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          {contactInfo && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                Contact
              </h4>
              <ul className="space-y-3">
                {contactInfo.email && (
                  <li>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="flex items-center gap-2 text-sm text-white/60 hover:text-brand-blue transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {contactInfo.email}
                    </a>
                  </li>
                )}
                {contactInfo.phone && (
                  <li>
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="flex items-center gap-2 text-sm text-white/60 hover:text-brand-blue transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {contactInfo.phone}
                    </a>
                  </li>
                )}
                {contactInfo.address && (
                  <li className="flex items-start gap-2 text-sm text-white/60">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{contactInfo.address}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {currentYear} 36ZERO Yachting. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-white/40 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-white/40 hover:text-white/60 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-xs text-white/40 hover:text-white/60 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
