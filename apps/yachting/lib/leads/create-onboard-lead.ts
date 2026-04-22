import { db, inquiries, eq, and, sql } from '@36zero/database';
import { isCanonicalEnCountry } from '@36zero/ui';
import { sendLeadNotification } from '@/lib/email';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';

const NAME_REGEX = /^[\p{L}\p{M} .'\-]{2,100}$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface CreateOnboardLeadInput {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  interestAdventureYachts: boolean;
  interestShift: boolean;
  manualEntry?: boolean;
  manualEntryByUserId?: string;
  skipNotification?: boolean;
}

export type CreateOnboardLeadResult =
  | {
      status: 'created' | 'updated';
      inquiryId: string;
      hubspotContactId: string | null;
    }
  | { status: 'conflict'; message: string }
  | {
      status: 'error';
      code: 'validation' | 'db' | 'crm';
      message: string;
      httpStatus: number;
    };

function buildOnboardMessage(input: {
  country: string;
  interestAdventureYachts: boolean;
  interestShift: boolean;
  manualEntry: boolean;
}): string {
  const parts = [
    input.manualEntry
      ? 'IMHS 2026 Onboard Registration (manual)'
      : 'IMHS 2026 Onboard Registration (QR)',
  ];
  const interests: string[] = [];
  if (input.interestAdventureYachts) interests.push('Adventure Yachts');
  if (input.interestShift) interests.push('Shift Yachts');
  parts.push(`Interests: ${interests.join(', ') || 'none'}`);
  parts.push(`Country: ${input.country}`);
  return parts.join(' | ');
}

/**
 * Create or update an IMHS onboard-registration lead end-to-end: validation,
 * dedup/merge upsert into `inquiries`, HubSpot contact create/patch, and
 * (optional) staff notification email.
 *
 * Shared by the public `/api/leads` route (QR form) and the admin manual-entry
 * route. Manual-entry callers pass `manualEntry: true` + `manualEntryByUserId`
 * and typically `skipNotification: true`.
 */
