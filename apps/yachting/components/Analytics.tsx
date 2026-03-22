'use client';

import Clarity from '@microsoft/clarity';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import Script from 'next/script';
import { useEffect, useRef } from 'react';

// Environment variables
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

/**
 * PostHog Provider - Product analytics and feature flags
 */
function PostHogProvider({ children }: { children: React.ReactNode }) {
  const clarityInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize Microsoft Clarity (only once)
    if (CLARITY_PROJECT_ID && !clarityInitialized.current) {
      Clarity.init(CLARITY_PROJECT_ID);
      clarityInitialized.current = true;
    }

    // Initialize PostHog
    if (POSTHOG_KEY && !posthog.__loaded) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        // Respect Do Not Track
        respect_dnt: true,
        // Disable in development for cleaner logs
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.debug();
          }
        },
      });
    }
  }, []);

  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

/**
 * Google Analytics 4 - Page analytics and conversion tracking
 */
function GoogleAnalytics() {
  if (!GA4_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

/**
 * Combined Analytics Provider
 * Includes: Microsoft Clarity (heatmaps) + PostHog (product analytics) + Google Analytics 4
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <GoogleAnalytics />
      {children}
    </PostHogProvider>
  );
}

export default AnalyticsProvider;
