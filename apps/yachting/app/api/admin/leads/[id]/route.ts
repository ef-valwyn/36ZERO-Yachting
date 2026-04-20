import { NextRequest, NextResponse } from 'next/server';
import { db, inquiries, leadNotes, auditLog, users, eq, and, desc } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';

/**
 * GET /api/admin/leads/[id] — full detail for a single registrant.
 * Returns inquiry row + all lead_notes (newest first, with author email) +
 * last 20 audit_log entries for this inquiry.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  const inquiry = await db.query.inquiries.findFirst({
    where: and(
      eq(inquiries.id, id),
      eq(inquiries.source, 'imhs_onboard_registration')
    ),
  });
  if (!inquiry) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // Pull rating author if present (denormalised into a flat email for the UI).
  let ratingAuthorEmail: string | null = null;
  if (inquiry.ratingUpdatedByUserId) {
    const author = await db.query.users.findFirst({
      where: eq(users.id, inquiry.ratingUpdatedByUserId),
      columns: { email: true },
    });
    ratingAuthorEmail = author?.email ?? null;
  }

  const notes = await db
    .select({
      id: leadNotes.id,
      body: leadNotes.body,
      createdAt: leadNotes.createdAt,
      authorEmail: users.email,
      authorFirstName: users.firstName,
      authorLastName: users.lastName,
      hubspotNoteId: leadNotes.hubspotNoteId,
      hubspotSynced: leadNotes.hubspotSynced,
    })
    .from(leadNotes)
    .leftJoin(users, eq(leadNotes.authorUserId, users.id))
    .where(eq(leadNotes.inquiryId, id))
    .orderBy(desc(leadNotes.createdAt));

  const audit = await db
    .select()
    .from(auditLog)
    .where(and(eq(auditLog.entityType, 'inquiry'), eq(auditLog.entityId, id)))
    .orderBy(desc(auditLog.createdAt))
    .limit(20);

  return NextResponse.json({
    inquiry: { ...inquiry, ratingAuthorEmail },
    notes,
    auditLog: audit,
  });
}
