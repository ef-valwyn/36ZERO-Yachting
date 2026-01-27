import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db, schema, eq } from '@36zero/database';

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

      await db.insert(schema.users).values({
        clerkUserId: id,
        email: primaryEmail?.email_address || email_addresses[0]?.email_address || '',
        firstName: first_name || null,
        lastName: last_name || null,
        phone: primaryPhone?.phone_number || null,
      });

      console.log(`User created: ${id}`);
      break;
    }

    case 'user.updated': {
      const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;

      const primaryEmail = email_addresses.find((e) => e.id === evt.data.primary_email_address_id);
      const primaryPhone = phone_numbers?.find((p) => p.id === evt.data.primary_phone_number_id);

      await db
        .update(schema.users)
        .set({
          email: primaryEmail?.email_address || email_addresses[0]?.email_address || '',
          firstName: first_name || null,
          lastName: last_name || null,
          phone: primaryPhone?.phone_number || null,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.clerkUserId, id));

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
