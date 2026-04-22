import { NextRequest, NextResponse } from 'next/server';
import {
  db,
  inquiries,
  leadNotes,
  and,
  eq,
  or,
  ilike,
  gte,
  lt,
  desc,
  sql,
} from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';

/**
 * GET /api/admin/leads — list IMHS 2026 onboard registrants with filters.
 *
 * Query params:
 *   q              — free-text search on name/email/country
 *   rated          — 'unrated' | '1-2' | '3' | '4-5' | 'any'
 *   appointment    — 'booked' | 'unbooked' | 'any'
 *   day            — YYYY-MM-DD (matches createdAt OR appointmentStartAt for that day UTC)
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
  const q = searchParams.get('q')?.trim() ?? '';
  const rated = searchParams.get('rated') ?? 'any';
  const appointment = searchParams.get('appointment') ?? 'any';
  const day = searchParams.get('day'); // YYYY-MM-DD or null

  const filters: Array<ReturnType<typeof eq> | ReturnType<typeof and>> = [
    eq(inquiries.source, 'imhs_onboard_registration'),
  ];

  if (q) {
    const pattern = `%${q}%`;
    const searchOr = or(
      ilike(inquiries.name, pattern),
      ilike(inquiries.email, pattern),
      ilike(inquiries.country, pattern)
    );
    if (searchOr) filters.push(searchOr);
  }

  switch (rated) {
    case 'unrated':
      filters.push(sql`${inquiries.rating} IS NULL`);
      break;
    case '1-2':
      filters.push(sql`${inquiries.rating} BETWEEN 1 AND 2`);
      break;
    case '3':
      filters.push(eq(inquiries.rating, 3));
      break;
    case '4-5':
      filters.push(sql`${inquiries.rating} BETWEEN 4 AND 5`);
      break;
  }

  switch (appointment) {
    case 'booked':
      filters.push(sql`${inquiries.appointmentStartAt} IS NOT NULL`);
      filters.push(sql`${inquiries.appointmentStatus} <> 'cancelled'`);
      break;
    case 'unbooked':
      filters.push(
        sql`(${inquiries.appointmentStartAt} IS NULL OR ${inquiries.appointmentStatus} = 'cancelled')`
      );
      break;
  }

  if (day) {
    // Match registrations created that calendar day (UTC).
    // Show-local (Europe/Paris) vs UTC drift is ≤2h; acceptable for filtering.
    const start = new Date(`${day}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    filters.push(gte(inquiries.createdAt, start));
    filters.push(lt(inquiries.createdAt, end));
  }

  const rows = await db
    .select({
      id: inquiries.id,
      name: inquiries.name,
      email: inquiries.email,
      country: inquiries.country,
      interestAdventureYachts: inquiries.interestAdventureYachts,
      interestShift: inquiries.interestShift,
      rating: inquiries.rating,
      ratingUpdatedAt: inquiries.ratingUpdatedAt,
      appointmentStartAt: inquiries.appointmentStartAt,
      appointmentStatus: inquiries.appointmentStatus,
      appointmentAssignedStaffEmail: inquiries.appointmentAssignedStaffEmail,
      hubspotContactId: inquiries.hubspotContactId,
      manualEntry: inquiries.manualEntry,
      createdAt: inquiries.createdAt,
      notesCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${leadNotes}
        WHERE ${leadNotes.inquiryId} = ${inquiries.id}
      )`.as('notes_count'),
    })
    .from(inquiries)
    .where(and(...filters))
    .orderBy(desc(inquiries.createdAt))
    .limit(500);

  return NextResponse.json({ leads: rows });
}
