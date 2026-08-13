# Project #2a — the content write path and the agent's hands

**Date:** 2026-08-13
**Status:** design, revised after adversarial spec review; awaiting re-review
**Base:** branch `nextjs-neon-cms` @ `5bd7a92` (project #1 complete, reviewed clean, unmerged)
**Follows:** [2026-08-10-content-in-postgres-gated-design.md](2026-08-10-content-in-postgres-gated-design.md)

---

## 1. Goal

Make the course content **editable and addable by a local AI agent and by a human**, without
either one bypassing validation, the access gate, or the cache-purge rules that project #1
established.

Project #1 put content in Postgres and gated it. It shipped three admin-gated write functions
(`saveLessonBody`, `setLessonAccess`, `publishLesson`) as *seams* for a future CMS, and no UI.
This project turns those seams into a complete, validated write path and gives an agent a typed
way to drive the part of it an agent should be allowed to drive.

### What this project is not

- **The `/admin` console UI.** Sub-project 2b. This project ships no pages.
- **A prose block editor.** Sub-project 2d, which carries the Tiptap-vs-zero-dependency decision.
  The project #1 spec's premise that "Tiptap is already a dependency for notes" is **dead** —
  decision D7 removed it. Runtime dependencies today are exactly `@aws-sdk/client-s3`,
  `@aws-sdk/s3-request-presigner`, `@neondatabase/auth`, `@neondatabase/serverless`,
  `drizzle-orm`, `next`, `react`, `react-dom`. This project adds **one**: `@modelcontextprotocol/sdk`
  (a `dependency`, not a devDependency — `mcp/server.ts` is a runtime entrypoint).
- **Quiz/exam editing UI.** Sub-project 2c. The quiz *write path* is in scope; the screens are not.
- **Chart/media upload.** New lessons are created text-only (§4.7).
- **Billing.** Project #3, unchanged.

### Success criteria

1. From a transcript, an agent creates a draft lesson and writes its body and quiz; a human then
   **promotes the draft and publishes the lesson** (two distinct steps — §4.4) — with **no SQL and
   no hand-edited files**.
2. A draft's prose is **provably unreachable** by any non-admin, on a free lesson as much as a
   gated one.
3. `pnpm content:import` is **safe to run after CMS edits** — it cannot silently erase them or
   strand a draft against a body that moved underneath it.
4. The agent **cannot publish**. Every path from "written" to "readable" passes through a human.

---

## 2. The overriding constraints

Project #1's constraint still governs, verbatim:

> Nobody without access can see the content.

This project adds a second:

> **Unreviewed prose is not cleared for anyone.** A draft body is admin-only regardless of the
> lesson's `access` value.

And CLAUDE.md §1 remains the rule that overrides everything:

> Course content must come *purely* from the provided source material — ICT's mentorship notes
> and the video transcripts.

An agent that authors lessons is the largest §1 risk this project has taken on. **The real control
is the human promote gate** (§4.4) — see §6, which is deliberately honest that `source_ref` alone
is weak. The gate only works if the agent cannot route around it, which is why publishing tools
are **absent from the MCP surface** (§4.5).

---

## 3. Decisions and their rationale

| Decision | Rationale |
|---|---|
| Body edits land in a **`body_draft` column** | Makes "review before publish" structural, not a habit. A bad AI edit cannot reach a reader at all. |
| A draft body is **admin-only unconditionally** | Unreviewed prose is not cleared for anyone. Enforced by construction: the public read path never *selects* the column. |
| The agent drives an **in-repo MCP server** over **stdio** | Typed tools beat composing shell arguments. Stdio only — an HTTP transport would recreate the public write surface we refused. |
| **The MCP surface excludes `promote`, `set_access` and `set_status`** | The agent reads transcripts and notes — text it did not author — so a prompt injection or a plain model error must not be able to publish. Publishing is a human action via two CLIs: the new `scripts/promote-draft.mjs` and the new `scripts/set-status.mjs` (§4.1). **Note `scripts/set-access.mjs` cannot serve this** — it writes only the `access` column (`set-access.mjs:57`), never `status`; the only existing status writer is `publishLesson` (`mutations.ts:48`), a Server Action needing a signed-in browser session that 2a does not ship. |
| Write rules live in **one plain module** (`lib/content/write.ts`) taking an **injected `db` and `revalidate`** | The MCP server is a standalone Node process: it can call neither `revalidateTag` nor `lib/db` (§4.2). Injection gives one rule set with two hosts instead of two drifting copies. |
| The MCP server's authority is **possession of `.env.local`** | Same trust model as the existing `scripts/*.mjs`. It is not a logged-in user, so `isAdmin` is not the mechanism. Written down rather than implied. |
| **`source_ref` is required** on any body write, and **must resolve to a real file** under `transcripts/` or `notes/` | Converts "checkable in principle" into "checked". ~5 lines in a Node process that has `fs`. |
| `slug` is **not writable**; `create_lesson` **derives** it | It is the chart filename stem the media manifest keys on, and it carries a unique index. |
| The importer becomes **per-lesson, additive and draft-aware**; `import.ts` + `import-content.mjs` are **unfrozen** | The project #1 spec flagged this as mandatory once the CMS exists. Explicitly approved by the user. |
| Approach A over B/C for the write core | B (MCP proxies HTTP to the app) means you cannot author without a running server and adds an authenticated write surface. C (duplicate the logic) drifts — the moment a rule changes in one place, the other silently accepts what the app rejects. |

---

## 4. Design

### 4.1 Units and boundaries

| Unit | Does | Depends on |
|---|---|---|
| `lib/content/write.ts` | `createWriter({ db, revalidate })` → validated writes for meta, body, quiz, creation, promote/discard | `blocks.ts`, `write-validate.ts`, `lib/db/schema.ts`. **No `lib/db`, no `next/*`.** |
| `lib/content/write-validate.ts` | `assertQuiz`, `assertMeta` — validators mirroring `assertBlocks`'s path-reporting | nothing |
| `lib/content/admin-queries.ts` *(new)* | `getLessonDraftBody`, `listLessonsAdmin` (`hasDraft`, `writeOrigin`, `sourceRef`) | `lib/db/schema.ts`, injected `db`. Zero-`next`. |
| `lib/content/mutations.ts` *(exists, refactored)* | Server-action face: `isAdmin` gate + `revalidateTag` + `lib/db` → `write.ts` | `next/cache`, `access-queries` |
| `mcp/server.ts` | MCP tool face: own `drizzle(neon(...))` + HTTP purger → `write.ts` | MCP SDK, `write.ts`, `admin-queries.ts` |
| `scripts/promote-draft.mjs` *(new)* | The **human's** promote/discard CLI, modelled on `set-access.mjs` | `write.ts` |
| `scripts/set-status.mjs` *(new)* | The **human's** publish/unpublish CLI. Required, not optional: `set-access.mjs` writes only `access` (`:57`), and the sole existing status writer is a Server Action needing a browser session. Without this, success criterion 1 is unreachable in 2a. | `write.ts` |
| `lib/content/import.ts`, `scripts/import-content.mjs` *(unfrozen)* | Gain `--only`, the `write_origin` guard and draft-awareness | unchanged otherwise |

`queries.ts` stays **frozen** — the new admin reads live in `admin-queries.ts`, not in it.

### 4.2 The plain-Node constraint — the thing that makes this design non-obvious

`lib/db/index.ts:1` is `import "server-only"`, and **`server-only` is not an installed package**:
Next aliases it at build time and `vitest.config.ts:21` aliases it to `tests/unit/stubs/server-only.ts`.
A plain Node process that reaches `lib/db` therefore dies with `ERR_MODULE_NOT_FOUND`.

This is the same failure class as the `"use server"` trap that already cost this project a
session: invisible to eslint, to `tsc`, to `pnpm build` and to the unit suite (which is aliased),
and it detonates only when the MCP server actually starts.

So `write.ts` **must not import `lib/db`**. It takes a Drizzle handle. The existing scripts already
prove the pattern — `scripts/import-content.mjs:49` and `scripts/set-access.mjs:54` each construct
their own `drizzle(neon(process.env.DATABASE_URL))`.

**The MCP entrypoint's launch contract**, all three parts required:

- `--experimental-strip-types` — the entry and its imports are `.ts`.
- `--env-file=.env.local` — `DATABASE_URL` and `REVALIDATE_SECRET`.
- The **extensionless-import shim**: `lib/content/*` use extensionless relative imports that Node's
  resolver rejects; `scripts/import-content.mjs:8-17` handles this with `registerHooks`. Reuse it.

**A dedicated task must assert that `node mcp/server.ts` starts and lists its tools.** Nothing else
in the suite can catch this.

### 4.3 Schema — migration `0004`, four columns on `lessons`

```
body_draft       jsonb                          -- nullable; NULL means "no draft pending"
source_ref       text                           -- provenance of the LIVE body
source_ref_draft text                           -- provenance of the DRAFT body
write_origin     text NOT NULL DEFAULT 'import' -- 'import' | 'cms'
```

`source_ref` is **paired with the body it describes**. A draft write sets `source_ref_draft`;
`promote_draft` moves body *and* ref together; `discard_draft` clears both draft columns. Without
the pairing, discarding a draft leaves a `source_ref` describing prose that was never published —
which is exactly the auditability this design claims to provide.

All four are nullable-or-defaulted so the 82 existing rows need no backfill, and `write_origin`
defaults to `'import'` so they classify correctly.

Generated via `pnpm db:generate` only — never hand-written. Read the generated SQL before applying
and confirm it is replayable: drizzle-kit emits statements alphabetically by table, which in
project #1 once put a constraint before its dependency and failed mid-apply. `drizzle-kit check`
must report "Everything's fine".

### 4.4 What is drafted, what is live, and who may do it

Only the **body** is drafted.

| Write | Lands | Who | Why |
|---|---|---|---|
| `write_lesson_body` | `body_draft` + `source_ref_draft` | agent or human | The prose — the §1 risk and the bulk of any edit. |
| `write_lesson_meta` | **live** | agent or human | `title`, `heading`, `crumb`, `desc` are **already public** through the catalog and sidebar even on a gated lesson. Drafting them protects nothing. |
| `upsert_quiz` | **live**, but **refused while `body_draft IS NOT NULL`** | agent or human | Quizzes sit behind `canRead`. But explanations are source-derived prose, so §6 names them an unreviewed §1 surface rather than pretending the draft gate covers them. The refusal stops the worst case: a live quiz referencing prose that exists only in an unpromoted draft. |
| `promote_draft` / `discard_draft` | live | **human only** | The gate. |
| `set_access` / `set_status` | live | **human only** | Visibility. |

**Promote and publish are orthogonal and both are required for a new lesson.** `create_lesson`
starts `status='draft'`, and `getCatalog` filters to published (`queries.ts:75`). So success
criterion 1's "a human promotes it" is genuinely two commands — `scripts/promote-draft.mjs` then
`scripts/set-status.mjs published` — and **both scripts are deliverables of this project** (§4.1).
The e2e "promote makes it visible" test must exercise both steps, or it will assert visibility on
a lesson that was never published and pass for the wrong reason.

`promote_draft` is a single statement:

```sql
UPDATE lessons SET body = body_draft, source_ref = source_ref_draft,
       body_draft = NULL, source_ref_draft = NULL, write_origin = 'cms', updated_at = now()
WHERE id = $1 AND body_draft IS NOT NULL
RETURNING id
```

`RETURNING id` so "there was no draft" is reported rather than silently succeeding. The `UPDATE`
is atomic; the **cache purge is a separate round trip**, and §4.6's preflight narrows but cannot
close that window — `set-access.mjs:60-64` says as much in its own comment.

### 4.5 The MCP tool surface — six tools

Reads first: an agent that cannot orient itself writes badly.

| Tool | Contract | Guard |
|---|---|---|
| `list_lessons` | `{sectionId?}` → `id, title, access, status, hasDraft, writeOrigin, sourceRef` | — |
| `get_lesson` | `{id}` → meta + `body` + `bodyDraft` + both refs | — |
| `write_lesson_body` | `{id, blocks, sourceRef}` → `body_draft` | refuses without `sourceRef`; **refuses unless `sourceRef` resolves to an existing file under `transcripts/` or `notes/`**; `assertBlocks` rejects bad shape with its path (`block[3]/run[1]`) |
| `write_lesson_meta` | `{id, title?, heading?, crumb?, desc?, videoUrl?}` | `slug` not writable; `desc` is `Inline[]`, not a string |
| `upsert_quiz` | `{id, questions[], deleteMissing?}` | refuses while a draft is pending; matches on `question_id` when supplied, else appends; `deleteMissing` defaults **false** and reports the `quiz_results` cascade count first; ord settling is atomic — see below |
| `create_lesson` | `{id, sectionId, monthId, ord, title, heading, crumb, desc, kind, access?}` | see below |

**Deliberately absent: `promote_draft`, `discard_draft`, `set_access`, `set_status`.** The agent
can write and revise; only a human can publish. This is the design's single most important
property — without it the draft gate is advisory, since an agent processing untrusted transcript
text could be induced to promote its own work.

**`create_lesson` details** (the schema is stricter than it looks):
- `slug` is **derived**, not passed: `m{month}-{NN}-{kebab-title}`, reusing `import.ts`'s existing
  `kebab()`. `lessons_slug_uq` (`schema.ts:92`) is unique and `NOT NULL`, so a collision must fail
  with a clear message naming the colliding lesson, never a raw Postgres error.
- `access` is optional and **defaults to `'members'`** — omitting it or passing an unrecognised
  value must never open a lesson (invariant 3). D1 makes access a pure function of section
  (s1 `free`, s2 `members`), so a new s1 lesson needs `access: "free"` explicitly.
- `desc` is `Inline[]`.
- `(month_id, section_id)` is a **composite FK** (`schema.ts:96-100`), so the tool prechecks that
  the month belongs to the section and reports it, rather than surfacing a constraint violation.

**`upsert_quiz`'s ord settling — `db.batch`, decided, not deferred.** `quiz_questions_lesson_ord_uq`
(`schema.ts:120`) is unique on `(lesson_id, ord)`, so any reorder collides mid-sequence: swapping
ords 2 and 3 transiently puts two rows at the same ord. neon-http has no *interactive*
transactions, but **`db.batch([...])` is available on this driver and executes its statements in a
single transaction** — verified empirically against the installed `drizzle-orm/neon-http`
(`typeof db.batch === "function"`). So the settle is one batch:

1. `UPDATE quiz_questions SET ord = -ord - 1 WHERE lesson_id = $1` — parks every existing row in
   negative space, which is disjoint from every final ord, so no collision is possible.
2. one `INSERT … ON CONFLICT (id) DO UPDATE` per question, assigning final ords.
3. if `deleteMissing`, delete whatever still holds a negative ord.

Because the batch is atomic, a crash cannot leave rows parked at negative ords — which is what
made the naive three-round-trip version unsafe, since "recoverable by re-running" fails when the
re-run re-collides against a half-settled state.

**A deliberate asymmetry, documented so nobody "fixes" it:** `write_lesson_body` takes `blocks` as
a real array, while the server action keeps taking a `JSON.stringify`'d **string**. Invariant 5
exists because *React Flight* silently drops a node's `attrs`; MCP is JSON-RPC and has no such
flaw. Making them match would mean a pointless string hop or a genuine data-loss bug.

### 4.6 Revalidation, and the read path

`getLessonBody()` continues to select `body` and **only** `body`; it never learns `body_draft`
exists. Verified: **no query anywhere does an unprojected select on `lessons`** — the three bare
`db.select()` calls are on `sections`, `months` and `userRoles`, and `db.query.lessons.*` is
unused. That is invariant 6 by construction.

**Every write purges all three tags** (`lesson:{id}`, `lesson-meta:{id}`, `catalog`) in the same
function as the write. Not because the tag sets are subtle, but because project #1's final review
ruled explicitly that `getLessonMeta`'s dual tagging "is an implementation detail of
`lib/content/queries.ts`, **not a contract**" — and fixed `set-access.mjs` in commit `5bd7a92` to
stop relying on it. Uniform purging honours that ruling. Over-purging costs one cold read;
under-purging serves stale gated content.

Out-of-process writers purge over HTTP, and **preflight `/api/revalidate` before the write**
(`set-access.mjs:37-52`, before its db client at `:54`) so a missing secret or unreachable endpoint
cannot leave a readable stale copy. `/api/revalidate` is unchanged: `timingSafeEqual` with a length
pre-check, 404 on every failure path including an unset server secret.

### 4.7 New lessons are text-only

`create_lesson` writes a row with `status='draft'` and no media. A `figures` block is only a slug
reference, so a lesson authored from a transcript is prose-and-quiz complete without charts. Charts
remain a manual `scripts/upload-media.mjs` run (frozen, manifest-driven). Agent-driven upload is
deferred: it would put R2 write credentials in the MCP server's blast radius and pull `sharp` out
of devDependencies.

### 4.8 Folded-in: P-A, the draft disclosure — **admin-aware**

`/api/quiz/[id]` and `/api/exam/[id]` return **401** for gated and **404** for unknown. `canRead`
returns `ctx.isAdmin` for a non-published lesson (`lib/access.ts:34`), so today a draft answers
401 to a stranger — confirming it exists. Dormant now (0 non-published rows); this project's whole
purpose is creating drafts.

**Fix:** return 404 when `status !== 'published'` **and** `!ctx.isAdmin`. The admin exception is
not optional — `/api/quiz/[id]` is the only way a quiz reaches a page, so an unconditional 404
would make it impossible to review a draft lesson's quiz before publishing, breaking the human
gate this project depends on.

The new test must assert **both** directions — anonymous → 404, admin → 200 with questions — or it
is the vacuous-test class §5 warns about. Existing tests pinning 401-for-gated
(`quiz.spec.ts:6,22`, `exam.spec.ts:4,13`) must keep passing **unchanged**.

### 4.9 Folded-in: the additive, draft-aware importer

Three changes to the now-unfrozen importer:

1. `--only <lessonId>` — import one lesson instead of the whole tree.
2. **Refuse to overwrite `body` when `write_origin='cms'`** unless `--force`.
3. **Refuse when `body_draft IS NOT NULL`, regardless of origin.** Otherwise an import replaces the
   live body underneath a pending draft, leaving a draft and a `source_ref_draft` describing prose
   that no longer relates to what is live.

**`write_origin` transitions on body writes only** — `write_lesson_body` and `promote_draft` set
`'cms'`; meta, access and status writes do **not**. Both other readings are broken: if only promote
sets it, un-promoted rows are unprotected; if any write sets it, one title tweak kills the importer
for that lesson forever.

The importer's `onConflictDoUpdate` `set` list must be extended so it **never touches**
`body_draft`, `source_ref`, `source_ref_draft` or `write_origin`. It already excludes `access`
(proven empirically in project #1's Task 11) and, after R9, `published_at`.

---

## 5. Testing

### Unit (Vitest, no DB)

- `write.ts` driven with a **fake `db` and a fake revalidator that records tag sets**, so each
  operation's purge list is asserted exactly rather than inferred. This is the shape that would
  have caught project #1's P3 `revalidateTag` arity break, which survived three implementer rounds
  because only the controller ever ran a build.
- `assertQuiz` / `assertMeta` path-reporting, mirroring the existing `assertBlocks` tests.
- The `sourceRef` refusals — absent, and present-but-nonexistent-path.
- The importer's `write_origin` **and** `body_draft` guards as pure predicates.
- `create_lesson`'s slug derivation and collision message.

### Integration (real DB)

- `promote_draft` moves body **and ref** together, purges, and reports "no draft" via `RETURNING`.
- **`upsert_quiz` preserves `question_id` across a reword** — the property protecting real user
  answers under invariant 4 — **and survives a reorder**, exercising the `db.batch` ord settle of
  §4.5 against the real `quiz_questions_lesson_ord_uq` index. The reorder case is the one that
  fails without the batch, so it must be tested explicitly, not assumed from the reword case.
- **Draft presence** — that `getLessonDraftBody()` returns the planted draft. This is an
  integration test, not e2e, because the single e2e account is deliberately a *member with an
  entitlement, not an admin* (`gating.authenticated.spec.ts:8-9`), and adding an admin
  storageState/project is 2b's problem.

### E2E (Playwright)

- **Draft invisibility — the headline test.** Plant draft prose on a *published, **free*** lesson
  out-of-band with raw `neon()` SQL (the `tests/e2e/helpers/catalog.ts` `gatedMediaId()` pattern),
  then assert that prose appears in no anonymous response and no member response. A free lesson is
  used deliberately: on a gated lesson the test would pass for the wrong reason.
- P-A both directions: anonymous → 404, admin → 200.
- Promote **and publish** makes it visible — so both directions bite.

A spec needing a signed-in member must be named `*.authenticated.spec.ts`. Do not add a per-project
`testDir`; the config relies on a single top-level `testDir: "./tests/e2e"`.

### Mutation tests — all must kill, all logic breaks that still compile

| Mutation | Test that must fail |
|---|---|
| `getLessonBody` selects `body_draft` | draft invisibility |
| the importer ignores `write_origin` / `body_draft` | the cms-guard tests |
| `upsert_quiz` deletes and reinserts wholesale | `question_id` preservation |
| the P-A 404 drops its `!ctx.isAdmin` condition | the admin → 200 direction |

A mutation causing a TypeScript error proves nothing. Use `if (cond && Boolean(process.env.NEVER_SET_XYZ))`,
confirm it applied (grep the line) and that the build still exits 0.

---

## 6. CLAUDE.md §1 — what actually enforces it

Stated plainly, because overclaiming here would be worse than underclaiming:

**`source_ref` is a weak control.** It is `text`. An agent can write a path to a real transcript
that does not support the paragraph it wrote, and nothing detects that. Requiring the path to
**resolve to an existing file** under `transcripts/` or `notes/` (§4.5) raises the floor from
"unchecked string" to "checked pointer" for about five lines — worth taking, but it verifies
existence, not support.

**The human promote gate is the real control**, and it works only because:
- the agent cannot promote, publish or change access (§4.5);
- `get_lesson` returns `body` and `bodyDraft` together, so a diff is one call;
- `list_lessons` surfaces `hasDraft` and `sourceRef`, so "what is waiting for me, and from where"
  is one query.

**One §1 surface is not behind the gate: quiz explanations**, which are source-derived prose
written live (§4.4). The refusal-while-a-draft-is-pending narrows the damage but does not remove
it. This is a known, accepted gap; closing it means a second draft column for quizzes, which is
2c's call, not this project's.

---

## 7. Invariants

Project #1's five, unchanged and still binding:

1. `getLessonBody()`/`getLessonMedia()` are called **inside** the `canRead` branch, never above it.
2. Any write that changes `lessons.access` revalidates `lesson:{id}`, `lesson-meta:{id}` and
   `catalog` in the **same function** as the write.
   **2′ (this project, broader):** *every* write purges all three, for the reason in §4.6.
3. `lessons.access` defaults to `'members'`. Fail closed.
4. `quiz_results` keys on `question_id` (uuid), never an index. No lesson column — "this lesson's
   answers" is a subquery over `quiz_questions`.
5. Block/notes/progress/exam JSON crosses any **client→server** boundary as a `JSON.stringify`'d
   string.

Five new:

6. `body_draft` is admin-only **unconditionally** — the public read path never selects the column.
7. Every body write records a `source_ref` that **resolves to a real file** under `transcripts/`
   or `notes/`, and the ref travels with the body it describes through promote and discard.
8. A quiz upsert preserves `question_id` for surviving questions; deletion is opt-in and reports
   its cascade first.
9. The importer never overwrites a `write_origin='cms'` row without `--force`, and **never**
   overwrites a row with a pending `body_draft`.
10. **The agent cannot publish.** `promote`, `set_access` and `set_status` are absent from the MCP
    surface; every path from written to readable passes through a human.

`canRead` remains the single choke point; **404, never 403**, for anything gated — with the admin
exception of §4.8. No reset ever clears `ict-notes` (CLAUDE.md §3).

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| **`server-only` breaks the MCP server at runtime** | §4.2. `write.ts` takes an injected `db`. A dedicated task asserts `node mcp/server.ts` starts — no other gate can catch it. |
| The `"use server"` trap | Refactoring `mutations.ts` must leave it exporting **only async functions**. Invisible to lint, `tsc` and build; detonates only on an authenticated render. Check with `grep "^export"`. |
| neon-http has **no interactive transactions** | `promote_draft` is a single `UPDATE`; `upsert_quiz` uses **`db.batch`**, which is atomic on this driver (§4.5). Never paper over the absence with separate `begin`/`rollback` calls: they are three sessions, the begin and rollback are no-ops, and **the write commits**. That corrupted a row once. |
| A prompt-injected agent publishes unreviewed content | Invariant 10 — publishing tools are not on the MCP surface. |
| A test passes vacuously | Every fixture a test names must still hold the property its name claims. Project #1 shipped two such tests; the final review caught the second. Check presence/absence in **both** directions. |
| Stale build artifacts | `rm -rf .next` before any build you intend to trust — clearing only `.next/cache` leaves `next dev`'s generated `.next/dev/types/validator.ts`, which fails the type check with a bogus `AppRouteHandlerRoutes` error. Kill any stale `pnpm start` on :3000 first. |
| `.mcp.json` is untracked, so tool registration is invisible to review | It holds no secrets (env comes from `.env.local`). Commit it, or document the exact registration in `docs/`. |

---

## 9. Scope

Roughly **18–22 tasks across 4 phases**: schema + write core → MCP face + human CLIs → importer +
P-A → tests and gate. Project #1's 25 tasks / 5 phases is the ceiling to stay under.

Nothing here belongs in 2b/2c/2d. Three things were pulled *in* because 2a cannot work without
them: the db-injection seam (§4.2), `admin-queries.ts` (§4.1), and `scripts/set-status.mjs` (§4.1 —
without it there is no way to publish at all, since the only existing status writer needs a
browser session this project does not ship). One thing must **not** be pulled in: the "admin can
preview a draft" requirement must not drag a page into 2a — §4.8's admin-aware 404 plus an
integration test covers it.

---

## 10. Constraints inherited from project #1

**Read-only, unchanged:** `content/`, `images/`, `engine/`, `build.py`, `verify.py`, `index.html`,
`.github/workflows/ci.yml` (D6 — it stays as a source-tree lint). `transcripts/` and `notes/` are
never written (this project **reads** them, to verify `source_ref`).

**Frozen:** `lib/content/{blocks,parse-html,parse-meta,export-html,canonical,import-media,queries}.ts`,
`lib/media.ts`, `lib/access.ts`, `scripts/upload-media.mjs`. `queries.ts` may be read but its six
query functions, their SQL and their cache tags must not change.

**Unfrozen by this project, deliberately:** `lib/content/import.ts` and `scripts/import-content.mjs`
(§4.9). `lib/content/mutations.ts` was never frozen.

`lib/db/schema.ts` and `drizzle/` change **only** via a generated migration.

**Do not delete anything from the R2 bucket** — those 1017 objects took real time.

Secrets from `process.env` only; never printed, never committed. Never print a user's email.

**Git:** local commits on this branch are authorised. **Never push, PR or force-push** — the branch
has no upstream and must keep none. Verify with `git ls-remote --heads origin` (expect only `main`
at `44eaf93`) rather than assuming.

---

## 11. Open items carried from project #1 (not this project's work)

- **11 GitHub repo secrets** are unset, so `nextjs-ci.yml`'s e2e job cannot pass. Nothing in CI has
  ever executed.
- **The authenticated walkthrough** the project #1 P4 gate asked for.
- **The home `#reset-panel`** parity gap — sub-project 2b.
- **P-B:** `lib/db/schema.ts:161`'s `lessonsRelations.month` is a single-column relation decoupled
  from the composite FK. Inert (nothing uses Drizzle's relational query builder) but a trap for
  whoever first calls `db.query.lessons.findMany({with:{month:true}})`.
