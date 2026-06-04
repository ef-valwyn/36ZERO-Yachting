import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  transpilePackages: ['@36zero/ui', '@36zero/database'],
  // Suppress Clerk + Next.js 15 async headers warning (dev-only, doesn't affect functionality)
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/zerolap',
        destination: '/lap',
        permanent: true,
      },
      {
        source: '/ay60',
        destination: '/adventure-yachts',
        permanent: true,
      },
      // IMHS 2026 (La Grande Motte, 22-26 April 2026) has passed — page deactivated.
      // Temporary redirects so the route can be re-enabled for a future event;
      // the page components under app/imhs-2026 are kept in place for reuse.
      {
        source: '/imhs-2026',
        destination: '/',
        permanent: false,
      },
      {
        source: '/imhs-2026/onboard',
        destination: '/',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      // Rewrite /lap/* to the LAP app (in production, this would be a separate deployment)
      // For now, we'll handle LAP as a route within the same app
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  // Source map settings
  sourcemaps: {
    // Hides source maps from generated client bundles
    deleteSourcemapsAfterUpload: true,
  },

  // Webpack-specific options
  webpack: {
    // Automatically annotate React components to show their full name in breadcrumbs and session replay
    reactComponentAnnotation: {
      enabled: true,
    },
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    treeshake: {
      removeDebugLogging: true,
    },
    // Enables automatic instrumentation of Vercel Cron Monitors
    automaticVercelMonitors: true,
  },
});
