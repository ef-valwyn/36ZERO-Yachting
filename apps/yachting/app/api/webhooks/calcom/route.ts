import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db, inquiries, eq } from '@36zero/database';
import { logAudit } from '@/lib/audit';
import { syncAppointmentToHubSpot } from '@/lib/hubspot/admin-sync';

/**
 * POST /api/webhooks/calcom
 *
 * Receives Cal.com booking events (BOOKING_CREATED, BOOKING_RESCHEDULED,
 * BOOKING_CANCELLED) and mirrors them into the inquiries.appointment_* columns.
 * The inquiry is located via payload.metadata.inquiryId (set by the embed).
 *
 * Signature: HMAC-SHA256 of the raw request body using CALCOM_WEBHOOK_SECRET,
 * passed in X-Cal-Signature-256 or X-Cal-Signature-256 (docs inconsistent).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[calcom-webhook] CALCOM_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const rawBody = await request.text();
  const sigHeader =
    request.headers.get('x-cal-signature-256') ||
    request.headers.get('X-Cal-Signature-256') ||
    '';

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // Constant-time compare; tolerate `sha256=` prefix.
  const received = sigHeader.replace(/^sha256=/, '');
  if (
    received.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(received, 'hex'), Buffer.from(expected, 'hex'))
  ) {
    console.error('[calcom-webhook] signature mismatch');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const triggerEvent: string = payload.triggerEvent ?? payload.type ?? '';
  const booking = payload.payload ?? payload;

  // Cal.com may deliver the inquiryId in several shapes depending on how it's
  // captured (booking metadata vs hidden booking question vs legacy custom
  // input). A hidden question with identifier `inquiryId` on the event type
  // lands it in `responses.inquiryId`, sometimes as a plain string and
  // sometimes as a `{ value, label }` wrapper.
  const resp = booking?.responses?.inquiryId;
  const inquiryId: string | undefined =
    booking?.metadata?.inquiryId ||
    (typeof resp === 'string' ? resp : resp?.value) ||
    booking?.responses?.metadata?.inquiryId ||
    booking?.customInputs?.inquiryId;

  if (!inquiryId) {
    console.warn('[calcom-webhook] no inquiryId in payload', {
      triggerEvent,
      uid: booking?.uid,
      metadataKeys: booking?.metadata ? Object.keys(booking.metadata) : null,
      responseKeys: booking?.responses ? Object.keys(booking.responses) : null,
    });
    return NextResponse.json({ ignored: 'no inquiryId in metadata' });
  }

  const inquiry = await db.query.inquiries.findFirst({
    where: eq(inquiries.id, inquiryId),
    columns: { id: true, email: true, hubspotContactId: true },
  });
  if (!inquiry) {
    console.warn('[calcom-webhook] inquiry not found', { inquiryId });
    return NextResponse.json({ ignored: 'inquiry not found' });
  }

  const bookingUid: string | undefined = booking?.uid || booking?.bookingUid;
  const startTimeStr: string | undefined = booking?.startTime || booking?.start;
  const endTimeStr: string | undefined = booking?.endTime || booking?.end;
  const hostEmail: string | undefined =
    booking?.organizer?.email ||
    booking?.user?.email ||
    booking?.attendees?.find?.((a: any) => a?.timeZone)?.email;

  let appointmentStatus:
    | 'confirmed'
    | 'cancelled'
    | 'rescheduled'
    | 'completed'
    | 'no_show'
    | null = null;
  let auditAction:
    | 'appointment_booked'
    | 'appointment_cancelled'
    | 'appointment_rescheduled'
    | null = null;

  switch (triggerEvent) {
    case 'BOOKING_CREATED':
    case 'BOOKING_CONFIRMED':
      appointmentStatus = 'confirmed';
      auditAction = 'appointment_booked';
      break;
    case 'BOOKING_RESCHEDULED':
      appointmentStatus = 'rescheduled';
      auditAction = 'appointment_rescheduled';
      break;
    case 'BOOKING_CANCELLED':
      appointmentStatus = 'cancelled';
      auditAction = 'appointment_cancelled';
      break;
    default:
      return NextResponse.json({ ignored: `unknown triggerEvent ${triggerEvent}` });
  }

  const startAt = startTimeStr ? new Date(startTimeStr) : null;
  const endAt = endTimeStr ? new Date(endTimeStr) : null;

  await db
    .update(inquiries)
    .set({
      appointmentBookingId: bookingUid ?? null,
      appointmentStartAt: appointmentStatus === 'cancelled' ? null : startAt,
      appointmentEndAt: appointmentStatus === 'cancelled' ? null : endAt,
      appointmentStatus,
      appointmentAssignedStaffEmail: hostEmail ?? null,
      appointmentUpdatedAt: new Date(),
    })
    .where(eq(inquiries.id, inquiryId));

  try {
    await syncAppointmentToHubSpot(
      {
        id: inquiry.id,
        email: inquiry.email,
        hubspotContactId: inquiry.hubspotContactId,
      },
      {
        startAt: appointmentStatus === 'cancelled' ? null : startAt,
        status: appointmentStatus,
        assignedStaffEmail: hostEmail ?? null,
      }
    );
  } catch (err) {
    console.error('[calcom-webhook] HubSpot sync threw (non-fatal):', err);
  }

  if (auditAction) {
    await logAudit({
      actorUserId: null,
      actorEmail: hostEmail ?? 'cal.com',
      action: auditAction,
      entityType: 'inquiry',
      entityId: inquiryId,
      metadata: { bookingUid, startAt: startAt?.toISOString(), triggerEvent },
    });
  }

  return NextResponse.json({ ok: true });
}
