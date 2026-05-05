// One-shot post-push script: applies follow-on changes that drizzle-kit 0.20
// won't emit reliably for the Phase 1A CRM repurposing.
//
// 1. Backfills inquiries.lifecycle_stage from inquiries.is_contacted on rows
//    that still have the default 'new'. Idempotent: only touches rows where
//    lifecycle_stage_updated_at IS NULL (i.e. never set by a human).
// 2. Adds a CHECK constraint on lifecycle_stage so unknown enum values are
//    rejected at the database level.
//
// Run: node packages/database/scripts/fix-crm-phase-1a.mjs

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
  console.log('Backfilling inquiries.lifecycle_stage from is_contacted...');
  const backfill = await sql`
    UPDATE inquiries
       SET lifecycle_stage = 'contacted'
     WHERE lifecycle_stage = 'new'
       AND lifecycle_stage_updated_at IS NULL
       AND is_contacted = true
  `;
  console.log(' -> rows touched:', backfill.length ?? 0);

  console.log('Ensuring inquiries.lifecycle_stage CHECK constraint...');
  await sql`ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_lifecycle_stage_check`;
  await sql`
    ALTER TABLE inquiries
      ADD CONSTRAINT inquiries_lifecycle_stage_check
      CHECK (lifecycle_stage IN ('new','contacted','qualified','nurture','lost'))
  `;

  const rows = await sql`
    SELECT conname, pg_get_constraintdef(oid) AS def
      FROM pg_constraint
     WHERE conname = 'inquiries_lifecycle_stage_check'
  `;
  console.log('Constraint state:');
  for (const r of rows) console.log(' -', r.conname, r.def);
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
