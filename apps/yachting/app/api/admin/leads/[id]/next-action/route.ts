import { NextRequest, NextResponse } from 'next/server';
import { db, inquiries, eq } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';
import { logAudit } from '@/lib/audit';

/**
 * PATCH /api/admin/leads/[id]/next-action
 *
 * Body: { nextActionAt: string | null, nextActionNote?: string | null }
 *
 * Sets the next-follow-up reminder for a lead. Pass null to clear.
 * Surfaces in the "Due for follow-up" filter on the lead list.
 */
export async function PATCH(
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
  const body = await request.json().catch(() => null);

  const rawAt = body?.nextActionAt;
  const rawNote = body?.nextActionNote;

  let nextActionAt: Date | null;
  if (rawAt === null || rawAt === '' || rawAt === undefined) {
    nextActionAt = null;
  } else if (typeof rawAt === 'string') {
    const parsed = new Date(rawAt);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: 'nextActionAt must be ISO 8601 or null' },
        { status: 400 }
      );
    }
    nextActionAt = parsed;
  } else {
    return NextResponse.json(
      { error: 'nextActionAt must be a string or null' },
      { status: 400 }
    );
  }

  let nextActionNote: string | null;
  if (rawNote === null || rawNote === undefined) {
    nextActionNote = null;
  } else if (typeof rawNote === 'string') {
    const trimmed = rawNote.trim();
    if (trimmed.length > 500) {
      return NextResponse.json(
        { error: 'nextActionNote must be ≤500 chars' },
        { status: 400 }
      );
    }
    nextActionNote = trimmed.length ? trimmed : null;
  } else {
    return NextResponse.json(
      { error: 'nextActionNote must be a string or null' },
      { status: 400 }
    );
  }

  // Clearing the action timestamp also clears the note.
  if (!nextActionAt) nextActionNote = null;

  const inquiry = await db.query.inquiries.findFirst({
    where: eq(inquiries.id, id),
    columns: { id: true },
  });
  if (!inquiry) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const now = new Date();
  await db
    .update(inquiries)
    .set({
      nextActionAt,
      nextActionNote,
      updatedAt: now,
    })
    .where(eq(inquiries.id, id));

  await logAudit({
    actorUserId: staff.id,
    actorEmail: staff.email,
    action: 'next_action_set',
    entityType: 'inquiry',
    entityId: id,
    metadata: {
      nextActionAt: nextActionAt ? nextActionAt.toISOString() : null,
      hasNote: !!nextActionNote,
    },
  });

  return NextResponse.json({
    nextActionAt: nextActionAt ? nextActionAt.toISOString() : null,
    nextActionNote,
  });
}
