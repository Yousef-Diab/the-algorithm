# CMS authoring workflow (MCP + human gate)

Course content lives in Postgres and is edited through an MCP server
(`mcp/server.ts`, registered as `content` in `.mcp.json`) that a local AI
agent drives, plus three human-only CLIs that are the only way anything
becomes public or changes who can read it. The split exists on purpose: the agent reads transcripts and
notes — text it did not author — so a prompt injection or a plain model
error must never be able to publish on its own.

## Prerequisite: the app must be running

Every write — every MCP tool call and all three CLIs below — starts with a
`preflight()` check that requires `REVALIDATE_SECRET` to be set **and** the
app's `/api/revalidate` endpoint to be reachable. If the Next app isn't
running (`pnpm dev` or `pnpm start`), preflight refuses and nothing is
written. Start the app first.

## Launch the MCP server from the repo root

`sourceRef` paths are resolved against the repo root, which `mcp/host.ts`
derives from its own module location rather than the process's working
directory — `.mcp.json` specifies no `cwd`, so the server would otherwise
inherit the MCP client's. The fix makes citation checking correct wherever
the client is launched from, but the server still reads `content/` and
`.env.local` relatively in other places, so **launch your MCP client from the
repo root**. Anything else is unsupported.

## The six tools

Registered by the `content` MCP server (`mcp/server.ts`):

| Tool | What it does |
|---|---|
| `list_lessons` | List lessons with access, status, whether a draft is pending, and provenance. |
| `get_lesson` | Full lesson row, including the live body and any pending draft body. |
| `write_lesson_body` | Writes the lesson's **draft** body only — never the live body. Requires `sourceRef`. |
| `write_lesson_meta` | Updates title/heading/crumb/desc/videoUrl. Applies **live** immediately (this metadata is already public via the catalog). `slug` is not writable. |
| `upsert_quiz` | Inserts/updates quiz questions, preserving `question_id` so user answers survive. Refused while a draft body is pending. |
| `create_lesson` | Creates a text-only lesson. Starts as an unpublished draft; access defaults to `members`. |

## What the agent cannot do

Four tools are deliberately absent from the server: `promote_draft`,
`discard_draft`, `set_access`, `set_status`. This is not a gap to fill in
later — it is the design's only real structural control. The agent can draft
and edit metadata, but it can never move a draft to the live body, change
who can read a lesson, or flip a lesson's published/draft status. Publishing
requires a human running a CLI, on their own machine, deliberately.

`write_lesson_body` reinforces the same boundary at the data layer: it only
ever writes `body_draft`. No public read path — anonymous, member, or
admin's own catalog view — selects `body_draft`. A pending draft is
invisible to every reader until a human promotes it.

## `sourceRef` is mandatory

Every `write_lesson_body` call requires a `sourceRef`: a real, existing path
under `transcripts/` or `notes/`. It's validated at write time — a
nonexistent or out-of-tree path is rejected. This keeps every drafted body
traceable back to the source material it was drafted from.

This exists because of the project's core content rule (CLAUDE.md §1):
course content must come *purely* from ICT's mentorship notes and video
transcripts, never from outside/general trading knowledge. `sourceRef`
doesn't prove the content is faithful to the source — only a human review
does that — but it does prove a source was consulted, and it's what the
human reviewer opens first.

## The end-to-end flow

1. **Agent drafts.** The agent calls `write_lesson_body` (and optionally
   `write_lesson_meta` / `upsert_quiz` / `create_lesson`) via the `content`
   MCP tools. Body writes land in `body_draft`; nothing is public yet.
2. **Human reads the draft.** Before promoting anything, call `get_lesson`
   yourself and actually read the draft body against its `sourceRef`. The
   promote step below is the review — CLAUDE.md §1 still governs, and
   nothing enforces it except a human reading the text before it goes live.
   Do not rubber-stamp it.
3. **Promote or discard:**

   ```bash
   pnpm content:promote promote <lessonId...>
   pnpm content:promote discard <lessonId...>
   ```

   Each id is handled independently. Per id it prints `done`, or
   `NOTHING CHANGED — either no draft is pending or there is no such lesson`.
   Those two cases genuinely cannot be told apart here: the UPDATE matches on
   `(id = ? AND body_draft IS NOT NULL)`, so one boolean covers both, and the
   message refuses to assert the benign one. Check the id if you did expect a
   draft. The command exits non-zero if any id didn't change, but still
   processes every id in the list rather than stopping at the first failure.

