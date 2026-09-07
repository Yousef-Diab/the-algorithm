# AGENTS.md — working guide for The Algorithm

This file applies to the entire repository. Read it before editing. More specific `AGENTS.md` files, if added later, override it only within their directory.

The active product is a Next.js learning application backed by Postgres. The repository also retains the original static course sources and generator as an import source and historical offline build. Do not confuse the two architectures.

## 1. The rule that overrides everything

**Course content must come purely from the provided ICT mentorship notes and video transcripts.** Do not add outside trading knowledge, invent examples, or silently “improve” concepts beyond what the source supports.

- Read the relevant file under `transcripts/` and/or `notes/` before drafting lesson prose, quiz answers, summaries, or explanations.
- Correct answers and explanations must be traceable to those sources. Plausible distractors may be invented, but they must not introduce false teaching.
- If the sources are ambiguous or incomplete, under-claim and report the gap.
- Preserve attribution to ICT and the original creators.
- `transcripts/` and `notes/` are local, git-ignored source material. Never commit them.

Product copy, UI labels, infrastructure, and engineering documentation are not course content and may be written normally.

## 2. Current architecture

### Active application

- `app/` — Next.js 16 App Router routes, server actions, route handlers, layouts, and page-level styles.
- `components/` — client and server UI grouped by concern: auth, lessons, quizzes, progress, rewards, shell, notes, and lightbox.
- `components/shell/SiteLoader.tsx` — the shared visual loader for route boundaries. Reuse it instead of creating route-specific loading cards or spinners.
- `lib/db/schema.ts` — Drizzle schema for application-owned tables in Postgres.
- `lib/db/` — authenticated per-user queries for access, progress, quizzes, exams, and notes.
- `lib/content/` — block validation/rendering, public reads, imports, draft writes, canonicalization, and admin queries.
- `lib/rewards/` — checkpoint XP, leaderboard queries, levels, and focus-timer state.
- `lib/auth*` — Neon Auth server/client integration. Auth users live in `neon_auth."user"`; application tables store their IDs as text.
- `drizzle/` — append-only SQL migrations and Drizzle snapshots. Migrations `0007`–`0009` implement rewards and rollout reconciliation.
- `mcp/` — the local content-authoring MCP server. It can create drafts and edit permitted metadata; it cannot publish.
- `scripts/` — deliberate operational CLIs for imports, media, access, status, draft promotion, entitlement grants, and database checks.
- `tests/unit/` — default, isolated Vitest suite. Reward SQL runs against disposable PGlite.
- `tests/browser/` — isolated reward-component browser fixture.
- `tests/e2e/` — Playwright tests against a built Next.js app; authenticated variants may use configured accounts and data.
- `tests/integration/` — tests against the configured real database. They are intentionally separated from the default Vitest configuration.

The active deployment reads course content from Postgres. Public catalog metadata may be cached, while gated bodies and media must only be fetched after authorization.

### Retained static source tree

- `content/` contains the original per-section, per-month/part, per-lesson HTML and quiz source.
- `engine/` contains the original static renderer.
- `build.py` assembles those sources into `index.html`.
- `index.html` is generated. Never hand-edit it.
- `verify.py` rebuilds and checks the static artifact.

The static tree remains useful for bulk import, provenance, and the legacy offline artifact. It is no longer the architecture of the active Next.js application.

## 3. Content and data conventions

### Course shape

The corpus currently has two sections and 78 teaching lessons:

- ICT Core: Months 1–4, 38 lessons.
- ICT 2022 Mentorship: Parts 1–6, 40 lessons; episode 28 is omitted because it has no usable teaching audio/source.

Sections may also have a review page and final exam. Database lesson kinds are `lesson`, `review`, and `exam`. Access is `free`, `members`, or `admin`; status is `draft` or `published`. Unknown access/status values must fail closed.

Lesson IDs and slugs are durable identifiers. Do not rename them casually: they connect content, media, progress, answers, rewards, caches, and URLs. Quiz results key on stable question UUIDs, never question order.

### Quizzes

- Keep four options per question.
- Options shuffle at render time; author the correct `answer` as the zero-based index in stored order.
- Keep option lengths reasonably balanced so the correct answer is not visually obvious.
- Put nuance and source-grounded explanation in the explanation field rather than making one option conspicuously detailed.
- Reordering a question must preserve its UUID. Rewording/deleting questions can invalidate saved answers and must be treated as a data-affecting change.

