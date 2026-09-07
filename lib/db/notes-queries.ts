import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "./index";
import { notes } from "./schema";

/** The user's note document for a lesson (`{ type: "text", text }`), or null if none. */
export async function getNoteContent(
  userId: string,
  lessonId: string,
): Promise<unknown | null> {
  const rows = await db
    .select({ content: notes.content })
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.lessonId, lessonId)))
    .limit(1);
  return rows[0]?.content ?? null;
}

/** Upserts the note document for (user, lesson). */
export async function saveNoteContent(
  userId: string,
  lessonId: string,
  content: unknown,
): Promise<void> {
  await db
    .insert(notes)
    .values({ userId, lessonId, content })
    .onConflictDoUpdate({
      target: [notes.userId, notes.lessonId],
      set: { content, updatedAt: new Date() },
    });
}
