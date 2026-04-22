import {
  pgTable,
  uniqueIndex,
  index,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  date,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import type { AdventureYachtPricingConfig } from '../adventureYachtPricing';

// =========================================
// ENUMS
// =========================================

export const vesselStatusEnum = pgEnum('vessel_status', [
  'available',
  'under_contract',
  'sold',
  'reserved',
]);

export const sailingExperienceEnum = pgEnum('sailing_experience', [
  'novice',
  'intermediate',
  'advanced',
  'offshore_competent',
  'professional',
]);

export const bookingStatusEnum = pgEnum('booking_status', [
  'inquiry',
  'pending_deposit',
  'deposit_paid',
  'documents_pending',
  'confirmed',
  'completed',
  'cancelled',
]);

export const passageStatusEnum = pgEnum('passage_status', [
  'upcoming',
  'active',
  'completed',
]);

export const yachtTypeEnum = pgEnum('yacht_type', ['sail', 'power', 'own_yacht']);

export const userRoleEnum = pgEnum('user_role', ['admin', 'staff', 'customer']);

// =========================================
// PASSAGES TABLE (LAP Circumnavigation)
// =========================================

export const passages = pgTable('passages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  startHub: varchar('start_hub', { length: 255 }).notNull(),
  endHub: varchar('end_hub', { length: 255 }).notNull(),
  pricePerPerson: decimal('price_per_person', { precision: 10, scale: 2 }).notNull(),
  maxGuests: integer('max_guests').notNull().default(8),
  status: passageStatusEnum('status').notNull().default('upcoming'),
  requiresOffshoreCompetency: boolean('requires_offshore_competency').notNull().default(false),
  heroImageUrl: varchar('hero_image_url', { length: 500 }),
  metadata: jsonb('metadata').$type<{
    highlights?: string[];
    included?: string[];
    notIncluded?: string[];
    requirements?: string[];
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =========================================
// STAGES TABLE (Individual Route Legs)
// =========================================

export const stages = pgTable('stages', {
  id: uuid('id').primaryKey().defaultRandom(),
  passageId: uuid('passage_id')
    .notNull()
    .references(() => passages.id, { onDelete: 'cascade' }),
  stageNumber: integer('stage_number').notNull(),
  routeName: varchar('route_name', { length: 255 }).notNull(),
  startLocation: varchar('start_location', { length: 255 }).notNull(),
  endLocation: varchar('end_location', { length: 255 }).notNull(),
  arrivalDate: date('arrival_date').notNull(),
  departureDate: date('departure_date'),
  distanceNm: integer('distance_nm').notNull(),
  estimatedDays: integer('estimated_days'),
  crewRequirement: integer('crew_requirement').notNull().default(2),
  coordinates: jsonb('coordinates').$type<{
    start: [number, number]; // [lng, lat]
    end: [number, number];
    waypoints?: [number, number][];
  }>(),
  logisticsNotes: jsonb('logistics_notes').$type<{
    flightHub?: string;
    transfer?: string;
    visaRequired?: boolean;
    notes?: string;
  }>(),
  isActive: boolean('is_active').notNull().default(false),
  isCompleted: boolean('is_completed').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =========================================
// USERS TABLE (Linked to Clerk)
// =========================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phone: varchar('phone', { length: 50 }),
  // Admin/staff role for gating the /admin GUI. Promoted on user.created
  // if the email is in ADMIN_EMAIL_ALLOWLIST env var (see Clerk webhook).
  role: userRoleEnum('role').notNull().default('customer'),
  sailingExperience: sailingExperienceEnum('sailing_experience'),
  certifications: jsonb('certifications').$type<string[]>(),
  passportStatus: varchar('passport_status', { length: 50 }),
  passportExpiry: date('passport_expiry'),
  emergencyContact: jsonb('emergency_contact').$type<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>(),
  preferences: jsonb('preferences').$type<{
    dietaryRestrictions?: string[];
    cabinPreference?: string;
    communicationPreference?: 'email' | 'phone' | 'whatsapp';
  }>(),
  hubspotContactId: varchar('hubspot_contact_id', { length: 100 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 100 }),
  documentsComplete: boolean('documents_complete').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =========================================
// VESSELS TABLE (Unified CMS - Brokerage + Adventure Yachts)
// =========================================

export const vessels = pgTable('vessels', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  manufacturer: varchar('manufacturer', { length: 255 }).notNull(),
  model: varchar('model', { length: 255 }).notNull(),
  year: integer('year').notNull(),
  lengthMeters: decimal('length_meters', { precision: 5, scale: 2 }).notNull(),
  beamMeters: decimal('beam_meters', { precision: 5, scale: 2 }),
  draftMeters: decimal('draft_meters', { precision: 5, scale: 2 }),
  grossTonnage: integer('gross_tonnage'),
  maxSpeed: integer('max_speed'), // knots
  cruisingSpeed: integer('cruising_speed'), // knots
  fuelCapacity: integer('fuel_capacity'), // liters
  waterCapacity: integer('water_capacity'), // liters
  range: integer('range'), // nautical miles
  guestCapacity: integer('guest_capacity').notNull(),
  cabins: integer('cabins'),
  crewCapacity: integer('crew_capacity'),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  status: vesselStatusEnum('status').notNull().default('available'),
  location: varchar('location', { length: 255 }),
  description: text('description'),
  shortDescription: text('short_description'),
  featuredImageUrl: varchar('featured_image_url', { length: 500 }),
  galleryImages: jsonb('gallery_images').$type<string[]>(),
  specs: jsonb('specs').$type<{
    engines?: string;
    generator?: string;
    stabilizers?: boolean;
    airConditioning?: boolean;
    watermaker?: boolean;
    tenders?: string[];
    toys?: string[];
    navigation?: string[];
    entertainment?: string[];
    safety?: string[];
    pricing?: AdventureYachtPricingConfig;
  }>(),
  isFeatured: boolean('is_featured').notNull().default(false),
  
  // Visibility control
  isVisible: boolean('is_visible').notNull().default(true), // Hide vessels from public listings
  
  // Adventure Yachts specific fields
  isAdventureYacht: boolean('is_adventure_yacht').notNull().default(false),
  variant: varchar('variant', { length: 255 }), // e.g., "Outboard Version", "Hybrid Inboard Version"
  availabilityText: varchar('availability_text', { length: 100 }), // e.g., "Available Now", "Q3 2026"
  availabilityDate: date('availability_date'), // For sorting and filtering
  sortOrder: integer('sort_order').default(0), // Explicit ordering for adventure yachts display
  
  hubspotDealId: varchar('hubspot_deal_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =========================================
// BOOKINGS TABLE (LAP Reservations)
// =========================================

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  passageId: uuid('passage_id')
    .notNull()
    .references(() => passages.id),
  status: bookingStatusEnum('status').notNull().default('inquiry'),
  guestCount: integer('guest_count').notNull().default(1),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal('deposit_amount', { precision: 10, scale: 2 }),
  depositPaidAt: timestamp('deposit_paid_at'),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  specialRequests: text('special_requests'),
  internalNotes: text('internal_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =========================================
// DOCUMENTS TABLE (User Document Vault)
// =========================================

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  bookingId: uuid('booking_id').references(() => bookings.id),
  type: varchar('type', { length: 50 }).notNull(), // passport, certification, waiver, etc.
  name: varchar('name', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileSize: integer('file_size'), // bytes
  mimeType: varchar('mime_type', { length: 100 }),
  isVerified: boolean('is_verified').notNull().default(false),
  verifiedAt: timestamp('verified_at'),
  expiresAt: date('expires_at'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =========================================
// INQUIRIES TABLE (AY60 Vessel Enquiries)
// =========================================

export const inquiries = pgTable(
  'inquiries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    vesselId: uuid('vessel_id').references(() => vessels.id),
    vesselName: varchar('vessel_name', { length: 255 }),
    vesselModel: varchar('vessel_model', { length: 255 }),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    countryCode: varchar('country_code', { length: 10 }),
    country: varchar('country', { length: 100 }),
    company: varchar('company', { length: 255 }),
    deliveryRegion: varchar('delivery_region', { length: 50 }),
    message: text('message'),
    source: varchar('source', { length: 100 }), // website, imhs_2026, imhs_onboard_registration, etc.
    // IMHS 2026 onboard registration interest flags. Defaulted false so
    // legacy rows backfill cleanly; written only for the onboard form.
    interestAdventureYachts: boolean('interest_adventure_yachts').notNull().default(false),
    interestShift: boolean('interest_shift').notNull().default(false),
    // IMHS 2026 admin triage fields (set via /admin GUI by staff).
    // 1..5 scale; CHECK constraint applied post-push via
    // packages/database/scripts/fix-admin-schema.mjs (drizzle-kit builder doesn't
    // reliably emit CHECKs at 0.20.18).
    rating: integer('rating'),
    ratingUpdatedByUserId: uuid('rating_updated_by_user_id').references(() => users.id),
    ratingUpdatedAt: timestamp('rating_updated_at'),
    // Cal.com appointment cache — webhook at /api/webhooks/calcom is source of truth.
    appointmentBookingId: varchar('appointment_booking_id', { length: 100 }),
    appointmentStartAt: timestamp('appointment_start_at'),
    appointmentEndAt: timestamp('appointment_end_at'),
    appointmentStatus: varchar('appointment_status', { length: 30 }), // confirmed | cancelled | rescheduled | completed | no_show
    appointmentAssignedStaffEmail: varchar('appointment_assigned_staff_email', { length: 255 }),
    appointmentUpdatedAt: timestamp('appointment_updated_at'),
    hubspotContactId: varchar('hubspot_contact_id', { length: 100 }),
    isContacted: boolean('is_contacted').notNull().default(false),
    contactedAt: timestamp('contacted_at'),
    // Manual entry via /admin (paper-collected leads). Distinct from QR/form
    // submissions so paper vs scan conversion can be reported.
    manualEntry: boolean('manual_entry').notNull().default(false),
    manualEntryByUserId: uuid('manual_entry_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    // Partial unique index: one row per email for the IMHS onboard registration
    // source, while leaving other sources (vessel_enquiry, etc.) unconstrained.
    // Email is normalized to lowercase at the API boundary before write.
    emailOnboardIdx: uniqueIndex('inquiries_email_onboard_idx')
      .on(table.email)
      .where(sql`source = 'imhs_onboard_registration'`),
  })
);

// =========================================
// LAP APPLICATIONS TABLE
// =========================================

export const lapApplications = pgTable('lap_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  countryCode: varchar('country_code', { length: 10 }).notNull(),
  countryOfResidence: varchar('country_of_residence', { length: 100 }).notNull(),
  yachtType: yachtTypeEnum('yacht_type').notNull(),
  ownYachtDetails: text('own_yacht_details'),
  crewAugmentationRequired: boolean('crew_augmentation_required').notNull(),
  selectedPassages: jsonb('selected_passages').$type<string[]>().notNull(),
  guestCount: integer('guest_count').notNull().default(1),
  flowCompleted: boolean('flow_completed').notNull().default(false),
  acceptedBy36ZERO: boolean('accepted_by_36zero').notNull().default(false),
  hubspotContactId: varchar('hubspot_contact_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =========================================
// RELATIONS
// =========================================

export const passagesRelations = relations(passages, ({ many }) => ({
  stages: many(stages),
  bookings: many(bookings),
}));

export const stagesRelations = relations(stages, ({ one }) => ({
  passage: one(passages, {
    fields: [stages.passageId],
    references: [passages.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  documents: many(documents),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  passage: one(passages, {
    fields: [bookings.passageId],
    references: [passages.id],
  }),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [documents.bookingId],
    references: [bookings.id],
  }),
}));

export const vesselsRelations = relations(vessels, ({ many }) => ({
  inquiries: many(inquiries),
}));

export const inquiriesRelations = relations(inquiries, ({ one, many }) => ({
  vessel: one(vessels, {
    fields: [inquiries.vesselId],
    references: [vessels.id],
  }),
  ratingAuthor: one(users, {
    fields: [inquiries.ratingUpdatedByUserId],
    references: [users.id],
  }),
  notes: many(leadNotes),
}));

export const lapApplicationsRelations = relations(lapApplications, ({}) => ({}));

// =========================================
// LEAD NOTES (admin/staff notes on inquiries — append-only)
// =========================================

export const leadNotes = pgTable(
  'lead_notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    inquiryId: uuid('inquiry_id')
      .notNull()
      .references(() => inquiries.id, { onDelete: 'cascade' }),
    authorUserId: uuid('author_user_id')
      .notNull()
      .references(() => users.id),
    body: text('body').notNull(),
    // HubSpot native Note engagement id (POST /crm/v3/objects/notes). Populated
    // after admin-sync.createHubSpotNote succeeds. Null means sync pending.
    hubspotNoteId: varchar('hubspot_note_id', { length: 100 }),
    hubspotSynced: boolean('hubspot_synced').notNull().default(false),
    hubspotSyncedAt: timestamp('hubspot_synced_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    inquiryCreatedIdx: index('lead_notes_inquiry_created_idx').on(
      t.inquiryId,
      t.createdAt
    ),
  })
);

export const leadNotesRelations = relations(leadNotes, ({ one }) => ({
  inquiry: one(inquiries, {
    fields: [leadNotes.inquiryId],
    references: [inquiries.id],
  }),
  author: one(users, {
    fields: [leadNotes.authorUserId],
    references: [users.id],
  }),
}));

// =========================================
// AUDIT LOG (who did what, when)
// =========================================

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorUserId: uuid('actor_user_id').references(() => users.id),
    actorEmail: varchar('actor_email', { length: 255 }).notNull(), // denormalised for resilience
    action: varchar('action', { length: 50 }).notNull(), // note_created | rating_set | appointment_booked | appointment_cancelled | appointment_rescheduled
    entityType: varchar('entity_type', { length: 50 }).notNull(), // inquiry | lead_note
    entityId: uuid('entity_id').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    entityIdx: index('audit_log_entity_idx').on(
      t.entityType,
      t.entityId,
      t.createdAt
    ),
  })
);

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actor: one(users, {
    fields: [auditLog.actorUserId],
    references: [users.id],
  }),
}));
