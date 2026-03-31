import type { Metadata } from 'next';
import { EventSchema } from '@/components/EventSchema';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'IMHS 2026 | International Multihull Show - Adventure Yachts AY60',
  description:
    'Visit Adventure Yachts and 36ZERO Yachting at the International Multihull Show 2026 in La Grande Motte, France. April 22-26, 2026. See the AY60 power catamaran and register for a private viewing.',
  openGraph: {
    title: 'IMHS 2026 | Adventure Yachts AY60 at the International Multihull Show',
    description:
      'See the AY60 power catamaran at the International Multihull Show in La Grande Motte, April 22-26, 2026. Register for a private viewing.',
    images: [
      {
        url: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/hero-landing.png',
        width: 1200,
        height: 630,
        alt: 'Adventure Yachts AY60 at IMHS 2026',
      },
    ],
  },
};

export default function IMHSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EventSchema
        name="Adventure Yachts AY60 at the International Multihull Show 2026"
        description="Visit Adventure Yachts and 36ZERO Yachting at the International Multihull Show (Salon International du Multicoque) in La Grande Motte, France. See the AY60 power catamaran, register for a private viewing, and meet the team."
        startDate="2026-04-22"
        endDate="2026-04-26"
        location={{
          name: 'International Multihull Show (Salon International du Multicoque)',
          address: 'Port de plaisance',
          city: 'La Grande Motte',
          country: 'FR',
        }}
        url="https://www.36zeroyachting.com/imhs-2026"
        image="https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/hero-landing.png"
        organizer={{
          name: 'Salon International du Multicoque',
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.36zeroyachting.com' },
          {
            name: 'IMHS 2026',
            url: 'https://www.36zeroyachting.com/imhs-2026',
          },
        ]}
      />
      {children}
    </>
  );
}
