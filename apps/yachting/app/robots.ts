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
        '/admin',
        '/admin/',
      ],
    },
    sitemap: 'https://www.36zeroyachting.com/sitemap.xml',
  };
}
