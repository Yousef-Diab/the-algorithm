"use server";

import { db } from "@/lib/db";
import { assertAdmin } from "@/lib/admin/guard";
import { fingerprint } from "@/lib/admin/fingerprint";
import { recordAdminAction, type AdminActionRecord } from "@/lib/admin/audit";
import { createAdminQueries } from "@/lib/content/admin-queries";
import {
  promoteLessonDraft,
  discardLessonDraft,
  publishLesson,
  setLessonAccess,
} from "@/lib/content/mutations";
import { accessContext } from "@/lib/db/access-queries";

/**
 * THIS MODULE IS "use server". It may export ONLY async functions — anything
 * else becomes a broken endpoint, invisible to lint, tsc and build, detonating
 * on an authenticated render. So the return type is declared here as a LOCAL,
 * un-exported `Result`; the client components import the structurally identical
 * `ActionResult` from lib/admin/action-result.ts instead. TypeScript matches the
 * two structurally, so nothing is lost and no type leaves this module.
 * Verify with: grep "^export" app/admin/actions.ts
 */

async function actorId(): Promise<string | null> {
  try {
    const ctx = await accessContext();
    return ctx.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Never lets a logging failure fail the action it describes (invariant 13). */
async function safeRecord(record: AdminActionRecord): Promise<void> {
  try {
    await recordAdminAction(record);
  } catch (err) {
    console.error("admin_actions write failed (action itself was unaffected):", err);
  }
}

type Result = { ok: boolean; message: string };

/**
 * Every wrapper performs its OWN assertAdmin() and then delegates to a mutation
 * that checks again. That is one definition called twice, not two definitions
 * that can drift — and it means neither the page's gate nor the mutation's is
 * load-bearing on its own.
 */
async function guarded(
  action: AdminActionRecord["action"],
  lessonId: string | null,
  run: () => Promise<Result>,
  detail?: Record<string, unknown>,
): Promise<Result> {
  const actor = await actorId();
  try {
    await assertAdmin();
  } catch {
    await safeRecord({ actorUserId: actor, action, lessonId, outcome: "denied", detail });
    return { ok: false, message: "not authorized" };
  }
  try {
    const result = await run();
    await safeRecord({
      actorUserId: actor,
      action,
      lessonId,
      outcome: result.ok ? "ok" : "noop",
      detail,
    });
    return result;
  } catch (err) {
    await safeRecord({ actorUserId: actor, action, lessonId, outcome: "error", detail });
    return { ok: false, message: err instanceof Error ? err.message : "unknown error" };
  }
}

export async function promoteAction(_prev: Result | null, form: FormData): Promise<Result> {
  const id = String(form.get("id") ?? "");
  const seen = String(form.get("fingerprint") ?? "");
  return guarded(
    "promote",
    id,
    async () => {
      const admin = createAdminQueries({ db });
      const current = await admin.getLessonDraftBody(id);
      if (current === null) return { ok: false, message: `no draft pending for ${id}` };
      if (fingerprint(current) !== seen) {
        return {
          ok: false,
          message: "the draft changed since you opened this page — reload and re-read it before promoting",
        };
      }
      const ok = await promoteLessonDraft(id);
      return ok
        ? { ok: true, message: `promoted the draft for ${id}` }
        : { ok: false, message: `no draft pending for ${id}` };
    },
    { fingerprint: seen },
  );
}

export async function discardAction(_prev: Result | null, form: FormData): Promise<Result> {
  const id = String(form.get("id") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  return guarded("discard", id, async () => {
    if (confirm !== id) {
      return { ok: false, message: `type the lesson id (${id}) to confirm — the draft cannot be recovered` };
    }
    const ok = await discardLessonDraft(id);
    return ok
      ? { ok: true, message: `discarded the draft for ${id}` }
      : { ok: false, message: `no draft pending for ${id}` };
  });
}

const STATUSES = ["draft", "published"] as const;
const ACCESSES = ["free", "members", "admin"] as const;

export async function setStatusAction(_prev: Result | null, form: FormData): Promise<Result> {
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  return guarded(
    "set_status",
    id,
    async () => {
      if (!(STATUSES as readonly string[]).includes(status)) {
        return { ok: false, message: `unknown status: ${status}` };
      }
      await publishLesson(id, status as (typeof STATUSES)[number]);
      return { ok: true, message: `${id} is now ${status}` };
    },
    { status },
  );
}

export async function setAccessAction(_prev: Result | null, form: FormData): Promise<Result> {
  const id = String(form.get("id") ?? "");
  const access = String(form.get("access") ?? "");
  return guarded(
    "set_access",
    id,
    async () => {
      if (!(ACCESSES as readonly string[]).includes(access)) {
        return { ok: false, message: `unknown access: ${access}` };
      }
      await setLessonAccess(id, access as (typeof ACCESSES)[number]);
      return { ok: true, message: `${id} access is now ${access}` };
    },
    { access },
  );
}
