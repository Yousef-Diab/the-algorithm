import { asc, eq } from "drizzle-orm";
import { lessons } from "../db/schema";
import { assertBlocks, type Block } from "./blocks";
import type { AnyDb } from "./write";

export interface AdminLessonRow {
  id: string; title: string; access: string; status: string;
  hasDraft: boolean; writeOrigin: string; sourceRef: string | null;
}

export function createAdminQueries({ db }: { db: AnyDb }) {
  /**
   * ADMIN ONLY. Never call this from a public read path — invariant 6 holds
   * because getLessonBody() selects `body` and only `body`, and NOTHING does an
   * unprojected select on `lessons`. Keep it that way.
   */
  async function getLessonDraftBody(id: string): Promise<Block[] | null> {
    const [row] = await db.select({ bodyDraft: lessons.bodyDraft }).from(lessons).where(eq(lessons.id, id)).limit(1);
    if (!row || row.bodyDraft == null) return null;
    return assertBlocks(row.bodyDraft);
  }

  async function listLessonsAdmin(sectionId?: string): Promise<AdminLessonRow[]> {
    const rows = await db
      .select({
        id: lessons.id, title: lessons.title, access: lessons.access, status: lessons.status,
        bodyDraft: lessons.bodyDraft, writeOrigin: lessons.writeOrigin, sourceRef: lessons.sourceRef,
      })
      .from(lessons)
      .where(sectionId ? eq(lessons.sectionId, sectionId) : undefined)
      .orderBy(asc(lessons.ord));
    return rows.map((r: Record<string, unknown>) => ({
      id: r.id as string, title: r.title as string, access: r.access as string, status: r.status as string,
      hasDraft: r.bodyDraft != null, writeOrigin: r.writeOrigin as string, sourceRef: (r.sourceRef as string) ?? null,
    }));
  }

  /**
   * ADMIN ONLY. Returns the complete lesson row including draft columns (bodyDraft).
   * This is the only place in the codebase that performs an unprojected select on the
   * lessons table. Never call this from a public read path — this function must remain
   * admin-only to maintain Invariant 6 (body_draft is unconditionally inaccessible to
   * non-admin users, even for free lessons). Keep it that way.
   */
  async function getLessonForEdit(id: string) {
    const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
    return row ?? null;
  }

  return { getLessonDraftBody, listLessonsAdmin, getLessonForEdit };
}
