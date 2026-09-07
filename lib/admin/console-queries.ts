import { asc, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessons } from "@/lib/db/schema";
import type { ConsoleLessonRow } from "./group-lessons";

/**
 * ADMIN ONLY. Every caller must have passed requireAdminPage() first — this
 * function performs NO check of its own and selects body_draft's presence,
 * which invariant 6 makes admin-only unconditionally.
 *
 * Deliberately separate from lib/content/admin-queries.ts's listLessonsAdmin:
 * that function's return value IS the MCP `list_lessons` tool output
 * (mcp/server.ts:139), so adding sectionId/monthId to it would change the tool's
 * shape. The console needs those two columns to group; the agent does not.
 *
 * Imports @/lib/db directly rather than taking an injected handle: this module
 * is only ever imported from app/**, which may do that freely. mcp/** and
 * scripts/** must not — lib/db/index.ts:1 is `import "server-only"`, a package
 * that is not installed and only Next and Vitest alias.
 *
 * Ordering leads with sectionId, unlike admin-queries' monthId-first clause:
 * this query is cross-section (the console groups all sections in one page),
 * so sectionId must lead or rows from different sections would interleave.
 * Then monthId, then ord (per-month, so ordering by ord alone would
 * interleave months), then id.
 */
export async function listLessonsForConsole(): Promise<ConsoleLessonRow[]> {
  const rows = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      access: lessons.access,
      status: lessons.status,
      hasDraft: isNotNull(lessons.bodyDraft).mapWith(Boolean),
      writeOrigin: lessons.writeOrigin,
      sourceRef: lessons.sourceRef,
      sectionId: lessons.sectionId,
      monthId: lessons.monthId,
      kind: lessons.kind,
    })
    .from(lessons)
    .orderBy(asc(lessons.sectionId), asc(lessons.monthId), asc(lessons.ord), asc(lessons.id));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    access: r.access,
    status: r.status,
    hasDraft: r.hasDraft,
    writeOrigin: r.writeOrigin,
    sourceRef: r.sourceRef ?? null,
    sectionId: r.sectionId,
    monthId: r.monthId ?? null,
    kind: r.kind,
  }));
}
