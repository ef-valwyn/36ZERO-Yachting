import { db, auditLog } from '@36zero/database';

export type AuditAction =
  | 'note_created'
  | 'rating_set'
  | 'appointment_booked'
  | 'appointment_rescheduled'
  | 'appointment_cancelled'
  | 'appointment_completed'
  | 'lead_manual_create'
  | 'lifecycle_stage_set'
  | 'owner_set'
  | 'next_action_set'
  | 'inbound_draft_approved'
  | 'inbound_draft_rejected'
  | 'inbound_draft_merged'
  | 'deal_converted'
  | 'deal_cleared';

export type AuditEntity = 'inquiry' | 'lead_note' | 'inbound_draft';

interface LogParams {
  actorUserId?: string | null; // null for system actors (webhooks)
  actorEmail: string;
  action: AuditAction;
  entityType: AuditEntity;
  entityId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Best-effort audit log write. Never throws — audit failures shouldn't block
 * the user's request path. Errors are console.error'd for post-hoc inspection.
 */
export async function logAudit(params: LogParams): Promise<void> {
  try {
    await db.insert(auditLog).values({
      actorUserId: params.actorUserId ?? null,
      actorEmail: params.actorEmail,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata ?? null,
    });
  } catch (err) {
    console.error('[audit] failed to write log entry:', err, params);
  }
}
