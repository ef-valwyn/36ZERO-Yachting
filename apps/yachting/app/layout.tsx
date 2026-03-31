import type { Metadata } from 'next';
import Script from 'next/script';
import { ClerkProvider } from '@clerk/nextjs';
import '@36zero/ui/styles';
import './globals.css';
import WorldPremierePopup from '@/components/WorldPremierePopup';
import MOTYVotePopup from '@/components/MOTYVotePopup';
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
  verification: {
    google: [
      'cldLc71YDR4erJT8r9jOie4mjH8wmj2HfKV6iuqEF8I',
      'f0sIfWFpv4Fy9DWzifPwJTXW4UZ93_SW7SEV7TaFf7I',
    ],
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
            <MOTYVotePopup />
          </AnalyticsProvider>
          {/* HubSpot Tracking Code — captures UTM params & page views */}
          <Script
            id="hs-script-loader"
            src="//js-na2.hs-scripts.com/245063127.js"
            strategy="afterInteractive"
          />
          {/* Meta Pixel */}
          <Script id="meta-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '902976809405914');
            fbq('track', 'PageView');
          `}</Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src="https://www.facebook.com/tr?id=902976809405914&ev=PageView&noscript=1"
              alt=""
            />
          </noscript>
        </body>
      </html>
    </ClerkProvider>
  );
}
