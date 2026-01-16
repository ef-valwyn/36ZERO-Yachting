import { config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig } from 'drizzle-kit';

// Load .env.local from the root of the monorepo
config({ path: resolve(__dirname, '../../.env.local') });

export default defineConfig({
  schema: './schema/index.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: false,
});
