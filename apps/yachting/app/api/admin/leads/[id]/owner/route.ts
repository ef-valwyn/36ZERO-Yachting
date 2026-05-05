import { NextRequest, NextResponse } from 'next/server';
import { db, inquiries, users, eq } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';
import { logAudit } from '@/lib/audit';
import { syncOwnerToHubSpot } from '@/lib/hubspot/admin-sync';

/**
 * PATCH /api/admin/leads/[id]/owner
 *
 * Body: { ownerUserId: string | null }
 *
 * Sets the sales rep who owns follow-up on this lead. Pass null to unassign.
 * The ownerUserId must be an existing staff/admin user.
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
  const rawOwner = body?.ownerUserId;
  const ownerUserId: string | null =
    rawOwner === null || rawOwner === '' || rawOwner === undefined
      ? null
      : typeof rawOwner === 'string'
      ? rawOwner
      : null;

  if (rawOwner && typeof rawOwner !== 'string') {
    return NextResponse.json(
      { error: 'ownerUserId must be a string or null' },
      { status: 400 }
    );
  }

  // Validate that ownerUserId, if provided, points at a real staff/admin user.
  let ownerEmail: string | null = null;
  if (ownerUserId) {
    const ownerRow = await db.query.users.findFirst({
      where: eq(users.id, ownerUserId),
      columns: { id: true, email: true, role: true },
    });
    if (!ownerRow) {
      return NextResponse.json({ error: 'owner_not_found' }, { status: 400 });
    }
    if (ownerRow.role !== 'staff' && ownerRow.role !== 'admin') {
      return NextResponse.json(
        { error: 'owner_must_be_staff_or_admin' },
        { status: 400 }
      );
    }
    ownerEmail = ownerRow.email;
  }

  const inquiry = await db.query.inquiries.findFirst({
    where: eq(inquiries.id, id),
    columns: {
      id: true,
      email: true,
      hubspotContactId: true,
      ownerUserId: true,
    },
  });
  if (!inquiry) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const now = new Date();
  await db
    .update(inquiries)
    .set({
      ownerUserId,
      updatedAt: now,
    })
    .where(eq(inquiries.id, id));

  try {
    await syncOwnerToHubSpot(
      {
        id: inquiry.id,
        email: inquiry.email,
        hubspotContactId: inquiry.hubspotContactId,
      },
      ownerEmail
    );
  } catch (err) {
    console.error('[owner] HubSpot sync threw (non-fatal):', err);
  }

  await logAudit({
    actorUserId: staff.id,
    actorEmail: staff.email,
    action: 'owner_set',
    entityType: 'inquiry',
    entityId: id,
    metadata: { from: inquiry.ownerUserId, to: ownerUserId },
  });

  return NextResponse.json({
    ownerUserId,
    ownerEmail,
  });
}
