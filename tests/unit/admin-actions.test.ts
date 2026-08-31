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
} = vi.hoisted(() => ({
  assertAdmin: vi.fn(),
  promoteLessonDraft: vi.fn(),
  discardLessonDraft: vi.fn(),
  publishLesson: vi.fn(),
  setLessonAccess: vi.fn(),
  getLessonDraftBody: vi.fn(),
  recordAdminAction: vi.fn(),
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
vi.mock("@/lib/db/access-queries", () => ({
  accessContext: vi.fn(async () => ({ user: { id: "actor-1" }, isAdmin: true, entitlements: [] })),
}));

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

  it("records a denied attempt", async () => {
    assertAdmin.mockRejectedValue(new Error("admin only"));
    await promoteAction(null, form({ id: "m1-01", fingerprint: "x" }));
    expect(recordAdminAction).toHaveBeenCalledWith(expect.objectContaining({ outcome: "denied" }));
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
    recordAdminAction.mockRejectedValue(new Error("audit table is on fire"));
    publishLesson.mockResolvedValue(undefined);
    const res = await setStatusAction(null, form({ id: "m1-01", status: "published" }));
    expect(res.ok).toBe(true);
  });
});
