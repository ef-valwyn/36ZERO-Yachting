import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

type LeadSource =
  | 'premiere_updates'
  | 'premiere_tour_request'
  | 'vessel_enquiry'
  | 'contact_form'
  | 'imhs_updates'
  | 'imhs_tour_request'
  | 'imhs_onboard_registration'
  | 'lap_application';

const SOURCE_LABELS: Record<LeadSource, string> = {
  premiere_updates: 'Premiere Email Signup',
  premiere_tour_request: 'Premiere Tour Request',
  vessel_enquiry: 'Vessel Enquiry',
  contact_form: 'Contact Form',
  imhs_updates: 'IMHS 2026 Email Signup',
  imhs_tour_request: 'IMHS 2026 Tour Request',
  imhs_onboard_registration: 'IMHS 2026 Onboard Registration',
  lap_application: 'LAP Application',
};

interface NotificationData {
  leadSource: LeadSource;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  country?: string;
  details: Record<string, string | undefined>;
}

function buildDetailRows(details: Record<string, string | undefined>): string {
  return Object.entries(details)
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;color:#374151;white-space:nowrap">${label}</td><td style="padding:6px 12px;color:#1f2937">${value}</td></tr>`
    )
    .join('');
}

export async function sendLeadNotification(data: NotificationData): Promise<void> {
  const resend = getResend();
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'contact@mail.36zeroyachting.com';

  if (!resend || !notificationEmail) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email] Notification skipped (not configured):', data.leadSource, data.email);
    }
    return;
  }

  const label = SOURCE_LABELS[data.leadSource] || data.leadSource;
  const subject = `New Lead: ${label} — ${data.name || data.email}`;

  const detailRows = buildDetailRows({
    Name: data.name,
    Email: data.email,
    Phone: data.phone,
    Company: data.company,
    Country: data.country,
    ...data.details,
  });

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0f172a;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;color:#fff;font-size:18px">36ZERO Yachting — New ${label}</h2>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${detailRows}
        </table>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
        <p style="font-size:12px;color:#9ca3af;margin:0">
          This notification was sent automatically from your website lead capture system.
        </p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: notificationEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error('[Email] Failed to send lead notification:', error);
  }
}
