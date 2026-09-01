# Project #2b — the admin console

**Date:** 2026-08-31
**Status:** design, awaiting user review
**Base:** branch `nextjs-neon-cms` (unmerged, no upstream, and it must keep none)
**Follows:** [2026-08-13-cms-write-path-design.md](2026-08-13-cms-write-path-design.md), which
remains the **binding authority** for the write path. Where this document and that one disagree,
that one wins.

---

## 1. Goal

Give the single human admin a web UI for **reviewing drafts and publishing content**.

Project #2a built the write path: an agent can draft, and a human promotes via
`pnpm content:promote`. That CLI takes a lesson id and moves `body_draft` into `body`. It shows the
human nothing. So today the human gate — the control that §6 of the 2a spec names as *the real
enforcement of CLAUDE.md §1* — approves prose that nobody has seen rendered. It is a rubber stamp.

This project makes the review real: the pending draft rendered **side by side with the live body,
with the changed blocks marked**, and the four actions on the same page.

Three of the four — set status, set access, and promote — are cheap and reversible. **Discard is
not**: it drops `body_draft` and `source_ref_draft`, and the draft prose is then gone. That is why
it is the one action behind a typed confirmation (§4.4), and it is the reason §7 lists it as a risk
in its own right.

### What this project is not

- **A prose editor.** No writing in the browser. Bodies still arrive from the importer or the MCP
  agent. (Sub-project 2d.)
- **Quiz or exam editing.** `upsertQuiz` with `deleteMissing` cascades real user answers through
  `quiz_results ON DELETE CASCADE` — the only genuinely destructive action in the writer. It is not
  going behind a button until there is a confirmation flow that names the exact number of answers
  about to be discarded. (Sub-project 2c.)
- **`createLesson`.** Rare, and it clutters the surface.
- **Media management.** Charts stay a manual `scripts/upload-media.mjs` run.
- **Any change to the MCP surface.** See §2.

### Success criteria

1. The admin opens `/admin`, sees every lesson with its status, access, pending-draft flag and
   `write_origin`, with drafted lessons first.
2. The admin opens a lesson, sees the pending draft rendered beside the live body **with charts**
   and with each added / removed / changed block marked, and promotes or discards it from that page.
3. An anonymous visitor and a signed-in **non-admin member** both get **404** on every admin route.
4. Every admin action is authorized by **human identity**, re-checked inside the action itself.
5. Nothing about invariant 10 changes: `promote_draft`, `discard_draft`, `set_access` and
   `set_status` remain absent from the MCP tool surface.

---

## 2. The security model

The 2a design's only real structural control is **invariant 10**: an AI agent can draft but can
never publish, because the four publishing tools are absent from the MCP surface.

**That control defends against the AI, not against an intruder.** The MCP server already runs on the
admin's own machine with the production `DATABASE_URL`. An admin web UI authenticated as that same
human, by human identity, therefore does not weaken it.

It stays intact only under these four rules, which this design treats as non-negotiable:

1. **Gate on human identity only** — the existing auth session plus the `ADMIN_EMAILS` allowlist,
   through `accessContext()`. **Never** on a bearer secret or a token in `.env.local`. The agent
   reads `.env.local` routinely; a secret there would silently hand it the exact capability
   invariant 10 removes, and no line of code would look wrong.
2. **No new MCP tools.** The absence *is* the control. `mcp/` is untouched by this project; the
   `tools/list` = 6 proof is re-run at the gate anyway, as a regression check.
3. **Authorize inside every mutation and every data read.** Not in a layout, not in middleware.
   Hidden UI is not authorization.
4. **404, never 403**, for anything an identity may not see — the project-wide rule from 2a §7,
   already how `app/lesson/[id]/page.tsx` treats a non-published lesson.

### Abuse resistance

`/admin` exposes nothing to guess at: a non-admin gets `notFound()`, sign-in brute force is Neon
Auth's problem, and every action re-checks identity independently. What is not handled in code is
the **cost of the requests themselves**, and it deliberately is not:

- **Rate limiting is a Vercel Firewall rule** on `/admin*`, configured once in the dashboard and
  documented as a deploy step in `docs/cms-authoring.md`. It blocks abuse at the edge, before the
  function or Neon is reached — the only layer that actually stops a flood. An in-memory limiter in
  the app was rejected: on Vercel each serverless instance has its own memory and instances scale
  out, so it throttles almost nothing under real abuse while looking like protection.
