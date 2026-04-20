import { NextRequest, NextResponse } from 'next/server';
import { db, inquiries, eq, and } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';
import { logAudit } from '@/lib/audit';
import { syncRatingToHubSpot } from '@/lib/hubspot/admin-sync';

/**
 * PATCH /api/admin/leads/[id]/rating
 *
 * Body: { rating: 1..5 | null }
 *
 * Last-write-wins on inquiries.rating. Response includes the author byline
 * so the UI can display "set by Ewan · 2h ago" even if someone else
 * clobbers the value a moment later.
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
  const rating = body?.rating;
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return NextResponse.json({ error: 'Rating must be null or integer 1..5' }, { status: 400 });
  }

  const inquiry = await db.query.inquiries.findFirst({
    where: and(
      eq(inquiries.id, id),
      eq(inquiries.source, 'imhs_onboard_registration')
    ),
    columns: { id: true, email: true, hubspotContactId: true },
  });
  if (!inquiry) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const now = new Date();
  const [updated] = await db
    .update(inquiries)
    .set({
      rating,
      ratingUpdatedByUserId: staff.id,
      ratingUpdatedAt: now,
    })
    .where(eq(inquiries.id, id))
    .returning({
      rating: inquiries.rating,
      ratingUpdatedAt: inquiries.ratingUpdatedAt,
    });

  // Non-fatal HubSpot sync.
  try {
    await syncRatingToHubSpot(
      {
        id: inquiry.id,
        email: inquiry.email,
        hubspotContactId: inquiry.hubspotContactId,
      },
      rating
    );
  } catch (err) {
    console.error('[rating] HubSpot sync threw (non-fatal):', err);
  }

  await logAudit({
    actorUserId: staff.id,
    actorEmail: staff.email,
    action: 'rating_set',
    entityType: 'inquiry',
    entityId: id,
    metadata: { rating },
  });

  return NextResponse.json({
    rating: updated.rating,
    ratingUpdatedAt: updated.ratingUpdatedAt,
    ratingAuthorEmail: staff.email,
  });
}