### Database content and drafts

Postgres is the active source of truth. `body` is live; `body_draft` is unreviewed and admin-only. `source_ref` and `source_ref_draft` travel with the corresponding body. Never expose draft content through public/member read paths.

The import path from `content/` preserves question IDs by matching question text. It refuses to overwrite CMS-owned lessons or lessons with pending drafts. Read `docs/cms-authoring.md` before content writes, imports, promotion, status changes, access changes, or quiz replacement.

### Legacy static format

When editing the retained static corpus, a lesson folder contains `lesson.html`, `quiz.js`, and `video.txt`. Section metadata lives in `section.js` and `months.js`; summaries and exams use `summary.html` and `exam.js`. Image names follow `images/{lesson-slug}-{NN}.png`.

The static quiz object shape remains:

```js
[
  { q: "Question?", o: ["A", "B", "C", "D"], a: 1, e: "Source-grounded explanation." }
]
```

`section.js`, `months.js`, `quiz.js`, and `exam.js` are intentionally parser-tolerant because formatters can add semicolons to their bare literals. Do not replace the tolerant parsing with `eval` or assume strict JSON.

Reusable authored blocks include callouts, key/value rows, flip cards, headings, lists, and figure groups. Prefer the existing block vocabulary over adding one-off markup.

The lightbox opens the whole lesson’s image set. Preserve three interaction details: pointer capture can retarget a click from the zoomed image to the stage, so outside-click logic must hit-test the image rectangle; the stage uses `flex: 1; min-height: 0` to keep controls fixed; and safe centering keeps the top/left of a zoomed image reachable. Test outside clicks with real pointer input rather than synthetic `element.click()`.

Legacy browser state uses `ict-done`, `ict-quiz`, `ict-exam`, and `ict-notes`. Signed-in migration is guarded by `ict-merged`. Never clear `ict-notes` while importing or resetting progress.

## 4. Development workflows

### Local application

Use the package-manager version declared in `package.json`.

```powershell
pnpm install
pnpm dev
```

The production loop is:

```powershell
pnpm build
pnpm start
```

The app normally uses port 3000. Before production Playwright runs, verify that port 3000 is not occupied by `next dev`; Playwright may otherwise reuse it and test the wrong runtime.

### Database changes

1. Edit `lib/db/schema.ts` when the schema changes.
2. Generate a migration with `pnpm db:generate`. Use Drizzle’s custom migration option for data-only reconciliation.
3. Inspect the SQL and metadata. Never edit, reorder, or delete an already-applied migration.
4. Test SQL against disposable PGlite when feasible.
5. Applying a migration changes the database selected by `DATABASE_URL` and must be deliberate:

```powershell
node --env-file=.env.local node_modules/drizzle-kit/bin.cjs migrate
```

After applying, query the schema/data invariant the migration was meant to establish. A successful command alone does not prove a backfill is correct or idempotent.

Neon’s HTTP driver does not provide ordinary interactive transactions. Use `db.batch()` for an atomic multi-statement write, or a Postgres function when row locks and transactional reward logic are required.

### Content authoring and publishing

The content MCP server is registered in `.mcp.json` and runs with `pnpm mcp`. Its body writes go only to `body_draft` and require a real `sourceRef` under `transcripts/` or `notes/`.

Promotion and publication are deliberate review gates:

```powershell
pnpm content:promote promote <lessonId...>
pnpm content:promote discard <lessonId...>
pnpm content:status published <lessonId...>
pnpm content:status draft <lessonId...>
node --env-file=.env.local --experimental-strip-types scripts/set-access.mjs <free|members|admin> <lessonId...>
```

The app must be running and `REVALIDATE_SECRET` configured for authoring writes so caches can be purged. Promotion overwrites the live body and discard removes the draft; inspect the rendered comparison and source before either action. Do not add publishing, access, or status tools to the agent-facing MCP server.

Bulk import uses `pnpm content:import`. Media upload uses `scripts/upload-media.mjs`. Read their docs and dry-run/reporting behavior before using them against configured infrastructure.

### Rewards

Quiz completion is the only lesson checkpoint. The database function calculates XP; clients never submit an amount, timestamp, or another user ID.

- First completion: 20 XP.
- Reach at least 80%: 10 XP once.
- Reach at least 80% on the immutable first complete attempt: 5 XP.
- Perfect immutable first attempt: hidden 5 XP.
- Fresh full review after seven days: 5 XP.

