import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllArticleSlugs, getArticleBySlug } from '@/lib/news';
import { ArticleSchema } from '@/components/ArticleSchema';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { ArticleContent } from '@/components/ArticleContent';
import ArticleClient from './ArticleClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  const { frontmatter } = article;
  const articleUrl = `https://www.36zeroyachting.com/news/${frontmatter.slug}`;
  return {
    title: frontmatter.title,
    description: frontmatter.excerpt,
    keywords: frontmatter.keywords,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      url: articleUrl,
      title: frontmatter.title,
      description: frontmatter.excerpt,
      type: 'article',
      publishedTime: frontmatter.date,
      images: [
        {
          url: frontmatter.coverImage,
          width: 1200,
          height: 630,
          alt: frontmatter.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.excerpt,
      images: [frontmatter.coverImage],
    },
  };
}

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const { frontmatter, content } = article;
  const articleUrl = `https://www.36zeroyachting.com/news/${frontmatter.slug}`;

  return (
    <>
      <ArticleSchema
        title={frontmatter.title}
        description={frontmatter.excerpt}
        url={articleUrl}
        image={frontmatter.coverImage}
        datePublished={frontmatter.date}
        author={frontmatter.author}
        keywords={frontmatter.keywords}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.36zeroyachting.com' },
          {
            name: 'News & Updates',
            url: 'https://www.36zeroyachting.com/news',
          },
          { name: frontmatter.title, url: articleUrl },
        ]}
      />
      <ArticleClient frontmatter={frontmatter}>
        <ArticleContent content={content} />
      </ArticleClient>
    </>
  );
}
