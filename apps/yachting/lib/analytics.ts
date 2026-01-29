/**
 * Google Analytics 4 Event Tracking Utilities
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

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Check if Google Analytics is available
 */
export function isGAEnabled(): boolean {
  return typeof window !== 'undefined' && !!GA_MEASUREMENT_ID && !!window.gtag;
}

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
): void {
  if (!isGAEnabled()) return;

  window.gtag('event', eventName, eventParams);
}

/**
 * Track a page view (useful for SPA navigation or virtual page views)
 */
export function trackPageView(url: string, title?: string): void {
  if (!isGAEnabled()) return;

  window.gtag('event', 'page_view', {
    page_path: url,
    page_title: title,
  });
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
  trackEvent('view_yacht', {
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
  trackEvent('gallery_view', {
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
  trackEvent('configurator_step', {
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
  trackEvent('configurator_complete', {
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
  trackEvent('brochure_download', {
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
  trackEvent('financing_calculator_start', {
    yacht_model: yachtModel,
    estimated_price: estimatedPrice,
  });
}

// ============================================
// E-commerce Events (GA4 Enhanced)
// ============================================

/**
 * Track when a user adds a yacht to their wishlist/saved items
 */
export function trackAddToWishlist(
  yachtModel: string,
  yachtId: string,
  value?: number
): void {
  trackEvent('add_to_wishlist', {
    items: JSON.stringify([
      {
        item_id: yachtId,
        item_name: yachtModel,
        price: value,
      },
    ]),
  });
}

/**
 * Track lead form submissions (GA4 generate_lead event)
 */
export function trackLeadSubmission(
  leadType: string,
  value?: number,
  currency?: string
): void {
  trackEvent('generate_lead', {
    lead_type: leadType,
    value: value || 0,
    currency: currency || 'USD',
  });
}
