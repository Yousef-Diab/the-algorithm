import { db } from "@/lib/db";
import { adminActions } from "@/lib/db/schema";

export interface AdminActionRecord {
  actorUserId: string | null;
  action: "promote" | "discard" | "set_status" | "set_access";
  lessonId: string | null;
  // NOTE: lib/db/schema.ts's column comment still lists only 'ok' | 'noop' |
  // 'denied' | 'error' — one fewer value than this type now writes. 'rejected'
  // distinguishes a validation refusal (bad status, wrong confirm, stale
  // fingerprint, missing id) from a genuine no-op like "no draft pending".
  // lib/db/schema.ts is out of bounds for this task; flagged for a follow-up.
  outcome: "ok" | "noop" | "rejected" | "denied" | "error";
  /** Field values and the draft fingerprint ONLY. Never body content. */
  detail?: Record<string, unknown>;
}

/**
 * Writes one audit row. Invariant 13: this is a RECORD, not a control — nothing
 * reads it to make an authorization decision, and the caller must never let its
 * failure fail the action it describes.
 *
 * The write happens AFTER the mutation, as a separate round trip: neon-http has
 * no interactive transactions, and making it atomic would mean a db.batch inside
 * lib/content/write.ts, which is out of bounds. So a crash between the two loses
 * the log entry, never the write.
 *
 * `detail` must never carry body content — the audit table must not become a
 * second, ungated copy of draft prose (invariant 6).
 */
export async function recordAdminAction(record: AdminActionRecord): Promise<void> {
  await db.insert(adminActions).values({
    actorUserId: record.actorUserId,
    action: record.action,
    lessonId: record.lessonId,
    outcome: record.outcome,
    detail: record.detail ?? null,
  });
}
