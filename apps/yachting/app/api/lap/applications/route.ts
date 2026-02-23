import { NextRequest, NextResponse } from 'next/server';
import { db, lapApplications, eq } from '@36zero/database';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';

interface LapApplicationData {
  email: string;
  fullName: string;
  phone: string;
  countryCode: string;
  countryOfResidence: string;
  yachtType: 'sail' | 'power' | 'own_yacht';
  ownYachtDetails?: string;
  crewAugmentationRequired: boolean;
  selectedPassages: string[];
  guestCount: number;
  flowCompleted: boolean;
}

async function syncToHubSpot(data: LapApplicationData): Promise<string | null> {
  if (!HUBSPOT_ACCESS_TOKEN) {
    if (process.env.NODE_ENV === 'development') {
      console.log('HubSpot sync (dev mode):', data);
    }
    return null;
  }

  const nameParts = data.fullName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const yachtTypeLabels: Record<string, string> = { sail: 'Sail', power: 'Power', own_yacht: 'Own Yacht' };

  const notes = [
    'Source: LAP Application',
    `Passages: ${data.selectedPassages.join(', ')}`,
    `Guests: ${data.guestCount}`,
    `Yacht Type: ${yachtTypeLabels[data.yachtType]}`,
    data.yachtType === 'own_yacht' && data.ownYachtDetails
      ? `Own Yacht Details: ${data.ownYachtDetails}` : '',
    `Crew Augmentation: ${data.crewAugmentationRequired ? 'Yes' : 'No'}`,
    `Country: ${data.countryOfResidence}`,
    `Flow Completed: ${data.flowCompleted ? 'Yes' : 'No'}`,
  ].filter(Boolean).join(' | ');

  const properties: Record<string, string> = {
    email: data.email,
    firstname: firstName,
    lastname: lastName,
    phone: `${data.countryCode} ${data.phone}`,
    country: data.countryOfResidence,
    hs_lead_status: 'NEW',
    lifecyclestage: 'lead',
    hs_content_membership_notes: notes,
  };

  const response = await fetch(HUBSPOT_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ properties }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (errorData?.category === 'CONFLICT') {
      return null;
    }
    throw new Error(`HubSpot error: ${response.status}`);
  }

  const contactData = await response.json();
  return contactData.id;
}

export async function POST(request: NextRequest) {
  try {
    const body: LapApplicationData = await request.json();

    if (!body.email?.includes('@') || !body.fullName?.trim()) {
      return NextResponse.json(
        { error: 'Email and full name are required' },
        { status: 400 }
      );
    }

    const [application] = await db.insert(lapApplications).values({
      email: body.email,
      fullName: body.fullName,
      phone: body.phone,
      countryCode: body.countryCode,
      countryOfResidence: body.countryOfResidence,
      yachtType: body.yachtType,
      ownYachtDetails: body.yachtType === 'own_yacht' ? body.ownYachtDetails || null : null,
      crewAugmentationRequired: body.crewAugmentationRequired,
      selectedPassages: body.selectedPassages,
      guestCount: body.guestCount,
      flowCompleted: body.flowCompleted,
    }).returning();

    let hubspotContactId: string | null = null;
    try {
      hubspotContactId = await syncToHubSpot(body);
      if (hubspotContactId && application) {
        await db.update(lapApplications)
          .set({ hubspotContactId })
          .where(eq(lapApplications.id, application.id));
      }
    } catch (hsError) {
      console.error('HubSpot sync failed (non-fatal):', hsError);
    }

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      hubspotContactId,
    });
  } catch (error) {
    console.error('LAP application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: 'applicationId is required' },
        { status: 400 }
      );
    }

    await db.update(lapApplications)
      .set({ flowCompleted: true, updatedAt: new Date() })
      .where(eq(lapApplications.id, applicationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('LAP application update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
