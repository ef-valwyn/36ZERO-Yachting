import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db, inboundDrafts, inquiries, eq } from '@36zero/database';
import { parseInboundWithClaude } from '@/lib/inbound/parse-with-claude';

/**
 * POST /api/webhooks/postmark/inbound
 *
 * Receives parsed inbound emails from Postmark, stores them in `inbound_drafts`
 * for staff review, and runs an LLM extractor to pre-fill the lead fields.
 *
 * Authentication
 *   Postmark Inbound supports Basic Auth on the webhook URL but does NOT sign
 *   payloads with HMAC. We compare the Authorization header to env values
 *   `POSTMARK_INBOUND_BASIC_USER` / `POSTMARK_INBOUND_BASIC_PASS` with a
 *   constant-time check. Pair with HTTPS-only ingress; the URL secret is the
 *   only barrier between the public internet and this endpoint.
 *
 * Idempotency
 *   Postmark retries inbound webhooks up to 10 times over ~10.5h. The unique
 *   `postmarkMessageId` column makes inserts idempotent — a retry returns 200
 *   with `idempotent: true` and skips the parse step.
 *
 * Spam gate
 *   Postmark adds SpamAssassin headers (`X-Spam-Status`, `X-Spam-Score`).
 *   If the score ≥ 5 or status is "Yes", we skip the LLM call entirely and
 *   set status='rejected' with reason='spam'. Cheap defense against bots.
 *
 * Failure behaviour
 *   The DB row is inserted FIRST. The Claude call happens after — if it
 *   throws, the draft lands in status='parse_failed' with the raw bodies
 *   intact, so staff can still triage manually.
 */
export async function POST(request: NextRequest) {
  const expectedUser = process.env.POSTMARK_INBOUND_BASIC_USER;
  const expectedPass = process.env.POSTMARK_INBOUND_BASIC_PASS;
  if (!expectedUser || !expectedPass) {
    console.error('[postmark-inbound] basic auth env vars not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization') ?? '';
  if (!authHeader.toLowerCase().startsWith('basic ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const expectedB64 = Buffer.from(`${expectedUser}:${expectedPass}`).toString('base64');
  const got = authHeader.slice(6).trim();
  if (
    got.length !== expectedB64.length ||
    !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expectedB64))
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: PostmarkInboundPayload;
  try {
    payload = (await request.json()) as PostmarkInboundPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const messageId = (payload.MessageID ?? '').trim();
  const fromEmail = (payload.FromFull?.Email ?? payload.From ?? '').trim().toLowerCase();
  if (!messageId || !fromEmail) {
    return NextResponse.json({ error: 'Missing MessageID or From' }, { status: 400 });
  }

  // Spam check from Postmark's SpamAssassin headers.
  const headers = payload.Headers ?? [];
  const spamStatus = headerValue(headers, 'X-Spam-Status') ?? '';
  const spamScoreStr = headerValue(headers, 'X-Spam-Score') ?? '';
  const spamScore = Number.parseFloat(spamScoreStr);
  const isSpam =
    /^Yes\b/i.test(spamStatus) ||
    (Number.isFinite(spamScore) && spamScore >= 5);

  const fromName = (payload.FromFull?.Name ?? '').trim() || null;
  const subject = (payload.Subject ?? '').slice(0, 998) || null;
  const receivedAt = parseDateOrNow(payload.Date);
  const textBody = payload.TextBody ?? null;
  const htmlBody = payload.HtmlBody ?? null;

  // Insert with ON CONFLICT DO NOTHING for idempotency on the unique
  // postmark_message_id column. Returning a row tells us whether this is a
  // fresh delivery or a retry.
  const [inserted] = await db
    .insert(inboundDrafts)
    .values({
      postmarkMessageId: messageId,
      fromEmail,
      fromName,
      subject,
      receivedAt,
      rawTextBody: textBody,
      rawHtmlBody: htmlBody,
      status: isSpam ? 'rejected' : 'parsing',
      statusReason: isSpam ? `spam (status=${spamStatus.split(',')[0]}, score=${spamScoreStr})` : null,
      spamScore: Number.isFinite(spamScore) ? spamScore.toFixed(2) : null,
    })
    .onConflictDoNothing({ target: inboundDrafts.postmarkMessageId })
    .returning({ id: inboundDrafts.id, status: inboundDrafts.status });

  if (!inserted) {
    // Retry: row already exists. 200 OK so Postmark doesn't keep retrying.
    return NextResponse.json({ ok: true, idempotent: true });
  }

  if (isSpam) {
    return NextResponse.json({ ok: true, status: 'rejected', reason: 'spam' });
  }

  // Cross-source dedup against existing inquiries (lower(email) is fine —
  // emails are normalised to lowercase at every other intake point).
  const existing = await db.query.inquiries.findFirst({
    where: eq(inquiries.email, fromEmail),
    columns: { id: true },
  });

  // Run Claude extraction. Do not auto-promote — staff review approves.
  const parsed = await parseInboundWithClaude({
    fromEmail,
    fromName,
    subject,
    textBody,
    htmlBody,
  });

  let nextStatus: string;
  let statusReason: string | null = null;

  if (existing) {
    nextStatus = 'duplicate';
  } else if (parsed.ok) {
    nextStatus = 'parsed';
  } else {
    nextStatus = 'parse_failed';
    statusReason = parsed.error ?? 'unknown parser error';
  }

  await db
    .update(inboundDrafts)
    .set({
      parsedJson: parsed.fields,
      status: nextStatus,
      statusReason,
      resultingInquiryId: existing?.id ?? null,
    })
    .where(eq(inboundDrafts.id, inserted.id));

  return NextResponse.json({
    ok: true,
    draftId: inserted.id,
    status: nextStatus,
  });
}

function headerValue(
  headers: Array<{ Name?: string; Value?: string }>,
  name: string
): string | null {
  const lower = name.toLowerCase();
  for (const h of headers) {
    if (h?.Name?.toLowerCase() === lower) return h.Value ?? null;
  }
  return null;
}

function parseDateOrNow(s: string | undefined | null): Date {
  if (!s) return new Date();
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

// Postmark inbound payload shape — only the fields we use are typed.
// Full schema: https://postmarkapp.com/developer/webhooks/inbound-webhook
interface PostmarkInboundPayload {
  MessageID?: string;
  Date?: string;
  Subject?: string;
  From?: string;
  FromFull?: { Email?: string; Name?: string };
  TextBody?: string;
  HtmlBody?: string;
  Headers?: Array<{ Name?: string; Value?: string }>;
}
