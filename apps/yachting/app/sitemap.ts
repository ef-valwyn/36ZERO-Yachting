import { MetadataRoute } from 'next';

// Adventure Yacht slugs for individual detail pages
const adventureYachtSlugs = [
  'adventure-one',
  'adventure-two',
  'adventure-three',
  'adventure-four',
];

export default function sitemap(): MetadataRoute.Sitemap {
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

  return [...staticPages, ...adventureYachtPages];
}
