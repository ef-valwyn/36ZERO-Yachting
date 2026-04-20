// One-shot post-push script: applies a CHECK constraint on inquiries.rating
// that drizzle-kit 0.20.18 doesn't reliably emit via the builder DSL.
//
// Run: node packages/database/scripts/fix-admin-schema.mjs
//
// Idempotent. Safe to re-run on every db:push.

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
  console.log('Ensuring inquiries.rating CHECK constraint (1..5)...');
  // Drop first (in case we ever change the range) then re-create.
  await sql`ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_rating_range`;
  await sql`
    ALTER TABLE inquiries
      ADD CONSTRAINT inquiries_rating_range
      CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5))
  `;

  const rows = await sql`
    SELECT conname, pg_get_constraintdef(oid) AS def
    FROM pg_constraint
    WHERE conname = 'inquiries_rating_range'
  `;
  console.log('Constraint state:');
  for (const r of rows) console.log(' -', r.conname, r.def);
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
