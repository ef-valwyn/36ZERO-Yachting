import { NextRequest, NextResponse } from 'next/server';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';
import { createOnboardLead } from '@/lib/leads/create-onboard-lead';
import { logAudit } from '@/lib/audit';

interface ManualLeadRow {
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  interestAdventureYachts?: boolean;
  interestShift?: boolean;
}

interface ManualLeadsBody {
  leads?: ManualLeadRow[];
}

type RowStatus = 'created' | 'updated' | 'conflict' | 'error';

interface RowResult {
  index: number;
  status: RowStatus;
  inquiryId?: string;
  message?: string;
}

/**
 * POST /api/admin/leads/manual
 *
 * Staff-only manual lead entry (paper-collected or phone leads). Accepts an
 * array of rows; each is validated and pushed through the same shared onboard
 * helper used by the public QR form, with manualEntry=true and the Resend
 * staff notification suppressed.
 */
export async function POST(request: NextRequest) {
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

  let body: ManualLeadsBody;
  try {
    body = (await request.json()) as ManualLeadsBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const rows = body.leads;
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: 'leads must be a non-empty array' },
      { status: 400 }
    );
  }
  if (rows.length > 50) {
    return NextResponse.json(
      { error: 'Up to 50 leads per request' },
      { status: 400 }
    );
  }

  const results: RowResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const result = await createOnboardLead({
      email: (row.email || '').trim(),
      firstName: (row.firstName || '').trim(),
      lastName: (row.lastName || '').trim(),
      country: (row.country || '').trim(),
      interestAdventureYachts: !!row.interestAdventureYachts,
      interestShift: !!row.interestShift,
      manualEntry: true,
      manualEntryByUserId: staff.id,
      skipNotification: true,
    });

    if (result.status === 'created' || result.status === 'updated') {
      results.push({
        index: i,
        status: result.status,
        inquiryId: result.inquiryId,
      });
      await logAudit({
        actorUserId: staff.id,
        actorEmail: staff.email,
        action: 'lead_manual_create',
        entityType: 'inquiry',
        entityId: result.inquiryId,
        metadata: { status: result.status, email: row.email },
      });
    } else if (result.status === 'conflict') {
      results.push({
        index: i,
        status: 'conflict',
        message: result.message,
      });
    } else if (result.status === 'error') {
      results.push({
        index: i,
        status: 'error',
        message: result.message,
      });
    }
  }

  return NextResponse.json({ results });
}
