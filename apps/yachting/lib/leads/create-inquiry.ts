import { db, inquiries, eq } from '@36zero/database';
import { sendLeadNotification } from '@/lib/email';
import type { LeadSource } from '@/lib/leads/sources';

const NAME_REGEX = /^[\p{L}\p{M} .'\-]{2,255}$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_CONTACTS_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';
const HUBSPOT_SEARCH_URL = 'https://api.hubapi.com/crm/v3/objects/contacts/search';

export interface CreateInquiryInput {
  source: LeadSource;
  name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  countryCode?: string | null;
  company?: string | null;
  message?: string | null;
  vesselId?: string | null;
  vesselName?: string | null;
  vesselModel?: string | null;
  manualEntryByUserId?: string | null;
  ownerUserId?: string | null;
  initialLifecycleStage?: 'new' | 'contacted';
  /** When true, suppress the staff notification email (e.g. bulk import). */
  skipNotification?: boolean;
}

export type CreateInquiryResult =
  | {
      status: 'created' | 'updated';
      inquiryId: string;
      hubspotContactId: string | null;
    }
  | {
      status: 'error';
      code: 'validation' | 'db' | 'crm';
      message: string;
      httpStatus: number;
    };

/**
 * Generic CRM inquiry creator. Use this for anything that is NOT an
 * IMHS onboard registration — IMHS keeps its own helper (createOnboardLead)
 * because it has source-specific dedup semantics, country enum validation
 * and its own HubSpot interest properties.
 *
 * Behaviour:
 *  - Validates name + email loosely (255-char name, basic email regex).
 *  - Dedups across all sources by lower(email): if a row exists, returns
 *    `updated` and merges nullable fields onto it.
 *  - Best-effort HubSpot contact upsert with fallback search-on-CONFLICT.
 *  - Writes lifecycleStage = 'new' by default (override for "already
 *    contacted" inbox approvals).
 */
export async function createInquiry(
  input: CreateInquiryInput
): Promise<CreateInquiryResult> {
  const trimmedName = input.name.trim();
  const normalizedEmail = input.email.trim().toLowerCase();

  if (!trimmedName || !NAME_REGEX.test(trimmedName)) {
    return {
      status: 'error',
      code: 'validation',
      message: 'Invalid name',
      httpStatus: 400,
    };
  }
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return {
      status: 'error',
      code: 'validation',
      message: 'Invalid email',
      httpStatus: 400,
    };
  }

  // Dedup across all sources by lowercase email. Yacht volume is low
  // enough that one row per person beats one row per source.
  const existing = await db.query.inquiries.findFirst({
    where: eq(inquiries.email, normalizedEmail),
    columns: {
      id: true,
      hubspotContactId: true,
      lifecycleStage: true,
    },
  });

  const isUpdate = !!existing;
  const lifecycleStage = input.initialLifecycleStage ?? 'new';

  // Compose the row. On update we only overwrite null-equivalent fields;
  // we don't clobber a country or company someone already entered.
  let inquiryId: string;
  try {
    if (existing) {
      const [updated] = await db
        .update(inquiries)
        .set({
          name: trimmedName,
          phone: input.phone ?? undefined,
          country: input.country ?? undefined,
          countryCode: input.countryCode ?? undefined,
          company: input.company ?? undefined,
          message: input.message ?? undefined,
          vesselId: input.vesselId ?? undefined,
          vesselName: input.vesselName ?? undefined,
          vesselModel: input.vesselModel ?? undefined,
          ownerUserId: input.ownerUserId ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(inquiries.id, existing.id))
        .returning({ id: inquiries.id });
      inquiryId = updated.id;
    } else {
      const [created] = await db
        .insert(inquiries)
        .values({
          source: input.source,
          name: trimmedName,
          email: normalizedEmail,
          phone: input.phone ?? null,
          country: input.country ?? null,
          countryCode: input.countryCode ?? null,
          company: input.company ?? null,
          message: input.message ?? null,
          vesselId: input.vesselId ?? null,
          vesselName: input.vesselName ?? null,
          vesselModel: input.vesselModel ?? null,
          manualEntry: !!input.manualEntryByUserId,
          manualEntryByUserId: input.manualEntryByUserId ?? null,
          ownerUserId: input.ownerUserId ?? null,
          lifecycleStage,
          lifecycleStageUpdatedAt: new Date(),
        })
        .returning({ id: inquiries.id });
      inquiryId = created.id;
    }
  } catch (dbError) {
    console.error('[create-inquiry] DB write failed:', dbError);
    return {
      status: 'error',
      code: 'db',
      message: 'Failed to save inquiry',
      httpStatus: 500,
    };
  }

  // HubSpot contact upsert. Non-fatal — DB is source of truth, retry worker
  // picks up failures.
  let hubspotContactId: string | null = existing?.hubspotContactId ?? null;
  if (HUBSPOT_ACCESS_TOKEN) {
    hubspotContactId = await upsertHubSpotContact({
      email: normalizedEmail,
      name: trimmedName,
      phone: input.phone ?? null,
      country: input.country ?? null,
      company: input.company ?? null,
      source: input.source,
      message: input.message ?? null,
      knownContactId: hubspotContactId,
    });
    if (hubspotContactId && hubspotContactId !== existing?.hubspotContactId) {
      try {
        await db
          .update(inquiries)
          .set({ hubspotContactId })
          .where(eq(inquiries.id, inquiryId));
      } catch (linkErr) {
        console.error('[create-inquiry] failed to link hubspotContactId (non-fatal):', linkErr);
      }
    }
  }

  if (!input.skipNotification) {
    sendLeadNotification({
      leadSource: input.source,
      email: normalizedEmail,
      name: trimmedName,
      phone: input.phone ?? undefined,
      company: input.company ?? undefined,
      country: input.country ?? undefined,
      details: {
        ...(input.vesselName ? { Vessel: input.vesselName } : {}),
        ...(input.message ? { Message: input.message } : {}),
      },
    });
  }

  return {
    status: isUpdate ? 'updated' : 'created',
    inquiryId,
    hubspotContactId,
  };
}

interface HubSpotUpsertParams {
  email: string;
  name: string;
  phone: string | null;
  country: string | null;
  company: string | null;
  source: LeadSource;
  message: string | null;
  knownContactId: string | null;
}

async function upsertHubSpotContact(params: HubSpotUpsertParams): Promise<string | null> {
  if (!HUBSPOT_ACCESS_TOKEN) return params.knownContactId;

  const [firstName, ...rest] = params.name.split(/\s+/);
  const lastName = rest.join(' ');

  const properties: Record<string, string> = {
    email: params.email,
    firstname: firstName || '',
    lastname: lastName || '',
    hs_lead_status: 'NEW',
    lifecyclestage: 'lead',
    lead_source_channel: params.source,
  };
  if (params.phone) properties.phone = params.phone;
  if (params.country) properties.country = params.country;
  if (params.company) properties.company = params.company;
  if (params.message) {
    properties.hs_content_membership_notes = params.message.slice(0, 2000);
  }

  // If we already have an id, PATCH directly. Saves a search round-trip.
  if (params.knownContactId) {
    const ok = await hubspotPatchContact(params.knownContactId, properties);
    if (ok) return params.knownContactId;
    // fall through to create-or-search if PATCH failed (id may be stale)
  }

  const createResp = await fetch(HUBSPOT_CONTACTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ properties }),
  });

  if (createResp.ok) {
    const data = await createResp.json();
    return (data.id as string) ?? null;
  }

  const errText = await createResp.text();
  let errData: { category?: string } = {};
  try {
    errData = JSON.parse(errText);
  } catch {
    console.error('[create-inquiry] HubSpot create non-JSON:', errText);
    return null;
  }

  if (errData.category !== 'CONFLICT') {
    console.error('[create-inquiry] HubSpot create error:', errData);
    return null;
  }

  // CONFLICT path: search by email, then PATCH.
  try {
    const searchResp = await fetch(HUBSPOT_SEARCH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [
          { filters: [{ propertyName: 'email', operator: 'EQ', value: params.email }] },
        ],
        limit: 1,
      }),
    });
    if (!searchResp.ok) {
      console.error('[create-inquiry] HubSpot search failed:', searchResp.status);
      return null;
    }
    const searchData = await searchResp.json();
    const existingId = (searchData.results?.[0]?.id as string) ?? null;
    if (!existingId) return null;
    const patched = await hubspotPatchContact(existingId, properties);
    return patched ? existingId : null;
  } catch (err) {
    console.error('[create-inquiry] HubSpot CONFLICT recovery threw:', err);
    return null;
  }
}

async function hubspotPatchContact(
  contactId: string,
  properties: Record<string, string>
): Promise<boolean> {
  if (!HUBSPOT_ACCESS_TOKEN) return false;
  try {
    const res = await fetch(`${HUBSPOT_CONTACTS_URL}/${contactId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });
    if (!res.ok) {
      console.error('[create-inquiry] HubSpot PATCH failed:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[create-inquiry] HubSpot PATCH threw:', err);
    return false;
  }
}
