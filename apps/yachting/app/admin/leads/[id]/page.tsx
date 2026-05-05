import { redirect } from 'next/navigation';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';
import LeadDetailClient from '../../_components/LeadDetailClient';

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // The /admin layout already gates on requireStaff(); we just need the
  // role flag here to gate the convert-to-deal button. If somehow we end
  // up here without staff (race with auth changes), defer to the layout's
  // redirect behaviour.
  let role: 'admin' | 'staff' = 'staff';
  try {
    const staff = await requireStaff();
    role = staff.role === 'admin' ? 'admin' : 'staff';
  } catch (err) {
    if (err instanceof StaffAuthError) {
      redirect('/sign-in?redirect_url=%2Fadmin');
    }
    throw err;
  }

  return <LeadDetailClient inquiryId={id} isAdmin={role === 'admin'} />;
}
