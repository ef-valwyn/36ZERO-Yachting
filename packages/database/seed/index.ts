import { config } from 'dotenv';
import { resolve } from 'path';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../schema';
import { adventureYachtPricingBySlug } from '../adventureYachtPricing';

// Load .env.local from the root of the monorepo
config({ path: resolve(__dirname, '../../../.env.local') });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// =========================================
// SEED DATA: 4 PASSAGES & 16 STAGES
// Based on the 36ZERO LAP circumnavigation route (2027-2028)
// =========================================

const passagesData = [
  {
    name: 'Passage 1: The Pacific Gateway',
    slug: 'the-pacific-gateway',
    description: 'Saint Lucia to Bora Bora via Galapagos and Marquesas. Pacific trade winds to French Polynesia.',
    startDate: '2027-01-09',
    endDate: '2027-05-08',
    startHub: 'Saint Lucia',
    endHub: 'Bora Bora, French Polynesia',
    pricePerPerson: '45000',
    maxGuests: 8,
    status: 'upcoming' as const,
    requiresOffshoreCompetency: false,
    metadata: {
      highlights: [
        'Panama Canal transit',
        'Galápagos Islands stopover',
        'Marquesas Islands exploration',
        'Bora Bora lagoon anchorage',
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
    description: 'Bora Bora to Lombok via Tonga and Australia. South Pacific islands to Indonesia.',
    startDate: '2027-05-11',
    endDate: '2027-09-14',
    startHub: 'Bora Bora, French Polynesia',
    endHub: 'Lombok, Indonesia',
    pricePerPerson: '52000',
    maxGuests: 8,
    status: 'upcoming' as const,
    requiresOffshoreCompetency: true,
    metadata: {
      highlights: [
        'Kingdom of Tonga',
        'Date Line crossing',
        'Great Barrier Reef region',
        'Indonesian archipelago',
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
    description: 'Lombok to Cape Town via Cocos Islands and Réunion. Indian Ocean crossing to South Africa.',
    startDate: '2027-09-18',
    endDate: '2027-12-15',
    startHub: 'Lombok, Indonesia',
    endHub: 'Cape Town, South Africa',
    pricePerPerson: '68000',
    maxGuests: 8,
    status: 'upcoming' as const,
    requiresOffshoreCompetency: true,
    metadata: {
      highlights: [
        'Cocos (Keeling) Islands',
        'Réunion Island',
        'South African coast',
        'Cape of Good Hope',
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
    description: 'Cape Town to Saint Lucia via Recife and Grenada. South Atlantic tradewind crossing.',
    startDate: '2028-01-16',
    endDate: '2028-04-15',
    startHub: 'Cape Town, South Africa',
    endHub: 'Saint Lucia',
    pricePerPerson: '72000',
    maxGuests: 8,
    status: 'upcoming' as const,
    requiresOffshoreCompetency: true,
    metadata: {
      highlights: [
        'South Atlantic crossing',
        'Recife, Brazil',
        'Caribbean arrival via Grenada',
        'Circumnavigation completion ceremony',
      ],
    },
  },
];

const stagesData = [
  // Passage 1: The Pacific Gateway (Saint Lucia to Bora Bora)
  {
    passageSlug: 'the-pacific-gateway',
    stageNumber: 1,
    routeName: 'Saint Lucia Start',
    startLocation: 'Saint Lucia',
    endLocation: 'Saint Lucia',
    arrivalDate: '2027-01-09',
    departureDate: '2027-01-09',
    distanceNm: 0,
    estimatedDays: 0,
    crewRequirement: 2,
    coordinates: {
      start: [-61.0, 14.0] as [number, number],
      end: [-61.0, 14.0] as [number, number],
    },
    logisticsNotes: {
      flightHub: 'Hewanorra UVF',
      notes: 'Circumnavigation start',
    },
  },
  {
    passageSlug: 'the-pacific-gateway',
    stageNumber: 2,
    routeName: 'Saint Lucia to Panama Canal',
    startLocation: 'Saint Lucia',
    endLocation: 'Panama Canal',
    arrivalDate: '2027-01-25',
    distanceNm: 1100,
    estimatedDays: 16,
    crewRequirement: 3,
    coordinates: {
      start: [-61.0, 14.0] as [number, number],
      end: [-79.5, 9.1] as [number, number],
    },
    logisticsNotes: {
      notes: 'Canal transit - Atlantic to Pacific',
    },
  },
  {
    passageSlug: 'the-pacific-gateway',
    stageNumber: 3,
    routeName: 'Panama to Galápagos',
    startLocation: 'Panama Canal',
    endLocation: 'Galápagos Islands',
    arrivalDate: '2027-03-02',
    departureDate: '2027-03-03',
    distanceNm: 1000,
    estimatedDays: 10,
    crewRequirement: 3,
    coordinates: {
      start: [-79.5, 9.1] as [number, number],
      end: [-90.4, -0.6] as [number, number],
    },
    logisticsNotes: {
      flightHub: 'Baltra GPS',
      notes: 'Ecuador territory',
    },
  },
  {
    passageSlug: 'the-pacific-gateway',
    stageNumber: 4,
    routeName: 'Galápagos to Marquesas',
    startLocation: 'Galápagos Islands',
    endLocation: 'Marquesas Islands',
    arrivalDate: '2027-03-31',
    departureDate: '2027-04-01',
    distanceNm: 3000,
    estimatedDays: 21,
    crewRequirement: 3,
    coordinates: {
      start: [-90.4, -0.6] as [number, number],
      end: [-140.1, -8.9] as [number, number],
    },
    logisticsNotes: {
      flightHub: 'Nuku Hiva NHV',
      notes: 'French Polynesia',
    },
  },
  {
    passageSlug: 'the-pacific-gateway',
    stageNumber: 5,
    routeName: 'Marquesas to Bora Bora',
    startLocation: 'Marquesas Islands',
    endLocation: 'Bora Bora',
    arrivalDate: '2027-05-08',
    departureDate: '2027-05-11',
    distanceNm: 1000,
    estimatedDays: 10,
    crewRequirement: 3,
    coordinates: {
      start: [-140.1, -8.9] as [number, number],
      end: [-151.8, -16.5] as [number, number],
    },
    logisticsNotes: {
      flightHub: 'Bora Bora BOB via Tahiti PPT',
    },
  },
  // Passage 2: Coral Crossing (Bora Bora to Lombok)
  {
    passageSlug: 'coral-crossing',
    stageNumber: 6,
    routeName: 'Bora Bora to Tonga',
    startLocation: 'Bora Bora',
    endLocation: 'Tonga',
    arrivalDate: '2027-05-29',
    departureDate: '2027-06-09',
    distanceNm: 1300,
    estimatedDays: 18,
    crewRequirement: 3,
    coordinates: {
      start: [-151.8, -16.5] as [number, number],
      end: [-174.0, -18.6] as [number, number],
    },
    logisticsNotes: {
      flightHub: 'Tongatapu TBU',
      notes: 'Kingdom of Tonga',
    },
  },
  {
    passageSlug: 'coral-crossing',
    stageNumber: 7,
    routeName: 'Tonga to Fiji',
    startLocation: 'Tonga',
    endLocation: 'Fiji',
    arrivalDate: '2027-06-21',
    distanceNm: 450,
    estimatedDays: 5,
    crewRequirement: 3,
    coordinates: {
      start: [-174.0, -18.6] as [number, number],
      end: [178.0, -18.0] as [number, number],
    },
    logisticsNotes: {
      notes: 'Date Line crossing',
    },
  },
  {
    passageSlug: 'coral-crossing',
    stageNumber: 8,
    routeName: 'Fiji to Mackay',
    startLocation: 'Fiji',
    endLocation: 'Mackay, Australia',
    arrivalDate: '2027-07-21',
    departureDate: '2027-07-22',
    distanceNm: 1450,
    estimatedDays: 14,
    crewRequirement: 3,
    coordinates: {
      start: [178.0, -18.0] as [number, number],
      end: [149.2, -21.1] as [number, number],
    },
    logisticsNotes: {
      flightHub: 'Mackay MKY',
      notes: 'Great Barrier Reef region',
      visaRequired: true,
    },
  },
  {
    passageSlug: 'coral-crossing',
    stageNumber: 9,
    routeName: 'Mackay to Lombok',
    startLocation: 'Mackay, Australia',
    endLocation: 'Lombok, Indonesia',
    arrivalDate: '2027-09-14',
    departureDate: '2027-09-18',
    distanceNm: 2400,
    estimatedDays: 21,
    crewRequirement: 4,
    coordinates: {
      start: [149.2, -21.1] as [number, number],
      end: [116.1, -8.6] as [number, number],
    },
    logisticsNotes: {
      flightHub: 'Bali DPS + ferry',
      transfer: '2hr ferry from Bali',
      visaRequired: true,
    },
  },
  // Passage 3: Indian Ocean Odyssey (Lombok to Cape Town)
  {
    passageSlug: 'indian-ocean-odyssey',
    stageNumber: 10,
    routeName: 'Lombok to Cocos (Keeling) Islands',
    startLocation: 'Lombok, Indonesia',
    endLocation: 'Cocos (Keeling) Islands',
    arrivalDate: '2027-09-30',
    departureDate: '2027-10-04',
    distanceNm: 1150,
    estimatedDays: 12,
    crewRequirement: 3,
    coordinates: {
      start: [116.1, -8.6] as [number, number],
      end: [96.8, -12.1] as [number, number],
    },
    logisticsNotes: {
      flightHub: 'Cocos CCK via Perth',
      notes: 'Australian territory',
    },
  },
  {
    passageSlug: 'indian-ocean-odyssey',
    stageNumber: 11,
    routeName: 'Cocos to Réunion',
    startLocation: 'Cocos (Keeling) Islands',
    endLocation: 'Réunion',
    arrivalDate: '2027-10-27',
    departureDate: '2027-11-03',
    distanceNm: 2500,
    estimatedDays: 20,
    crewRequirement: 4,
    coordinates: {
      start: [96.8, -12.1] as [number, number],
      end: [55.3, -20.9] as [number, number],
    },
    logisticsNotes: {
      flightHub: 'Roland Garros RUN',
      notes: 'French territory',
    },
  },
  {
    passageSlug: 'indian-ocean-odyssey',
    stageNumber: 12,
    routeName: 'Réunion to Richards Bay',
    startLocation: 'Réunion',
    endLocation: 'Richards Bay, South Africa',
    arrivalDate: '2027-11-14',
    departureDate: '2027-11-15',
    distanceNm: 1370,
    estimatedDays: 11,
    crewRequirement: 3,
    coordinates: {
      start: [55.3, -20.9] as [number, number],
      end: [32.1, -28.8] as [number, number],
    },
    logisticsNotes: {
      flightHub: 'Richards Bay RCB',
      notes: 'South Africa',
    },
  },
  {
    passageSlug: 'indian-ocean-odyssey',
    stageNumber: 13,
    routeName: 'Richards Bay to Cape Town',
    startLocation: 'Richards Bay, South Africa',
    endLocation: 'Cape Town, South Africa',
    arrivalDate: '2027-12-15',
    departureDate: '2028-01-16',
    distanceNm: 720,
    estimatedDays: 7,
    crewRequirement: 3,
    coordinates: {
      start: [32.1, -28.8] as [number, number],
      end: [18.4, -33.9] as [number, number],
    },
    logisticsNotes: {
      flightHub: 'Cape Town CPT',
      notes: 'Cape of Good Hope',
    },
  },
  // Passage 4: Atlantic Return (Cape Town to Saint Lucia)
  {
    passageSlug: 'atlantic-return',
    stageNumber: 14,
    routeName: 'Cape Town to Recife',
    startLocation: 'Cape Town, South Africa',
    endLocation: 'Recife, Brazil',
    arrivalDate: '2028-02-13',
    departureDate: '2028-03-02',
    distanceNm: 3000,
    estimatedDays: 28,
    crewRequirement: 4,
    coordinates: {
      start: [18.4, -33.9] as [number, number],
      end: [-34.9, -8.1] as [number, number],
    },
    logisticsNotes: {
      flightHub: 'Recife REC',
      notes: 'South Atlantic crossing',
    },
  },
  {
    passageSlug: 'atlantic-return',
    stageNumber: 15,
    routeName: 'Recife to Grenada',
    startLocation: 'Recife, Brazil',
    endLocation: 'Grenada',
    arrivalDate: '2028-03-23',
    departureDate: '2028-03-24',
    distanceNm: 2300,
    estimatedDays: 21,
    crewRequirement: 4,
    coordinates: {
      start: [-34.9, -8.1] as [number, number],
      end: [-61.8, 12.1] as [number, number],
    },
    logisticsNotes: {
      flightHub: 'Maurice Bishop GND',
      notes: 'Caribbean arrival',
    },
  },
  {
    passageSlug: 'atlantic-return',
    stageNumber: 16,
    routeName: 'Grenada to Saint Lucia',
    startLocation: 'Grenada',
    endLocation: 'Saint Lucia',
    arrivalDate: '2028-04-15',
    distanceNm: 700,
    estimatedDays: 5,
    crewRequirement: 3,
    coordinates: {
      start: [-61.8, 12.1] as [number, number],
      end: [-61.0, 14.0] as [number, number],
    },
    logisticsNotes: {
      flightHub: 'Hewanorra UVF',
      notes: 'Circumnavigation complete!',
    },
  },
];

// Sample vessels for brokerage - Unified CMS data
// Adventure Yachts are shown first on brokerage page and exclusively on adventure-yachts page
const vesselsData = [
  // =========================================
  // ADVENTURE YACHTS (isAdventureYacht: true)
  // These appear on both brokerage and adventure-yachts pages
  // =========================================
  {
    name: 'Adventure One',
    slug: 'adventure-one',
    manufacturer: 'Adventure Yachts',
    model: 'AY60 Sport',
    year: 2026,
    lengthMeters: '18.29',
    beamMeters: '7.90',
    draftMeters: '1.30',
    grossTonnage: 28000,
    maxSpeed: 18,
    cruisingSpeed: 24,
    fuelCapacity: 3000,
    waterCapacity: 800,
    range: 400,
    guestCapacity: 8,
    cabins: 4,
    crewCapacity: 2,
    price: '3245000',
    currency: 'USD',
    status: 'available' as const,
    location: 'Phuket, Thailand',
    description: 'The flagship AY60 Sport with dual outboard configuration for maximum performance and efficiency. This revolutionary 60-foot power catamaran is designed for those who demand performance, luxury, and adventure without compromise.',
    shortDescription: 'The flagship AY60 Sport with dual outboard configuration',
    featuredImageUrl: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/AY60-Hero.png',
    galleryImages: [
      'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/AY60-Hero.png',
      'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1200&q=80',
      'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&q=80',
    ],
    isFeatured: true,
    isVisible: true,
    isAdventureYacht: true,
    variant: 'Outboard Version',
    availabilityText: 'Available Now',
    availabilityDate: null,
    sortOrder: 1,
    specs: {
      pricing: adventureYachtPricingBySlug['adventure-one'],
      engines: 'Triple Mercury V12 600hp Outboards',
      generator: 'Fischer Panda 12kW',
      stabilizers: true,
      airConditioning: true,
      watermaker: true,
      tenders: ['Williams 395 Sportjet'],
      toys: ['2x Seabobs', 'Paddleboards', 'Snorkeling gear', 'Kayaks'],
      navigation: ['Raymarine Axiom Pro 16"', 'AIS Class B', 'Satellite comms', 'Starlink'],
      entertainment: ['Fusion Apollo sound system', '55" salon TV', 'Cockpit speakers'],
      safety: ['EPIRB', 'Life raft 12 person', 'MOB system', 'Fire suppression'],
    },
  },
  {
    name: 'Adventure Two',
    slug: 'adventure-two',
    manufacturer: 'Adventure Yachts',
    model: 'AY60 Flybridge',
    year: 2026,
    lengthMeters: '18.29',
    beamMeters: '7.90',
    draftMeters: '1.40',
    grossTonnage: 30000,
    maxSpeed: 14,
    cruisingSpeed: 22,
    fuelCapacity: 4000,
    waterCapacity: 1000,
    range: 600,
    guestCapacity: 8,
    cabins: 4,
    crewCapacity: 2,
    price: '3150000',
    currency: 'USD',
    status: 'reserved' as const,
    location: 'Phuket, Thailand',
    description: 'The luxurious flybridge variant with hybrid inboard propulsion for extended range and comfort. Features an expansive flybridge deck perfect for entertaining and long-range cruising.',
    shortDescription: 'Luxurious flybridge variant with hybrid inboard propulsion',
    featuredImageUrl: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-two/Adventure%20Two%20AY60F.png',
    galleryImages: [
      'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-two/Adventure%20Two%20AY60F.png',
      'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-two/Adventure%20Two%20AY60F%202.png',
    ],
    isFeatured: false,
    isVisible: true,
    isAdventureYacht: true,
    variant: 'Hybrid Inboard Version',
    availabilityText: 'Q2 2026',
    availabilityDate: '2026-04-01',
    sortOrder: 2,
    specs: {
      pricing: adventureYachtPricingBySlug['adventure-two'],
      engines: 'Twin Volvo D6 440hp + Electric Hybrid',
      generator: 'Fischer Panda 15kW',
      stabilizers: true,
      airConditioning: true,
      watermaker: true,
      tenders: ['Williams 435 Turbojet'],
      toys: ['2x Seabobs', 'Paddleboards', 'Snorkeling gear', 'E-foil'],
      navigation: ['Raymarine Axiom Pro 16"', 'AIS Class A', 'Satellite comms', 'Starlink'],
    },
  },
  {
    name: 'Adventure Three',
    slug: 'adventure-three',
    manufacturer: 'Adventure Yachts',
    model: 'AY60 Sport',
    year: 2026,
    lengthMeters: '18.29',
    beamMeters: '7.90',
    draftMeters: '1.30',
    grossTonnage: 28000,
    maxSpeed: 18,
    cruisingSpeed: 24,
    fuelCapacity: 3000,
    waterCapacity: 800,
    range: 400,
    guestCapacity: 8,
    cabins: 4,
    crewCapacity: 2,
    price: '2850000',
    currency: 'USD',
    status: 'reserved' as const,
    location: 'Phuket, Thailand',
    description: 'Another stunning AY60 Sport ready for customization to your exact specifications. Work with our design team to create your perfect ocean-going vessel.',
    shortDescription: 'AY60 Sport ready for full customization',
    featuredImageUrl: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/side.jpeg',
    galleryImages: [
      'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/side.jpeg',
    ],
    isFeatured: false,
    isVisible: true,
    isAdventureYacht: true,
    variant: 'Outboard Version',
    availabilityText: 'Q2 2026',
    availabilityDate: '2026-04-01',
    sortOrder: 3,
    specs: {
      pricing: adventureYachtPricingBySlug['adventure-three'],
      engines: 'Triple Mercury V12 600hp Outboards',
      generator: 'Fischer Panda 12kW',
      stabilizers: true,
      airConditioning: true,
      watermaker: true,
    },
  },
  {
    name: 'Adventure Four',
    slug: 'adventure-four',
    manufacturer: 'Adventure Yachts',
    model: 'AY60 Sport',
    year: 2026,
    lengthMeters: '18.29',
    beamMeters: '7.90',
    draftMeters: '1.30',
    grossTonnage: 28000,
    maxSpeed: 18,
    cruisingSpeed: 22,
    fuelCapacity: 4500,
    waterCapacity: 1200,
    range: 650,
    guestCapacity: 8,
    cabins: 4,
    crewCapacity: 2,
    price: '3245000',
    currency: 'USD',
    status: 'reserved' as const,
    location: 'Phuket, Thailand',
    description: 'Extended fuel capacity and range optimization for serious ocean passages. The Long-Range variant sacrifices some guest capacity for additional tankage and provisions storage.',
    shortDescription: 'Long-range variant for serious ocean passages',
    featuredImageUrl: 'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/portthreequarter.jpeg',
    galleryImages: [
      'https://yyofqqbn0jyxo9dg.public.blob.vercel-storage.com/yachts/adventure-one/portthreequarter.jpeg',
    ],
    isFeatured: false,
    isVisible: true,
    isAdventureYacht: true,
    variant: 'Long-Range Outboard Version',
    availabilityText: 'Q4 2026',
    availabilityDate: '2026-10-01',
    sortOrder: 4,
    specs: {
      pricing: adventureYachtPricingBySlug['adventure-four'],
      engines: 'Triple Mercury V12 600hp Outboards',
      generator: 'Fischer Panda 15kW',
      stabilizers: true,
      airConditioning: true,
      watermaker: true,
      tenders: ['Williams 395 Sportjet'],
    },
  },
  
  // =========================================
  // REGULAR BROKERAGE VESSELS (isAdventureYacht: false)
  // Currently hidden (isVisible: false) - set to true when ready to display
  // =========================================
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
    description: 'A capable bluewater cruiser perfect for couples or small families seeking adventure. Well-maintained with recent refit.',
    shortDescription: 'Versatile expedition yacht for extended cruising',
    featuredImageUrl: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&q=80',
    isFeatured: false,
    isVisible: false, // Hidden from public listings
    isAdventureYacht: false,
    variant: null,
    availabilityText: null,
    availabilityDate: null,
    sortOrder: 0,
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
    description: 'Classic British craftsmanship meets modern sailing technology. This Oyster 565 has been meticulously maintained and is ready for her next adventure.',
    shortDescription: 'British built bluewater sailing yacht',
    featuredImageUrl: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&q=80',
    isFeatured: false,
    isVisible: false, // Hidden from public listings
    isAdventureYacht: false,
    variant: null,
    availabilityText: null,
    availabilityDate: null,
    sortOrder: 0,
    specs: {
      engines: 'Yanmar 4JH110',
      generator: 'Onan 9kW',
      airConditioning: true,
      watermaker: true,
      navigation: ['B&G Zeus3', 'AIS', 'Radar'],
    },
  },
  {
    name: 'Ocean Pioneer',
    slug: 'ocean-pioneer',
    manufacturer: 'Hallberg-Rassy',
    model: '57',
    year: 2020,
    lengthMeters: '17.32',
    beamMeters: '4.98',
    draftMeters: '2.35',
    maxSpeed: 9,
    cruisingSpeed: 7,
    fuelCapacity: 900,
    waterCapacity: 700,
    range: 1800,
    guestCapacity: 6,
    cabins: 3,
    crewCapacity: 0,
    price: '980000',
    currency: 'EUR',
    status: 'available' as const,
    location: 'Gothenburg, Sweden',
    description: 'The Hallberg-Rassy 57 is the epitome of Scandinavian sailing yacht design. Built for comfort and safety in all conditions.',
    shortDescription: 'Scandinavian excellence in bluewater sailing',
    featuredImageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    isFeatured: false,
    isVisible: false, // Hidden from public listings
    isAdventureYacht: false,
    variant: null,
    availabilityText: null,
    availabilityDate: null,
    sortOrder: 0,
    specs: {
      engines: 'Volvo D3-150',
      generator: 'Fischer Panda 8kW',
      airConditioning: true,
      watermaker: true,
      navigation: ['Raymarine', 'AIS', 'Radar'],
    },
  },
  {
    name: 'Blue Moon',
    slug: 'blue-moon',
    manufacturer: 'Swan',
    model: '65',
    year: 2019,
    lengthMeters: '19.81',
    beamMeters: '5.45',
    draftMeters: '3.20',
    maxSpeed: 12,
    cruisingSpeed: 9,
    fuelCapacity: 1500,
    waterCapacity: 900,
    range: 2000,
    guestCapacity: 8,
    cabins: 4,
    crewCapacity: 2,
    price: '2200000',
    currency: 'EUR',
    status: 'available' as const,
    location: 'Palma de Mallorca, Spain',
    description: 'A stunning Swan 65 combining racing pedigree with cruising comfort. This yacht has competed in multiple regattas while maintaining her cruising capabilities.',
    shortDescription: 'Racing pedigree meets cruising luxury',
    featuredImageUrl: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80',
    isFeatured: true,
    isVisible: false, // Hidden from public listings
    isAdventureYacht: false,
    variant: null,
    availabilityText: null,
    availabilityDate: null,
    sortOrder: 0,
    specs: {
      engines: 'Volvo D4-260',
      generator: 'Onan 11kW',
      airConditioning: true,
      watermaker: true,
      tenders: ['Highfield 340'],
      navigation: ['B&G', 'AIS Class A', 'Radar'],
    },
  },
  {
    name: 'Trade Wind',
    slug: 'trade-wind',
    manufacturer: 'Lagoon',
    model: '52',
    year: 2023,
    lengthMeters: '15.85',
    beamMeters: '8.60',
    draftMeters: '1.55',
    maxSpeed: 10,
    cruisingSpeed: 8,
    fuelCapacity: 1000,
    waterCapacity: 600,
    range: 1500,
    guestCapacity: 10,
    cabins: 5,
    crewCapacity: 1,
    price: '890000',
    currency: 'EUR',
    status: 'available' as const,
    location: 'Athens, Greece',
    description: 'The Lagoon 52 offers exceptional living space and comfort for charter or private use. Perfect for Mediterranean cruising.',
    shortDescription: 'Spacious catamaran for Mediterranean adventures',
    featuredImageUrl: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&q=80',
    isFeatured: false,
    isVisible: false, // Hidden from public listings
    isAdventureYacht: false,
    variant: null,
    availabilityText: null,
    availabilityDate: null,
    sortOrder: 0,
    specs: {
      engines: 'Twin Yanmar 4JH80',
      generator: 'Onan 9kW',
      airConditioning: true,
      watermaker: true,
      navigation: ['Raymarine', 'AIS'],
    },
  },
];

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Cleanup: Remove old passages with dates before 2027 and their stages
    console.log('🧹 Cleaning up old data...');
    const { lt } = await import('drizzle-orm');
    const oldPassages = await db.select({ id: schema.passages.id, name: schema.passages.name })
      .from(schema.passages)
      .where(lt(schema.passages.startDate, '2027-01-01'));

    for (const oldPassage of oldPassages) {
      // Stages cascade-delete with passages
      await db.delete(schema.passages).where(lt(schema.passages.startDate, '2027-01-01'));
      console.log(`  ✗ Removed old passage: ${oldPassage.name}`);
    }

    // Also clean up any orphaned stages
    const allStages = await db.select({ id: schema.stages.id, arrivalDate: schema.stages.arrivalDate }).from(schema.stages);
    for (const stage of allStages) {
      if (stage.arrivalDate && stage.arrivalDate < '2027-01-01') {
        await db.delete(schema.stages).where(lt(schema.stages.arrivalDate, '2027-01-01'));
        console.log('  ✗ Removed orphaned pre-2027 stages');
        break;
      }
    }

    // Seed Passages (upsert to allow updates)
    console.log('\n📦 Seeding passages...');
    for (const passageData of passagesData) {
      await db.insert(schema.passages).values(passageData).onConflictDoUpdate({
        target: schema.passages.slug,
        set: {
          name: passageData.name,
          description: passageData.description,
          startDate: passageData.startDate,
          endDate: passageData.endDate,
          startHub: passageData.startHub,
          endHub: passageData.endHub,
          pricePerPerson: passageData.pricePerPerson,
          maxGuests: passageData.maxGuests,
          status: passageData.status,
          requiresOffshoreCompetency: passageData.requiresOffshoreCompetency,
          metadata: passageData.metadata,
          updatedAt: new Date(),
        },
      });
      console.log(`  ✓ ${passageData.name}`);
    }

    // Get passage IDs for stages
    const passages = await db.query.passages.findMany();
    const passageMap = new Map(passages.map(p => [p.slug, p.id]));

    // Clear existing stages for updated passages and re-seed
    console.log('\n📍 Seeding stages...');
    for (const passage of passages) {
      const { eq } = await import('drizzle-orm');
      await db.delete(schema.stages).where(eq(schema.stages.passageId, passage.id));
    }

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
      });
      console.log(`  ✓ Stage ${stageData.stageNumber}: ${stageData.routeName}`);
    }

    // Seed Vessels (upsert to allow updates)
    console.log('\n🚢 Seeding vessels...');
    for (const vesselData of vesselsData) {
      await db.insert(schema.vessels).values(vesselData).onConflictDoUpdate({
        target: schema.vessels.slug,
        set: {
          name: vesselData.name,
          manufacturer: vesselData.manufacturer,
          model: vesselData.model,
          year: vesselData.year,
          lengthMeters: vesselData.lengthMeters,
          beamMeters: vesselData.beamMeters,
          draftMeters: vesselData.draftMeters,
          grossTonnage: vesselData.grossTonnage,
          maxSpeed: vesselData.maxSpeed,
          cruisingSpeed: vesselData.cruisingSpeed,
          fuelCapacity: vesselData.fuelCapacity,
          waterCapacity: vesselData.waterCapacity,
          range: vesselData.range,
          guestCapacity: vesselData.guestCapacity,
          cabins: vesselData.cabins,
          crewCapacity: vesselData.crewCapacity,
          price: vesselData.price,
          currency: vesselData.currency,
          status: vesselData.status,
          location: vesselData.location,
          description: vesselData.description,
          shortDescription: vesselData.shortDescription,
          featuredImageUrl: vesselData.featuredImageUrl,
          galleryImages: vesselData.galleryImages,
          isFeatured: vesselData.isFeatured,
          isVisible: vesselData.isVisible,
          isAdventureYacht: vesselData.isAdventureYacht,
          variant: vesselData.variant,
          availabilityText: vesselData.availabilityText,
          availabilityDate: vesselData.availabilityDate,
          sortOrder: vesselData.sortOrder,
          specs: vesselData.specs,
          updatedAt: new Date(),
        },
      });
      console.log(`  ✓ ${vesselData.name}`);
    }

    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seed();
