'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { Navigation, type NavItem } from '@36zero/ui';
import Logo from './Logo';
import LapLogo from './LapLogo';

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Available Vessels', href: '/vessels' },
  { label: 'Adventure Yachts', href: '/adventure-yachts' },
  { label: '36ZERO LAP™', href: '/lap' },
];

interface HeaderProps {
  variant?: 'transparent' | 'solid';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'transparent' }) => {
  const pathname = usePathname();
  
  // Use LAP logo on /lap routes, default logo everywhere else
  const isLapPage = pathname?.startsWith('/lap');
  const CurrentLogo = isLapPage ? <LapLogo /> : <Logo />;

  return (
    <Navigation
      logo={CurrentLogo}
      items={navItems}
      ctaLabel="Contact Us"
      ctaHref="/contact"
      variant={variant}
      actions={
        <>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium text-white hover:text-brand-blue transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium bg-brand-blue text-white rounded-md hover:bg-brand-blue/90 transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </>
      }
    />
  );
};

export default Header;
