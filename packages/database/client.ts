import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Lazy-initialized database instance to avoid build-time errors
let _db: NeonHttpDatabase<typeof schema> | null = null;

export const getDb = () => {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const sql = neon(process.env.DATABASE_URL) as NeonQueryFunction<boolean, boolean>;
    _db = drizzle(sql, { schema });
  }
  return _db;
};

// For backwards compatibility - will throw at build time if DATABASE_URL is missing
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});

// Export the schema for use in queries
export { schema };

// Type exports
export type Database = NeonHttpDatabase<typeof schema>;
