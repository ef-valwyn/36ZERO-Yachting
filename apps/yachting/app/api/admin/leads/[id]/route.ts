import { NextRequest, NextResponse } from 'next/server';
import { db, inquiries, leadNotes, auditLog, users, eq, and, desc, sql } from '@36zero/database';
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
    where: eq(inquiries.id, id),
  });
  if (!inquiry) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // Pull rating author + owner + lifecycle-stage author (denormalised flat
  // emails so the UI doesn't have to join four ways).
  const lookupIds = Array.from(
    new Set(
      [
        inquiry.ratingUpdatedByUserId,
        inquiry.ownerUserId,
        inquiry.lifecycleStageUpdatedByUserId,
      ].filter((v): v is string => !!v)
    )
  );
  const lookupRows = lookupIds.length
    ? await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(
          lookupIds.length === 1
            ? eq(users.id, lookupIds[0])
            : sql`${users.id} = ANY(${lookupIds})`
        )
    : [];
  const idToEmail = new Map(lookupRows.map((r) => [r.id, r.email]));
  const ratingAuthorEmail = inquiry.ratingUpdatedByUserId
    ? idToEmail.get(inquiry.ratingUpdatedByUserId) ?? null
    : null;
  const ownerEmail = inquiry.ownerUserId
    ? idToEmail.get(inquiry.ownerUserId) ?? null
    : null;
  const lifecycleStageAuthorEmail = inquiry.lifecycleStageUpdatedByUserId
    ? idToEmail.get(inquiry.lifecycleStageUpdatedByUserId) ?? null
    : null;

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
    inquiry: {
      ...inquiry,
      ratingAuthorEmail,
      ownerEmail,
      lifecycleStageAuthorEmail,
    },
    notes,
    auditLog: audit,
  });
}
