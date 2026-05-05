import { NextResponse } from 'next/server';
import { db, users, or, eq, asc } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';

/**
 * GET /api/admin/staff — list all users with role staff or admin.
 *
 * Used by the lead detail page to populate the owner dropdown.
 */
export async function GET() {
  try {
    await requireStaff();
  } catch (err) {
    if (err instanceof StaffAuthError) {
      return NextResponse.json(
        { error: err.reason },
        { status: err.reason === 'unauthenticated' ? 401 : 403 }
      );
    }
    throw err;
  }

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
    })
    .from(users)
    .where(or(eq(users.role, 'staff'), eq(users.role, 'admin')))
    .orderBy(asc(users.email));

  return NextResponse.json({ staff: rows });
}
