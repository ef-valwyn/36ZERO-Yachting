import { NextRequest, NextResponse } from 'next/server';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';
import { createInquiry } from '@/lib/leads/create-inquiry';
import { isKnownLeadSource, type LeadSource } from '@/lib/leads/sources';
import { logAudit } from '@/lib/audit';

interface CreateLeadBody {
  source?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  country?: string | null;
  company?: string | null;
  message?: string | null;
  ownerUserId?: string | null;
  initialLifecycleStage?: 'new' | 'contacted';
}

/**
 * POST /api/admin/leads/create — create a single lead from the admin UI.
 *
 * Distinct from /api/admin/leads/manual which accepts an IMHS-shaped batch.
 * This endpoint is the generic CRM entry path — any source, single row.
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

  let body: CreateLeadBody;
  try {
    body = (await request.json()) as CreateLeadBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const source = body.source;
  if (!source || !isKnownLeadSource(source)) {
    return NextResponse.json({ error: 'Unknown source' }, { status: 400 });
  }
  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json(
      { error: 'name and email are required' },
      { status: 400 }
    );
  }

  const result = await createInquiry({
    source: source as LeadSource,
    name: body.name,
    email: body.email,
    phone: body.phone ?? null,
    country: body.country ?? null,
    company: body.company ?? null,
    message: body.message ?? null,
    ownerUserId: body.ownerUserId ?? null,
    initialLifecycleStage: body.initialLifecycleStage,
    manualEntryByUserId: staff.id,
    skipNotification: true,
  });

  if (result.status === 'error') {
    return NextResponse.json(
      { error: result.message },
      { status: result.httpStatus }
    );
  }

  await logAudit({
    actorUserId: staff.id,
    actorEmail: staff.email,
    action: 'lead_manual_create',
    entityType: 'inquiry',
    entityId: result.inquiryId,
    metadata: { source, status: result.status },
  });

  return NextResponse.json({
    status: result.status,
    inquiryId: result.inquiryId,
    hubspotContactId: result.hubspotContactId,
  });
}
