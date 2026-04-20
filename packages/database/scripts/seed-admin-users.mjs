// Idempotent seed: sets users.role = 'staff' for any email already in the
// users table (synced from Clerk) that matches ADMIN_EMAIL_ALLOWLIST.
//
// Run: node packages/database/scripts/seed-admin-users.mjs
//
// New staff who haven't signed in yet will be auto-promoted by the Clerk
// webhook (apps/yachting/app/api/webhooks/clerk/route.ts) on their first
// sign-in. This script only covers the case where an admin was already
// synced as 'customer' and needs retroactive promotion.

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env.local') });

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
const allowlistRaw = process.env.ADMIN_EMAIL_ALLOWLIST || '';
const allowlist = allowlistRaw
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

if (!connectionString) {
  console.error('No DATABASE_URL set.');
  process.exit(1);
}
if (allowlist.length === 0) {
  console.warn('ADMIN_EMAIL_ALLOWLIST is empty — nothing to seed.');
  process.exit(0);
}

const cleaned = connectionString.trim().replace(/^['"]|['"]$/g, '');
const sql = neon(cleaned);

async function main() {
  console.log(`Promoting ${allowlist.length} allowlisted email(s) to staff role...`);
  for (const email of allowlist) {
    const result = await sql`
      UPDATE users
      SET role = 'staff'
      WHERE lower(email) = ${email}
        AND role <> 'admin'
      RETURNING email, role
    `;
    if (result.length === 0) {
      console.log(` - ${email}: not yet in users table (will be promoted on next sign-in)`);
    } else {
      console.log(` - ${email}: role=${result[0].role}`);
    }
  }

  const staff = await sql`SELECT email, role FROM users WHERE role IN ('admin','staff') ORDER BY email`;
  console.log('\nCurrent admin/staff users:');
  for (const s of staff) console.log(` - ${s.email} (${s.role})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
