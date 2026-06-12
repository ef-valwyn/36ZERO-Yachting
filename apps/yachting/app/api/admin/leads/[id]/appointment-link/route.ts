import { NextRequest, NextResponse } from 'next/server';
import { db, inquiries, eq } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';

/**
 * GET /api/admin/leads/[id]/appointment-link
 *
 * Returns the prefill data the frontend passes to the Cal.com embed. Cal.com
 * itself enforces the daily cap and availability windows — we just hand it
 * the registrant's name/email and the inquiryId metadata so the webhook can
 * round-trip the booking back to our DB.
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
    columns: { id: true, name: true, email: true },
  });
  if (!inquiry) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const calLink = process.env.NEXT_PUBLIC_CALCOM_EVENT_LINK || '';

  return NextResponse.json({
    calLink,
    prefill: {
      name: inquiry.name,
      email: inquiry.email,
      inquiryId: inquiry.id,
    },
  });
}