4. **Publish (or unpublish) the lesson's status:**

   ```bash
   pnpm content:status published <lessonId...>
   pnpm content:status draft <lessonId...>
   ```

   Per id it prints the transition (`<id> → published`), `NO SUCH LESSON` for
   an unknown id, or a `FAILED ...` line if the write threw. Like
   `content:promote`, it continues over the remaining ids regardless and
   exits non-zero if any id failed.

5. **Change who can read a lesson** (the third human CLI — it has no `pnpm`
   alias, so call it directly):

   ```bash
   node --env-file=.env.local --experimental-strip-types      scripts/set-access.mjs <free|members|admin> <lessonId...>
   ```

   `free` is readable by anyone, `members` requires a signed-in member, and
   `admin` is admin-only. Like the other two it reports per id: an id that
   matched no row prints `NO SUCH LESSON: <id> — nothing changed` and the
   command exits non-zero, so a typo cannot look like a completed lockdown.
   It purges `lesson:{id}`, `lesson-meta:{id}` and `catalog` after the write,
   because an access change that leaves a readable copy in the public ISR
   cache has not actually happened yet.

Promoting a draft body and setting status are separate steps on purpose —
promoting makes the body the live body; status controls whether the lesson
is publicly reachable at all. A newly created lesson (`create_lesson`)
starts as an unpublished draft, so it needs both steps before anyone sees it.

## Re-importing from `content/` preserves saved quiz answers

`pnpm content:import` refuses to touch a lesson the CMS has claimed
(`write_origin='cms'`) or one with a pending draft, and it no longer
re-publishes a lesson a human pulled down — `status`, like `access` and
`published_at`, is set only when the row is first inserted.

For each lesson it *does* write, the quiz is an **id-preserving upsert**, not
a delete-and-reinsert. The importer reads that lesson's existing
`quiz_questions` rows, matches them against the questions parsed from
`quiz.js`, and hands the pairing to the same `upsertQuiz` the `upsert_quiz`
tool uses — so matched rows are UPDATEd in place, keeping their
`question_id`, and only genuinely new questions are inserted. **Re-importing
unchanged content leaves every `question_id` untouched**, so every
`quiz_results` row survives. (This was not always true: the importer used to
delete every row for the lesson and re-insert it, regenerating every id and
cascading away every saved answer. It was harmless only because
`quiz_results` was still empty.)

Identity is matched on the **question text**, because `quiz.js` carries no
ids and identity has to be inferred from something. Text survives reorders,
insertions and removals exactly. The ordinal would not: inserting or removing
a question shifts every ordinal after it, which would re-point each id at
different prose and silently re-attribute stored answers to the wrong
question — the failure `schema.ts`'s invariant 4 exists to prevent.

Two consequences worth knowing:

- **Rewording a question drops its answers.** A reworded question does not
  match any existing text, so it is inserted fresh and the old row is removed,
  cascading its `quiz_results`. That is the intended trade: those answers were
  given to prose that no longer exists. Fixing a typo therefore costs that one
  question's answer history.
- **Deleting a question from `quiz.js` deletes it from the database.**
  `content/` is the source of truth for an import, so the row goes and its
  answers cascade. The importer prints a warning naming the lesson and the
  number of answers discarded — it is never silent.

Both are bounded, reported, and scoped to the question actually edited.
`upsert_quiz` remains the right tool for editing a live quiz question by
question, since it can change text while keeping the id; `content:import`
remains the bulk path from `content/`.

## Migration 0004

Migration 0004 (the CMS write path's schema addition) is purely additive —
four `ADD COLUMN` statements, no data rewrite and no constraint change to
existing rows. There is no down migration; reversing it is four matching
`DROP COLUMN`s.

## Registering the MCP server

The `content` server is registered in `.mcp.json` alongside the existing
`Neon` server:

```json
"content": {
  "command": "node",
  "args": ["--env-file=.env.local", "--experimental-strip-types", "mcp/server.ts"]
}
```

`.mcp.json` holds no secrets — `--env-file=.env.local` loads
`DATABASE_URL`, `REVALIDATE_SECRET`, and anything else the server needs from
your local, git-ignored `.env.local`. The server only speaks stdio; there is
no HTTP transport, since that would recreate the public authenticated write
surface this design deliberately refused.

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

**Promote is also irrecoverable, and easy to mistake for reversible.** It
overwrites the live `body` with `body_draft` and keeps no copy of what was
there before — no undo, no history row. Today you can still recover a mistake
because production has zero lessons with `write_origin='cms'`, so every live
body can still be rebuilt from the repo's `content/` importer. But that
safety net is per-lesson and one-time: the first console promote of a given
lesson removes it for that lesson, and a second promote after that
permanently destroys prose that exists nowhere else. Read the side-by-side
review carefully before you click Promote.

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
