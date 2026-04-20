import { auth } from '@clerk/nextjs/server';
import { db, users, eq } from '@36zero/database';

export type StaffUser = {
  id: string;
  clerkUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'admin' | 'staff' | 'customer';
};

export class StaffAuthError extends Error {
  constructor(public readonly reason: 'unauthenticated' | 'forbidden') {
    super(reason);
    this.name = 'StaffAuthError';
  }
}

/**
 * Server-side gate for /admin/* routes and API handlers.
 *
 * Returns the signed-in DB user row if their role is 'staff' or 'admin'.
 * Throws `StaffAuthError('unauthenticated')` if no Clerk session, or
 * `StaffAuthError('forbidden')` if the role is not admin/staff.
 *
 * Page callers should catch and redirect; API callers should map to 401/403 JSON.
 */
export async function requireStaff(): Promise<StaffUser> {
  const { userId } = await auth();
  if (!userId) throw new StaffAuthError('unauthenticated');

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
    columns: {
      id: true,
      clerkUserId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    throw new StaffAuthError('forbidden');
  }

  return user as StaffUser;
}

/**
 * Stricter gate for admin-only endpoints (audit log, user management, etc.).
 */
export async function requireAdmin(): Promise<StaffUser> {
  const user = await requireStaff();
  if (user.role !== 'admin') throw new StaffAuthError('forbidden');
  return user;
}
