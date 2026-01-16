import { config } from 'dotenv';
import { resolve } from 'path';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../schema';

// Load .env.local from the root of the monorepo
config({ path: resolve(__dirname, '../../../.env.local') });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// =========================================
// SEED DATA: 4 PASSAGES & 13 STAGES
// Based on the 36ZERO LAP circumnavigation route
// =========================================

const passagesData = [
  {
    name: 'Passage 1: Pacific Dreams',
    slug: 'pacific-dreams',
    description: 'Begin your circumnavigation journey through the stunning South Pacific islands, from French Polynesia to Fiji.',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    startHub: 'Tahiti, French Polynesia',
    endHub: 'Fiji',
    pricePerPerson: '45000',
    maxGuests: 4,
    status: 'upcoming' as const,
    requiresOffshoreCompetency: false,
    metadata: {
      highlights: [
        'Bora Bora lagoon anchorage',
        'Traditional Polynesian villages',
        'World-class snorkeling in Moorea',
        'Crossing the International Date Line',
      ],
      included: [
        'All meals onboard',
        'Professional skipper and crew',
        'Water sports equipment',
        'Port fees and provisioning',
      ],
    },
  },
  {
    name: 'Passage 2: Coral Crossing',
    slug: 'coral-crossing',
    description: 'Navigate through Vanuatu and into the Coral Sea, experiencing remote island cultures and pristine diving sites.',
    startDate: '2025-07-15',
    endDate: '2025-09-30',
    startHub: 'Fiji',
    endHub: 'Cairns, Australia',
    pricePerPerson: '52000',
    maxGuests: 4,
    status: 'upcoming' as const,
    requiresOffshoreCompetency: true,
    metadata: {
      highlights: [
        'Vanuatu volcano trekking',
        'Great Barrier Reef diving',
        'Indigenous cultural experiences',
        'Blue hole exploration',
      ],
      requirements: [
        'Valid offshore sailing certification',
        'Minimum 1000nm offshore experience',
      ],
    },
  },
  {
    name: 'Passage 3: Indian Ocean Odyssey',
    slug: 'indian-ocean-odyssey',
    description: 'Cross the vast Indian Ocean, visiting Indonesia, the Maldives, and arriving in the Red Sea gateway.',
    startDate: '2025-10-15',
    endDate: '2026-02-28',
    startHub: 'Cairns, Australia',
    endHub: 'Djibouti',
    pricePerPerson: '68000',
    maxGuests: 4,
    status: 'upcoming' as const,
    requiresOffshoreCompetency: true,
    metadata: {
      highlights: [
        'Komodo dragon encounters',
        'Maldives atoll hopping',
        'Chagos Archipelago',
        'Crossing the Equator ceremony',
      ],
      requirements: [
        'Valid offshore sailing certification',
        'Medical clearance for extended passages',
      ],
    },
  },
  {
    name: 'Passage 4: Atlantic Return',
    slug: 'atlantic-return',
    description: 'Complete the circumnavigation through the Mediterranean, across the Atlantic, and back to the Caribbean.',
    startDate: '2026-04-01',
    endDate: '2026-08-31',
    startHub: 'Djibouti',
    endHub: 'Antigua',
    pricePerPerson: '72000',
    maxGuests: 4,
    status: 'upcoming' as const,
    requiresOffshoreCompetency: true,
    metadata: {
      highlights: [
        'Red Sea passage',
        'Suez Canal transit',
        'Mediterranean highlights',
        'Atlantic crossing',
        'Circumnavigation completion ceremony',
      ],
    },
  },
];

