import React from 'react';

/**
 * JSON-LD Structured Data for 36ZERO Yachting organization
 * Combines Organization and LocalBusiness schemas for rich results
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': 'https://www.36zeroyachting.com/#organization',
    name: '36ZERO Yachting',
    alternateName: '36ZERO',
    description: 'Premium yacht brokerage and circumnavigation experiences. Official Adventure Yachts dealer featuring the AY60 power catamaran.',
    url: 'https://www.36zeroyachting.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.36zeroyachting.com/images/logo.png',
      width: 512,
      height: 512,
    },
    image: 'https://www.36zeroyachting.com/images/ay60-gallery-1.png',
    // Business type
    '@additionalType': 'https://schema.org/BoatDealer',
    // Services offered
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Yacht Brokerage',
          description: 'Premium yacht sales and brokerage services for expedition and sailing yachts.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: '36ZERO LAP Circumnavigation',
          description: 'Life Adventure Passage - guided circumnavigation experiences across four ocean passages.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Adventure Yachts AY60',
          description: 'Official dealer for the Adventure Yachts AY60 power catamaran.',
          brand: {
            '@type': 'Brand',
            name: 'Adventure Yachts',
          },
        },
      },
    ],
    // Areas served
    areaServed: [
      {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: 43.5528,
          longitude: 4.0847,
        },
        geoRadius: '5000',
        name: 'Mediterranean',
      },
      {
        '@type': 'Place',
        name: 'Global',
      },
    ],
    // Contact
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Sales',
      availableLanguage: ['English', 'French'],
    },
    // Social profiles
    sameAs: [
      // Add social media URLs when available
      // 'https://www.instagram.com/36zeroyachting',
      // 'https://www.linkedin.com/company/36zero-yachting',
    ],
    // Industry keywords
    keywords: [
      'yacht brokerage',
      'adventure yachts',
      'AY60',
      'power catamaran',
      'circumnavigation',
      'expedition yachts',
      'sailing yachts',
      '36ZERO LAP',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * WebSite schema for sitelinks search box in Google
 */
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://www.36zeroyachting.com/#website',
    name: '36ZERO Yachting',
    url: 'https://www.36zeroyachting.com',
    publisher: {
      '@id': 'https://www.36zeroyachting.com/#organization',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.36zeroyachting.com/vessels?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default OrganizationSchema;
