/**
 * Analytics Utilities for PostHog
 *
 * Usage:
 *   import { trackEvent, trackYachtInquiry, trackConfiguratorStep } from '@/lib/analytics';
 *
 *   // Generic event
 *   trackEvent('button_click', { button_name: 'contact_us' });
 *
 *   // Yacht inquiry
 *   trackYachtInquiry('AY60', 'contact_form');
 *
 *   // Configurator interaction
 *   trackConfiguratorStep('hull_selection', 'AY60', { hull_type: 'performance' });
 */

import posthog from 'posthog-js';

/**
 * Check if PostHog is available
 */
export function isAnalyticsEnabled(): boolean {
  return typeof window !== 'undefined' && posthog.__loaded;
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): void {
  if (!isAnalyticsEnabled()) return;
  posthog.capture(eventName, properties);
}

/**
 * Track a page view (useful for SPA navigation or virtual page views)
 */
export function trackPageView(url: string, title?: string): void {
  if (!isAnalyticsEnabled()) return;
  posthog.capture('$pageview', {
    $current_url: url,
    $title: title,
  });
}

/**
 * Identify a user (call after authentication)
 */
export function identifyUser(
  userId: string,
  traits?: Record<string, string | number | boolean>
): void {
  if (!isAnalyticsEnabled()) return;
  posthog.identify(userId, traits);
}

/**
 * Reset user identity (call on logout)
 */
export function resetUser(): void {
  if (!isAnalyticsEnabled()) return;
  posthog.reset();
}

// ============================================
// Yacht-Specific Events
// ============================================

/**
 * Track when a user views a yacht listing
 */
export function trackYachtView(
  yachtModel: string,
  yachtId?: string,
  listingType?: 'brokerage' | 'new_build'
): void {
  trackEvent('yacht_viewed', {
    yacht_model: yachtModel,
    yacht_id: yachtId || '',
    listing_type: listingType || 'brokerage',
  });
}

/**
 * Track yacht inquiry submissions
 */
export function trackYachtInquiry(
  yachtModel: string,
  inquiryType: 'contact_form' | 'phone_click' | 'email_click' | 'schedule_viewing'
): void {
  trackEvent('yacht_inquiry', {
    yacht_model: yachtModel,
    inquiry_type: inquiryType,
  });
}

/**
 * Track yacht gallery interactions
 */
export function trackGalleryView(yachtModel: string, imageIndex: number): void {
  trackEvent('gallery_viewed', {
    yacht_model: yachtModel,
    image_index: imageIndex,
  });
}

// ============================================
// Adventure Yachts Configurator Events
// ============================================

/**
 * Track configurator step progression
 */
export function trackConfiguratorStep(
  stepName: string,
  yachtModel: string,
  selections?: Record<string, string | number | boolean>
): void {
  trackEvent('configurator_step_completed', {
    step_name: stepName,
    yacht_model: yachtModel,
    ...selections,
  });
}

/**
 * Track configurator completion
 */
export function trackConfiguratorComplete(
  yachtModel: string,
  totalPrice?: number,
  configurationId?: string
): void {
  trackEvent('configurator_completed', {
    yacht_model: yachtModel,
    total_price: totalPrice || 0,
    configuration_id: configurationId || '',
  });
}

/**
 * Track when a user saves a configuration
 */
export function trackConfigurationSaved(
  yachtModel: string,
  configurationId: string
): void {
  trackEvent('configuration_saved', {
    yacht_model: yachtModel,
    configuration_id: configurationId,
  });
}

// ============================================
// Lead Generation Events
// ============================================

/**
 * Track newsletter signups
 */
export function trackNewsletterSignup(source: string): void {
  trackEvent('newsletter_signup', {
    signup_source: source,
  });
}

/**
 * Track brochure downloads
 */
export function trackBrochureDownload(yachtModel: string): void {
  trackEvent('brochure_downloaded', {
    yacht_model: yachtModel,
  });
}

/**
 * Track when a user starts the financing calculator
 */
export function trackFinancingCalculator(
  yachtModel: string,
  estimatedPrice: number
): void {
  trackEvent('financing_calculator_started', {
    yacht_model: yachtModel,
    estimated_price: estimatedPrice,
  });
}

/**
 * Track lead form submissions
 */
export function trackLeadSubmission(
  leadType: string,
  value?: number,
  currency?: string
): void {
  trackEvent('lead_submitted', {
    lead_type: leadType,
    value: value || 0,
    currency: currency || 'USD',
  });
}

// ============================================
// E-commerce Events
// ============================================

/**
 * Track when a user adds a yacht to their wishlist/saved items
 */
export function trackAddToWishlist(
  yachtModel: string,
  yachtId: string,
  value?: number
): void {
  trackEvent('yacht_added_to_wishlist', {
    yacht_model: yachtModel,
    yacht_id: yachtId,
    value: value || 0,
  });
}