const stagesData = [
  // Passage 1 Stages
  {
    passageSlug: 'pacific-dreams',
    stageNumber: 1,
    routeName: 'Tahiti to Moorea',
    startLocation: 'Papeete, Tahiti',
    endLocation: 'Moorea',
    arrivalDate: '2025-04-01',
    departureDate: '2025-04-05',
    distanceNm: 17,
    estimatedDays: 1,
    crewRequirement: 2,
    coordinates: {
      start: [-149.5585, -17.5516],
      end: [-149.8366, -17.5388],
    },
    logisticsNotes: {
      flightHub: 'Tahiti PPT (Faaa International)',
      transfer: 'Yacht pickup at Marina Taina',
      notes: 'Customs clearance required on arrival',
    },
  },
  {
    passageSlug: 'pacific-dreams',
    stageNumber: 2,
    routeName: 'Moorea to Bora Bora',
    startLocation: 'Moorea',
    endLocation: 'Bora Bora',
    arrivalDate: '2025-04-10',
    departureDate: '2025-04-18',
    distanceNm: 156,
    estimatedDays: 2,
    crewRequirement: 2,
    coordinates: {
      start: [-149.8366, -17.5388],
      end: [-151.7415, -16.5004],
    },
    logisticsNotes: {
      notes: 'Stopover possible at Huahine or Raiatea',
    },
  },
  {
    passageSlug: 'pacific-dreams',
    stageNumber: 3,
    routeName: 'Bora Bora to Fiji',
    startLocation: 'Bora Bora',
    endLocation: 'Suva, Fiji',
    arrivalDate: '2025-06-25',
    departureDate: '2025-06-30',
    distanceNm: 1800,
    estimatedDays: 14,
    crewRequirement: 3,
    coordinates: {
      start: [-151.7415, -16.5004],
      end: [178.4419, -18.1416],
    },
    logisticsNotes: {
      flightHub: 'Fiji SUV (Nausori International)',
      notes: 'International Date Line crossing',
    },
  },
  // Passage 2 Stages
  {
    passageSlug: 'coral-crossing',
    stageNumber: 4,
    routeName: 'Fiji to Vanuatu',
    startLocation: 'Suva, Fiji',
    endLocation: 'Port Vila, Vanuatu',
    arrivalDate: '2025-07-20',
    departureDate: '2025-07-28',
    distanceNm: 580,
    estimatedDays: 5,
    crewRequirement: 3,
    coordinates: {
      start: [178.4419, -18.1416],
      end: [168.3220, -17.7340],
    },
    logisticsNotes: {
      flightHub: 'Vanuatu VLI (Bauerfield International)',
      visaRequired: false,
    },
  },
  {
    passageSlug: 'coral-crossing',
    stageNumber: 5,
    routeName: 'Vanuatu to Cairns',
    startLocation: 'Port Vila, Vanuatu',
    endLocation: 'Cairns, Australia',
    arrivalDate: '2025-09-25',
    departureDate: '2025-09-30',
    distanceNm: 1100,
    estimatedDays: 10,
    crewRequirement: 3,
    coordinates: {
      start: [168.3220, -17.7340],
      end: [145.7781, -16.9186],
    },
    logisticsNotes: {
      flightHub: 'Cairns CNS',
      notes: 'Australian customs pre-arrival clearance required',
      visaRequired: true,
    },
  },
  // Passage 3 Stages
  {
    passageSlug: 'indian-ocean-odyssey',
    stageNumber: 6,
    routeName: 'Cairns to Lombok',
    startLocation: 'Cairns, Australia',
    endLocation: 'Lombok, Indonesia',
    arrivalDate: '2025-10-25',
    departureDate: '2025-11-02',
    distanceNm: 1450,
    estimatedDays: 12,
    crewRequirement: 3,
    coordinates: {
      start: [145.7781, -16.9186],
      end: [116.3249, -8.5852],
    },
    logisticsNotes: {
      flightHub: 'Bali DPS + 20min boat to Lombok',
      transfer: 'Domestic hop from DPS',
      visaRequired: true,
    },
  },
  {
    passageSlug: 'indian-ocean-odyssey',
    stageNumber: 7,
    routeName: 'Lombok to Maldives',
    startLocation: 'Lombok, Indonesia',
    endLocation: 'Male, Maldives',
    arrivalDate: '2025-12-15',
    departureDate: '2025-12-28',
    distanceNm: 2200,
    estimatedDays: 18,
    crewRequirement: 4,
    coordinates: {
      start: [116.3249, -8.5852],
      end: [73.5093, 4.1755],
    },
    logisticsNotes: {
      flightHub: 'Male MLE (Velana International)',
      notes: 'Chagos permit required for stopover',
    },
  },
  {
    passageSlug: 'indian-ocean-odyssey',
    stageNumber: 8,
    routeName: 'Maldives to Djibouti',
    startLocation: 'Male, Maldives',
    endLocation: 'Djibouti City',
    arrivalDate: '2026-02-20',
    departureDate: '2026-02-28',
    distanceNm: 1800,
    estimatedDays: 15,
    crewRequirement: 4,
    coordinates: {
      start: [73.5093, 4.1755],
      end: [43.1456, 11.5886],
    },
    logisticsNotes: {
      flightHub: 'Djibouti JIB (Djibouti–Ambouli)',
      notes: 'Security briefing required for Gulf of Aden transit',
      visaRequired: true,
    },
  },
  // Passage 4 Stages
  {
    passageSlug: 'atlantic-return',
    stageNumber: 9,
    routeName: 'Djibouti to Suez',
    startLocation: 'Djibouti City',
    endLocation: 'Port Said, Egypt',
    arrivalDate: '2026-04-15',
    departureDate: '2026-04-20',
    distanceNm: 1300,
    estimatedDays: 12,
    crewRequirement: 4,
    coordinates: {
      start: [43.1456, 11.5886],
      end: [32.3019, 31.2653],
    },
    logisticsNotes: {
      notes: 'Suez Canal transit - agent required',
      visaRequired: true,
    },
  },
  {
    passageSlug: 'atlantic-return',
    stageNumber: 10,
    routeName: 'Mediterranean Transit',
    startLocation: 'Port Said, Egypt',
    endLocation: 'Gibraltar',
    arrivalDate: '2026-05-25',
    departureDate: '2026-06-05',
    distanceNm: 1950,
    estimatedDays: 16,
    crewRequirement: 3,
    coordinates: {
      start: [32.3019, 31.2653],
      end: [-5.3536, 36.1408],
    },
    logisticsNotes: {
      flightHub: 'Gibraltar GIB or Malaga AGP',
      notes: 'Optional stops: Malta, Sicily, Sardinia',
    },
  },
  {
    passageSlug: 'atlantic-return',
    stageNumber: 11,
    routeName: 'Gibraltar to Canaries',
    startLocation: 'Gibraltar',
    endLocation: 'Las Palmas, Gran Canaria',
    arrivalDate: '2026-06-15',
    departureDate: '2026-06-22',
    distanceNm: 650,
    estimatedDays: 5,
    crewRequirement: 3,
    coordinates: {
      start: [-5.3536, 36.1408],
      end: [-15.4134, 28.1235],
    },
    logisticsNotes: {
      flightHub: 'Las Palmas LPA (Gran Canaria Airport)',
    },
  },
  {
    passageSlug: 'atlantic-return',
    stageNumber: 12,
    routeName: 'Atlantic Crossing',
    startLocation: 'Las Palmas, Gran Canaria',
    endLocation: 'Barbados',
    arrivalDate: '2026-07-20',
    departureDate: '2026-07-28',
    distanceNm: 2700,
    estimatedDays: 21,
    crewRequirement: 4,
    coordinates: {
      start: [-15.4134, 28.1235],
      end: [-59.5432, 13.1939],
    },
    logisticsNotes: {
      flightHub: 'Barbados BGI (Grantley Adams)',
      notes: 'Cape Verde optional stopover',
    },
  },
  {
    passageSlug: 'atlantic-return',
    stageNumber: 13,
    routeName: 'Final Leg to Antigua',
    startLocation: 'Barbados',
    endLocation: 'English Harbour, Antigua',
    arrivalDate: '2026-08-25',
    departureDate: '2026-08-31',
    distanceNm: 180,
    estimatedDays: 2,
    crewRequirement: 3,
    coordinates: {
      start: [-59.5432, 13.1939],
      end: [-61.7648, 17.0078],
    },
    logisticsNotes: {
      flightHub: 'Antigua ANU (V.C. Bird International)',
      notes: 'Circumnavigation completion ceremony at Nelsons Dockyard',
    },
  },
];

