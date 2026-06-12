/**
 * HubSpot admin sync helpers for the IMHS 2026 admin GUI.
 *
 * All functions log on failure but never throw — the DB is the source of
 * truth; HubSpot is a mirror. Callers set `lead_notes.hubspot_synced=true`
 * only after a successful round-trip. The retry worker
 * (packages/database/scripts/retry-hubspot-sync.mjs) picks up failures.
 */

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3';

/**
 * HubSpot-defined association type for Note → Contact.
 * See https://developers.hubspot.com/docs/api/crm/associations (type ID 202).
 */
const NOTE_TO_CONTACT_ASSOCIATION_TYPE_ID = 202;

export interface AdminSyncInquiry {
  id: string;
  email: string;
  hubspotContactId: string | null;
}

export interface NoteForSync {
  id: string;
  body: string;
  createdAt: Date;
}

export interface AppointmentFields {
  startAt: Date | null;
  status: 'confirmed' | 'cancelled' | 'rescheduled' | 'completed' | 'no_show' | null;
  assignedStaffEmail: string | null;
}

/**
 * Resolve a HubSpot contact id for an inquiry. Prefers the cached
 * `hubspotContactId` on the inquiry row; falls back to a search by email.
 * Returns null if HubSpot isn't configured or the contact can't be found.
 */
async function resolveContactId(inquiry: AdminSyncInquiry): Promise<string | null> {
  if (!HUBSPOT_ACCESS_TOKEN) {
    console.warn('[admin-sync] HUBSPOT_ACCESS_TOKEN not set — skipping');
    return null;
  }
  if (inquiry.hubspotContactId) return inquiry.hubspotContactId;

  try {
    const res = await fetch(`${HUBSPOT_API_URL}/objects/contacts/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              { propertyName: 'email', operator: 'EQ', value: inquiry.email },
            ],
          },
        ],
        limit: 1,
      }),
    });
    if (!res.ok) {
      console.error('[admin-sync] contact search failed', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data.results?.[0]?.id ?? null;
  } catch (err) {
    console.error('[admin-sync] contact search threw', err);
    return null;
  }
}

/**
 * Patch the prospect rating on a HubSpot Contact. Uses the custom property
 * `imhs_prospect_rating` (must exist — see pre-merge blockers).
 */
export async function syncRatingToHubSpot(
  inquiry: AdminSyncInquiry,
  rating: number | null
): Promise<boolean> {
  if (!HUBSPOT_ACCESS_TOKEN) return false;
  const contactId = await resolveContactId(inquiry);
  if (!contactId) return false;

  try {
    const res = await fetch(`${HUBSPOT_API_URL}/objects/contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          imhs_prospect_rating: rating == null ? '' : String(rating),
        },
      }),
    });
    if (!res.ok) {
      console.error('[admin-sync] rating PATCH failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[admin-sync] rating PATCH threw', err);
    return false;
  }
}

/**
 * Create a native HubSpot Note engagement and associate it to the contact.
 *
 * Stamps `— <authorEmail>, <ISO timestamp>` at the end of the note body so
 * staff can see the real author on the contact timeline (the API runs under
 * a portal integration, not per-user).
 *
 * Returns the new note's HubSpot id on success, null on failure.
 */
export async function createHubSpotNote(
  inquiry: AdminSyncInquiry,
  note: NoteForSync,
  authorEmail: string
): Promise<string | null> {
  if (!HUBSPOT_ACCESS_TOKEN) return null;
  const contactId = await resolveContactId(inquiry);
  if (!contactId) return null;

  const attribution = `\n\n— ${authorEmail}, ${note.createdAt.toISOString()}`;
  const body = `${note.body}${attribution}`;

  try {
    const res = await fetch(`${HUBSPOT_API_URL}/objects/notes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          hs_note_body: body,
          hs_timestamp: note.createdAt.toISOString(),
        },
        associations: [
          {
            to: { id: contactId },
            types: [
              {
                associationCategory: 'HUBSPOT_DEFINED',
                associationTypeId: NOTE_TO_CONTACT_ASSOCIATION_TYPE_ID,
              },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      console.error('[admin-sync] note POST failed', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data.id ?? null;
  } catch (err) {
    console.error('[admin-sync] note POST threw', err);
    return null;
  }
}

/**
 * Patch the local lifecycle stage onto the HubSpot Contact via a custom
 * property. We deliberately use a custom property name (`lifecycle_stage_36zero`)
 * rather than HubSpot's native `lifecyclestage` because HubSpot's stage
 * values have their own semantics (lead, marketingqualifiedlead, etc.) and
 * are also written by HubSpot workflows — overwriting it here would create
 * a tug-of-war.
 */
export async function syncLifecycleStageToHubSpot(
  inquiry: AdminSyncInquiry,
  stage: string
): Promise<boolean> {
  if (!HUBSPOT_ACCESS_TOKEN) return false;
  const contactId = await resolveContactId(inquiry);
  if (!contactId) return false;

  try {
    const res = await fetch(`${HUBSPOT_API_URL}/objects/contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          lifecycle_stage_36zero: stage,
        },
      }),
    });
    if (!res.ok) {
      console.error(
        '[admin-sync] lifecycleStage PATCH failed',
        res.status,
        await res.text()
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error('[admin-sync] lifecycleStage PATCH threw', err);
    return false;
  }
}

/**
 * Patch the lead owner email onto the HubSpot Contact via a custom property.
 * (HubSpot's native `hubspot_owner_id` requires a HubSpot user id, which we
 * don't keep an internal mapping for. The custom property is informational.)
 */
export async function syncOwnerToHubSpot(
  inquiry: AdminSyncInquiry,
  ownerEmail: string | null
): Promise<boolean> {
  if (!HUBSPOT_ACCESS_TOKEN) return false;
  const contactId = await resolveContactId(inquiry);
  if (!contactId) return false;

  try {
    const res = await fetch(`${HUBSPOT_API_URL}/objects/contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          owner_email_36zero: ownerEmail ?? '',
        },
      }),
    });
    if (!res.ok) {
      console.error('[admin-sync] owner PATCH failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[admin-sync] owner PATCH threw', err);
    return false;
  }
}

/**
 * Patch the appointment fields on a HubSpot Contact.
 */
export async function syncAppointmentToHubSpot(
  inquiry: AdminSyncInquiry,
  appt: AppointmentFields
): Promise<boolean> {
  if (!HUBSPOT_ACCESS_TOKEN) return false;
  const contactId = await resolveContactId(inquiry);
  if (!contactId) return false;

  const properties: Record<string, string> = {
    imhs_appointment_at: appt.startAt ? appt.startAt.toISOString() : '',
    imhs_appointment_status: appt.status ?? 'none',
    imhs_assigned_staff: appt.assignedStaffEmail ?? '',
  };

  try {
    const res = await fetch(`${HUBSPOT_API_URL}/objects/contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });
    if (!res.ok) {
      console.error('[admin-sync] appointment PATCH failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[admin-sync] appointment PATCH threw', err);
    return false;
  }
}
