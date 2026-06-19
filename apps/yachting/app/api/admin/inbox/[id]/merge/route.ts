import { NextRequest, NextResponse } from 'next/server';
import { db, inboundDrafts, inquiries, leadNotes, eq } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';
import { logAudit } from '@/lib/audit';
import { createHubSpotNote } from '@/lib/hubspot/admin-sync';

interface MergeBody {
  inquiryId: string;
  /**
   * If true, append the email summary as a note on the existing inquiry.
   * Defaults to true — usually you want some trace of what came in.
   */
  appendNote?: boolean;
}

/**
 * POST /api/admin/inbox/[id]/merge
 *
 * Links a draft to an existing inquiry (typically because cross-source dedup
 * by email caught it as a duplicate). Optionally appends the parsed summary
 * as a note on the inquiry.
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

  const { id } = await params;

  let body: MergeBody;
  try {
    body = (await request.json()) as MergeBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.inquiryId || typeof body.inquiryId !== 'string') {
    return NextResponse.json({ error: 'inquiryId required' }, { status: 400 });
  }
  const appendNote = body.appendNote !== false; // default true

  const [draft, target] = await Promise.all([
    db.query.inboundDrafts.findFirst({
      where: eq(inboundDrafts.id, id),
    }),
    db.query.inquiries.findFirst({
      where: eq(inquiries.id, body.inquiryId),
      columns: { id: true, email: true, hubspotContactId: true },
    }),
  ]);

  if (!draft) return NextResponse.json({ error: 'draft_not_found' }, { status: 404 });
  if (!target)
    return NextResponse.json({ error: 'inquiry_not_found' }, { status: 404 });

  if (draft.status === 'approved' || draft.status === 'rejected') {
    return NextResponse.json(
      { error: 'already_finalised', status: draft.status },
      { status: 409 }
    );
  }

  if (appendNote) {
    const summary = draft.parsedJson?.summary?.trim();
    const subject = draft.subject?.trim();
    const noteParts = [
      `Inbound email merged from ${draft.fromEmail}`,
      subject ? `Subject: ${subject}` : null,
      summary ? `Summary: ${summary}` : null,
    ].filter(Boolean);
    const noteBody = noteParts.join('\n');
    if (noteBody) {
      const [created] = await db
        .insert(leadNotes)
        .values({
          inquiryId: target.id,
          authorUserId: staff.id,
          body: noteBody,
        })
        .returning();
      // Best-effort HubSpot note sync — non-fatal.
      try {
        const hubspotNoteId = await createHubSpotNote(
          {
            id: target.id,
            email: target.email,
            hubspotContactId: target.hubspotContactId,
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
        console.error('[inbox-merge] HubSpot note sync threw (non-fatal):', err);
      }
    }
  }

  await db
    .update(inboundDrafts)
    .set({
      status: 'approved',
      statusReason: 'merged_into_existing',
      reviewedByUserId: staff.id,
      reviewedAt: new Date(),
      resultingInquiryId: target.id,
    })
    .where(eq(inboundDrafts.id, id));

  await logAudit({
    actorUserId: staff.id,
    actorEmail: staff.email,
    action: 'inbound_draft_merged',
    entityType: 'inbound_draft',
    entityId: id,
    metadata: { inquiryId: target.id, appendNote },
  });

  return NextResponse.json({ ok: true, inquiryId: target.id });
}
