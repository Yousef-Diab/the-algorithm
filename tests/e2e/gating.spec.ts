import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { gatedMediaId } from "./helpers/catalog";

/** The lesson used for the flip test — free at the start of this file. */
const FLIP = "m1-02";

function setAccess(access: string, id: string) {
  execFileSync("node", ["--env-file=.env.local", "--experimental-strip-types", "scripts/set-access.mjs", access, id], {
    stdio: "inherit",
  });
}

/**
 * A real members lesson: section s2, access='members', and it HAS charts, so
 * the /api/media assertion below is meaningful.
 *
 * (History, corrected 2026-09-01: this comment used to say s1 was "entirely
 * access='free'". That is no longer true — only m1-01..m1-08 are free; the rest
 * of s1 is deliberately access='members'. p1-02 remains a valid target either
 * way, being in s2.)
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
  const id = await gatedMediaId();
  const gated = await request.get(`/api/media/${id}`);
  expect(gated.status()).toBe(404);

  // The gated case must be indistinguishable from a nonexistent one (404-never-403).
  const unknown = await request.get("/api/media/00000000-0000-0000-0000-000000000000");
  expect(unknown.status()).toBe(404);
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