- `X-Robots-Tag: noindex, nofollow` on `/admin/:path*` via `next.config.ts`, plus
  `robots: { index: false }` page metadata.
- **No `robots.txt` entry.** A `Disallow: /admin` line advertises the path.
- The guard runs before any query, so an unauthenticated request costs one cookie read and no DB
  round trip for roles or entitlements (`accessContext()` already short-circuits on no user).

---

## 3. Decisions and their rationale

| Decision | Rationale |
|---|---|
| **Server Components + Server Actions**, no client-side data fetching | Authorization is colocated and unavoidable: a page cannot render without passing its own check and an action cannot run without passing its own. The alternative — API routes plus a client console — duplicates the gate and adds a second admin write surface next to the actions. |
| Route is **`/admin`**, plainly named | An obscure segment was considered and rejected as a control: the agent reads the repo, and an intruder without a session gets 404 at any path. Obscurity would have bought nothing and cost clarity. |
| Non-admins get **404**, not a redirect | Matches the codebase rule. A redirect to sign-in confirms the route exists to anyone who probes it. |
| The guard lives in **`lib/admin/guard.ts`**, not in `mutations.ts` | `mutations.ts` is `"use server"`: **anything exported from it becomes a callable action endpoint**. Its `requireAdmin` is deliberately un-exported and stays that way. |
| **One definition of the admin check** | `assertAdmin()` in `lib/admin/guard.ts`; `mutations.ts`'s private `requireAdmin` becomes a one-line delegation to it. Copy-pasting a security check is the wrong thing to duplicate, and a single definition means one mutation test kills tests across the whole surface. |
| `/admin/lesson/[id]` is a **lesson detail page**, not a draft-review page | set-status and set-access apply to every lesson, drafted or not. One page, one place actions live, one confirmation model. The diff appears only when a draft is pending. |
| The diff is **rendered vs rendered**, with **block-level change markers** | Rendered is the point: today's gate approves prose nobody has seen rendered. Markers are the difference between a review and squinting at two sixty-block columns. |
| The review page **resolves media** | `BlockRenderer` takes a `figures` prop. Without it every chart in a reviewed draft renders blank — in a project where charts are half the content. |
| The review page **validates both bodies** with `assertBlocks`, inside a `try/catch` | A malformed draft is then reported at review time with its block path (`block[3]/run[1]`), which is where you want to find it, not at publish time. The `try/catch` is load-bearing: an uncaught throw in a Server Component is a 500 error page, which tells the admin nothing. |
| **Promote carries a fingerprint** of the draft it rendered | Closes the stale-review race: the agent writing a new draft between page load and click would otherwise publish prose the human never saw — defeating the one control the whole write path rests on. |
| Actions return **`{ok, message}`**, they do not throw at the UI | `promoteLessonDraft` returns `false` for "no draft pending"; a no-op that looks like success is unacceptable at the publish gate, and a thrown error hitting an error boundary tells the admin nothing. |
| **`write.ts` is not modified** | It is load-bearing and heavily tested, and `discardDraft` already exists there complete (`write.ts:97`) — purging all three tags and `RETURNING`-guarding a missed row. Only its exposure through `mutations.ts` was missing. |
| An **audit table**, written by the action wrapper | Requested by the user. `write_origin` + `updated_at` record only that *a* CMS write happened, not who did what, and denied attempts are the part worth having given the abuse question. |
| `.inner` moves **out of the root layout into the pages** | `--content-max: 880px` makes a side-by-side two ~410px columns. A nested layout cannot widen an ancestor's `max-width`, and CSS custom properties inherit downward only. Route groups with a second root layout would work but move three route directories and create a second `<html>` — over-engineered. |

---

## 4. Design

### 4.1 Units and boundaries

