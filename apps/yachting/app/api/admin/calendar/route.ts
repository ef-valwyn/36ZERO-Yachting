import { NextRequest, NextResponse } from 'next/server';
import { db, inquiries, eq, and, gte, lt, isNotNull, ne, asc } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';

/**
 * GET /api/admin/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Returns all bookings in the requested date range. Used by
 * /admin/calendar to render the day-by-day grid.
 */
export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const fromStr = searchParams.get('from') ?? '2026-04-22';
  const toStr = searchParams.get('to') ?? '2026-04-27'; // exclusive end

  const from = new Date(`${fromStr}T00:00:00.000Z`);
  const to = new Date(`${toStr}T00:00:00.000Z`);

  const rows = await db
    .select({
      id: inquiries.id,
      name: inquiries.name,
      email: inquiries.email,
      rating: inquiries.rating,
      appointmentStartAt: inquiries.appointmentStartAt,
      appointmentEndAt: inquiries.appointmentEndAt,
      appointmentStatus: inquiries.appointmentStatus,
      appointmentAssignedStaffEmail: inquiries.appointmentAssignedStaffEmail,
    })
    .from(inquiries)
    .where(
      and(
        eq(inquiries.source, 'imhs_onboard_registration'),
        isNotNull(inquiries.appointmentStartAt),
        ne(inquiries.appointmentStatus, 'cancelled'),
        gte(inquiries.appointmentStartAt, from),
        lt(inquiries.appointmentStartAt, to)
      )
    )
    .orderBy(asc(inquiries.appointmentStartAt));

  return NextResponse.json({ bookings: rows });
}
