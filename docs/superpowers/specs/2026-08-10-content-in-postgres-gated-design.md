# Content in Postgres, gated and cached — design

**Date:** 2026-08-10
**Status:** approved (design); implementation plan not yet written
**Project:** The Algorithm — migration from the static single-file build to Next.js + Neon

---

## 1. Why this exists

The site today is content files plus a Python build step that emits one
self-contained `index.html`, served from GitHub Pages. That design was chosen
for offline use and zero dependencies, and it succeeded at both. It cannot,
however, restrict who reads the content: everything it can render, it ships.

The goal now is a Next.js application where lesson content lives in Neon
Postgres, is authored either by an importer or (later) an admin CMS, is served
only to people entitled to read it, and stays fast and light.

### The overriding constraint

> Nobody without access can see the content.

This is a security requirement, and it dictates most of the architecture below.
In particular it rules out static generation of gated lessons and public object
URLs for gated media — both of which the current migration branch relies on.

The project's own content rule (CLAUDE.md §1 — content comes purely from ICT's
mentorship notes and the transcripts) is unaffected by anything here and
continues to apply. `transcripts/` and `notes/` are read-only source material
for this work; nothing in this migration modifies or deletes them.

---

## 2. Scope

Your five stated asks are five subsystems. This spec covers only the first.

| # | Project | Status |
|---|---------|--------|
| 1 | **Content in Postgres, gated, cached** | **this spec** |
| 2 | Admin CMS | next project; needs #1's schema and renderer |
| 3 | Paid subscriptions | future; #1 leaves the `entitlements` table as its only seam |

Media storage (Cloudflare R2) lands in #1 rather than a project of its own,
because charts *are* content and a gated lesson with public charts is not
gated. Caching is likewise not a subsystem — it is a constraint running
through all of #1.

**Deliverable of project #1:** the site runs on Next.js, serves all 78 lessons
out of Neon, correctly gated, with charts private on R2. Content arrives via
the importer. No CMS yet.

### Explicitly out of scope

- **Video hosting.** Lessons keep their outbound links to the source videos.
  The `media` table carries a `kind` column so video drops in later without a
  schema change, but no upload, transcode, player or signed-playback work
  happens now.
- **Billing, Stripe, plans, checkout.** Project #3.
- **The admin CMS UI.** Project #2.
- **Search.** Not requested; would be a later addition over `lessons`.

---

## 3. Decisions and their rationale

| Decision | Rationale |
|----------|-----------|
| Postgres is the source of truth for content | Required by the access constraint — a file-backed static build ships gated prose in its payload |
| Lesson bodies are **structured block JSON** | Typed, validatable, zero XSS surface, renders straight to the existing React components; Tiptap (already a dependency for notes) speaks this shape natively, so the CMS gets a real block editor for free |
| A **machine write path** is preserved | I author by editing `content/` and running the importer, so bulk work stays a reviewable git diff rather than a UI-clicking job |
| Access is **per-lesson**: `free` / `members` / `admin` | Supports a free tier as a funnel for the future subscription; the flag lives on the content row so it is flippable in the CMS |
| **Quizzes are members-only**, unconditionally | Simpler than a per-lesson quiz gate, and it keeps free lesson pages fully cacheable |
| **Fresh branch off `main`**, porting files from `nextjs-migration` | `main` holds the current 78 lessons; the branch holds 38 stale pre-audit ones. Starting from `main` avoids converting the same material twice |
| **Cloudflare R2** for media | Zero egress fees, S3-compatible presigning, and Cloudflare Stream as the later video path |
| Charts get **pre-generated WebP/AVIF derivatives** | Avoids `next/image`'s optimizer, which cannot pass the visitor's cookies and so cannot fetch gated sources; also cuts ~78 MB of PNG to an estimated 25–35 MB |

### What is deliberately lost

- **The single offline `index.html`.** "Just open the file" and "gated content"
  are mutually exclusive. `build.py`, `verify.py` and the committed
  `index.html` retire with it. `main` remains as the archived static version.
