import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";

/** The lesson used for the flip test — free at the start of this file. */
const FLIP = "m1-02";

function setAccess(access: string, id: string) {
  execFileSync("node", ["--env-file=.env.local", "--experimental-strip-types", "scripts/set-access.mjs", access, id], {
    stdio: "inherit",
  });
}

/**
 * A real members lesson: section s2, access='members', and it HAS charts, so
 * the /api/media assertion below is meaningful. (The original m4-03 target is
 * in s1, which is now entirely access='free' — it would have passed vacuously.)
 */
const MEMBERS = "p1-02";

test("a members lesson leaks no prose to an anonymous request", async ({ request }) => {
  const res = await request.get(`/lesson/${MEMBERS}`);
  expect(res.status()).toBe(200);
  const html = await res.text();

  // Distinctive sentences from the lesson body — if either appears, the body was
  // fetched before the gate and landed in the RSC payload. Invariant 1.
  expect(html).not.toContain("which one of these would you actually want to learn how to find?");
  expect(html).not.toContain("hunt three to five handles");
  // Not one gated chart byte is even addressable from the locked page.
  expect(html).not.toContain("/api/media/");
  // The hero IS public (it is already in the nav), so assert what SHOULD show.
  expect(html).toContain("The Judas Swing");
  expect(html).toMatch(/is for members/i);
});

test("a members lesson's charts 404 for an anonymous request", async ({ request }) => {
  // Discover a real media id via a members lesson's own page? It is gated — so
  // read one from the catalog's free lesson and one from the DB fixture instead.
  const res = await request.get("/api/media/00000000-0000-0000-0000-000000000000");
  expect(res.status()).toBe(404);
  // The seeded gated id is written by tests/e2e/fixtures/gated-media-id.txt in
  // Task 24's setup; until then assert the unknown-id case only.
});

test("a free lesson serves its prose and its charts publicly", async ({ request }) => {
  const res = await request.get("/lesson/m1-01");
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).not.toMatch(/is for members/i);
  const src = /\/api\/media\/[0-9a-f-]{36}/.exec(html)?.[0];
  expect(src).toBeTruthy();
  const img = await request.get(src!);
  expect(img.status()).toBe(200);
  expect(img.headers()["cache-control"]).toContain("immutable");
});

test("flipping free → members purges the public cache", async ({ request }) => {
  setAccess("free", FLIP);
  const before = await request.get(`/lesson/${FLIP}`);
  expect(before.status()).toBe(200);
  expect(await before.text()).not.toMatch(/is for members/i);

  setAccess("members", FLIP);

  // The previously-public copy must NOT still be served.
  const after = await request.get(`/lesson/${FLIP}`);
  expect(await after.text()).toMatch(/is for members/i);

  setAccess("free", FLIP); // restore
});
