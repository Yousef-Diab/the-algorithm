import { describe, it, expect } from "vitest";
import { canRead, hasEntitlement, type AccessCtx, type Gated } from "@/lib/access";

const anon: AccessCtx = { user: null, isAdmin: false, entitlements: [] };
const signedIn: AccessCtx = { user: { id: "u1" }, isAdmin: false, entitlements: [] };
const memberAll: AccessCtx = { user: { id: "u1" }, isAdmin: false, entitlements: [{ scope: "all", sectionId: null }] };
const memberS1: AccessCtx = { user: { id: "u1" }, isAdmin: false, entitlements: [{ scope: "section", sectionId: "s1" }] };
const admin: AccessCtx = { user: { id: "u9" }, isAdmin: true, entitlements: [] };

const lesson = (over: Partial<Gated> = {}): Gated => ({ sectionId: "s1", access: "members", status: "published", ...over });

describe("canRead", () => {
  it("lets anyone read a published free lesson", () => {
    expect(canRead(lesson({ access: "free" }), anon)).toBe(true);
  });

  it("hides a members lesson from anonymous and merely-signed-in users", () => {
    expect(canRead(lesson(), anon)).toBe(false);
    expect(canRead(lesson(), signedIn)).toBe(false);
  });

  it("lets a scope=all member read any section", () => {
    expect(canRead(lesson({ sectionId: "s2" }), memberAll)).toBe(true);
  });

  it("scopes a section entitlement to its own section", () => {
    expect(canRead(lesson({ sectionId: "s1" }), memberS1)).toBe(true);
    expect(canRead(lesson({ sectionId: "s2" }), memberS1)).toBe(false);
  });

  it("restricts access='admin' to admins even for members", () => {
    expect(canRead(lesson({ access: "admin" }), memberAll)).toBe(false);
    expect(canRead(lesson({ access: "admin" }), admin)).toBe(true);
  });

  it("hides a draft from everyone but an admin, whatever its access", () => {
    for (const access of ["free", "members", "admin"]) {
      expect(canRead(lesson({ access, status: "draft" }), anon)).toBe(false);
      expect(canRead(lesson({ access, status: "draft" }), memberAll)).toBe(false);
      expect(canRead(lesson({ access, status: "draft" }), admin)).toBe(true);
    }
  });

  it("fails closed on an unknown access value", () => {
    expect(canRead(lesson({ access: "somethingelse" }), memberAll)).toBe(false);
    expect(canRead(lesson({ access: "" }), memberAll)).toBe(false);
  });

  it("fails closed on an unknown status value", () => {
    expect(canRead(lesson({ access: "free", status: "archived" }), anon)).toBe(false);
  });

  // --- Additional coverage beyond the brief, pinning branches the brief's fixtures leave unpinned ---

  it("does not grant a members lesson to an admin via entitlement guard bypass check (admin=true still works even with zero entitlements)", () => {
    // Pins: canRead's `members` branch takes the `ctx.isAdmin ||` short-circuit, not hasEntitlement,
    // for an admin with no entitlements at all.
    expect(canRead(lesson({ access: "members", sectionId: "s7" }), admin)).toBe(true);
  });

  it("an admin can read a free lesson regardless of status guard ordering", () => {
    // Pins: the published+free branch returns true independent of isAdmin.
    expect(canRead(lesson({ access: "free" }), admin)).toBe(true);
  });

  it("an admin reading a published members lesson in a section they hold no entitlement for still succeeds via isAdmin", () => {
    // Pins: `ctx.isAdmin ||` in the members branch, isolated from hasEntitlement's own section check.
    expect(canRead(lesson({ access: "members", sectionId: "s-nobody-has" }), admin)).toBe(true);
  });

  it("access='admin' combined with a matching section entitlement is still false — entitlements never grant admin", () => {
    // Pins: the `admin` case only checks ctx.isAdmin, ignoring entitlements entirely.
    expect(canRead(lesson({ access: "admin", sectionId: "s1" }), memberS1)).toBe(false);
  });

  it("fails closed on differently-cased or whitespace-padded access values (exact-match switch)", () => {
    expect(canRead(lesson({ access: "Free" }), anon)).toBe(false);
    expect(canRead(lesson({ access: " free" }), anon)).toBe(false);
    expect(canRead(lesson({ access: "FREE" }), memberAll)).toBe(false);
  });
});

describe("hasEntitlement", () => {
  it("is false without a user", () => {
    expect(hasEntitlement(anon, "s1")).toBe(false);
  });

  it("ignores a section entitlement with a null sectionId", () => {
    expect(hasEntitlement({ ...memberS1, entitlements: [{ scope: "section", sectionId: null }] }, "s1")).toBe(false);
  });

  it("is false for an anonymous ctx even when entitlements is non-empty (the !ctx.user guard is load-bearing)", () => {
    // Pins: the `!ctx.user` early-return, not an incidental empty-array truth.
    expect(hasEntitlement({ user: null, isAdmin: false, entitlements: [{ scope: "all", sectionId: null }] }, "s1")).toBe(false);
  });

  it("returns true when a scope=section entitlement's sectionId matches the requested section", () => {
    expect(hasEntitlement(memberS1, "s1")).toBe(true);
  });

  it("returns false when a scope=section entitlement's sectionId does not match the requested section", () => {
    expect(hasEntitlement(memberS1, "s2")).toBe(false);
  });

  it("returns true for scope=all regardless of the requested section", () => {
    expect(hasEntitlement(memberAll, "any-section-at-all")).toBe(true);
  });

  it("is false for isAdmin=true alone when the user has no matching entitlements (isAdmin does not feed hasEntitlement)", () => {
    // Pins: hasEntitlement never consults ctx.isAdmin — that's canRead's job via the `||`.
    expect(hasEntitlement({ user: { id: "u9" }, isAdmin: true, entitlements: [] }, "s1")).toBe(false);
  });
});
