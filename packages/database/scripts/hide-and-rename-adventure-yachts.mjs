// One-off: hide Adventure Two (Flybridge) & Adventure Four from public listings,
// and rename the adventure-three listing to "Adventure Two".
//
// Non-destructive: only flips is_visible and updates name/sort_order. No rows are deleted.
// Mirrors the source-of-truth changes in ../seed/index.ts so the live DB matches the code.
//
// Run from packages/database with DATABASE_URL set (same env the seed uses):
//   DATABASE_URL=... node scripts/hide-and-rename-adventure-yachts.mjs
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

console.log('--- Adventure yachts BEFORE ---');
console.log(JSON.stringify(await sql`
  SELECT slug, name, is_visible, sort_order
  FROM vessels WHERE is_adventure_yacht = true ORDER BY sort_order
`, null, 2));

// Hide the Flybridge "Adventure Two" and "Adventure Four" from public listings.
await sql`
  UPDATE vessels SET is_visible = false, updated_at = now()
  WHERE slug IN ('adventure-two', 'adventure-four')
`;

// Rename the adventure-three listing to "Adventure Two" (slug/URL unchanged).
await sql`
  UPDATE vessels SET name = 'Adventure Two', sort_order = 2, updated_at = now()
  WHERE slug = 'adventure-three'
`;

console.log('--- Adventure yachts AFTER ---');
console.log(JSON.stringify(await sql`
  SELECT slug, name, is_visible, sort_order
  FROM vessels WHERE is_adventure_yacht = true ORDER BY sort_order
`, null, 2));

console.log('\nDone. Visible listings should now be: Adventure One, Adventure Two (slug adventure-three).');
