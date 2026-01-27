import type { NextConfig } from 'next';

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
    ],
  },
  async rewrites() {
    return [
      // Rewrite /lap/* to the LAP app (in production, this would be a separate deployment)
      // For now, we'll handle LAP as a route within the same app
    ];
  },
};

export default nextConfig;
