# CMS Write Path and Agent Tooling — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give a local AI agent and a human a validated, gated write path for course content stored in Postgres — so lessons can be edited and authored without SQL, without hand-edited files, and without any way for the agent to publish unreviewed prose.

**Architecture:** One dependency-free module (`lib/content/write.ts`) holds every write rule and takes an injected `db` handle and `revalidate` callback. Two hosts wrap it: `lib/content/mutations.ts` (a `"use server"` module, injecting `lib/db` + `revalidateTag`) and `mcp/server.ts` (a standalone Node process, injecting its own `drizzle(neon(...))` + an HTTP purge against `/api/revalidate`). Body edits land in a new `body_draft` column that no public read path selects; only a human can promote or publish, via two CLIs.

**Tech Stack:** TypeScript · Next.js 16 (App Router) · Drizzle ORM + `@neondatabase/serverless` (neon-http) · `@modelcontextprotocol/sdk` (new) · Vitest (unit/integration) · Playwright (e2e) · Node 24 with `--experimental-strip-types`.

**Spec:** [docs/superpowers/specs/2026-08-13-cms-write-path-design.md](../specs/2026-08-13-cms-write-path-design.md) — read it before Task 1. Approved by a separate reviewer after two adversarial rounds.

**Base:** branch `nextjs-neon-cms` @ `5bd7a92`.

---

## Global Constraints

Every task's requirements implicitly include this section.

