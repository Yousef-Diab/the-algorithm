"use server";

import { getCurrentUser, requireUserId } from "@/lib/auth";
import { getLessonMeta } from "@/lib/content/queries";
import { accessContext } from "@/lib/db/access-queries";
import { canRead } from "@/lib/access";
import { getNoteContent, saveNoteContent } from "@/lib/db/notes-queries";

const MAX_NOTE_CHARS = 20_000;

/**
 * Notes gate on the lesson's OWN access (unlike the quiz, which forces
 * `asMembers`) — a signed-in free-tier user must be able to take notes on a
 * free lesson. `canRead` stays the single choke point either way. A refusal
 * never discloses whether the lesson exists (404-equivalent: generic throw).
 */
async function assertNoteReadable(lessonId: string): Promise<void> {
  const meta = await getLessonMeta(lessonId);
  if (!meta) throw new Error("not found");
  const ctx = await accessContext();
  if (!canRead(meta, ctx)) throw new Error("not found");
}

/**
 * The current user's note text, or the empty string when signed out, when
 * there is no row yet, or when a gate/parse failure occurs. `signedIn` is
 * the client's only way to distinguish "signed out" from "no note yet"
 * without importing the auth SDK — mirrors the precedent ProgressProvider
 * set in 22b: the action's return value IS the signed-in signal.
 *
 * The note body crosses the server-action boundary as a string (INVARIANT
 * 5): React Flight drops some nested plain-object shapes, so callers
 * JSON.stringify/parse it themselves rather than relying on the object
 * round-tripping intact.
 */
export async function loadNote(lessonId: string): Promise<{ signedIn: boolean; text: string }> {
  const user = await getCurrentUser();
  if (!user) return { signedIn: false, text: "" };

  try {
    await assertNoteReadable(lessonId);
  } catch {
    return { signedIn: true, text: "" };
  }

  const content = await getNoteContent(user.id, lessonId);
  if (!content || typeof content !== "object") return { signedIn: true, text: "" };
  const text = (content as { text?: unknown }).text;
  return { signedIn: true, text: typeof text === "string" ? text : "" };
}

export async function saveNote(lessonId: string, contentJson: string): Promise<void> {
  const userId = await requireUserId();
  await assertNoteReadable(lessonId);

  let parsed: unknown;
  try {
    parsed = JSON.parse(contentJson);
  } catch {
    throw new Error("Invalid note content");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid note content");
  }
  const text = (parsed as { text?: unknown }).text;
  if (typeof text !== "string") {
    throw new Error("Invalid note content");
  }
  if (text.length > MAX_NOTE_CHARS) {
    throw new Error("Note too long");
  }

  await saveNoteContent(userId, lessonId, parsed);
}
