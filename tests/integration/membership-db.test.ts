import { describe, it, expect, afterAll } from "vitest";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { entitlements } from "@/lib/db/schema";
import { ensureMembership, entitlementsFor } from "@/lib/db/access-queries";

/**
 * The reported bug: nothing in the app ever wrote an entitlement row, so every
 * signed-up account read "your account doesn't have access to this section
 * yet" on every members lesson forever.
 *
 * This has to be an integration test, not a unit test: the whole guarantee is
 * the partial unique index on (user_id) WHERE source = 'signup', and only a
 * real Postgres can say whether ON CONFLICT infers it. A mocked db would
 * happily "pass" while production inserted a duplicate row per page view.
 *
 * Uses a synthetic user id rather than a real one, so it never races the e2e
 * suite's grant/revoke of the E2E account.
 */
const USER = "__test_ensure_membership__";
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const rowsFor = () => db.select().from(entitlements).where(eq(entitlements.userId, USER));
const clean = () => db.delete(entitlements).where(eq(entitlements.userId, USER));

afterAll(clean);

describe("ensureMembership", () => {
  it("grants a signed-up account with no entitlements a scope=all signup row", async () => {
    await clean();
    const out = await ensureMembership(USER, []);

    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ source: "signup", scope: "all", sectionId: null, expiresAt: null });

    // The returned rows are the ones the gate will read, so they must match
    // what a fresh read of the table says.
    expect(await entitlementsFor(USER)).toHaveLength(1);
  });

  it("is idempotent — a second and third call add no rows", async () => {
    await ensureMembership(USER, await entitlementsFor(USER));
    await ensureMembership(USER, await entitlementsFor(USER));
    expect(await rowsFor()).toHaveLength(1);
  });

  it("is idempotent even when told the account has nothing, which is what a concurrent first request looks like", async () => {
    // Forces the insert to actually run against a table that already holds the
    // row: this is the assertion the partial unique index exists to satisfy.
    const out = await ensureMembership(USER, []);
    expect(await rowsFor()).toHaveLength(1);
    expect(out).toHaveLength(1);
    expect(out[0].source).toBe("signup");
  });

  it("does not add a second grant when the account already has scope=all from elsewhere", async () => {
    await clean();
    await db.insert(entitlements).values({ userId: USER, source: "admin_grant", scope: "all" });
    const out = await ensureMembership(USER, await entitlementsFor(USER));

    const rows = await rowsFor();
    expect(rows).toHaveLength(1);
    expect(rows[0].source).toBe("admin_grant");
    expect(out).toHaveLength(1);
  });

  it("tops a section-only account up to scope=all, so a partial grant is not a downgrade", async () => {
    await clean();
    await db.insert(entitlements).values({
      userId: USER,
      source: "admin_grant",
      scope: "section",
      sectionId: "s1",
    });
    const out = await ensureMembership(USER, await entitlementsFor(USER));

    expect(out).toHaveLength(2);
    expect(out.map((r) => r.source).sort()).toEqual(["admin_grant", "signup"]);
    expect(out.some((r) => r.scope === "all")).toBe(true);
  });
});
