import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import '@36zero/ui/styles';
import './globals.css';

// Force dynamic rendering to fix Clerk + Next.js 15 compatibility
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: '36ZERO Yachting | Premium Yacht Brokerage',
    template: '%s | 36ZERO Yachting',
  },
  description:
    'Discover exceptional yachts for sale. 36ZERO Yachting offers premium brokerage services and exclusive partnerships with Adventure Yachts.',
  keywords: [
    'yacht brokerage',
    'yachts for sale',
    'adventure yachts',
    'sailing yachts',
    'expedition yachts',
    'luxury yachts',
  ],
  authors: [{ name: '36ZERO Yachting' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: '36ZERO Yachting',
    title: '36ZERO Yachting | Premium Yacht Brokerage',
    description:
      'Discover exceptional yachts for sale. Premium brokerage services and exclusive partnerships.',
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
        <body className="bg-brand-navy text-white antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
