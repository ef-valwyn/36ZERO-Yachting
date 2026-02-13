import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AdventureYachtDetail from './AdventureYachtDetail';
import VesselSchema from '@/components/VesselSchema';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { buildVariants } from './data';

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
    url: `https://www.36zeroyachting.com/adventure-yachts/${build.slug}`,
    availability: 'PreOrder' as const,
  };

  return (
    <>
      <VesselSchema vessel={vesselSchemaData} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.36zeroyachting.com' },
          { name: 'Adventure Yachts', url: 'https://www.36zeroyachting.com/adventure-yachts' },
          { name: build.name, url: `https://www.36zeroyachting.com/adventure-yachts/${build.slug}` },
        ]}
      />
      <AdventureYachtDetail build={build} allBuilds={buildVariants} />
    </>
  );
}
