import Link from 'next/link';
import { Button } from '@36zero/ui';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-navy flex flex-col">
      <Header variant="solid" />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-lg mx-auto">
          <p className="text-brand-blue text-sm font-semibold uppercase tracking-widest mb-4">
            36ZERO Yachting
          </p>
          <h1 className="text-6xl md:text-8xl font-extrabold text-white/20 mb-4">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-4">
            Page Not Found
          </h2>
          <p className="text-white/60 font-light mb-8">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved. Return to our news or homepage to continue exploring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" asChild>
              <Link href="/news">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
