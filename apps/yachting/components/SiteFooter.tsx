'use client';

import React from 'react';
import { Footer, type FooterSection } from '@36zero/ui';
import Logo from './Logo';

const footerSections: FooterSection[] = [
  {
    title: 'Brokerage',
    links: [
      { label: 'Available Vessels', href: '/vessels' },
      { label: 'Sell Your Yacht', href: '/sell' },
      { label: 'Yacht Valuations', href: '/valuations' },
    ],
  },
  {
    title: 'LAP',
    links: [
      { label: 'The Route', href: '/lap' },
      { label: 'Join a Passage', href: '/lap/passages' },
      { label: 'Crew Requirements', href: '/lap/requirements' },
      { label: 'FAQ', href: '/lap/faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Adventure Yachts', href: '/adventure-yachts' },
      { label: 'News & Updates', href: '/news' },
      { label: 'Careers', href: '/careers' },
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
        email: 'hello@36zeroyachting.com',
        phone: '+44 20 1234 5678',
        address: 'Marina Bay, London, UK',
      }}
    />
  );
};

export default SiteFooter;
