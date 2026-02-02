import { NextRequest, NextResponse } from 'next/server';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';

interface LeadData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  company?: string;
  leadSource: 'premiere_updates' | 'premiere_tour_request';
  interest?: string;
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
      // In development, just log and return success
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

    // Set lead source based on form type
    if (body.leadSource === 'premiere_updates') {
      properties.leadsource = 'AY60 Premiere - Email Updates';
      properties.hs_analytics_source = 'ORGANIC_SEARCH';
    } else if (body.leadSource === 'premiere_tour_request') {
      properties.leadsource = 'AY60 Premiere - Tour Request';
      properties.hs_analytics_source = 'DIRECT_TRAFFIC';
      
      // Add interest as a custom note
      if (body.interest) {
        properties.message = `Interest: ${body.interest}`;
      }
    }

    // First, try to find existing contact by email
    const searchResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/search`,
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

    const searchData = await searchResponse.json();

    if (searchData.total > 0) {
      // Contact exists, update them
      const contactId = searchData.results[0].id;
      
      const updateResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ properties }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('HubSpot update error:', errorData);
        return NextResponse.json(
          { error: 'Failed to update contact' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Contact updated',
        contactId,
      });
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
      const errorData = await createResponse.json();
      console.error('HubSpot create error:', errorData);
      
      // Handle duplicate email error gracefully
      if (errorData.category === 'CONFLICT') {
        return NextResponse.json({ 
          success: true, 
          message: 'Contact already exists',
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to create contact' },
        { status: 500 }
      );
    }

    const contactData = await createResponse.json();

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
