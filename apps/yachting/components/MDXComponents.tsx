import Image from 'next/image';
import Link from 'next/link';
import type { MDXComponents } from 'mdx/types';

/**
 * Custom MDX components styled to match the 36ZERO Yachting glassmorphism design system.
 * These are used when rendering MDX content in news articles.
 */
export const mdxComponents: MDXComponents = {
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
  a: (props) => (
    <Link
      className="text-brand-blue hover:text-brand-blue-400 underline underline-offset-2 transition-colors"
      href={props.href || '#'}
      {...props}
    />
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
  img: (props) => (
    <span className="block my-6 rounded-2xl overflow-hidden">
      <Image
        src={props.src || ''}
        alt={props.alt || ''}
        width={1200}
        height={675}
        className="w-full h-auto object-cover"
      />
    </span>
  ),
  hr: () => <hr className="border-white/10 my-8" />,
  table: (props) => (
    <div className="overflow-x-auto my-6">
      <table
        className="w-full text-white/80 border-collapse"
        {...props}
      />
    </div>
  ),
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