| Unit | Does | Depends on |
|---|---|---|
| `lib/admin/guard.ts` *(new)* | `assertAdmin()` (throws `"admin only"`), `requireAdminPage()` (calls `notFound()`) | `accessContext`, `next/navigation`. The single definition of the check. |
| `lib/admin/block-diff.ts` *(new)* | `diffBlocks(live, draft)` → rows tagged `same` / `added` / `removed` / `changed` | **nothing.** Pure, no `next`, no DB. |
| `lib/admin/fingerprint.ts` *(new)* | `fingerprint(blocks)` → SHA-256 over canonical JSON | `node:crypto`. Pure. |
| `lib/admin/group-lessons.ts` *(new)* | `groupLessons(rows)` → pending-first, then section → month | nothing. Pure. |
| `app/admin/page.tsx` *(new)* | The list. `requireAdminPage()` → `listLessonsAdmin()` → `groupLessons()` | `admin-queries`, `lib/db` |
| `app/admin/lesson/[id]/page.tsx` *(new)* | The detail / review view | `admin-queries`, `getLessonMedia`, `BlockRenderer`, `block-diff` |
| `app/admin/actions.ts` *(new, `"use server"`)* | `{ok, message}` wrappers over the four mutations + the audit write | `guard`, `mutations`, `lib/db` |
| `components/admin/*` *(new)* | `ActionButton` (`useActionState`), `ConfirmButton` (typed confirmation, discard only), `DiffColumns` | client components, presentational |
| `lib/content/mutations.ts` *(modified, twice)* | adds `discardLessonDraft`; `requireAdmin` delegates to `assertAdmin()` | unchanged otherwise |
| `lib/db/schema.ts` + `drizzle/0005_*` *(modified via `pnpm db:generate`)* | the `admin_actions` table | — |
| `app/{page, lesson/[id]/page, auth/[path]/page}.tsx`, `app/layout.tsx` *(modified)* | `.inner` wrapper moves from the layout into each page | — |
| `next.config.ts` *(modified)* | the `X-Robots-Tag` header | — |

**Untouched, deliberately:** `lib/content/write.ts` · `lib/content/queries.ts` ·
`lib/content/admin-queries.ts` · `lib/access.ts` · `lib/db/access-queries.ts` · **`mcp/`** ·
`scripts/` · and everything read-only from 2a (`content/`, `images/`, `engine/`, `build.py`,
`verify.py`, `index.html`, `.github/workflows/ci.yml`, `transcripts/`, `notes/`). No new
dependencies.

### 4.2 The gate

```ts
// lib/admin/guard.ts  — NOT "use server". Nothing here is an action endpoint.
export async function assertAdmin(): Promise<void> {
  const ctx = await accessContext();
  if (!ctx.isAdmin) throw new Error("admin only");
}

export async function requireAdminPage() {
  const ctx = await accessContext();
  if (!ctx.isAdmin) notFound();      // anonymous AND signed-in member alike
  return ctx;
}
```

`requireAdminPage()` is the **first statement of each admin page body**, before any query.

**There is no `app/admin/layout.tsx` performing auth.** A layout gate would let someone later add a
page under `/admin` that inherits a check it never called — the "hidden UI is not authorization"
failure in slow motion. Each page carries its own.

Both admin pages `export const dynamic = "force-dynamic"`, for the same documented Next 16 reason
`app/lesson/[id]/page.tsx` does: a static-generation attempt over `cookies()` throws
`DynamicServerError` that is never converted into a per-request dynamic render and escapes as an
uncaught 500.

### 4.3 The list — `/admin`

`listLessonsAdmin()` is used unchanged; it already returns `hasDraft`, `writeOrigin` and `sourceRef`,
ordered `monthId → ord → id`.

`groupLessons()` is pure and therefore unit-tested directly rather than through a browser: lessons
with `hasDraft` are lifted into a **Pending review** group at the top; the rest keep the query order,
grouped section → month.

**Null months are not an edge case, they are 4 of the 82 rows.** `schema.ts:60` is explicit —
"reviews and exams belong to a section but to no month" — so `s1-review`, `s1-exam`, `s2-review` and
`s2-exam` all carry `month_id = NULL`, as does every e2e probe row. `groupLessons` therefore renders
null-month lessons **directly under their section, after its months**, ordered `review` then `exam`,
mirroring the reading order `queries.ts:209-214` already uses. A null group key must never become a
group named "null", and must never drop a lesson from the list. Both directions are unit-tested.

Columns: `id` · title · status · access · draft badge · `write_origin`. The row links to the detail
page. No search box and no facet filters — 82 rows fit one scrollable page, and drafts, the only
thing you actually hunt for, are pinned to the top.

### 4.4 The detail / review view — `/admin/lesson/[id]`

