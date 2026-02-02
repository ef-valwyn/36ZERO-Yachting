'use client';

import Clarity from '@microsoft/clarity';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, useState } from 'react';

// Environment variables
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

/**
 * PostHog Provider - Product analytics and feature flags
 */
function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize Microsoft Clarity
    if (CLARITY_PROJECT_ID && !Clarity.hasStarted()) {
      Clarity.init(CLARITY_PROJECT_ID);
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
    setIsInitialized(true);
  }, []);

  if (!POSTHOG_KEY || !isInitialized) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

/**
 * Combined Analytics Provider
 * Includes: Microsoft Clarity (heatmaps) + PostHog (product analytics)
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider>{children}</PostHogProvider>;
}

export default AnalyticsProvider;
