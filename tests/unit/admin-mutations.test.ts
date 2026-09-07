import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock calls are HOISTED above every top-level const, so a plain
// `const x = vi.fn()` referenced inside a factory throws "Cannot access before
// initialization". vi.hoisted() is the supported way to share mock fns.
const { assertAdmin, discardDraft } = vi.hoisted(() => ({
  assertAdmin: vi.fn(),
  discardDraft: vi.fn(),
}));

vi.mock("@/lib/admin/guard", () => ({ assertAdmin, requireAdminPage: vi.fn() }));

vi.mock("@/lib/content/write", () => ({
  createWriter: () => ({
    discardDraft,
    promoteDraft: vi.fn(),
    setStatus: vi.fn(),
    setAccess: vi.fn(),
    writeLessonBody: vi.fn(),
  }),
}));

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

import { discardLessonDraft } from "@/lib/content/mutations";

beforeEach(() => {
  assertAdmin.mockReset();
  discardDraft.mockReset();
});

describe("discardLessonDraft", () => {
  it("refuses a non-admin and never reaches the writer", async () => {
    assertAdmin.mockRejectedValue(new Error("admin only"));
    await expect(discardLessonDraft("m1-01")).rejects.toThrow("admin only");
    expect(discardDraft).not.toHaveBeenCalled();
  });

  it("returns true when a draft was discarded", async () => {
    assertAdmin.mockResolvedValue(undefined);
    discardDraft.mockResolvedValue(true);
    await expect(discardLessonDraft("m1-01")).resolves.toBe(true);
    expect(discardDraft).toHaveBeenCalledWith("m1-01");
  });

  it("returns false when there was no draft to discard", async () => {
    assertAdmin.mockResolvedValue(undefined);
    discardDraft.mockResolvedValue(false);
    await expect(discardLessonDraft("m1-01")).resolves.toBe(false);
  });
});
