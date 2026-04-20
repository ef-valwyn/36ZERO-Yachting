import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireStaff, StaffAuthError } from '@/lib/auth/require-staff';
import AdminShell from './_components/AdminShell';

export const metadata: Metadata = {
  title: '36ZERO Admin | IMHS 2026',
  description: 'Internal staff console.',
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const staff = await requireStaff();
    return <AdminShell staff={staff}>{children}</AdminShell>;
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