```
requireAdminPage()
getLessonForEdit(id)          → null ⇒ notFound()
getLessonMedia(id)            → figures for BlockRenderer
assertBlocks(row.body)        → live blocks,  inside try/catch
assertBlocks(row.bodyDraft)   → draft blocks, inside try/catch, when bodyDraft !== null
```

**Header:** id, title, status, access, `write_origin`, `source_ref`, and `source_ref_draft` when a
draft is pending — so "what is waiting for me, and from where" is answered on the page.

**Body, draft pending:** two columns, live left and draft right, both through the existing
`BlockRenderer` with the resolved `figures` and the lesson's `lessonId` (a required prop).

**`getLessonMedia` does not return what `BlockRenderer` wants.** It returns `VariantGroup[]`;
`BlockRenderer` takes `FigureSources[]`, and `app/lesson/[id]/page.tsx:84-92` bridges the two with a
six-line map. That map is **extracted to `lib/content/figures.ts` as `figuresFromMedia(groups)`** and
called from both pages — one definition, unit-tested, instead of a copy in the admin page that can
drift from the reader's view it is supposed to reproduce. `diffBlocks()` marks each block `added` / `removed` /
`changed` / `same`; markers are a coloured left border **plus a text label**, so the signal does not
rest on colour alone.

**Body, no draft pending:** the live body alone, and a plain statement that there is no draft. No
dead buttons.

**Body, malformed:** the offending column renders as an error panel quoting `assertBlocks`'s message
and block path, and the other column still renders. Promote is **disabled** while the draft does not
parse — promoting a body the page could not render would defeat the review entirely.

**`diffBlocks` is a plain LCS** over `JSON.stringify(block)` — equal strings are the LCS's equality
relation. Reorders show as a remove plus an add, which is truthful and is what an LCS does; nothing
here attempts move detection. Pure input, pure output, no rendering knowledge, so its whole
behaviour is unit-testable.

**Actions on this page:** Promote · Discard · Set status (draft/published) · Set access
(free/members/admin). Discard requires typing the lesson id to confirm; the other three are one
click, because all three are reversible. Promote and Discard render only when a draft is pending.

### 4.5 The action wrappers — `app/admin/actions.ts`

A `"use server"` module, so — the invariant from 2a §8 — it may export **only async functions**.
Verified with `grep "^export" app/admin/actions.ts` at the gate, exactly as `mutations.ts` is.

```ts
export type ActionResult = { ok: boolean; message: string };

export async function promoteAction(
  _prev: ActionResult | null, form: FormData,
): Promise<ActionResult>
```

Each wrapper:

1. `await assertAdmin()` — **its own check**, not inherited from the page and not assumed from the
   mutation it delegates to.
2. delegates to the `mutations.ts` function, which **checks again**. The double check is deliberate
   and free: it is one definition called twice, not two definitions that can drift.
3. maps the outcome to `{ok, message}` — including the mutation's `false`, which is a *failure* with
   a real message ("no draft pending for m1-01"), never a silent success.
4. writes the audit row (§4.7).

**Promote is the one with a precondition.** The form carries the fingerprint of the draft the page
rendered:

```ts
const seen = form.get("fingerprint");
const current = await getLessonDraftBody(id);
if (current === null) return { ok: false, message: `no draft pending for ${id}` };
if (fingerprint(current) !== seen)
  return { ok: false, message: "the draft changed since you opened this page — reload and re-read it" };
await promoteLessonDraft(id);
```

**Honest limit, stated so nobody mistakes it for a lock:** this narrows the race to the interval
between the re-read and the `UPDATE`. It does not close it. That is the same class of window the 2a
spec already documents at §4.4 for the cache purge, and closing it properly would mean a conditional
`UPDATE … WHERE body_draft = $expected` inside `write.ts` — out of bounds here without the user's
approval.

The UI is one small client component using `useActionState` to render the returned message. No error
boundary is load-bearing for the expected failures; a genuine throw (e.g. `assertAdmin` on a session
that expired mid-page) still surfaces through Next's error handling, which is correct — that is not
an expected state.

### 4.6 Revalidation

