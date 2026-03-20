import { NextRequest, NextResponse } from 'next/server';
import { db, inquiries, vessels, eq } from '@36zero/database';

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
  leadSource: 'premiere_updates' | 'premiere_tour_request' | 'vessel_enquiry' | 'contact_form';
  interest?: string;
  // Vessel enquiry specific fields
  vesselId?: string;
  vesselName?: string;
  vesselModel?: string;
  deliveryRegion?: string;
  message?: string;
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

    if (!HUBSPOT_ACCESS_TOKEN) {
      console.error('HubSpot access token not configured');
      // Still save vessel enquiries to DB even without HubSpot
      if (body.leadSource === 'vessel_enquiry') {
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
            vesselName: body.vesselName || null,
            vesselModel: body.vesselModel || null,
            name: fullName || body.email,
            email: body.email,
            phone: body.phone || null,
            countryCode: body.countryCode || null,
            company: body.company || null,
            deliveryRegion: body.deliveryRegion || null,
            message: body.message || null,
            source: 'website',
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

    // Parse name into first/last
    let firstName = body.firstName || '';
    let lastName = body.lastName || '';
    
    if (!firstName && !lastName && body.email) {
      // Extract name from email if not provided
      const emailName = body.email.split('@')[0];
      firstName = emailName;
    }

    // Build HubSpot contact properties
    const properties: Record<string, string> = {
      email: body.email,
      firstname: firstName,
      lastname: lastName,
      hs_lead_status: 'NEW',
      lifecyclestage: 'lead',
      lead_source_channel: body.leadSource,
    };

    // Add optional fields if provided
    if (body.phone) {
      properties.phone = body.phone;
    }
    if (body.country) {
      properties.country = body.country;
    }
    if (body.company) {
      properties.company = body.company;
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
    }

    // Add notes to a standard HubSpot field if we have any
    if (notes.length > 0) {
      // Using hs_content_membership_notes as it's a standard text field
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

              // Build update properties — update lead source and append notes
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

              await fetch(`${HUBSPOT_API_URL}/${existingContactId}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ properties: updateProps }),
              });
            }
          }
        } catch (searchErr) {
          console.error('Failed to update existing HubSpot contact (non-fatal):', searchErr);
        }

        // Still save vessel enquiries to DB even if HubSpot contact exists
        if (body.leadSource === 'vessel_enquiry') {
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
              vesselName: body.vesselName || null,
              vesselModel: body.vesselModel || null,
              name: fullName || body.email,
              email: body.email,
              phone: body.phone || null,
              countryCode: body.countryCode || null,
              company: body.company || null,
              deliveryRegion: body.deliveryRegion || null,
              message: body.message || null,
              source: 'website',
              hubspotContactId: existingContactId || undefined,
            });
          } catch (dbError) {
            console.error('Failed to save enquiry to DB (non-fatal):', dbError);
          }
        }
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

    // Save vessel enquiries to the inquiries table
    if (body.leadSource === 'vessel_enquiry') {
      try {
        // Look up vessel UUID by slug if vesselId is provided
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
          vesselName: body.vesselName || null,
          vesselModel: body.vesselModel || null,
          name: fullName || body.email,
          email: body.email,
          phone: body.phone || null,
          countryCode: body.countryCode || null,
          company: body.company || null,
          deliveryRegion: body.deliveryRegion || null,
          message: body.message || null,
          source: 'website',
          hubspotContactId: contactData.id,
        });
      } catch (dbError) {
        console.error('Failed to save enquiry to DB (non-fatal):', dbError);
      }
    }

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
