'use client';

import React from 'react';
import { Footer, type FooterSection } from '@36zero/ui';
import Logo from './Logo';

const footerSections: FooterSection[] = [
  {
    title: 'Brokerage',
    links: [
      { label: 'Available Vessels', href: '/vessels' },
    ],
  },
  {
    title: '36ZERO LAP™',
    links: [
      { label: 'The Route', href: '/lap' },
      { label: 'Join a Passage', href: '/lap#passages' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Adventure Yachts', href: '/adventure-yachts' },
      { label: 'News & Updates', href: '/news' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
];

export const SiteFooter: React.FC = () => {
  return (
    <Footer
      logo={<Logo />}
      sections={footerSections}
      socialLinks={{
        instagram: 'https://instagram.com/36zeroyachting',
        linkedin: 'https://linkedin.com/company/36zeroyachting',
        youtube: 'https://youtube.com/@36zeroyachting',
      }}
      contactInfo={{
        email: 'info@36zeroyachting.com',
        phone: '+1 315 825 7260',
        address: '160 Robinson Rd #20-03, Singapore 068914',
      }}
    />
  );
};

export default SiteFooter;
