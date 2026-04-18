import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AY60 Onboard Registration | IMHS 2026',
  description:
    'Register your visit onboard the Adventure Yachts AY60 at the International Multihull Show 2026, La Grande Motte.',
  robots: { index: false, follow: false, nocache: true },
  alternates: {
    canonical: 'https://www.36zeroyachting.com/imhs-2026/onboard',
  },
};

export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
