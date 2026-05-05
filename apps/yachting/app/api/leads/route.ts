import { NextRequest, NextResponse } from 'next/server';
import { db, inquiries, vessels, eq } from '@36zero/database';
import { sendLeadNotification } from '@/lib/email';
import { createOnboardLead } from '@/lib/leads/create-onboard-lead';
import type { LeadSource } from '@/lib/leads/sources';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';

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

function buildNotificationDetails(
  body: LeadData
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

    // IMHS onboard registration has its own end-to-end helper (validation,
    // dedup/merge upsert, HubSpot sync, notification). Return early so the
    // rest of this handler only deals with other sources.
    if (body.leadSource === 'imhs_onboard_registration') {
      const result = await createOnboardLead({
        email: body.email,
        firstName: body.firstName || '',
        lastName: body.lastName || '',
        country: body.country || '',
        interestAdventureYachts: !!body.interestAdventureYachts,
        interestShift: !!body.interestShift,
      });

      if (result.status === 'error') {
        return NextResponse.json(
          { error: result.message },
          { status: result.httpStatus }
        );
      }
      if (result.status === 'conflict') {
        return NextResponse.json(
          { error: 'already_registered', message: result.message },
          { status: 409 }
        );
      }
      return NextResponse.json({
        success: true,
        message: result.status === 'created' ? 'Contact created' : 'Contact updated',
        contactId: result.hubspotContactId ?? undefined,
      });
    }

    // Parse name into first/last (used by the non-onboard sources below).
    let firstName = body.firstName || '';
    let lastName = body.lastName || '';

    if (!firstName && !lastName && body.email) {
      const emailName = body.email.split('@')[0];
      firstName = emailName;
    }

    if (!HUBSPOT_ACCESS_TOKEN) {
      console.error('HubSpot access token not configured');
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

    const properties: Record<string, string> = {
      email: body.email,
      firstname: firstName,
      lastname: lastName,
      hs_lead_status: 'NEW',
      lifecyclestage: 'lead',
      lead_source_channel: body.leadSource,
    };

    if (body.phone) {
      properties.phone = body.phone;
    }
    if (body.country) {
      properties.country = body.country;
    }
    if (body.company) {
      properties.company = body.company;
    }

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
    }

    if (notes.length > 0) {
      properties.hs_content_membership_notes = notes.join(' | ');
    }

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

      if (errorData.category === 'CONFLICT') {
        let existingContactId: string | null = null;
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
                    value: body.email,
                  }],
                }],
              }),
            }
          );

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.total > 0) {
              existingContactId = searchData.results[0].id;

              const updateProps: Record<string, string> = {
                lead_source_channel: body.leadSource,
              };
              if (body.phone) updateProps.phone = body.phone;
              if (body.country) updateProps.country = body.country;
              if (body.company) updateProps.company = body.company;
              if (firstName) updateProps.firstname = firstName;
              if (lastName) updateProps.lastname = lastName;
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
              }
            }
          } else {
            console.error(
              `HubSpot search failed (${searchResponse.status}) for email ${body.email}`
            );
          }
        } catch (searchErr) {
          console.error('Failed to update existing HubSpot contact:', searchErr);
        }

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
        }

        sendLeadNotification({
          leadSource: body.leadSource,
          email: body.email,
          name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
          phone: body.phone,
          company: body.company,
          country: body.country,
          details: buildNotificationDetails(body),
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
    }

    sendLeadNotification({
      leadSource: body.leadSource,
      email: body.email,
      name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
      phone: body.phone,
      company: body.company,
      country: body.country,
      details: buildNotificationDetails(body),
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
