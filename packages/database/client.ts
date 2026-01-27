import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Create the Neon client
const sql = neon(process.env.DATABASE_URL!) as NeonQueryFunction<boolean, boolean>;

// Create the Drizzle database instance
export const db = drizzle(sql, { schema });

// Export the schema for use in queries
export { schema };

// Type exports
export type Database = typeof db;
