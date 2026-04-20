import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireStaff, StaffAuthError, type StaffUser } from '@/lib/auth/require-staff';
import AdminShell from './_components/AdminShell';

export const metadata: Metadata = {
  title: '36ZERO Admin | IMHS 2026',
  description: 'Internal staff console.',
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Resolve the staff user, or redirect. Kept separate from the JSX render so
 * the ESLint rule that bans JSX-in-try/catch is satisfied. `redirect()`
 * throws a Next-controlled redirect error that propagates out of this
 * function, never returning to the layout component.
 */
async function resolveStaffOrRedirect(): Promise<StaffUser> {
  try {
    return await requireStaff();
  } catch (err) {
    if (err instanceof StaffAuthError) {
      if (err.reason === 'unauthenticated') {
        redirect('/sign-in?redirect_url=%2Fadmin');
      }
      redirect('/');
    }
    throw err;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await resolveStaffOrRedirect();
  return <AdminShell staff={staff}>{children}</AdminShell>;
}
