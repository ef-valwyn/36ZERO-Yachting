import { NextRequest, NextResponse } from 'next/server';
import { db, inboundDrafts, eq } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';
import { logAudit } from '@/lib/audit';
import { createInquiry } from '@/lib/leads/create-inquiry';

interface ApproveBody {
  // Editable fields the staff member confirmed in the drawer.
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  company?: string | null;
  message?: string | null;
  // Lifecycle defaults to 'contacted' since the lead has reached out — but
  // staff can override.
  initialLifecycleStage?: 'new' | 'contacted';
}

/**
 * POST /api/admin/inbox/[id]/approve
 *
 * Promotes a parsed inbound draft to a real `inquiries` row via the shared
 * `createInquiry()` helper. The body carries the staff-edited values so we
 * never trust the raw LLM output without human confirmation.
 *
 * Sets the draft's `status='approved'` and links `resultingInquiryId`. If
 * the draft is already approved/rejected, returns 409.
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

  let body: ApproveBody;
  try {
    body = (await request.json()) as ApproveBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const draft = await db.query.inboundDrafts.findFirst({
    where: eq(inboundDrafts.id, id),
  });
  if (!draft) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  if (draft.status === 'approved' || draft.status === 'rejected') {
    return NextResponse.json(
      { error: 'already_finalised', status: draft.status },
      { status: 409 }
    );
  }

  const email = (body.email ?? draft.fromEmail ?? '').trim().toLowerCase();
  const firstName = (body.firstName ?? draft.parsedJson?.firstName ?? '').trim();
  const lastName = (body.lastName ?? draft.parsedJson?.lastName ?? '').trim();
  const fallbackName =
    [firstName, lastName].filter(Boolean).join(' ') ||
    draft.fromName?.trim() ||
    email;

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  const result = await createInquiry({
    source: 'inbound_email',
    name: fallbackName,
    email,
    phone: body.phone ?? draft.parsedJson?.phone ?? null,
    country: body.country ?? null,
    company: body.company ?? draft.parsedJson?.companyOrBroker ?? null,
    message:
      body.message ??
      draft.parsedJson?.summary ??
      draft.subject ??
      null,
    manualEntryByUserId: staff.id,
    ownerUserId: staff.id,
    initialLifecycleStage: body.initialLifecycleStage ?? 'contacted',
    skipNotification: true,
  });

  if (result.status === 'error') {
    return NextResponse.json(
      { error: result.message },
      { status: result.httpStatus }
    );
  }

  await db
    .update(inboundDrafts)
    .set({
      status: 'approved',
      reviewedByUserId: staff.id,
      reviewedAt: new Date(),
      resultingInquiryId: result.inquiryId,
    })
    .where(eq(inboundDrafts.id, id));

  await logAudit({
    actorUserId: staff.id,
    actorEmail: staff.email,
    action: 'inbound_draft_approved',
    entityType: 'inbound_draft',
    entityId: id,
    metadata: { inquiryId: result.inquiryId, status: result.status },
  });

  return NextResponse.json({
    ok: true,
    inquiryId: result.inquiryId,
    inquiryStatus: result.status,
  });
}
