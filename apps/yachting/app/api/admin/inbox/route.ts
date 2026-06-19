import { NextRequest, NextResponse } from 'next/server';
import { db, inboundDrafts, eq, inArray, desc } from '@36zero/database';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';

/**
 * GET /api/admin/inbox?status=pending|parsed|parse_failed|duplicate|approved|rejected|all
 *
 * Lists inbound email drafts. Default surface ('pending') is the actionable
 * queue: anything still needing staff attention (parsed, parse_failed,
 * duplicate). Approved/rejected are terminal so they're hidden by default.
 */
export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? 'pending';

  const PENDING_STATUSES = ['parsing', 'parsed', 'parse_failed', 'duplicate'];

  const whereClause =
    status === 'all'
      ? undefined
      : status === 'pending'
      ? inArray(inboundDrafts.status, PENDING_STATUSES)
      : eq(inboundDrafts.status, status);

  const rows = await db
    .select({
      id: inboundDrafts.id,
      fromEmail: inboundDrafts.fromEmail,
      fromName: inboundDrafts.fromName,
      subject: inboundDrafts.subject,
      receivedAt: inboundDrafts.receivedAt,
      status: inboundDrafts.status,
      statusReason: inboundDrafts.statusReason,
      parsedJson: inboundDrafts.parsedJson,
      resultingInquiryId: inboundDrafts.resultingInquiryId,
      spamScore: inboundDrafts.spamScore,
      bodyDeletedAt: inboundDrafts.bodyDeletedAt,
      createdAt: inboundDrafts.createdAt,
    })
    .from(inboundDrafts)
    .where(whereClause)
    .orderBy(desc(inboundDrafts.createdAt))
    .limit(200);

  return NextResponse.json({ drafts: rows });
}
