import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

function getContentDir(): string {
  const cwd = process.cwd();
  const direct = path.join(cwd, 'content', 'news');
  if (fs.existsSync(direct)) return direct;
  const monorepoPath = path.join(cwd, 'apps', 'yachting', 'content', 'news');
  if (fs.existsSync(monorepoPath)) return monorepoPath;
  return direct;
}

const CONTENT_DIR = getContentDir();

export interface ArticleFrontmatter {
  title: string;
  slug: string;
  date: string;
  author: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  keywords: string[];
}

export interface Article {
  frontmatter: ArticleFrontmatter;
  content: string;
}

/**
 * Get all news articles sorted by date (newest first)
 * Reads MDX files from the content/news directory
 */
export function getAllArticles(): Article[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));

  return files
    .map((filename) => {
      const filePath = path.join(CONTENT_DIR, filename);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      return {
        frontmatter: data as ArticleFrontmatter,
        content,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );
}

/**
 * Get a single article by its slug
 */
export function getArticleBySlug(slug: string): Article | undefined {
  const articles = getAllArticles();
  return articles.find((a) => a.frontmatter.slug === slug);
}

/**
 * Get all article slugs for static generation
 */
export function getAllArticleSlugs(): string[] {
  return getAllArticles().map((a) => a.frontmatter.slug);
}
