import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import type { Components } from 'react-markdown';

/**
 * Renders article markdown content with 36ZERO Yachting styling.
 * Uses react-markdown instead of MDX for reliable rendering (no compilation errors).
 */
const components: Components = {
  h1: (props) => (
    <h1
      className="text-3xl md:text-4xl font-bold text-white mt-10 mb-4 tracking-tight"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="text-2xl md:text-3xl font-bold text-white mt-8 mb-3 tracking-tight"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="text-xl md:text-2xl font-semibold text-white mt-6 mb-2 tracking-tight"
      {...props}
    />
  ),
  p: (props) => (
    <p className="text-white/80 font-light leading-relaxed mb-4" {...props} />
  ),
  a: ({ href, children }) => (
    <Link
      className="text-brand-blue hover:text-brand-blue-400 underline underline-offset-2 transition-colors"
      href={href || '#'}
    >
      {children}
    </Link>
  ),
  ul: (props) => (
    <ul
      className="list-disc list-inside space-y-2 text-white/80 mb-4 ml-4"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="list-decimal list-inside space-y-2 text-white/80 mb-4 ml-4"
      {...props}
    />
  ),
  li: (props) => <li className="text-white/80 font-light" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-l-4 border-brand-blue pl-6 py-2 my-6 bg-white/5 rounded-r-xl"
      {...props}
    />
  ),
  strong: (props) => (
    <strong className="font-semibold text-white" {...props} />
  ),
  em: (props) => <em className="italic text-white/90" {...props} />,
  hr: () => <hr className="border-white/10 my-8" />,
  table: (props) => (
    <div className="overflow-x-auto my-6">
      <table
        className="w-full text-white/80 border-collapse"
        {...props}
      />
    </div>
  ),
  thead: (props) => <thead {...props} />,
  tbody: (props) => <tbody {...props} />,
  tr: (props) => <tr {...props} />,
  th: (props) => (
    <th
      className="text-left font-semibold text-white border-b border-white/20 px-4 py-2"
      {...props}
    />
  ),
  td: (props) => (
    <td
      className="border-b border-white/10 px-4 py-2 font-light"
      {...props}
    />
  ),
};

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}

export default ArticleContent;
