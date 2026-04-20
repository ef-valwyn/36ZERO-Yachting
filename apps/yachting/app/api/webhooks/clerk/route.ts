import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db, schema, eq } from '@36zero/database';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';

interface HubSpotContactData {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  clerk_user_id?: string;
}

async function syncToHubSpot(data: HubSpotContactData, action: 'create' | 'update' | 'delete'): Promise<void> {
  if (!HUBSPOT_ACCESS_TOKEN) {
    console.log('HubSpot not configured, skipping sync');
    return;
  }

  const properties: Record<string, string> = {
    email: data.email,
    hs_lead_status: 'NEW',
    lifecyclestage: 'lead',
    lead_source_channel: 'google_sso',
  };

  if (data.firstname) properties.firstname = data.firstname;
  if (data.lastname) properties.lastname = data.lastname;
  if (data.phone) properties.phone = data.phone;

  try {
    if (action === 'create') {
      const response = await fetch(HUBSPOT_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // If contact already exists (CONFLICT), that's OK
        if (errorData.category !== 'CONFLICT') {
          console.error('HubSpot create error:', errorData);
        }
      } else {
        console.log(`HubSpot: Contact created for ${data.email}`);
      }
    } else if (action === 'update') {
      // Search for existing contact by email
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
                value: data.email,
              }],
            }],
          }),
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.total > 0) {
          const contactId = searchData.results[0].id;
          const updateResponse = await fetch(`${HUBSPOT_API_URL}/${contactId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ properties }),
          });

          if (updateResponse.ok) {
            console.log(`HubSpot: Contact updated for ${data.email}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('HubSpot sync error:', error);
  }
}

export async function POST(req: Request) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred during verification', {
      status: 400,
    });
  }

  // Handle the webhook event
  const eventType = evt.type;

  switch (eventType) {
    case 'user.created': {
      const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;

      const primaryEmail = email_addresses.find((e) => e.id === evt.data.primary_email_address_id);
      const primaryPhone = phone_numbers?.find((p) => p.id === evt.data.primary_phone_number_id);
      const email = primaryEmail?.email_address || email_addresses[0]?.email_address || '';

      // Auto-promote to 'staff' if email is in the admin allowlist.
      // (Admin GUI gating — see apps/yachting/lib/auth/require-staff.ts.)
      const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST ?? '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const role = allowlist.includes(email.toLowerCase()) ? 'staff' : 'customer';

      // Sync to database
      await db.insert(schema.users).values({
        clerkUserId: id,
        email,
        firstName: first_name || null,
        lastName: last_name || null,
        phone: primaryPhone?.phone_number || null,
        role,
      });

      // Sync to HubSpot
      await syncToHubSpot({
        email,
        firstname: first_name || undefined,
        lastname: last_name || undefined,
        phone: primaryPhone?.phone_number || undefined,
        clerk_user_id: id,
      }, 'create');

      console.log(`User created: ${id}`);
      break;
    }

    case 'user.updated': {
      const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;

      const primaryEmail = email_addresses.find((e) => e.id === evt.data.primary_email_address_id);
      const primaryPhone = phone_numbers?.find((p) => p.id === evt.data.primary_phone_number_id);
      const email = primaryEmail?.email_address || email_addresses[0]?.email_address || '';

      // Re-evaluate allowlist on update (staff may be added after initial signup).
      // Never demote — preserves manually-elevated admins.
      const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST ?? '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const existing = await db.query.users.findFirst({
        where: eq(schema.users.clerkUserId, id),
        columns: { role: true },
      });
      const shouldPromote =
        allowlist.includes(email.toLowerCase()) &&
        existing?.role === 'customer';

      // Sync to database
      await db
        .update(schema.users)
        .set({
          email,
          firstName: first_name || null,
          lastName: last_name || null,
          phone: primaryPhone?.phone_number || null,
          ...(shouldPromote ? { role: 'staff' as const } : {}),
          updatedAt: new Date(),
        })
        .where(eq(schema.users.clerkUserId, id));

      // Sync to HubSpot
      await syncToHubSpot({
        email,
        firstname: first_name || undefined,
        lastname: last_name || undefined,
        phone: primaryPhone?.phone_number || undefined,
        clerk_user_id: id,
      }, 'update');

      console.log(`User updated: ${id}`);
      break;
    }

    case 'user.deleted': {
      const { id } = evt.data;

      if (id) {
        await db.delete(schema.users).where(eq(schema.users.clerkUserId, id));
        console.log(`User deleted: ${id}`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
