import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock calls are HOISTED above every top-level const, so a plain
// `const x = vi.fn()` referenced inside a factory throws "Cannot access before
// initialization". vi.hoisted() is the supported way to share mock fns.
const {
  assertAdmin,
  promoteLessonDraft,
  discardLessonDraft,
  publishLesson,
  setLessonAccess,
  getLessonDraftBody,
  recordAdminAction,
  accessContext,
} = vi.hoisted(() => ({
  assertAdmin: vi.fn(),
  promoteLessonDraft: vi.fn(),
  discardLessonDraft: vi.fn(),
  publishLesson: vi.fn(),
  setLessonAccess: vi.fn(),
  getLessonDraftBody: vi.fn(),
  recordAdminAction: vi.fn(),
  accessContext: vi.fn(),
}));

vi.mock("@/lib/admin/guard", () => ({ assertAdmin, requireAdminPage: vi.fn() }));

vi.mock("@/lib/content/mutations", () => ({
  promoteLessonDraft,
  discardLessonDraft,
  publishLesson,
  setLessonAccess,
}));

vi.mock("@/lib/content/admin-queries", () => ({
  createAdminQueries: () => ({ getLessonDraftBody, listLessonsAdmin: vi.fn(), getLessonForEdit: vi.fn() }),
}));

vi.mock("@/lib/admin/audit", () => ({ recordAdminAction }));

vi.mock("@/lib/db", () => ({ db: {} }));

// actorId() inside the wrappers calls accessContext(). Without this mock the
// REAL module loads, pulling in @/lib/db and the auth SDK — the test would then
// be exercising infrastructure instead of the wrappers.
vi.mock("@/lib/db/access-queries", () => ({ accessContext }));

import { promoteAction, discardAction, setStatusAction, setAccessAction } from "@/app/admin/actions";
import { fingerprint } from "@/lib/admin/fingerprint";

const DRAFT = [{ t: "p", c: [{ t: "text", v: "hello" }] }];

function form(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
  assertAdmin.mockResolvedValue(undefined);
  // Default actor is a signed-in (but not necessarily admin) user; individual
  // tests override this with mockResolvedValueOnce to exercise the fully
  // unauthenticated (no session at all) case.
  accessContext.mockResolvedValue({ user: { id: "actor-1" }, isAdmin: true, entitlements: [] });
});

describe("authorization", () => {
  it.each([
    ["promoteAction", promoteAction],
    ["discardAction", discardAction],
    ["setStatusAction", setStatusAction],
    ["setAccessAction", setAccessAction],
  ])("%s refuses a non-admin without reaching a mutation", async (_name, action) => {
    assertAdmin.mockRejectedValue(new Error("admin only"));
    const res = await action(null, form({ id: "m1-01", status: "published", access: "free", fingerprint: "x" }));
    expect(res.ok).toBe(false);
    expect(promoteLessonDraft).not.toHaveBeenCalled();
    expect(discardLessonDraft).not.toHaveBeenCalled();
    expect(publishLesson).not.toHaveBeenCalled();
    expect(setLessonAccess).not.toHaveBeenCalled();
  });

  it("records a denied attempt from a signed-in non-admin", async () => {
    // accessContext resolves to the default signed-in actor from beforeEach —
    // this is the forensically interesting case (an account exists, so the
    // attempt is rate-limited by needing one), and it must still be recorded.
    assertAdmin.mockRejectedValue(new Error("admin only"));
    await promoteAction(null, form({ id: "m1-01", fingerprint: "x" }));
    expect(recordAdminAction).toHaveBeenCalledWith(expect.objectContaining({ outcome: "denied" }));
  });

  it("records nothing for a fully unauthenticated POST (no session at all)", async () => {
    // A request with no session costs a cookie read and no DB round trip.
    // Recording it would make every anonymous probe cost a write, and the row
    // would say only "someone probed" since there is no actor to attribute it
    // to.
    accessContext.mockResolvedValueOnce({ user: null, isAdmin: false, entitlements: [] });
    assertAdmin.mockRejectedValue(new Error("admin only"));
    const res = await promoteAction(null, form({ id: "m1-01", fingerprint: "x" }));
    expect(res.ok).toBe(false);
    expect(recordAdminAction).not.toHaveBeenCalled();
  });

  it("passes no detail and a null lessonId on the deny path, even though the attacker supplied both", async () => {
    // Server Actions are network-reachable POST endpoints — an unauthenticated
    // caller can supply arbitrary id/fingerprint form fields. The audit write
    // for a denial must not echo any of it back into the jsonb column.
    assertAdmin.mockRejectedValue(new Error("admin only"));
    await promoteAction(null, form({ id: "attacker-supplied-id", fingerprint: "x".repeat(5000) }));
    expect(recordAdminAction).toHaveBeenCalledTimes(1);
    const call = recordAdminAction.mock.calls[0][0];
    expect(call.lessonId).toBeNull();
    expect(call.detail).toBeUndefined();
    expect(call.outcome).toBe("denied");
  });
});

describe("promoteAction", () => {
  it("promotes when the fingerprint matches what was reviewed", async () => {
    getLessonDraftBody.mockResolvedValue(DRAFT);
    promoteLessonDraft.mockResolvedValue(true);
    const res = await promoteAction(null, form({ id: "m1-01", fingerprint: fingerprint(DRAFT) }));
    expect(res.ok).toBe(true);
    expect(promoteLessonDraft).toHaveBeenCalledWith("m1-01");
  });

  it("refuses when the draft changed since the page was rendered", async () => {
    getLessonDraftBody.mockResolvedValue(DRAFT);
    const res = await promoteAction(null, form({ id: "m1-01", fingerprint: "stale-hash" }));
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/changed since/i);
    expect(promoteLessonDraft).not.toHaveBeenCalled();
  });

  it("reports 'no draft pending' rather than succeeding silently", async () => {
    getLessonDraftBody.mockResolvedValue(null);
    const res = await promoteAction(null, form({ id: "m1-01", fingerprint: "x" }));
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/no draft pending/i);
    expect(promoteLessonDraft).not.toHaveBeenCalled();
  });
});

