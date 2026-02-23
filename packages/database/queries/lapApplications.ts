import { db } from '../client';
import { lapApplications } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function getConfirmedParticipants() {
  return db.select().from(lapApplications).where(
    and(
      eq(lapApplications.flowCompleted, true),
      eq(lapApplications.acceptedBy36ZERO, true),
    )
  );
}

export async function getPendingApplications() {
  return db.select().from(lapApplications).where(
    and(
      eq(lapApplications.flowCompleted, true),
      eq(lapApplications.acceptedBy36ZERO, false),
    )
  );
}

export async function getIncompleteApplications() {
  return db.select().from(lapApplications).where(
    eq(lapApplications.flowCompleted, false)
  );
}
