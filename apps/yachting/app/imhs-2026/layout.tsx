import type { Metadata } from 'next';
import { EventSchema } from '@/components/EventSchema';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'IMHS 2026 | AY60 World Premiere at the International Multihull Show, La Grande Motte',
  description:
    'See the Adventure Yachts AY60 power catamaran at the International Multihull Show (Salon International du Multicoque) 2026 in La Grande Motte, France, April 22-26. Register for a private viewing with 36ZERO Yachting — 60 ft composite catamaran, 2,000+ nm range, 4+2 cabins.',
  keywords: [
    'International Multihull Show 2026',
    'IMHS 2026',
    'Salon International du Multicoque',
    'La Grande Motte boat show',
    'AY60 power catamaran',
    'Adventure Yachts AY60',
    'AY60 world premiere',
    'power catamaran boat show',
    'multihull show France',
    '36ZERO Yachting',
    'Adventure Yachts',
    'catamaran exhibition',
    'yacht show 2026',
    'private yacht viewing',
    'long range power catamaran',
  ],
  openGraph: {
    title: 'AY60 World Premiere | International Multihull Show 2026, La Grande Motte',
    description:
      'Visit Adventure Yachts and 36ZERO Yachting at IMHS 2026 in La Grande Motte, France. See the AY60 — a 60 ft power catamaran with 2,000+ nm range. April 22-26. Register for a private tour.',
    images: [
      {
        url: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/hero-landing.png',
        width: 1200,
        height: 630,
        alt: 'Adventure Yachts AY60 power catamaran — World Premiere at IMHS 2026 La Grande Motte',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AY60 World Premiere | IMHS 2026, La Grande Motte',
    description:
      'See the Adventure Yachts AY60 power catamaran at the International Multihull Show 2026. April 22-26, La Grande Motte, France.',
  },
  alternates: {
    canonical: 'https://www.36zeroyachting.com/imhs-2026',
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
        name="AY60 Power Catamaran World Premiere — International Multihull Show 2026"
        description="World Premiere of the Adventure Yachts AY60 Sport power catamaran at the International Multihull Show (Salon International du Multicoque) in La Grande Motte, France. The AY60 is a 60 ft carbon/eGlass composite catamaran with 2,000+ nm range. Visit the 36ZERO Yachting stand for a private viewing and meet the Adventure Yachts team. April 22-26, 2026."
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
