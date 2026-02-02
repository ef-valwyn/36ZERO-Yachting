import { NextResponse } from 'next/server';

const baseUrl = 'https://www.36zeroyachting.com';

// Adventure Yacht slugs for individual detail pages
const adventureYachtSlugs = [
  'adventure-one',
  'adventure-two',
  'adventure-three',
  'adventure-four',
];

export async function GET() {
  const now = new Date().toISOString();

  // Static pages
  const staticPages = [
    { url: baseUrl, priority: '1.0', changefreq: 'weekly' },
    { url: `${baseUrl}/vessels`, priority: '0.9', changefreq: 'weekly' },
    { url: `${baseUrl}/adventure-yachts`, priority: '0.9', changefreq: 'weekly' },
    { url: `${baseUrl}/lap`, priority: '0.8', changefreq: 'monthly' },
  ];

  // Adventure Yacht pages
  const adventurePages = adventureYachtSlugs.map((slug) => ({
    url: `${baseUrl}/adventure-yachts/${slug}`,
    priority: '0.85',
    changefreq: 'weekly',
  }));

  const allPages = [...staticPages, ...adventurePages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
