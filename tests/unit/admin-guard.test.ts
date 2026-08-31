import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock factories are hoisted above imports, so the mocked fns must be
// created via vi.hoisted() rather than plain top-level `const` — referencing
// an un-hoisted binding inside a hoisted factory throws
// "Cannot access '<name>' before initialization".
const { accessContext, notFound } = vi.hoisted(() => ({
  accessContext: vi.fn(),
  // notFound() throws a Next control-flow error. We only need to observe THAT
  // it was called, so a recognisable throw is enough and keeps the test free
  // of Next's internal digest format.
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
vi.mock("@/lib/db/access-queries", () => ({ accessContext }));
vi.mock("next/navigation", () => ({ notFound }));

import { assertAdmin, requireAdminPage } from "@/lib/admin/guard";

const ADMIN = { user: { id: "u1" }, isAdmin: true, entitlements: [] };
const MEMBER = { user: { id: "u2" }, isAdmin: false, entitlements: [] };
const ANON = { user: null, isAdmin: false, entitlements: [] };

beforeEach(() => {
  accessContext.mockReset();
  notFound.mockClear();
});

describe("assertAdmin", () => {
  it("resolves for an admin", async () => {
    accessContext.mockResolvedValue(ADMIN);
    await expect(assertAdmin()).resolves.toBeUndefined();
  });

  it("throws for a signed-in non-admin member", async () => {
    accessContext.mockResolvedValue(MEMBER);
    await expect(assertAdmin()).rejects.toThrow("admin only");
  });

  it("throws for an anonymous visitor", async () => {
    accessContext.mockResolvedValue(ANON);
    await expect(assertAdmin()).rejects.toThrow("admin only");
  });
});

describe("requireAdminPage", () => {
  it("returns the context for an admin and does not 404", async () => {
    accessContext.mockResolvedValue(ADMIN);
    await expect(requireAdminPage()).resolves.toMatchObject({ isAdmin: true });
    expect(notFound).not.toHaveBeenCalled();
  });

  it("404s for a signed-in non-admin member", async () => {
    accessContext.mockResolvedValue(MEMBER);
    await expect(requireAdminPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("404s for an anonymous visitor", async () => {
    accessContext.mockResolvedValue(ANON);
    await expect(requireAdminPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
