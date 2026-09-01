# Admin Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin-only web console at `/admin` for reviewing pending lesson drafts side by side with the live body and publishing content.

**Architecture:** Two React Server Components read through injected-`db` query modules and render with the existing `BlockRenderer`; four Server Actions wrap the existing `lib/content/mutations.ts` functions, each re-checking admin identity. All comparison, grouping and hashing logic is extracted into pure, dependency-free modules so it is unit-tested directly rather than through a browser.

**Tech Stack:** Next 16.2.11 (App Router, Server Actions), React 19.2.4, drizzle-orm 0.45 on `@neondatabase/serverless` (neon-http), Vitest 3.2, Playwright 1.61, CSS Modules. **No new dependencies.**

**Spec:** [docs/superpowers/specs/2026-08-31-admin-console-design.md](../specs/2026-08-31-admin-console-design.md) — read it alongside this plan. Where they disagree, the spec wins. The spec in turn defers to [2026-08-13-cms-write-path-design.md](../specs/2026-08-13-cms-write-path-design.md), the binding authority for the write path.

---

## Global Constraints

Every task's requirements implicitly include all of these.

- **The user has authorized ONE local commit per task on this branch, for this plan only.** Use the task's stated commit message. **Never push, never open a PR, never force-push** — branch `nextjs-neon-cms` has no upstream and must keep none. Verify with `git ls-remote --heads origin` (expect only `main`) rather than assuming.
- **No CI runs on this branch.** Every gate is a local run, and **exit codes are read in the FOREGROUND**. A backgrounded `pnpm build ; echo $?` reports the echo's status — that has already masked 8 type errors across four tasks on this project. Never background a gate.
- **No new dependencies.** Runtime deps are frozen at the eight in `package.json`.
- **Do not modify:** `lib/content/write.ts` (load-bearing and heavily tested — raise it with the user first if you believe you must), `lib/content/queries.ts`, `lib/content/admin-queries.ts`, `lib/access.ts`, `lib/db/access-queries.ts`, `mcp/**`, `scripts/**`, `tsconfig.json`.
- **READ-ONLY:** `content/`, `images/`, `engine/`, `build.py`, `verify.py`, `index.html`, `.github/workflows/ci.yml`, `transcripts/`, `notes/`.
- `lib/db/schema.ts` and `drizzle/` change **only** via `pnpm db:generate` — edit the schema, generate, read the SQL, then `pnpm db:migrate`. Never hand-write a migration.
- **`lib/db/index.ts:1` is `import "server-only"`, a package that is NOT installed.** Next and Vitest alias it; a plain Node process dies at startup *after* passing lint, tsc, build and every unit test. `app/**` may import `@/lib/db` freely. `mcp/**` and `scripts/**` may not, and must never import `lib/content/mutations.ts` or `lib/content/queries.ts`.
- **A `"use server"` module may export ONLY async functions.** Anything else exported becomes a broken action endpoint, invisible to lint, `tsc` and `pnpm build`, detonating only on an authenticated render. Verify with `grep "^export" <file>`.
- **neon-http has NO interactive transactions.** `begin`/`rollback` issued as separate calls are three sessions: the begin and rollback are no-ops and the write COMMITS. Only `db.batch([...])` is atomic.
- **Clean builds need `rm -rf .next`, NOT `.next/cache`** — a stale `.next/dev/types/validator.ts` fails the type check with a bogus `AppRouteHandlerRoutes` error. Kill any stale `pnpm start` on :3000 first.
- **Integration tests run against the REAL production database.** Capture in `beforeAll`, restore in `try/finally` AND an `afterAll` backstop, explicit `DELETE`s, no `begin`/`rollback`. `m1-01` is the shared fixture and `vitest.integration.config.ts` sets `fileParallelism: false` because two files already mutate it — **keep that setting**.
- **Never print or store a user's email.** `admin_actions.actor_user_id` holds the Neon Auth user id only.
- **Invariant 6:** `body_draft` is admin-only unconditionally. Nothing outside an admin-gated path may select it, and no audit record may contain body content.
- **Invariant 10:** `promote_draft`, `discard_draft`, `set_access` and `set_status` stay ABSENT from the MCP tool surface. `mcp/**` is not touched by this plan; the proof is re-run in Task 15 as a regression check.

### Database state — must read identically before and after the whole plan

```
82 lessons · 564 quiz questions · 0 pending drafts · 0 write_origin='cms'
0 unpublished lessons · 0 quiz_results · 0 admin_actions (after Task 6 creates the table)
```

Counts alone cannot see a rewritten row, so **snapshot any table you write to and diff against the snapshot** — in particular dump `m1-01`'s full row before and after.

---

# Phase 1 — pure logic and the gate (no UI, no DB)

### Task 1: The admin guard, with one definition shared by pages and actions

**Files:**
- Create: `lib/admin/guard.ts`
- Modify: `lib/content/mutations.ts:8-11` (the private `requireAdmin` becomes a delegation)
- Test: `tests/unit/admin-guard.test.ts`

**Interfaces:**
- Consumes: `accessContext()` from `@/lib/db/access-queries`, which returns `{ user, isAdmin, entitlements }`.
- Produces: `assertAdmin(): Promise<void>` (throws `Error("admin only")`) and `requireAdminPage(): Promise<AccessContext>` (calls `notFound()`). Tasks 8, 11 and 12 depend on both names.

**Why this file is not in `mutations.ts`:** that module is `"use server"`, so **anything exported from it becomes a callable Server Action endpoint**. Its `requireAdmin` is deliberately un-exported. Putting the shared guard there would publish it.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/admin-guard.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const accessContext = vi.fn();
vi.mock("@/lib/db/access-queries", () => ({ accessContext }));

// notFound() throws a Next control-flow error. We only need to observe THAT it
// was called, so a recognisable throw is enough and keeps the test free of
// Next's internal digest format.
const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/admin-guard.test.ts`
Expected: FAIL — cannot resolve `@/lib/admin/guard`.

- [ ] **Step 3: Write the implementation**

Create `lib/admin/guard.ts`:

```ts
import { notFound } from "next/navigation";
import { accessContext } from "@/lib/db/access-queries";

/**
 * The ONE definition of the admin check. Pages call requireAdminPage(),
 * Server Actions call assertAdmin(), and lib/content/mutations.ts delegates
 * to assertAdmin() rather than keeping a second copy.
 *
 * This module is deliberately NOT "use server". Everything exported from a
 * "use server" module becomes a callable action endpoint, and a guard that
 * anyone can invoke over the network is not a guard.
 *
 * Gating is on HUMAN IDENTITY only — the auth session plus the ADMIN_EMAILS
 * allowlist, via accessContext(). Never on a bearer secret or a token in
 * .env.local: the AI agent reads that file routinely, and a secret there would
 * hand it the exact publish capability that CMS invariant 10 removes.
 */
export async function assertAdmin(): Promise<void> {
  const ctx = await accessContext();
  if (!ctx.isAdmin) throw new Error("admin only");
}

/**
 * 404, never 403 — the project-wide rule. An anonymous visitor and a
 * signed-in non-admin member are indistinguishable from someone requesting a
 * route that does not exist. A redirect to sign-in would confirm it does.
 *
 * Call this as the FIRST statement of every admin page body, before any query.
 * There is deliberately no admin layout performing this check: a layout gate
 * lets a future page inherit a check it never called.
 */
