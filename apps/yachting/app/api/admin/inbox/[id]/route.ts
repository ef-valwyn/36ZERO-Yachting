import { NextRequest, NextResponse } from 'next/server';
import { db, inboundDrafts, eq } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';

/**
 * GET /api/admin/inbox/[id] — full draft including raw bodies for the drawer.
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
  const draft = await db.query.inboundDrafts.findFirst({
    where: eq(inboundDrafts.id, id),
  });
  if (!draft) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return NextResponse.json({ draft });
}
