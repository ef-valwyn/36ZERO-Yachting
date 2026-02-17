'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@36zero/ui';
import { ArrowLeft } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ArticleError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Article page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center px-6 py-24">
      <div className="text-center max-w-lg">
        <h1 className="text-2xl font-bold text-white mb-4">
          Unable to load article
        </h1>
        <p className="text-white/60 mb-8">
          We couldn&apos;t load this article. Please try again or return to the
          news listing.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/news">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