// Sample vessels for brokerage
const vesselsData = [
  {
    name: 'Azure Horizon',
    slug: 'azure-horizon',
    manufacturer: 'Adventure Yachts',
    model: 'AY60',
    year: 2023,
    lengthMeters: '18.29',
    beamMeters: '5.20',
    draftMeters: '2.10',
    maxSpeed: 12,
    cruisingSpeed: 9,
    fuelCapacity: 2000,
    waterCapacity: 800,
    range: 3000,
    guestCapacity: 8,
    cabins: 4,
    crewCapacity: 2,
    price: '1850000',
    currency: 'EUR',
    status: 'available' as const,
    location: 'Palma de Mallorca, Spain',
    description: 'The Adventure Yachts AY60 represents the pinnacle of expedition sailing yacht design. Built for serious ocean passages while maintaining luxurious comfort.',
    shortDescription: 'Premium expedition sailing yacht ready for circumnavigation',
    isFeatured: true,
    isAdventureYacht: true,
    specs: {
      engines: 'Twin Volvo D4 150hp',
      generator: 'Fischer Panda 8kW',
      stabilizers: true,
      airConditioning: true,
      watermaker: true,
      tenders: ['Williams 395 Sportjet'],
      toys: ['2x Seabobs', 'Paddleboards', 'Snorkeling gear'],
      navigation: ['Raymarine Axiom Pro', 'AIS', 'Satellite comms'],
    },
  },
  {
    name: 'Southern Cross',
    slug: 'southern-cross',
    manufacturer: 'Adventure Yachts',
    model: 'AY52',
    year: 2022,
    lengthMeters: '15.85',
    beamMeters: '4.60',
    draftMeters: '2.00',
    maxSpeed: 10,
    cruisingSpeed: 8,
    fuelCapacity: 1200,
    waterCapacity: 600,
    range: 2500,
    guestCapacity: 6,
    cabins: 3,
    crewCapacity: 1,
    price: '1250000',
    currency: 'EUR',
    status: 'available' as const,
    location: 'Antibes, France',
    description: 'A capable bluewater cruiser perfect for couples or small families seeking adventure.',
    shortDescription: 'Versatile expedition yacht for extended cruising',
    isFeatured: false,
    isAdventureYacht: true,
    specs: {
      engines: 'Volvo D3 110hp',
      watermaker: true,
      navigation: ['B&G Zeus', 'AIS'],
    },
  },
  {
    name: 'Windward Spirit',
    slug: 'windward-spirit',
    manufacturer: 'Oyster',
    model: '565',
    year: 2021,
    lengthMeters: '17.00',
    beamMeters: '5.00',
    draftMeters: '2.45',
    maxSpeed: 11,
    cruisingSpeed: 8,
    fuelCapacity: 1000,
    waterCapacity: 750,
    range: 2200,
    guestCapacity: 6,
    cabins: 3,
    crewCapacity: 2,
    price: '1650000',
    currency: 'GBP',
    status: 'under_contract' as const,
    location: 'Southampton, UK',
    description: 'Classic British craftsmanship meets modern sailing technology.',
    shortDescription: 'British built bluewater sailing yacht',
    isFeatured: false,
    isAdventureYacht: false,
  },
];

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Seed Passages
    console.log('📦 Seeding passages...');
    for (const passageData of passagesData) {
      await db.insert(schema.passages).values(passageData).onConflictDoNothing();
      console.log(`  ✓ ${passageData.name}`);
    }

    // Get passage IDs for stages
    const passages = await db.query.passages.findMany();
    const passageMap = new Map(passages.map(p => [p.slug, p.id]));

    // Seed Stages
    console.log('\n📍 Seeding stages...');
    for (const stageData of stagesData) {
      const passageId = passageMap.get(stageData.passageSlug);
      if (!passageId) {
        console.log(`  ⚠ Skipping stage: passage not found for ${stageData.passageSlug}`);
        continue;
      }
      
      const { passageSlug, ...stageWithoutSlug } = stageData;
      await db.insert(schema.stages).values({
        ...stageWithoutSlug,
        passageId,
      }).onConflictDoNothing();
      console.log(`  ✓ Stage ${stageData.stageNumber}: ${stageData.routeName}`);
    }

    // Seed Vessels
    console.log('\n🚢 Seeding vessels...');
    for (const vesselData of vesselsData) {
      await db.insert(schema.vessels).values(vesselData).onConflictDoNothing();
      console.log(`  ✓ ${vesselData.name}`);
    }

    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seed();