export async function createOnboardLead(
  input: CreateOnboardLeadInput
): Promise<CreateOnboardLeadResult> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const combinedName = [firstName, lastName].filter(Boolean).join(' ');

  if (!combinedName || !NAME_REGEX.test(combinedName)) {
    return { status: 'error', code: 'validation', message: 'Invalid name', httpStatus: 400 };
  }
  if (!EMAIL_REGEX.test(input.email)) {
    return { status: 'error', code: 'validation', message: 'Invalid email', httpStatus: 400 };
  }
  if (!input.country || !isCanonicalEnCountry(input.country)) {
    return { status: 'error', code: 'validation', message: 'Invalid country', httpStatus: 400 };
  }
  if (!input.interestAdventureYachts && !input.interestShift) {
    return {
      status: 'error',
      code: 'validation',
      message: 'At least one interest must be selected',
      httpStatus: 400,
    };
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const manualEntry = !!input.manualEntry;

  const existing = await db.query.inquiries.findFirst({
    where: and(
      eq(inquiries.email, normalizedEmail),
      eq(inquiries.source, 'imhs_onboard_registration')
    ),
    columns: {
      id: true,
      interestAdventureYachts: true,
      interestShift: true,
      hubspotContactId: true,
    },
  });

  const isUpdate = !!existing;

  if (existing) {
    const addsAY =
      !!input.interestAdventureYachts && !existing.interestAdventureYachts;
    const addsShift = !!input.interestShift && !existing.interestShift;
    if (!addsAY && !addsShift) {
      return {
        status: 'conflict',
        message: 'Already registered with this email.',
      };
    }
  }

  const mergedAY =
    (existing?.interestAdventureYachts ?? false) || !!input.interestAdventureYachts;
  const mergedShift =
    (existing?.interestShift ?? false) || !!input.interestShift;

  const nameVal = combinedName || normalizedEmail;
  const messageVal = buildOnboardMessage({
    country: input.country,
    interestAdventureYachts: mergedAY,
    interestShift: mergedShift,
    manualEntry,
  });

  try {
    await db.execute(sql`
      INSERT INTO inquiries (
        email, source, name, country,
        interest_adventure_yachts, interest_shift, message, hubspot_contact_id,
        manual_entry, manual_entry_by_user_id
      )
      VALUES (
        ${normalizedEmail},
        'imhs_onboard_registration',
        ${nameVal},
        ${input.country},
        ${mergedAY},
        ${mergedShift},
        ${messageVal},
        ${existing?.hubspotContactId ?? null},
        ${manualEntry},
        ${input.manualEntryByUserId ?? null}
      )
      ON CONFLICT (email) WHERE source = 'imhs_onboard_registration'
      DO UPDATE SET
        interest_adventure_yachts = inquiries.interest_adventure_yachts OR EXCLUDED.interest_adventure_yachts,
        interest_shift            = inquiries.interest_shift            OR EXCLUDED.interest_shift,
        name                      = EXCLUDED.name,
        country                   = EXCLUDED.country,
        message                   = EXCLUDED.message,
        manual_entry              = inquiries.manual_entry OR EXCLUDED.manual_entry,
        manual_entry_by_user_id   = COALESCE(inquiries.manual_entry_by_user_id, EXCLUDED.manual_entry_by_user_id)
    `);
  } catch (dbError) {
    console.error('IMHS onboard DB upsert failed:', dbError);
    return {
      status: 'error',
      code: 'db',
      message: 'Failed to save registration',
      httpStatus: 500,
    };
  }

  // Re-fetch the post-upsert row so we always have the canonical id.
  const postRow = await db.query.inquiries.findFirst({
    where: and(
      eq(inquiries.email, normalizedEmail),
      eq(inquiries.source, 'imhs_onboard_registration')
    ),
    columns: { id: true, hubspotContactId: true },
  });
  if (!postRow) {
    return {
      status: 'error',
      code: 'db',
      message: 'Upsert row missing after write',
      httpStatus: 500,
    };
  }

  // HubSpot sync (create, or patch on duplicate).
  let hubspotContactId: string | null = postRow.hubspotContactId ?? null;
  const notes: string[] = [
    manualEntry
      ? 'Source: IMHS 2026 - Onboard Registration (manual admin entry)'
      : 'Source: IMHS 2026 - Onboard Registration (QR)',
  ];
  const interests: string[] = [];
  if (mergedAY) interests.push('Adventure Yachts');
  if (mergedShift) interests.push('Shift Yachts');
  notes.push(`Interests: ${interests.join(', ')}`);
  notes.push(`Country: ${input.country}`);

  const properties: Record<string, string> = {
    email: normalizedEmail,
    firstname: firstName,
    lastname: lastName,
    hs_lead_status: 'NEW',
    lifecyclestage: 'lead',
    lead_source_channel: 'imhs_onboard_registration',
    country: input.country,
    interested_adventure_yachts: mergedAY ? 'true' : 'false',
    interested_shift: mergedShift ? 'true' : 'false',
    hs_content_membership_notes: notes.join(' | '),
  };

  if (!HUBSPOT_ACCESS_TOKEN) {
    console.error('HubSpot access token not configured');
    // DB write already succeeded; don't fail the whole request in dev.
    if (process.env.NODE_ENV === 'development') {
      if (!input.skipNotification) {
        sendLeadNotification({
          leadSource: 'imhs_onboard_registration',
          email: normalizedEmail,
          name: combinedName,
          country: input.country,
          details: {
            'Adventure Yachts': mergedAY ? 'Yes' : 'No',
            'Shift Yachts': mergedShift ? 'Yes' : 'No',
            ...(manualEntry ? { 'Entry': 'Manual (admin)' } : {}),
          },
        });
      }
      return {
        status: isUpdate ? 'updated' : 'created',
        inquiryId: postRow.id,
        hubspotContactId,
      };
    }
    return {
      status: 'error',
      code: 'crm',
      message: 'CRM not configured',
      httpStatus: 500,
    };
  }

  const createResponse = await fetch(HUBSPOT_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ properties }),
  });

  if (createResponse.ok) {
    const data = await createResponse.json();
    hubspotContactId = data.id as string;
  } else {
    const errorText = await createResponse.text();
    let errorData: { category?: string } = {};
    try {
      errorData = JSON.parse(errorText);
    } catch {
      console.error('HubSpot create error (non-JSON):', errorText);
      return {
        status: 'error',
        code: 'crm',
        message: 'Failed to create contact',
        httpStatus: 500,
      };
    }

    if (errorData.category === 'CONFLICT') {
      let existingContactId: string | null = null;
      let patchSucceeded = false;
      try {
        const searchResponse = await fetch(
          'https://api.hubapi.com/crm/v3/objects/contacts/search',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filterGroups: [
                {
                  filters: [
                    {
                      propertyName: 'email',
                      operator: 'EQ',
                      value: normalizedEmail,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.total > 0) {
            existingContactId = searchData.results[0].id as string;
            const patchResponse = await fetch(
              `${HUBSPOT_API_URL}/${existingContactId}`,
              {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ properties }),
              }
            );
            if (!patchResponse.ok) {
              const patchErr = await patchResponse.text();
              console.error(
                `HubSpot PATCH failed (${patchResponse.status}) for contact ${existingContactId}:`,
                patchErr
              );
            } else {
              patchSucceeded = true;
            }
          }
        } else {
          console.error(
            `HubSpot search failed (${searchResponse.status}) for email ${normalizedEmail}`
          );
        }
      } catch (searchErr) {
        console.error('Failed to update existing HubSpot contact:', searchErr);
      }

      if (!patchSucceeded) {
        return {
          status: 'error',
          code: 'crm',
          message: 'Failed to update CRM contact',
          httpStatus: 500,
        };
      }
      hubspotContactId = existingContactId;
    } else {
      console.error('HubSpot create error:', errorData);
      return {
        status: 'error',
        code: 'crm',
        message: 'Failed to create contact',
        httpStatus: 500,
      };
    }
  }

  if (hubspotContactId) {
    try {
      await db
        .update(inquiries)
        .set({ hubspotContactId })
        .where(
          and(
            eq(inquiries.email, normalizedEmail),
            eq(inquiries.source, 'imhs_onboard_registration')
          )
        );
    } catch (dbError) {
      console.error('Failed to link onboard row to HubSpot contact (non-fatal):', dbError);
    }
  }

  if (!input.skipNotification) {
    sendLeadNotification({
      leadSource: 'imhs_onboard_registration',
      email: normalizedEmail,
      name: combinedName || undefined,
      country: input.country,
      details: {
        'Adventure Yachts': mergedAY ? 'Yes' : 'No',
        'Shift Yachts': mergedShift ? 'Yes' : 'No',
        ...(manualEntry ? { 'Entry': 'Manual (admin)' } : {}),
      },
    });
  }

  return {
    status: isUpdate ? 'updated' : 'created',
    inquiryId: postRow.id,
    hubspotContactId,
  };
}
