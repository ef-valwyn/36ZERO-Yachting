import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AdventureYachtDetail from './AdventureYachtDetail';
import VesselSchema from '@/components/VesselSchema';

// Build variants data - same as select-your-build but used for SSR metadata
const buildVariants = [
  {
    id: 'adventure-one',
    slug: 'adventure-one',
    name: 'Adventure One',
    model: 'AY60 Sport',
    variant: 'Outboard',
    tagline: 'Pure performance meets refined luxury',
    location: 'Mediterranean',
    description: 'The AY60 Sport delivers an uncompromising blend of speed, efficiency, and sophistication. Powered by dual COX CXO300 diesel outboard engines, this configuration offers maximum manoeuvrability and easy maintenance, making it the ideal choice for those who demand performance without sacrifice.',
    additionalParagraph: 'Adventure One will make her World Premiere at the International Multi Hull Show at La Grande Motte on April 22-24, 2026. She is positioned perfectly to take advantage of the European summer, whether for private cruising or charter operations.',
    specs: {
      lengthOverall: { value: '18.3 m', imperial: "(60' 0\")" },
      beamOverall: { value: '8.47m', imperial: "(30' 0\")" },
      range: { value: '2,000', unit: 'nm' },
      cruisingSpeed: { value: '14', unit: 'kn' },
      berths: { value: '4+2', unit: '' },
      construction: { value: 'Composite', detail: '(Carbon - eGlass)' },
    },
    imageUrl: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/hero-landing.png',
  },
  {
    id: 'adventure-two',
    slug: 'adventure-two',
    name: 'Adventure Two',
    model: 'AY60 Flybridge',
    variant: 'Hybrid Inboard',
    tagline: 'Extended horizons with sustainable power',
    location: 'Thailand (Global Delivery Available)',
    description: 'The AY60 Flybridge combines elegant design with innovative hybrid propulsion technology. The expansive flybridge deck provides exceptional entertaining space, while the hybrid inboard system delivers remarkable range and reduced environmental impact for the conscientious voyager.',
    specs: {
      lengthOverall: { value: '18.3 m', imperial: "(60' 0\")" },
      beamOverall: { value: '8.47m', imperial: "(30' 0\")" },
      range: { value: '2,500', unit: 'nm' },
      cruisingSpeed: { value: '12', unit: 'kn' },
      berths: { value: '4+2', unit: '' },
      construction: { value: 'Composite', detail: '(Carbon - eGlass)' },
    },
    imageUrl: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-two/Adventure%20Two%20AY60F.png',
  },
  {
    id: 'adventure-three',
    slug: 'adventure-three',
    name: 'Adventure Three',
    model: 'AY60 Sport',
    variant: 'Outboard',
    tagline: 'Bespoke excellence awaits your vision',
    location: 'Thailand (Global Delivery Available)',
    description: 'A blank canvas ready for your personal touch. This AY60 Sport offers full customisation opportunities, allowing you to work directly with our design team to create a vessel that perfectly reflects your lifestyle and aspirations. From layout to finishes, every detail is yours to define.',
    specs: {
      lengthOverall: { value: '18.3 m', imperial: "(60' 0\")" },
      beamOverall: { value: '8.47m', imperial: "(30' 0\")" },
      range: { value: '2,000', unit: 'nm' },
      cruisingSpeed: { value: '14', unit: 'kn' },
      berths: { value: '4+2', unit: '' },
      construction: { value: 'Composite', detail: '(Carbon - eGlass)' },
    },
    imageUrl: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/portthreequarter.jpeg',
  },
  {
    id: 'adventure-four',
    slug: 'adventure-four',
    name: 'Adventure Four',
    model: 'AY60 SportX',
    variant: 'Outboard Explorer',
    tagline: 'Engineered for ocean passages',
    location: 'Thailand (Global Delivery Available)',
    description: 'The AY60 SportX is purpose-built for serious bluewater cruising. With enhanced fuel capacity and extended range capabilities, this explorer variant is designed for those who seek distant horizons. Robust construction and comprehensive systems ensure you can venture far from shore with complete confidence.',
    specs: {
      lengthOverall: { value: '18.3 m', imperial: "(60' 0\")" },
      beamOverall: { value: '8.47m', imperial: "(30' 0\")" },
      range: { value: '2,000', unit: 'nm' },
      cruisingSpeed: { value: '14', unit: 'kn' },
      berths: { value: '4+2', unit: '' },
      construction: { value: 'Composite', detail: '(Carbon - eGlass)' },
    },
    imageUrl: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/afterthreequarter.jpeg',
  },
];

// Export for use in other files (e.g., sitemap)
export { buildVariants };

interface Props {
  params: Promise<{ slug: string }>;
}

function getBuildBySlug(slug: string) {
  return buildVariants.find((build) => build.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const build = getBuildBySlug(slug);

  if (!build) {
    return {
      title: 'Vessel Not Found',
    };
  }

  const title = `${build.name} | ${build.model} ${build.variant}`;
  const description = `${build.tagline}. ${build.specs.lengthOverall.value} ${build.model} power catamaran. ${build.specs.range.value}nm range, ${build.specs.cruisingSpeed.value}kn cruising speed. Enquire now with 36ZERO Yachting.`;

  return {
    title: build.name,
    description,
    keywords: [
      build.name,
      build.model,
      'Adventure Yachts',
      'AY60',
      'power catamaran',
      build.variant,
      'yacht for sale',
      '36ZERO Yachting',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: build.imageUrl,
          width: 1200,
          height: 630,
          alt: `${build.name} - ${build.model} ${build.variant}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: build.name,
      description,
      images: [build.imageUrl],
    },
  };
}

export async function generateStaticParams() {
  return buildVariants.map((build) => ({
    slug: build.slug,
  }));
}

export default async function AdventureYachtPage({ params }: Props) {
  const { slug } = await params;
  const build = getBuildBySlug(slug);

  if (!build) {
    notFound();
  }

  // Prepare vessel data for structured data schema
  const vesselSchemaData = {
    name: build.name,
    model: `${build.model} ${build.variant}`,
    manufacturer: 'Adventure Yachts',
    description: `${build.tagline}. ${build.description}`,
    image: build.imageUrl,
    length: build.specs.lengthOverall.value,
    location: build.location,
    url: `https://36zeroyachting.com/adventure-yachts/${build.slug}`,
    availability: 'PreOrder' as const,
  };

  return (
    <>
      <VesselSchema vessel={vesselSchemaData} />
      <AdventureYachtDetail build={build} allBuilds={buildVariants} />
    </>
  );
}
