import { Metadata } from 'next';
import { getAllArticles } from '@/lib/news';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import NewsListingClient from './NewsListingClient';

export const metadata: Metadata = {
  title: 'News & Updates',
  description:
    'Latest news from 36ZERO Yachting. Adventure Yachts AY60 updates, boat show announcements, award nominations, and industry insights.',
  keywords: [
    '36ZERO news',
    'adventure yachts news',
    'AY60 updates',
    'yacht industry news',
    'boat show 2026',
    'multihull of the year',
    'International Multihull Show',
  ],
  openGraph: {
    title: 'News & Updates | 36ZERO Yachting',
    description:
      'Latest news from 36ZERO Yachting. Adventure Yachts AY60 updates, boat show announcements, and industry insights.',
    type: 'website',
  },
};

export default function NewsPage() {
  const articles = getAllArticles();

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.36zeroyachting.com' },
          {
            name: 'News & Updates',
            url: 'https://www.36zeroyachting.com/news',
          },
        ]}
      />
      <NewsListingClient
        articles={articles.map((a) => a.frontmatter)}
      />
    </>
  );
}
