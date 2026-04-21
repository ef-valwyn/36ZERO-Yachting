import { auth, currentUser } from '@clerk/nextjs/server';
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
 * Just-in-time sync from Clerk → our users table.
 *
 * The Clerk user.created webhook is our normal sync path, but it doesn't help
 * for Clerk accounts that existed before the webhook was wired up (or before
 * the users table existed at all — e.g. people who Google-SSO'd in March).
 * This function creates the missing row using Clerk's current profile data
 * and applies the ADMIN_EMAIL_ALLOWLIST promotion rule in the same pass.
 */
async function ensureUserRow(
  clerkUserId: string
): Promise<StaffUser | null> {
  const cu = await currentUser();
  if (!cu) return null;

  const primary = cu.emailAddresses?.find(
    (e) => e.id === cu.primaryEmailAddressId
  );
  const email =
    primary?.emailAddress || cu.emailAddresses?.[0]?.emailAddress || '';
  if (!email) return null;

  const firstName = cu.firstName ?? null;
  const lastName = cu.lastName ?? null;

  const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const role: 'staff' | 'customer' = allowlist.includes(email.toLowerCase())
    ? 'staff'
    : 'customer';

  // Use an upsert keyed on clerk_user_id to race-safely handle the case where
  // the Clerk webhook fires at the same time as a page request.
  const [inserted] = await db
    .insert(users)
    .values({
      clerkUserId,
      email,
      firstName,
      lastName,
      role,
    })
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: {
        email,
        firstName,
        lastName,
        // Never demote — if a human manually set admin/staff, keep it.
        // The webhook already has this logic; mirroring it here keeps
        // behaviour consistent across entry points.
      },
    })
    .returning({
      id: users.id,
      clerkUserId: users.clerkUserId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
    });

  return inserted as StaffUser;
}

/**
 * Server-side gate for /admin/* routes and API handlers.
 *
 * Returns the signed-in DB user row if their role is 'staff' or 'admin'.
 * Throws `StaffAuthError('unauthenticated')` if no Clerk session, or
 * `StaffAuthError('forbidden')` if the role is not admin/staff.
 *
 * If the Clerk user is authenticated but has no row in our users table
 * yet (webhook didn't fire or predates the schema), we just-in-time create
 * the row and apply allowlist-aware role assignment.
 *
 * Page callers should catch and redirect; API callers should map to 401/403 JSON.
 */
export async function requireStaff(): Promise<StaffUser> {
  const { userId } = await auth();
  if (!userId) throw new StaffAuthError('unauthenticated');

  let user = await db.query.users.findFirst({
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

  // First-touch sync: Clerk user exists, DB row doesn't. Create it.
  if (!user) {
    const synced = await ensureUserRow(userId);
    if (synced) user = synced;
  }

  // Late-promotion: allowlist changed since this user signed up. Promote
  // silently. Never runs for admin/staff (skip cost of the allowlist parse
  // and extra UPDATE on every authenticated page load).
  if (user && user.role === 'customer') {
    const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (allowlist.includes(user.email.toLowerCase())) {
      await db
        .update(users)
        .set({ role: 'staff' })
        .where(eq(users.id, user.id));
      user = { ...user, role: 'staff' };
    }
  }

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
