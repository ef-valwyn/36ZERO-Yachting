import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/sign-in/',
        '/sign-up/',
        '/sso-callback/',
        '/upload/',
      ],
    },
    sitemap: 'https://36zeroyachting.com/sitemap.xml',
  };
}
