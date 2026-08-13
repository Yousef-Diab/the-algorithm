# CMS authoring workflow (MCP + human gate)

Course content lives in Postgres and is edited through an MCP server
(`mcp/server.ts`, registered as `content` in `.mcp.json`) that a local AI
agent drives, plus two human-only CLIs that are the only way anything
becomes public. The split exists on purpose: the agent reads transcripts and
notes — text it did not author — so a prompt injection or a plain model
error must never be able to publish on its own.

## Prerequisite: the app must be running

Every write — every MCP tool call and both CLIs below — starts with a
`preflight()` check that requires `REVALIDATE_SECRET` to be set **and** the
app's `/api/revalidate` endpoint to be reachable. If the Next app isn't
running (`pnpm dev` or `pnpm start`), preflight refuses and nothing is
written. Start the app first.

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
   `NO DRAFT PENDING — nothing changed` if there was nothing to promote/discard.
   The command exits non-zero if any id didn't change, but still processes
   every id in the list rather than stopping at the first failure.

4. **Publish (or unpublish) the lesson's status:**

   ```bash
   pnpm content:status published <lessonId...>
   pnpm content:status draft <lessonId...>
   ```

   Per id it prints the transition (`<id> → published`), `NO SUCH LESSON` for
   an unknown id, or a `FAILED ...` line if the write threw. Like
   `content:promote`, it continues over the remaining ids regardless and
   exits non-zero if any id failed.

Promoting a draft body and setting status are separate steps on purpose —
promoting makes the body the live body; status controls whether the lesson
is publicly reachable at all. A newly created lesson (`create_lesson`)
starts as an unpublished draft, so it needs both steps before anyone sees it.

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
