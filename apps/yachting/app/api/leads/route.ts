import { NextRequest, NextResponse } from 'next/server';
import { db, inquiries, vessels, eq, and, sql } from '@36zero/database';
import { isCanonicalEnCountry } from '@36zero/ui';
import { sendLeadNotification } from '@/lib/email';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';

type LeadSource =
  | 'premiere_updates'
  | 'premiere_tour_request'
  | 'vessel_enquiry'
  | 'contact_form'
  | 'imhs_updates'
  | 'imhs_tour_request'
  | 'imhs_onboard_registration';

interface LeadData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  countryCode?: string;
  country?: string;
  company?: string;
  leadSource: LeadSource;
  interest?: string;
  // Vessel enquiry specific fields
  vesselId?: string;
  vesselName?: string;
  vesselModel?: string;
  deliveryRegion?: string;
  message?: string;
  // IMHS onboard registration specific fields
  interestAdventureYachts?: boolean;
  interestShift?: boolean;
}

/**
 * Canonical submission shape used by every downstream step of the IMHS onboard
 * flow (HubSpot create/patch, notes, DB upsert, notification email). This is
 * built AFTER the dedup+merge branch so it holds the post-merge interest flags,
 * never the raw body values.
 */
interface OnboardFinalLead {
  email: string; // lowercased + trimmed
  firstName: string;
  lastName: string;
  country: string; // canonical English
  interestAdventureYachts: boolean; // merged
  interestShift: boolean; // merged
}

