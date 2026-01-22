import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@36zero/ui', '@36zero/database'],
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
