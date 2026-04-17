// One-shot script: drop the unique index that drizzle-kit push created without
// the partial WHERE clause, and re-create it as the intended partial index
// scoped to source='imhs_onboard_registration'. See the plan §1 for the
// rationale — drizzle-kit 0.20.18 doesn't emit the WHERE clause.
//
// Run: node packages/database/scripts/fix-onboard-index.mjs
//
// Safe to run multiple times; uses IF EXISTS / IF NOT EXISTS.

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

// Strip quotes/trailing garbage from env values that may include them.
const cleaned = connectionString.trim().replace(/^['"]|['"]$/g, '');
const sql = neon(cleaned);

async function main() {
  console.log('Dropping non-partial index (if exists)...');
  await sql`DROP INDEX IF EXISTS inquiries_email_onboard_idx`;

  console.log('Creating partial unique index scoped to imhs_onboard_registration...');
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS inquiries_email_onboard_idx
      ON inquiries (email)
      WHERE source = 'imhs_onboard_registration'
  `;

  const rows = await sql`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'inquiries' AND indexname = 'inquiries_email_onboard_idx'
  `;
  console.log('Index state:');
  for (const r of rows) console.log(' -', r.indexdef);
  if (rows.length === 0) {
    console.error('Index was not created.');
    process.exit(1);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