export async function requireAdminPage() {
  const ctx = await accessContext();
  if (!ctx.isAdmin) notFound();
  return ctx;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/admin-guard.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Point `mutations.ts` at the single definition**

In `lib/content/mutations.ts`, add the import beside the existing ones and replace the body of the private helper. **Do not export it.**

```ts
import { assertAdmin } from "@/lib/admin/guard";

// Delegates to the single definition in lib/admin/guard.ts so pages, action
// wrappers and these mutations cannot drift apart. Still NOT exported: this
// module is "use server", and an exported helper is a public endpoint.
async function requireAdmin(): Promise<void> {
  await assertAdmin();
}
```

- [ ] **Step 6: Prove the `"use server"` export rule still holds**

Run: `grep "^export" lib/content/mutations.ts`
Expected: only `export async function` lines — `setLessonAccess`, `publishLesson`, `saveLessonBody`, `promoteLessonDraft`. No `export const`, no `export type`, no `export {`.

- [ ] **Step 7: Run the full unit suite and the type check**

Run: `pnpm exec vitest run tests/unit` then `npx tsc --noEmit`
Expected: all previously-passing tests still pass; tsc exits 0.

- [ ] **Step 8: Commit**

```bash
git add lib/admin/guard.ts lib/content/mutations.ts tests/unit/admin-guard.test.ts
git status --short
git commit -m "feat: add the shared admin guard used by pages and actions"
```

---

### Task 2: Draft fingerprint

**Files:**
- Create: `lib/admin/fingerprint.ts`
- Test: `tests/unit/admin-fingerprint.test.ts`

**Interfaces:**
- Consumes: nothing but `node:crypto`.
- Produces: `canonicalJson(value: unknown): string` and `fingerprint(value: unknown): string` (64-char lowercase hex). Task 8's `promoteAction` and Task 12's review page both use `fingerprint`.

**Why:** the review page renders a draft, then the admin clicks Promote. If the MCP agent writes a *new* draft in between, promote would publish prose the human never saw — defeating the one control the whole write path rests on. The form carries the fingerprint of what was rendered and the action refuses on a mismatch.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/admin-fingerprint.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { canonicalJson, fingerprint } from "@/lib/admin/fingerprint";

describe("canonicalJson", () => {
  it("sorts object keys so key order cannot change the result", () => {
    expect(canonicalJson({ b: 1, a: 2 })).toBe(canonicalJson({ a: 2, b: 1 }));
  });

  it("preserves array order, which is meaningful for blocks", () => {
    expect(canonicalJson([1, 2])).not.toBe(canonicalJson([2, 1]));
  });

  it("sorts keys of objects nested inside arrays", () => {
    expect(canonicalJson([{ t: "p", c: [] }])).toBe(canonicalJson([{ c: [], t: "p" }]));
  });

  it("distinguishes null from absent", () => {
    expect(canonicalJson({ a: null })).not.toBe(canonicalJson({}));
  });
});

describe("fingerprint", () => {
  it("is a 64-character lowercase hex sha256", () => {
    expect(fingerprint([{ t: "p", c: [] }])).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is stable across key order", () => {
    expect(fingerprint({ b: 1, a: 2 })).toBe(fingerprint({ a: 2, b: 1 }));
  });

  it("differs when any content differs", () => {
    const a = [{ t: "p", c: [{ t: "text", v: "one" }] }];
    const b = [{ t: "p", c: [{ t: "text", v: "two" }] }];
    expect(fingerprint(a)).not.toBe(fingerprint(b));
  });

  it("differs when a block is added", () => {
    const a = [{ t: "p", c: [] }];
    const b = [{ t: "p", c: [] }, { t: "p", c: [] }];
    expect(fingerprint(a)).not.toBe(fingerprint(b));
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/admin-fingerprint.test.ts`
Expected: FAIL — cannot resolve `@/lib/admin/fingerprint`.

- [ ] **Step 3: Write the implementation**

Create `lib/admin/fingerprint.ts`:

```ts
import { createHash } from "node:crypto";

/**
 * JSON with object keys sorted at every depth, so two structurally identical
 * bodies hash the same regardless of the key order the driver happened to
 * return. Array order is preserved — for a Block[] it is the content order and
 * is absolutely meaningful.
 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}

/**
 * Identifies the exact draft body the review page rendered. Compared inside
 * promoteAction so a draft rewritten between page load and click is refused
 * rather than published unseen.
 *
 * NOT a lock: it narrows the race to the interval between the action's re-read
 * and the UPDATE, it does not close it. Closing it properly needs a conditional
 * UPDATE inside lib/content/write.ts, which is out of bounds here.
 */
export function fingerprint(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/admin-fingerprint.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/admin/fingerprint.ts tests/unit/admin-fingerprint.test.ts
git status --short
git commit -m "feat: add the draft fingerprint used to guard promote"
```

---

### Task 3: Block-level diff

**Files:**
- Create: `lib/admin/block-diff.ts`
- Test: `tests/unit/admin-block-diff.test.ts`

**Interfaces:**
- Consumes: `type Block` from `@/lib/content/blocks` (type-only import — this module must stay dependency-free at runtime).
- Produces: `type DiffTag = "same" | "added" | "removed" | "changed"`, `interface DiffRow { tag: DiffTag; live: Block | null; draft: Block | null }`, and `diffBlocks(live: Block[], draft: Block[]): DiffRow[]`. Task 12 renders these rows.

**Why:** two sixty-block columns side by side is not a review. Marking each block is what turns it into one.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/admin-block-diff.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { diffBlocks } from "@/lib/admin/block-diff";
import type { Block } from "@/lib/content/blocks";

const p = (v: string): Block => ({ t: "p", c: [{ t: "text", v }] }) as unknown as Block;
const tags = (rows: { tag: string }[]) => rows.map((r) => r.tag);

describe("diffBlocks", () => {
  it("marks identical bodies as all same", () => {
    const b = [p("a"), p("b"), p("c")];
    expect(tags(diffBlocks(b, b))).toEqual(["same", "same", "same"]);
  });

  it("marks a pure insertion as added and keeps the rest same", () => {
    const rows = diffBlocks([p("a"), p("c")], [p("a"), p("b"), p("c")]);
    expect(tags(rows)).toEqual(["same", "added", "same"]);
    expect(rows[1].live).toBeNull();
    expect(rows[1].draft).toEqual(p("b"));
  });

  it("marks a pure deletion as removed", () => {
    const rows = diffBlocks([p("a"), p("b"), p("c")], [p("a"), p("c")]);
    expect(tags(rows)).toEqual(["same", "removed", "same"]);
    expect(rows[1].draft).toBeNull();
    expect(rows[1].live).toEqual(p("b"));
  });

  it("pairs a removal followed by an insertion into a single changed row", () => {
    const rows = diffBlocks([p("a"), p("b"), p("c")], [p("a"), p("B"), p("c")]);
    expect(tags(rows)).toEqual(["same", "changed", "same"]);
    expect(rows[1].live).toEqual(p("b"));
    expect(rows[1].draft).toEqual(p("B"));
  });

  it("leaves the unpaired remainder as removed when more was deleted than added", () => {
    const rows = diffBlocks([p("a"), p("b"), p("c"), p("d")], [p("a"), p("B"), p("d")]);
    expect(tags(rows)).toEqual(["same", "changed", "removed", "same"]);
  });

  it("reports a swap truthfully rather than inventing a move", () => {
    const rows = diffBlocks([p("a"), p("b")], [p("b"), p("a")]);
    expect(rows).toHaveLength(3);
    expect(tags(rows)).toContain("same");
    expect(rows.filter((r) => r.tag === "same")).toHaveLength(1);
  });

  it("marks everything added when the live body is empty", () => {
    expect(tags(diffBlocks([], [p("a"), p("b")]))).toEqual(["added", "added"]);
  });

  it("marks everything removed when the draft body is empty", () => {
    expect(tags(diffBlocks([p("a"), p("b")], []))).toEqual(["removed", "removed"]);
  });

  it("returns nothing for two empty bodies", () => {
    expect(diffBlocks([], [])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/admin-block-diff.test.ts`
Expected: FAIL — cannot resolve `@/lib/admin/block-diff`.

- [ ] **Step 3: Write the implementation**

Create `lib/admin/block-diff.ts`:

```ts
import type { Block } from "@/lib/content/blocks";

export type DiffTag = "same" | "added" | "removed" | "changed";

export interface DiffRow {
  tag: DiffTag;
  /** The live block, or null when this row exists only in the draft. */
  live: Block | null;
  /** The draft block, or null when this row exists only in the live body. */
  draft: Block | null;
}

/**
 * A plain longest-common-subsequence alignment over each block's JSON. Equal
 * JSON is the equality relation; nothing here attempts move detection, so a
 * reorder reports as a removal plus an insertion. That is truthful and is what
 * an LCS does — inventing a "moved" tag would claim more than the algorithm
 * knows.
 *
 * Pure in, pure out, no rendering knowledge, so the whole behaviour is
 * unit-testable without a browser.
 */
export function diffBlocks(live: Block[], draft: Block[]): DiffRow[] {
  const a = live.map((b) => JSON.stringify(b));
  const b = draft.map((x) => JSON.stringify(x));
  const n = a.length;
  const m = b.length;

  // lcs[i][j] = length of the LCS of a[i..] and b[j..]
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const raw: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      raw.push({ tag: "same", live: live[i], draft: draft[j] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      raw.push({ tag: "removed", live: live[i], draft: null });
      i++;
    } else {
      raw.push({ tag: "added", live: null, draft: draft[j] });
      j++;
    }
  }
  while (i < n) raw.push({ tag: "removed", live: live[i++], draft: null });
  while (j < m) raw.push({ tag: "added", live: null, draft: draft[j++] });

  return coalesce(raw);
}

/**
 * A run of removals immediately followed by a run of insertions is what an
 * edit-in-place looks like to an LCS. Pairing them index-wise into `changed`
 * rows is what makes the review readable: a reworded paragraph shows as one
 * row with both versions, not as two rows the reader has to correlate by eye.
 * Whatever does not pair stays honestly removed or added.
 */
function coalesce(rows: DiffRow[]): DiffRow[] {
  const out: DiffRow[] = [];
  let k = 0;
  while (k < rows.length) {
    if (rows[k].tag !== "removed") {
      out.push(rows[k]);
      k++;
      continue;
    }
    let r = k;
    while (r < rows.length && rows[r].tag === "removed") r++;
    let d = r;
    while (d < rows.length && rows[d].tag === "added") d++;

    const removed = rows.slice(k, r);
    const added = rows.slice(r, d);
    const paired = Math.min(removed.length, added.length);

    for (let x = 0; x < paired; x++) {
      out.push({ tag: "changed", live: removed[x].live, draft: added[x].draft });
    }
    for (let x = paired; x < removed.length; x++) out.push(removed[x]);
    for (let x = paired; x < added.length; x++) out.push(added[x]);
    k = d;
  }
  return out;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/admin-block-diff.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/admin/block-diff.ts tests/unit/admin-block-diff.test.ts
git status --short
git commit -m "feat: add the block-level diff behind the draft review"
```

---

### Task 4: Lesson grouping, including the null-month rows

**Files:**
- Create: `lib/admin/group-lessons.ts`
- Test: `tests/unit/admin-group-lessons.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `interface ConsoleLessonRow`, `interface MonthGroup`, `interface SectionGroup`, `interface GroupedLessons`, and `groupLessons(rows: ConsoleLessonRow[]): GroupedLessons`. Task 5 returns `ConsoleLessonRow[]`; Task 11 renders `GroupedLessons`.

**Why null months are not an edge case:** `lib/db/schema.ts:60` says it outright — "reviews and exams belong to a section but to no month". `s1-review`, `s1-exam`, `s2-review` and `s2-exam` all carry `month_id = NULL`, as does every Playwright probe row. That is 4 of the 82 real rows. A grouping that keys on month without handling null either drops them from the list or invents a group called "null".

- [ ] **Step 1: Write the failing test**

Create `tests/unit/admin-group-lessons.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { groupLessons, type ConsoleLessonRow } from "@/lib/admin/group-lessons";

function row(over: Partial<ConsoleLessonRow>): ConsoleLessonRow {
  return {
    id: "m1-01",
    title: "T",
    access: "free",
    status: "published",
    hasDraft: false,
    writeOrigin: "import",
    sourceRef: null,
    sectionId: "s1",
    monthId: "m1",
    kind: "lesson",
    ...over,
  };
}

describe("groupLessons", () => {
  it("lifts every lesson with a pending draft into `pending`, in input order", () => {
    const g = groupLessons([
      row({ id: "m1-01" }),
      row({ id: "m1-02", hasDraft: true }),
      row({ id: "m2-01", monthId: "m2", hasDraft: true }),
    ]);
    expect(g.pending.map((l) => l.id)).toEqual(["m1-02", "m2-01"]);
  });

  it("still lists a pending lesson in its section tree — `pending` is a shortcut, not a move", () => {
    const g = groupLessons([row({ id: "m1-02", hasDraft: true })]);
    expect(g.sections[0].months[0].lessons.map((l) => l.id)).toEqual(["m1-02"]);
  });

  it("groups by section then month, preserving input order at both levels", () => {
    const g = groupLessons([
      row({ id: "m1-01", monthId: "m1" }),
      row({ id: "m2-01", monthId: "m2" }),
      row({ id: "p1-01", sectionId: "s2", monthId: "p1" }),
    ]);
    expect(g.sections.map((s) => s.sectionId)).toEqual(["s1", "s2"]);
    expect(g.sections[0].months.map((m) => m.monthId)).toEqual(["m1", "m2"]);
    expect(g.sections[1].months.map((m) => m.monthId)).toEqual(["p1"]);
  });

  it("puts null-month lessons under their section, not in a month group", () => {
    const g = groupLessons([
      row({ id: "m1-01", monthId: "m1" }),
      row({ id: "s1-exam", monthId: null, kind: "exam" }),
      row({ id: "s1-review", monthId: null, kind: "review" }),
    ]);
    expect(g.sections[0].months.map((m) => m.monthId)).toEqual(["m1"]);
    expect(g.sections[0].sectionLevel.map((l) => l.id)).toEqual(["s1-review", "s1-exam"]);
  });

  it("never creates a month group named null", () => {
    const g = groupLessons([row({ id: "s1-exam", monthId: null, kind: "exam" })]);
    for (const s of g.sections) {
      for (const m of s.months) expect(m.monthId).not.toBeNull();
      expect(s.months).toHaveLength(0);
    }
  });

  it("drops no lesson — every input appears exactly once in the section tree", () => {
    const rows = [
      row({ id: "m1-01", monthId: "m1" }),
      row({ id: "s1-review", monthId: null, kind: "review" }),
      row({ id: "p1-01", sectionId: "s2", monthId: "p1", hasDraft: true }),
      row({ id: "s2-exam", sectionId: "s2", monthId: null, kind: "exam" }),
    ];
    const g = groupLessons(rows);
    const seen = g.sections.flatMap((s) => [...s.months.flatMap((m) => m.lessons), ...s.sectionLevel]);
    expect(seen.map((l) => l.id).sort()).toEqual(["m1-01", "p1-01", "s1-review", "s2-exam"]);
  });

  it("returns empty structures for no input", () => {
    expect(groupLessons([])).toEqual({ pending: [], sections: [] });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/admin-group-lessons.test.ts`
Expected: FAIL — cannot resolve `@/lib/admin/group-lessons`.

- [ ] **Step 3: Write the implementation**

Create `lib/admin/group-lessons.ts`:

```ts
export interface ConsoleLessonRow {
  id: string;
  title: string;
  access: string;
  status: string;
  hasDraft: boolean;
  writeOrigin: string;
  sourceRef: string | null;
  sectionId: string;
  /** NULL for reviews and exams — schema.ts:60. Never assume it is set. */
  monthId: string | null;
  kind: string;
}

export interface MonthGroup {
  monthId: string;
  lessons: ConsoleLessonRow[];
}

export interface SectionGroup {
  sectionId: string;
  months: MonthGroup[];
  /** Reviews and exams: they belong to the section but to no month. */
  sectionLevel: ConsoleLessonRow[];
}

export interface GroupedLessons {
  /** A shortcut view. These lessons ALSO appear in `sections` — the tree is complete. */
  pending: ConsoleLessonRow[];
  sections: SectionGroup[];
}

/** Reading order for the section-level pages, matching queries.ts:209-214. */
const KIND_ORDER: Record<string, number> = { review: 0, exam: 1 };

/**
 * Pure. Input order is authoritative for months and lessons — the caller
 * (lib/admin/console-queries.ts) already orders by monthId, ord, id, and
 * re-sorting here would silently disagree with it.
 */
export function groupLessons(rows: ConsoleLessonRow[]): GroupedLessons {
  const sections: SectionGroup[] = [];
  const bySection = new Map<string, SectionGroup>();
  const byMonth = new Map<string, MonthGroup>();

  for (const row of rows) {
    let section = bySection.get(row.sectionId);
    if (!section) {
      section = { sectionId: row.sectionId, months: [], sectionLevel: [] };
      bySection.set(row.sectionId, section);
      sections.push(section);
    }

    if (row.monthId === null) {
      section.sectionLevel.push(row);
      continue;
    }

    const key = `${row.sectionId} ${row.monthId}`;
    let month = byMonth.get(key);
    if (!month) {
      month = { monthId: row.monthId, lessons: [] };
      byMonth.set(key, month);
      section.months.push(month);
    }
    month.lessons.push(row);
  }

  for (const section of sections) {
    section.sectionLevel.sort(
      (a, b) => (KIND_ORDER[a.kind] ?? 99) - (KIND_ORDER[b.kind] ?? 99) || (a.id < b.id ? -1 : 1),
    );
  }

  return { pending: rows.filter((r) => r.hasDraft), sections };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/admin-group-lessons.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/admin/group-lessons.ts tests/unit/admin-group-lessons.test.ts
git status --short
git commit -m "feat: group console lessons by section and month, null months included"
```

---

### Task 5: Share the media→figures transform, and add the console query

**Files:**
- Create: `lib/content/figures.ts`
- Create: `lib/admin/console-queries.ts`
- Modify: `app/lesson/[id]/page.tsx:84-92` (replace the inline map with the shared helper)
- Test: `tests/unit/figures-from-media.test.ts`

**Interfaces:**
- Consumes: `VariantGroup` from `@/lib/media` (type only), `FigureSources` from `@/components/blocks/FigureImage` (type only), `ConsoleLessonRow` from Task 4.
- Produces: `figuresFromMedia(groups: VariantGroup[]): FigureSources[]` and `listLessonsForConsole(): Promise<ConsoleLessonRow[]>`. Tasks 11 and 12 use both.

**Why the transform is shared:** `getLessonMedia()` returns `VariantGroup[]`, but `BlockRenderer` takes `FigureSources[]`. `app/lesson/[id]/page.tsx:84-92` bridges them. Copying that into the admin page would let the reviewer's view drift from the reader's view it is supposed to reproduce — in a project where charts are half the content.

**Why a new query module rather than extending `listLessonsAdmin`:** `listLessonsAdmin` is returned verbatim as the MCP `list_lessons` tool output at `mcp/server.ts:139`. Adding `sectionId`/`monthId` to it would change that tool's shape. The console gets its own query; `lib/content/admin-queries.ts` is not touched.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/figures-from-media.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { figuresFromMedia } from "@/lib/content/figures";

const group = (over: Record<string, unknown> = {}) =>
  ({
    original: { id: "orig-1", width: 1200, height: 800, alt: "a chart" },
    webp: { id: "webp-1" },
    avif: { id: "avif-1" },
    ...over,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

describe("figuresFromMedia", () => {
  it("maps ids to /api/media URLs and carries the dimensions through", () => {
    expect(figuresFromMedia([group()])).toEqual([
      {
        src: "/api/media/orig-1",
        webp: "/api/media/webp-1",
        avif: "/api/media/avif-1",
        width: 1200,
        height: 800,
        alt: "a chart",
      },
    ]);
  });

  it("leaves webp undefined when there is no webp variant", () => {
    expect(figuresFromMedia([group({ webp: null })])[0].webp).toBeUndefined();
  });

  it("leaves avif undefined when there is no avif variant", () => {
    expect(figuresFromMedia([group({ avif: null })])[0].avif).toBeUndefined();
  });

  it("preserves order", () => {
    const rows = figuresFromMedia([
      group({ original: { id: "a", width: 1, height: 1, alt: "" } }),
      group({ original: { id: "b", width: 1, height: 1, alt: "" } }),
    ]);
    expect(rows.map((f) => f.src)).toEqual(["/api/media/a", "/api/media/b"]);
  });

  it("returns an empty array for a lesson with no media", () => {
    expect(figuresFromMedia([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/figures-from-media.test.ts`
Expected: FAIL — cannot resolve `@/lib/content/figures`.

- [ ] **Step 3: Write the shared transform**

Create `lib/content/figures.ts`:

```ts
import type { VariantGroup } from "@/lib/media";
import type { FigureSources } from "@/components/blocks/FigureImage";

/**
 * getLessonMedia() returns VariantGroup[]; BlockRenderer takes FigureSources[].
 * This is the bridge, extracted from app/lesson/[id]/page.tsx so the admin
 * review page renders charts through the SAME transform the reader gets. A copy
 * would let the reviewer's view drift from the view it exists to reproduce.
 *
 * Every id becomes a /api/media/{id} URL; that route runs its own access check,
 * so nothing here is a gate.
 */
export function figuresFromMedia(groups: VariantGroup[]): FigureSources[] {
  return groups.map((g) => ({
    src: `/api/media/${g.original.id}`,
    webp: g.webp ? `/api/media/${g.webp.id}` : undefined,
    avif: g.avif ? `/api/media/${g.avif.id}` : undefined,
    width: g.original.width,
    height: g.original.height,
    alt: g.original.alt,
  }));
}
```

**The import path is `@/lib/media`, not `@/lib/content/queries`.** `queries.ts` does not export the type — it imports it itself at `queries.ts:5` (`import { pickVariants, type VariantGroup } from "@/lib/media"`). `lib/media.ts` is frozen, but importing a type from it reads rather than modifies it, which is fine. Confirm with `grep -n "VariantGroup" lib/media.ts` before writing the file.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/figures-from-media.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Point the lesson page at the shared helper**

In `app/lesson/[id]/page.tsx`, replace the inline map (currently lines 84-92) with:

```ts
const figures = figuresFromMedia(groups);
```

and add `import { figuresFromMedia } from "@/lib/content/figures";` to the imports. **Change nothing else in that file in this task** — the `.inner` wrapper move is Task 10.

- [ ] **Step 6: Write the console query**

Create `lib/admin/console-queries.ts`:

```ts
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessons } from "@/lib/db/schema";
import type { ConsoleLessonRow } from "./group-lessons";

/**
 * ADMIN ONLY. Every caller must have passed requireAdminPage() first — this
 * function performs NO check of its own and selects body_draft's presence,
 * which invariant 6 makes admin-only unconditionally.
 *
 * Deliberately separate from lib/content/admin-queries.ts's listLessonsAdmin:
 * that function's return value IS the MCP `list_lessons` tool output
 * (mcp/server.ts:139), so adding sectionId/monthId to it would change the tool's
 * shape. The console needs those two columns to group; the agent does not.
 *
 * Imports @/lib/db directly rather than taking an injected handle: this module
 * is only ever imported from app/**, which may do that freely. mcp/** and
 * scripts/** must not — lib/db/index.ts:1 is `import "server-only"`, a package
 * that is not installed and only Next and Vitest alias.
 *
 * Ordering matches admin-queries: monthId, then ord, then id. ord is per-month,
 * so ordering by ord alone would interleave months.
 */
export async function listLessonsForConsole(): Promise<ConsoleLessonRow[]> {
  const rows = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      access: lessons.access,
      status: lessons.status,
      bodyDraft: lessons.bodyDraft,
      writeOrigin: lessons.writeOrigin,
      sourceRef: lessons.sourceRef,
      sectionId: lessons.sectionId,
      monthId: lessons.monthId,
      kind: lessons.kind,
    })
    .from(lessons)
    .orderBy(asc(lessons.sectionId), asc(lessons.monthId), asc(lessons.ord), asc(lessons.id));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    access: r.access,
    status: r.status,
    hasDraft: r.bodyDraft != null,
    writeOrigin: r.writeOrigin,
    sourceRef: r.sourceRef ?? null,
    sectionId: r.sectionId,
    monthId: r.monthId ?? null,
    kind: r.kind,
  }));
}
```

- [ ] **Step 7: Run the unit suite and the type check**

Run: `pnpm exec vitest run tests/unit` then `npx tsc --noEmit`
Expected: all pass; tsc exits 0.

- [ ] **Step 8: Commit**

```bash
git add lib/content/figures.ts lib/admin/console-queries.ts app/lesson/[id]/page.tsx tests/unit/figures-from-media.test.ts
git status --short
git commit -m "refactor: share the media→figures transform; add the console lesson query"
```

---

# Phase 2 — schema and the action surface

### Task 6: The `admin_actions` table, migration 0005

**Files:**
- Modify: `lib/db/schema.ts` (append the table beside `userRoles` / `entitlements`)
- Create: `drizzle/0005_*.sql` — **generated, never hand-written**

**Interfaces:**
- Produces: `adminActions` table export and `AdminActionRow` type. Task 8 writes rows; Tasks 9 and 15 count them.

**Before starting, snapshot the database** — you are about to run a migration against production:

```bash
node --env-file=.env.local -e "const {neon}=require('@neondatabase/serverless');const s=neon(process.env.DATABASE_URL);(async()=>{console.log(await s\`select (select count(*) from lessons) lessons, (select count(*) from quiz_questions) questions, (select count(*) from lessons where body_draft is not null) drafts, (select count(*) from lessons where write_origin='cms') cms, (select count(*) from lessons where status<>'published') unpub, (select count(*) from quiz_results) results\`)})()"
```

Expected: `82 · 564 · 0 · 0 · 0 · 0`. **Stop and report if it differs.**

- [ ] **Step 1: Add the table to the schema**

In `lib/db/schema.ts`, after the `entitlements` table and before its `$inferSelect` exports:

```ts
/**
 * A record of what the admin console did. Deliberately NOT a control:
 * invariant 13 — nothing reads this to make an authorization decision, and a
 * failure to write a row never fails the action it describes.
 *
 * No FK to lessons: a cascade would delete a lesson's history along with the
 * lesson, destroying exactly the record you would want afterwards.
 */
export const adminActions = pgTable(
  "admin_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
    /** neon_auth."user".id, or null when the actor was not signed in. NEVER the email. */
    actorUserId: text("actor_user_id"),
    /** 'promote' | 'discard' | 'set_status' | 'set_access' */
    action: text("action").notNull(),
    /** Plain text, no foreign key — see above. */
    lessonId: text("lesson_id"),
    /** 'ok' | 'noop' | 'denied' | 'error' */
    outcome: text("outcome").notNull(),
    /** Field values and the draft fingerprint. NEVER body content (invariant 6). */
    detail: jsonb("detail"),
  },
  (t) => [index("admin_actions_at_idx").on(t.at)],
);
```

and beside the other row-type exports:

```ts
export type AdminActionRow = typeof adminActions.$inferSelect;
```

Every identifier used here — `pgTable`, `text`, `timestamp`, `uuid`, `jsonb`, `index` — is already imported at `lib/db/schema.ts:1-16`. Add no imports.

- [ ] **Step 2: Generate the migration**

Run: `pnpm db:generate`
Expected: a new `drizzle/0005_*.sql` and an updated `drizzle/meta/`.

- [ ] **Step 3: Read the generated SQL before applying it**

Run: `cat drizzle/0005_*.sql`

Confirm it contains exactly one `CREATE TABLE "admin_actions"` plus one `CREATE INDEX`, touches no other table, and is replayable in the order written. drizzle-kit emits statements alphabetically by table, which on this project once put a constraint before its dependency and failed mid-apply. **If it touches any other table, stop and report** — that means the schema file drifted from the database.

- [ ] **Step 4: Verify the migration set is coherent**

Run: `pnpm exec drizzle-kit check`
Expected: "Everything's fine".

- [ ] **Step 5: Apply it**

Run: `pnpm db:migrate`
Expected: success, no errors.

- [ ] **Step 6: Confirm the table exists and is empty, and nothing else moved**

```bash
node --env-file=.env.local -e "const {neon}=require('@neondatabase/serverless');const s=neon(process.env.DATABASE_URL);(async()=>{console.log(await s\`select (select count(*) from admin_actions) audit, (select count(*) from lessons) lessons, (select count(*) from quiz_questions) questions, (select count(*) from quiz_results) results\`)})()"
```

Expected: `0 · 82 · 564 · 0`.

- [ ] **Step 7: Type check**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 8: Commit**

```bash
git add lib/db/schema.ts drizzle/
git status --short
git commit -m "feat: add the admin_actions audit table (migration 0005)"
```

---

### Task 7: Expose `discardDraft` through the mutations surface

**Files:**
- Modify: `lib/content/mutations.ts` (append one function)
- Test: `tests/unit/admin-mutations.test.ts`

**Interfaces:**
- Consumes: `writer.discardDraft(id)` — already complete at `lib/content/write.ts:97`, purging all three cache tags and `RETURNING`-guarding a missed row.
- Produces: `discardLessonDraft(id: string): Promise<boolean>`. Task 8 wraps it.

**`lib/content/write.ts` is NOT modified.** The writer already does the work; only its exposure was missing.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/admin-mutations.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/admin-mutations.test.ts`
Expected: FAIL — `discardLessonDraft` is not exported.

- [ ] **Step 3: Write the implementation**

Append to `lib/content/mutations.ts`, directly after `promoteLessonDraft`:

```ts
/**
 * The other half of the human gate. `false` means there was no draft pending —
 * a real outcome the caller must surface, never a silent success. The writer's
 * discardDraft (write.ts:97) already clears body_draft AND source_ref_draft
 * together and purges all three cache tags; nothing is reimplemented here.
 *
 * IRRECOVERABLE: the draft prose is gone afterwards. The console puts this
 * behind a typed confirmation for that reason.
 */
export async function discardLessonDraft(id: string): Promise<boolean> {
  await requireAdmin();
  return writer.discardDraft(id);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/admin-mutations.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Re-prove the `"use server"` export rule**

Run: `grep "^export" lib/content/mutations.ts`
Expected: five `export async function` lines and nothing else.

- [ ] **Step 6: Commit**

```bash
git add lib/content/mutations.ts tests/unit/admin-mutations.test.ts
git status --short
git commit -m "feat: expose discardLessonDraft through the mutations surface"
```

---

### Task 8: The action wrappers and the audit write

**Files:**
- Create: `lib/admin/audit.ts`
- Create: `app/admin/actions.ts`
- Test: `tests/unit/admin-actions.test.ts`

**Interfaces:**
- Consumes: `assertAdmin` (Task 1), `fingerprint` (Task 2), `discardLessonDraft` (Task 7), and the existing `promoteLessonDraft`, `publishLesson`, `setLessonAccess`; `getLessonDraftBody` via `createAdminQueries({ db })`.
- Produces: `type ActionResult = { ok: boolean; message: string }` and four `useActionState`-shaped actions: `promoteAction`, `discardAction`, `setStatusAction`, `setAccessAction`, each `(prev: ActionResult | null, form: FormData) => Promise<ActionResult>`. Task 12 binds all four to forms.

**Why wrappers exist at all:** `promoteLessonDraft` returns `false` for "no draft pending". At the publish gate, a no-op that renders as success is the worst possible failure mode, and a raw `throw` hitting an error boundary tells the admin nothing.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/admin-actions.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/admin-actions.test.ts`
Expected: FAIL — cannot resolve `@/app/admin/actions`.

- [ ] **Step 3: Write the audit recorder**

Create `lib/admin/audit.ts`:

```ts
import { db } from "@/lib/db";
import { adminActions } from "@/lib/db/schema";

export interface AdminActionRecord {
  actorUserId: string | null;
  action: "promote" | "discard" | "set_status" | "set_access";
  lessonId: string | null;
  outcome: "ok" | "noop" | "denied" | "error";
  /** Field values and the draft fingerprint ONLY. Never body content. */
  detail?: Record<string, unknown>;
}

/**
 * Writes one audit row. Invariant 13: this is a RECORD, not a control — nothing
 * reads it to make an authorization decision, and the caller must never let its
 * failure fail the action it describes.
 *
 * The write happens AFTER the mutation, as a separate round trip: neon-http has
 * no interactive transactions, and making it atomic would mean a db.batch inside
 * lib/content/write.ts, which is out of bounds. So a crash between the two loses
 * the log entry, never the write.
 *
 * `detail` must never carry body content — the audit table must not become a
 * second, ungated copy of draft prose (invariant 6).
 */
export async function recordAdminAction(record: AdminActionRecord): Promise<void> {
  await db.insert(adminActions).values({
    actorUserId: record.actorUserId,
    action: record.action,
    lessonId: record.lessonId,
    outcome: record.outcome,
    detail: record.detail ?? null,
  });
}
```

- [ ] **Step 4: Write the action wrappers**

Create `app/admin/actions.ts`:

```ts
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

/**
 * THIS MODULE IS "use server". It may export ONLY async functions — anything
 * else becomes a broken endpoint, invisible to lint, tsc and build, detonating
 * on an authenticated render. So the return type is declared here as a LOCAL,
 * un-exported `Result`; the client components import the structurally identical
 * `ActionResult` from lib/admin/action-result.ts instead. TypeScript matches the
 * two structurally, so nothing is lost and no type leaves this module.
 * Verify with: grep "^export" app/admin/actions.ts
 */

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

type Result = { ok: boolean; message: string };

/**
 * Every wrapper performs its OWN assertAdmin() and then delegates to a mutation
 * that checks again. That is one definition called twice, not two definitions
 * that can drift — and it means neither the page's gate nor the mutation's is
 * load-bearing on its own.
 */
async function guarded(
  action: AdminActionRecord["action"],
  lessonId: string | null,
  run: () => Promise<Result>,
  detail?: Record<string, unknown>,
): Promise<Result> {
  const actor = await actorId();
  try {
    await assertAdmin();
  } catch {
    await safeRecord({ actorUserId: actor, action, lessonId, outcome: "denied", detail });
    return { ok: false, message: "not authorized" };
  }
  try {
    const result = await run();
    await safeRecord({
      actorUserId: actor,
      action,
      lessonId,
      outcome: result.ok ? "ok" : "noop",
      detail,
    });
    return result;
  } catch (err) {
    await safeRecord({ actorUserId: actor, action, lessonId, outcome: "error", detail });
    return { ok: false, message: err instanceof Error ? err.message : "unknown error" };
  }
}

export async function promoteAction(_prev: Result | null, form: FormData): Promise<Result> {
  const id = String(form.get("id") ?? "");
  const seen = String(form.get("fingerprint") ?? "");
  return guarded(
    "promote",
    id,
    async () => {
      const admin = createAdminQueries({ db });
      const current = await admin.getLessonDraftBody(id);
      if (current === null) return { ok: false, message: `no draft pending for ${id}` };
      if (fingerprint(current) !== seen) {
        return {
          ok: false,
          message: "the draft changed since you opened this page — reload and re-read it before promoting",
        };
      }
      const ok = await promoteLessonDraft(id);
      return ok
        ? { ok: true, message: `promoted the draft for ${id}` }
        : { ok: false, message: `no draft pending for ${id}` };
    },
    { fingerprint: seen },
  );
}

export async function discardAction(_prev: Result | null, form: FormData): Promise<Result> {
  const id = String(form.get("id") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  return guarded("discard", id, async () => {
    if (confirm !== id) {
      return { ok: false, message: `type the lesson id (${id}) to confirm — the draft cannot be recovered` };
    }
    const ok = await discardLessonDraft(id);
    return ok
      ? { ok: true, message: `discarded the draft for ${id}` }
      : { ok: false, message: `no draft pending for ${id}` };
  });
}

const STATUSES = ["draft", "published"] as const;
const ACCESSES = ["free", "members", "admin"] as const;

export async function setStatusAction(_prev: Result | null, form: FormData): Promise<Result> {
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  return guarded(
    "set_status",
    id,
    async () => {
      if (!(STATUSES as readonly string[]).includes(status)) {
        return { ok: false, message: `unknown status: ${status}` };
      }
      await publishLesson(id, status as (typeof STATUSES)[number]);
      return { ok: true, message: `${id} is now ${status}` };
    },
    { status },
  );
}

export async function setAccessAction(_prev: Result | null, form: FormData): Promise<Result> {
  const id = String(form.get("id") ?? "");
  const access = String(form.get("access") ?? "");
  return guarded(
    "set_access",
    id,
    async () => {
      if (!(ACCESSES as readonly string[]).includes(access)) {
        return { ok: false, message: `unknown access: ${access}` };
      }
      await setLessonAccess(id, access as (typeof ACCESSES)[number]);
      return { ok: true, message: `${id} access is now ${access}` };
    },
    { access },
  );
}
```

- [ ] **Step 5: Give the client components a type to import**

Create `lib/admin/action-result.ts` (a plain module, so the type can be imported without touching the `"use server"` file):

```ts
/** The shape every admin action returns. Rendered by components/admin/ActionButton. */
export interface ActionResult {
  ok: boolean;
  message: string;
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/admin-actions.test.ts`
Expected: PASS, 14 tests.

- [ ] **Step 7: Prove the `"use server"` export rule**

Run: `grep "^export" app/admin/actions.ts`
Expected: exactly four `export async function` lines. **If a `export type`, `export const` or `export interface` appears, move it to `lib/admin/action-result.ts` before continuing.**

- [ ] **Step 8: Run the unit suite and the type check**

Run: `pnpm exec vitest run tests/unit` then `npx tsc --noEmit`
Expected: all pass; tsc exits 0.

- [ ] **Step 9: Commit**

```bash
git add lib/admin/audit.ts lib/admin/action-result.ts app/admin/actions.ts tests/unit/admin-actions.test.ts
git status --short
git commit -m "feat: add the admin action wrappers and the audit record"
```

---

### Task 9: Integration tests against the real database

**Files:**
- Create: `tests/integration/admin-console-db.test.ts`

**Interfaces:**
- Consumes: `createWriter` from `@/lib/content/write` (to plant a draft out of band) and `createAdminQueries`.
- Produces: nothing new — this task only proves Tasks 7 and 8 behave against real Postgres.

**Read this before writing a line.** These tests run against the **production** database. `m1-01` is the shared fixture and two other integration files already mutate it; `vitest.integration.config.ts` sets `fileParallelism: false` for exactly that reason and this new file depends on it. Capture in `beforeAll`, restore in `try/finally` **and** an `afterAll` backstop. No `begin`/`rollback` — on neon-http those are three separate sessions and the write commits.

- [ ] **Step 1: Write the failing test**

Create `tests/integration/admin-console-db.test.ts`:

```ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { lessons } from "@/lib/db/schema";
import { createWriter } from "@/lib/content/write";

const ID = "m1-01";
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);
const writer = createWriter({ db, revalidate: async () => {} });

type Snapshot = {
  body: unknown;
  bodyDraft: unknown;
  sourceRef: string | null;
  sourceRefDraft: string | null;
  writeOrigin: string;
};
let snapshot: Snapshot;

async function readRow(): Promise<Snapshot> {
  const [row] = await db
    .select({
      body: lessons.body,
      bodyDraft: lessons.bodyDraft,
      sourceRef: lessons.sourceRef,
      sourceRefDraft: lessons.sourceRefDraft,
      writeOrigin: lessons.writeOrigin,
    })
    .from(lessons)
    .where(eq(lessons.id, ID));
  return row as Snapshot;
}

/** Byte-exact restore. Counts cannot see a rewritten row; this can. */
async function restore(): Promise<void> {
  await db
    .update(lessons)
    .set({
      body: snapshot.body,
      bodyDraft: snapshot.bodyDraft,
      sourceRef: snapshot.sourceRef,
      sourceRefDraft: snapshot.sourceRefDraft,
      writeOrigin: snapshot.writeOrigin,
    })
    .where(eq(lessons.id, ID));
  await sql`delete from admin_actions where lesson_id = ${ID}`;
}

beforeAll(async () => {
  snapshot = await readRow();
  expect(snapshot.bodyDraft, "m1-01 must start with no pending draft").toBeNull();
});

afterAll(restore);

describe("discardLessonDraft against real Postgres", () => {
  it("clears body_draft AND source_ref_draft together, leaving the live body untouched", async () => {
    try {
      await writer.writeLessonBody(
        ID,
        [{ t: "p", c: [{ t: "text", v: "throwaway draft" }] }],
        "notes/ict-core/INDEX.md",
      );
      const planted = await readRow();
      expect(planted.bodyDraft).not.toBeNull();
      expect(planted.sourceRefDraft).toBe("notes/ict-core/INDEX.md");

      // The WRITER is exercised directly, NOT lib/content/mutations.ts. That
      // module is "use server" and imports next/cache; pulling it into a plain
      // Vitest process is a different failure class entirely. Its authorization
      // half is covered by tests/unit/admin-mutations.test.ts and by the Task 15
      // mutation test — this file's job is the DB behaviour.
      const ok = await writer.discardDraft(ID);
      expect(ok).toBe(true);

      const after = await readRow();
      expect(after.bodyDraft).toBeNull();
      expect(after.sourceRefDraft).toBeNull();
      expect(JSON.stringify(after.body)).toBe(JSON.stringify(snapshot.body));
    } finally {
      await restore();
    }
  });

  it("returns false when there is no draft to discard", async () => {
    expect(await writer.discardDraft(ID)).toBe(false);
  });
});

describe("the audit record", () => {
  it("writes the row and never stores body content", async () => {
    try {
      const { recordAdminAction } = await import("@/lib/admin/audit");
      await recordAdminAction({
        actorUserId: "integration-test-actor",
        action: "promote",
        lessonId: ID,
        outcome: "ok",
        detail: { fingerprint: "deadbeef" },
      });
      const rows = await sql`select action, outcome, lesson_id, detail from admin_actions where lesson_id = ${ID}`;
      expect(rows).toHaveLength(1);
      expect(rows[0].action).toBe("promote");
      expect(rows[0].outcome).toBe("ok");
      const detail = JSON.stringify(rows[0].detail);
      expect(detail).toContain("deadbeef");
      // Invariant 6: the audit table must not become a second copy of prose.
      expect(detail).not.toMatch(/"t"\s*:\s*"p"/);
      expect(detail).not.toContain("throwaway draft");
    } finally {
      await sql`delete from admin_actions where lesson_id = ${ID}`;
    }
  });
});
```

Note: `lib/admin/audit.ts` imports `@/lib/db`, which is `server-only`. The integration config aliases it the same way the unit config does — confirm with `grep -n "server-only" vitest.integration.config.ts` before running. If it does not, add the same alias `vitest.config.ts` uses; do **not** change `lib/db/index.ts`.

- [ ] **Step 2: Run the test**

Run: `pnpm test:integration`
Expected: the new file passes alongside the existing integration files. Read the exit code in the **foreground**.

- [ ] **Step 3: Confirm the database is exactly where it started**

```bash
node --env-file=.env.local -e "const {neon}=require('@neondatabase/serverless');const s=neon(process.env.DATABASE_URL);(async()=>{console.log(await s\`select (select count(*) from lessons) lessons, (select count(*) from quiz_questions) questions, (select count(*) from lessons where body_draft is not null) drafts, (select count(*) from lessons where write_origin='cms') cms, (select count(*) from quiz_results) results, (select count(*) from admin_actions) audit\`)})()"
```

Expected: `82 · 564 · 0 · 0 · 0 · 0`.

**Note on `write_origin`:** `writeLessonBody` sets it to `'cms'`, and `discardDraft` does **not** reset it. The `restore()` helper above therefore restores `writeOrigin` explicitly. If the `cms` count is not 0, `restore()` did not run — investigate before continuing.

- [ ] **Step 4: Commit**

```bash
git add tests/integration/admin-console-db.test.ts
git status --short
git commit -m "test: cover discard and the audit record against the real database"
```

---

# Phase 3 — the UI

### Task 10: Move the width wrapper, and add the robots header

**Files:**
- Modify: `app/layout.tsx` (drop the `.inner` wrapper)
- Modify: `app/page.tsx`, `app/lesson/[id]/page.tsx`, `app/auth/[path]/page.tsx` (each gains it)
- Modify: `next.config.ts` (add `headers()`)
- Create: `app/not-found.tsx` **only if** Step 4 shows it is needed

**Interfaces:** none — this is a layout refactor plus one config key.

**Why:** `.inner` caps content at `--content-max: 880px`. A nested layout cannot widen an ancestor's `max-width`, and CSS custom properties inherit downward only, so the admin console cannot escape it while the wrapper lives in the root layout. Moving it down one level leaves the DOM for every existing page **identical**.

- [ ] **Step 1: Drop the wrapper from the root layout**

In `app/layout.tsx`, replace:

```tsx
<main className={styles.main}>
  <div className={styles.inner}>{children}</div>
</main>
```

with:

```tsx
<main className={styles.main}>{children}</main>
```

- [ ] **Step 2: Give it back to each existing page**

`app/page.tsx` — wrap the returned `<section className={styles.home}>` in:

```tsx
import shell from "@/app/shell.module.css";
// …
return <div className={shell.inner}>{/* the existing <section> unchanged */}</div>;
```

`app/lesson/[id]/page.tsx` — wrap **both** returns (the locked branch and the full branch) in `<div className={shell.inner}>…</div>`, importing `shell` the same way.

`app/auth/[path]/page.tsx` — wrap its `<main className={styles.authWrap}>` the same way. (That page already renders a `<main>` inside the layout's `<main>`; this change must not worsen that nesting, so the wrapper goes in the position the layout previously supplied — outside its `<main>`.)

- [ ] **Step 3: Add the robots header**

In `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  experimental: {
    // Notes autosave posts the whole note document.
    serverActions: { bodySizeLimit: "10mb" },
  },
  async headers() {
    return [
      {
        // The console is gated on identity; this only keeps it out of indexes.
        // Deliberately NOT paired with a robots.txt Disallow — that would
        // advertise the path to anyone who reads it.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};
```

- [ ] **Step 4: Build and eyeball the three existing pages**

```bash
rm -rf .next && pnpm build
```

Read the exit code in the **foreground**; it must be 0. Then `pnpm start` and check `/`, `/lesson/m1-01`, `/auth/sign-in` and a deliberately bad URL such as `/lesson/does-not-exist`. If the 404 page now looks unstyled or full-bleed, create `app/not-found.tsx`:

```tsx
import shell from "@/app/shell.module.css";

export default function NotFound() {
  return (
    <div className={shell.inner}>
      <h1>Not found</h1>
      <p>That page does not exist.</p>
    </div>
  );
}
```

- [ ] **Step 5: Confirm the header is actually served**

```bash
curl -sI http://localhost:3000/admin | grep -i x-robots-tag
```

Expected: `x-robots-tag: noindex, nofollow`. (The page itself will 404 — the header still applies.)

- [ ] **Step 6: Run the existing e2e suite as the regression net**

Run: `pnpm test:e2e`
Expected: the current 35/35 still pass, zero skipped. This is what proves the layout move changed nothing for readers. Read the exit code in the **foreground**.

- [ ] **Step 7: Commit**

```bash
git add app/layout.tsx app/page.tsx "app/lesson/[id]/page.tsx" "app/auth/[path]/page.tsx" next.config.ts
git status --short
git commit -m "refactor: move the width wrapper into the pages; noindex /admin"
```

---

### Task 11: The lesson list at `/admin`

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/admin/admin.module.css`

**Interfaces:**
- Consumes: `requireAdminPage` (Task 1), `listLessonsForConsole` (Task 5), `groupLessons` (Task 4).
- Produces: the route `/admin`. Task 13 asserts it 404s for non-admins; Task 14 asserts its content for an admin.

- [ ] **Step 1: Write the page**

Create `app/admin/page.tsx`:

```tsx
import Link from "next/link";
import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin/guard";
import { listLessonsForConsole } from "@/lib/admin/console-queries";
import { groupLessons, type ConsoleLessonRow } from "@/lib/admin/group-lessons";
import styles from "./admin.module.css";

/**
 * Fully dynamic for the same reason app/lesson/[id]/page.tsx is: this route
 * reads cookies() via accessContext(), and on Next 16.2.11 a static-generation
 * attempt over that throws DynamicServerError which is never converted into a
 * per-request dynamic render — it escapes as an uncaught 500.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — The Algorithm",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // FIRST statement, before any query. There is deliberately no admin layout
  // doing this — a layout gate lets a future page inherit a check it never
  // called, and hidden UI is not authorization.
  await requireAdminPage();

  const rows = await listLessonsForConsole();
  const { pending, sections } = groupLessons(rows);

  return (
    <div className={styles.console}>
      <h1>Admin</h1>
      <p className={styles.sub}>
        {rows.length} lessons · {pending.length} pending review
      </p>

      <section aria-labelledby="pending-heading">
        <h2 id="pending-heading">Pending review</h2>
        {pending.length === 0 ? (
          <p className={styles.empty} data-testid="no-pending">
            No drafts are waiting.
          </p>
        ) : (
          <LessonTable rows={pending} testid="pending-table" />
        )}
      </section>

      {sections.map((s) => (
        <section key={s.sectionId} aria-labelledby={`sec-${s.sectionId}`}>
          <h2 id={`sec-${s.sectionId}`}>{s.sectionId}</h2>
          {s.months.map((m) => (
            <div key={m.monthId}>
              <h3>{m.monthId}</h3>
              <LessonTable rows={m.lessons} />
            </div>
          ))}
          {s.sectionLevel.length > 0 ? (
            <div>
              <h3>Section pages</h3>
              <LessonTable rows={s.sectionLevel} />
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function LessonTable({ rows, testid }: { rows: ConsoleLessonRow[]; testid?: string }) {
  return (
    <table className={styles.table} data-testid={testid}>
      <thead>
        <tr>
          <th>id</th>
          <th>title</th>
          <th>status</th>
          <th>access</th>
          <th>draft</th>
          <th>origin</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((l) => (
          <tr key={l.id} data-testid={`row-${l.id}`}>
            <td>
              <Link href={`/admin/lesson/${l.id}`}>{l.id}</Link>
            </td>
            <td>{l.title}</td>
            <td>{l.status}</td>
            <td>{l.access}</td>
            <td>{l.hasDraft ? <span className={styles.badge}>pending</span> : ""}</td>
            <td>{l.writeOrigin}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: Write the stylesheet**

Create `app/admin/admin.module.css`. Use the existing design tokens from `app/globals.css` (`--panel`, `--border`, `--muted`, `--gold`, `--green`, `--red`, `--radius`) — do not introduce new colours.

```css
.console {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 32px 80px;
}
.sub {
  color: var(--muted);
  margin-bottom: 24px;
}
.empty {
  color: var(--dim);
}
.table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0 28px;
  font-size: 14px;
}
.table th,
.table td {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
}
.table th {
  color: var(--muted);
  font-weight: 600;
}
.badge {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--gold) 22%, transparent);
  color: var(--gold);
  font-size: 12px;
}
```

- [ ] **Step 3: Build and check the route by hand**

```bash
rm -rf .next && pnpm build
```

Exit code 0, in the **foreground**. Then `pnpm start`, sign in as the admin account in a browser, and load `/admin`. Expected: 82 lessons listed, "No drafts are waiting", and the four section-level rows (`s1-review`, `s1-exam`, `s2-review`, `s2-exam`) appearing under **Section pages**, not in a month group. Sign out and reload: **404**.

- [ ] **Step 4: Commit**

```bash
git add app/admin/page.tsx app/admin/admin.module.css
git status --short
git commit -m "feat: add the admin lesson list at /admin"
```

---

### Task 12: The lesson detail and draft review at `/admin/lesson/[id]`

**Files:**
- Create: `app/admin/lesson/[id]/page.tsx`
- Create: `components/admin/ActionButton.tsx`
- Create: `components/admin/DiscardForm.tsx`
- Create: `components/admin/admin-forms.module.css`

**Interfaces:**
- Consumes: `requireAdminPage`, `createAdminQueries().getLessonForEdit`, `getLessonMedia`, `figuresFromMedia`, `diffBlocks`, `fingerprint`, all four actions from Task 8, `ActionResult` from `lib/admin/action-result.ts`.
- Produces: the route `/admin/lesson/[id]`.

- [ ] **Step 1: Write the client button**

Create `components/admin/ActionButton.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/admin/action-result";
import styles from "./admin-forms.module.css";

/**
 * Renders the {ok, message} an action returns. This is why the wrappers exist:
 * promoteLessonDraft returns false for "no draft pending", and at the publish
 * gate a no-op that looks like success is the worst possible failure mode.
 */
export function ActionButton({
  action,
  label,
  hidden = {},
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>;
  label: string;
  hidden?: Record<string, string>;
}) {
  // No confirmation prop: the only action needing one is discard, and
  // DiscardForm owns that with a typed id. An unused option here would be
  // dead surface.
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className={styles.form}>
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" disabled={pending} className={styles.button}>
        {pending ? "working…" : label}
      </button>
      {state ? (
        <span className={state.ok ? styles.ok : styles.err} role="status" data-testid="action-result">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
```

- [ ] **Step 2: Write the discard form**

Create `components/admin/DiscardForm.tsx`:

```tsx
"use client";

import { useActionState, useState } from "react";
import type { ActionResult } from "@/lib/admin/action-result";
import { discardAction } from "@/app/admin/actions";
import styles from "./admin-forms.module.css";

/**
 * Discard is the one IRRECOVERABLE action here — it drops body_draft and
 * source_ref_draft and the prose is gone. Hence typing the id, not a click.
 * The server re-checks the confirmation too; this is convenience, not the gate.
 */
export function DiscardForm({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(discardAction, null);
  const [typed, setTyped] = useState("");
  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="id" value={id} />
      <label className={styles.label} htmlFor="confirm">
        Type <code>{id}</code> to discard this draft permanently
      </label>
      <input
        id="confirm"
        name="confirm"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className={styles.input}
        autoComplete="off"
      />
      <button type="submit" disabled={pending || typed !== id} className={styles.danger}>
        {pending ? "discarding…" : "Discard draft"}
      </button>
      {state ? (
        <span className={state.ok ? styles.ok : styles.err} role="status" data-testid="discard-result">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
```

- [ ] **Step 3: Write the stylesheet**

Create `components/admin/admin-forms.module.css`:

```css
.form {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin: 8px 0;
}
.label {
  color: var(--muted);
  font-size: 14px;
}
.input {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  padding: 6px 10px;
  font: inherit;
}
.button,
.danger {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--panel2);
  color: var(--text);
  padding: 6px 14px;
  font: inherit;
  cursor: pointer;
}
.button:hover:not(:disabled) {
  border-color: var(--accent);
}
.danger {
  border-color: var(--red);
  color: var(--red);
}
.button:disabled,
.danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ok {
  color: var(--green);
}
.err {
  color: var(--red);
}
```

- [ ] **Step 4: Write the page**

Create `app/admin/lesson/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin/guard";
import { createAdminQueries } from "@/lib/content/admin-queries";
import { db } from "@/lib/db";
import { getLessonMedia } from "@/lib/content/queries";
import { figuresFromMedia } from "@/lib/content/figures";
import { assertBlocks, type Block } from "@/lib/content/blocks";
import { diffBlocks } from "@/lib/admin/block-diff";
import { fingerprint } from "@/lib/admin/fingerprint";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { ActionButton } from "@/components/admin/ActionButton";
import { DiscardForm } from "@/components/admin/DiscardForm";
import { promoteAction, setStatusAction, setAccessAction } from "@/app/admin/actions";
import styles from "@/app/admin/admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * assertBlocks throws on malformed JSON. Catching it is load-bearing: an
 * uncaught throw in a Server Component is a 500 error page, which tells the
 * admin nothing. Caught, the block path (block[3]/run[1]) is reported at review
 * time — which is exactly where you want to find it.
 */
function parse(value: unknown): { blocks: Block[]; error: null } | { blocks: null; error: string } {
  try {
    return { blocks: assertBlocks(value), error: null };
  } catch (err) {
    return { blocks: null, error: err instanceof Error ? err.message : "unparseable" };
  }
}

export default async function AdminLessonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();

  const { id } = await params;
  const admin = createAdminQueries({ db });
  const row = await admin.getLessonForEdit(id);
  if (!row) notFound();

  const figures = figuresFromMedia(await getLessonMedia(id));
  const live = parse(row.body);
  const hasDraft = row.bodyDraft != null;
  const draft = hasDraft ? parse(row.bodyDraft) : null;
  const rows = live.blocks && draft?.blocks ? diffBlocks(live.blocks, draft.blocks) : null;

  return (
    <div className={styles.console}>
      <p>
        <Link href="/admin">← all lessons</Link>
      </p>
      <h1>
        {row.id} — {row.title}
      </h1>
      <dl className={styles.meta}>
        <dt>status</dt><dd>{row.status}</dd>
        <dt>access</dt><dd>{row.access}</dd>
        <dt>origin</dt><dd>{row.writeOrigin}</dd>
        <dt>source_ref</dt><dd>{row.sourceRef ?? "—"}</dd>
        {hasDraft ? (<><dt>source_ref_draft</dt><dd>{row.sourceRefDraft ?? "—"}</dd></>) : null}
      </dl>

      <section className={styles.actions}>
        <ActionButton action={setStatusAction} label="Publish" hidden={{ id: row.id, status: "published" }} />
        <ActionButton action={setStatusAction} label="Unpublish" hidden={{ id: row.id, status: "draft" }} />
        <ActionButton action={setAccessAction} label="Access: free" hidden={{ id: row.id, access: "free" }} />
        <ActionButton action={setAccessAction} label="Access: members" hidden={{ id: row.id, access: "members" }} />
        <ActionButton action={setAccessAction} label="Access: admin" hidden={{ id: row.id, access: "admin" }} />
      </section>

      {!hasDraft ? (
        <p className={styles.empty} data-testid="no-draft">
          No draft is pending for this lesson.
        </p>
      ) : (
        <>
          <section className={styles.actions}>
            {draft?.blocks ? (
              <ActionButton
                action={promoteAction}
                label="Promote draft"
                hidden={{ id: row.id, fingerprint: fingerprint(draft.blocks) }}
              />
            ) : (
              <p className={styles.err} data-testid="promote-blocked">
                Promote is disabled: the draft does not parse, so this page could not render it.
              </p>
            )}
            <DiscardForm id={row.id} />
          </section>

          <div className={styles.columns} data-testid="diff">
            <div>
              <h2>Live</h2>
              {live.error ? <p className={styles.err}>{live.error}</p> : null}
            </div>
            <div>
              <h2>Draft</h2>
              {draft?.error ? <p className={styles.err}>{draft.error}</p> : null}
            </div>

            {rows?.map((r, i) => (
              <div key={i} className={styles.pair} data-tag={r.tag}>
                <div className={`${styles.cell} ${styles[r.tag]}`}>
                  <span className={styles.tag}>{r.tag}</span>
                  {r.live ? <BlockRenderer blocks={[r.live]} lessonId={row.id} figures={figures} /> : null}
                </div>
                <div className={`${styles.cell} ${styles[r.tag]}`}>
                  <span className={styles.tag}>{r.tag}</span>
                  {r.draft ? <BlockRenderer blocks={[r.draft]} lessonId={row.id} figures={figures} /> : null}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!hasDraft && live.blocks ? (
        <BlockRenderer blocks={live.blocks} lessonId={row.id} figures={figures} />
      ) : null}
      {!hasDraft && live.error ? <p className={styles.err}>{live.error}</p> : null}
    </div>
  );
}
```

- [ ] **Step 5: Extend the stylesheet**

Append to `app/admin/admin.module.css`:

```css
.meta {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 2px 16px;
  margin: 16px 0 24px;
  font-size: 14px;
}
.meta dt {
  color: var(--muted);
}
.actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid var(--border);
}
.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
  margin-top: 24px;
}
.pair {
  display: contents;
}
.cell {
  border-left: 3px solid transparent;
  padding: 6px 0 6px 12px;
  min-height: 1px;
}
.tag {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--dim);
}
/* Markers carry a text label as well as colour — the signal must not rest on
   colour alone. */
.same { border-left-color: transparent; }
.added { border-left-color: var(--green); }
.removed { border-left-color: var(--red); }
.changed { border-left-color: var(--gold); }

/* Used by the page's malformed-body panels and the promote-blocked notice.
   NOT defined by Task 11 — it belongs to this task's append. */
.err {
  color: var(--red);
}

@media (max-width: 1100px) {
  .columns { grid-template-columns: 1fr; }
}
```

- [ ] **Step 6: Build and drive it by hand**

```bash
rm -rf .next && pnpm build
```

Exit 0, **foreground**. Then `pnpm start`, sign in as admin, and open `/admin/lesson/m1-01`. Expected: metadata, the five action buttons, "No draft is pending", and the live body rendered **with its charts**. If the charts are blank, `figuresFromMedia` is not wired — fix before continuing.

- [ ] **Step 7: Type check and unit suite**

Run: `npx tsc --noEmit` then `pnpm exec vitest run tests/unit`
Expected: both exit 0.

- [ ] **Step 8: Commit**

```bash
git add "app/admin/lesson/[id]/page.tsx" components/admin/ app/admin/admin.module.css
git status --short
git commit -m "feat: add the admin lesson detail and side-by-side draft review"
```

---

# Phase 4 — proving it

### Task 13: Prove non-admins are refused — the permissive direction

**Files:**
- Create: `tests/e2e/admin-denied.spec.ts`
- Create: `tests/e2e/admin-denied.authenticated.spec.ts`

**Interfaces:** none produced.

**Why two files:** `playwright.config.ts` routes by filename. `*.spec.ts` runs in the anonymous `chromium` project; `*.authenticated.spec.ts` runs in the `authenticated` project with the **member** account's storage state. The member is a member with an entitlement and deliberately **not** an admin (`gating.authenticated.spec.ts:8-9`), which is exactly the identity that must still be refused. **This is the direction a test suite skips by default; it is written first.**

- [ ] **Step 1: Write the anonymous spec**

Create `tests/e2e/admin-denied.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

/**
 * 404, never 403 or a redirect. A redirect to sign-in would confirm /admin
 * exists to anyone who probes it; a 403 confirms it to any signed-in member.
 */
const ROUTES = ["/admin", "/admin/lesson/m1-01", "/admin/lesson/does-not-exist"];

for (const route of ROUTES) {
  test(`anonymous GET ${route} is 404`, async ({ request }) => {
    const res = await request.get(route);
    expect(res.status(), `${route} must 404 for an anonymous visitor — got ${res.status()}`).toBe(404);
  });
}

test("an anonymous visitor is not redirected to sign-in", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/auth\/sign-in/);
});
```

- [ ] **Step 2: Write the member spec**

Create `tests/e2e/admin-denied.authenticated.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

/**
 * Runs in the "authenticated" project — the MEMBER account, which holds an
 * entitlement but is NOT in ADMIN_EMAILS. This is the permissive direction: a
 * guard that only refuses anonymous visitors would pass the spec above and
 * still be broken.
 */
const ROUTES = ["/admin", "/admin/lesson/m1-01"];

for (const route of ROUTES) {
  test(`a signed-in non-admin member GET ${route} is 404`, async ({ request }) => {
    const res = await request.get(route);
    expect(res.status(), `${route} must 404 for a signed-in non-admin — got ${res.status()}`).toBe(404);
  });
}

test("the member session really is signed in (so the 404s above are not vacuous)", async ({ page }) => {
  // WITHOUT THIS the file is worthless: if the storage state were empty, both
  // assertions above would pass for the wrong reason — they would merely be
  // re-testing the anonymous case that admin-denied.spec.ts already covers.
  // Asserting on the cookie jar directly rather than on rendered text, which
  // would couple this to the auth UI's wording.
  await page.goto("/");
  const state = await page.context().storageState();
  expect(state.cookies.length, "the authenticated project must carry a real session").toBeGreaterThan(0);
});
```

- [ ] **Step 3: Run both**

Run: `pnpm test:e2e`
Expected: all previously-passing tests plus the new ones. Read the exit code in the **foreground**.

- [ ] **Step 4: Confirm Playwright routed them to the right projects**

Run: `pnpm exec playwright test --list | grep admin-denied`
Expected: `admin-denied.spec.ts` under `[chromium]` only, `admin-denied.authenticated.spec.ts` under `[authenticated]` only. **If `admin-denied.authenticated.spec.ts` also appears under `[chromium]`, stop** — it would be running anonymously and passing for the wrong reason.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/admin-denied.spec.ts tests/e2e/admin-denied.authenticated.spec.ts
git status --short
git commit -m "test: prove anonymous and member identities are refused at /admin"
```

---

### Task 14: Prove the console works for an admin

**Files:**
- Modify: `tests/e2e/helpers/catalog.ts` (add `plantPendingDraftRow`)
- Create: `tests/e2e/admin-console.admin.spec.ts`

**Interfaces:**
- Produces: `plantPendingDraftRow(): Promise<{ id: string; cleanup: () => Promise<void> }>`.

**Why a new helper:** `plantDraftLessonRow` creates a `status='draft'` row with **no `body_draft`** (`body` defaults to `[]`), so `hasDraft` is `false` and the row would never appear under Pending review — the spec would assert against an empty list and pass for the wrong reason.

**Two traps this task must respect.** `catalogRows()` hard-codes `EXPECTED_ROW_COUNT` and throws on mismatch, and Playwright runs `fullyParallel` — so **no probe row may ever be `status='published'`, even momentarily**. And `lessons.slug` is unique, so the new probe needs its own id and slug distinct from the two existing probes.

- [ ] **Step 1: Add the helper**

Append to `tests/e2e/helpers/catalog.ts`:

```ts
const PENDING_PROBE_ID = "e2e-pending-draft-probe";
const PENDING_PROBE_SLUG = "e2e-pending-draft-probe-do-not-use";

/**
 * A throwaway lesson that genuinely HAS a pending draft — body, body_draft and
 * source_ref_draft all set — so it appears under the console's Pending review
 * group. plantDraftLessonRow does NOT set body_draft, so it cannot serve here.
 *
 * Its own id/slug, distinct from the other two probes: lessons.slug is unique
 * and playwright.config.ts runs fullyParallel.
 *
 * status is 'draft' from creation to deletion and MUST stay that way —
 * catalogRows() hard-codes EXPECTED_ROW_COUNT and throws on mismatch, so a
 * momentarily-published probe would race unrelated specs.
 *
 * cleanup() also deletes the row's admin_actions: the console spec promotes and
 * discards, and the project gate requires that table back at its starting count.
 */
export async function plantPendingDraftRow(): Promise<{ id: string; cleanup: () => Promise<void> }> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — see .env.local");
  const sql = neon(url);

  const live = JSON.stringify([{ t: "p", c: [{ t: "text", v: "LIVE probe paragraph" }] }]);
  const pending = JSON.stringify([
    { t: "p", c: [{ t: "text", v: "LIVE probe paragraph" }] },
    { t: "p", c: [{ t: "text", v: "DRAFT probe paragraph" }] },
  ]);

  await sql`
    insert into lessons (id, section_id, month_id, slug, title, heading, crumb, ord, kind, access, status,
                         body, body_draft, source_ref, source_ref_draft, write_origin)
    values (
      ${PENDING_PROBE_ID}, 's1', null, ${PENDING_PROBE_SLUG},
      'E2E Pending Draft Probe (throwaway)', 'E2E Pending Draft Probe', 'E2E · Pending Draft Probe',
      999998, 'lesson', 'free', 'draft',
      ${live}::jsonb, ${pending}::jsonb, 'notes/ict-core/INDEX.md', 'notes/ict-core/INDEX.md', 'cms'
    )
  `;

  return {
    id: PENDING_PROBE_ID,
    cleanup: async () => {
      await sql`delete from admin_actions where lesson_id = ${PENDING_PROBE_ID}`;
      await sql`delete from lessons where id = ${PENDING_PROBE_ID}`;
    },
  };
}
```

- [ ] **Step 2: Write the spec**

Create `tests/e2e/admin-console.admin.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { plantPendingDraftRow } from "./helpers/catalog";

/**
 * Runs in the "admin" project (tests/e2e/admin.setup.ts, storageState
 * tests/e2e/.auth/admin.json). *.admin.spec.ts is excluded from the anonymous
 * chromium project by playwright.config.ts's testIgnore.
 */

test("the list shows a pending draft under Pending review", async ({ page }) => {
  const { id, cleanup } = await plantPendingDraftRow();
  try {
    await page.goto("/admin");
    await expect(page.getByTestId("pending-table")).toBeVisible();
    await expect(page.getByTestId("pending-table").getByText(id)).toBeVisible();
  } finally {
    await cleanup();
  }
});

test("the review page renders both bodies with change markers", async ({ page }) => {
  const { id, cleanup } = await plantPendingDraftRow();
  try {
    await page.goto(`/admin/lesson/${id}`);
    await expect(page.getByTestId("diff")).toBeVisible();
    await expect(page.getByText("LIVE probe paragraph").first()).toBeVisible();
    await expect(page.getByText("DRAFT probe paragraph")).toBeVisible();
    // The draft adds one paragraph, so exactly one row must be marked added.
    await expect(page.locator('[data-tag="added"]')).toHaveCount(1);
    await expect(page.locator('[data-tag="same"]')).toHaveCount(1);
  } finally {
    await cleanup();
  }
});

test("promote moves the draft into the live body and clears the draft columns", async ({ page }) => {
  const { id, cleanup } = await plantPendingDraftRow();
  try {
    await page.goto(`/admin/lesson/${id}`);
    await page.getByRole("button", { name: "Promote draft" }).click();
    await expect(page.getByTestId("promote-result")).toContainText("promoted");

    await page.goto(`/admin/lesson/${id}`);
    await expect(page.getByTestId("no-draft")).toBeVisible();
    await expect(page.getByText("DRAFT probe paragraph")).toBeVisible();
  } finally {
    await cleanup();
  }
});

test("discard requires the typed id and then clears the draft, leaving the live body", async ({ page }) => {
  const { id, cleanup } = await plantPendingDraftRow();
  try {
    await page.goto(`/admin/lesson/${id}`);
    const button = page.getByRole("button", { name: "Discard draft" });
    await expect(button, "the discard button must stay disabled until the id is typed").toBeDisabled();

    await page.locator("#confirm").fill(id);
    await expect(button).toBeEnabled();
    await button.click();
    await expect(page.getByTestId("discard-result")).toContainText("discarded");

    await page.goto(`/admin/lesson/${id}`);
    await expect(page.getByTestId("no-draft")).toBeVisible();
    await expect(page.getByText("LIVE probe paragraph")).toBeVisible();
    await expect(page.getByText("DRAFT probe paragraph")).toHaveCount(0);
  } finally {
    await cleanup();
  }
});
```

- [ ] **Step 3: Run the suite**

Run: `pnpm test:e2e`
Expected: every test passes, zero skipped. **Foreground.**

- [ ] **Step 4: Confirm no probe rows or audit rows survived**

```bash
node --env-file=.env.local -e "const {neon}=require('@neondatabase/serverless');const s=neon(process.env.DATABASE_URL);(async()=>{console.log(await s\`select (select count(*) from lessons) lessons, (select count(*) from lessons where id like 'e2e%') probes, (select count(*) from admin_actions) audit, (select count(*) from lessons where body_draft is not null) drafts\`)})()"
```

Expected: `82 · 0 · 0 · 0`.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/helpers/catalog.ts tests/e2e/admin-console.admin.spec.ts
git status --short
git commit -m "test: cover the admin console's list, review, promote and discard"
```

---

### Task 15: Mutation-test the guards, document the deploy step, run the full gate

**Files:**
- Modify: `docs/cms-authoring.md` (add the console section and the Vercel Firewall rule)

**Interfaces:** none.

**A guard no test kills is not a guard.** Each mutation below must turn at least one test red, and every restore must be **byte-exact**.

- [ ] **Step 1: Mutation M1 — `requireAdminPage` stops refusing**

In `lib/admin/guard.ts`, change the check to:

```ts
if (!ctx.isAdmin && Boolean(process.env.NEVER_SET_XYZ)) notFound();
```

Confirm it applied: `grep -n "NEVER_SET_XYZ" lib/admin/guard.ts`
Then: `rm -rf .next && pnpm build` (exit 0 — a mutation that fails to compile proves nothing), then `pnpm test:e2e`.
**Expected: both `admin-denied` specs FAIL** and the run exits non-zero.
Restore, then prove it: `git checkout lib/admin/guard.ts && git status --porcelain` (must be clean for that path).

- [ ] **Step 2: Mutation M2 — `assertAdmin` stops throwing**

In `lib/admin/guard.ts`:

```ts
if (!ctx.isAdmin && Boolean(process.env.NEVER_SET_XYZ)) throw new Error("admin only");
```

Run: `pnpm exec vitest run tests/unit/admin-guard.test.ts tests/unit/admin-actions.test.ts tests/unit/admin-mutations.test.ts`
**Expected: FAIL** across the authorization tests in all three files.
Restore and verify with `git status --porcelain`.

- [ ] **Step 3: Mutation M3 — `promoteAction` stops comparing the fingerprint**

In `app/admin/actions.ts`:

```ts
if (fingerprint(current) !== seen && Boolean(process.env.NEVER_SET_XYZ)) {
```

Run: `pnpm exec vitest run tests/unit/admin-actions.test.ts`
**Expected: the "refuses when the draft changed" test FAILS.**
Restore and verify.

- [ ] **Step 4: Mutation M4 — `groupLessons` drops null-month lessons**

In `lib/admin/group-lessons.ts`, change the null branch to `continue;` without pushing:

```ts
if (row.monthId === null) {
  if (!Boolean(process.env.NEVER_SET_XYZ)) continue;
  section.sectionLevel.push(row);
  continue;
}
```

Run: `pnpm exec vitest run tests/unit/admin-group-lessons.test.ts`
**Expected: the null-month and "drops no lesson" tests FAIL.**
Restore and verify.

- [ ] **Step 5: Report any mutation that killed nothing**

If any of M1–M4 leaves every test green, **do not proceed** — the corresponding test is vacuous. Fix the test, re-run the mutation, and report what happened.

- [ ] **Step 6: Re-prove invariant 10 against the live MCP server**

```bash
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"gate","version":"1"}}}' '{"jsonrpc":"2.0","method":"notifications/initialized"}' '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | pnpm mcp
```

Expected: the tool list contains **exactly 6** tools and **none** of `promote_draft`, `discard_draft`, `set_access`, `set_status`. Also expect zero `ERR_MODULE_NOT_FOUND` — that would mean something in `mcp/`'s import graph reached `lib/db`. `mcp/**` was not modified by this plan, so any change here is a regression to investigate before continuing.

- [ ] **Step 7: Document the console and the firewall rule**

Append a section to `docs/cms-authoring.md`:

```markdown
## The admin console (`/admin`)

Sign in with an account whose email is in `ADMIN_EMAILS`. Everyone else — signed
out or signed in — gets a 404 on every admin route.

- `/admin` lists all lessons, drafts first.
- `/admin/lesson/{id}` shows the pending draft rendered beside the live body
  with each added / removed / changed block marked, and carries the four
  actions: promote, discard, set status, set access.

`pnpm content:promote` still works and is unchanged. The console exists because
that CLI shows you nothing — it promotes prose you have not seen rendered.

**Discard is irrecoverable.** It drops `body_draft` and `source_ref_draft`; the
draft is gone. That is why it asks you to type the lesson id.

**Promote refuses a stale review.** If the draft changed between the page
rendering and your click — the MCP agent wrote a new one — promote reports the
mismatch instead of publishing prose you never read. Reload and re-read it.

### Required deploy step — rate limiting

The app performs no rate limiting of its own, deliberately: on Vercel each
serverless instance has its own memory, so an in-memory limiter throttles almost
nothing under real abuse while looking like protection. Configure it at the edge
instead, once, in the Vercel dashboard:

    Project → Firewall → Add rule
      IF   path matches /admin*
      AND  rate exceeds 20 requests / 10s per IP
      THEN deny

Admin routes also send `X-Robots-Tag: noindex, nofollow`. There is deliberately
no `robots.txt` entry — a `Disallow: /admin` line advertises the path.

### What the console does NOT do

Quiz editing is out. `upsertQuiz` with `deleteMissing` cascades real user
answers through `quiz_results ON DELETE CASCADE`, and it is not going behind a
button until a confirmation flow names the exact number of answers at risk.
`createLesson` and media management are out too.

### The audit table

`admin_actions` records who did what, including denied attempts. It is a
**record, not a control**: nothing reads it to make an authorization decision,
and a failure to write a row never fails the action. It never stores body
content.
```

- [ ] **Step 8: Snapshot `m1-01` before the final gate**

```bash
node --env-file=.env.local -e "const {neon}=require('@neondatabase/serverless');const s=neon(process.env.DATABASE_URL);(async()=>{const r=await s\`select * from lessons where id='m1-01'\`;require('fs').writeFileSync(process.env.TMP+'/m1-01-before.json',JSON.stringify(r,null,2));console.log('captured')})()"
```

- [ ] **Step 9: Run every gate, in the foreground, reading real exit codes**

Run each on its own and confirm each exits 0 before running the next. **Never background these.**

```bash
pnpm lint
npx tsc --noEmit
pnpm test:unit
pnpm test:integration
rm -rf .next && pnpm build
pnpm test:e2e
```

- [ ] **Step 10: Prove the `"use server"` rule on both action modules**

```bash
grep "^export" lib/content/mutations.ts
grep "^export" app/admin/actions.ts
```

Expected: `export async function` lines only, in both.

- [ ] **Step 11: Prove the database is exactly where it started**

```bash
node --env-file=.env.local -e "const {neon}=require('@neondatabase/serverless');const s=neon(process.env.DATABASE_URL);(async()=>{console.log(await s\`select (select count(*) from lessons) lessons, (select count(*) from quiz_questions) questions, (select count(*) from lessons where body_draft is not null) drafts, (select count(*) from lessons where write_origin='cms') cms, (select count(*) from lessons where status<>'published') unpub, (select count(*) from quiz_results) results, (select count(*) from admin_actions) audit, (select count(*) from lessons where id like 'e2e%') probes\`)})()"
```

Expected: `82 · 564 · 0 · 0 · 0 · 0 · 0 · 0`.

Then diff `m1-01` against the capture — **counts cannot see a rewritten row**:

```bash
node --env-file=.env.local -e "const {neon}=require('@neondatabase/serverless');const s=neon(process.env.DATABASE_URL);(async()=>{const r=await s\`select * from lessons where id='m1-01'\`;const before=require(process.env.TMP+'/m1-01-before.json');const a=JSON.stringify(before),b=JSON.stringify(r);console.log(a===b?'m1-01 IDENTICAL':'m1-01 CHANGED\n'+a+'\n'+b)})()"
```

Expected: `m1-01 IDENTICAL`. **If it changed, stop and report** — something did not restore.

- [ ] **Step 12: Confirm the branch still has no upstream**

```bash
git ls-remote --heads origin
git status -sb | head -1
```

Expected: only `main` on the remote, and no upstream tracking on `nextjs-neon-cms`.

- [ ] **Step 13: Commit**

```bash
git add docs/cms-authoring.md
git status --short
git commit -m "docs: document the admin console, the firewall rule and the audit table"
```

Then report to the user: every gate's exit code, which mutations killed which tests, the before/after database figures, and anything left open.

---

## Post-implementation review

Per the user's standing rule, **authoring and review stay separate passes and nothing self-approves.** After Task 15, request an independent review — `superpowers:requesting-code-review`, or a `code-reviewer` / `security-reviewer` agent over the diff, with particular attention to:

1. Every admin page's first statement is `requireAdminPage()` (invariant 11).
2. Every action wrapper calls `assertAdmin()` itself (invariant 12).
3. No admin layout performs authorization.
4. Nothing outside an admin-gated path selects `body_draft`, and no audit `detail` contains body content (invariant 6).
5. `mcp/` is byte-identical to its state before this work (invariant 10).
