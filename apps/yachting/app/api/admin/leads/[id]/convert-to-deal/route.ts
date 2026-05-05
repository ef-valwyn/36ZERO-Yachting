import { NextRequest, NextResponse } from 'next/server';
import { db, inquiries, eq } from '@36zero/database';
import { requireAdmin, StaffAuthError } from '@/lib/auth/require-staff';
import { logAudit } from '@/lib/audit';
import { createDealFromInquiry } from '@/lib/hubspot/deals';

interface ConvertBody {
  stage: string;
  pipeline?: string;
  amount?: number | null;
  dealName?: string | null;
  closeDate?: string | null;
}

/**
 * POST /api/admin/leads/[id]/convert-to-deal
 *
 * Promotes a triaged inquiry to a HubSpot Deal. **Admin-only** — codex
 * flagged that an endpoint accepting a free-form `amount` field that creates
 * a record in the pipeline of record needs a tighter gate than `requireStaff()`.
 *
 * Body:
 *   { stage: string, pipeline?: string, amount?: number, dealName?: string, closeDate?: 'YYYY-MM-DD' }
 *
 * Sets `inquiries.has_deal=true` and stores the returned `hubspot_deal_id`.
 * The deal's *current stage* is fetched live by the panel — never mirrored
 * locally, so closing the deal in HubSpot reflects immediately.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let admin;
  try {
    admin = await requireAdmin();
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
  let body: ConvertBody;
  try {
    body = (await request.json()) as ConvertBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.stage || typeof body.stage !== 'string') {
    return NextResponse.json({ error: 'stage required' }, { status: 400 });
  }
  let amount: number | null = null;
  if (body.amount != null && body.amount !== undefined) {
    if (typeof body.amount !== 'number' || !Number.isFinite(body.amount) || body.amount < 0) {
      return NextResponse.json(
        { error: 'amount must be a non-negative number' },
        { status: 400 }
      );
    }
    amount = body.amount;
  }
  if (body.closeDate && !/^\d{4}-\d{2}-\d{2}$/.test(body.closeDate)) {
    return NextResponse.json(
      { error: 'closeDate must be YYYY-MM-DD' },
      { status: 400 }
    );
  }

  const inquiry = await db.query.inquiries.findFirst({
    where: eq(inquiries.id, id),
    columns: {
      id: true,
      name: true,
      email: true,
      vesselName: true,
      hubspotContactId: true,
      hasDeal: true,
      hubspotDealId: true,
    },
  });
  if (!inquiry) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!inquiry.hubspotContactId) {
    return NextResponse.json(
      {
        error: 'no_hubspot_contact',
        message:
          'This inquiry is not linked to a HubSpot contact yet. Trigger a sync (e.g. add a note) before converting.',
      },
      { status: 409 }
    );
  }
  if (inquiry.hasDeal && inquiry.hubspotDealId) {
    return NextResponse.json(
      {
        error: 'deal_exists',
        dealId: inquiry.hubspotDealId,
      },
      { status: 409 }
    );
  }

  const dealName =
    body.dealName?.trim() ||
    [inquiry.name, inquiry.vesselName].filter(Boolean).join(' — ') ||
    inquiry.email;

  const result = await createDealFromInquiry({
    contactId: inquiry.hubspotContactId,
    dealName,
    stage: body.stage,
    pipeline: body.pipeline,
    amount,
    closeDate: body.closeDate ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  await db
    .update(inquiries)
    .set({
      hasDeal: true,
      hubspotDealId: result.dealId,
      updatedAt: new Date(),
    })
    .where(eq(inquiries.id, id));

  await logAudit({
    actorUserId: admin.id,
    actorEmail: admin.email,
    action: 'deal_converted',
    entityType: 'inquiry',
    entityId: id,
    metadata: {
      dealId: result.dealId,
      stage: body.stage,
      pipeline: body.pipeline ?? 'default',
      amount,
      dealName,
    },
  });

  return NextResponse.json({ ok: true, dealId: result.dealId });
}
