import { MetadataRoute } from 'next';
import { db } from '@36zero/database';
import { vessels } from '@36zero/database/schema';
import { eq, and } from 'drizzle-orm';

// Adventure Yacht slugs for individual detail pages
const adventureYachtSlugs = [
  'adventure-one',
  'adventure-two',
  'adventure-three',
  'adventure-four',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://36zeroyachting.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/vessels`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/adventure-yachts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lap`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Adventure Yacht individual pages
  const adventureYachtPages: MetadataRoute.Sitemap = adventureYachtSlugs.map((slug) => ({
    url: `${baseUrl}/adventure-yachts/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Dynamic brokerage vessel pages (non-Adventure Yachts)
  try {
    const brokerageVessels = await db.query.vessels.findMany({
      where: and(
        eq(vessels.isVisible, true),
        eq(vessels.isAdventureYacht, false)
      ),
      columns: {
        slug: true,
        updatedAt: true,
      },
    });

    const vesselPages: MetadataRoute.Sitemap = brokerageVessels.map((vessel) => ({
      url: `${baseUrl}/vessels/${vessel.slug}`,
      lastModified: vessel.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...adventureYachtPages, ...vesselPages];
  } catch (error) {
    console.error('Error fetching vessels for sitemap:', error);
    // Return static + adventure yacht pages if database fetch fails
    return [...staticPages, ...adventureYachtPages];
  }
}
