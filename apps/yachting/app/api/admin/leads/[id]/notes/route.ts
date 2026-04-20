import { NextRequest, NextResponse } from 'next/server';
import { db, inquiries, leadNotes, eq, and } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';
import { logAudit } from '@/lib/audit';
import { createHubSpotNote } from '@/lib/hubspot/admin-sync';

/**
 * POST /api/admin/leads/[id]/notes
 *
 * Body: { body: string }
 *
 * Creates a lead_notes row (append-only, no conflicts possible), writes an
 * audit log entry, and syncs to HubSpot as a native Note engagement. The
 * HubSpot call is inline so we can flip hubspot_synced=true on success; if
 * it fails the note is still saved and the retry worker picks it up later.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let staff;
  try {
    staff = await requireStaff();
  } catch (err) {
    if (err instanceof StaffAuthError) {
      return NextResponse.json(
        { error: err.reason },
        { status: err.reason === 'unauthenticated' ? 401 : 403 }
      );
    }
    throw err;
  }

  const { id: inquiryId } = await params;
  const body = await request.json().catch(() => null);
  const noteBody = typeof body?.body === 'string' ? body.body.trim() : '';
  if (!noteBody || noteBody.length > 10_000) {
    return NextResponse.json({ error: 'Invalid note body' }, { status: 400 });
  }

  const inquiry = await db.query.inquiries.findFirst({
    where: and(
      eq(inquiries.id, inquiryId),
      eq(inquiries.source, 'imhs_onboard_registration')
    ),
    columns: { id: true, email: true, hubspotContactId: true },
  });
  if (!inquiry) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const [created] = await db
    .insert(leadNotes)
    .values({
      inquiryId,
      authorUserId: staff.id,
      body: noteBody,
    })
    .returning();

  // Fire-and-await HubSpot sync. The note is already saved; failure flips
  // hubspot_synced to false (the default) and the retry worker handles it.
  try {
    const hubspotNoteId = await createHubSpotNote(
      {
        id: inquiry.id,
        email: inquiry.email,
        hubspotContactId: inquiry.hubspotContactId,
      },
      { id: created.id, body: noteBody, createdAt: created.createdAt },
      staff.email
    );
    if (hubspotNoteId) {
      await db
        .update(leadNotes)
        .set({
          hubspotNoteId,
          hubspotSynced: true,
          hubspotSyncedAt: new Date(),
        })
        .where(eq(leadNotes.id, created.id));
    }
  } catch (err) {
    console.error('[notes] HubSpot sync threw (non-fatal):', err);
  }

  await logAudit({
    actorUserId: staff.id,
    actorEmail: staff.email,
    action: 'note_created',
    entityType: 'lead_note',
    entityId: created.id,
    metadata: { inquiryId, length: noteBody.length },
  });

  return NextResponse.json({
    note: {
      id: created.id,
      body: noteBody,
      createdAt: created.createdAt,
      authorEmail: staff.email,
      authorFirstName: staff.firstName,
      authorLastName: staff.lastName,
      hubspotSynced: false, // may have been flipped above but client will refetch
    },
  });
}