Nothing new. Every mutation already purges `lesson:{id}`, `lesson-meta:{id}` and `catalog` in the
same function as the write, via `mutations.ts`'s
`revalidate: (tags) => revalidateTag(t, { expire: 0 })` — the invariant 2′ behaviour, including the
`{expire: 0}` subtlety that a named profile would break. The admin pages themselves are
`force-dynamic` and cached nowhere, so a completed Server Action re-renders the current route with
fresh data automatically.

### 4.7 The audit table — migration `0005`

```ts
export const adminActions = pgTable("admin_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
  /** neon_auth."user".id, or null when the actor was not signed in. NEVER the email. */
  actorUserId: text("actor_user_id"),
  /** 'promote' | 'discard' | 'set_status' | 'set_access' */
  action: text("action").notNull(),
  /** Plain text, NO foreign key — see below. */
  lessonId: text("lesson_id"),
  /** 'ok' | 'noop' | 'denied' | 'error' */
  outcome: text("outcome").notNull(),
  /** Field values and the draft fingerprint. NEVER body content. */
  detail: jsonb("detail"),
}, (t) => [index("admin_actions_at_idx").on(t.at)]);
```

Four decisions inside that:

- **No FK to `lessons`.** A cascade would delete the history of a lesson when the lesson is deleted —
  destroying exactly the record you would want. Plain text keeps it.
- **`actor_user_id`, never the email.** 2a §10: never print a user's email. Storing it would be one
  careless log line from breaking that.
- **`detail` never holds body content** — field values and the fingerprint only. The audit table must
  not become a second, ungated copy of draft prose (invariant 6).
- **Denied attempts are logged too**, with `outcome='denied'` and a null lesson id where unknown.
  That is the half that answers the abuse question.

**Written after the mutation succeeds, as a separate round trip.** neon-http has no interactive
transactions, and making it atomic would mean a `db.batch` inside `write.ts` — out of bounds here. So
a crash between the write and the log loses the log entry, never the write. The log is
**best-effort and is documented as such**; it is a record, not a control. A failure to write the audit
row must not fail the action — it is caught and swallowed with a `console.error`, because losing the
ability to promote because logging broke would be a strictly worse outcome.

Generated with `pnpm db:generate` only — never hand-written. The generated SQL is read before applying
and confirmed replayable, and `drizzle-kit check` must report "Everything's fine".

### 4.8 The layout change

`app/layout.tsx` currently wraps every route in `<div className={styles.inner}>`, which caps width at
`--content-max: 880px`. The wrapper moves down into the three existing pages (`app/page.tsx`,
`app/lesson/[id]/page.tsx`, `app/auth/[path]/page.tsx`), leaving the root layout with
`<main className={styles.main}>{children}</main>`.

The DOM for every existing page is **identical** afterwards — the same element with the same class in
the same position, authored one level lower. The admin pages then set their own width.

Three checks belong to this change. Next's default `notFound()` rendering must still look right
without the layout wrapper (if not, `app/not-found.tsx` gets one). `app/auth/[path]/page.tsx` already
renders its own `<main>` inside the layout's `<main>` — a pre-existing nesting this change must not
worsen, so it receives the wrapper in the same position the layout gave it, or is confirmed not to
need it. And the existing e2e sweep over all lessons plus the home page is the regression net.

Separately, `next.config.ts` has no `headers()` today, so §2's `X-Robots-Tag` adds a config key that
did not exist. Small, but it is new surface rather than an edit to an existing rule.

---

## 5. Testing

The **permissive direction is the one that goes untested by default**, so it is written first.

### Unit (Vitest, no DB)

- `diffBlocks` — identical, insert, delete, reword, reorder, empty-vs-full, full-vs-empty.
- `groupLessons` — drafts lifted to the top, section/month grouping, ordering preserved, **and
  null-month lessons placed under their section rather than dropped or grouped under "null"**.
- `figuresFromMedia` — variant groups → `FigureSources[]`, including the missing-webp/avif cases.
- `fingerprint` — stable across key order, different for different content.
- `assertAdmin` / `requireAdminPage` **deny a non-admin**, with `accessContext` mocked to return
  `{user: null}` and `{user: {...}, isAdmin: false}` — both directions.
- `discardLessonDraft` and each action wrapper reject a non-admin, with a fake `db` and mocked
  `accessContext`; and `promoteAction` refuses on a fingerprint mismatch.
- The malformed-body path: `assertBlocks` rejecting is caught and surfaced as a message, not thrown.