describe("discardAction", () => {
  it("requires the typed confirmation to match the lesson id", async () => {
    const res = await discardAction(null, form({ id: "m1-01", confirm: "m1-02" }));
    expect(res.ok).toBe(false);
    expect(discardLessonDraft).not.toHaveBeenCalled();
  });

  it("rejects a missing id rather than letting an absent id equal an absent confirmation", async () => {
    // With id absent, id === "" and confirm === "" used to make `confirm !== id`
    // false — the typed-confirmation gate would silently pass on an
    // irrecoverable delete. This must fail explicitly instead.
    const res = await discardAction(null, form({}));
    expect(res.ok).toBe(false);
    expect(discardLessonDraft).not.toHaveBeenCalled();
  });

  it("discards when the confirmation matches", async () => {
    discardLessonDraft.mockResolvedValue(true);
    const res = await discardAction(null, form({ id: "m1-01", confirm: "m1-01" }));
    expect(res.ok).toBe(true);
  });

  it("reports a no-op as a failure", async () => {
    discardLessonDraft.mockResolvedValue(false);
    const res = await discardAction(null, form({ id: "m1-01", confirm: "m1-01" }));
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/no draft pending/i);
  });
});

describe("setStatusAction / setAccessAction", () => {
  it("rejects a status outside the allowed set", async () => {
    const res = await setStatusAction(null, form({ id: "m1-01", status: "live" }));
    expect(res.ok).toBe(false);
    expect(publishLesson).not.toHaveBeenCalled();
  });

  it("rejects an access outside the allowed set", async () => {
    const res = await setAccessAction(null, form({ id: "m1-01", access: "everyone" }));
    expect(res.ok).toBe(false);
    expect(setLessonAccess).not.toHaveBeenCalled();
  });

  it("sets a valid status", async () => {
    publishLesson.mockResolvedValue(undefined);
    const res = await setStatusAction(null, form({ id: "m1-01", status: "published" }));
    expect(res.ok).toBe(true);
    expect(publishLesson).toHaveBeenCalledWith("m1-01", "published");
  });

  it("sets a valid access", async () => {
    setLessonAccess.mockResolvedValue(undefined);
    const res = await setAccessAction(null, form({ id: "m1-01", access: "members" }));
    expect(res.ok).toBe(true);
    expect(setLessonAccess).toHaveBeenCalledWith("m1-01", "members");
  });
});

describe("the audit log is never a control", () => {
  it("still succeeds when recording the action throws", async () => {
    recordAdminAction.mockRejectedValueOnce(new Error("audit table is on fire"));
    publishLesson.mockResolvedValue(undefined);
    const res = await setStatusAction(null, form({ id: "m1-01", status: "published" }));
    expect(res.ok).toBe(true);
  });
});

describe("the audit detail never carries body content", () => {
  it("records only the field value for a status change, never draft/lesson prose", async () => {
    publishLesson.mockResolvedValue(undefined);
    await setStatusAction(null, form({ id: "m1-01", status: "published" }));
    expect(recordAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { status: "published" } }),
    );
  });

  it("records only the fingerprint for a promote, never the draft body itself", async () => {
    getLessonDraftBody.mockResolvedValue(DRAFT);
    promoteLessonDraft.mockResolvedValue(true);
    const fp = fingerprint(DRAFT);
    await promoteAction(null, form({ id: "m1-01", fingerprint: fp }));
    const call = recordAdminAction.mock.calls.find((c) => c[0].action === "promote")?.[0];
    expect(call.detail).toEqual({ fingerprint: fp });
    expect(JSON.stringify(call.detail)).not.toContain("hello");
  });

  it("truncates an oversized detail string before it reaches the audit write", async () => {
    publishLesson.mockRejectedValueOnce(new Error("boom"));
    const hugeStatus = "x".repeat(5000);
    await setStatusAction(null, form({ id: "m1-01", status: hugeStatus }));
    const call = recordAdminAction.mock.calls[0][0];
    expect((call.detail!.status as string).length).toBeLessThanOrEqual(200);
  });
});

describe("a mutation that throws is recorded as an error, not a silent success", () => {
  it("sets outcome: 'error' and returns an ambiguous, non-leaking message", async () => {
    publishLesson.mockRejectedValueOnce(new Error("connection terminated unexpectedly: password=hunter2"));
    const res = await setStatusAction(null, form({ id: "m1-01", status: "published" }));
    expect(res.ok).toBe(false);
    expect(res.message).not.toContain("hunter2");
    expect(recordAdminAction).toHaveBeenCalledWith(expect.objectContaining({ outcome: "error" }));
  });
});

describe("rejected vs noop outcomes stay distinct", () => {
  it("a validation refusal (bad status) records 'rejected', not 'noop'", async () => {
    await setStatusAction(null, form({ id: "m1-01", status: "live" }));
    expect(recordAdminAction).toHaveBeenCalledWith(expect.objectContaining({ outcome: "rejected" }));
  });

  it("a genuine no-op (no draft pending) records 'noop', not 'rejected'", async () => {
    getLessonDraftBody.mockResolvedValue(null);
    await promoteAction(null, form({ id: "m1-01", fingerprint: "x" }));
    expect(recordAdminAction).toHaveBeenCalledWith(expect.objectContaining({ outcome: "noop" }));
  });
});
