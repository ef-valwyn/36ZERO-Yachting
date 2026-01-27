import { NextRequest, NextResponse } from 'next/server';
import { db } from '@36zero/database';
import { vessels } from '@36zero/database/schema';
import { desc, asc, sql, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/vessels
 * 
 * Fetches all visible vessels from the database.
 * Adventure yachts are always sorted first, followed by other vessels.
 * Only vessels with isVisible=true are returned.
 * 
 * Query parameters:
 * - sort: 'price-asc' | 'price-desc' | 'newest' | 'length' (default: 'newest')
 * - manufacturer: Filter by manufacturer name
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 * - minLength: Minimum length filter (meters)
 * - maxLength: Maximum length filter (meters)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get('sort') || 'newest';
    const manufacturer = searchParams.get('manufacturer');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minLength = searchParams.get('minLength');
    const maxLength = searchParams.get('maxLength');

    // Build the query with filters
    let query = db.select().from(vessels);

    // Apply filters using SQL conditions
    // Always filter by isVisible = true
    const conditions: ReturnType<typeof sql>[] = [
      sql`${vessels.isVisible} = true`
    ];
    
    if (manufacturer && manufacturer !== 'All') {
      conditions.push(sql`${vessels.manufacturer} = ${manufacturer}`);
    }
    
    if (minPrice) {
      conditions.push(sql`${vessels.price} >= ${parseFloat(minPrice)}`);
    }
    
    if (maxPrice && maxPrice !== 'Infinity') {
      conditions.push(sql`${vessels.price} <= ${parseFloat(maxPrice)}`);
    }
    
    if (minLength) {
      conditions.push(sql`${vessels.lengthMeters} >= ${parseFloat(minLength)}`);
    }
    
    if (maxLength && maxLength !== 'Infinity') {
      conditions.push(sql`${vessels.lengthMeters} <= ${parseFloat(maxLength)}`);
    }

    // Execute query with conditions (always includes isVisible = true)
    const allVessels = await db.query.vessels.findMany({
      where: sql`${sql.join(conditions, sql` AND `)}`,
    });

    // Sort results - Adventure yachts always first
    let sortedVessels = [...allVessels];
    
    // First, separate adventure yachts and regular vessels
    const adventureYachts = sortedVessels.filter(v => v.isAdventureYacht);
    const regularVessels = sortedVessels.filter(v => !v.isAdventureYacht);

    // Apply secondary sort based on sort parameter
    const sortFn = (a: typeof allVessels[0], b: typeof allVessels[0]) => {
      switch (sort) {
        case 'price-asc':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'newest':
          return b.year - a.year;
        case 'length':
          return parseFloat(b.lengthMeters) - parseFloat(a.lengthMeters);
        default:
          return b.year - a.year;
      }
    };

    // Sort each group
    adventureYachts.sort((a, b) => {
      // Adventure yachts sort by sortOrder first, then by the selected sort
      if (a.sortOrder !== b.sortOrder) {
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      }
      return sortFn(a, b);
    });
    
    regularVessels.sort(sortFn);

    // Combine with adventure yachts first
    sortedVessels = [...adventureYachts, ...regularVessels];

    // Transform for API response
    const response = sortedVessels.map(vessel => ({
      id: vessel.slug,
      name: vessel.name,
      slug: vessel.slug,
      manufacturer: vessel.manufacturer,
      model: vessel.model,
      year: vessel.year,
      price: parseFloat(vessel.price),
      currency: vessel.currency,
      length: parseFloat(vessel.lengthMeters),
      beam: vessel.beamMeters ? parseFloat(vessel.beamMeters) : null,
      draft: vessel.draftMeters ? parseFloat(vessel.draftMeters) : null,
      capacity: vessel.guestCapacity,
      cabins: vessel.cabins,
      maxSpeed: vessel.maxSpeed,
      cruisingSpeed: vessel.cruisingSpeed,
      range: vessel.range,
      imageUrl: vessel.featuredImageUrl || '/images/placeholder-yacht.jpg',
      galleryImages: vessel.galleryImages || [],
      status: vessel.status === 'under_contract' ? 'under-contract' : vessel.status,
      location: vessel.location,
      description: vessel.description,
      shortDescription: vessel.shortDescription,
      isFeatured: vessel.isFeatured,
      isAdventureYacht: vessel.isAdventureYacht,
      variant: vessel.variant,
      availabilityText: vessel.availabilityText,
      availabilityDate: vessel.availabilityDate,
      specs: vessel.specs,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching vessels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vessels' },
      { status: 500 }
    );
  }
}
