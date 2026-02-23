import React from 'react';

interface EventLocation {
  name: string;
  address: string;
  city: string;
  country: string;
}

interface EventOrganizer {
  name: string;
  url?: string;
}

interface EventSchemaProps {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: EventLocation;
  url?: string;
  image?: string;
  organizer?: EventOrganizer;
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed';
  eventAttendanceMode?: 'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode' | 'MixedEventAttendanceMode';
}

/**
 * JSON-LD Structured Data for events (boat shows, premieres, etc.)
 * Renders Event schema for Google event rich results
 */
export function EventSchema({
  name,
  description,
  startDate,
  endDate,
  location,
  url,
  image,
  organizer,
  eventStatus = 'EventScheduled',
  eventAttendanceMode = 'OfflineEventAttendanceMode',
}: EventSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    startDate,
    endDate,
    eventStatus: `https://schema.org/${eventStatus}`,
    eventAttendanceMode: `https://schema.org/${eventAttendanceMode}`,
    location: {
      '@type': 'Place',
      name: location.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: location.address,
        addressLocality: location.city,
        addressCountry: location.country,
      },
    },
    ...(url && { url }),
    ...(image && { image }),
    ...(organizer && {
      organizer: {
        '@type': 'Organization',
        name: organizer.name,
        ...(organizer.url && { url: organizer.url }),
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default EventSchema;
