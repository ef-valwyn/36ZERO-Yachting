import React from 'react';

interface VesselSchemaProps {
  vessel: {
    name: string;
    model: string;
    manufacturer: string;
    description: string;
    image: string | string[];
    price?: number;
    currency?: string;
    year?: number;
    length?: string;
    location?: string;
    url: string;
    availability?: 'InStock' | 'PreOrder' | 'SoldOut' | 'OutOfStock';
  };
}

/**
 * JSON-LD Structured Data for Vessel/Yacht listings
 * Uses Product schema for rich results in search engines
 */
export function VesselSchema({ vessel }: VesselSchemaProps) {
  const images = Array.isArray(vessel.image) ? vessel.image : [vessel.image];
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: vessel.name,
    description: vessel.description,
    image: images,
    brand: {
      '@type': 'Brand',
      name: vessel.manufacturer,
    },
    model: vessel.model,
    url: vessel.url,
    ...(vessel.year && {
      productionDate: vessel.year.toString(),
    }),
    ...(vessel.length && {
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Length',
          value: vessel.length,
        },
      ],
    }),
    ...(vessel.price && {
      offers: {
        '@type': 'Offer',
        price: vessel.price,
        priceCurrency: vessel.currency || 'EUR',
        availability: `https://schema.org/${vessel.availability || 'InStock'}`,
        seller: {
          '@type': 'Organization',
          name: '36ZERO Yachting',
          url: 'https://www.36zeroyachting.com',
        },
        ...(vessel.location && {
          availableAtOrFrom: {
            '@type': 'Place',
            name: vessel.location,
          },
        }),
      },
    }),
    // Category for yachts
    category: 'Yachts & Boats',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default VesselSchema;
