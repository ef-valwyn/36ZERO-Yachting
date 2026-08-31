// One-off: withdraw "Adventure Two" from public listings entirely.
//
// Context: two rows have carried the "Adventure Two" name. The AY60 Flybridge
// (slug adventure-two) was hidden previously; the AY60 Sport (slug
// adventure-three) has been displayed as "Adventure Two" since that rename.
// This hides the adventure-three row too, so Adventure One is the only
// publicly listed Adventure Yacht.
//
// Non-destructive: only flips is_visible. No rows are deleted, so the listing
// can be restored by setting is_visible = true again.
// Mirrors the source-of-truth changes in ../seed/index.ts so the live DB matches the code.
//
// Run from packages/database with DATABASE_URL set (same env the seed uses):
//   DATABASE_URL=... node scripts/hide-adventure-two.mjs
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

console.log('--- Adventure yachts BEFORE ---');
console.log(JSON.stringify(await sql`
  SELECT slug, name, is_visible, sort_order
  FROM vessels WHERE is_adventure_yacht = true ORDER BY sort_order
`, null, 2));

await sql`
  UPDATE vessels SET is_visible = false, updated_at = now()
  WHERE slug IN ('adventure-two', 'adventure-three', 'adventure-four')
`;

console.log('--- Adventure yachts AFTER ---');
console.log(JSON.stringify(await sql`
  SELECT slug, name, is_visible, sort_order
  FROM vessels WHERE is_adventure_yacht = true ORDER BY sort_order
`, null, 2));

console.log('\nDone. Only Adventure One should remain visible.');
