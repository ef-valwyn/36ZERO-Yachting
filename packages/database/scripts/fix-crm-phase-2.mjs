// One-shot post-push script for Phase 2 (inbound email → drafts).
//
// Adds a CHECK constraint on inbound_drafts.status so unknown values are
// rejected at the DB layer. Idempotent: drop-then-recreate.
//
// Run: node packages/database/scripts/fix-crm-phase-2.mjs

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env.local') });

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('No DATABASE_URL set.');
  process.exit(1);
}
const cleaned = connectionString.trim().replace(/^['"]|['"]$/g, '');
const sql = neon(cleaned);

async function main() {
  console.log('Ensuring inbound_drafts.status CHECK constraint...');
  await sql`ALTER TABLE inbound_drafts DROP CONSTRAINT IF EXISTS inbound_drafts_status_check`;
  await sql`
    ALTER TABLE inbound_drafts
      ADD CONSTRAINT inbound_drafts_status_check
      CHECK (status IN (
        'parsing',
        'parsed',
        'parse_failed',
        'approved',
        'rejected',
        'duplicate'
      ))
  `;

  const rows = await sql`
    SELECT conname, pg_get_constraintdef(oid) AS def
      FROM pg_constraint
     WHERE conname = 'inbound_drafts_status_check'
  `;
  console.log('Constraint state:');
  for (const r of rows) console.log(' -', r.conname, r.def);
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
