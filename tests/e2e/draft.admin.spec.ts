import { test, expect, request as playwrightRequest } from "@playwright/test";
import { plantDraftLessonRow, plantDraftExamRow } from "./helpers/catalog";

/**
 * Proves the `!ctx.isAdmin` escape hatch in app/api/quiz/[id]/route.ts and
 * app/api/exam/[id]/route.ts — the entire reason a draft lesson can be
 * reviewed before it is published. Runs in the "admin" Playwright project
 * (tests/e2e/admin.setup.ts, storageState tests/e2e/.auth/admin.json), so the
 * `request` fixture here carries the admin's session cookie.
 *
 * Every test also fires a genuinely anonymous request at the SAME row via
 * playwright.request.newContext(). IMPORTANT, discovered by direct
 * verification (not assumed): the top-level `request` object exported from
 * "@playwright/test" does NOT hand back a blank-slate context by default —
 * newContext() inherits the CURRENTLY RUNNING PROJECT's `use.storageState`
 * unless told otherwise. In the "admin" project that means a naive
 * `playwrightRequest.newContext({ baseURL })` silently carries the admin's
 * session cookies, and the "anonymous" request would 200 for the same wrong
 * reason as the admin one — which is exactly the false-pass this suite is
 * supposed to prevent. So `storageState: { cookies: [], origins: [] }` is
 * passed explicitly to force an empty cookie jar. Verified genuinely
 * anonymous two ways: (1) a debug spec printed this context's
 * storageState().cookies immediately after creation without the override —
 * it came back with the admin's two auth cookies attached, confirming the
 * inheritance; with the override present it is empty; (2) each test below
 * asserts the anon request 404s the SAME row the admin request just got 200
 * on — if it still carried admin auth, both would 200 and the assertion
 * would fail loudly rather than silently pass.
 */

const BASE_URL = "http://localhost:3000";
const NO_STORAGE_STATE = { cookies: [], origins: [] };

test("admin GET /api/quiz/<id> on a draft lesson is NOT 404; anonymous GET on the same id still is", async ({
  request,
}) => {
  const { id, cleanup } = await plantDraftLessonRow();
  try {
    const adminRes = await request.get(`/api/quiz/${id}`);
    // The draft guard's whole point is that an admin gets THROUGH it. Past
    // the guard, the route's normal members-only check
    // (asMembers = {..., status: meta.status}) falls through to
    // canRead()'s "status !== published -> ctx.isAdmin" branch, which is
    // true for this account — so an admin sees 200 with the (empty, since no
    // quiz rows were planted) questions array, not a 401 "members only".
    expect(
      adminRes.status(),
      `admin request to a draft lesson's quiz must not 404 (the whole point of the escape hatch) — got ${adminRes.status()}`,
    ).toBe(200);
    const body = await adminRes.json();
    expect(Array.isArray(body.questions)).toBe(true);

    const anon = await playwrightRequest.newContext({ baseURL: BASE_URL, storageState: NO_STORAGE_STATE });
    try {
      const anonRes = await anon.get(`/api/quiz/${id}`);
      expect(
        anonRes.status(),
        `anonymous request to the same draft lesson's quiz must still 404 (indistinguishable from unknown) — got ${anonRes.status()}`,
      ).toBe(404);
    } finally {
      await anon.dispose();
    }
  } finally {
    await cleanup();
  }
});

test("admin GET /api/exam/<id> on a draft exam is NOT 404; anonymous GET on the same id still is", async ({
  request,
}) => {
  const { id, cleanup } = await plantDraftExamRow();
  try {
    const adminRes = await request.get(`/api/exam/${id}`);
    expect(
      adminRes.status(),
      `admin request to a draft exam must not 404 (the whole point of the escape hatch) — got ${adminRes.status()}`,
    ).toBe(200);
    const body = await adminRes.json();
    expect(Array.isArray(body.questions)).toBe(true);
    expect(body.passMark).toBe(0.8);

    const anon = await playwrightRequest.newContext({ baseURL: BASE_URL, storageState: NO_STORAGE_STATE });
    try {
      const anonRes = await anon.get(`/api/exam/${id}`);
      expect(
        anonRes.status(),
        `anonymous request to the same draft exam must still 404 (indistinguishable from unknown) — got ${anonRes.status()}`,
      ).toBe(404);
    } finally {
      await anon.dispose();
    }
  } finally {
    await cleanup();
  }
});