### Integration (real production DB — the 2a conventions apply exactly)

Capture in `beforeAll`, restore in `try/finally` **and** an `afterAll` backstop, explicit `DELETE`s,
no `begin`/`rollback`. `m1-01` is the shared fixture and `vitest.integration.config.ts` keeps
`fileParallelism: false` — two files already mutate `m1-01`, and any new file touching it depends on
that setting.

- `discardLessonDraft` on `m1-01`: plant a draft, discard, assert `body_draft` **and**
  `source_ref_draft` are both null and the **live body is byte-identical** to the capture.
- `discardLessonDraft` on a lesson with no draft returns `false` (the `RETURNING` guard).
- The audit row is written with the right `action`, `outcome` and `lesson_id`, and its `detail`
  contains **no body content**. Rows deleted in cleanup.

### E2E (Playwright)

Reuses the existing fixtures — `admin.setup.ts` and the `admin-setup` / `admin` projects. No new
auth machinery.

**One new helper is required, and the reason matters.** `plantDraftLessonRow` creates a
`status='draft'` row with **no `body_draft`** (`body` defaults to `[]`), so `hasDraft` is `false` and
such a row would never appear under Pending review — the happy-path spec would assert against an
empty list and pass for the wrong reason. `plantPendingDraftRow()` is added alongside it: same
throwaway-row shape and its own distinct id/slug (`lessons.slug` is unique and Playwright runs
`fullyParallel`), but it writes a real `body`, a real `body_draft` and a `source_ref_draft`, so the
lesson genuinely has a pending draft to review.

**Its `cleanup()` also deletes the row's `admin_actions`.** The e2e happy path promotes and discards,
each of which writes an audit row to the real database, and the gate below requires `admin_actions`
back at its starting count. Integration cleanup covers its own rows the same way.

- **`admin-denied.spec.ts`** (anonymous, chromium project): `/admin` → 404, `/admin/lesson/m1-01` → 404.
- **`admin-denied.authenticated.spec.ts`** (signed-in **member**): the same two routes → 404. This is
  the permissive direction and the reason the member account exists.
- **`admin-console.admin.spec.ts`**: the list renders and shows the planted probe under Pending
  review; the detail page renders both columns with change markers; promote reports success and the
  draft columns clear; discard on a second probe clears them without touching the live body.

**Traps this suite must respect, all three already paid for on this project:**

- `catalogRows()` hard-codes `EXPECTED_ROW_COUNT` and throws on mismatch, and Playwright runs
  `fullyParallel`. **No probe row may ever be `status='published'`, even momentarily.** Visibility is
  asserted on the probe's own page, never through the catalog.
- `playwrightRequest.newContext()` **inherits the running project's `storageState`**. Any "anonymous"
  request made from inside the `admin` project must pass `storageState: {cookies: [], origins: []}`
  explicitly, or it silently carries the admin's cookies and the test passes for the wrong reason.
- `playwright.config.ts`'s chromium `testIgnore` lists `/\.authenticated\.spec\.ts$/` and
  `/\.admin\.spec\.ts$/`. New files must match one of those patterns or they also run anonymously.

**A seam stated rather than glossed:** e2e cannot realistically prove that a signed-in member is
refused by a **Server Action**. Action endpoints are opaque generated POST ids, and a test that
fabricates one proves nothing about the real button. That direction is covered by the unit tests above
plus the mutation test on `assertAdmin`. E2E proves the pages 404 for both non-admin identities.

### Mutation tests — each must kill at least one test

| Mutation | Test that must fail |
|---|---|
| `requireAdminPage` drops its `!ctx.isAdmin` condition | both `admin-denied` e2e specs |
| `assertAdmin` drops its throw | the wrapper-rejects-non-admin unit tests |
| `discardLessonDraft` drops `await requireAdmin()` | its unit test |
| `promoteAction` drops the fingerprint comparison | the mismatch unit test |
| `diffBlocks` marks every row `same` | the diff unit tests |
| `groupLessons` drops null-month lessons | the null-month unit test |

A mutation that causes a TypeScript error proves nothing. Use
`if (cond && Boolean(process.env.NEVER_SET_XYZ))`, grep the line to confirm it applied, confirm the
build still exits 0, then restore **byte-exact** and prove it with `git status --porcelain`.