- **Local commits on `nextjs-neon-cms` ARE expected.** Each task ends by committing exactly that task's files, conventional-commit subject. **NEVER push, PR or force-push** — this branch has no upstream and must keep none. Verify with `git ls-remote --heads origin` (expect only `main` at `44eaf93`).
- **Read-only, never modified:** `content/`, `images/`, `engine/`, `build.py`, `verify.py`, `index.html`, `.github/workflows/ci.yml`. `transcripts/` and `notes/` are **read** (to verify `source_ref`) but never written.
- **Frozen, never modified:** `lib/content/{blocks,parse-html,parse-meta,export-html,canonical,import-media,queries}.ts`, `lib/media.ts`, `lib/access.ts`, `scripts/upload-media.mjs`. `queries.ts` may be **read**; its six query functions, their SQL and their cache tags must not change.
- **Unfrozen by this project only:** `lib/content/import.ts`, `scripts/import-content.mjs`. `lib/content/mutations.ts` was never frozen.
- `lib/db/schema.ts` and `drizzle/` change **ONLY** via `pnpm db:generate`. Never hand-write a migration.
- **One new dependency total:** `@modelcontextprotocol/sdk`, as a `dependency`. Adding any other package is out of scope — stop and ask.
- **A `"use server"` module may export ONLY async functions.** A type or const export is invisible to eslint, `tsc` and `pnpm build`, and throws `ReferenceError` only on an authenticated render. Verify with `grep "^export" lib/content/mutations.ts`.
- **`write.ts` must not import `lib/db` or any `next/*`.** `lib/db/index.ts:1` is `import "server-only"`, a package that **is not installed** (Next and `vitest.config.ts:21` each alias it). A plain Node process importing it dies with `ERR_MODULE_NOT_FOUND`.
- **neon-http has no interactive transactions.** Never write `begin`/`rollback` as separate calls — they are three sessions, the begin and rollback are no-ops, and the write commits. Use `db.batch([...])`, which IS atomic on this driver.
- **404, never 403**, for anything gated. Draft content is admin-only unconditionally.
- Secrets from `process.env` only. Never print or commit a secret. Never print a user's email.
- **Do not delete anything from the R2 bucket.**
- Before any build you intend to trust: `rm -rf .next` (not just `.next/cache` — `next dev`'s generated `.next/dev/types/validator.ts` survives and fails the type check). Kill any stale `pnpm start` on :3000 first.

**Commands:** `pnpm lint` · `pnpm test:unit` · `pnpm test:e2e` · `pnpm build` · `pnpm db:generate` · `pnpm db:migrate`

---

## File Structure

**Created:**

| File | Responsibility |
|---|---|
| `lib/content/write-validate.ts` | `assertQuiz`, `assertMeta`, `assertSourceRef` — runtime validators, path-reporting, zero imports beyond `node:fs`/`node:path` |
| `lib/content/write.ts` | `createWriter({ db, revalidate })` → every write rule. No `lib/db`, no `next/*` |
| `lib/content/admin-queries.ts` | `createAdminQueries({ db })` → `getLessonDraftBody`, `listLessonsAdmin` |
| `mcp/server.ts` | MCP stdio face — six tools |
| `mcp/host.ts` | The MCP process's `db` + HTTP purger wiring, shared with the CLIs |
| `scripts/promote-draft.mjs` | Human CLI: promote / discard |
| `scripts/set-status.mjs` | Human CLI: publish / unpublish |
| `tests/unit/write-validate.test.ts`, `tests/unit/write.test.ts`, `tests/unit/importer-guards.test.ts` | unit |
| `tests/integration/write-db.test.ts` | real-DB integration |
| `tests/e2e/draft.spec.ts`, `tests/e2e/draft.authenticated.spec.ts` | e2e |

**Modified:** `lib/db/schema.ts` (append-only) · `drizzle/0004_*` (generated) · `lib/content/mutations.ts` (refactor onto `write.ts`) · `lib/content/import.ts` + `scripts/import-content.mjs` (unfrozen) · `app/api/quiz/[id]/route.ts` + `app/api/exam/[id]/route.ts` (admin-aware 404) · `package.json` · `.mcp.json`

---

# Phase 1 — Schema and the write core

### Task 1: Migration 0004 — the four new columns

**Files:**
- Modify: `lib/db/schema.ts` (append to the `lessons` table definition only)
- Create: `drizzle/0004_*.sql` + snapshot (generated)
- Test: `tests/unit/schema.test.ts` (add one case)

**Interfaces:**
- Produces: `lessons.bodyDraft`, `lessons.sourceRef`, `lessons.sourceRefDraft`, `lessons.writeOrigin`.

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/schema.test.ts`:

```ts
it("carries the draft and provenance columns, defaulting write_origin closed to import", () => {
  const c = getTableColumns(lessons);
  expect(c.bodyDraft.notNull).toBe(false);        // NULL = no draft pending
  expect(c.sourceRef.notNull).toBe(false);        // 82 existing rows predate it
  expect(c.sourceRefDraft.notNull).toBe(false);
  expect(c.writeOrigin.notNull).toBe(true);
  expect(c.writeOrigin.default).toBe("import");   // existing rows classify correctly
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm test:unit -- schema`
Expected: FAIL — `Cannot read properties of undefined (reading 'notNull')`.

- [ ] **Step 3: Add the columns**

In `lib/db/schema.ts`, inside the `lessons` table object, immediately after `body`:

```ts
  /** Block[] — the UNREVIEWED body. Admin-only unconditionally (invariant 6). */
  bodyDraft: jsonb("body_draft"),
  /** Provenance of the LIVE body — a path under transcripts/ or notes/. */
  sourceRef: text("source_ref"),
  /** Provenance of the DRAFT body. Promoted/cleared with it, never apart. */
  sourceRefDraft: text("source_ref_draft"),
  /** 'import' | 'cms'. Set to 'cms' by body writes only (invariant 9). */
  writeOrigin: text("write_origin").notNull().default("import"),
```

- [ ] **Step 4: Generate and inspect the migration**

Run: `pnpm db:generate`
Then **read the generated `drizzle/0004_*.sql` before applying it.** drizzle-kit emits statements alphabetically by table; in project #1 that once put a constraint ahead of its dependency and failed mid-apply. Four `ALTER TABLE … ADD COLUMN` statements have no interdependencies, so confirm that is all it emitted.

- [ ] **Step 5: Apply and verify**

Run: `pnpm db:migrate && pnpm exec drizzle-kit check`
Expected: migration applies; check reports "Everything's fine".

- [ ] **Step 6: Confirm no existing row was disturbed**

```bash
node --env-file=.env.local -e "
const {neon}=require('@neondatabase/serverless');const sql=neon(process.env.DATABASE_URL);
(async()=>{const r=await sql\`select count(*)::int n, count(body_draft)::int d, count(*) filter (where write_origin='import')::int i from lessons\`;
console.log(r[0]);})()"
```

Expected: `{ n: 82, d: 0, i: 82 }` — 82 lessons, zero drafts, all classified `import`.

- [ ] **Step 7: Run the suite and commit**

Run: `pnpm test:unit && pnpm lint`

```bash
git add lib/db/schema.ts drizzle/ tests/unit/schema.test.ts
git commit -m "feat: add body_draft, source_ref pair and write_origin to lessons"
```

---

### Task 2: `write-validate.ts` — quiz, meta and source-ref validators

**Files:**
- Create: `lib/content/write-validate.ts`
- Test: `tests/unit/write-validate.test.ts`

**Interfaces:**
- Consumes: `Inline`, `assertBlocks` style from `lib/content/blocks.ts` (frozen — read only).
- Produces:
  - `assertQuiz(v: unknown): QuizInput[]` where `QuizInput = { id?: string; q: string; options: string[]; answer: number; explanation: string }`
  - `assertMeta(v: unknown): MetaPatch` where `MetaPatch = { title?: string; heading?: string; crumb?: string; desc?: Inline[]; videoUrl?: string | null }`
  - `assertSourceRef(ref: unknown, repoRoot: string): string`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/write-validate.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { assertQuiz, assertMeta, assertSourceRef } from "@/lib/content/write-validate";

describe("assertQuiz", () => {
  const ok = { q: "why?", options: ["a", "b", "c", "d"], answer: 1, explanation: "because" };

  it("accepts a well-formed question and preserves an supplied id", () => {
    const out = assertQuiz([{ ...ok, id: "11111111-1111-1111-1111-111111111111" }]);
    expect(out[0].id).toBe("11111111-1111-1111-1111-111111111111");
    expect(out[0].options).toHaveLength(4);
  });

  it("reports the failing path, like assertBlocks does", () => {
    expect(() => assertQuiz([ok, { ...ok, options: ["a", "b", "c"] }]))
      .toThrow(/question\[1\]: options must be an array of exactly 4 strings/);
  });

  it("rejects an answer index outside the options", () => {
    expect(() => assertQuiz([{ ...ok, answer: 4 }]))
      .toThrow(/question\[0\]: answer must be a 0-based index into options/);
  });
});

describe("assertMeta", () => {
  it("passes through only known keys and validates desc as Inline[]", () => {
    const out = assertMeta({ title: "T", desc: [{ t: "text", v: "d" }], bogus: 1 } as unknown);
    expect(out).toEqual({ title: "T", desc: [{ t: "text", v: "d" }] });
  });

  it("rejects a string desc — desc is Inline[], not text", () => {
    expect(() => assertMeta({ desc: "plain" })).toThrow(/desc: expected an array of inline nodes/);
  });

  it("rejects a slug write outright", () => {
    expect(() => assertMeta({ slug: "m1-01-x" })).toThrow(/slug is not writable/);
  });
});

describe("assertSourceRef", () => {
  it("accepts a path that exists under notes/", () => {
    expect(assertSourceRef("notes/ict-core/INDEX.md", process.cwd())).toBe("notes/ict-core/INDEX.md");
  });

  it("rejects a path outside transcripts/ and notes/", () => {
    expect(() => assertSourceRef("package.json", process.cwd()))
      .toThrow(/sourceRef must be a path under transcripts\/ or notes\//);
  });

  it("rejects a path that does not exist — a citation must point at something", () => {
    expect(() => assertSourceRef("notes/nope-does-not-exist.md", process.cwd()))
      .toThrow(/sourceRef does not exist/);
  });

  it("rejects traversal", () => {
    expect(() => assertSourceRef("notes/../package.json", process.cwd()))
      .toThrow(/sourceRef must be a path under transcripts\/ or notes\//);
  });
});
```

> **Note on the `notes/` fixture:** `notes/` is git-ignored but present locally, and `notes/ict-core/INDEX.md` is referenced by CLAUDE.md §6. If it is absent on your machine, substitute any file that exists under `notes/` or `transcripts/` — do **not** weaken the test to skip.

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm test:unit -- write-validate`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `lib/content/write-validate.ts`:

```ts
import { existsSync } from "node:fs";
import { resolve, relative, sep } from "node:path";
import type { Inline } from "./blocks";

export interface QuizInput {
  id?: string;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface MetaPatch {
  title?: string;
  heading?: string;
  crumb?: string;
  desc?: Inline[];
  videoUrl?: string | null;
}

function fail(msg: string): never {
  throw new Error(`invalid write: ${msg}`);
}

/** Mirrors blocks.ts's assertInlines — kept local so this module imports no runtime code. */
function assertInlines(v: unknown, where: string): Inline[] {
  if (!Array.isArray(v)) fail(`${where}: expected an array of inline nodes`);
  return v.map((n, i) => {
    if (typeof n !== "object" || n === null) fail(`${where}[${i}]: expected an object`);
    const node = n as Record<string, unknown>;
    switch (node.t) {
      case "text":
        if (typeof node.v !== "string") fail(`${where}[${i}]: text.v must be a string`);
        return { t: "text", v: node.v } as Inline;
      case "br":
        return { t: "br" } as Inline;
      case "strong":
      case "em":
      case "src":
        return { t: node.t, c: assertInlines(node.c, `${where}[${i}]/${node.t}`) } as Inline;
      default:
        return fail(`${where}[${i}]: unknown inline type "${String(node.t)}"`);
    }
  });
}

export function assertQuiz(v: unknown): QuizInput[] {
  if (!Array.isArray(v)) fail("questions must be an array");
  return v.map((raw, i) => {
    const at = `question[${i}]`;
    if (typeof raw !== "object" || raw === null) fail(`${at}: expected an object`);
    const q = raw as Record<string, unknown>;
    if (q.id !== undefined && typeof q.id !== "string") fail(`${at}: id must be a uuid string when supplied`);
    if (typeof q.q !== "string" || q.q.length === 0) fail(`${at}: q must be a non-empty string`);
    if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o) => typeof o !== "string"))
      fail(`${at}: options must be an array of exactly 4 strings`);
    if (typeof q.answer !== "number" || !Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
      fail(`${at}: answer must be a 0-based index into options`);
    if (typeof q.explanation !== "string" || q.explanation.length === 0)
      fail(`${at}: explanation must be a non-empty string`);
    return {
      ...(q.id ? { id: q.id as string } : {}),
      q: q.q,
      options: q.options as string[],
      answer: q.answer,
      explanation: q.explanation,
    };
  });
}

const META_KEYS = ["title", "heading", "crumb", "desc", "videoUrl"] as const;

export function assertMeta(v: unknown): MetaPatch {
  if (typeof v !== "object" || v === null) fail("meta must be an object");
  const m = v as Record<string, unknown>;
  // The slug is the chart filename stem the media manifest keys on, and it
  // carries a unique index. Renaming it in the DB alone decouples the two.
  if ("slug" in m) fail("slug is not writable");
  const out: MetaPatch = {};
  for (const k of META_KEYS) {
    if (!(k in m)) continue;
    if (k === "desc") out.desc = assertInlines(m.desc, "desc");
    else if (k === "videoUrl") {
      if (m.videoUrl !== null && typeof m.videoUrl !== "string") fail("videoUrl must be a string or null");
      out.videoUrl = m.videoUrl as string | null;
    } else {
      if (typeof m[k] !== "string" || (m[k] as string).length === 0) fail(`${k} must be a non-empty string`);
      out[k] = m[k] as string;
    }
  }
  return out;
}

const SOURCE_ROOTS = ["transcripts", "notes"];

/**
 * §1 AUDITABILITY. This verifies the citation EXISTS, not that it supports the
 * prose — see the spec §6, which is deliberately honest that the human promote
 * gate is the real control. This raises the floor from "unchecked string" to
 * "checked pointer" for about five lines.
 */
export function assertSourceRef(ref: unknown, repoRoot: string): string {
  if (typeof ref !== "string" || ref.length === 0) fail("sourceRef is required on a body write");
  const abs = resolve(repoRoot, ref);
  const rel = relative(repoRoot, abs);
  const root = rel.split(sep)[0];
  if (rel.startsWith("..") || !SOURCE_ROOTS.includes(root))
    fail(`sourceRef must be a path under transcripts/ or notes/ (got "${ref}")`);
  if (!existsSync(abs)) fail(`sourceRef does not exist: ${ref}`);
  return ref;
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `pnpm test:unit -- write-validate`
Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/content/write-validate.ts tests/unit/write-validate.test.ts
git commit -m "feat: add quiz, meta and source-ref validators for the write path"
```

---

### Task 3: `write.ts` — the writer factory, body drafts and meta

**Files:**
- Create: `lib/content/write.ts`
- Test: `tests/unit/write.test.ts`

**Interfaces:**
- Consumes: `assertBlocks` (`lib/content/blocks.ts`, frozen), `assertQuiz`/`assertMeta`/`assertSourceRef` (Task 2), `lessons`/`quizQuestions` (`lib/db/schema.ts`).
- Produces: `createWriter(deps: WriterDeps): Writer`, where

```ts
interface WriterDeps { db: AnyDb; revalidate: (tags: string[]) => Promise<void> | void; repoRoot?: string }
interface Writer {
  writeLessonBody(id: string, blocks: unknown, sourceRef: string): Promise<void>;
  writeLessonMeta(id: string, patch: unknown): Promise<void>;
  promoteDraft(id: string): Promise<boolean>;    // Task 4
  discardDraft(id: string): Promise<boolean>;    // Task 4
  upsertQuiz(id: string, questions: unknown, deleteMissing?: boolean): Promise<QuizUpsertResult>; // Task 5
  createLesson(input: unknown): Promise<string>; // Task 6
  setStatus(id: string, status: "draft" | "published"): Promise<void>; // Task 4
  setAccess(id: string, access: "free" | "members" | "admin"): Promise<void>; // Task 4
}
```

- Later tasks rely on `tagsFor(id)` returning **exactly** `[\`lesson:${id}\`, \`lesson-meta:${id}\`, "catalog"]` in that order.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/write.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { createWriter } from "@/lib/content/write";

/** Minimal fake Drizzle: records the last update payload, returns rows on demand. */
function fakeDb(returning: unknown[] = [{ id: "m1-01" }]) {
  const calls: { set?: Record<string, unknown> }[] = [];
  const chain = {
    set(v: Record<string, unknown>) { calls.push({ set: v }); return chain; },
    where() { return chain; },
    returning() { return Promise.resolve(returning); },
    then(res: (v: unknown) => void) { return Promise.resolve(returning).then(res); },
  };
  return { db: { update: () => chain, select: () => chain, from: () => chain }, calls };
}

const BLOCKS = [{ t: "p", c: [{ t: "text", v: "hello" }] }];
const REF = "notes/ict-core/INDEX.md";

describe("writeLessonBody", () => {
  it("writes body_draft and source_ref_draft — never the live body", async () => {
    const { db, calls } = fakeDb();
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    await w.writeLessonBody("m1-01", BLOCKS, REF);

    const set = calls[0].set!;
    expect(set.bodyDraft).toEqual(BLOCKS);
    expect(set.sourceRefDraft).toBe(REF);
    expect(set.body).toBeUndefined();          // invariant 6: the live body is untouched
    expect(set.writeOrigin).toBe("cms");       // invariant 9: body writes claim the row
  });

  it("purges all three tags, in one call, in the same function as the write", async () => {
    const { db } = fakeDb();
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    await w.writeLessonBody("m1-01", BLOCKS, REF);
    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(revalidate).toHaveBeenCalledWith(["lesson:m1-01", "lesson-meta:m1-01", "catalog"]);
  });

  it("refuses a body write with no sourceRef", async () => {
    const { db } = fakeDb();
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await expect(w.writeLessonBody("m1-01", BLOCKS, "" as string))
      .rejects.toThrow(/sourceRef is required/);
  });

  it("refuses invalid block JSON, reporting the path", async () => {
    const { db } = fakeDb();
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await expect(w.writeLessonBody("m1-01", [{ t: "nope" }], REF))
      .rejects.toThrow(/block\[0\]/);
  });

  it("does not write when validation fails", async () => {
    const { db, calls } = fakeDb();
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await expect(w.writeLessonBody("m1-01", [{ t: "nope" }], REF)).rejects.toThrow();
    expect(calls).toHaveLength(0);
  });
});

describe("writeLessonMeta", () => {
  it("applies live and does NOT claim the row as cms", async () => {
    const { db, calls } = fakeDb();
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await w.writeLessonMeta("m1-01", { title: "New" });
    expect(calls[0].set!.title).toBe("New");
    // invariant 9: only BODY writes set 'cms'. A title tweak must not make the
    // importer refuse this lesson forever.
    expect(calls[0].set!.writeOrigin).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm test:unit -- write.test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `lib/content/write.ts`:

```ts
import { eq } from "drizzle-orm";
import { lessons } from "@/lib/db/schema";
import { assertBlocks } from "./blocks";
import { assertMeta, assertSourceRef } from "./write-validate";

/**
 * THE db HANDLE IS INJECTED, and this module imports NEITHER `@/lib/db` NOR
 * any `next/*`. `lib/db/index.ts:1` is `import "server-only"` — a package that
 * is NOT installed; Next aliases it at build time and vitest.config.ts:21
 * aliases it to a stub. A plain Node process (mcp/server.ts, scripts/*.mjs)
 * that reaches lib/db dies with ERR_MODULE_NOT_FOUND, and nothing in lint,
 * tsc, pnpm build or the unit suite would tell you. Same invisible-failure
 * class as the "use server" type-export trap. Do not "simplify" this away.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyDb = any;

export interface WriterDeps {
  db: AnyDb;
  revalidate: (tags: string[]) => Promise<void> | void;
  repoRoot?: string;
}

/** Invariant 2′: EVERY write purges all three, uniformly. */
export function tagsFor(id: string): string[] {
  return [`lesson:${id}`, `lesson-meta:${id}`, "catalog"];
}

export function createWriter({ db, revalidate, repoRoot = process.cwd() }: WriterDeps) {
  async function writeLessonBody(id: string, blocks: unknown, sourceRef: string): Promise<void> {
    const ref = assertSourceRef(sourceRef, repoRoot);
    const body = assertBlocks(blocks);
    await db
      .update(lessons)
      .set({ bodyDraft: body, sourceRefDraft: ref, writeOrigin: "cms", updatedAt: new Date() })
      .where(eq(lessons.id, id));
    await revalidate(tagsFor(id));
  }

  async function writeLessonMeta(id: string, patch: unknown): Promise<void> {
    const meta = assertMeta(patch);
    if (Object.keys(meta).length === 0) return;
    await db.update(lessons).set({ ...meta, updatedAt: new Date() }).where(eq(lessons.id, id));
    await revalidate(tagsFor(id));
  }

  return { writeLessonBody, writeLessonMeta };
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `pnpm test:unit -- write.test`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/content/write.ts tests/unit/write.test.ts
git commit -m "feat: add the injected-db writer core with drafted body writes"
```

---

### Task 4: promote, discard, status and access

**Files:**
- Modify: `lib/content/write.ts`
- Test: `tests/unit/write.test.ts` (add cases)

**Interfaces:**
- Produces: `promoteDraft(id) => Promise<boolean>` (false = there was no draft), `discardDraft(id) => Promise<boolean>`, `setStatus(id, status)`, `setAccess(id, access)`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/write.test.ts`:

```ts
describe("promoteDraft", () => {
  it("moves body AND source_ref together, and clears both draft columns", async () => {
    const { db, calls } = fakeDb([{ id: "m1-01" }]);
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    const ok = await w.promoteDraft("m1-01");
    expect(ok).toBe(true);
    const set = calls[0].set!;
    // The ref must travel with the body it describes, or source_ref ends up
    // describing prose nobody published.
    expect(set.bodyDraft).toBeNull();
    expect(set.sourceRefDraft).toBeNull();
    expect(set.writeOrigin).toBe("cms");
  });

  it("reports false when there was no draft rather than silently succeeding", async () => {
    const { db } = fakeDb([]);                    // RETURNING came back empty
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    expect(await w.promoteDraft("m1-01")).toBe(false);
  });
});

describe("setStatus / setAccess", () => {
  it("stamps publishedAt on publish and clears it on unpublish", async () => {
    const { db, calls } = fakeDb();
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await w.setStatus("m1-01", "published");
    expect(calls[0].set!.publishedAt).toBeInstanceOf(Date);
    await w.setStatus("m1-01", "draft");
    expect(calls[1].set!.publishedAt).toBeNull();
  });

  it("purges all three tags on an access flip (invariant 2)", async () => {
    const { db } = fakeDb();
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    await w.setAccess("p1-02", "free");
    expect(revalidate).toHaveBeenCalledWith(["lesson:p1-02", "lesson-meta:p1-02", "catalog"]);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm test:unit -- write.test`
Expected: FAIL — `w.promoteDraft is not a function`.

- [ ] **Step 3: Implement**

Add to `lib/content/write.ts` inside `createWriter`, and add each to the returned object:

```ts
  /**
   * ONE statement, so it is atomic without a transaction (neon-http has no
   * interactive ones). `WHERE body_draft IS NOT NULL` + RETURNING is what makes
   * "there was no draft" reportable instead of a silent no-op success.
   * The cache purge is still a separate round trip — see the spec §4.4.
   */
  async function promoteDraft(id: string): Promise<boolean> {
    const rows = await db
      .update(lessons)
      .set({
        body: sql`${lessons.bodyDraft}`,
        sourceRef: sql`${lessons.sourceRefDraft}`,
        bodyDraft: null,
        sourceRefDraft: null,
        writeOrigin: "cms",
        updatedAt: new Date(),
      })
      .where(and(eq(lessons.id, id), isNotNull(lessons.bodyDraft)))
      .returning({ id: lessons.id });
    if (rows.length === 0) return false;
    await revalidate(tagsFor(id));
    return true;
  }

  async function discardDraft(id: string): Promise<boolean> {
    const rows = await db
      .update(lessons)
      .set({ bodyDraft: null, sourceRefDraft: null, updatedAt: new Date() })
      .where(and(eq(lessons.id, id), isNotNull(lessons.bodyDraft)))
      .returning({ id: lessons.id });
    return rows.length > 0;
  }

  async function setStatus(id: string, status: "draft" | "published"): Promise<void> {
    await db
      .update(lessons)
      .set({ status, publishedAt: status === "published" ? new Date() : null, updatedAt: new Date() })
      .where(eq(lessons.id, id));
    await revalidate(tagsFor(id));
  }

  async function setAccess(id: string, access: "free" | "members" | "admin"): Promise<void> {
    await db.update(lessons).set({ access, updatedAt: new Date() }).where(eq(lessons.id, id));
    await revalidate(tagsFor(id));
  }
```

Extend the import at the top of the file:

```ts
import { and, eq, isNotNull, sql } from "drizzle-orm";
```

- [ ] **Step 4: Run and confirm pass**

Run: `pnpm test:unit -- write.test` → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/content/write.ts tests/unit/write.test.ts
git commit -m "feat: add promote, discard, status and access to the writer core"
```

---

### Task 5: `upsertQuiz` — id-preserving, atomic ord settle

**Files:**
- Modify: `lib/content/write.ts`
- Test: `tests/unit/write.test.ts` (add cases)

**Interfaces:**
- Produces: `upsertQuiz(id, questions, deleteMissing = false) => Promise<{ inserted: number; updated: number; deleted: number; cascadeAnswers: number }>`.

> **Why this is not a plain delete-and-reinsert:** `quiz_results` keys on `question_id` (invariant 4), so reinserting with fresh uuids destroys every user's answer history. And `quiz_questions_lesson_ord_uq` (`schema.ts:120`) is unique on `(lesson_id, ord)`, so a reorder collides mid-sequence. `db.batch([...])` is atomic on neon-http (verified: `drizzle-orm/neon-http/session.js` routes `batch()` through `client.transaction(...)`), so the settle happens in one transaction.

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/write.test.ts`:

```ts
describe("upsertQuiz", () => {
  it("refuses while a draft body is pending", async () => {
    const { db } = fakeDb([{ id: "m1-01", bodyDraft: [{ t: "p", c: [] }] }]);
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await expect(w.upsertQuiz("m1-01", [])).rejects.toThrow(/promote or discard the pending draft first/);
  });

  it("parks existing ords in negative space before assigning final ords", async () => {
    const batched: unknown[] = [];
    const { db } = fakeDb([{ id: "m1-01", bodyDraft: null }]);
    (db as Record<string, unknown>).batch = (stmts: unknown[]) => { batched.push(...stmts); return Promise.resolve([]); };
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await w.upsertQuiz("m1-01", [
      { id: "11111111-1111-1111-1111-111111111111", q: "a?", options: ["1","2","3","4"], answer: 0, explanation: "e" },
    ]);
    // One park statement + one upsert. Without the park, a reorder violates
    // quiz_questions_lesson_ord_uq mid-sequence.
    expect(batched.length).toBeGreaterThanOrEqual(2);
  });

  it("refuses to delete unless deleteMissing is explicitly true", async () => {
    const { db } = fakeDb([{ id: "m1-01", bodyDraft: null }]);
    (db as Record<string, unknown>).batch = () => Promise.resolve([]);
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    const res = await w.upsertQuiz("m1-01", []);
    expect(res.deleted).toBe(0);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm test:unit -- write.test` → FAIL, `w.upsertQuiz is not a function`.

- [ ] **Step 3: Implement**

Add to `createWriter` (and to the returned object):

```ts
  async function upsertQuiz(id: string, questions: unknown, deleteMissing = false) {
    const qs = assertQuiz(questions);

    // §4.4: a live quiz must not reference prose that exists only in an
    // unpromoted draft. Refuse rather than create that mismatch.
    const [row] = await db
      .select({ bodyDraft: lessons.bodyDraft })
      .from(lessons)
      .where(eq(lessons.id, id))
      .limit(1);
    if (!row) throw new Error(`no such lesson: ${id}`);
    if (row.bodyDraft !== null && row.bodyDraft !== undefined)
      throw new Error(`${id} has a pending draft body — promote or discard the pending draft first`);

    const existing = await db
      .select({ id: quizQuestions.id })
      .from(quizQuestions)
      .where(eq(quizQuestions.lessonId, id));
    const keep = new Set(qs.filter((q) => q.id).map((q) => q.id as string));
    const orphans = existing.filter((e: { id: string }) => !keep.has(e.id)).map((e: { id: string }) => e.id);

    let cascadeAnswers = 0;
    if (orphans.length) {
      const [c] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(quizResults)
        .where(inArray(quizResults.questionId, orphans));
      cascadeAnswers = c?.n ?? 0;
    }

    // ATOMIC ord settle. Step 1 parks every existing row at a negative ord,
    // which is disjoint from every final ord, so no unique-index collision is
    // possible in step 2. db.batch is a real transaction on neon-http.
    const stmts: unknown[] = [
      db.update(quizQuestions)
        .set({ ord: sql`-${quizQuestions.ord} - 1` })
        .where(eq(quizQuestions.lessonId, id)),
    ];
    qs.forEach((q, i) => {
      const values = { lessonId: id, ord: i, q: q.q, options: q.options, answer: q.answer, explanation: q.explanation };
      stmts.push(
        q.id
          ? db.insert(quizQuestions).values({ id: q.id, ...values })
              .onConflictDoUpdate({ target: quizQuestions.id, set: values })
          : db.insert(quizQuestions).values(values),
      );
    });
    if (deleteMissing && orphans.length) {
      stmts.push(db.delete(quizQuestions).where(inArray(quizQuestions.id, orphans)));
    }
    await db.batch(stmts);

    await revalidate(tagsFor(id));
    return {
      inserted: qs.filter((q) => !q.id).length,
      updated: qs.filter((q) => q.id).length,
      deleted: deleteMissing ? orphans.length : 0,
      cascadeAnswers,
    };
  }
```

Extend imports: `import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";` and `import { lessons, quizQuestions, quizResults } from "@/lib/db/schema";` and `import { assertMeta, assertQuiz, assertSourceRef } from "./write-validate";`.

> If `deleteMissing` is false and orphans remain, they keep their **negative** ords after the batch. That is intentional and visible — the integration test in Task 17 asserts a non-deleting upsert leaves no negative ords by re-settling orphans at the tail. Implement that tail re-settle now: append the orphans (in their original order) at ords `qs.length + n`.

- [ ] **Step 4: Run and confirm pass**

Run: `pnpm test:unit -- write.test` → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/content/write.ts tests/unit/write.test.ts
git commit -m "feat: add id-preserving upsertQuiz with an atomic ord settle"
```

---

### Task 6: `createLesson` — derived slug, fail-closed access

**Files:**
- Modify: `lib/content/write.ts`
- Test: `tests/unit/write.test.ts` (add cases)

**Interfaces:**
- Produces: `createLesson(input) => Promise<string>` (returns the new id).

- [ ] **Step 1: Write the failing tests**

```ts
describe("createLesson", () => {
  const base = {
    id: "m1-99", sectionId: "s1", monthId: "m1", ord: 99,
    title: "Market Maker Traps", heading: "Market Maker Traps", crumb: "Month 1 · Lesson 99",
    desc: [{ t: "text", v: "d" }], kind: "lesson",
  };

  it("derives the slug from month and kebab title and starts as an unpublished draft", async () => {
    const { db, calls } = fakeDb([]);           // no slug collision
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await w.createLesson({ ...base, access: "free" });
    const v = calls[0].set ?? (calls[0] as Record<string, unknown>).values;
    expect((v as Record<string, unknown>).slug).toBe("m1-99-market-maker-traps");
    expect((v as Record<string, unknown>).status).toBe("draft");
  });

  it("defaults access to members when omitted — invariant 3, fail closed", async () => {
    const { db, calls } = fakeDb([]);
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await w.createLesson(base);
    const v = calls[0].set ?? (calls[0] as Record<string, unknown>).values;
    expect((v as Record<string, unknown>).access).toBe("members");
  });

  it("rejects an unrecognised access value rather than passing it through", async () => {
    const { db } = fakeDb([]);
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await expect(w.createLesson({ ...base, access: "public" })).rejects.toThrow(/access must be/);
  });
});
```

- [ ] **Step 2: Run and confirm failure** — `pnpm test:unit -- write.test` → FAIL.

- [ ] **Step 3: Implement**

```ts
  function kebab(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  async function createLesson(input: unknown): Promise<string> {
    if (typeof input !== "object" || input === null) throw new Error("createLesson: expected an object");
    const i = input as Record<string, unknown>;
    for (const k of ["id", "sectionId", "ord", "title", "heading", "crumb", "kind"]) {
      if (i[k] === undefined) throw new Error(`createLesson: ${k} is required`);
    }
    const access = i.access ?? "members";       // invariant 3: absent means closed
    if (!["free", "members", "admin"].includes(access as string))
      throw new Error(`createLesson: access must be free, members or admin (got "${String(i.access)}")`);
    if (!["lesson", "review", "exam"].includes(i.kind as string))
      throw new Error(`createLesson: kind must be lesson, review or exam`);

    // (month_id, section_id) is a COMPOSITE FK (schema.ts:96-100). Precheck so
    // a mismatch reports itself instead of surfacing a raw constraint violation.
    if (i.monthId) {
      const [m] = await db
        .select({ id: months.id })
        .from(months)
        .where(and(eq(months.id, i.monthId as string), eq(months.sectionId, i.sectionId as string)))
        .limit(1);
      if (!m) throw new Error(`createLesson: month "${String(i.monthId)}" does not belong to section "${String(i.sectionId)}"`);
    }

    const slug = `${String(i.id)}-${kebab(String(i.title))}`;
    const [clash] = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.slug, slug)).limit(1);
    if (clash) throw new Error(`createLesson: slug "${slug}" is already used by lesson "${clash.id}"`);

    await db.insert(lessons).values({
      id: i.id as string,
      sectionId: i.sectionId as string,
      monthId: (i.monthId as string) ?? null,
      slug,
      title: i.title as string,
      heading: i.heading as string,
      crumb: i.crumb as string,
      desc: i.desc ? assertMeta({ desc: i.desc }).desc : [],
      ord: i.ord as number,
      kind: i.kind as string,
      access: access as string,
      status: "draft",            // never born visible
      body: [],
      writeOrigin: "cms",
    });
    await revalidate(tagsFor(i.id as string));
    return i.id as string;
  }
```

Extend the schema import with `months`.

- [ ] **Step 4: Run and confirm pass** — `pnpm test:unit -- write.test` → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/content/write.ts tests/unit/write.test.ts
git commit -m "feat: add createLesson with derived slug and fail-closed access"
```

---

### Task 7: `admin-queries.ts` — the admin reads

**Files:**
- Create: `lib/content/admin-queries.ts`
- Test: `tests/unit/write.test.ts` is unaffected; covered by integration in Task 17.

**Interfaces:**
- Produces: `createAdminQueries({ db })` → `getLessonDraftBody(id): Promise<Block[] | null>`, `listLessonsAdmin(sectionId?): Promise<AdminLessonRow[]>`, `getLessonForEdit(id)`.
- `AdminLessonRow = { id, title, access, status, hasDraft: boolean, writeOrigin: string, sourceRef: string | null }`.

- [ ] **Step 1: Create the module**

`queries.ts` is FROZEN — these live in a new file, and it must also avoid `lib/db` so `mcp/server.ts` can import it.

```ts
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { lessons } from "@/lib/db/schema";
import { assertBlocks, type Block } from "./blocks";
import type { AnyDb } from "./write";

export interface AdminLessonRow {
  id: string; title: string; access: string; status: string;
  hasDraft: boolean; writeOrigin: string; sourceRef: string | null;
}

export function createAdminQueries({ db }: { db: AnyDb }) {
  /**
   * ADMIN ONLY. Never call this from a public read path — invariant 6 holds
   * because getLessonBody() selects `body` and only `body`, and NOTHING does an
   * unprojected select on `lessons`. Keep it that way.
   */
  async function getLessonDraftBody(id: string): Promise<Block[] | null> {
    const [row] = await db.select({ bodyDraft: lessons.bodyDraft }).from(lessons).where(eq(lessons.id, id)).limit(1);
    if (!row || row.bodyDraft == null) return null;
    return assertBlocks(row.bodyDraft);
  }

  async function listLessonsAdmin(sectionId?: string): Promise<AdminLessonRow[]> {
    const rows = await db
      .select({
        id: lessons.id, title: lessons.title, access: lessons.access, status: lessons.status,
        bodyDraft: lessons.bodyDraft, writeOrigin: lessons.writeOrigin, sourceRef: lessons.sourceRef,
      })
      .from(lessons)
      .where(sectionId ? eq(lessons.sectionId, sectionId) : undefined)
      .orderBy(asc(lessons.ord));
    return rows.map((r: Record<string, unknown>) => ({
      id: r.id as string, title: r.title as string, access: r.access as string, status: r.status as string,
      hasDraft: r.bodyDraft != null, writeOrigin: r.writeOrigin as string, sourceRef: (r.sourceRef as string) ?? null,
    }));
  }

  async function getLessonForEdit(id: string) {
    const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
    return row ?? null;
  }

  return { getLessonDraftBody, listLessonsAdmin, getLessonForEdit };
}
```

- [ ] **Step 2: Verify it imports no `next/*` and no `lib/db`**

```bash
grep -nE "from \"next|@/lib/db\"" lib/content/admin-queries.ts
```

Expected: only `@/lib/db/schema` (types + table defs, safe), never `@/lib/db`.

- [ ] **Step 3: Lint and commit**

```bash
pnpm lint
git add lib/content/admin-queries.ts
git commit -m "feat: add admin-only draft and catalog reads outside the frozen queries.ts"
```

---

### Task 8: Refactor `mutations.ts` onto the writer

**Files:**
- Modify: `lib/content/mutations.ts`

- [ ] **Step 1: Rewrite the module body**

Keep the long `revalidateTag` comment block verbatim — it documents a traced Next 16 behaviour. Replace the write bodies:

```ts
"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { createWriter } from "./write";
import { accessContext } from "@/lib/db/access-queries";

async function requireAdmin(): Promise<void> {
  const ctx = await accessContext();
  if (!ctx.isAdmin) throw new Error("admin only");
}

/* … keep the existing revalidateTag explanation comment here, unchanged … */
const writer = createWriter({
  db,
  revalidate: (tags) => { for (const t of tags) revalidateTag(t, { expire: 0 }); },
});

export async function setLessonAccess(id: string, access: "free" | "members" | "admin"): Promise<void> {
  await requireAdmin();
  await writer.setAccess(id, access);
}

export async function publishLesson(id: string, status: "draft" | "published"): Promise<void> {
  await requireAdmin();
  await writer.setStatus(id, status);
}

/**
 * INVARIANT 5: the body arrives as a JSON *string*. React Flight silently drops
 * a ProseMirror/Tiptap node's attrs (including an image src) across the
 * client→server boundary — text and marks survive, so it looks like it works.
 * The MCP tool deliberately takes a real array instead: MCP is JSON-RPC and has
 * no such flaw. Do not "align" the two.
 */
export async function saveLessonBody(id: string, bodyJson: string, sourceRef: string): Promise<void> {
  await requireAdmin();
  await writer.writeLessonBody(id, JSON.parse(bodyJson), sourceRef);
}

export async function promoteLessonDraft(id: string): Promise<boolean> {
  await requireAdmin();
  return writer.promoteDraft(id);
}
```

- [ ] **Step 2: Verify the `"use server"` rule**

```bash
grep "^export" lib/content/mutations.ts
```

Expected: **only** lines beginning `export async function`. Any `export type`/`export const` here throws `ReferenceError` on an authenticated render while lint, `tsc` and `pnpm build` all pass.

- [ ] **Step 3: Full gate**

```bash
pnpm lint && pnpm test:unit && rm -rf .next && pnpm build
```

Expected: all green, build exit 0.

- [ ] **Step 4: Commit**

```bash
git add lib/content/mutations.ts
git commit -m "refactor: route the server actions through the shared writer core"
```

---

# Phase 2 — The MCP face and the human CLIs

### Task 9: MCP host wiring + the startup smoke check

**Files:**
- Create: `mcp/host.ts`, `mcp/server.ts`
- Modify: `package.json` (add `@modelcontextprotocol/sdk`, add an `mcp` script)

> **This task exists because nothing else can catch its failure.** `lib/db/index.ts:1` imports `server-only`, which is not installed. If any module in this chain reaches `lib/db`, the server dies at startup with `ERR_MODULE_NOT_FOUND` while lint, `tsc`, `pnpm build` and all unit tests stay green.

- [ ] **Step 1: Add the dependency**

```bash
pnpm add @modelcontextprotocol/sdk
```

- [ ] **Step 2: Write the host**

`mcp/host.ts`:

```ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { createWriter } from "../lib/content/write.ts";
import { createAdminQueries } from "../lib/content/admin-queries.ts";

const base = process.env.REVALIDATE_BASE_URL ?? "http://localhost:3000";
const secret = process.env.REVALIDATE_SECRET;

async function purge(tag: string): Promise<Response> {
  return fetch(`${base}/api/revalidate?tag=${encodeURIComponent(tag)}`, {
    headers: { "x-revalidate-secret": secret ?? "" },
  });
}

/**
 * PREFLIGHT BEFORE ANY WRITE, exactly as scripts/set-access.mjs does. Checking
 * only after the write commits leaves a stale readable copy in the public ISR
 * cache with no way back short of a manual purge — the invariant-2 failure this
 * exists to prevent.
 */
export async function preflight(): Promise<void> {
  if (!secret) throw new Error("REVALIDATE_SECRET is not set — refusing to write; the ISR cache could not be purged.");
  let res: Response;
  try {
    res = await purge("catalog");
  } catch (err) {
    throw new Error(`could not reach the revalidate endpoint at ${base} — refusing to write: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!res.ok) throw new Error(`revalidate endpoint at ${base} rejected the request (status ${res.status}) — refusing to write.`);
}

export function createHost() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set — see .env.local");
  const db = drizzle(neon(process.env.DATABASE_URL));
  const revalidate = async (tags: string[]) => {
    const failed: string[] = [];
    for (const t of tags) {
      try { if (!(await purge(t)).ok) failed.push(t); } catch { failed.push(t); }
    }
    if (failed.length) throw new Error(`FAILED to purge ${failed.join(", ")} after the write committed — the public cache is stale.`);
  };
  return { db, revalidate, writer: createWriter({ db, revalidate }), admin: createAdminQueries({ db }) };
}
```

- [ ] **Step 3: Write the server entrypoint with the resolver shim**

`mcp/server.ts` — the shim is mandatory: `lib/content/*` use extensionless relative imports Node's resolver rejects (see `scripts/import-content.mjs:8-17`).

```ts
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith(".") && !/\.[a-z]+$/i.test(spec)) {
      const url = new URL(spec + ".ts", ctx.parentURL);
      if (existsSync(fileURLToPath(url))) return next(spec + ".ts", ctx);
    }
    return next(spec, ctx);
  },
});

const { Server } = await import("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
const { ListToolsRequestSchema, CallToolRequestSchema } = await import("@modelcontextprotocol/sdk/types.js");
const { createHost } = await import("./host.ts");

const host = createHost();
const server = new Server({ name: "the-algorithm-content", version: "1.0.0" }, { capabilities: { tools: {} } });

// STDIO ONLY. An HTTP transport would recreate the public authenticated write
// surface this design deliberately refused.
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

const TOOLS: unknown[] = [];   // filled in by Tasks 10 and 11

await server.connect(new StdioServerTransport());
```

- [ ] **Step 4: Add the run script**

In `package.json` `scripts`:

```json
"mcp": "node --env-file=.env.local --experimental-strip-types mcp/server.ts"
```

- [ ] **Step 5: Prove the server actually starts — the whole point of this task**

```bash
# A well-formed initialize request over stdio. If the process dies with
# ERR_MODULE_NOT_FOUND (server-only) this prints nothing and exits non-zero.
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"0"}}}' \
  | pnpm mcp 2>&1 | head -5
```

Expected: a JSON-RPC result naming `the-algorithm-content`. **If you see `ERR_MODULE_NOT_FOUND: server-only`, something in the import chain reached `@/lib/db` — find it and inject the handle instead.**

- [ ] **Step 6: Commit**

```bash
git add mcp/host.ts mcp/server.ts package.json pnpm-lock.yaml
git commit -m "feat: add the MCP stdio host with a preflighted HTTP purger"
```

---

### Task 10: MCP read tools — `list_lessons`, `get_lesson`

**Files:**
- Modify: `mcp/server.ts`

- [ ] **Step 1: Define the two tools**

Replace the empty `TOOLS` array and add a `CallToolRequestSchema` handler:

```ts
const TOOLS = [
  {
    name: "list_lessons",
    description: "List lessons with their access, status, whether a draft is pending, and provenance.",
    inputSchema: { type: "object", properties: { sectionId: { type: "string" } } },
  },
  {
    name: "get_lesson",
    description: "Full lesson row including the live body and any pending draft body.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
];

function ok(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function err(e: unknown) {
  return { isError: true, content: [{ type: "text", text: e instanceof Error ? e.message : String(e) }] };
}

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: a = {} } = req.params as { name: string; arguments?: Record<string, unknown> };
  try {
    switch (name) {
      case "list_lessons":
        return ok(await host.admin.listLessonsAdmin(a.sectionId as string | undefined));
      case "get_lesson":
        return ok(await host.admin.getLessonForEdit(a.id as string));
      default:
        throw new Error(`unknown tool: ${name}`);
    }
  } catch (e) {
    return err(e);
  }
});
```

- [ ] **Step 2: Verify against the live DB**

```bash
printf '%s\n%s\n' \
 '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"s","version":"0"}}}' \
 '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_lessons","arguments":{"sectionId":"s1"}}}' \
 | pnpm mcp 2>&1 | tail -3
```

Expected: 40 s1 rows, every one `hasDraft: false`, `writeOrigin: "import"`.

- [ ] **Step 3: Commit**

```bash
git add mcp/server.ts
git commit -m "feat: add the MCP read tools"
```

---

### Task 11: MCP write tools — and the four that are deliberately absent

**Files:**
- Modify: `mcp/server.ts`

> **Invariant 10.** `promote_draft`, `discard_draft`, `set_access` and `set_status` are **NOT** exposed. The agent reads transcripts and notes — text it did not author — so a prompt injection or a plain model error must not be able to publish. If you find yourself adding one of these "for convenience", stop: it removes the design's only real §1 control.

- [ ] **Step 1: Add four tools**

```ts
TOOLS.push(
  {
    name: "write_lesson_body",
    description: "Write the lesson's DRAFT body. Never touches the live body. Requires sourceRef, a real path under transcripts/ or notes/.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, blocks: { type: "array" }, sourceRef: { type: "string" } },
      required: ["id", "blocks", "sourceRef"],
    },
  },
  {
    name: "write_lesson_meta",
    description: "Update title/heading/crumb/desc/videoUrl. Applies LIVE (this metadata is already public via the catalog). slug is not writable.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, patch: { type: "object" } }, required: ["id", "patch"] },
  },
  {
    name: "upsert_quiz",
    description: "Insert/update questions, preserving question_id so user answers survive. Refused while a draft body is pending.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, questions: { type: "array" }, deleteMissing: { type: "boolean" } },
      required: ["id", "questions"],
    },
  },
  {
    name: "create_lesson",
    description: "Create a text-only lesson. Starts as an unpublished draft; access defaults to members.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, sectionId: { type: "string" } }, required: ["id", "sectionId"] },
  },
);
```

Add the cases to the `switch`, each preflighting first:

```ts
      case "write_lesson_body":
        await preflight();
        await host.writer.writeLessonBody(a.id as string, a.blocks, a.sourceRef as string);
        return ok({ ok: true, wrote: "body_draft", note: "not visible to readers until a human promotes it" });
      case "write_lesson_meta":
        await preflight();
        await host.writer.writeLessonMeta(a.id as string, a.patch);
        return ok({ ok: true, applied: "live" });
      case "upsert_quiz":
        await preflight();
        return ok(await host.writer.upsertQuiz(a.id as string, a.questions, a.deleteMissing === true));
      case "create_lesson":
        await preflight();
        return ok({ id: await host.writer.createLesson(a) });
```

Import `preflight` alongside `createHost`.

- [ ] **Step 2: Prove the agent cannot publish**

```bash
printf '%s\n%s\n' \
 '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"s","version":"0"}}}' \
 '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | pnpm mcp 2>&1 | grep -c "set_status\|set_access\|promote_draft"
```

Expected: **0**. If this is non-zero, invariant 10 is broken.

- [ ] **Step 3: Commit**

```bash
git add mcp/server.ts
git commit -m "feat: add the MCP write tools, with publishing deliberately absent"
```

---

### Task 12: The human CLIs — `promote-draft.mjs` and `set-status.mjs`

**Files:**
- Create: `scripts/promote-draft.mjs`, `scripts/set-status.mjs`
- Modify: `package.json` (two scripts)

> **`set-status.mjs` is required, not a nicety.** `scripts/set-access.mjs:57` writes only `access`; the sole existing status writer is `publishLesson`, a Server Action needing a signed-in browser session that this project does not ship. Without this script there is **no way to publish at all**, and success criterion 1 is unreachable.

- [ ] **Step 1: Write `scripts/promote-draft.mjs`**

Model it on `set-access.mjs` — same shim, same preflight-before-write, same `process.exitCode` (not `process.exit`, which crashes Node on Windows while the neon keep-alive socket is open).

```js
// scripts/promote-draft.mjs
// Usage: node --env-file=.env.local --experimental-strip-types scripts/promote-draft.mjs <promote|discard> <lessonId…>
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith(".") && !/\.[a-z]+$/i.test(spec)) {
      const url = new URL(spec + ".ts", ctx.parentURL);
      if (existsSync(fileURLToPath(url))) return next(spec + ".ts", ctx);
    }
    return next(spec, ctx);
  },
});

const { createHost, preflight } = await import("../mcp/host.ts");

const [verb, ...ids] = process.argv.slice(2);
if (!["promote", "discard"].includes(verb) || ids.length === 0) {
  console.error("usage: promote-draft.mjs <promote|discard> <lessonId…>");
  process.exit(1);
}

await preflight();
const { writer } = createHost();

let failed = false;
for (const id of ids) {
  const ok = verb === "promote" ? await writer.promoteDraft(id) : await writer.discardDraft(id);
  console.log(`${verb} ${id}: ${ok ? "done" : "NO DRAFT PENDING — nothing changed"}`);
  if (!ok) failed = true;
}
if (failed) process.exitCode = 1;
```

- [ ] **Step 2: Write `scripts/set-status.mjs`**

Identical structure; the body becomes:

```js
const [status, ...ids] = process.argv.slice(2);
if (!["draft", "published"].includes(status) || ids.length === 0) {
  console.error("usage: set-status.mjs <draft|published> <lessonId…>");
  process.exit(1);
}
await preflight();
const { writer } = createHost();
for (const id of ids) {
  await writer.setStatus(id, status);
  console.log(`${id} → ${status}`);
}
```

- [ ] **Step 3: Add the scripts to `package.json`**

```json
"content:promote": "node --env-file=.env.local --experimental-strip-types scripts/promote-draft.mjs",
"content:status": "node --env-file=.env.local --experimental-strip-types scripts/set-status.mjs"
```

- [ ] **Step 4: Verify both run and refuse cleanly**

```bash
pnpm content:promote promote m1-01     # expect: "NO DRAFT PENDING", exit 1
```

- [ ] **Step 5: Commit**

```bash
git add scripts/promote-draft.mjs scripts/set-status.mjs package.json
git commit -m "feat: add the human promote and publish CLIs"
```

---

### Task 13: Register the MCP server and document the workflow

**Files:**
- Modify: `.mcp.json`, `docs/` (new `docs/cms-authoring.md`)

- [ ] **Step 1: Read the existing `.mcp.json` before touching it** — it is a pre-existing untracked file; preserve any server already registered.

- [ ] **Step 2: Add this server**

```json
{
  "mcpServers": {
    "content": {
      "command": "node",
      "args": ["--env-file=.env.local", "--experimental-strip-types", "mcp/server.ts"]
    }
  }
}
```

- [ ] **Step 3: Write `docs/cms-authoring.md`** covering: the six tools; that the agent **cannot** publish; the two-step human flow (`pnpm content:promote promote <id>` then `pnpm content:status published <id>`); that `sourceRef` must be a real path under `transcripts/` or `notes/`; and that CLAUDE.md §1 still governs — the promote gate is the review, so read the draft before promoting.

- [ ] **Step 4: Commit** (include `.mcp.json` — it holds no secrets; env comes from `.env.local`)

```bash
git add .mcp.json docs/cms-authoring.md
git commit -m "docs: register the content MCP server and document the authoring flow"
```

---

# Phase 3 — The importer and the draft disclosure

### Task 14: Make the importer additive and draft-aware

**Files:**
- Modify: `scripts/import-content.mjs` (UNFROZEN by this project)
- Test: `tests/unit/importer-guards.test.ts`

- [ ] **Step 1: Write the failing test for the guard as a pure predicate**

```ts
import { describe, it, expect } from "vitest";
import { importDecision } from "@/lib/content/import-guard";

describe("importDecision", () => {
  it("writes a plain imported row", () => {
    expect(importDecision({ writeOrigin: "import", bodyDraft: null }, false)).toEqual({ write: true });
  });

  it("refuses a cms-authored row without --force", () => {
    const d = importDecision({ writeOrigin: "cms", bodyDraft: null }, false);
    expect(d.write).toBe(false);
    expect(d.reason).toMatch(/edited in the CMS/);
  });

  it("writes a cms row when --force is given", () => {
    expect(importDecision({ writeOrigin: "cms", bodyDraft: null }, true).write).toBe(true);
  });

  it("refuses a row with a pending draft EVEN WITH --force", () => {
    // Otherwise the import replaces the live body underneath a draft, leaving
    // source_ref_draft describing prose that no longer relates to what is live.
    const d = importDecision({ writeOrigin: "import", bodyDraft: [{ t: "p", c: [] }] }, true);
    expect(d.write).toBe(false);
    expect(d.reason).toMatch(/pending draft/);
  });

  it("treats a brand-new row (no existing record) as writable", () => {
    expect(importDecision(null, false)).toEqual({ write: true });
  });
});
```

- [ ] **Step 2: Run and confirm failure** — `pnpm test:unit -- importer-guards` → FAIL.

- [ ] **Step 3: Implement `lib/content/import-guard.ts`**

```ts
export interface ExistingRow { writeOrigin: string; bodyDraft: unknown }

export function importDecision(existing: ExistingRow | null, force: boolean): { write: boolean; reason?: string } {
  if (!existing) return { write: true };
  if (existing.bodyDraft != null)
    return { write: false, reason: "has a pending draft — promote or discard it first (--force will not override this)" };
  if (existing.writeOrigin === "cms" && !force)
    return { write: false, reason: "was edited in the CMS — re-run with --force to overwrite" };
  return { write: true };
}
```

- [ ] **Step 4: Wire it into `scripts/import-content.mjs`**

Add `--only <id>` and `--force`, then in the per-lesson loop, before the upsert:

```js
const force = process.argv.includes("--force");
const onlyIx = process.argv.indexOf("--only");
const only = onlyIx >= 0 ? process.argv[onlyIx + 1] : null;
// …
for (const l of plan.lessons) {
  if (only && l.id !== only) continue;
  const [existing] = await db
    .select({ writeOrigin: lessons.writeOrigin, bodyDraft: lessons.bodyDraft })
    .from(lessons).where(eq(lessons.id, l.id)).limit(1);
  const decision = importDecision(existing ?? null, force);
  if (!decision.write) { console.warn(`SKIP ${l.id}: ${decision.reason}`); skipped++; continue; }
  // … existing upsert …
}
```

And extend the `set` exclusion comment and object — the new columns must **never** be clobbered:

```js
  // access, publishedAt, bodyDraft, sourceRef, sourceRefDraft and writeOrigin
  // are NOT in `set`: an import must never reopen a lesson the CMS closed,
  // restamp its publish time, destroy a pending draft, or erase provenance.
  const values = { ...row, status: "published", updatedAt: new Date() };
```

(`values` is built from `row`, which comes from `readContentTree` and contains none of those columns — verify with a `console.log(Object.keys(values))` on a dry run, then remove it.)

- [ ] **Step 5: Verify on the live data**

```bash
pnpm content:import --dry-run           # unchanged plan output
node --env-file=.env.local --experimental-strip-types scripts/import-content.mjs --only m1-01
```

Expected: writes exactly one lesson; 82/564 counts unchanged afterwards.

- [ ] **Step 6: Commit**

```bash
git add scripts/import-content.mjs lib/content/import-guard.ts tests/unit/importer-guards.test.ts
git commit -m "feat: make the importer per-lesson, additive and draft-aware"
```

---

### Task 15: P-A — the admin-aware draft 404

**Files:**
- Modify: `app/api/quiz/[id]/route.ts`, `app/api/exam/[id]/route.ts`

> A draft currently answers **401** ("members only") to a stranger, which confirms it exists, while an unknown id answers 404. Dormant until now (0 non-published rows) — this project creates drafts, so it lands here. **The admin exception is not optional:** `/api/quiz/[id]` is the only route a quiz reaches a page through, so an unconditional 404 makes it impossible to review a draft's quiz before publishing.

- [ ] **Step 1: Add the guard to both routes**

In each, immediately after `const ctx = await accessContext();`:

```ts
  // P-A: a draft must be INDISTINGUISHABLE from a nonexistent lesson to anyone
  // who is not an admin — otherwise probing this route confirms the draft exists.
  // Admins must still get through, or a draft's quiz can never be reviewed.
  if (meta.status !== "published" && !ctx.isAdmin) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
```

- [ ] **Step 2: Confirm the existing 401-for-gated behaviour is untouched**

Run: `pnpm test:e2e -- quiz exam`
Expected: `quiz.spec.ts` and `exam.spec.ts` pass **unchanged** — they pin 401 for gated-but-published, which this does not alter.

- [ ] **Step 3: Commit**

```bash
git add "app/api/quiz/[id]/route.ts" "app/api/exam/[id]/route.ts"
git commit -m "fix: 404 a draft lesson's quiz and exam for non-admins"
```

---

# Phase 4 — Proving it

### Task 16: Integration tests against the real database

**Files:**
- Create: `tests/integration/write-db.test.ts`
- Modify: `vitest.config.ts` if integration needs a separate include (keep unit runnable with `DATABASE_URL` unset — `vitest.config.ts`'s placeholder is load-bearing)

- [ ] **Step 1: Write the tests**

Every test must clean up after itself with explicit `DELETE`s — **neon-http has no interactive transactions, so a `begin`/`rollback` pair would be three sessions and the write would COMMIT.** That already corrupted a row once.

```ts
import { describe, it, expect, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { createWriter } from "@/lib/content/write";
import { createAdminQueries } from "@/lib/content/admin-queries";
import { lessons, quizQuestions } from "@/lib/db/schema";

const db = drizzle(neon(process.env.DATABASE_URL!));
const writer = createWriter({ db, revalidate: async () => {} });   // purging is unit-tested
const admin = createAdminQueries({ db });
const ID = "m1-01";
const REF = "notes/ict-core/INDEX.md";
const BLOCKS = [{ t: "p", c: [{ t: "text", v: "INTEGRATION-DRAFT-MARKER" }] }];

afterAll(async () => {
  await db.update(lessons).set({ bodyDraft: null, sourceRefDraft: null }).where(eq(lessons.id, ID));
});

describe("draft lifecycle", () => {
  it("stores a draft that getLessonDraftBody can read back", async () => {
    await writer.writeLessonBody(ID, BLOCKS, REF);
    expect(await admin.getLessonDraftBody(ID)).toEqual(BLOCKS);
  });

  it("promote moves body AND ref together, then reports false on a second call", async () => {
    const before = await admin.getLessonForEdit(ID);
    await writer.writeLessonBody(ID, BLOCKS, REF);
    expect(await writer.promoteDraft(ID)).toBe(true);
    const after = await admin.getLessonForEdit(ID);
    expect(after.sourceRef).toBe(REF);
    expect(after.bodyDraft).toBeNull();
    expect(after.sourceRefDraft).toBeNull();
    expect(await writer.promoteDraft(ID)).toBe(false);      // nothing pending now
    // restore the original body so the lesson is unchanged for other suites
    await db.update(lessons).set({ body: before.body, sourceRef: before.sourceRef }).where(eq(lessons.id, ID));
  });
});

describe("upsertQuiz", () => {
  it("preserves question_id across a reword and survives a REORDER", async () => {
    const before = await db.select().from(quizQuestions).where(eq(quizQuestions.lessonId, ID)).orderBy(quizQuestions.ord);
    expect(before.length).toBeGreaterThanOrEqual(2);

    // Swap the first two — this is the case that violates
    // quiz_questions_lesson_ord_uq without the atomic negative-ord park.
    const swapped = [before[1], before[0], ...before.slice(2)].map((r) => ({
      id: r.id, q: r.q, options: r.options as string[], answer: r.answer, explanation: r.explanation,
    }));
    await writer.upsertQuiz(ID, swapped);

    const after = await db.select().from(quizQuestions).where(eq(quizQuestions.lessonId, ID)).orderBy(quizQuestions.ord);
    expect(after[0].id).toBe(before[1].id);                 // reordered
    expect(after[1].id).toBe(before[0].id);
    expect(new Set(after.map((r) => r.id))).toEqual(new Set(before.map((r) => r.id)));  // ids preserved
    expect(after.every((r) => r.ord >= 0)).toBe(true);      // no rows left parked negative

    // restore the original order
    await writer.upsertQuiz(ID, before.map((r) => ({
      id: r.id, q: r.q, options: r.options as string[], answer: r.answer, explanation: r.explanation,
    })));
  });
});
```

- [ ] **Step 2: Run, then verify the database is exactly as it started**

```bash
pnpm exec vitest run tests/integration
node --env-file=.env.local -e "
const {neon}=require('@neondatabase/serverless');const sql=neon(process.env.DATABASE_URL);
(async()=>{console.log(await sql\`select count(*)::int lessons,(select count(*)::int from quiz_questions) questions,(select count(body_draft)::int from lessons) drafts from lessons\`);})()"
```

Expected: `lessons: 82, questions: 564, drafts: 0`.

- [ ] **Step 3: Commit**

```bash
git add tests/integration/ vitest.config.ts
git commit -m "test: add real-DB integration cover for drafts and quiz upserts"
```

---

### Task 17: E2E — draft invisibility, P-A both ways, promote-and-publish

**Files:**
- Create: `tests/e2e/draft.spec.ts`, `tests/e2e/draft.authenticated.spec.ts`
- Modify: `tests/e2e/helpers/catalog.ts` (add a draft-planting helper)

> **Do not** add a per-project `testDir` — the config relies on a single top-level `testDir: "./tests/e2e"`. A spec needing a signed-in member must be named `*.authenticated.spec.ts`.

- [ ] **Step 1: Add the planting helper to `tests/e2e/helpers/catalog.ts`**

```ts
/** Plants a draft body out-of-band. The e2e account is a MEMBER, not an admin,
 *  so the draft cannot be created through the UI — and must not be. */
export async function plantDraft(lessonId: string, marker: string): Promise<() => Promise<void>> {
  const sql = neon(process.env.DATABASE_URL!);
  const blocks = JSON.stringify([{ t: "p", c: [{ t: "text", v: marker }] }]);
  await sql`update lessons set body_draft = ${blocks}::jsonb, source_ref_draft = 'notes/ict-core/INDEX.md' where id = ${lessonId}`;
  return async () => {
    await sql`update lessons set body_draft = null, source_ref_draft = null where id = ${lessonId}`;
  };
}
```

- [ ] **Step 2: Write the anonymous spec**

```ts
import { test, expect } from "@playwright/test";
import { plantDraft } from "./helpers/catalog";

// A FREE, PUBLISHED lesson on purpose: on a gated lesson this would pass for
// the wrong reason (the whole page is hidden anyway).
const FREE = "m1-01";
const MARKER = "DRAFT-MARKER-MUST-NEVER-BE-SERVED";

test("a pending draft's prose never reaches an anonymous reader of a FREE lesson", async ({ request }) => {
  const cleanup = await plantDraft(FREE, MARKER);
  try {
    const res = await request.get(`/lesson/${FREE}`);
    expect(res.status()).toBe(200);            // the lesson still renders
    expect(await res.text()).not.toContain(MARKER);   // invariant 6
  } finally {
    await cleanup();
  }
});

test("a draft lesson's quiz is indistinguishable from a nonexistent one", async ({ request }) => {
  const res = await request.get("/api/quiz/definitely-not-a-lesson");
  expect(res.status()).toBe(404);
});
```

- [ ] **Step 3: Write the member spec**

```ts
import { test, expect } from "@playwright/test";
import { plantDraft } from "./helpers/catalog";

const FREE = "m1-01";
const MARKER = "DRAFT-MARKER-MUST-NEVER-BE-SERVED";

test("a pending draft is invisible to a signed-in member too", async ({ page }) => {
  const cleanup = await plantDraft(FREE, MARKER);
  try {
    await page.goto(`/lesson/${FREE}`);
    await expect(page.locator("h2").first()).toBeVisible();
    expect(await page.content()).not.toContain(MARKER);
  } finally {
    await cleanup();
  }
});
```

- [ ] **Step 4: Run the full suite**

```bash
rm -rf .next && pnpm build && pnpm test:e2e
```

Expected: 27 pre-existing + the new tests, **zero skipped**.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/
git commit -m "test: prove a pending draft is invisible to anonymous and member readers"
```

---

### Task 18: Mutation-test the four load-bearing guards

**Files:** none committed — this task changes code temporarily and restores it.

> A mutation that causes a **TypeScript error** proves nothing: the build fails and the test never runs. Use `if (cond && Boolean(process.env.NEVER_SET_XYZ))`. After each: confirm the mutation applied (grep the changed line), confirm `pnpm build` still exits 0, run the test, then restore from backup and confirm `git status` is clean.

- [ ] **Step 1: M1 — make the public read path select the draft**

In `lib/content/queries.ts` (frozen — restore exactly), change `getLessonBody`'s select to `body: lessons.bodyDraft`.
Expected: `tests/e2e/draft.spec.ts` **FAILS** on the marker assertion. Restore.

- [ ] **Step 2: M2 — make the importer ignore its guards**

In `lib/content/import-guard.ts`, add `if (!Boolean(process.env.NEVER_SET_XYZ)) return { write: true };` at the top of `importDecision`.
Expected: `tests/unit/importer-guards.test.ts` **FAILS** on the cms and pending-draft cases. Restore.

- [ ] **Step 3: M3 — make `upsertQuiz` delete and reinsert wholesale**

In `write.ts`, replace the id-preserving upsert with an unconditional insert (drop `q.id`).
Expected: the integration reorder/preservation test **FAILS** on the id-set assertion. Restore.

- [ ] **Step 4: M4 — drop the admin exception from the P-A guard**

In `app/api/quiz/[id]/route.ts`, change the condition to `if (meta.status !== "published")`.
Expected: the admin-can-still-review direction **FAILS**. Restore.

- [ ] **Step 5: Record the results in the ledger**

Write each mutation, the test that failed, and the file:line into the SDD progress ledger. **If any mutation does NOT kill its test, that test is decorative — fix the test before proceeding.**

---

### Task 19: Final gate

- [ ] **Step 1: Full verification from cold**

```bash
git ls-remote --heads origin                    # expect ONLY main at 44eaf93
netstat -ano | grep :3000                       # kill any stale server first
pnpm lint && pnpm test:unit && pnpm exec vitest run tests/integration
rm -rf .next && pnpm build
pnpm test:e2e
```

Expected: lint clean · unit green · integration green · build exit 0 · e2e all passing, **zero skipped**.

- [ ] **Step 2: Read `next start`'s stderr, not just the status codes**

A green HTTP status is not proof — project #1 shipped a `ReferenceError` that only appeared in an authenticated render's server log.

```bash
pnpm start > /tmp/next.log 2>&1 &
sleep 12 && pnpm test:e2e
grep -c "⨯\|ReferenceError\|Error:" /tmp/next.log      # expect 0
```

- [ ] **Step 3: Confirm the read-only constraint held**

```bash
git diff main..HEAD -- .github/workflows/ci.yml build.py verify.py index.html engine/ content/ images/
```

Expected: **empty**.

- [ ] **Step 4: Confirm the database is unchanged in shape**

Expected: 82 lessons · 564 questions · 1017 media · 0 pending drafts · 5 migrations.

- [ ] **Step 5: Confirm invariant 10 one last time**

```bash
printf '%s\n%s\n' \
 '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"s","version":"0"}}}' \
 '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | pnpm mcp 2>&1 | grep -c "set_status\|set_access\|promote_draft"
```

Expected: **0**. The agent cannot publish.

- [ ] **Step 6: The end-to-end walkthrough (needs the human)**

Ask the agent to draft a change to one lesson from a real transcript. Read the draft with `get_lesson`. Promote it with `pnpm content:promote promote <id>`. Confirm it is live. This is success criterion 1, and only a human can sign it off.

---

## Self-Review

**Spec coverage:** §4.1 units → Tasks 2,3,7,8,9,12. §4.2 plain-Node constraint → Task 9 (with the startup smoke check). §4.3 schema → Task 1. §4.4 drafted-vs-live + promote/publish two-step → Tasks 3,4,12,17. §4.5 six tools + create_lesson details + ord settle → Tasks 5,6,10,11. §4.6 read path + uniform purge → Tasks 3,7. §4.7 text-only creation → Task 6. §4.8 P-A admin-aware → Task 15. §4.9 additive importer → Task 14. §5 testing → Tasks 16,17,18. §6 provenance → Task 2 (`assertSourceRef`), Task 13 (docs). §7 invariants 6-10 → Tasks 1,3,11,14,18. No gaps.

**Placeholders:** none — every code step carries real code. Task 18 deliberately commits nothing.

**Type consistency:** `createWriter`/`tagsFor`/`AnyDb` (Task 3) are consumed unchanged by Tasks 4,5,6,8,9,12,16. `createAdminQueries` (Task 7) by Tasks 10,16. `importDecision` (Task 14) by Task 18. `plantDraft` (Task 17) is used by both e2e specs. `assertQuiz`/`assertMeta`/`assertSourceRef` (Task 2) by Tasks 3,5,6.