- **`content/` as the source of truth.** It becomes the importer's input.
  Once the CMS exists (project #2) the DB can diverge from these files, at
  which point the importer must become per-lesson and additive rather than a
  wholesale overwrite.
- **Filesystem-derived image counts.** `lib/images.ts`'s `readdirSync` +
  `imageSize` cannot work once files live in R2; `media` rows replace it,
  carrying `width`/`height` so layout shift stays at zero.

---

## 4. Architecture

```
Cloudflare R2 (private bucket)              Neon Postgres
  charts + webp/avif derivatives              content:  sections · months · lessons(body jsonb)
  kind='video' seam, unused                             quiz_questions · media
        ▲                                     access:   user_roles · entitlements
        │ presigned GET, 60s TTL               per-user: progress · quiz_results · notes
        │                                             ▲
   ┌────┴─────────────────────────────────────────────┴────┐
   │  Next.js 16 App Router on Vercel                      │
   │                                                        │
   │  getCatalog()      nav/titles/cards → CDN, tag:catalog │
   │  lesson (free)     ISR, public cache, tag:lesson:{id}  │
   │  lesson (members)  dynamic, private, no-store          │
   │  /api/quiz/[id]    membership check → questions        │
   │  /api/media/[id]   canRead → proxy (free) | 302 (gated)│
   │  /admin            project #2                          │
   └────────────────────────────────────────────────────────┘
```

### Units and their boundaries

Each of these is independently understandable and testable:

| Unit | Does | Depends on |
|------|------|-----------|
| `lib/db/schema.ts` | Drizzle table definitions | nothing |
| `lib/content/queries.ts` | `getCatalog()`, `getLessonMeta()`, `getLessonBody()`, `getQuiz()` | schema |
| `lib/access.ts` | `canRead(lesson, user)`, `isAdmin()`, `hasEntitlement()` | schema, auth |
| `lib/media.ts` | `presign(key)`, variant selection | R2 client, schema |
| `components/blocks/*` | one component per block type | nothing (pure) |
| `components/blocks/BlockRenderer.tsx` | block array → React tree | block components |
| `scripts/import-content.mjs` | `content/` → DB + R2 | schema, R2, parser |
| `scripts/export-content.mjs` | blocks → HTML, for the fidelity diff | block vocabulary |

`BlockRenderer` and the block components are pure and take no data
dependencies, so they are unit-testable without a database. `canRead` is a
pure function of `(lesson, user, entitlements)` for the same reason.

---

## 5. Data model

### Content

```
sections   id text pk · short · title · desc · label · ord
             label names the middle tier: "Month" (s1) | "Part" (s2)

months     id text pk · section_id fk · title · desc · ord

lessons    id text pk · month_id fk · slug · title · crumb · desc
           video_url · ord
           kind    'lesson' | 'review' | 'exam'
           access  'free'   | 'members' | 'admin'
           status  'draft'  | 'published'
           body    jsonb
           updated_at · published_at
```

- **`body` is a jsonb column, not a `blocks` table.** A body is always read
  and written whole: one row read, atomic saves, trivially cacheable. A blocks
  table would buy per-block editing we do not need at the cost of a join on
  every page render.
- **`kind` reproduces the existing `data-kind` mechanism.** Section summaries
  and exams become `lessons` rows, so routing, nav and the renderer need no
  special cases; `kind='lesson'` is the filter for lesson counts, the progress
  bar and the notes boxes, exactly as today.
- **`status='draft'`** is what makes the CMS safe later: a lesson can be
  authored in the DB while invisible to non-admins, with no staging
  environment.
- **`access` defaults to `'members'` on import.** Fail closed: a mistake locks
  content rather than leaking it. Free lessons are marked deliberately.
- **Lesson ids stay `mX-NN`** and slugs stay `m{month}-{NN}-{kebab-title}`, as
  today, so existing links and image filenames keep working.

### Quiz

```
quiz_questions   id uuid pk · lesson_id fk · ord
                 q · options jsonb · answer int · explanation
```

Stable uuid ids are a deliberate fix. The migration branch keys `quiz_results`
on `(user_id, lesson_id, q_index)`; reordering or inserting a question in the
CMS would silently re-point every user's stored history at the wrong question.
`quiz_results` therefore keys on `question_id`. Exam questions live in the same
table, hanging off the `kind='exam'` row.

Option shuffling stays a render-time concern (Fisher–Yates on load), as does
the authoring rule that all four options be comparable in length — both remain
exactly as CLAUDE.md §3 specifies.

### Media

```
media   id uuid pk · lesson_id fk · kind 'image' | 'video' · ord
        storage_key · mime · width · height · bytes
        variant_of uuid null      ← webp/avif derivatives point at the original
        alt
```

`ord` replaces the `-NN` filename convention as the ordering authority.
`width`/`height` are recorded at import so the renderer emits intrinsic
dimensions and layout shift stays at zero.

### Access

```
user_roles     user_id text pk · role 'admin'
                 holds ADMINS ONLY — bootstrapped from an ADMIN_EMAILS env
                 allowlist at sign-in. Absence of a row is the normal case.

entitlements   id uuid pk · user_id · source 'admin_grant' | 'subscription'
               scope 'all' | 'section' · section_id null
               granted_at · expires_at null
```

There is deliberately no `'member'` role. Membership is not a role — it is the
presence of an unexpired entitlement, and having two ways to express it would
let them disagree. `user_roles` answers only "is this person an admin?"

This is the entire seam subscriptions need: Stripe's webhook writes a row with
`source='subscription'` and an `expires_at`, and `canRead` does not change.
Admin-granted access is the same table with `source='admin_grant'`.

Users themselves remain managed by Neon Auth (managed Better Auth) and synced
into `neon_auth.users_sync`; we reference the user id as text and never write
to that table.

### The gate

```
canRead(lesson, user):
  status  != 'published'  → admin only
  access  == 'free'       → yes, anyone
  access  == 'members'    → an unexpired entitlement with scope 'all',
                            or scope 'section' matching the lesson's section
  access  == 'admin'      → admin only
```

Every body render and every media request passes through this one function.
That single choke point is what makes the constraint auditable rather than
hopeful.

---

## 6. Rendering and caching

**The public shell** — home, section/month cards, sidebar nav, lesson titles
and one-line descriptions — comes from one `getCatalog()` query, cached under a
`catalog` tag and revalidated only when content publishes. It is byte-identical
for every visitor, so it lives on the CDN. This is most of the page weight,
served for free.

**Lesson bodies split by `access`:**

```
access='free'      generateStaticParams + ISR, tagged lesson:{id}
                   Cache-Control: public — a shared cache is correct here
access='members'   dynamic render, no prerender, no shared cache
                   Cache-Control: private, no-store
```

**The critical ordering rule:** on a gated lesson the body must not be
*fetched* before the gate, not merely hidden after it. If `getLessonBody()`
runs and `canRead` only suppresses the JSX, the prose still lands in the RSC
payload and is readable by anyone who requests it directly.
`getLessonBody(id)` is therefore called **inside** the `canRead` branch, never
above it. This is the single most important invariant in the codebase, and §8
tests it directly.

**Quizzes** render as a client component fetching `/api/quiz/{lessonId}`, which
performs the membership check server-side. Consequences: free lesson pages stay
100% statically cacheable (the quiz hydrates in below the fold), and correct
answers and explanations never reach a non-member. Non-members see a
"sign in to test yourself" prompt in the quiz's place. `kind='exam'` and
`kind='review'` rows are members-only by nature and are imported as such.

Answers *are* sent to members' browsers so grading stays instant with no
round trip per question. A member could read them in devtools; they are
entitled to that content regardless, so server-side grading would buy latency
and nothing else.

**Media — stable URLs, per-request auth:**

```
<img src="/api/media/{uuid}">     ← stable and cacheable; no signature in the HTML

/api/media/[id]
  ├─ look up media → lesson → canRead(lesson, user)
  ├─ denied → 404          (not 403; a 403 confirms the asset exists)
  ├─ free   → proxy bytes, Cache-Control: public, max-age=31536000, immutable
  │            the CDN caches it and R2 is hit once
  └─ gated  → 302 to a presigned R2 URL, 60s TTL
               Cache-Control: private, max-age=300
```

Presigning directly into the page HTML was rejected: a presigned URL embedded
in a cached page expires while the page is still being served, producing broken
charts on stale pages. A stable URL with a per-request check has no such
coupling, and R2's egress is free either way.

`next/image` is deliberately **not** used for charts. Its optimizer fetches the
source URL server-side without the visitor's cookies, so every gated chart
would 404. Instead the importer pre-generates WebP and AVIF derivatives at
upload time, stored as `variant_of` rows and served through `<picture>`/
`srcset` with the stored dimensions.

**Invalidation.** Publishing a lesson revalidates `lesson:{id}` and `catalog`.
Per-user data is never cached; media is immutable by id.

**Flipping `access` must purge the cache, and this is a leak if missed.** A
lesson prerendered while `access='free'` sits in a *public* ISR cache. Flip it
to `members` and that public copy survives until revalidated — the gate is
correct while the cache is stale. So any write that changes `access` revalidates
`lesson:{id}` and `catalog` in the same transaction boundary as the write, never
as a follow-up step. The reverse direction (`members` → `free`) is merely a
missing-page bug rather than a leak, but the same revalidation covers it.

Because `access` is DB state rather than build-time state, the lesson route sets
`dynamicParams = true`: `generateStaticParams` prerenders the currently-free
lessons, and anything else — a new lesson, a lesson just flipped to free —
renders on demand instead of 404ing. The branch's current `dynamicParams = false`
is correct for a fixed MDX set and wrong here.

**Anonymous UX.** On free lessons, progress and quiz-attempt state fall back to
`localStorage` when signed out and merge into the DB on first sign-in. Notes
remain signed-in only, as they already are.

---

## 7. The importer

`scripts/import-content.mjs` walks `content/<section>/<month>/<lesson>/` and
writes to Neon and R2:

```
section.js  months.js   → sections, months
lesson.html             → lessons.body (blocks)
quiz.js                 → quiz_questions
video.txt               → lessons.video_url
summary.html            → lessons row, kind='review'
exam.js                 → lessons row, kind='exam' + quiz_questions
images/{slug}-NN.png    → R2 upload + webp/avif derivatives + media rows
```

`section.js` and `months.js` hold bare object literals that JS formatters
mangle by design (CLAUDE.md §3), so they need the same tolerant key/value parse
that `build.py`'s `parse_objs` performs — not `JSON.parse`, and not `eval`.
Array literals (`quiz.js`, `exam.js`) may carry a trailing semicolon for the
same reason.

The HTML→blocks parser maps exactly the vocabulary CLAUDE.md §3 documents:
`h3`; `h4` with its optional `.src` pointer; `ul`/`ol`; `.callout` in its three
variants with the `.tag` span; `.kv` rows; `.flip-row`/`.flip`; and
`.fig-slot[data-slug]`. The three render-time slots — `.quiz`,
`.lesson-footer`, `.review-footer` — are dropped, since the renderer supplies
them.

**The parser throws on any element it does not recognise.** An unmapped element
is a content-fidelity bug and must stop the import rather than quietly vanish
from a lesson. Imports are idempotent upserts keyed by id, and `--dry-run`
prints the diff before anything is written.

### Fidelity is proven, not asserted

`scripts/export-content.mjs` renders stored blocks back to HTML and diffs
against the source `lesson.html`. **Round-tripping all 78 lessons to a clean
diff is the acceptance gate for the import.** This is how a parser that mangles
one nested callout in lesson 54 gets caught without reading 78 files by eye.

---

## 8. Verification

`verify.py` retires. A Playwright suite keeps its checks and adds the ones the
new architecture requires:

- every lesson in the DB renders; every block type is exercised
- **gating tests, as security tests** — as an anonymous client, request a gated
  lesson's RSC payload, its `/api/quiz/{id}` endpoint and its `/api/media/{id}`
  route, and assert the prose, the answers and the bytes are all absent. This
  is the executable form of §1's constraint, and it must fail loudly if the
  §6 ordering rule is ever violated.
- quiz grades and persists; exam scores against the 80% pass mark and is
  retakeable
- the lightbox's three documented traps: real mouse input for outside-click
  (synthetic `el.click()` passes through the `e.target` fallback and hides the
  bug), pointer capture retargeting, and `align-items:safe center`
- zero console or page JS errors

CI runs the same suite. The `build.py` / committed-`index.html` sync check
retires with the static build.

---

## 9. Phasing

Reviewable in pieces rather than one large drop:

| Phase | Content |
|-------|---------|
| **P0** | Fresh branch off `main`; port components, CSS, auth, drizzle from `nextjs-migration` via `git checkout <branch> -- <paths>`; app boots against Neon |
| **P1** | Schema + importer + round-trip fidelity gate — content in Neon and rendering |
| **P2** | R2 media, derivatives, `/api/media` route |
| **P3** | Roles, entitlements, `canRead`, caching model, `/api/quiz` endpoint |
| **P4** | Progress/quiz/notes port, localStorage merge, Playwright suite + CI |

P0 restores files rather than re-authoring them, so "fresh branch" costs setup
configuration (next.config, package.json, tsconfig, auth wiring, CI workflow)
and not the ~40 component files already working on `nextjs-migration`.

---

## 10. Risks

| Risk | Mitigation |
|------|-----------|
| The §6 ordering rule is violated in a later edit, leaking gated prose into an RSC payload | The anonymous-fetch tests in §8 assert absence of prose, not absence of rendering |
| The HTML→blocks parser silently drops content | Parser throws on unknown elements; round-trip diff over all 78 lessons is the acceptance gate |
| `access` set wrongly on import | Defaults to `members`; the failure mode is over-locked, not leaked |
| A lesson flipped `free` → `members` stays readable from the public ISR cache | The `access` write revalidates `lesson:{id}` and `catalog` at the write boundary; a test flips a lesson and re-requests it anonymously |
| Quiz history corrupted by CMS reordering | `quiz_results` keys on `question_id`, not `q_index` |
| Neon Auth session check on every gated request adds latency | Session is cookie-cached by the Neon Auth SDK; entitlement lookup is one indexed query, and gated pages are dynamic regardless |
| R2 presigned URL expires mid-page-life | Media URLs in HTML are stable route-handler paths; presigning happens per request |
| Block JSON silently loses node attributes when passed through a Server Action | **Known, already hit once on `nextjs-migration`:** React Flight serialization drops a Tiptap/ProseMirror node's `attrs` (including image `src`) across the client→server boundary — text and marks survive, so it looks like it works. Block JSON must cross that boundary as a **`JSON.stringify`'d string**, parsed server-side. Applies to the CMS editor in project #2 and to any block payload in project #1 |

---

## 11. Environment

```dotenv
DATABASE_URL=                 # Neon
NEON_AUTH_BASE_URL=           # Neon console → Auth tab
NEON_AUTH_COOKIE_SECRET=      # >= 32 random chars
ADMIN_EMAILS=                 # comma-separated allowlist, bootstraps user_roles
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
```

`BLOB_READ_WRITE_TOKEN` is no longer needed — Vercel Blob is replaced by R2 for
charts. Note that Tiptap notes currently store inline images via
`@vercel/blob`; P2 moves those to R2 as well so there is one media path, not
two.
