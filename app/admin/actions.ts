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
import type { ActionResult } from "@/lib/admin/action-result";

/**
 * THIS MODULE IS "use server". It may export ONLY async functions — anything
 * else becomes a broken endpoint, invisible to lint, tsc and build, detonating
 * on an authenticated render. Types are fine to import (type-only imports are
 * fully erased and add no export), so `Result` below is just the imported
 * `ActionResult` under a short local name.
 * Verify with: grep "^export" app/admin/actions.ts
 */

type Result = ActionResult;

/**
 * Internal shape returned by each wrapper's `run()`. `outcome` classifies the
 * audit row distinctly from the `ok` boolean shown to the caller: "rejected"
 * covers a validation refusal (bad status/access, wrong typed confirmation,
 * stale fingerprint, missing id) so it never collapses into "noop", which is
 * reserved for a genuine no-op like "no draft pending" (invariant: don't let
 * four different events all read as the same audit outcome).
 */
type RunResult = { ok: boolean; message: string; outcome: "ok" | "noop" | "rejected" };

const DETAIL_STRING_MAX = 200;

/**
 * Truncates string values in `detail` before it reaches the audit write. This
 * only runs on the AUTHORIZED path (see `guarded`'s catch below for the
 * unauthenticated path, which drops `detail` entirely) — but even an admin's
 * form input is untrusted enough that an unbounded string must not land in the
 * jsonb column unchecked.
 */
function capDetail(detail?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!detail) return undefined;
  const capped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(detail)) {
    capped[key] = typeof value === "string" && value.length > DETAIL_STRING_MAX
      ? value.slice(0, DETAIL_STRING_MAX)
      : value;
  }
  return capped;
}

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

/**
 * Every wrapper performs its OWN assertAdmin() and then delegates to a mutation
 * that checks again. That is one definition called twice, not two definitions
 * that can drift — and it means neither the page's gate nor the mutation's is
 * load-bearing on its own.
 */
async function guarded(
  action: AdminActionRecord["action"],
  lessonId: string | null,
  run: () => Promise<RunResult>,
  detail?: Record<string, unknown>,
): Promise<Result> {
  const actor = await actorId();
  try {
    await assertAdmin();
  } catch {
    // Server Actions are network-reachable POST endpoints: an attacker can call
    // this directly with arbitrary FormData and no session. `lessonId` and
    // `detail` above are raw, unvalidated caller input at this point — writing
    // either one lets an unauthenticated POST push attacker-controlled bytes
    // (and an arbitrary "lessonId") into the audit table. Record only that a
    // denial happened, never what the caller sent.
    await safeRecord({ actorUserId: actor, action, lessonId: null, outcome: "denied" });
    return { ok: false, message: "not authorized" };
  }
  try {
    const result = await run();
    await safeRecord({
      actorUserId: actor,
      action,
      lessonId,
      outcome: result.outcome,
      detail: capDetail(detail),
    });
    return { ok: result.ok, message: result.message };
  } catch (err) {
    // This catch cannot tell "the write never happened" from "the write
    // happened and something afterwards threw" — the mutations in
    // lib/content/mutations.ts commit the row and THEN call revalidateTag, so a
    // revalidation failure lands here too, after the content is already live.
    // Reporting a plain failure would be the exact bug these wrappers exist to
    // prevent (a change that succeeded but reads as denied), so the message
    // stays deliberately ambiguous instead of claiming nothing happened. The
    // raw error (which may echo driver/SQL detail) is logged server-side only,
    // never forwarded to the client.
    console.error(`admin action "${action}" threw for lesson ${lessonId ?? "(none)"}:`, err);
    await safeRecord({ actorUserId: actor, action, lessonId, outcome: "error" });
    return {
      ok: false,
      message: "the change may have been applied but something afterwards failed — reload and check before retrying",
    };
  }
}

export async function promoteAction(_prev: Result | null, form: FormData): Promise<Result> {
  const id = String(form.get("id") ?? "");
  const seen = String(form.get("fingerprint") ?? "");
  return guarded(
    "promote",
    id || null,
    async () => {
      if (!id) return { ok: false, message: "missing lesson id", outcome: "rejected" };
      const admin = createAdminQueries({ db });
      const current = await admin.getLessonDraftBody(id);
      if (current === null) return { ok: false, message: `no draft pending for ${id}`, outcome: "noop" };
      if (fingerprint(current) !== seen) {
        return {
          ok: false,
          message: "the draft changed since you opened this page — reload and re-read it before promoting",
          outcome: "rejected",
        };
      }
      const ok = await promoteLessonDraft(id);
      return ok
        ? { ok: true, message: `promoted the draft for ${id}`, outcome: "ok" }
        : { ok: false, message: `no draft pending for ${id}`, outcome: "noop" };
    },
    { fingerprint: seen },
  );
}

export async function discardAction(_prev: Result | null, form: FormData): Promise<Result> {
  const id = String(form.get("id") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  return guarded("discard", id || null, async () => {
    // With id absent, `id === "" && confirm === ""` would otherwise make
    // `confirm !== id` false and silently pass the typed-confirmation gate on
    // an irrecoverable delete. Reject an empty id outright rather than relying
    // on the coincidence that no lesson is actually named "".
    if (!id) return { ok: false, message: "missing lesson id", outcome: "rejected" };
    if (confirm !== id) {
      return {
        ok: false,
        message: `type the lesson id (${id}) to confirm — the draft cannot be recovered`,
        outcome: "rejected",
      };
    }
    const ok = await discardLessonDraft(id);
    return ok
      ? { ok: true, message: `discarded the draft for ${id}`, outcome: "ok" }
      : { ok: false, message: `no draft pending for ${id}`, outcome: "noop" };
  });
}

const STATUSES = ["draft", "published"] as const;
const ACCESSES = ["free", "members", "admin"] as const;

export async function setStatusAction(_prev: Result | null, form: FormData): Promise<Result> {
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  return guarded(
    "set_status",
    id || null,
    async () => {
      if (!id) return { ok: false, message: "missing lesson id", outcome: "rejected" };
      if (!(STATUSES as readonly string[]).includes(status)) {
        return { ok: false, message: `unknown status: ${status}`, outcome: "rejected" };
      }
      await publishLesson(id, status as (typeof STATUSES)[number]);
      return { ok: true, message: `${id} is now ${status}`, outcome: "ok" };
    },
    { status },
  );
}

export async function setAccessAction(_prev: Result | null, form: FormData): Promise<Result> {
  const id = String(form.get("id") ?? "");
  const access = String(form.get("access") ?? "");
  return guarded(
    "set_access",
    id || null,
    async () => {
      if (!id) return { ok: false, message: "missing lesson id", outcome: "rejected" };
      if (!(ACCESSES as readonly string[]).includes(access)) {
        return { ok: false, message: `unknown access: ${access}`, outcome: "rejected" };
      }
      await setLessonAccess(id, access as (typeof ACCESSES)[number]);
      return { ok: true, message: `${id} access is now ${access}`, outcome: "ok" };
    },
    { access },
  );
}