const NAME_REGEX = /^[\p{L}\p{M} .'\-]{2,100}$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildNotificationDetails(
  body: LeadData,
  onboard?: OnboardFinalLead
): Record<string, string | undefined> {
  const regionLabels: Record<string, string> = {
    'asia': 'Asia', 'europe': 'Europe', 'us': 'United States',
    'caribbean': 'Caribbean', 'australia-nz': 'Australia / New Zealand', 'middle-east': 'Middle East',
  };
  const details: Record<string, string | undefined> = {};

  if (body.leadSource === 'vessel_enquiry') {
    details['Vessel'] = body.vesselName ? `${body.vesselName} (${body.vesselModel || 'N/A'})` : undefined;
    details['Delivery Region'] = body.deliveryRegion ? (regionLabels[body.deliveryRegion] || body.deliveryRegion) : undefined;
  }
  if (body.leadSource === 'imhs_tour_request' || body.leadSource === 'premiere_tour_request') {
    details['Interest'] = body.interest;
  }
  if (body.leadSource === 'contact_form') {
    details['Interest'] = body.interest;
  }
  if (body.leadSource === 'imhs_onboard_registration' && onboard) {
    // Use post-merge values so the notification reflects the final state,
    // not just the newly-added interest from this specific submission.
    details['Adventure Yachts'] = onboard.interestAdventureYachts ? 'Yes' : 'No';
    details['Shift Yachts'] = onboard.interestShift ? 'Yes' : 'No';
  }
  if (body.message) {
    details['Message'] = body.message;
  }
  return details;
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadData = await request.json();

    if (!body.email || !body.email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Parse name into first/last (used by most sources below).
    let firstName = body.firstName || '';
    let lastName = body.lastName || '';

    if (!firstName && !lastName && body.email) {
      const emailName = body.email.split('@')[0];
      firstName = emailName;
    }

    // =========================================
    // IMHS ONBOARD REGISTRATION — dedup + merge
    // =========================================
    //
    // Runs BEFORE any HubSpot call so we can 409-short-circuit "already
    // registered" submissions without burning a CRM round trip. The partial
    // unique index on `(email) WHERE source = 'imhs_onboard_registration'`
    // keeps one row per email; the upsert OR-merges interest booleans.
    let onboardFinal: OnboardFinalLead | null = null;
    let onboardExistingRowId: string | null = null;
    let onboardExistingHubspotId: string | null = null;

    if (body.leadSource === 'imhs_onboard_registration') {
      // Strict server-side validation — the client also validates, but the
      // server is the source of truth.
      const trimmedFirst = (body.firstName || '').trim();
      const trimmedLast = (body.lastName || '').trim();
      const combinedName = [trimmedFirst, trimmedLast].filter(Boolean).join(' ');
      if (!combinedName || !NAME_REGEX.test(combinedName)) {
        return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
      }
      if (!EMAIL_REGEX.test(body.email)) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
      }
      if (!body.country || !isCanonicalEnCountry(body.country)) {
        return NextResponse.json({ error: 'Invalid country' }, { status: 400 });
      }
      if (!body.interestAdventureYachts && !body.interestShift) {
        return NextResponse.json(
          { error: 'At least one interest must be selected' },
          { status: 400 }
        );
      }

      const normalizedEmail = body.email.trim().toLowerCase();

      // Pre-SELECT for 409 short-circuit.
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

      if (existing) {
        const addsAY = !!body.interestAdventureYachts && !existing.interestAdventureYachts;
        const addsShift = !!body.interestShift && !existing.interestShift;
        if (!addsAY && !addsShift) {
          return NextResponse.json(
            {
              error: 'already_registered',
              message: 'You have already registered with this email.',
            },
            { status: 409 }
          );
        }
        onboardExistingRowId = existing.id;
        onboardExistingHubspotId = existing.hubspotContactId || null;
      }

      const mergedAY =
        (existing?.interestAdventureYachts ?? false) ||
        !!body.interestAdventureYachts;
      const mergedShift =
        (existing?.interestShift ?? false) || !!body.interestShift;

      // Build the canonical object — every downstream step reads from this.
      onboardFinal = {
        email: normalizedEmail,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        country: body.country,
        interestAdventureYachts: mergedAY,
        interestShift: mergedShift,
      };

      firstName = trimmedFirst;
      lastName = trimmedLast;

      // Atomic upsert via raw SQL — drizzle-orm 0.29.5's builder doesn't
      // support `targetWhere` on `onConflictDoUpdate`, which we need to match
      // the partial unique index scoped to source='imhs_onboard_registration'.
      // OR-merges the interest booleans; never clears a previously-set flag.
      const nameVal =
        [onboardFinal.firstName, onboardFinal.lastName].filter(Boolean).join(' ') ||
        onboardFinal.email;
      const messageVal = buildOnboardMessage(onboardFinal);

      try {
        await db.execute(sql`
          INSERT INTO inquiries (
            email, source, name, country,
            interest_adventure_yachts, interest_shift, message, hubspot_contact_id
          )
          VALUES (
            ${onboardFinal.email},
            'imhs_onboard_registration',
            ${nameVal},
            ${onboardFinal.country},
            ${onboardFinal.interestAdventureYachts},
            ${onboardFinal.interestShift},
            ${messageVal},
            ${onboardExistingHubspotId}
          )
          ON CONFLICT (email) WHERE source = 'imhs_onboard_registration'
          DO UPDATE SET
            interest_adventure_yachts = inquiries.interest_adventure_yachts OR EXCLUDED.interest_adventure_yachts,
            interest_shift            = inquiries.interest_shift            OR EXCLUDED.interest_shift,
            name                      = EXCLUDED.name,
            country                   = EXCLUDED.country,
            message                   = EXCLUDED.message
        `);
      } catch (dbError) {
        console.error('IMHS onboard DB upsert failed:', dbError);
        return NextResponse.json(
          { error: 'Failed to save registration' },
          { status: 500 }
        );
      }
    }

    if (!HUBSPOT_ACCESS_TOKEN) {
      console.error('HubSpot access token not configured');
      // Still save vessel enquiries and IMHS tour requests to DB even without HubSpot.
      // IMHS onboard registrations were already written above via upsert.
      if (body.leadSource === 'vessel_enquiry' || body.leadSource === 'imhs_tour_request') {
        try {
          let vesselUuid: string | null = null;
          if (body.vesselId) {
            const vessel = await db.query.vessels.findFirst({
              where: eq(vessels.slug, body.vesselId),
            });
            vesselUuid = vessel?.id || null;
          }
          const fullName = [body.firstName || '', body.lastName || ''].filter(Boolean).join(' ');
          await db.insert(inquiries).values({
            vesselId: vesselUuid,
            vesselName: body.leadSource === 'imhs_tour_request' ? 'AY60' : (body.vesselName || null),
            vesselModel: body.leadSource === 'imhs_tour_request' ? 'AY60 Power Catamaran' : (body.vesselModel || null),
            name: fullName || body.email,
            email: body.email,
            phone: body.phone || null,
            countryCode: body.countryCode || null,
            company: body.company || null,
            deliveryRegion: body.deliveryRegion || null,
            message: body.leadSource === 'imhs_tour_request' ? (body.interest || null) : (body.message || null),
            source: body.leadSource === 'imhs_tour_request' ? 'imhs_2026' : 'website',
          });
        } catch (dbError) {
          console.error('Failed to save enquiry to DB:', dbError);
        }
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('Lead data (dev mode):', body);
        return NextResponse.json({ success: true, message: 'Lead captured (dev mode)' });
      }
      return NextResponse.json(
        { error: 'CRM not configured' },
        { status: 500 }
      );
    }

    // Build HubSpot contact properties. For onboard registrations, read from
    // onboardFinal (merged values) instead of raw body.
    const properties: Record<string, string> = {
      email: onboardFinal?.email || body.email,
      firstname: onboardFinal?.firstName || firstName,
      lastname: onboardFinal?.lastName || lastName,
      hs_lead_status: 'NEW',
      lifecyclestage: 'lead',
      lead_source_channel: body.leadSource,
    };

    // Add optional fields if provided
    if (body.phone) {
      properties.phone = body.phone;
    }
    if (onboardFinal?.country || body.country) {
      properties.country = onboardFinal?.country || body.country!;
    }
    if (body.company) {
      properties.company = body.company;
    }

    // Onboard registration custom checkboxes (HubSpot expects the string 'true'/'false').
    if (onboardFinal) {
      properties.interested_adventure_yachts = onboardFinal.interestAdventureYachts ? 'true' : 'false';
      properties.interested_shift = onboardFinal.interestShift ? 'true' : 'false';
    }

    // Build notes based on lead source
    const notes: string[] = [];

    if (body.leadSource === 'vessel_enquiry' && body.vesselName) {
      notes.push(`Vessel Enquiry: ${body.vesselName} (${body.vesselModel || 'N/A'})`);
      notes.push(`Vessel ID: ${body.vesselId || 'N/A'}`);
      if (body.deliveryRegion) {
        const regionLabels: Record<string, string> = {
          'asia': 'Asia',
          'europe': 'Europe',
          'us': 'United States',
          'caribbean': 'Caribbean',
          'australia-nz': 'Australia / New Zealand',
          'middle-east': 'Middle East',
        };
        notes.push(`Preferred Delivery Region: ${regionLabels[body.deliveryRegion] || body.deliveryRegion}`);
      }
      if (body.message) {
        notes.push(`Message: ${body.message}`);
      }
    } else if (body.leadSource === 'premiere_updates') {
      notes.push('Source: AY60 Premiere - Email Updates');
    } else if (body.leadSource === 'premiere_tour_request') {
      notes.push('Source: AY60 Premiere - Tour Request');
      if (body.interest) {
        notes.push(`Interest: ${body.interest}`);
      }
    } else if (body.leadSource === 'contact_form') {
      notes.push('Source: Contact Form');
      if (body.interest) {
        notes.push(`Interest: ${body.interest}`);
      }
      if (body.message) {
        notes.push(`Message: ${body.message}`);
      }
    } else if (body.leadSource === 'imhs_updates') {
      notes.push('Source: IMHS 2026 - Email Updates');
    } else if (body.leadSource === 'imhs_tour_request') {
      notes.push('Source: IMHS 2026 - AY60 Viewing Request');
      if (body.interest) {
        notes.push(`Interest: ${body.interest}`);
      }
    } else if (body.leadSource === 'imhs_onboard_registration' && onboardFinal) {
      notes.push('Source: IMHS 2026 - Onboard Registration (QR)');
      const interests: string[] = [];
      if (onboardFinal.interestAdventureYachts) interests.push('Adventure Yachts');
      if (onboardFinal.interestShift) interests.push('Shift Yachts');
      notes.push(`Interests: ${interests.join(', ')}`);
      notes.push(`Country: ${onboardFinal.country}`);
    }

    // Add notes to a standard HubSpot field if we have any
    if (notes.length > 0) {
      properties.hs_content_membership_notes = notes.join(' | ');
    }

    // Create new contact
    const createResponse = await fetch(HUBSPOT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        console.error('HubSpot create error (non-JSON):', errorText);
        return NextResponse.json(
          { error: 'Failed to create contact' },
          { status: 500 }
        );
      }

      console.error('HubSpot create error:', errorData);

      // Handle duplicate email error gracefully - contact already exists
      if (errorData.category === 'CONFLICT') {
        // Search for the existing contact and update it with the new lead source & notes
        let existingContactId: string | null = null;
        let patchSucceeded = false;
        try {
          const searchResponse = await fetch(
            'https://api.hubapi.com/crm/v3/objects/contacts/search',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                filterGroups: [{
                  filters: [{
                    propertyName: 'email',
                    operator: 'EQ',
                    value: onboardFinal?.email || body.email,
                  }],
                }],
              }),
            }
          );

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.total > 0) {
              existingContactId = searchData.results[0].id;

              // Build update properties — update lead source and append notes.
              // For onboard registrations, use merged values from onboardFinal.
              const updateProps: Record<string, string> = {
                lead_source_channel: body.leadSource,
              };
              if (body.phone) updateProps.phone = body.phone;
              if (onboardFinal?.country || body.country) {
                updateProps.country = onboardFinal?.country || body.country!;
              }
              if (body.company) updateProps.company = body.company;
              if (onboardFinal?.firstName || firstName) {
                updateProps.firstname = onboardFinal?.firstName || firstName;
              }
              if (onboardFinal?.lastName || lastName) {
                updateProps.lastname = onboardFinal?.lastName || lastName;
              }
              if (onboardFinal) {
                updateProps.interested_adventure_yachts = onboardFinal.interestAdventureYachts ? 'true' : 'false';
                updateProps.interested_shift = onboardFinal.interestShift ? 'true' : 'false';
              }
              if (notes.length > 0) {
                updateProps.hs_content_membership_notes = notes.join(' | ');
              }

              const patchResponse = await fetch(`${HUBSPOT_API_URL}/${existingContactId}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ properties: updateProps }),
              });

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
              `HubSpot search failed (${searchResponse.status}) for email ${onboardFinal?.email || body.email}`
            );
          }
        } catch (searchErr) {
          console.error('Failed to update existing HubSpot contact:', searchErr);
        }

        // For onboard registrations: if the PATCH failed, surface a 500 so the
        // user retries rather than silently marking them "registered" without
        // the updated HubSpot state.
        if (body.leadSource === 'imhs_onboard_registration' && !patchSucceeded) {
          return NextResponse.json(
            { error: 'Failed to update CRM contact' },
            { status: 500 }
          );
        }

        // Still save vessel enquiries and IMHS tour requests to DB even if HubSpot contact exists.
        // Onboard registrations were already upserted above; here we only need to
        // backfill hubspot_contact_id on the existing row.
        if (body.leadSource === 'vessel_enquiry' || body.leadSource === 'imhs_tour_request') {
          try {
            let vesselUuid: string | null = null;
            if (body.vesselId) {
              const vessel = await db.query.vessels.findFirst({
                where: eq(vessels.slug, body.vesselId),
              });
              vesselUuid = vessel?.id || null;
            }
            const fullName = [firstName, lastName].filter(Boolean).join(' ');
            await db.insert(inquiries).values({
              vesselId: vesselUuid,
              vesselName: body.leadSource === 'imhs_tour_request' ? 'AY60' : (body.vesselName || null),
              vesselModel: body.leadSource === 'imhs_tour_request' ? 'AY60 Power Catamaran' : (body.vesselModel || null),
              name: fullName || body.email,
              email: body.email,
              phone: body.phone || null,
              countryCode: body.countryCode || null,
              company: body.company || null,
              deliveryRegion: body.deliveryRegion || null,
              message: body.leadSource === 'imhs_tour_request' ? (body.interest || null) : (body.message || null),
              source: body.leadSource === 'imhs_tour_request' ? 'imhs_2026' : 'website',
              hubspotContactId: existingContactId || undefined,
            });
          } catch (dbError) {
            console.error('Failed to save enquiry to DB (non-fatal):', dbError);
          }
        } else if (body.leadSource === 'imhs_onboard_registration' && onboardFinal && existingContactId) {
          try {
            await db
              .update(inquiries)
              .set({ hubspotContactId: existingContactId })
              .where(
                and(
                  eq(inquiries.email, onboardFinal.email),
                  eq(inquiries.source, 'imhs_onboard_registration')
                )
              );
          } catch (dbError) {
            console.error('Failed to link onboard row to HubSpot contact (non-fatal):', dbError);
          }
        }

        // Send email notification (fire and forget)
        sendLeadNotification({
          leadSource: body.leadSource,
          email: onboardFinal?.email || body.email,
          name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
          phone: body.phone,
          company: body.company,
          country: onboardFinal?.country || body.country,
          details: buildNotificationDetails(body, onboardFinal || undefined),
        });

        return NextResponse.json({
          success: true,
          message: 'Contact updated',
          contactId: existingContactId,
        });
      }

      return NextResponse.json(
        { error: 'Failed to create contact' },
        { status: 500 }
      );
    }

    const contactData = await createResponse.json();

    // Save vessel enquiries and IMHS tour requests to the inquiries table.
    // IMHS onboard registrations were already written above via upsert; here
    // we just backfill the hubspot_contact_id link.
    if (body.leadSource === 'vessel_enquiry' || body.leadSource === 'imhs_tour_request') {
      try {
        let vesselUuid: string | null = null;
        if (body.vesselId) {
          const vessel = await db.query.vessels.findFirst({
            where: eq(vessels.slug, body.vesselId),
          });
          vesselUuid = vessel?.id || null;
        }

        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        await db.insert(inquiries).values({
          vesselId: vesselUuid,
          vesselName: body.leadSource === 'imhs_tour_request' ? 'AY60' : (body.vesselName || null),
          vesselModel: body.leadSource === 'imhs_tour_request' ? 'AY60 Power Catamaran' : (body.vesselModel || null),
          name: fullName || body.email,
          email: body.email,
          phone: body.phone || null,
          countryCode: body.countryCode || null,
          company: body.company || null,
          deliveryRegion: body.deliveryRegion || null,
          message: body.leadSource === 'imhs_tour_request' ? (body.interest || null) : (body.message || null),
          source: body.leadSource === 'imhs_tour_request' ? 'imhs_2026' : 'website',
          hubspotContactId: contactData.id,
        });
      } catch (dbError) {
        console.error('Failed to save enquiry to DB (non-fatal):', dbError);
      }
    } else if (body.leadSource === 'imhs_onboard_registration' && onboardFinal) {
      try {
        await db
          .update(inquiries)
          .set({ hubspotContactId: contactData.id })
          .where(
            and(
              eq(inquiries.email, onboardFinal.email),
              eq(inquiries.source, 'imhs_onboard_registration')
            )
          );
      } catch (dbError) {
        console.error('Failed to link onboard row to HubSpot contact (non-fatal):', dbError);
      }
    }

    // Send email notification (fire and forget)
    sendLeadNotification({
      leadSource: body.leadSource,
      email: onboardFinal?.email || body.email,
      name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
      phone: body.phone,
      company: body.company,
      country: onboardFinal?.country || body.country,
      details: buildNotificationDetails(body, onboardFinal || undefined),
    });

    return NextResponse.json({
      success: true,
      message: 'Contact created',
      contactId: contactData.id,
    });

  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildOnboardMessage(lead: OnboardFinalLead): string {
  const parts = ['IMHS 2026 Onboard Registration (QR)'];
  const interests: string[] = [];
  if (lead.interestAdventureYachts) interests.push('Adventure Yachts');
  if (lead.interestShift) interests.push('Shift Yachts');
  parts.push(`Interests: ${interests.join(', ') || 'none'}`);
  parts.push(`Country: ${lead.country}`);
  return parts.join(' | ');
}
