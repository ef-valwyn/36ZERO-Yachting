export { db, schema } from './client';
export type { Database } from './client';
export * from './schema';

// Re-export commonly used drizzle-orm operators
export { eq, ne, gt, gte, lt, lte, and, or, like, ilike, inArray, notInArray, isNull, isNotNull, asc, desc, sql } from 'drizzle-orm';
