// Retry worker: scans lead_notes for rows where hubspot_synced=false and
// re-attempts createHubSpotNote. Safe to run on demand, any number of times.
//
// Run: node packages/database/scripts/retry-hubspot-sync.mjs
//
// Does NOT retry ratings or appointments — those sync inline in the API
// handlers. For v1, notes are the only async-sync surface.

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env.local') });

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
const token = process.env.HUBSPOT_ACCESS_TOKEN;
if (!connectionString || !token) {
  console.error('DATABASE_URL and HUBSPOT_ACCESS_TOKEN must be set.');
  process.exit(1);
}

const cleaned = connectionString.trim().replace(/^['"]|['"]$/g, '');
const sql = neon(cleaned);

const HUBSPOT_API = 'https://api.hubapi.com/crm/v3';
const NOTE_TO_CONTACT_ASSOCIATION = 202;

async function findContactId(email) {
  const res = await fetch(`${HUBSPOT_API}/objects/contacts/search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
      limit: 1,
    }),
  });
  if (!res.ok) {
    console.error(`  contact search ${res.status}: ${await res.text()}`);
    return null;
  }
  const data = await res.json();
  return data.results?.[0]?.id ?? null;
}

async function createNote(contactId, body, timestamp) {
  const res = await fetch(`${HUBSPOT_API}/objects/notes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { hs_note_body: body, hs_timestamp: timestamp },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: NOTE_TO_CONTACT_ASSOCIATION,
            },
          ],
        },
      ],
    }),
  });
  if (!res.ok) {
    console.error(`  note POST ${res.status}: ${await res.text()}`);
    return null;
  }
  const data = await res.json();
  return data.id ?? null;
}

async function main() {
  const rows = await sql`
    SELECT ln.id, ln.body, ln.created_at, ln.inquiry_id,
           u.email AS author_email,
           i.email AS inquiry_email, i.hubspot_contact_id
    FROM lead_notes ln
    JOIN inquiries i ON i.id = ln.inquiry_id
    LEFT JOIN users u ON u.id = ln.author_user_id
    WHERE ln.hubspot_synced = false
    ORDER BY ln.created_at ASC
    LIMIT 200
  `;

  if (rows.length === 0) {
    console.log('No pending notes.');
    return;
  }

  console.log(`Retrying ${rows.length} pending note(s)...`);
  for (const r of rows) {
    console.log(`- note ${r.id} (${r.inquiry_email})`);
    let contactId = r.hubspot_contact_id;
    if (!contactId) {
      contactId = await findContactId(r.inquiry_email);
      if (!contactId) {
        console.log('  no HubSpot contact — skipping');
        continue;
      }
    }
    const body = `${r.body}\n\n— ${r.author_email ?? 'unknown'}, ${new Date(r.created_at).toISOString()}`;
    const noteId = await createNote(contactId, body, new Date(r.created_at).toISOString());
    if (!noteId) {
      console.log('  create failed — leaving flag=false');
      continue;
    }
    await sql`
      UPDATE lead_notes
      SET hubspot_note_id = ${noteId},
          hubspot_synced = true,
          hubspot_synced_at = NOW()
      WHERE id = ${r.id}
    `;
    console.log(`  synced → HubSpot note ${noteId}`);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
