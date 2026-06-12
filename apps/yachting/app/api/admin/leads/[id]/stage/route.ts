import { NextRequest, NextResponse } from 'next/server';
import { db, inquiries, eq } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';
import { logAudit } from '@/lib/audit';
import { syncLifecycleStageToHubSpot } from '@/lib/hubspot/admin-sync';

const ALLOWED_STAGES = ['new', 'contacted', 'qualified', 'nurture', 'lost'] as const;
type LifecycleStage = (typeof ALLOWED_STAGES)[number];

/**
 * PATCH /api/admin/leads/[id]/stage
 *
 * Body: { stage: 'new' | 'contacted' | 'qualified' | 'nurture' | 'lost' }
 *
 * Updates the lead's lifecycle stage with audit + HubSpot sync. Last-write-
 * wins. We deliberately do NOT include a 'converted_to_deal' value here —
 * deal conversion sets a separate `hasDeal` flag (Phase 3) and the live
 * deal stage is fetched from HubSpot, never mirrored locally.
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
  const stage = body?.stage as LifecycleStage | undefined;
  if (!stage || !ALLOWED_STAGES.includes(stage)) {
    return NextResponse.json(
      { error: `stage must be one of ${ALLOWED_STAGES.join(', ')}` },
      { status: 400 }
    );
  }

  const inquiry = await db.query.inquiries.findFirst({
    where: eq(inquiries.id, id),
    columns: {
      id: true,
      email: true,
      hubspotContactId: true,
      lifecycleStage: true,
    },
  });
  if (!inquiry) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const now = new Date();
  const [updated] = await db
    .update(inquiries)
    .set({
      lifecycleStage: stage,
      lifecycleStageUpdatedAt: now,
      lifecycleStageUpdatedByUserId: staff.id,
      updatedAt: now,
    })
    .where(eq(inquiries.id, id))
    .returning({
      lifecycleStage: inquiries.lifecycleStage,
      lifecycleStageUpdatedAt: inquiries.lifecycleStageUpdatedAt,
    });

  // Non-fatal HubSpot sync.
  try {
    await syncLifecycleStageToHubSpot(
      {
        id: inquiry.id,
        email: inquiry.email,
        hubspotContactId: inquiry.hubspotContactId,
      },
      stage
    );
  } catch (err) {
    console.error('[stage] HubSpot sync threw (non-fatal):', err);
  }

  await logAudit({
    actorUserId: staff.id,
    actorEmail: staff.email,
    action: 'lifecycle_stage_set',
    entityType: 'inquiry',
    entityId: id,
    metadata: { from: inquiry.lifecycleStage, to: stage },
  });

  return NextResponse.json({
    lifecycleStage: updated.lifecycleStage,
    lifecycleStageUpdatedAt: updated.lifecycleStageUpdatedAt,
    lifecycleStageAuthorEmail: staff.email,
  });
}