Timer use never earns XP. Quiz resets and manual progress toggles never mint or remove XP. Reward events form an immutable ledger, unique indexes protect one-time events, and the leaderboard is all-time only. Read `docs/focus-rewards.md` before changing this system.

## 5. Verification

Choose checks that cover the changed behavior. Before committing a broad application change, run the safe baseline:

```powershell
pnpm test:unit
pnpm lint
pnpm build
```

For reward UI changes:

```powershell
pnpm test:rewards-ui
pnpm exec playwright test tests/e2e/rewards.spec.ts tests/e2e/quiz.spec.ts --project=chromium
```

For broader anonymous production flows, use the relevant `tests/e2e/*.spec.ts` files or `pnpm test:e2e`. Build first. Authenticated/admin projects need their configured test accounts and may write real state.

`pnpm test:integration` writes to the real database selected by `.env.local`, including shared fixture lessons. Do not run it as routine verification. Run it only when the task requires those database paths and the configured environment is known and authorized. It is serialized across files to prevent collisions.

If `content/`, `engine/`, `build.py`, or the generated static artifact changes, also run:

```powershell
python verify.py
```

That command rebuilds `index.html`; commit the generated artifact when the legacy source changes. Do not run the legacy build for unrelated Next.js work.

Do not hide warnings introduced by the change. The repository currently has one known lint warning in `tests/unit/write.test.ts` for `_omitted`; avoid adding more.

## 6. Security, privacy, and data invariants

- `canRead()` in `lib/access.ts` is the central lesson gate. Build the access context once and check it before fetching body, quiz, or media payloads.
- Never fetch gated prose or media above the authorization branch; hidden JSX can still leak data through an RSC payload.
- Route handlers and server actions derive identity from the authenticated session. Never accept a client-supplied user ID for per-user writes.
- Never return quiz answer indexes to an unauthorized or ungraded client. Grade on trusted server/database state.
- The `neon_auth` schema is owned by Neon Auth. Read the user ID/name where required; do not migrate or write its tables. Do not expose emails on the leaderboard.
- Membership is represented by unexpired entitlements. Admins are represented by `user_roles`; there is no parallel member role.
- Private media is served through the gated media route from configured object storage. Do not expose storage keys or add a public bucket shortcut.
- `admin_actions` is an audit record, never an authorization control. It must not contain body content or secrets.
- Reward claims require authenticated membership and readable, published lesson metadata. Keep `claim_checkpoint` server-side; never expose it as a browser/database RPC.
- Notes are private per user and lesson. Resetting progress or quizzes must never clear notes.
- `.env.local` and all credentials are untracked. Update `.env.example` with names and safe descriptions only; never commit values.
- Cache invalidation is part of a successful content write. Preserve the `lesson:{id}`, `lesson-meta:{id}`, and `catalog` tag behavior.

## 7. Repository discipline and references

- Prefer focused changes and existing module boundaries. Do not mix course rewrites, schema changes, and UI refactors without a concrete need.
- Next.js/Vitest resolve the `@/` alias. Plain Node CLIs and the MCP process may not; shared writer modules intentionally use relative imports and injected dependencies.
- Server-action modules export async functions only. Keep database code behind `server-only` boundaries.
- Use `rg`/`rg --files` to inspect the repository. Do not commit scratch scripts, test artifacts, `.next`, local auth state, notes, transcripts, or secrets.
- Preserve stable identifiers, user history, and append-only migrations. Avoid destructive database operations unless explicitly requested and reviewed.
- `README.md` still describes the legacy offline course for historical users. This file is authoritative for current engineering work.

Useful references:

- `docs/cms-authoring.md` — draft, review, promotion, publishing, cache, and admin-console rules.
- `docs/auth-setup.md` — Neon Auth, OTP, Google OAuth, and required environment setup.
- `docs/focus-rewards.md` — XP ledger, first attempts, reviews, profiles, and leaderboard behavior.
- `docs/content-audit.md` — detailed source-fidelity audit history.
- `docs/s2-2022-mentorship-plan.md` — Section 2 mapping and source decisions.
- `notes/ict-core/INDEX.md` — local Section 1 notes map and fetch instructions, when the git-ignored notes directory is present.
- `docs/superpowers/specs/` and `docs/superpowers/plans/` — design history; treat current code and this guide as authoritative when old plans describe an earlier state.
