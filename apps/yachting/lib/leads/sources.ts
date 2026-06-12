/**
 * Canonical lead-source enum for the whole app.
 *
 * Use this as the single source of truth — do not redefine `LeadSource`
 * unions inline in routes or notification code. The DB column is a free
 * varchar so adding a value here is a one-line change; just keep the label
 * map below in sync so notification emails still render a friendly name.
 */

export const LEAD_SOURCES = [
  // Inbound from our own surfaces
  'website',
  'vessel_enquiry',
  'contact_form',
  // Email signups
  'premiere_updates',
  'imhs_updates',
  // Tour / viewing requests
  'premiere_tour_request',
  'imhs_tour_request',
  // IMHS show
  'imhs_2026',
  'imhs_onboard_registration',
  // Other application paths
  'lap_application',
  // Generic CRM intake (Phase 1A+)
  'inbound_email',
  'referral',
  'direct_outreach',
  'boat_show_other',
  'manual_admin_entry',
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

/**
 * Friendly labels for staff-facing surfaces (notification emails, admin UI
 * filters). New sources fall back to the raw value if a label isn't set.
 */
export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  website: 'Website',
  vessel_enquiry: 'Vessel Enquiry',
  contact_form: 'Contact Form',
  premiere_updates: 'Premiere Email Signup',
  imhs_updates: 'IMHS 2026 Email Signup',
  premiere_tour_request: 'Premiere Tour Request',
  imhs_tour_request: 'IMHS 2026 Tour Request',
  imhs_2026: 'IMHS 2026',
  imhs_onboard_registration: 'IMHS 2026 Onboard Registration',
  lap_application: 'LAP Application',
  inbound_email: 'Inbound Email',
  referral: 'Referral',
  direct_outreach: 'Direct Outreach',
  boat_show_other: 'Boat Show (Other)',
  manual_admin_entry: 'Manual Admin Entry',
};

export function leadSourceLabel(value: string | null | undefined): string {
  if (!value) return 'Unknown';
  return (LEAD_SOURCE_LABELS as Record<string, string>)[value] ?? value;
}

export function isKnownLeadSource(value: unknown): value is LeadSource {
  return typeof value === 'string' && (LEAD_SOURCES as readonly string[]).includes(value);
}