### Gates

**No CI will ever run on this branch** — the app is hosted on Vercel — so every gate is a local run
and **exit codes are read in the FOREGROUND**. A backgrounded `pnpm build ; echo $?` reports the
echo's status, and that has already masked 8 type errors across four tasks on this project.

```
pnpm lint · npx tsc --noEmit · pnpm test:unit · pnpm test:integration
pnpm test:e2e · rm -rf .next && pnpm build
```

`rm -rf .next`, **not** `.next/cache`: a stale `.next/dev/types/validator.ts` fails the type check
with a bogus `AppRouteHandlerRoutes` error.

Plus:

- `grep "^export" lib/content/mutations.ts` and `app/admin/actions.ts` — async functions only.
- **Invariant 10 re-proof:** `tools/list` returns exactly 6, and none of `promote_draft`,
  `discard_draft`, `set_access`, `set_status`.
- **DB unchanged**: 82 lessons · 564 questions · 0 drafts · 0 `write_origin='cms'` · 0 unpublished ·
  0 `quiz_results`, and `admin_actions` back to 0 after test cleanup. **Counts alone cannot see a
  rewritten row**, so `m1-01` is dumped before and after and diffed against the snapshot.

---

## 6. Invariants

The ten from 2a are unchanged and still binding. In particular:

- **6** — `body_draft` is admin-only unconditionally. This project reads it in exactly two places,
  both behind `requireAdminPage()` / `assertAdmin()`, and the audit table's `detail` never holds body
  content.
- **10** — the agent cannot publish. `mcp/` is untouched; re-proven at the gate.

Three added by this project:

11. **Every admin page calls `requireAdminPage()` as its first statement.** No admin layout performs
    authorization, so a page cannot inherit a gate it never called.
12. **Every admin action calls `assertAdmin()` itself**, in addition to the check inside the mutation
    it delegates to.
13. **The audit log is a record, not a control.** Its failure never fails an action, and nothing reads
    it to make an authorization decision.

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| A future page under `/admin` forgets the guard | Invariant 11 plus no auth-performing layout. The mutation test on `requireAdminPage` proves the guard is live. |
| Exporting a helper from a `"use server"` module creates an action endpoint | The guard lives in a non-`"use server"` module. `grep "^export"` at the gate on both action modules. |
| The stale-review race | §4.5's fingerprint narrows it; the residual window is documented, not hidden. |
| A test passes vacuously | Both non-admin identities are asserted explicitly, and the `newContext` storageState inheritance trap is handled by construction. Every fixture must still hold the property its name claims. |
| Publishing a probe row breaks unrelated specs | `EXPECTED_ROW_COUNT` — no probe is ever `status='published'`. |
| The layout change regresses the public site | Identical DOM, and the existing all-lessons + home e2e sweep is the net. |
| **Discard is irrecoverable** — a mis-click loses an agent's draft | Typed lesson-id confirmation, and it renders only when a draft is actually pending. Not mitigated further: the draft can be re-generated from the transcript, and a soft-delete column would be schema scope this project does not need. |
| The audit write becomes a second copy of draft prose | `detail` carries field values and a fingerprint only; asserted by an integration test. |
| Migration 0005 is misgenerated | `pnpm db:generate` only, SQL read before applying, `drizzle-kit check` clean. |

---

## 8. Scope

Roughly **12–15 tasks across 4 phases**: guard + pure logic (TDD, no UI) → schema 0005 + action
wrappers → the two pages and the layout move → tests, mutation tests and the gate.

Nothing here belongs to 2c (quiz editing) or 2d (the prose editor).

**One assumption the user should confirm or correct.** The task brief lists `lib/db/schema.ts` under
"do not modify", with the parenthetical "(schema changes only via `pnpm db:generate`)"; the 2a spec
§10 says `lib/db/schema.ts` and `drizzle/` change "**only** via a generated migration". This design
takes the operative rule to be the mechanism — edit `schema.ts`, then generate — because a migration
cannot be produced otherwise. If the stricter reading was meant, **drop §4.7 and the audit table**;
nothing else in this design depends on them.

**Git:** local commits on this branch are authorised **only when the user asks**. Never push, never
open a PR, never force-push — the branch has no upstream and must keep none. Verify with
`git ls-remote --heads origin` rather than assuming.
