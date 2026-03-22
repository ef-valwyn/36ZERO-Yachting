import { NextRequest, NextResponse } from 'next/server';
import {
  db,
  getAdventureYachtPricingConfig,
  resolveAdventureYachtPricing,
} from '@36zero/database';
import { vessels } from '@36zero/database/schema';
import { eq, asc, and } from 'drizzle-orm';
import { getAdventureYachtCurrencyFromHeaders } from '@/lib/pricingRegion';

export const dynamic = 'force-dynamic';

/**
 * GET /api/vessels/adventure-yachts
 * 
 * Fetches only visible vessels where isAdventureYacht is true.
 * Results are sorted by sortOrder first, then by availabilityDate.
 */
export async function GET(request: NextRequest) {
  try {
    const displayCurrency = getAdventureYachtCurrencyFromHeaders(request.headers);
    const adventureYachts = await db.query.vessels.findMany({
      where: and(
        eq(vessels.isAdventureYacht, true),
        eq(vessels.isVisible, true)
      ),
      orderBy: [asc(vessels.sortOrder), asc(vessels.availabilityDate)],
    });

    // Transform for API response with adventure yacht specific fields
    const response = adventureYachts.map(vessel => {
      const regionalPricing = getAdventureYachtPricingConfig(
        vessel.slug,
        vessel.specs?.pricing
      );
      const resolvedPricing = regionalPricing
        ? resolveAdventureYachtPricing(regionalPricing, displayCurrency).card
        : null;

      return {
        id: vessel.slug,
        name: vessel.name,
        slug: vessel.slug,
        manufacturer: vessel.manufacturer,
        model: vessel.model,
        variant: vessel.variant || `${vessel.model} Edition`,
        year: vessel.year,
        price: resolvedPricing?.amount ?? parseFloat(vessel.price),
        currency: resolvedPricing?.currency ?? vessel.currency,
        pricePrefix: resolvedPricing?.prefix ?? null,
        length: parseFloat(vessel.lengthMeters),
        beam: vessel.beamMeters ? parseFloat(vessel.beamMeters) : null,
        draft: vessel.draftMeters ? parseFloat(vessel.draftMeters) : null,
        capacity: vessel.guestCapacity,
        cabins: vessel.cabins,
        crew: vessel.crewCapacity,
        maxSpeed: vessel.maxSpeed,
        cruisingSpeed: vessel.cruisingSpeed,
        fuelCapacity: vessel.fuelCapacity,
        waterCapacity: vessel.waterCapacity,
        range: vessel.range,
        imageUrl: vessel.featuredImageUrl || '/images/placeholder-yacht.jpg',
        galleryImages: vessel.galleryImages || [],
        status: vessel.status === 'under_contract' ? 'under-contract' : vessel.status,
        availability: vessel.availabilityText || (vessel.status === 'available' ? 'Available Now' : 'Coming Soon'),
        availabilityText: vessel.availabilityText,
        availabilityDate: vessel.availabilityDate,
        location: vessel.location,
        description: vessel.description,
        shortDescription: vessel.shortDescription,
        specs: vessel.specs,
        isFeatured: vessel.isFeatured,
        sortOrder: vessel.sortOrder,
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching adventure yachts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch adventure yachts' },
      { status: 500 }
    );
  }
}
