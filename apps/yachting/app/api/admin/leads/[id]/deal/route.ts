import { NextRequest, NextResponse } from 'next/server';
import { db, inquiries, eq } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';
import { logAudit } from '@/lib/audit';
import { getDealSummary, listPipelines, buildHubSpotDealUrl } from '@/lib/hubspot/deals';

/**
 * GET /api/admin/leads/[id]/deal — live HubSpot deal summary for the panel.
 *
 * Returns:
 *   200 { hasDeal: false }            — never converted
 *   200 { hasDeal: true, ... }        — current state from HubSpot
 *   404 { hasDeal: true, deleted: true } — deal id stored, but HubSpot 404'd
 *   503 { ... }                       — HubSpot reachability problem (cached
 *                                       last-known summary not yet supported;
 *                                       client should retry)
 *
 * The DB never mirrors deal stage. This endpoint is the only source of truth
 * for what the lead-detail panel renders.
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
    columns: {
      id: true,
      hasDeal: true,
      hubspotDealId: true,
      hubspotContactId: true,
    },
  });
  if (!inquiry) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  if (!inquiry.hasDeal || !inquiry.hubspotDealId) {
    const pipelines = await listPipelines();
    return NextResponse.json({
      hasDeal: false,
      hasHubspotContact: !!inquiry.hubspotContactId,
      pipelines,
    });
  }

  const summary = await getDealSummary(inquiry.hubspotDealId);
  if (!summary.ok && summary.status === 404) {
    return NextResponse.json(
      {
        hasDeal: true,
        deleted: true,
        dealId: inquiry.hubspotDealId,
      },
      { status: 200 }
    );
  }
  if (!summary.ok) {
    return NextResponse.json(
      { hasDeal: true, error: summary.error, dealId: inquiry.hubspotDealId },
      { status: 503 }
    );
  }

  return NextResponse.json({
    hasDeal: true,
    deal: summary.deal,
    dealUrl: buildHubSpotDealUrl(inquiry.hubspotDealId),
  });
}

/**
 * DELETE /api/admin/leads/[id]/deal — clear the deal association.
 *
 * Only does anything to *our* row — does NOT delete the deal in HubSpot.
 * Use case: HubSpot deal was deleted out from under us, the panel surfaced
 * a "removed" state, and the staff member wants to clean up the link so the
 * lead can be re-converted later.
 */
export async function DELETE(
  _request: NextRequest,
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
  const inquiry = await db.query.inquiries.findFirst({
    where: eq(inquiries.id, id),
    columns: { id: true, hubspotDealId: true },
  });
  if (!inquiry) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await db
    .update(inquiries)
    .set({ hasDeal: false, hubspotDealId: null, updatedAt: new Date() })
    .where(eq(inquiries.id, id));

  await logAudit({
    actorUserId: staff.id,
    actorEmail: staff.email,
    action: 'deal_cleared',
    entityType: 'inquiry',
    entityId: id,
    metadata: { previousDealId: inquiry.hubspotDealId },
  });

  return NextResponse.json({ ok: true });
}
