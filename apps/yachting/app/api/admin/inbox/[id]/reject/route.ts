import { NextRequest, NextResponse } from 'next/server';
import { db, inboundDrafts, eq } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';
import { logAudit } from '@/lib/audit';

interface RejectBody {
  reason?: string | null;
}

/**
 * POST /api/admin/inbox/[id]/reject — mark a draft as rejected.
 *
 * Used for spam that slipped past the SpamAssassin gate, newsletters,
 * forwarded threads with no real lead, etc. Terminal status; no inquiry
 * is created.
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

  let body: RejectBody;
  try {
    body = (await request.json().catch(() => ({}))) as RejectBody;
  } catch {
    body = {};
  }

  const draft = await db.query.inboundDrafts.findFirst({
    where: eq(inboundDrafts.id, id),
    columns: { id: true, status: true },
  });
  if (!draft) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  if (draft.status === 'approved' || draft.status === 'rejected') {
    return NextResponse.json(
      { error: 'already_finalised', status: draft.status },
      { status: 409 }
    );
  }

  const reason = body.reason?.trim() || 'staff_rejected';

  await db
    .update(inboundDrafts)
    .set({
      status: 'rejected',
      statusReason: reason,
      reviewedByUserId: staff.id,
      reviewedAt: new Date(),
    })
    .where(eq(inboundDrafts.id, id));

  await logAudit({
    actorUserId: staff.id,
    actorEmail: staff.email,
    action: 'inbound_draft_rejected',
    entityType: 'inbound_draft',
    entityId: id,
    metadata: { reason },
  });

  return NextResponse.json({ ok: true });
}
