/**
 * The lesson-list status toggle's direction and label, in one place so the
 * button can never offer one thing and submit another.
 *
 * Pure — no DB, no next/*, no React. `app/admin/actions.ts` remains the only
 * authority on which status values are actually accepted; this is presentation.
 */

export type LessonStatus = "draft" | "published";

/**
 * The status a toggle click should write, given the row's current status.
 *
 * An unrecognised value resolves to "published" DELIBERATELY. If the column
 * ever holds something unexpected, offering to publish is the recoverable
 * mistake; offering to UNPUBLISH content that might be live is not.
 */
export function nextStatus(current: string): LessonStatus {
  return current === "published" ? "draft" : "published";
}

/** The toggle's visible label. Always agrees with nextStatus by construction. */
export function statusToggleLabel(current: string): "Publish" | "Unpublish" {
  return nextStatus(current) === "published" ? "Publish" : "Unpublish";
}
