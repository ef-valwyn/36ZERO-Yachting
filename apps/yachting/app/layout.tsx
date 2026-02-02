import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import '@36zero/ui/styles';
import './globals.css';
import WorldPremierePopup from '@/components/WorldPremierePopup';
import { AnalyticsProvider } from '@/components/Analytics';
import { OrganizationSchema, WebSiteSchema } from '@/components/OrganizationSchema';

// Force dynamic rendering to fix Clerk + Next.js 15 compatibility
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.36zeroyachting.com'),
  title: {
    default: '36ZERO Yachting | Adventure Yacht Brokerage',
    template: '%s | 36ZERO Yachting',
  },
  description:
    'Premium yacht brokerage and circumnavigation experiences. Official Adventure Yachts dealer featuring the AY60 power catamaran.',
  keywords: [
    'yacht brokerage',
    'adventure yachts',
    'AY60',
    'power catamaran',
    'circumnavigation',
    'expedition yachts',
    'yachts for sale',
    'luxury yachts',
    '36ZERO LAP',
  ],
  authors: [{ name: '36ZERO Yachting' }],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: '36ZERO Yachting',
    title: '36ZERO Yachting | Adventure Yacht Brokerage',
    description:
      'Premium yacht brokerage and circumnavigation experiences. Official Adventure Yachts dealer.',
    images: [
      {
        url: '/images/ay60-gallery-1.png',
        width: 1200,
        height: 630,
        alt: '36ZERO Yachting - Adventure Yacht Brokerage',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '36ZERO Yachting',
    description: 'Premium Yacht Brokerage & Adventure Partnerships',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" className="scroll-smooth">
        <head>
          {/* Structured Data - Organization & Website Schema */}
          <OrganizationSchema />
          <WebSiteSchema />
        </head>
        <body className="bg-brand-navy text-white antialiased">
          <AnalyticsProvider>
            {children}
            <WorldPremierePopup />
          </AnalyticsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
