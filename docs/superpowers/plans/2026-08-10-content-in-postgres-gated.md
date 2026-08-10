# Content in Postgres, Gated and Cached — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all 78 lessons (plus 2 section summaries and 2 exams) out of the static `content/` + `build.py` pipeline into Neon Postgres as structured block JSON, served by a Next.js app that shows gated prose and gated charts only to entitled users, with charts private on Cloudflare R2.

**Architecture:** Postgres is the source of truth for content. Lesson bodies are a typed block-JSON array in a `jsonb` column, rendered by a pure `BlockRenderer` over `components/blocks/*`. `content/` becomes the importer's input, and a parser/exporter round-trip over all 80 source HTML files is the acceptance gate for import fidelity. A single `canRead(lesson, user, entitlements)` function gates every body render and every media byte; free lessons are ISR-cached publicly, members lessons are dynamic and `no-store`, and quizzes are always fetched from an authenticated API route so free pages stay fully static.

**Tech Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Drizzle ORM + `@neondatabase/serverless` · Neon Auth (`@neondatabase/auth`, managed Better Auth) · CSS Modules (no Tailwind) · Tiptap 3 (notes only) · Cloudflare R2 via `@aws-sdk/client-s3` · `node-html-parser` + `sharp` (importer, dev-only) · Vitest (unit) + Playwright (e2e).

**Source of truth for design:** `docs/superpowers/specs/2026-08-10-content-in-postgres-gated-design.md`. Where this plan and the spec disagree, the spec wins — raise it rather than improvising.

---

## Global Constraints

Every task's requirements implicitly include this section.

- **CLAUDE.md §1 overrides everything.** Course content comes *purely* from ICT's mentorship notes and `transcripts/`. This migration **transforms** existing content; it never authors, improves, rewords or invents any. If a transformation would change wording, stop and report it.
- **Never `git commit` and never `git push`.** Every task ends with `git add` only. The user commits. A checklist telling you to commit does not override this.
- **Never touch `transcripts/` or `notes/`.** Read-only, forever. Never delete a git-ignored file.
- **`images/` stays in the repo.** It is the importer's input. Do not move or delete it.
- **`main` is untouched.** `build.py`, `verify.py`, `index.html`, `engine/` stay exactly as they are on `main`. On this branch they remain present and unmodified until the user explicitly retires them.
- **Secrets:** read from `process.env` only. Never print, echo, log or commit a secret value. `.env.local` is git-ignored; `.env.example` holds names with empty values.
- **Neon:** project `the-algorithm` (`weathered-bar-16690573`), default branch `production` (`br-solitary-pond-as1s7jtr`), database `neondb`. `DATABASE_URL` in `.env.local` already points at it.
- **Neon Auth stays as provisioned.** 9 tables in the `neon_auth` schema, Better Auth, email+password with OTP, shared Google OAuth, `allow_localhost: true`. Reference `neon_auth."user".id` as **text**; never write to that schema. `NEON_AUTH_BASE_URL` = `https://ep-dark-meadow-asosdp4k.neonauth.c-4.eu-central-1.aws.neon.tech/neondb/auth`.
- **R2 bucket is private.** No `r2.dev` URL, no custom domain, no public bucket policy. Bytes reach the browser only through `/api/media/[id]`.

### The five invariants (violating any of these is a defect, not a style choice)

1. **`getLessonBody()` is called *inside* the `canRead` branch, never above it.** Fetch-then-hide leaks prose into the RSC payload.
2. **Any write that changes `lessons.access` revalidates `lesson:{id}` and `catalog` at the write boundary**, in the same function as the write — never as a follow-up step.
3. **`lessons.access` defaults to `'members'` on import.** Fail closed.
4. **`quiz_results` keys on `question_id` (uuid), never on a question index.**
5. **Block JSON crosses any client→server boundary as a `JSON.stringify`'d string.** React Flight silently drops ProseMirror/Tiptap `attrs` (including image `src`) otherwise.

### Do not port from `nextjs-migration`

`content/**/*.mdx`, `lib/lessons.generated.ts`, `lib/lessons.modules.generated.ts`, `lib/lesson-content.ts`, `lib/lessons.ts`, `lib/images.ts`, `mdx-components.tsx`, `scripts/generate-registry.mjs`, and every MDX/Blob dependency (`@next/mdx`, `@mdx-js/*`, `@types/mdx`, `remark-*`, `gray-matter`, `image-size`, `@vercel/blob`). Blocks in Postgres replace all of it. `components/mdx/*` become `components/blocks/*`.

---

## File Structure

```
app/
  layout.tsx                    root shell: providers + Sidebar + main
  page.tsx                      home (hero + section/month cards)
  globals.css  shell.module.css ported design tokens + shell layout
  lesson/[id]/page.tsx          the one content route (lessons, reviews, exams)
  auth/[path]/page.tsx          Neon Auth UI views
  api/auth/[...path]/route.ts   Neon Auth handler
  api/quiz/[id]/route.ts        members-only quiz questions            (P3)
  api/media/[id]/route.ts       canRead → proxy (free) | 302 (gated)   (P2)
  actions/progress.ts           per-user progress + quiz results       (P4)
  actions/notes.ts              note load/save + image upload          (P4)

lib/
  db/index.ts                   drizzle client over @neondatabase/serverless
  db/schema.ts                  every table
  auth/server.ts auth/client.ts auth.ts        Neon Auth wiring (ported)
  content/blocks.ts             Block/Inline types + runtime validator
  content/parse-html.ts         lesson.html → { meta, blocks }; THROWS on unknown
  content/export-html.ts        { meta, blocks } → canonical HTML
  content/canonical.ts          canonicalHtml() + the enumerated source dialect rules
  content/parse-meta.ts         tolerant section.js / months.js / quiz.js / exam.js readers
  content/queries.ts            getCatalog getLessonMeta getLessonBody getQuiz
  content/mutations.ts          setLessonAccess / publishLesson — revalidate at write (P3)
  access.ts                     canRead / isAdmin / hasEntitlement (pure)   (P3)
  media.ts                      R2 client, presign(key), variant selection  (P2)

components/
  blocks/BlockRenderer.tsx      block[] → React tree (pure, server-safe)
  blocks/Inline.tsx             inline[] → React nodes
  blocks/Heading.tsx Paragraph.tsx List.tsx Callout.tsx Kv.tsx
  blocks/FlipCard.tsx FlipHint.tsx Figures.tsx FigureImage.tsx
  shell/Sidebar.tsx             section→month→lesson nav + progress
  home/SectionCards.tsx         home cards grouped by section
  lesson/LessonFooter.tsx  lesson/LessonVideo.tsx
  quiz/Quiz.tsx  quiz/Exam.tsx  lightbox/  notes/  auth/  progress/

scripts/
  import-content.mjs            content/ → Neon (+ R2 in P2); --dry-run
  export-content.mjs            blocks → HTML on stdout, for manual diffing
  set-access.mjs                flip lessons.access through the revalidating mutation (P3)

tests/
  unit/*.test.ts                blocks, parser, exporter, round-trip, meta, access
  e2e/*.spec.ts                 rendering, gating-as-security, quiz, exam, lightbox
```

---

# P0 — Boot the app

Deliverable: `pnpm lint`, `pnpm build` and a Playwright smoke test are green on this branch; auth is live; the DB client connects. No content yet.

### Task 1: Next.js scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `.env.example`, `app/layout.tsx`, `app/page.tsx`, `vitest.config.ts`
- Modify: `.gitignore` (verify only — it is already rewritten and correct)

**Interfaces:**
- Produces: `pnpm dev|build|start|lint|test:unit|test:e2e|db:generate|db:migrate|db:push`, path alias `@/*` → repo root.

- [ ] **Step 1: Port the three config files that need no edits**

```bash
git checkout nextjs-migration -- tsconfig.json eslint.config.mjs playwright.config.ts
```

If a hook blocks the `eslint.config.mjs` write (it was config-protected on the old branch), stop and tell the user — do not work around it.

- [ ] **Step 2: Write `package.json`**

MDX, Blob, `gray-matter` and `image-size` are deliberately absent (see Global Constraints). `sharp`, `node-html-parser` and the AWS SDK arrive in the tasks that need them.

```json
{
  "name": "the-algorithm",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint --ignore-pattern \"engine/**\" --ignore-pattern \"content/**\"",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "content:import": "node scripts/import-content.mjs"
  },
  "dependencies": {
    "@neondatabase/auth": "0.4.2-beta",
    "@neondatabase/serverless": "^1.1.0",
    "drizzle-orm": "^0.45.2",
    "next": "16.2.11",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@playwright/test": "^1.61.1",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "dotenv": "^17.4.2",
    "drizzle-kit": "^0.31.10",
    "eslint": "^9",
    "eslint-config-next": "16.2.11",
    "typescript": "^5",
    "vitest": "^3.2.4"
  }
}
```

**Do not add `@neondatabase/auth-ui` as a direct dependency.** Verified against the old branch: it is a *transitive* dep of `@neondatabase/auth@0.4.2-beta` (resolved there as `0.2.1-beta`), and `components/auth/AuthProvider.tsx` imports `NeonAuthUIProvider` from `@neondatabase/auth/react/ui` plus the stylesheet from `@neondatabase/auth/ui/css` — both subpaths of the `auth` package. Adding `auth-ui` directly pins a version that may not exist and can desync from what `auth` expects.

Pin `@neondatabase/auth` to exactly `0.4.2-beta` (no caret): it is a beta, and it is the version the old branch verified end-to-end including the OTP flow.

- [ ] **Step 3: Write `next.config.ts`**

No MDX, no `images` config (charts never touch `next/image` — see the spec §6). The 10 MB Server Action limit stays: notes autosave sends a whole Tiptap doc.

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Notes autosave posts the whole note document.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
```

- [ ] **Step 4: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
  resolve: { alias: { "@": resolve(__dirname, ".") } },
});
```

- [ ] **Step 5: Write a minimal `app/layout.tsx` and `app/page.tsx`**

Deliberately bare — Task 2 ports the real shell. This exists so `pnpm build` has something to build.

```tsx
// app/layout.tsx
export const metadata = { title: "The Algorithm" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// app/page.tsx
export default function Home() {
  return <h1>The Algorithm</h1>;
}
```

- [ ] **Step 6: Write `.env.example`**

```dotenv
# Neon Postgres — project "the-algorithm", database neondb
DATABASE_URL=

# Neon Auth (managed Better Auth) — base URL from the Neon console Auth tab
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=

# Comma-separated allowlist that bootstraps user_roles on sign-in
ADMIN_EMAILS=

# Cloudflare R2 — private bucket, no public URL
R2_ACCOUNT_ID=
R2_BUCKET=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
```

- [ ] **Step 7: Install and verify the build**

```bash
pnpm install
pnpm lint
pnpm build
```

Expected: lint clean, build succeeds with one static route (`/`). If `pnpm install` warns about a peer for `@neondatabase/auth-ui`, note it and continue — the old branch shipped with it.

- [ ] **Step 8: Stage**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.ts eslint.config.mjs \
        playwright.config.ts vitest.config.ts .env.example app/layout.tsx app/page.tsx
```

Do not commit. Report what is staged.

---

### Task 2: Port the CSS, the shell layout and the lightbox

**Files:**
- Create (by port): `app/globals.css`, `app/shell.module.css`, `components/lightbox/LightboxProvider.tsx`, `components/lightbox/Lightbox.module.css`
- Create: `app/dev-css-probe/page.tsx` (temporary; deleted in Task 13)
- Test: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: `useLightbox()` → `{ open(src: string, caption?: string): void }`; global classes `.lesson`, `.lesson-hero`, `.crumb`, `.desc`, `.callout`, `.kv`, `.flip-row`, `.lesson-footer`, `.lesson-video`, `.btn`, `.btn.primary`; CSS-module classes `styles.app`, `styles.main`, `styles.inner`.

- [ ] **Step 1: Port the files**

```bash
git checkout nextjs-migration -- app/globals.css app/shell.module.css components/lightbox
```

- [ ] **Step 2: Read `components/lightbox/LightboxProvider.tsx` and confirm the three documented traps survived the port**

CLAUDE.md §3 names them: the stage holds a **pointer capture** so Chromium retargets the follow-up `click` (there must be a hit-test against the image rect, not a trust of `e.target`); `.lb-stage` must be `flex:1; min-height:0` so the caption panel is pinned; the stage must centre with `align-items: safe center`. If any is missing from the ported file, restore it from the `main` branch's `engine/head.html` + `engine/app.js` and say which.

- [ ] **Step 3: Write a temporary CSS probe page**

This exists only to prove the ported stylesheet still renders every content component; Task 13 deletes it. Markup is copied structurally from `content/s1-ict-core/m4/m4-03/lesson.html` — no new prose.

```tsx
// app/dev-css-probe/page.tsx
export default function CssProbe() {
  return (
    <article className="lesson">
      <div className="lesson-hero">
        <div className="crumb">Month 4 · Lesson 3</div>
        <h1>Orderblocks</h1>
        <div className="desc">One-line summary.</div>
      </div>
      <h3>A sub-header</h3>
      <ul>
        <li>A list item with <strong>strong</strong> and <em>em</em>.</li>
      </ul>
      <div className="callout"><span className="tag">Note</span>Callout body.</div>
      <div className="callout rule"><span className="tag">Rule</span>Rule body.</div>
      <div className="callout warn"><span className="tag">Warn</span>Warn body.</div>
      <div className="kv">
        <div>Term</div><div>Definition</div>
      </div>
      <div className="lesson-footer">
        <span />
        <button type="button" className="btn primary">Mark complete</button>
        <span />
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Wire the real shell into `app/layout.tsx`**

`ProgressProvider` and `Sidebar` are not ported yet (they need the catalog, which is P1). Providers land incrementally; the lightbox is data-free so it lands now.

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { LightboxProvider } from "@/components/lightbox/LightboxProvider";
import styles from "./shell.module.css";

const FAVICON = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Crect%20width='32'%20height='32'%20rx='7'%20fill='%230b0e14'/%3E%3Crect%20x='.75'%20y='.75'%20width='30.5'%20height='30.5'%20rx='6.25'%20fill='none'%20stroke='%23232b3d'%20stroke-width='1.5'/%3E%3Cpath%20d='M7%2025.5%2016%206.5%2025%2025.5'%20fill='none'%20stroke='%23e8b45a'%20stroke-width='3'%20stroke-linecap='round'%20stroke-linejoin='round'/%3E%3Cpath%20d='M9.9%2019.7h12.2'%20fill='none'%20stroke='%234f8cff'%20stroke-width='3'%20stroke-linecap='round'/%3E%3C/svg%3E";

export const metadata: Metadata = {
  title: "The Algorithm — Learning how price is really delivered",
  description: "An interactive course built from ICT's Mentorships.",
  icons: { icon: FAVICON },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LightboxProvider>
          <div className={styles.app}>
            <main className={styles.main}>
              <div className={styles.inner}>{children}</div>
            </main>
          </div>
        </LightboxProvider>
      </body>
    </html>
  );
}
```

`suppressHydrationWarning` is required: the auth UI's `next-themes` sets the theme class on `<html>` client-side.

- [ ] **Step 5: Write the failing smoke test**

```ts
// tests/e2e/smoke.spec.ts
import { test, expect } from "@playwright/test";

test("css probe renders every content component with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/dev-css-probe");

  await expect(page.locator(".lesson-hero h1")).toHaveText("Orderblocks");
  await expect(page.locator(".callout")).toHaveCount(3);
  await expect(page.locator(".kv > div")).toHaveCount(2);

  // The ported stylesheet must actually be applied, not merely present.
  const bg = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe("rgba(0, 0, 0, 0)");

  expect(errors).toEqual([]);
});
```

- [ ] **Step 6: Run it**

```bash
pnpm build && pnpm test:e2e
```

Expected: PASS. If port 3000 is held by a stale `next start`, kill it first — a stale server serves an old build and produces confusing failures:

```bash
netstat -ano | grep :3000
taskkill //PID <pid> //F
```

- [ ] **Step 7: Stage**

```bash
git add app/globals.css app/shell.module.css app/layout.tsx app/dev-css-probe \
        components/lightbox tests/e2e/smoke.spec.ts
```

---

### Task 3: Port auth and make a session live

**Files:**
- Create (by port): `lib/auth/server.ts`, `lib/auth/client.ts`, `lib/auth.ts`, `app/api/auth/[...path]/route.ts`, `app/auth/[path]/page.tsx`, `app/auth/[path]/auth.module.css`, `components/auth/AuthProvider.tsx`, `components/auth/AuthControls.tsx`, `components/auth/AuthControls.module.css`, `docs/auth-setup.md`
- Modify: `app/layout.tsx`, `.env.local` (add two keys — never print their values)

**Interfaces:**
- Produces: `isAuthConfigured: boolean`, `auth` (Neon Auth server instance), `getCurrentUser(): Promise<{ id: string; email?: string } | null>`, `requireUserId(): Promise<string>`, `<AuthProvider>`, `<AuthControls />`.

- [ ] **Step 1: Port the files**

```bash
git checkout nextjs-migration -- lib/auth lib/auth.ts app/api/auth app/auth components/auth docs/auth-setup.md
```

- [ ] **Step 2: Add the two auth env keys to `.env.local`**

`NEON_AUTH_BASE_URL` is not a secret — it is the console value:
`https://ep-dark-meadow-asosdp4k.neonauth.c-4.eu-central-1.aws.neon.tech/neondb/auth`

`NEON_AUTH_COOKIE_SECRET` must be ≥32 random chars. Generate it without printing it:

```bash
node -e "const fs=require('fs');const s=require('crypto').randomBytes(32).toString('base64url');fs.appendFileSync('.env.local','\nNEON_AUTH_BASE_URL=https://ep-dark-meadow-asosdp4k.neonauth.c-4.eu-central-1.aws.neon.tech/neondb/auth\nNEON_AUTH_COOKIE_SECRET='+s+'\n');console.log('appended 2 keys, secret length', s.length)"
```

Then confirm by name only: `grep -c '^NEON_AUTH_' .env.local` → expect `2`.

- [ ] **Step 3: Read `lib/auth.ts` and check the user-id shape**

`getCurrentUser()` must expose the `neon_auth."user".id` as a string, and an `email` (the `ADMIN_EMAILS` bootstrap in P3 needs it). If the ported file returns the session's user object wholesale, narrow it to `{ id, email }` so nothing downstream depends on the SDK's shape.

- [ ] **Step 4: Wire `AuthProvider` + `AuthControls` into the layout**

Wrap the shell only when `isAuthConfigured`, exactly as the old branch did — this keeps the app bootable with no auth env:

```tsx
import { isAuthConfigured } from "@/lib/auth/server";
import { AuthProvider } from "@/components/auth/AuthProvider";
// …inside RootLayout, replacing the bare <LightboxProvider> tree:
const shell = (
  <LightboxProvider>
    <div className={styles.app}>
      <main className={styles.main}>
        <div className={styles.inner}>{children}</div>
      </main>
    </div>
  </LightboxProvider>
);
return (
  <html lang="en" suppressHydrationWarning>
    <body>{isAuthConfigured ? <AuthProvider>{shell}</AuthProvider> : shell}</body>
  </html>
);
```

`AuthControls` renders inside `Sidebar`, which arrives in Task 13 — leave it unmounted for now.

- [ ] **Step 5: Write the failing auth test**

```ts
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("the auth handler answers and the sign-in view renders", async ({ page, request }) => {
  const res = await request.get("/api/auth/get-session");
  expect(res.status()).toBe(200);

  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/auth/sign-in");
  await expect(page.getByRole("button", { name: /sign in/i }).first()).toBeVisible();
  expect(errors).toEqual([]);
});
```

- [ ] **Step 6: Run it**

```bash
pnpm build && pnpm test:e2e
```

Expected: PASS. A 200 with `null` body from `get-session` is correct for an anonymous request. If it 500s, the base URL or cookie secret is wrong — check `isAuthConfigured` is `true` and re-read `docs/auth-setup.md`.

- [ ] **Step 7: Stage**

```bash
git add lib/auth lib/auth.ts app/api/auth app/auth components/auth docs/auth-setup.md \
        app/layout.tsx tests/e2e/auth.spec.ts
```

`.env.local` is git-ignored — nothing to stage there. Say so in the report.

---

### Task 4: Port the database client

**Files:**
- Create (by port): `lib/db/index.ts`, `drizzle.config.ts`
- Create: `lib/db/schema.ts` (empty placeholder — Task 10 fills it), `scripts/db-ping.mjs`

**Interfaces:**
- Produces: `db` (drizzle instance over `@neondatabase/serverless` neon-http).

- [ ] **Step 1: Port the client and drizzle config**

```bash
git checkout nextjs-migration -- lib/db/index.ts drizzle.config.ts
```

Do **not** port `lib/db/schema.ts`, `lib/db/notes-queries.ts` or `lib/db/progress-queries.ts` — the schema is redesigned in Task 10 and the queries in Task 22.

- [ ] **Step 2: Create the placeholder schema so the client type-checks**

```ts
// lib/db/schema.ts
// Tables land in Task 10 (content) and Task 17/22 (access, per-user).
export {};
```

- [ ] **Step 3: Write a connectivity check**

```js
// scripts/db-ping.mjs
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const sql = neon(url);
const [{ db, ver }] = await sql`select current_database() as db, version() as ver`;
const tables = await sql`
  select table_schema, count(*)::int as n
  from information_schema.tables
  where table_schema in ('public', 'neon_auth', 'drizzle')
  group by table_schema order by table_schema`;

console.log(`connected to ${db} — ${ver.split(" ").slice(0, 2).join(" ")}`);
for (const t of tables) console.log(`  ${t.table_schema}: ${t.n} table(s)`);
```

`dotenv/config` reads `.env` but not `.env.local`. Load it explicitly if the ping cannot find the URL: `node --env-file=.env.local scripts/db-ping.mjs` (Node 24 supports `--env-file`). Prefer `--env-file=.env.local` for every script in this plan.

- [ ] **Step 4: Run it**

```bash
node --env-file=.env.local scripts/db-ping.mjs
```

Expected: `connected to neondb — PostgreSQL 18`, `neon_auth: 9 table(s)`, `drizzle: 1 table(s)`, and **no** `public` line (the schema is empty).

If `public` reports tables, stop and report what they are — the plan assumes an empty `public` schema and Task 10 must not clobber something unexpected.

- [ ] **Step 5: Drop the stale migration journal**

The `drizzle.__drizzle_migrations` table is a leftover from the old branch's migrations, which no longer exist. Task 10 generates migration `0000` from scratch, and a stale journal will make `drizzle-kit migrate` skip it.

Ask the user to confirm before running this (it is a destructive DB statement on their project):

```bash
node --env-file=.env.local -e "import('@neondatabase/serverless').then(async ({neon})=>{const sql=neon(process.env.DATABASE_URL);await sql\`drop table if exists drizzle.__drizzle_migrations\`;console.log('dropped stale journal')})"
```

- [ ] **Step 6: Stage**

```bash
git add lib/db drizzle.config.ts scripts/db-ping.mjs
```

**P0 gate:** `pnpm lint`, `pnpm build`, `pnpm test:e2e` green; `db-ping` connects; `/api/auth/get-session` → 200. Report and stop for review.

---

# P1 — Schema, importer, fidelity gate

Deliverable: all 78 lessons + 2 reviews + 2 exams live in Neon as block JSON, the app renders their prose from the database, and a round-trip diff over all 80 source HTML files passes. Charts arrive in P2; gating in P3.

## The source vocabulary (surveyed, not guessed)

A full parent→child survey of the 80 source files (78 `lesson.html` + 2 `summary.html`) produced this closed vocabulary. **There is nothing else in the corpus.** The parser must accept exactly this and throw on anything else.

Top-level children of `section.lesson`:

| Element | Count | Becomes |
|---|---|---|
| `div.lesson-hero` (`.crumb`, `h2`, `.desc`) | 80 | lesson meta, not a block |
| `p` | 504 | `p` |
| `h3` | 406 | `h3` |
| `div.callout.rule` / `div.callout` / `div.callout.warn` | 270 / 207 / 149 | `callout` (`rule`/`note`/`warn`) |
| `div.kv` | 142 | `kv` |
| `h4` | 71 | `h4` |
| `ul` / `ol` | 68 / 12 | `list` |
| `div.fig-slot[data-slug]` | 67 | `figures` |
| `div.flip-row` | 7 | `flipRow` |
| `div.flip-hint` | 5 | `flipHint` |
| `div.quiz`, `div.lesson-footer`, `div.review-footer` | 78, 78, 2 | **dropped** — the renderer supplies these slots |

Inline vocabulary: `strong` (3703), `em` (334), `b` (34), `br` (6), `span.src` (76), plus text. Nesting observed: `strong > em`, `em > strong`, `span > strong`, `span > em`. Max tree depth 5. **Zero `<a>` tags. Zero nested lists.**

Structural facts that shape the parser:

- **Callouts always have a `.tag` span** — 0 of 626 callouts lack one, so `tag` is required and its absence is an error. Callout bodies are bare inline runs, sometimes interleaved with `ul` (32) or `ol` (2).
- **`.kv` has two dialects.** (A) flat alternating cells: `.kv > div, div, …` — 509 rows. (B) row-wrapped: `.kv > div > (span|b), span` — 40 rows (34 begin with `b`, 6 with `span`). Every one of the 34 `b` and 46 bare `span` elements in the corpus is a whole kv cell; none is inline-within-text.
- **Flip cards have two dialects.** (A) `.flip > .flip-in > .flip-face.flip-front` + `.flip-face.flip-back` — 13 cards. (B) `.flip > .flip-inner > .flip-front` + `.flip-back` — 8 cards. 21 total.
- **`.flip-hint` is *not* reliably adjacent to its `.flip-row`.** In `m3-01` a `<p>` sits between them. So `flipHint` is its own top-level block, never folded into `flipRow`. (This means the ported `FlipRow`, which hardcodes its own "Tap a card to reveal" hint, must stop doing that.)
- **`data-title` differs from the hero `h2` in 6 real cases** (`m2-07`, `m2-08`, `m3-07`, `m3-08` use `:` in the attribute and `—` in the heading; `m3-08` also appends " Pattern"; both summaries use a short nav title and a long heading). So `lessons` needs **both** `title` (nav) and `heading` (hero).
- **One `.desc` contains markup** (`p5-01` has an `<em>`), so `desc` is stored as an inline array, with a helper that flattens it to text for nav, cards and SEO.
- Crumbs are all `{Month N|Part N} · Lesson M` or `{Section} · Section Review`, all plain text, 80 unique. Store verbatim rather than deriving.

### Task 5: The block vocabulary

**Files:**
- Create: `lib/content/blocks.ts`
- Test: `tests/unit/blocks.test.ts`

**Interfaces:**
- Produces: types `Inline`, `Block`, `LessonMetaRow`; functions `assertBlocks(v: unknown): Block[]` (throws), `inlineText(nodes: Inline[]): string`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/blocks.test.ts
import { describe, it, expect } from "vitest";
import { assertBlocks, inlineText, type Block } from "@/lib/content/blocks";

describe("inlineText", () => {
  it("flattens nested marks to plain text", () => {
    expect(
      inlineText([
        { t: "text", v: "A live long taken " },
        { t: "em", c: [{ t: "text", v: "against" }] },
        { t: "text", v: " the daily bias" },
      ]),
    ).toBe("A live long taken against the daily bias");
  });

  it("renders a br as a single space", () => {
    expect(inlineText([{ t: "text", v: "1. Trade Inside" }, { t: "br" }, { t: "text", v: "the Range" }]))
      .toBe("1. Trade Inside the Range");
  });
});

describe("assertBlocks", () => {
  it("accepts every block type", () => {
    const blocks: Block[] = [
      { t: "h3", c: [{ t: "text", v: "Definition" }] },
      { t: "h4", c: [{ t: "text", v: "Pattern one " }, { t: "src", c: [{ t: "text", v: "(bearish)" }] }] },
      { t: "p", c: [{ t: "text", v: "Body." }] },
      { t: "list", ordered: false, items: [[{ t: "text", v: "one" }]] },
      { t: "callout", variant: "warn", tag: [{ t: "text", v: "Bearish OBs" }], c: [{ t: "run", c: [{ t: "text", v: "x" }] }] },
      { t: "kv", rows: [{ k: [{ t: "text", v: "Macro" }], v: [{ t: "text", v: "y" }] }] },
      { t: "flipRow", cards: [{ front: [{ t: "text", v: "Q" }], back: [{ t: "text", v: "A" }] }] },
      { t: "flipHint", v: "Click a card to flip it" },
      { t: "figures", slug: "m4-03-orderblocks" },
    ];
    expect(assertBlocks(JSON.parse(JSON.stringify(blocks)))).toEqual(blocks);
  });

  it("throws on an unknown block type", () => {
    expect(() => assertBlocks([{ t: "table", rows: [] }])).toThrow(/unknown block type "table"/);
  });

  it("throws on an unknown inline type", () => {
    expect(() => assertBlocks([{ t: "p", c: [{ t: "a", href: "x" }] }])).toThrow(/unknown inline type "a"/);
  });

  it("throws on a callout with no tag", () => {
    expect(() => assertBlocks([{ t: "callout", variant: "note", c: [] }])).toThrow(/callout .* tag/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
pnpm test:unit tests/unit/blocks.test.ts
```

Expected: FAIL — cannot resolve `@/lib/content/blocks`.

- [ ] **Step 3: Write `lib/content/blocks.ts`**

```ts
/**
 * The closed block vocabulary of a lesson body. Derived from a full survey of
 * the 80 source HTML files; see the plan's "source vocabulary" table. Adding a
 * type here means adding a parser branch, an exporter branch and a renderer
 * branch — all three, or the round-trip gate fails.
 */

export type Inline =
  | { t: "text"; v: string }
  | { t: "strong"; c: Inline[] }
  | { t: "em"; c: Inline[] }
  | { t: "br" }
  /** span.src — the "(L4)" lesson pointer. */
  | { t: "src"; c: Inline[] };

/** A callout body is bare inline runs, optionally interleaved with lists. */
export type CalloutChild =
  | { t: "run"; c: Inline[] }
  | { t: "list"; ordered: boolean; items: Inline[][] };

export type Block =
  | { t: "h3"; c: Inline[] }
  | { t: "h4"; c: Inline[] }
  | { t: "p"; c: Inline[] }
  | { t: "list"; ordered: boolean; items: Inline[][] }
  | { t: "callout"; variant: "note" | "rule" | "warn"; tag: Inline[]; c: CalloutChild[] }
  | { t: "kv"; rows: { k: Inline[]; v: Inline[] }[] }
  | { t: "flipRow"; cards: { front: Inline[]; back: Inline[] }[] }
  | { t: "flipHint"; v: string }
  | { t: "figures"; slug: string };

export type LessonKind = "lesson" | "review" | "exam";

/** Everything the hero and the nav need — the non-body half of a lesson row. */
export interface LessonMetaRow {
  id: string;
  kind: LessonKind;
  sectionId: string;
  monthId: string | null;
  /** Nav/card/SEO title — the source's data-title. */
  title: string;
  /** Hero <h2> text. Differs from `title` in 6 of 80 files. */
  heading: string;
  crumb: string;
  desc: Inline[];
  slug: string;
}

export function inlineText(nodes: Inline[]): string {
  return nodes
    .map((n) => {
      switch (n.t) {
        case "text":
          return n.v;
        case "br":
          return " ";
        default:
          return inlineText(n.c);
      }
    })
    .join("");
}

function fail(msg: string): never {
  throw new Error(`invalid block JSON: ${msg}`);
}

function assertInline(v: unknown, where: string): Inline {
  if (typeof v !== "object" || v === null) fail(`${where}: expected an object`);
  const n = v as Record<string, unknown>;
  switch (n.t) {
    case "text":
      if (typeof n.v !== "string") fail(`${where}: text.v must be a string`);
      return { t: "text", v: n.v };
    case "br":
      return { t: "br" };
    case "strong":
    case "em":
    case "src":
      return { t: n.t, c: assertInlines(n.c, `${where}/${n.t}`) } as Inline;
    default:
      fail(`${where}: unknown inline type "${String(n.t)}"`);
  }
}

function assertInlines(v: unknown, where: string): Inline[] {
  if (!Array.isArray(v)) fail(`${where}: expected an array of inline nodes`);
  return v.map((n, i) => assertInline(n, `${where}[${i}]`));
}

function assertItems(v: unknown, where: string): Inline[][] {
  if (!Array.isArray(v)) fail(`${where}: expected an array of list items`);
  return v.map((it, i) => assertInlines(it, `${where}[${i}]`));
}

export function assertBlocks(v: unknown): Block[] {
  if (!Array.isArray(v)) fail("body must be an array of blocks");
  return v.map((raw, i) => {
    if (typeof raw !== "object" || raw === null) fail(`block[${i}]: expected an object`);
    const b = raw as Record<string, unknown>;
    const at = `block[${i}]`;
    switch (b.t) {
      case "h3":
      case "h4":
      case "p":
        return { t: b.t, c: assertInlines(b.c, at) } as Block;
      case "list":
        if (typeof b.ordered !== "boolean") fail(`${at}: list.ordered must be a boolean`);
        return { t: "list", ordered: b.ordered, items: assertItems(b.items, at) };
      case "callout": {
        if (b.variant !== "note" && b.variant !== "rule" && b.variant !== "warn")
          fail(`${at}: unknown callout variant "${String(b.variant)}"`);
        if (!Array.isArray(b.tag) || b.tag.length === 0)
          fail(`${at}: callout must carry a non-empty tag`);
        if (!Array.isArray(b.c)) fail(`${at}: callout.c must be an array`);
        const c = b.c.map((raw2, j) => {
          const ch = raw2 as Record<string, unknown>;
          if (ch?.t === "run") return { t: "run" as const, c: assertInlines(ch.c, `${at}/run[${j}]`) };
          if (ch?.t === "list") {
            if (typeof ch.ordered !== "boolean") fail(`${at}/list[${j}]: ordered must be a boolean`);
            return { t: "list" as const, ordered: ch.ordered, items: assertItems(ch.items, `${at}/list[${j}]`) };
          }
          return fail(`${at}: unknown callout child "${String(ch?.t)}"`);
        });
        return { t: "callout", variant: b.variant, tag: assertInlines(b.tag, `${at}/tag`), c };
      }
      case "kv": {
        if (!Array.isArray(b.rows)) fail(`${at}: kv.rows must be an array`);
        return {
          t: "kv",
          rows: b.rows.map((r, j) => {
            const row = r as Record<string, unknown>;
            return {
              k: assertInlines(row?.k, `${at}/rows[${j}].k`),
              v: assertInlines(row?.v, `${at}/rows[${j}].v`),
            };
          }),
        };
      }
      case "flipRow": {
        if (!Array.isArray(b.cards) || b.cards.length === 0) fail(`${at}: flipRow needs at least one card`);
        return {
          t: "flipRow",
          cards: b.cards.map((cd, j) => {
            const card = cd as Record<string, unknown>;
            return {
              front: assertInlines(card?.front, `${at}/cards[${j}].front`),
              back: assertInlines(card?.back, `${at}/cards[${j}].back`),
            };
          }),
        };
      }
      case "flipHint":
        if (typeof b.v !== "string") fail(`${at}: flipHint.v must be a string`);
        return { t: "flipHint", v: b.v };
      case "figures":
        if (typeof b.slug !== "string" || !b.slug) fail(`${at}: figures.slug must be a non-empty string`);
        return { t: "figures", slug: b.slug };
      default:
        return fail(`${at}: unknown block type "${String(b.t)}"`);
    }
  });
}
```

- [ ] **Step 4: Run the test**

```bash
pnpm test:unit tests/unit/blocks.test.ts
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Stage**

```bash
git add lib/content/blocks.ts tests/unit/blocks.test.ts
```

---

### Task 6: The HTML → blocks parser

**Files:**
- Create: `lib/content/parse-html.ts`
- Test: `tests/unit/parse-html.test.ts`
- Modify: `package.json` (add `node-html-parser` to devDependencies)

**Interfaces:**
- Consumes: `Block`, `Inline`, `CalloutChild`, `LessonMetaRow`, `LessonKind` from `@/lib/content/blocks`.
- Produces: `parseLessonHtml(html: string, ctx: { sectionId: string; monthId: string | null }): { meta: LessonMetaRow; blocks: Block[] }` — **throws** `Error` on any unrecognised element, an untagged callout, an odd kv cell count, or a missing hero.

- [ ] **Step 1: Add the parser dependency**

```bash
pnpm add -D node-html-parser
```

`node-html-parser` is dependency-free and only ever runs at import time (a dev script and a unit test), so it never reaches the client bundle.

- [ ] **Step 2: Write the failing test**

```ts
// tests/unit/parse-html.test.ts
import { describe, it, expect } from "vitest";
import { parseLessonHtml } from "@/lib/content/parse-html";

const CTX = { sectionId: "s1", monthId: "m4" };

function wrap(body: string, attrs = 'id="m4-03" data-title="Orderblocks" data-month="m4"') {
  return `<section class="lesson" ${attrs}>
  <div class="lesson-hero">
    <div class="crumb">Month 4 · Lesson 3</div>
    <h2>Orderblocks</h2>
    <div class="desc">One-line summary.</div>
  </div>
${body}
  <div class="quiz" data-quiz="m4-03"></div>
  <div class="lesson-footer"></div>
</section>`;
}

describe("meta", () => {
  it("reads the hero and the section attributes", () => {
    const { meta } = parseLessonHtml(wrap("  <p>Body.</p>"), CTX);
    expect(meta).toMatchObject({
      id: "m4-03",
      kind: "lesson",
      sectionId: "s1",
      monthId: "m4",
      title: "Orderblocks",
      heading: "Orderblocks",
      crumb: "Month 4 · Lesson 3",
    });
    expect(meta.desc).toEqual([{ t: "text", v: "One-line summary." }]);
  });

  it("keeps title and heading apart when they differ", () => {
    const html = wrap("  <p>x</p>", 'id="m2-07" data-title="Market Maker Trap: False Flag" data-month="m2"')
      .replace("<h2>Orderblocks</h2>", "<h2>Market Maker Trap — False Flag</h2>");
    const { meta } = parseLessonHtml(html, { sectionId: "s1", monthId: "m2" });
    expect(meta.title).toBe("Market Maker Trap: False Flag");
    expect(meta.heading).toBe("Market Maker Trap — False Flag");
  });

  it("keeps markup in a rich desc", () => {
    const html = wrap("  <p>x</p>").replace(
      '<div class="desc">One-line summary.</div>',
      '<div class="desc">A long taken <em>against</em> the bias.</div>',
    );
    expect(parseLessonHtml(html, CTX).meta.desc).toEqual([
      { t: "text", v: "A long taken " },
      { t: "em", c: [{ t: "text", v: "against" }] },
      { t: "text", v: " the bias." },
    ]);
  });

  it("reads data-kind and data-section on a review page", () => {
    const html = `<section class="lesson" id="s1-review" data-kind="review" data-section="s1" data-title="Section Summary">
  <div class="lesson-hero"><div class="crumb">ICT Core · Section Review</div><h2>ICT Core — Section Summary</h2><div class="desc">d</div></div>
  <p>x</p>
  <div class="review-footer"></div>
</section>`;
    const { meta } = parseLessonHtml(html, { sectionId: "s1", monthId: null });
    expect(meta).toMatchObject({ id: "s1-review", kind: "review", monthId: null });
  });
});

describe("blocks", () => {
  it("parses inline marks, including nesting and br", () => {
    const { blocks } = parseLessonHtml(
      wrap("  <p>a <strong>b <em>c</em></strong><br>d</p>"),
      CTX,
    );
    expect(blocks).toEqual([
      {
        t: "p",
        c: [
          { t: "text", v: "a " },
          { t: "strong", c: [{ t: "text", v: "b " }, { t: "em", c: [{ t: "text", v: "c" }] }] },
          { t: "br" },
          { t: "text", v: "d" },
        ],
      },
    ]);
  });

  it("decodes entities into text", () => {
    const { blocks } = parseLessonHtml(wrap("  <h3>Definition &amp; Validation</h3>"), CTX);
    expect(blocks).toEqual([{ t: "h3", c: [{ t: "text", v: "Definition & Validation" }] }]);
  });

  it("parses h4 with its src pointer", () => {
    const { blocks } = parseLessonHtml(
      wrap('  <h4>The daily template <span class="src">(L2)</span></h4>'),
      CTX,
    );
    expect(blocks).toEqual([
      {
        t: "h4",
        c: [{ t: "text", v: "The daily template " }, { t: "src", c: [{ t: "text", v: "(L2)" }] }],
      },
    ]);
  });

  it("parses all three callout variants and requires a tag", () => {
    const { blocks } = parseLessonHtml(
      wrap('  <div class="callout warn"><span class="tag">Bearish OBs</span>Body <strong>x</strong>.</div>'),
      CTX,
    );
    expect(blocks).toEqual([
      {
        t: "callout",
        variant: "warn",
        tag: [{ t: "text", v: "Bearish OBs" }],
        c: [{ t: "run", c: [{ t: "text", v: "Body " }, { t: "strong", c: [{ t: "text", v: "x" }] }, { t: "text", v: "." }] }],
      },
    ]);
    expect(() => parseLessonHtml(wrap('  <div class="callout">No tag.</div>'), CTX)).toThrow(/no <span class="tag">/);
  });

  it("parses a callout that interleaves a list", () => {
    const { blocks } = parseLessonHtml(
      wrap('  <div class="callout rule"><span class="tag">Rule</span>Lead-in:<ul><li>one</li></ul>tail</div>'),
      CTX,
    );
    expect(blocks[0]).toMatchObject({
      t: "callout",
      variant: "rule",
      c: [
        { t: "run", c: [{ t: "text", v: "Lead-in:" }] },
        { t: "list", ordered: false, items: [[{ t: "text", v: "one" }]] },
        { t: "run", c: [{ t: "text", v: "tail" }] },
      ],
    });
  });

  it("parses both kv dialects into the same rows", () => {
    const flat = parseLessonHtml(
      wrap('  <div class="kv"><div>Term</div><div>Def</div><div>T2</div><div>D2</div></div>'),
      CTX,
    ).blocks[0];
    const wrapped = parseLessonHtml(
      wrap('  <div class="kv"><div><b>Term</b><span>Def</span></div><div><span>T2</span><span>D2</span></div></div>'),
      CTX,
    ).blocks[0];
    const expected = {
      t: "kv",
      rows: [
        { k: [{ t: "text", v: "Term" }], v: [{ t: "text", v: "Def" }] },
        { k: [{ t: "text", v: "T2" }], v: [{ t: "text", v: "D2" }] },
      ],
    };
    expect(flat).toEqual(expected);
    expect(wrapped).toEqual(expected);
  });

  it("throws on an odd number of flat kv cells", () => {
    expect(() =>
      parseLessonHtml(wrap('  <div class="kv"><div>a</div><div>b</div><div>c</div></div>'), CTX),
    ).toThrow(/odd number of cells/);
  });

  it("parses both flip dialects into the same cards", () => {
    const a = parseLessonHtml(
      wrap('  <div class="flip-row"><div class="flip"><div class="flip-in"><div class="flip-face flip-front">F</div><div class="flip-face flip-back">B</div></div></div></div>'),
      CTX,
    ).blocks[0];
    const b = parseLessonHtml(
      wrap('  <div class="flip-row"><div class="flip"><div class="flip-inner"><div class="flip-front">F</div><div class="flip-back">B</div></div></div></div>'),
      CTX,
    ).blocks[0];
    const expected = { t: "flipRow", cards: [{ front: [{ t: "text", v: "F" }], back: [{ t: "text", v: "B" }] }] };
    expect(a).toEqual(expected);
    expect(b).toEqual(expected);
  });

  it("keeps a detached flip-hint as its own block", () => {
    const { blocks } = parseLessonHtml(
      wrap('  <div class="flip-row"><div class="flip"><div class="flip-inner"><div class="flip-front">F</div><div class="flip-back">B</div></div></div></div>\n  <p>between</p>\n  <div class="flip-hint">Click a card to flip it</div>'),
      CTX,
    );
    expect(blocks.map((b) => b.t)).toEqual(["flipRow", "p", "flipHint"]);
  });

  it("parses a fig-slot into a figures block", () => {
    const { blocks } = parseLessonHtml(
      wrap('  <div class="fig-slot" data-slug="m4-03-orderblocks"></div>'),
      CTX,
    );
    expect(blocks).toEqual([{ t: "figures", slug: "m4-03-orderblocks" }]);
  });

  it("drops the three render-time slots", () => {
    const { blocks } = parseLessonHtml(wrap("  <p>only</p>"), CTX);
    expect(blocks).toHaveLength(1);
  });

  it("throws on an unmapped element", () => {
    expect(() => parseLessonHtml(wrap("  <table><tr><td>x</td></tr></table>"), CTX)).toThrow(
      /unmapped element <table>/,
    );
  });

  it("throws on an unmapped div class", () => {
    expect(() => parseLessonHtml(wrap('  <div class="tip">x</div>'), CTX)).toThrow(
      /unmapped element <div class="tip">/,
    );
  });

  it("throws on an unmapped inline element", () => {
    expect(() => parseLessonHtml(wrap('  <p>see <a href="x">this</a></p>'), CTX)).toThrow(
      /unmapped inline <a>/,
    );
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

```bash
pnpm test:unit tests/unit/parse-html.test.ts
```

Expected: FAIL — cannot resolve `@/lib/content/parse-html`.

- [ ] **Step 4: Write `lib/content/parse-html.ts`**

```ts
import { parse, type HTMLElement, type Node } from "node-html-parser";
import type { Block, CalloutChild, Inline, LessonKind, LessonMetaRow } from "./blocks";

/** node-html-parser node type ids. */
const ELEMENT = 1;
const TEXT = 3;

const isElement = (n: Node): n is HTMLElement => n.nodeType === ELEMENT;
const isText = (n: Node): boolean => n.nodeType === TEXT;

function classesOf(el: HTMLElement): string[] {
  return (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

/** `div.callout.warn` — the shape used in every error message. */
function describe(el: HTMLElement): string {
  const cls = el.getAttribute("class");
  return cls ? `<${el.rawTagName} class="${cls}">` : `<${el.rawTagName}>`;
}

function bail(msg: string): never {
  throw new Error(`content parse error: ${msg}`);
}

// ---------------------------------------------------------------- inline

const INLINE_TAGS = new Set(["strong", "em", "b", "br", "span"]);

/**
 * Inline children → Inline[]. `b` normalises to `strong` (the corpus uses them
 * interchangeably); a bare `span` is transparent (it only ever wraps a kv cell);
 * `span.src` is a real node.
 */
function parseInlines(nodes: Node[], where: string): Inline[] {
  const out: Inline[] = [];
  for (const n of nodes) {
    if (isText(n)) {
      const v = n.text;
      if (v) out.push({ t: "text", v });
      continue;
    }
    if (!isElement(n)) continue;
    const tag = n.rawTagName?.toLowerCase();
    if (!tag || !INLINE_TAGS.has(tag)) bail(`${where}: unmapped inline <${tag ?? "?"}>`);
    switch (tag) {
      case "br":
        out.push({ t: "br" });
        break;
      case "strong":
      case "b":
        out.push({ t: "strong", c: parseInlines(n.childNodes, where) });
        break;
      case "em":
        out.push({ t: "em", c: parseInlines(n.childNodes, where) });
        break;
      case "span": {
        const cls = classesOf(n);
        if (cls.length === 0) out.push(...parseInlines(n.childNodes, where));
        else if (cls.length === 1 && cls[0] === "src")
          out.push({ t: "src", c: parseInlines(n.childNodes, where) });
        else bail(`${where}: unmapped inline ${describe(n)}`);
        break;
      }
    }
  }
  return mergeText(out);
}

/** Adjacent text nodes (produced by unwrapping a bare span) collapse into one. */
function mergeText(nodes: Inline[]): Inline[] {
  const out: Inline[] = [];
  for (const n of nodes) {
    const prev = out[out.length - 1];
    if (n.t === "text" && prev?.t === "text") prev.v += n.v;
    else out.push(n);
  }
  return out;
}

function parseList(el: HTMLElement, where: string): Extract<Block, { t: "list" }> {
  const items: Inline[][] = [];
  for (const child of el.childNodes) {
    if (isText(child)) {
      if (child.text.trim()) bail(`${where}: stray text inside <${el.rawTagName}>`);
      continue;
    }
    if (!isElement(child)) continue;
    if (child.rawTagName?.toLowerCase() !== "li") bail(`${where}: unmapped element ${describe(child)} in a list`);
    items.push(parseInlines(child.childNodes, `${where}/li`));
  }
  return { t: "list", ordered: el.rawTagName.toLowerCase() === "ol", items };
}

// ---------------------------------------------------------------- blocks

function parseCallout(el: HTMLElement, where: string): Block {
  const cls = classesOf(el).filter((c) => c !== "callout");
  const variant = cls.length === 0 ? "note" : cls[0];
  if (cls.length > 1 || (variant !== "note" && variant !== "rule" && variant !== "warn"))
    bail(`${where}: unmapped element ${describe(el)}`);

  const kids = [...el.childNodes];
  const first = kids.find((n) => isElement(n) || (isText(n) && n.text.trim()));
  if (!first || !isElement(first) || !classesOf(first).includes("tag"))
    bail(`${where}: callout has no <span class="tag"> label`);
  const tag = parseInlines(first.childNodes, `${where}/tag`);

  const rest = kids.slice(kids.indexOf(first) + 1);
  const c: CalloutChild[] = [];
  let run: Node[] = [];
  const flush = () => {
    if (!run.length) return;
    const inlines = parseInlines(run, `${where}/run`);
    if (inlines.length) c.push({ t: "run", c: inlines });
    run = [];
  };
  for (const n of rest) {
    const tagName = isElement(n) ? n.rawTagName?.toLowerCase() : null;
    if (tagName === "ul" || tagName === "ol") {
      flush();
      c.push(parseList(n as HTMLElement, where));
    } else {
      run.push(n);
    }
  }
  flush();
  return { t: "callout", variant, tag, c };
}

/**
 * `.kv` in either dialect. A row-wrapped cell pair is a div whose element
 * children are exactly two of {span, b} with no direct text; anything else is a
 * flat cell consumed in pairs.
 */
function parseKv(el: HTMLElement, where: string): Block {
  const cells: HTMLElement[] = [];
  const rows: { k: Inline[]; v: Inline[] }[] = [];

  for (const child of el.childNodes) {
    if (isText(child)) {
      if (child.text.trim()) bail(`${where}: stray text inside .kv`);
      continue;
    }
    if (!isElement(child)) continue;
    if (child.rawTagName?.toLowerCase() !== "div") bail(`${where}: unmapped element ${describe(child)} in .kv`);

    const elemKids = child.childNodes.filter(isElement);
    const wrapped =
      elemKids.length === 2 &&
      elemKids.every((k) => ["span", "b"].includes(k.rawTagName?.toLowerCase() ?? "") && classesOf(k).length === 0) &&
      !child.childNodes.some((k) => isText(k) && k.text.trim());

    if (wrapped) {
      if (cells.length) bail(`${where}: .kv mixes wrapped and flat rows`);
      rows.push({
        k: parseInlines(elemKids[0].childNodes, `${where}/k`),
        v: parseInlines(elemKids[1].childNodes, `${where}/v`),
      });
    } else {
      cells.push(child);
    }
  }

  if (cells.length) {
    if (rows.length) bail(`${where}: .kv mixes wrapped and flat rows`);
    if (cells.length % 2 !== 0) bail(`${where}: .kv has an odd number of cells (${cells.length})`);
    for (let i = 0; i < cells.length; i += 2)
      rows.push({
        k: parseInlines(cells[i].childNodes, `${where}/k`),
        v: parseInlines(cells[i + 1].childNodes, `${where}/v`),
      });
  }
  return { t: "kv", rows };
}

function parseFlipRow(el: HTMLElement, where: string): Block {
  const cards: { front: Inline[]; back: Inline[] }[] = [];
  for (const flip of el.childNodes.filter(isElement)) {
    if (!classesOf(flip).includes("flip")) bail(`${where}: unmapped element ${describe(flip)} in .flip-row`);
    const inner = flip.childNodes.filter(isElement)[0];
    const innerCls = inner ? classesOf(inner) : [];
    if (!inner || !(innerCls.includes("flip-in") || innerCls.includes("flip-inner")))
      bail(`${where}: .flip has no .flip-in/.flip-inner wrapper`);

    const faces = inner.childNodes.filter(isElement);
    const front = faces.find((f) => classesOf(f).includes("flip-front"));
    const back = faces.find((f) => classesOf(f).includes("flip-back"));
    if (faces.length !== 2 || !front || !back) bail(`${where}: .flip needs exactly a front and a back face`);
    cards.push({
      front: parseInlines(front.childNodes, `${where}/front`),
      back: parseInlines(back.childNodes, `${where}/back`),
    });
  }
  if (!cards.length) bail(`${where}: .flip-row has no cards`);
  return { t: "flipRow", cards };
}

/** Slots the renderer supplies; they carry no content and are dropped. */
const DROPPED_CLASSES = new Set(["quiz", "lesson-footer", "review-footer"]);

function parseBlock(el: HTMLElement, where: string): Block | null {
  const tag = el.rawTagName?.toLowerCase();
  switch (tag) {
    case "h3":
    case "h4":
    case "p":
      return { t: tag, c: parseInlines(el.childNodes, `${where}/${tag}`) } as Block;
    case "ul":
    case "ol":
      return parseList(el, where);
    case "div": {
      const cls = classesOf(el);
      if (cls.length === 1 && DROPPED_CLASSES.has(cls[0])) return null;
      if (cls.includes("callout")) return parseCallout(el, where);
      if (cls.length === 1 && cls[0] === "kv") return parseKv(el, where);
      if (cls.length === 1 && cls[0] === "flip-row") return parseFlipRow(el, where);
      if (cls.length === 1 && cls[0] === "flip-hint") return { t: "flipHint", v: el.text.trim() };
      if (cls.length === 1 && cls[0] === "fig-slot") {
        const slug = el.getAttribute("data-slug");
        if (!slug) bail(`${where}: .fig-slot has no data-slug`);
        return { t: "figures", slug };
      }
      return bail(`${where}: unmapped element ${describe(el)}`);
    }
    default:
      return bail(`${where}: unmapped element ${describe(el)}`);
  }
}

// ---------------------------------------------------------------- entry

export function parseLessonHtml(
  html: string,
  ctx: { sectionId: string; monthId: string | null },
): { meta: LessonMetaRow; blocks: Block[] } {
  const root = parse(html);
  const section = root.querySelector("section.lesson");
  if (!section) bail("no <section class=\"lesson\"> found");

  const id = section.getAttribute("id");
  const title = section.getAttribute("data-title");
  if (!id) bail("<section> has no id");
  if (!title) bail(`${id}: <section> has no data-title`);

  const kindAttr = section.getAttribute("data-kind") ?? "lesson";
  if (kindAttr !== "lesson" && kindAttr !== "review" && kindAttr !== "exam")
    bail(`${id}: unknown data-kind "${kindAttr}"`);
  const kind = kindAttr as LessonKind;

  const hero = section.querySelector(".lesson-hero");
  if (!hero) bail(`${id}: no .lesson-hero`);
  const crumbEl = hero.querySelector(".crumb");
  const h2 = hero.querySelector("h2");
  const descEl = hero.querySelector(".desc");
  if (!crumbEl || !h2 || !descEl) bail(`${id}: .lesson-hero needs .crumb, <h2> and .desc`);

  const blocks: Block[] = [];
  for (const child of section.childNodes) {
    if (isText(child)) {
      if (child.text.trim()) bail(`${id}: stray text at the top level of the section`);
      continue;
    }
    if (!isElement(child)) continue;
    if (classesOf(child).includes("lesson-hero")) continue;
    const b = parseBlock(child, id);
    if (b) blocks.push(b);
  }

  return {
    meta: {
      id,
      kind,
      sectionId: section.getAttribute("data-section") ?? ctx.sectionId,
      monthId: kind === "lesson" ? (section.getAttribute("data-month") ?? ctx.monthId) : null,
      title,
      heading: h2.text.trim(),
      crumb: crumbEl.text.trim(),
      desc: parseInlines(descEl.childNodes, `${id}/desc`),
      slug: "",
    },
    blocks,
  };
}
```

`meta.slug` is left empty here: the slug is a property of the *folder + fig-slot*, not the HTML, and the importer fills it in Task 11 (it reads the `figures` block's slug, falling back to `{id}-{kebab(title)}`).

- [ ] **Step 5: Run the test**

```bash
pnpm test:unit tests/unit/parse-html.test.ts
```

Expected: PASS, all 18 tests. Fix the implementation, not the tests, unless a test encodes something the survey contradicts.

- [ ] **Step 6: Stage**

```bash
git add lib/content/parse-html.ts tests/unit/parse-html.test.ts package.json pnpm-lock.yaml
```

---

### Task 7: The blocks → HTML exporter

**Files:**
- Create: `lib/content/export-html.ts`
- Test: `tests/unit/export-html.test.ts`

**Interfaces:**
- Consumes: `Block`, `Inline`, `LessonMetaRow` from `@/lib/content/blocks`.
- Produces: `exportLessonHtml(meta: LessonMetaRow, blocks: Block[]): string` — emits the **canonical dialect**: `b` never appears (always `strong`), kv rows are always flat cells, flips are always `.flip-inner` + bare `.flip-front`/`.flip-back`, and the three render-time slots are re-emitted so the output is a complete `section.lesson`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/export-html.test.ts
import { describe, it, expect } from "vitest";
import { exportLessonHtml } from "@/lib/content/export-html";
import { parseLessonHtml } from "@/lib/content/parse-html";
import type { Block, LessonMetaRow } from "@/lib/content/blocks";

const META: LessonMetaRow = {
  id: "m4-03",
  kind: "lesson",
  sectionId: "s1",
  monthId: "m4",
  title: "Orderblocks",
  heading: "Orderblocks",
  crumb: "Month 4 · Lesson 3",
  desc: [{ t: "text", v: "One-line summary." }],
  slug: "m4-03-orderblocks",
};

function out(blocks: Block[], meta = META) {
  return exportLessonHtml(meta, blocks);
}

describe("exportLessonHtml", () => {
  it("emits the section, hero and the two render-time slots", () => {
    const html = out([{ t: "p", c: [{ t: "text", v: "Body." }] }]);
    expect(html).toContain('<section class="lesson" id="m4-03" data-title="Orderblocks" data-month="m4">');
    expect(html).toContain('<div class="crumb">Month 4 · Lesson 3</div>');
    expect(html).toContain("<h2>Orderblocks</h2>");
    expect(html).toContain('<div class="desc">One-line summary.</div>');
    expect(html).toContain('<div class="quiz" data-quiz="m4-03"></div>');
    expect(html).toContain('<div class="lesson-footer"></div>');
  });

  it("emits a review section with data-kind and the review footer", () => {
    const html = out([{ t: "p", c: [{ t: "text", v: "x" }] }], {
      ...META,
      id: "s1-review",
      kind: "review",
      monthId: null,
      title: "Section Summary",
      heading: "ICT Core — Section Summary",
    });
    expect(html).toContain('<section class="lesson" id="s1-review" data-kind="review" data-section="s1" data-title="Section Summary">');
    expect(html).toContain('<div class="review-footer"></div>');
    expect(html).not.toContain('class="quiz"');
    expect(html).not.toContain("data-month");
  });

  it("escapes only &, < and >", () => {
    const html = out([{ t: "h3", c: [{ t: "text", v: "Definition & Validation <x>" }] }]);
    expect(html).toContain("<h3>Definition &amp; Validation &lt;x&gt;</h3>");
    // Typographic characters stay literal.
    expect(out([{ t: "p", c: [{ t: "text", v: "2–3× · “q”" }] }])).toContain("2–3× · “q”");
  });

  it("emits inline marks, including br and the src pointer", () => {
    expect(
      out([{ t: "p", c: [{ t: "strong", c: [{ t: "em", c: [{ t: "text", v: "a" }] }] }, { t: "br" }, { t: "src", c: [{ t: "text", v: "(L2)" }] }] }]),
    ).toContain('<p><strong><em>a</em></strong><br><span class="src">(L2)</span></p>');
  });

  it("emits a callout with its tag and an interleaved list", () => {
    expect(
      out([
        {
          t: "callout",
          variant: "rule",
          tag: [{ t: "text", v: "Rule" }],
          c: [
            { t: "run", c: [{ t: "text", v: "Lead-in:" }] },
            { t: "list", ordered: false, items: [[{ t: "text", v: "one" }]] },
          ],
        },
      ]),
    ).toContain('<div class="callout rule"><span class="tag">Rule</span>Lead-in:<ul><li>one</li></ul></div>');
  });

  it("emits a note callout with no variant class", () => {
    expect(out([{ t: "callout", variant: "note", tag: [{ t: "text", v: "T" }], c: [] }])).toContain(
      '<div class="callout"><span class="tag">T</span></div>',
    );
  });

  it("emits kv as flat cells", () => {
    expect(
      out([{ t: "kv", rows: [{ k: [{ t: "text", v: "Macro" }], v: [{ t: "text", v: "d" }] }] }]),
    ).toContain('<div class="kv"><div>Macro</div><div>d</div></div>');
  });

  it("emits flips in the flip-inner dialect", () => {
    expect(out([{ t: "flipRow", cards: [{ front: [{ t: "text", v: "F" }], back: [{ t: "text", v: "B" }] }] }])).toContain(
      '<div class="flip-row"><div class="flip"><div class="flip-inner"><div class="flip-front">F</div><div class="flip-back">B</div></div></div></div>',
    );
  });

  it("emits flipHint and figures", () => {
    const html = out([{ t: "flipHint", v: "Click a card to flip it" }, { t: "figures", slug: "m4-03-orderblocks" }]);
    expect(html).toContain('<div class="flip-hint">Click a card to flip it</div>');
    expect(html).toContain('<div class="fig-slot" data-slug="m4-03-orderblocks"></div>');
  });

  it("round-trips its own output through the parser", () => {
    const blocks: Block[] = [
      { t: "h3", c: [{ t: "text", v: "Definition & Validation" }] },
      { t: "p", c: [{ t: "text", v: "a " }, { t: "strong", c: [{ t: "text", v: "b" }] }] },
      { t: "list", ordered: true, items: [[{ t: "text", v: "one" }], [{ t: "text", v: "two" }]] },
      { t: "callout", variant: "warn", tag: [{ t: "text", v: "T" }], c: [{ t: "run", c: [{ t: "text", v: "x" }] }] },
      { t: "kv", rows: [{ k: [{ t: "text", v: "K" }], v: [{ t: "text", v: "V" }] }] },
      { t: "flipRow", cards: [{ front: [{ t: "text", v: "F" }], back: [{ t: "text", v: "B" }] }] },
      { t: "figures", slug: "m4-03-orderblocks" },
    ];
    const again = parseLessonHtml(out(blocks), { sectionId: "s1", monthId: "m4" });
    expect(again.blocks).toEqual(blocks);
    expect(again.meta).toEqual({ ...META, slug: "" });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
pnpm test:unit tests/unit/export-html.test.ts
```

Expected: FAIL — cannot resolve `@/lib/content/export-html`.

- [ ] **Step 3: Write `lib/content/export-html.ts`**

```ts
import type { Block, CalloutChild, Inline, LessonMetaRow } from "./blocks";

/** Only the three characters that change meaning in HTML text. */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escAttr(s: string): string {
  return esc(s).replace(/"/g, "&quot;");
}

function inlines(nodes: Inline[]): string {
  return nodes
    .map((n) => {
      switch (n.t) {
        case "text":
          return esc(n.v);
        case "br":
          return "<br>";
        case "strong":
          return `<strong>${inlines(n.c)}</strong>`;
        case "em":
          return `<em>${inlines(n.c)}</em>`;
        case "src":
          return `<span class="src">${inlines(n.c)}</span>`;
      }
    })
    .join("");
}

function list(ordered: boolean, items: Inline[][]): string {
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${items.map((it) => `<li>${inlines(it)}</li>`).join("")}</${tag}>`;
}

function calloutChild(c: CalloutChild): string {
  return c.t === "run" ? inlines(c.c) : list(c.ordered, c.items);
}

function block(b: Block): string {
  switch (b.t) {
    case "h3":
      return `<h3>${inlines(b.c)}</h3>`;
    case "h4":
      return `<h4>${inlines(b.c)}</h4>`;
    case "p":
      return `<p>${inlines(b.c)}</p>`;
    case "list":
      return list(b.ordered, b.items);
    case "callout": {
      const cls = b.variant === "note" ? "callout" : `callout ${b.variant}`;
      return `<div class="${cls}"><span class="tag">${inlines(b.tag)}</span>${b.c.map(calloutChild).join("")}</div>`;
    }
    case "kv":
      return `<div class="kv">${b.rows
        .map((r) => `<div>${inlines(r.k)}</div><div>${inlines(r.v)}</div>`)
        .join("")}</div>`;
    case "flipRow":
      return `<div class="flip-row">${b.cards
        .map(
          (c) =>
            `<div class="flip"><div class="flip-inner"><div class="flip-front">${inlines(
              c.front,
            )}</div><div class="flip-back">${inlines(c.back)}</div></div></div>`,
        )
        .join("")}</div>`;
    case "flipHint":
      return `<div class="flip-hint">${esc(b.v)}</div>`;
    case "figures":
      return `<div class="fig-slot" data-slug="${escAttr(b.slug)}"></div>`;
  }
}

/**
 * Canonical HTML for a lesson body. Used by the round-trip fidelity gate and by
 * scripts/export-content.mjs; it is NOT what the site renders (that is
 * BlockRenderer). Indentation is cosmetic — the gate compares canonicalised
 * HTML, so whitespace between tags never matters.
 */
export function exportLessonHtml(meta: LessonMetaRow, blocks: Block[]): string {
  const attrs = [`class="lesson"`, `id="${escAttr(meta.id)}"`];
  if (meta.kind !== "lesson") {
    attrs.push(`data-kind="${meta.kind}"`, `data-section="${escAttr(meta.sectionId)}"`);
  }
  attrs.push(`data-title="${escAttr(meta.title)}"`);
  if (meta.kind === "lesson" && meta.monthId) attrs.push(`data-month="${escAttr(meta.monthId)}"`);

  const slots =
    meta.kind === "lesson"
      ? [`<div class="quiz" data-quiz="${escAttr(meta.id)}"></div>`, `<div class="lesson-footer"></div>`]
      : [`<div class="review-footer"></div>`];

  return [
    `<section ${attrs.join(" ")}>`,
    `  <div class="lesson-hero">`,
    `    <div class="crumb">${esc(meta.crumb)}</div>`,
    `    <h2>${esc(meta.heading)}</h2>`,
    `    <div class="desc">${inlines(meta.desc)}</div>`,
    `  </div>`,
    ...blocks.map((b) => `  ${block(b)}`),
    ...slots.map((s) => `  ${s}`),
    `</section>`,
    "",
  ].join("\n");
}
```

- [ ] **Step 4: Run the test**

```bash
pnpm test:unit tests/unit/export-html.test.ts
```

Expected: PASS, 10 tests.

- [ ] **Step 5: Stage**

```bash
git add lib/content/export-html.ts tests/unit/export-html.test.ts
```

---

### Task 8: The round-trip fidelity gate over all 80 files

This is **the acceptance test for the import**. It proves the parser loses nothing before a single row reaches Neon.

**Files:**
- Create: `lib/content/canonical.ts`, `scripts/export-content.mjs`
- Test: `tests/unit/roundtrip.test.ts`

**Interfaces:**
- Produces: `canonicalHtml(html: string): string`; `canonicalizeSource(html: string, counts: DialectCounts): string`; `type DialectCounts = { bCell: number; spanCell: number; kvWrappedRow: number; flipIn: number; flipFace: number }`.

**How the diff is made honest.** Two normalisations run on **both** sides, and four dialect rules run on the **source** side only. Every dialect rule is counted, and the test asserts the exact surveyed total — so a new dialect appearing in a future edit fails the gate instead of being silently absorbed.

| Normalisation (both sides) | Why |
|---|---|
| whitespace between tags dropped; runs of whitespace inside text collapsed to one space | source files are hand-indented; the exporter is not |
| entities decoded, then only `&`, `<`, `>` re-encoded | the source mixes `&amp;` and literal `&`; `·`/`–`/`→` must stay literal |

| Dialect rule (source side only) | Expected count |
|---|---|
| a `<b>` that *is* a whole kv cell → its inline content, wrapped in the cell `div` | **34** |
| a bare `<span>` that *is* a whole kv cell → its inline content, wrapped in the cell `div` | **46** |
| a row-wrapped kv row (`.kv > div > cell, cell`) → two flat cell `div`s | **40** |
| `.flip-in` → `.flip-inner` | **13** |
| `flip-face` class stripped from a flip face | **26** |

If any count differs from the table, **stop and report** — the corpus has changed since the survey and the parser may need a new branch.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/roundtrip.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseLessonHtml } from "@/lib/content/parse-html";
import { exportLessonHtml } from "@/lib/content/export-html";
import { canonicalHtml, canonicalizeSource, type DialectCounts } from "@/lib/content/canonical";

const CONTENT = join(process.cwd(), "content");

interface SourceFile {
  path: string;
  label: string;
  sectionId: string;
  monthId: string | null;
}

function sectionIdOf(dir: string): string {
  const src = readFileSync(join(CONTENT, dir, "section.js"), "utf8");
  const id = /id\s*:\s*"([^"]+)"/.exec(src);
  if (!id) throw new Error(`${dir}/section.js has no id`);
  return id[1];
}

function sourceFiles(): SourceFile[] {
  const out: SourceFile[] = [];
  for (const sec of readdirSync(CONTENT).filter((d) => statSync(join(CONTENT, d)).isDirectory())) {
    const sectionId = sectionIdOf(sec);
    for (const month of readdirSync(join(CONTENT, sec)).filter((d) =>
      statSync(join(CONTENT, sec, d)).isDirectory(),
    )) {
      for (const lesson of readdirSync(join(CONTENT, sec, month))) {
        const path = join(CONTENT, sec, month, lesson, "lesson.html");
        try {
          statSync(path);
        } catch {
          continue;
        }
        out.push({ path, label: lesson, sectionId, monthId: month });
      }
    }
    const summary = join(CONTENT, sec, "summary.html");
    try {
      statSync(summary);
      out.push({ path: summary, label: `${sectionId}-review`, sectionId, monthId: null });
    } catch {
      /* a section need not have a summary */
    }
  }
  return out;
}

const FILES = sourceFiles();

describe("round-trip fidelity", () => {
  it("finds all 80 source files", () => {
    expect(FILES.filter((f) => f.monthId !== null)).toHaveLength(78);
    expect(FILES.filter((f) => f.monthId === null)).toHaveLength(2);
  });

  const counts: DialectCounts = { bCell: 0, spanCell: 0, kvWrappedRow: 0, flipIn: 0, flipFace: 0 };

  for (const f of FILES) {
    it(`${f.label} survives blocks → HTML unchanged`, () => {
      const src = readFileSync(f.path, "utf8");
      const { meta, blocks } = parseLessonHtml(src, { sectionId: f.sectionId, monthId: f.monthId });
      const exported = exportLessonHtml(meta, blocks);
      expect(canonicalHtml(exported)).toBe(canonicalHtml(canonicalizeSource(src, counts)));
    });
  }

  it("applied exactly the surveyed number of dialect normalisations", () => {
    expect(counts).toEqual({ bCell: 34, spanCell: 46, kvWrappedRow: 40, flipIn: 13, flipFace: 26 });
  });
});
```

Vitest runs the `it()` bodies after all `describe()` callbacks, so `counts` is fully accumulated by the time the last assertion runs — provided the file order is stable, which `readdirSync` gives us. If the count assertion ever runs first, move it into an `afterAll`.

- [ ] **Step 2: Run it to verify it fails**

```bash
pnpm test:unit tests/unit/roundtrip.test.ts
```

Expected: FAIL — cannot resolve `@/lib/content/canonical`.

- [ ] **Step 3: Write `lib/content/canonical.ts`**

```ts
import { parse, type HTMLElement, type Node } from "node-html-parser";

const ELEMENT = 1;
const TEXT = 3;
const isElement = (n: Node): n is HTMLElement => n.nodeType === ELEMENT;
const isText = (n: Node): boolean => n.nodeType === TEXT;

export interface DialectCounts {
  bCell: number;
  spanCell: number;
  kvWrappedRow: number;
  flipIn: number;
  flipFace: number;
}

const VOID = new Set(["br"]);

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function classes(el: HTMLElement): string[] {
  return (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

/**
 * A stable serialisation that ignores everything the two sides are allowed to
 * disagree about: indentation, whitespace runs, attribute order, class order,
 * and entity spelling. node-html-parser decodes entities into `.text`, so
 * re-escaping here puts both sides in the same spelling.
 */
function serialize(node: Node): string {
  if (isText(node)) return esc(node.text.replace(/\s+/g, " "));
  if (!isElement(node)) return "";
  const el = node;
  const tag = el.rawTagName.toLowerCase();
  const attrs = Object.entries(el.attributes)
    .map(([k, v]) => [k, k === "class" ? v.split(/\s+/).filter(Boolean).sort().join(" ") : v] as const)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");
  if (VOID.has(tag)) return `<${tag}${attrs}>`;
  const inner = el.childNodes.map(serialize).join("");
  return `<${tag}${attrs}>${inner}</${tag}>`;
}

/** Drop whitespace-only text between elements, then trim the seams. */
function stripLayoutWhitespace(el: HTMLElement): void {
  for (const child of [...el.childNodes]) {
    if (isText(child) && !child.text.trim()) child.remove();
    else if (isElement(child)) stripLayoutWhitespace(child);
  }
}

export function canonicalHtml(html: string): string {
  const root = parse(html);
  const section = root.querySelector("section.lesson");
  if (!section) throw new Error("canonicalHtml: no section.lesson");
  stripLayoutWhitespace(section);
  return serialize(section);
}

/**
 * Rewrites the four authoring dialects the corpus contains into the single
 * dialect the exporter emits, counting each rewrite. See the plan's dialect
 * table for the expected totals.
 */
export function canonicalizeSource(html: string, counts: DialectCounts): string {
  const root = parse(html);
  const section = root.querySelector("section.lesson");
  if (!section) throw new Error("canonicalizeSource: no section.lesson");

  // --- kv: unwrap cell-level <b>/<span>, flatten row-wrapped rows ----------
  for (const kv of section.querySelectorAll(".kv")) {
    for (const row of kv.childNodes.filter(isElement)) {
      const cells = row.childNodes.filter(isElement);
      const isCell = (c: HTMLElement) =>
        ["span", "b"].includes(c.rawTagName.toLowerCase()) && classes(c).length === 0;
      const wrapped =
        cells.length === 2 &&
        cells.every(isCell) &&
        !row.childNodes.some((n) => isText(n) && n.text.trim());
      if (!wrapped) continue;

      counts.kvWrappedRow += 1;
      for (const c of cells) {
        if (c.rawTagName.toLowerCase() === "b") counts.bCell += 1;
        else counts.spanCell += 1;
      }
      row.replaceWith(cells.map((c) => `<div>${c.innerHTML}</div>`).join(""));
    }
  }

  // --- flips: .flip-in → .flip-inner, drop the flip-face class -------------
  for (const inner of section.querySelectorAll(".flip-in")) {
    counts.flipIn += 1;
    inner.setAttribute("class", "flip-inner");
  }
  for (const face of section.querySelectorAll(".flip-face")) {
    counts.flipFace += 1;
    face.setAttribute("class", classes(face).filter((c) => c !== "flip-face").join(" "));
  }

  stripLayoutWhitespace(section);
  return serialize(section);
}
```

`canonicalizeSource` returns an already-serialised string, so the test's `canonicalHtml(canonicalizeSource(...))` would double-parse. Make `canonicalHtml` idempotent by construction (parsing a canonical string and re-serialising it yields the same string) — verify that with the extra test in Step 4 rather than assuming it.

- [ ] **Step 4: Add the idempotence test to `tests/unit/roundtrip.test.ts`**

```ts
it("canonicalHtml is idempotent", () => {
  const src = readFileSync(FILES[0].path, "utf8");
  const once = canonicalHtml(src);
  expect(canonicalHtml(once)).toBe(once);
});
```

- [ ] **Step 5: Run the gate**

```bash
pnpm test:unit tests/unit/roundtrip.test.ts
```

Expected: PASS — 78 + 2 file assertions, plus the count assertion equalling `{ bCell: 34, spanCell: 46, kvWrappedRow: 40, flipIn: 13, flipFace: 26 }`.

When a file fails, print both sides to see the drift:

```bash
node --experimental-strip-types -e "
const {readFileSync}=await import('node:fs');
const {parseLessonHtml}=await import('./lib/content/parse-html.ts');
const {exportLessonHtml}=await import('./lib/content/export-html.ts');
const {canonicalHtml,canonicalizeSource}=await import('./lib/content/canonical.ts');
const p='content/s1-ict-core/m4/m4-03/lesson.html';
const src=readFileSync(p,'utf8');
const {meta,blocks}=parseLessonHtml(src,{sectionId:'s1',monthId:'m4'});
const a=canonicalHtml(canonicalizeSource(src,{bCell:0,spanCell:0,kvWrappedRow:0,flipIn:0,flipFace:0}));
const b=canonicalHtml(exportLessonHtml(meta,blocks));
for(let i=0;i<Math.max(a.length,b.length);i++){if(a[i]!==b[i]){console.log('diverges at',i);console.log('src:',a.slice(i-120,i+200));console.log('out:',b.slice(i-120,i+200));break}}
"
```

If TS-in-node is awkward, add the same diff as a temporary `it.only` in the test file instead — do not add a permanent debug script to the repo.

**Do not soften the gate to make it pass.** A failure means the parser or exporter is wrong, or the corpus contains a dialect the survey missed (in which case add a parser branch, an exporter branch, and a counted dialect rule — all three).

- [ ] **Step 6: Write `scripts/export-content.mjs`**

A thin CLI over the same functions, for eyeballing one lesson:

```js
// scripts/export-content.mjs
// Usage: node scripts/export-content.mjs content/s1-ict-core/m4/m4-03/lesson.html
import { readFileSync } from "node:fs";
import { parseLessonHtml } from "../lib/content/parse-html.ts";
import { exportLessonHtml } from "../lib/content/export-html.ts";

const [path] = process.argv.slice(2);
if (!path) {
  console.error("usage: node scripts/export-content.mjs <path/to/lesson.html>");
  process.exit(1);
}
const m = /content[\\/]([^\\/]+)[\\/]([^\\/]+)[\\/]/.exec(path);
const { meta, blocks } = parseLessonHtml(readFileSync(path, "utf8"), {
  sectionId: m?.[1] ?? "s?",
  monthId: /summary\.html$/.test(path) ? null : (m?.[2] ?? null),
});
process.stdout.write(exportLessonHtml(meta, blocks));
```

Run it with Node's type stripping: `node --experimental-strip-types scripts/export-content.mjs <path>`. If Node 24 refuses the `.ts` imports, note it and drop this script — the vitest gate is the real deliverable and this is only a convenience.

- [ ] **Step 7: Stage**

```bash
git add lib/content/canonical.ts scripts/export-content.mjs tests/unit/roundtrip.test.ts
```

---

### Task 9: Tolerant readers for the meta and quiz literals

`section.js` and `months.js` hold bare `{…}` object literals; `quiz.js` and `exam.js` hold bare array literals. A JS formatter reads the former as *block statements* and inserts a `;` before the `}`, and appends a `;` after the latter (CLAUDE.md §3). `build.py` defends against both with `parse_objs` and `js_literal`; the importer needs the same tolerance. **Never `eval`, never `JSON.parse`.**

**Files:**
- Create: `lib/content/parse-meta.ts`
- Test: `tests/unit/parse-meta.test.ts`

**Interfaces:**
- Produces: `parseObjs(text: string): Record<string, string>[]`; `parseQuiz(text: string): QuizRow[]` where `QuizRow = { q: string; o: string[]; a: number; e: string }` — throws on a malformed question, an `a` out of range, or an option count other than 4.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/parse-meta.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseObjs, parseQuiz } from "@/lib/content/parse-meta";

describe("parseObjs", () => {
  it("reads the string fields of every object literal", () => {
    expect(parseObjs(`{ id:"s1", short:"ICT Core", title:"T", desc:"D" }`)).toEqual([
      { id: "s1", short: "ICT Core", title: "T", desc: "D" },
    ]);
  });

  it("survives a formatter turning the literal into a block statement", () => {
    expect(parseObjs(`{\n  id: "s2",\n  label: "Part",\n};\n`)).toEqual([{ id: "s2", label: "Part" }]);
  });

  it("reads many objects, in order", () => {
    expect(parseObjs(`{id:"m1",title:"A"}\n{id:"m2",title:"B"}`).map((o) => o.id)).toEqual(["m1", "m2"]);
  });

  it("reads the real section.js and months.js", () => {
    const s = parseObjs(readFileSync("content/s1-ict-core/section.js", "utf8"));
    expect(s[0].id).toBe("s1");
    expect(parseObjs(readFileSync("content/s1-ict-core/months.js", "utf8"))).toHaveLength(4);
    expect(parseObjs(readFileSync("content/s2-2022-mentorship/months.js", "utf8"))).toHaveLength(6);
    expect(parseObjs(readFileSync("content/s2-2022-mentorship/section.js", "utf8"))[0].label).toBe("Part");
  });
});

describe("parseQuiz", () => {
  it("reads a question array", () => {
    expect(
      parseQuiz(`[
  { q:"why?", o:["a","b","c","d"], a:1, e:"because" }
]`),
    ).toEqual([{ q: "why?", o: ["a", "b", "c", "d"], a: 1, e: "because" }]);
  });

  it("tolerates a formatter-appended semicolon", () => {
    expect(parseQuiz(`[{ q:"q", o:["a","b","c","d"], a:0, e:"e" }];\n`)).toHaveLength(1);
  });

  it("keeps escaped quotes and apostrophes intact", () => {
    const [row] = parseQuiz(`[{ q:"ICT\\"s point", o:["a","b","c","d"], a:0, e:"it's fine" }]`);
    expect(row.q).toBe('ICT"s point');
    expect(row.e).toBe("it's fine");
  });

  it("throws when a question has the wrong number of options", () => {
    expect(() => parseQuiz(`[{ q:"q", o:["a","b"], a:0, e:"e" }]`)).toThrow(/4 options/);
  });

  it("throws when the answer index is out of range", () => {
    expect(() => parseQuiz(`[{ q:"q", o:["a","b","c","d"], a:4, e:"e" }]`)).toThrow(/answer index/);
  });

  it("reads every real quiz.js and exam.js without throwing", () => {
    // Surveyed counts. Note CLAUDE.md §7 still says the s2 exam has 40
    // questions; the file actually holds 43, so trust the file.
    expect(parseQuiz(readFileSync("content/s1-ict-core/exam.js", "utf8"))).toHaveLength(45);
    expect(parseQuiz(readFileSync("content/s2-2022-mentorship/exam.js", "utf8"))).toHaveLength(43);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
pnpm test:unit tests/unit/parse-meta.test.ts
```

Expected: FAIL — cannot resolve `@/lib/content/parse-meta`.

- [ ] **Step 3: Write `lib/content/parse-meta.ts`**

```ts
/**
 * Tolerant readers for the bare-literal content meta files. Mirrors build.py's
 * parse_objs / js_literal: a JS formatter mangles these files by design
 * (CLAUDE.md §3), so we pull the fields out rather than trusting the syntax.
 * Never eval, never JSON.parse.
 */

export interface QuizRow {
  q: string;
  o: string[];
  a: number;
  e: string;
}

/** A double-quoted JS string, honouring backslash escapes. */
const STR = String.raw`"((?:[^"\\]|\\.)*)"`;

function unescape(s: string): string {
  return s.replace(/\\(["\\/nrt])/g, (_, c: string) =>
    c === "n" ? "\n" : c === "r" ? "\r" : c === "t" ? "\t" : c,
  );
}

/** Every `{…}` of `key:"value"` pairs, in source order. */
export function parseObjs(text: string): Record<string, string>[] {
  const out: Record<string, string>[] = [];
  for (const objMatch of text.matchAll(/\{[^{}]*\}/g)) {
    const fields: Record<string, string> = {};
    for (const f of objMatch[0].matchAll(new RegExp(String.raw`(\w+)\s*:\s*${STR}`, "g"))) {
      fields[f[1]] = unescape(f[2]);
    }
    if (Object.keys(fields).length) out.push(fields);
  }
  return out;
}

/**
 * A quiz/exam array literal. Objects are matched one at a time so a stray
 * bracket or trailing semicolon cannot shift the parse.
 */
export function parseQuiz(text: string): QuizRow[] {
  const body = text.trim().replace(/[;\s]+$/, "");
  if (!body.startsWith("[")) throw new Error("quiz literal must start with [");

  const rows: QuizRow[] = [];
  const objRe = /\{(?:[^{}[\]]|\[(?:[^[\]]*)\])*\}/g;
  for (const m of body.matchAll(objRe)) {
    const src = m[0];
    const q = new RegExp(String.raw`\bq\s*:\s*${STR}`).exec(src);
    const e = new RegExp(String.raw`\be\s*:\s*${STR}`).exec(src);
    const a = /\ba\s*:\s*(\d+)/.exec(src);
    const oBlock = /\bo\s*:\s*\[([\s\S]*?)\]/.exec(src);
    if (!q || !e || !a || !oBlock) throw new Error(`quiz question is missing q/o/a/e: ${src.slice(0, 90)}…`);

    const o = [...oBlock[1].matchAll(new RegExp(STR, "g"))].map((s) => unescape(s[1]));
    if (o.length !== 4) throw new Error(`quiz question must have 4 options, found ${o.length}: ${unescape(q[1])}`);
    const answer = Number(a[1]);
    if (answer < 0 || answer > 3) throw new Error(`quiz answer index ${answer} out of range: ${unescape(q[1])}`);

    rows.push({ q: unescape(q[1]), o, a: answer, e: unescape(e[1]) });
  }
  if (!rows.length) throw new Error("quiz literal contains no questions");
  return rows;
}
```

- [ ] **Step 4: Run the test**

```bash
pnpm test:unit tests/unit/parse-meta.test.ts
```

Expected: PASS, 10 tests. If the escaped-quote test fails, the `STR` pattern or `unescape` is wrong — the corpus does contain `\"` inside quiz text, so this must work.

- [ ] **Step 5: Sanity-check every quiz file at once**

```bash
node --experimental-strip-types -e "
const {readdirSync,readFileSync,statSync}=await import('node:fs');
const {join}=await import('node:path');
const {parseQuiz}=await import('./lib/content/parse-meta.ts');
let n=0,q=0;
const walk=(d)=>{for(const e of readdirSync(d)){const p=join(d,e);if(statSync(p).isDirectory())walk(p);else if(e==='quiz.js'){n++;q+=parseQuiz(readFileSync(p,'utf8')).length}}};
walk('content');
console.log(n,'quiz files,',q,'questions');
"
```

Expected: `78 quiz files, 476 questions`. With the two exams (45 + 43) that is **564** rows in `quiz_questions` after Task 11's import.

- [ ] **Step 6: Stage**

```bash
git add lib/content/parse-meta.ts tests/unit/parse-meta.test.ts
```

---

### Task 10: The content schema

**Files:**
- Modify: `lib/db/schema.ts` (replace the placeholder)
- Create: `drizzle/0000_*.sql` (generated), `tests/unit/schema.test.ts`

**Interfaces:**
- Produces: tables `sections`, `months`, `lessons`, `quizQuestions`, `media`; types `LessonRow = typeof lessons.$inferSelect`, `SectionRow`, `MonthRow`, `QuizQuestionRow`, `MediaRow`.

Design notes that differ from a naïve reading of the spec, and why:

- **`lessons.section_id` is NOT NULL and `lessons.month_id` is nullable.** Reviews and exams belong to a section, not a month. Carrying `section_id` on every row also lets `canRead`'s section-scoped entitlement check read one column instead of joining through `months`.
- **`lessons.desc` is `jsonb`** holding `Inline[]` — one lesson's description contains an `<em>`, and a plain-text column would lose it. `inlineText()` flattens it for nav, cards and SEO.
- **`lessons.heading` is separate from `lessons.title`** — they differ in 6 of 80 files.
- **`media` lands now, unused,** so P2 adds no migration to the content tables. `variant_of` points a derivative at its original.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/schema.test.ts
import { describe, it, expect } from "vitest";
import { getTableColumns } from "drizzle-orm";
import { lessons, sections, months, quizQuestions, media } from "@/lib/db/schema";

describe("content schema", () => {
  it("keys lessons by text id and carries the gating columns", () => {
    const c = getTableColumns(lessons);
    expect(c.id.primary).toBe(true);
    expect(c.sectionId.notNull).toBe(true);
    expect(c.monthId.notNull).toBe(false);
    expect(c.access.notNull).toBe(true);
    expect(c.access.default).toBe("members"); // invariant 3: fail closed
    expect(c.status.default).toBe("draft");
    expect(c.kind.default).toBe("lesson");
  });

  it("exposes body and desc as jsonb", () => {
    const c = getTableColumns(lessons);
    expect(c.body.dataType).toBe("json");
    expect(c.desc.dataType).toBe("json");
  });

  it("gives quiz questions a uuid primary key", () => {
    const c = getTableColumns(quizQuestions);
    expect(c.id.primary).toBe(true);
    expect(c.id.columnType).toBe("PgUUID"); // invariant 4: results key on this
  });

  it("gives media a variant_of self-reference and intrinsic dimensions", () => {
    const c = getTableColumns(media);
    expect(c.variantOf.notNull).toBe(false);
    expect(c.width.notNull).toBe(true);
    expect(c.height.notNull).toBe(true);
  });

  it("orders sections and months explicitly", () => {
    expect(getTableColumns(sections).ord.notNull).toBe(true);
    expect(getTableColumns(months).ord.notNull).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
pnpm test:unit tests/unit/schema.test.ts
```

Expected: FAIL — `lessons` is not exported from the placeholder schema.

- [ ] **Step 3: Write `lib/db/schema.ts`**

```ts
import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  jsonb,
  index,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

/**
 * Users are managed by Neon Auth and live in the neon_auth schema. We reference
 * neon_auth."user".id as text and never write to that schema.
 */

// ------------------------------------------------------------------ content

export const sections = pgTable("sections", {
  id: text("id").primaryKey(),
  short: text("short").notNull(),
  title: text("title").notNull(),
  desc: text("desc").notNull().default(""),
  /** Names the middle tier on the home cards: "Month" (s1) | "Part" (s2). */
  label: text("label").notNull().default("Month"),
  ord: integer("ord").notNull(),
});

export const months = pgTable(
  "months",
  {
    id: text("id").primaryKey(),
    sectionId: text("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    desc: text("desc").notNull().default(""),
    ord: integer("ord").notNull(),
  },
  (t) => [index("months_section_ord_idx").on(t.sectionId, t.ord)],
);

export const lessons = pgTable(
  "lessons",
  {
    /** mX-NN for lessons, {sid}-review / {sid}-exam for the section pages. */
    id: text("id").primaryKey(),
    /** Always set — reviews and exams belong to a section but to no month. */
    sectionId: text("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    monthId: text("month_id").references(() => months.id, { onDelete: "cascade" }),
    /** m{month}-{NN}-{kebab-title}; also the chart filename stem. */
    slug: text("slug").notNull(),
    /** Nav/card/SEO title (the source's data-title). */
    title: text("title").notNull(),
    /** Hero <h2>. Differs from `title` in 6 of 80 source files. */
    heading: text("heading").notNull(),
    crumb: text("crumb").notNull(),
    /** Inline[] — one lesson's description contains an <em>. */
    desc: jsonb("desc").notNull().default([]),
    videoUrl: text("video_url"),
    ord: integer("ord").notNull(),
    /** 'lesson' | 'review' | 'exam' — reproduces the old data-kind. */
    kind: text("kind").notNull().default("lesson"),
    /** 'free' | 'members' | 'admin'. Defaults closed. */
    access: text("access").notNull().default("members"),
    /** 'draft' | 'published'. */
    status: text("status").notNull().default("draft"),
    /** Block[] — see lib/content/blocks.ts. */
    body: jsonb("body").notNull().default([]),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [
    index("lessons_section_ord_idx").on(t.sectionId, t.ord),
    index("lessons_month_ord_idx").on(t.monthId, t.ord),
    index("lessons_access_status_idx").on(t.access, t.status),
    uniqueIndex("lessons_slug_uq").on(t.slug),
  ],
);

export const quizQuestions = pgTable(
  "quiz_questions",
  {
    /** Stable uuid — quiz_results keys on this, never on an index. */
    id: uuid("id").defaultRandom().primaryKey(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    ord: integer("ord").notNull(),
    q: text("q").notNull(),
    /** string[4]. */
    options: jsonb("options").notNull(),
    /** 0-based index into options. */
    answer: integer("answer").notNull(),
    explanation: text("explanation").notNull(),
  },
  (t) => [uniqueIndex("quiz_questions_lesson_ord_uq").on(t.lessonId, t.ord)],
);

export const media = pgTable(
  "media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    /** 'image' | 'video' — the video seam, unused in project #1. */
    kind: text("kind").notNull().default("image"),
    ord: integer("ord").notNull(),
    /** Object key in the private R2 bucket. */
    storageKey: text("storage_key").notNull(),
    mime: text("mime").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    bytes: integer("bytes").notNull(),
    /** A webp/avif derivative points at its original here. */
    variantOf: uuid("variant_of").references((): AnyPgColumn => media.id, { onDelete: "cascade" }),
    alt: text("alt").notNull().default(""),
  },
  (t) => [
    index("media_lesson_ord_idx").on(t.lessonId, t.ord),
    index("media_variant_idx").on(t.variantOf),
    uniqueIndex("media_storage_key_uq").on(t.storageKey),
  ],
);

export const sectionsRelations = relations(sections, ({ many }) => ({
  months: many(months),
  lessons: many(lessons),
}));

export const monthsRelations = relations(months, ({ one, many }) => ({
  section: one(sections, { fields: [months.sectionId], references: [sections.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  section: one(sections, { fields: [lessons.sectionId], references: [sections.id] }),
  month: one(months, { fields: [lessons.monthId], references: [months.id] }),
  questions: many(quizQuestions),
  media: many(media),
}));

export type SectionRow = typeof sections.$inferSelect;
export type MonthRow = typeof months.$inferSelect;
export type LessonRow = typeof lessons.$inferSelect;
export type QuizQuestionRow = typeof quizQuestions.$inferSelect;
export type MediaRow = typeof media.$inferSelect;
```

- [ ] **Step 4: Run the test**

```bash
pnpm test:unit tests/unit/schema.test.ts
```

Expected: PASS, 5 tests. `getTableColumns` property names vary slightly between drizzle versions — if a `.default`/`.notNull` accessor is undefined, read the installed `drizzle-orm` types and assert on whatever the real property is, rather than deleting the assertion. The `access` default is invariant 3 and must be asserted somehow.

- [ ] **Step 5: Generate and apply the migration**

```bash
pnpm db:generate
node --env-file=.env.local ./node_modules/drizzle-kit/bin.cjs migrate
```

`drizzle.config.ts` was ported from the old branch — confirm it points `schema` at `./lib/db/schema.ts`, `out` at `./drizzle`, and reads `DATABASE_URL` from the environment. If `pnpm db:migrate` cannot see `.env.local`, use the `--env-file` form above.

- [ ] **Step 6: Verify the tables landed**

```bash
node --env-file=.env.local scripts/db-ping.mjs
```

Expected: `public: 5 table(s)`. Confirm the names with the Neon MCP `get_database_tables` as well — five in `public` (`sections`, `months`, `lessons`, `quiz_questions`, `media`) plus the regenerated `drizzle.__drizzle_migrations`.

- [ ] **Step 7: Stage**

```bash
git add lib/db/schema.ts drizzle tests/unit/schema.test.ts
```

---

### Task 11: The importer

**Files:**
- Create: `scripts/import-content.mjs`, `lib/content/import.ts`
- Test: `tests/unit/import.test.ts`

**Interfaces:**
- Consumes: `parseLessonHtml`, `parseObjs`, `parseQuiz`, `assertBlocks`, `inlineText`, the schema tables.
- Produces: `readContentTree(root: string): ImportPlan` (pure — reads the filesystem, writes nothing) where

```ts
interface ImportPlan {
  sections: { id: string; short: string; title: string; desc: string; label: string; ord: number }[];
  months: { id: string; sectionId: string; title: string; desc: string; ord: number }[];
  lessons: {
    id: string; sectionId: string; monthId: string | null; slug: string;
    title: string; heading: string; crumb: string; desc: Inline[];
    videoUrl: string | null; ord: number; kind: LessonKind;
    body: Block[];
    questions: { ord: number; q: string; options: string[]; answer: number; explanation: string }[];
  }[];
}
```

**Rules the importer enforces:**

- Every lesson row is written with `access: 'members'` and `status: 'published'`. Access is never inferred from anything in `content/` — invariant 3.
- Upserts are keyed by `id`, so re-running is idempotent. `quiz_questions` are **replaced** per lesson (delete-then-insert inside a transaction) because the source has no stable question ids; nothing keys on them yet in P1, and P4's `quiz_results` gains its foreign key only after import is stable.
- `--dry-run` prints the plan (counts, plus per-lesson block-type tallies) and writes nothing.
- The exam page's body is `[]` and its hero text is reproduced from `build.py:exam_page()` verbatim — that copy is existing project content, not new prose.
- Ordering: `sections.ord` by directory order; `months.ord` by directory order within a section; `lessons.ord` by folder name within a month; the review row gets `ord = 1000`, the exam row `ord = 1001`, so they sort last inside their section.
- `slug` comes from the lesson's first `figures` block when present, else `{id}-{kebab(title)}`. Both must agree when both exist — if the `figures` slug and the derived slug differ, that is fine (the source is authoritative), but two lessons resolving to the same slug is an error (there is a unique index).

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/import.test.ts
import { describe, it, expect } from "vitest";
import { readContentTree } from "@/lib/content/import";

const plan = readContentTree("content");

describe("readContentTree", () => {
  it("finds both sections with their label nouns", () => {
    expect(plan.sections.map((s) => s.id)).toEqual(["s1", "s2"]);
    expect(plan.sections.find((s) => s.id === "s1")?.label).toBe("Month");
    expect(plan.sections.find((s) => s.id === "s2")?.label).toBe("Part");
  });

  it("finds 10 months across the two sections", () => {
    expect(plan.months.filter((m) => m.sectionId === "s1")).toHaveLength(4);
    expect(plan.months.filter((m) => m.sectionId === "s2")).toHaveLength(6);
  });

  it("produces 78 lessons, 2 reviews and 2 exams", () => {
    const byKind = (k: string) => plan.lessons.filter((l) => l.kind === k);
    expect(byKind("lesson")).toHaveLength(78);
    expect(byKind("review")).toHaveLength(2);
    expect(byKind("exam")).toHaveLength(2);
  });

  it("attaches a month to lessons and none to reviews/exams", () => {
    expect(plan.lessons.filter((l) => l.kind === "lesson").every((l) => l.monthId !== null)).toBe(true);
    expect(plan.lessons.filter((l) => l.kind !== "lesson").every((l) => l.monthId === null)).toBe(true);
  });

  it("gives every lesson a unique non-empty slug", () => {
    const slugs = plan.lessons.filter((l) => l.kind === "lesson").map((l) => l.slug);
    expect(slugs.every(Boolean)).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("reads the video url where video.txt is non-empty", () => {
    const withVideo = plan.lessons.filter((l) => l.videoUrl);
    expect(withVideo.length).toBeGreaterThan(0);
    expect(withVideo.every((l) => l.videoUrl!.startsWith("http"))).toBe(true);
  });

  it("attaches quiz questions to lessons and exam questions to the exam rows", () => {
    expect(plan.lessons.filter((l) => l.kind === "lesson").every((l) => l.questions.length > 0)).toBe(true);
    const s2exam = plan.lessons.find((l) => l.id === "s2-exam");
    expect(s2exam?.questions).toHaveLength(43);
    expect(s2exam?.body).toEqual([]);
    expect(plan.lessons.reduce((n, l) => n + l.questions.length, 0)).toBe(564);
  });

  it("orders reviews and exams last within their section", () => {
    const s1 = plan.lessons.filter((l) => l.sectionId === "s1").sort((a, b) => a.ord - b.ord);
    expect(s1.at(-2)?.kind).toBe("review");
    expect(s1.at(-1)?.kind).toBe("exam");
  });

  it("produces bodies that pass the block validator", async () => {
    const { assertBlocks } = await import("@/lib/content/blocks");
    for (const l of plan.lessons) expect(() => assertBlocks(l.body)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
pnpm test:unit tests/unit/import.test.ts
```

Expected: FAIL — cannot resolve `@/lib/content/import`.

- [ ] **Step 3: Write `lib/content/import.ts`**

```ts
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseLessonHtml } from "./parse-html";
import { parseObjs, parseQuiz } from "./parse-meta";
import type { Block, Inline, LessonKind } from "./blocks";

export interface PlannedQuestion {
  ord: number;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface PlannedLesson {
  id: string;
  sectionId: string;
  monthId: string | null;
  slug: string;
  title: string;
  heading: string;
  crumb: string;
  desc: Inline[];
  videoUrl: string | null;
  ord: number;
  kind: LessonKind;
  body: Block[];
  questions: PlannedQuestion[];
}

export interface ImportPlan {
  sections: { id: string; short: string; title: string; desc: string; label: string; ord: number }[];
  months: { id: string; sectionId: string; title: string; desc: string; ord: number }[];
  lessons: PlannedLesson[];
}

const REVIEW_ORD = 1000;
const EXAM_ORD = 1001;

const dirs = (p: string) => readdirSync(p).filter((d) => statSync(join(p, d)).isDirectory()).sort();

function kebab(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function read(p: string): string {
  return readFileSync(p, "utf8");
}

/** The exam page copy, reproduced verbatim from build.py:exam_page(). */
function examDesc(n: number): string {
  return `${n} questions drawn from every lesson in this section. Nothing is graded until you submit — and you can retake it as many times as you like.`;
}

export function readContentTree(root: string): ImportPlan {
  const plan: ImportPlan = { sections: [], months: [], lessons: [] };

  dirs(root).forEach((secDir, secIdx) => {
    const secPath = join(root, secDir);
    const secFile = join(secPath, "section.js");
    if (!existsSync(secFile)) throw new Error(`${secDir}: no section.js`);
    const fields = parseObjs(read(secFile))[0];
    if (!fields?.id) throw new Error(`${secDir}/section.js: no id:"…" field`);
    const sectionId = fields.id;
    plan.sections.push({
      id: sectionId,
      short: fields.short ?? fields.title ?? sectionId,
      title: fields.title ?? sectionId,
      desc: fields.desc ?? "",
      label: fields.label ?? "Month",
      ord: secIdx,
    });

    const monthMeta = new Map(parseObjs(read(join(secPath, "months.js"))).map((m) => [m.id, m]));

    dirs(secPath).forEach((monthDir, monthIdx) => {
      const meta = monthMeta.get(monthDir);
      if (!meta) throw new Error(`${secDir}/months.js: no entry for folder "${monthDir}"`);
      plan.months.push({
        id: monthDir,
        sectionId,
        title: meta.title ?? monthDir,
        desc: meta.desc ?? "",
        ord: monthIdx,
      });

      dirs(join(secPath, monthDir)).forEach((lessonDir, lessonIdx) => {
        const lp = join(secPath, monthDir, lessonDir);
        const { meta: m, blocks } = parseLessonHtml(read(join(lp, "lesson.html")), {
          sectionId,
          monthId: monthDir,
        });
        if (m.id !== lessonDir)
          throw new Error(`${lessonDir}: folder name and section id="${m.id}" disagree`);

        const figSlug = blocks.find((b): b is Extract<Block, { t: "figures" }> => b.t === "figures")?.slug;
        const videoFile = join(lp, "video.txt");
        const video = existsSync(videoFile) ? read(videoFile).trim() : "";

        plan.lessons.push({
          ...m,
          slug: figSlug ?? `${m.id}-${kebab(m.title)}`,
          videoUrl: video || null,
          ord: lessonIdx,
          body: blocks,
          questions: parseQuiz(read(join(lp, "quiz.js"))).map((r, i) => ({
            ord: i,
            q: r.q,
            options: r.o,
            answer: r.a,
            explanation: r.e,
          })),
        });
      });
    });

    // --- the section's review page ------------------------------------------
    const summary = join(secPath, "summary.html");
    if (existsSync(summary)) {
      const { meta: m, blocks } = parseLessonHtml(read(summary), { sectionId, monthId: null });
      plan.lessons.push({
        ...m,
        slug: m.id,
        videoUrl: null,
        ord: REVIEW_ORD,
        body: blocks,
        questions: [],
      });
    }

    // --- the section's exam page (generated, as build.py does) ---------------
    const examFile = join(secPath, "exam.js");
    if (existsSync(examFile)) {
      const rows = parseQuiz(read(examFile));
      const sectionTitle = plan.sections.at(-1)!.title;
      plan.lessons.push({
        id: `${sectionId}-exam`,
        sectionId,
        monthId: null,
        slug: `${sectionId}-exam`,
        title: "Final Exam",
        heading: "Final Exam",
        crumb: `${sectionTitle} · Section Review`,
        desc: [{ t: "text", v: examDesc(rows.length) }],
        videoUrl: null,
        ord: EXAM_ORD,
        kind: "exam",
        body: [],
        questions: rows.map((r, i) => ({
          ord: i,
          q: r.q,
          options: r.o,
          answer: r.a,
          explanation: r.e,
        })),
      });
    }
  });

  const ids = plan.lessons.map((l) => l.id);
  const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupIds.length) throw new Error(`duplicate lesson ids: ${[...new Set(dupIds)].join(", ")}`);
  const slugs = plan.lessons.map((l) => l.slug);
  const dupSlugs = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupSlugs.length) throw new Error(`duplicate lesson slugs: ${[...new Set(dupSlugs)].join(", ")}`);

  return plan;
}
```

**The exam crumb uses `title`, and it deliberately differs from the summary's.** `build.py:exam_page()` builds `f'{title} · Section Review'` from `section.js`'s `title`, which is the long form — so the generated exam crumbs are `ICT Core (Months 1–4) · Section Review` and `ICT 2022 Mentorship · Section Review`, while the hand-authored *summary* crumbs use the short form (`ICT Core · Section Review`, `2022 Mentorship · Section Review`). That asymmetry is existing behaviour; reproduce it rather than tidying it.

Also note `content/s1-ict-core/section.js` currently has a formatter-inserted `;` **inside** its braces (`desc: "…"; }`) — exactly the mangling CLAUDE.md §3 warns about. `parseObjs` reads it correctly; do not "fix" the file.

- [ ] **Step 4: Run the test**

```bash
pnpm test:unit tests/unit/import.test.ts
```

Expected: PASS, 9 tests. A throw from `parseLessonHtml` here means the corpus has an element the parser does not map — fix the parser (and Task 8's gate will confirm), never loosen the importer.

- [ ] **Step 5: Write `scripts/import-content.mjs`**

```js
// scripts/import-content.mjs
// Usage: node --env-file=.env.local scripts/import-content.mjs [--dry-run]
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, sql } from "drizzle-orm";
import { readContentTree } from "../lib/content/import.ts";
import { assertBlocks } from "../lib/content/blocks.ts";
import { sections, months, lessons, quizQuestions } from "../lib/db/schema.ts";

const dryRun = process.argv.includes("--dry-run");
const plan = readContentTree("content");

// Fail before writing anything if any body is malformed.
for (const l of plan.lessons) assertBlocks(l.body);

const tally = {};
for (const l of plan.lessons) for (const b of l.body) tally[b.t] = (tally[b.t] ?? 0) + 1;

console.log(
  `plan: ${plan.sections.length} sections · ${plan.months.length} months · ` +
    `${plan.lessons.length} lessons (${plan.lessons.filter((l) => l.kind === "lesson").length} lesson, ` +
    `${plan.lessons.filter((l) => l.kind === "review").length} review, ` +
    `${plan.lessons.filter((l) => l.kind === "exam").length} exam) · ` +
    `${plan.lessons.reduce((n, l) => n + l.questions.length, 0)} questions`,
);
console.log("blocks:", Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(" "));

if (dryRun) {
  console.log("--dry-run: nothing written");
  process.exit(0);
}

const db = drizzle(neon(process.env.DATABASE_URL));

for (const s of plan.sections) {
  await db.insert(sections).values(s).onConflictDoUpdate({ target: sections.id, set: s });
}
for (const m of plan.months) {
  await db.insert(months).values(m).onConflictDoUpdate({ target: months.id, set: m });
}

for (const l of plan.lessons) {
  const { questions, ...row } = l;
  // access is NOT in `set`: an import must never reopen a lesson the CMS closed.
  const values = { ...row, status: "published", publishedAt: new Date(), updatedAt: new Date() };
  await db
    .insert(lessons)
    .values({ ...values, access: "members" })
    .onConflictDoUpdate({ target: lessons.id, set: values });

  await db.delete(quizQuestions).where(eq(quizQuestions.lessonId, l.id));
  if (questions.length) {
    await db.insert(quizQuestions).values(questions.map((q) => ({ ...q, lessonId: l.id })));
  }
}

const [{ n: nl }] = await db.select({ n: sql`count(*)::int` }).from(lessons);
const [{ n: nq }] = await db.select({ n: sql`count(*)::int` }).from(quizQuestions);
console.log(`written: ${nl} lessons, ${nq} questions`);
```

Note the deliberate asymmetry: `access` is set on insert only, never on update. A re-import must not reopen a lesson whose access was tightened later.

- [ ] **Step 6: Dry-run, then import**

```bash
node --env-file=.env.local --experimental-strip-types scripts/import-content.mjs --dry-run
node --env-file=.env.local --experimental-strip-types scripts/import-content.mjs
```

Expected from the dry run: `82 lessons (78 lesson, 2 review, 2 exam) · 564 questions` and a block tally whose `p`/`h3`/`callout`/`kv` counts match the survey table (504 / 406 / 626 / 142). Expected from the real run: `written: 82 lessons, 564 questions`.

- [ ] **Step 7: Verify idempotence**

Run the import a second time. Expected: identical `written:` counts, no unique-constraint error.

- [ ] **Step 8: Stage**

```bash
git add lib/content/import.ts scripts/import-content.mjs tests/unit/import.test.ts
```

---

### Task 12: Content queries

**Files:**
- Create: `lib/content/queries.ts`

**Interfaces:**
- Produces:

```ts
export interface CatalogLesson { id: string; title: string; desc: string; kind: LessonKind; access: string; ord: number }
export interface CatalogMonth { id: string; title: string; desc: string; lessons: CatalogLesson[] }
export interface CatalogSection { id: string; short: string; title: string; desc: string; label: string; months: CatalogMonth[]; review?: CatalogLesson; exam?: CatalogLesson }

getCatalog(): Promise<CatalogSection[]>                    // cached, tag "catalog"
getLessonMeta(id: string): Promise<LessonMetaResult | null> // cached, tag `lesson-meta:{id}`; NO body
getLessonBody(id: string): Promise<Block[] | null>          // cached, tag `lesson:{id}`; call ONLY inside canRead
getQuiz(lessonId: string): Promise<QuizQuestionRow[]>       // never cached
lessonOrder(catalog: CatalogSection[]): string[]            // pure — nav order, prev/next
```

**The split between `getLessonMeta` and `getLessonBody` is invariant 1 made structural.** Meta is safe for anyone (it is already public in the nav); the body is not. Two functions means a reviewer can see at a glance whether the gated call sits inside the gate.

- [ ] **Step 1: Write `lib/content/queries.ts`**

```ts
import { unstable_cache as cache } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessons, months, sections, quizQuestions, type QuizQuestionRow } from "@/lib/db/schema";
import { assertBlocks, inlineText, type Block, type Inline, type LessonKind } from "./blocks";

export interface CatalogLesson {
  id: string;
  title: string;
  desc: string;
  kind: LessonKind;
  access: string;
  ord: number;
}

export interface CatalogMonth {
  id: string;
  title: string;
  desc: string;
  lessons: CatalogLesson[];
}

export interface CatalogSection {
  id: string;
  short: string;
  title: string;
  desc: string;
  label: string;
  months: CatalogMonth[];
  review?: CatalogLesson;
  exam?: CatalogLesson;
}

export interface LessonMetaResult {
  id: string;
  sectionId: string;
  monthId: string | null;
  slug: string;
  title: string;
  heading: string;
  crumb: string;
  desc: Inline[];
  videoUrl: string | null;
  kind: LessonKind;
  access: string;
  status: string;
}

/**
 * Nav/cards/sidebar data. Byte-identical for every visitor, so it is CDN-safe:
 * titles and one-line descriptions are already public. Bodies are NOT here.
 */
export const getCatalog = cache(
  async (): Promise<CatalogSection[]> => {
    const [secRows, monthRows, lessonRows] = await Promise.all([
      db.select().from(sections).orderBy(asc(sections.ord)),
      db.select().from(months).orderBy(asc(months.ord)),
      db
        .select({
          id: lessons.id,
          sectionId: lessons.sectionId,
          monthId: lessons.monthId,
          title: lessons.title,
          desc: lessons.desc,
          kind: lessons.kind,
          access: lessons.access,
          status: lessons.status,
          ord: lessons.ord,
        })
        .from(lessons)
        .orderBy(asc(lessons.ord)),
    ]);

    const published = lessonRows.filter((l) => l.status === "published");
    const toCatalog = (l: (typeof published)[number]): CatalogLesson => ({
      id: l.id,
      title: l.title,
      desc: inlineText((l.desc ?? []) as Inline[]),
      kind: l.kind as LessonKind,
      access: l.access,
      ord: l.ord,
    });

    return secRows.map((s) => ({
      id: s.id,
      short: s.short,
      title: s.title,
      desc: s.desc,
      label: s.label,
      months: monthRows
        .filter((m) => m.sectionId === s.id)
        .map((m) => ({
          id: m.id,
          title: m.title,
          desc: m.desc,
          lessons: published.filter((l) => l.monthId === m.id && l.kind === "lesson").map(toCatalog),
        })),
      review: published.filter((l) => l.sectionId === s.id && l.kind === "review").map(toCatalog)[0],
      exam: published.filter((l) => l.sectionId === s.id && l.kind === "exam").map(toCatalog)[0],
    }));
  },
  ["catalog"],
  { tags: ["catalog"] },
);

/** Hero, crumb, video and the gating columns. Safe for anyone — no prose. */
export function getLessonMeta(id: string): Promise<LessonMetaResult | null> {
  return cache(
    async (lessonId: string) => {
      const [row] = await db
        .select({
          id: lessons.id,
          sectionId: lessons.sectionId,
          monthId: lessons.monthId,
          slug: lessons.slug,
          title: lessons.title,
          heading: lessons.heading,
          crumb: lessons.crumb,
          desc: lessons.desc,
          videoUrl: lessons.videoUrl,
          kind: lessons.kind,
          access: lessons.access,
          status: lessons.status,
        })
        .from(lessons)
        .where(eq(lessons.id, lessonId))
        .limit(1);
      if (!row) return null;
      return {
        ...row,
        desc: (row.desc ?? []) as Inline[],
        kind: row.kind as LessonKind,
      };
    },
    ["lesson-meta", id],
    { tags: [`lesson-meta:${id}`, `lesson:${id}`] },
  )(id);
}

/**
 * INVARIANT 1: call this ONLY inside the canRead branch. Calling it above the
 * gate puts gated prose into the RSC payload even when the JSX is suppressed.
 */
export function getLessonBody(id: string): Promise<Block[] | null> {
  return cache(
    async (lessonId: string) => {
      const [row] = await db
        .select({ body: lessons.body })
        .from(lessons)
        .where(eq(lessons.id, lessonId))
        .limit(1);
      return row ? assertBlocks(row.body) : null;
    },
    ["lesson-body", id],
    { tags: [`lesson:${id}`] },
  )(id);
}

/** Never cached: the caller has already checked membership, per-request. */
export async function getQuiz(lessonId: string): Promise<QuizQuestionRow[]> {
  return db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.lessonId, lessonId))
    .orderBy(asc(quizQuestions.ord));
}

/** Reading order: months in order, then the section's review, then its exam. */
export function lessonOrder(catalog: CatalogSection[]): string[] {
  return catalog.flatMap((s) => [
    ...s.months.flatMap((m) => m.lessons.map((l) => l.id)),
    ...(s.review ? [s.review.id] : []),
    ...(s.exam ? [s.exam.id] : []),
  ]);
}
```

- [ ] **Step 2: Verify the queries against the real database**

```bash
node --env-file=.env.local --experimental-strip-types -e "
const {getCatalog,getLessonMeta,getLessonBody,lessonOrder}=await import('./lib/content/queries.ts');
const cat=await getCatalog();
console.log('sections',cat.map(s=>s.id+':'+s.label).join(' '));
console.log('months',cat.flatMap(s=>s.months).length,'lessons',cat.flatMap(s=>s.months).flatMap(m=>m.lessons).length);
console.log('order',lessonOrder(cat).length,lessonOrder(cat).slice(0,2),lessonOrder(cat).slice(-2));
const m=await getLessonMeta('m4-03');console.log('meta',m.title,'|',m.crumb,'|access',m.access);
console.log('body blocks',(await getLessonBody('m4-03')).length);
"
```

Expected: `sections s1:Month s2:Part`, `months 10 lessons 78`, `order 82` ending in `s2-review, s2-exam`, `access members`, and a non-zero block count.

`unstable_cache` outside a request scope may warn — that is fine for this one-off check. If it errors instead, temporarily call the inner query directly to prove the SQL, then rely on Task 13's e2e for the cached path.

- [ ] **Step 3: Stage**

```bash
git add lib/content/queries.ts
```

---

### Task 13: Render the database

Replaces the ported MDX components with a block renderer, and rewires the shell to `getCatalog()`. Charts stay dark until P2: the `figures` block renders nothing while there are no `media` rows, and this task's tests assert prose, not charts.

**Files:**
- Create: `components/blocks/BlockRenderer.tsx`, `components/blocks/Inline.tsx`, `components/blocks/Callout.tsx` + `.module.css`, `components/blocks/Kv.tsx` + `.module.css`, `components/blocks/FlipCard.tsx` + `.module.css`, `components/blocks/Figures.tsx` + `.module.css`
- Create (by port, then adapt): `components/shell/Sidebar.tsx` + `.module.css`, `components/home/SectionCards.tsx` + `home.module.css`, `components/lesson/LessonFooter.tsx`, `components/progress/ProgressProvider.tsx`
- Create: `app/lesson/[id]/page.tsx`, `lib/nav.ts`
- Modify: `app/page.tsx`, `app/layout.tsx`
- Delete: `app/dev-css-probe/page.tsx`
- Test: `tests/unit/render-blocks.test.ts`, `tests/e2e/lessons.spec.ts`

**Interfaces:**
- Consumes: `getCatalog`, `getLessonMeta`, `getLessonBody`, `lessonOrder`, `Block`, `Inline`.
- Produces: `<BlockRenderer blocks={Block[]} lessonId={string} />`; `<InlineNodes nodes={Inline[]} />`; `navFrom(catalog): { order: string[]; prevNext(id): { prev?: CatalogLesson; next?: CatalogLesson } }`.

- [ ] **Step 1: Port the CSS modules and the three data-light components**

```bash
git checkout nextjs-migration -- components/mdx/Callout.module.css components/mdx/Kv.module.css \
  components/mdx/FlipCard.module.css components/mdx/Figures.module.css \
  components/shell components/home components/lesson components/progress
```

Then move the four stylesheets into `components/blocks/` and delete `components/mdx/`:

```bash
mkdir -p components/blocks
git mv components/mdx/Callout.module.css components/blocks/Callout.module.css
git mv components/mdx/Kv.module.css components/blocks/Kv.module.css
git mv components/mdx/FlipCard.module.css components/blocks/FlipCard.module.css
git mv components/mdx/Figures.module.css components/blocks/Figures.module.css
git rm -r --cached components/mdx 2>/dev/null; rm -rf components/mdx
git mv components/home/MonthCards.tsx components/home/SectionCards.tsx
```

- [ ] **Step 2: Write the failing renderer test**

`renderToStaticMarkup` needs no DOM, so this runs in vitest's node environment. Vitest stubs `*.module.css` imports, so assert on **structure and text**, not class names.

```ts
// tests/unit/render-blocks.test.ts
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import type { Block } from "@/lib/content/blocks";

const html = (blocks: Block[]) => renderToStaticMarkup(<BlockRenderer blocks={blocks} lessonId="m4-03" />);

describe("BlockRenderer", () => {
  it("renders headings, paragraphs and lists", () => {
    const out = html([
      { t: "h3", c: [{ t: "text", v: "Definition & Validation" }] },
      { t: "p", c: [{ t: "text", v: "a " }, { t: "strong", c: [{ t: "text", v: "b" }] }] },
      { t: "list", ordered: true, items: [[{ t: "text", v: "one" }]] },
    ]);
    expect(out).toContain("<h3>Definition &amp; Validation</h3>");
    expect(out).toContain("a <strong>b</strong>");
    expect(out).toContain("<ol><li>one</li></ol>");
  });

  it("renders the h4 src pointer and a br", () => {
    const out = html([{ t: "h4", c: [{ t: "text", v: "T " }, { t: "src", c: [{ t: "text", v: "(L2)" }] }] }, { t: "p", c: [{ t: "br" }] }]);
    expect(out).toMatch(/<h4>T <span class="[^"]*">\(L2\)<\/span><\/h4>/);
    expect(out).toContain("<br/>");
  });

  it("renders a callout with its tag and an interleaved list", () => {
    const out = html([
      {
        t: "callout",
        variant: "warn",
        tag: [{ t: "text", v: "Bearish OBs" }],
        c: [{ t: "run", c: [{ t: "text", v: "x" }] }, { t: "list", ordered: false, items: [[{ t: "text", v: "y" }]] }],
      },
    ]);
    expect(out).toContain("Bearish OBs");
    expect(out).toContain("<ul><li>y</li></ul>");
  });

  it("renders kv rows as two cells each", () => {
    const out = html([{ t: "kv", rows: [{ k: [{ t: "text", v: "K" }], v: [{ t: "text", v: "V" }] }] }]);
    expect(out).toContain(">K<");
    expect(out).toContain(">V<");
  });

  it("renders a flip hint verbatim rather than a hardcoded string", () => {
    expect(html([{ t: "flipHint", v: "Click a card to flip it" }])).toContain("Click a card to flip it");
  });

  it("renders nothing for a figures block with no media", () => {
    expect(html([{ t: "figures", slug: "m4-03-orderblocks" }])).toBe("");
  });
});
```

Rename the test file to `.tsx` (`tests/unit/render-blocks.test.tsx`) and widen `vitest.config.ts`'s `include` to `["tests/unit/**/*.test.{ts,tsx}"]` so JSX parses.

- [ ] **Step 3: Run it to verify it fails**

```bash
pnpm test:unit tests/unit/render-blocks.test.tsx
```

Expected: FAIL — cannot resolve `@/components/blocks/BlockRenderer`.

- [ ] **Step 4: Write `components/blocks/Inline.tsx`**

```tsx
import type { Inline } from "@/lib/content/blocks";
import styles from "./Callout.module.css";

/** Inline nodes → React. Pure and server-safe; no data dependencies. */
export function InlineNodes({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        switch (n.t) {
          case "text":
            return n.v;
          case "br":
            return <br key={i} />;
          case "strong":
            return (
              <strong key={i}>
                <InlineNodes nodes={n.c} />
              </strong>
            );
          case "em":
            return (
              <em key={i}>
                <InlineNodes nodes={n.c} />
              </em>
            );
          case "src":
            return (
              <span key={i} className={styles.src}>
                <InlineNodes nodes={n.c} />
              </span>
            );
        }
      })}
    </>
  );
}
```

Check that `Callout.module.css` actually defines `.src` — on the old branch the `(L4)` pointer style lived in `globals.css` as a plain `.src` class. If so, drop the module import and emit `className="src"`.

- [ ] **Step 5: Write the block components**

```tsx
// components/blocks/Callout.tsx
import type { CalloutChild, Inline } from "@/lib/content/blocks";
import { InlineNodes } from "./Inline";
import styles from "./Callout.module.css";

const variantClass = { note: styles.note, rule: styles.rule, warn: styles.warn } as const;

export function Callout({
  variant,
  tag,
  children,
}: {
  variant: "note" | "rule" | "warn";
  tag: Inline[];
  children: CalloutChild[];
}) {
  return (
    <div className={`${styles.callout} ${variantClass[variant]}`}>
      <span className={styles.tag}>
        <InlineNodes nodes={tag} />
      </span>
      {children.map((c, i) =>
        c.t === "run" ? (
          <InlineNodes key={i} nodes={c.c} />
        ) : c.ordered ? (
          <ol key={i}>{c.items.map((it, j) => <li key={j}><InlineNodes nodes={it} /></li>)}</ol>
        ) : (
          <ul key={i}>{c.items.map((it, j) => <li key={j}><InlineNodes nodes={it} /></li>)}</ul>
        ),
      )}
    </div>
  );
}
```

```tsx
// components/blocks/Kv.tsx
import type { Inline } from "@/lib/content/blocks";
import { InlineNodes } from "./Inline";
import styles from "./Kv.module.css";

export function Kv({ rows }: { rows: { k: Inline[]; v: Inline[] }[] }) {
  return (
    <div className={styles.kv}>
      {rows.map((r, i) => (
        <div key={i} className={styles.row} style={{ display: "contents" }}>
          <div className={styles.key}><InlineNodes nodes={r.k} /></div>
          <div className={styles.val}><InlineNodes nodes={r.v} /></div>
        </div>
      ))}
    </div>
  );
}
```

`display: contents` keeps each pair's cells as direct grid children of `.kv` (the old `KvRow` returned a fragment for the same reason). If `Kv.module.css` lays the grid out with `:nth-child()` selectors, use a fragment instead of the wrapper div — check the stylesheet before choosing.

```tsx
// components/blocks/FlipCard.tsx
"use client";

import { useState } from "react";
import type { Inline } from "@/lib/content/blocks";
import { InlineNodes } from "./Inline";
import styles from "./FlipCard.module.css";

export function FlipRow({ cards }: { cards: { front: Inline[]; back: Inline[] }[] }) {
  return (
    <div className={styles.row}>
      {cards.map((c, i) => (
        <Flip key={i} front={c.front} back={c.back} />
      ))}
    </div>
  );
}

function Flip({ front, back }: { front: Inline[]; back: Inline[] }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      className={`${styles.flip} ${flipped ? styles.flipped : ""}`}
      onClick={() => setFlipped((v) => !v)}
      aria-pressed={flipped}
    >
      <span className={styles.inner}>
        <span className={`${styles.face} ${styles.front}`}><InlineNodes nodes={front} /></span>
        <span className={`${styles.face} ${styles.back}`}><InlineNodes nodes={back} /></span>
      </span>
    </button>
  );
}

/** The source authors this hint separately (it is not always adjacent). */
export function FlipHint({ text }: { text: string }) {
  return <div className={styles.hint}>{text}</div>;
}
```

The ported `FlipRow` rendered its own hardcoded `"Tap a card to reveal"` hint — that is gone: the hint is now a `flipHint` block carrying the source's own wording.

```tsx
// components/blocks/Figures.tsx
// P1: no media rows exist yet, so this renders nothing. P2 replaces the body
// with a <picture>/srcset gallery driven by the lesson's media rows.
export function Figures({ slug }: { slug: string; lessonId: string }) {
  void slug;
  return null;
}
```

- [ ] **Step 6: Write `components/blocks/BlockRenderer.tsx`**

```tsx
import type { Block } from "@/lib/content/blocks";
import { InlineNodes } from "./Inline";
import { Callout } from "./Callout";
import { Kv } from "./Kv";
import { FlipRow, FlipHint } from "./FlipCard";
import { Figures } from "./Figures";

/**
 * Block array → React tree. Pure: every data dependency arrives as a prop, so
 * this is unit-testable with renderToStaticMarkup and has no DB access.
 */
export function BlockRenderer({ blocks, lessonId }: { blocks: Block[]; lessonId: string }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h3":
            return <h3 key={i}><InlineNodes nodes={b.c} /></h3>;
          case "h4":
            return <h4 key={i}><InlineNodes nodes={b.c} /></h4>;
          case "p":
            return <p key={i}><InlineNodes nodes={b.c} /></p>;
          case "list":
            return b.ordered ? (
              <ol key={i}>{b.items.map((it, j) => <li key={j}><InlineNodes nodes={it} /></li>)}</ol>
            ) : (
              <ul key={i}>{b.items.map((it, j) => <li key={j}><InlineNodes nodes={it} /></li>)}</ul>
            );
          case "callout":
            return <Callout key={i} variant={b.variant} tag={b.tag}>{b.c}</Callout>;
          case "kv":
            return <Kv key={i} rows={b.rows} />;
          case "flipRow":
            return <FlipRow key={i} cards={b.cards} />;
          case "flipHint":
            return <FlipHint key={i} text={b.v} />;
          case "figures":
            return <Figures key={i} slug={b.slug} lessonId={lessonId} />;
        }
      })}
    </>
  );
}
```

- [ ] **Step 7: Run the renderer test**

```bash
pnpm test:unit tests/unit/render-blocks.test.tsx
```

Expected: PASS, 6 tests.

- [ ] **Step 8: Write `lib/nav.ts`**

```ts
import { lessonOrder, type CatalogLesson, type CatalogSection } from "@/lib/content/queries";

export function navFrom(catalog: CatalogSection[]) {
  const order = lessonOrder(catalog);
  const byId = new Map<string, CatalogLesson>();
  for (const s of catalog) {
    for (const m of s.months) for (const l of m.lessons) byId.set(l.id, l);
    if (s.review) byId.set(s.review.id, s.review);
    if (s.exam) byId.set(s.exam.id, s.exam);
  }
  return {
    order,
    byId,
    /** Only kind='lesson' rows count toward the progress bar, as today. */
    lessonCount: catalog.flatMap((s) => s.months).flatMap((m) => m.lessons).length,
    prevNext(id: string): { prev?: CatalogLesson; next?: CatalogLesson } {
      const i = order.indexOf(id);
      if (i < 0) return {};
      return {
        prev: i > 0 ? byId.get(order[i - 1]) : undefined,
        next: i < order.length - 1 ? byId.get(order[i + 1]) : undefined,
      };
    },
  };
}
```

- [ ] **Step 9: Adapt `Sidebar` and `SectionCards` for sections**

The ported versions predate multi-section support. Three changes, matching `engine/app.js` on `main`:

1. `Sidebar` takes `catalog: CatalogSection[]` as a prop (the layout is a server component and fetches it) instead of importing a generated constant. It prints a **section heading once there is more than one section**, and appends the section's `review` and `exam` entries after its months.
2. `SectionCards` groups by section, numbers within the section, and takes its noun from `section.label` (`Month 1…` for s1, `Part 1…` for s2).
3. A month with no lessons renders **inert** rather than linking to `undefined`.

```tsx
// components/home/SectionCards.tsx  — the card grid, grouped by section
"use client";

import Link from "next/link";
import { useProgress } from "@/components/progress/ProgressProvider";
import type { CatalogSection } from "@/lib/content/queries";
import styles from "./home.module.css";

export function SectionCards({ sections }: { sections: CatalogSection[] }) {
  const { isDone, ready } = useProgress();

  return (
    <>
      {sections.map((s) => (
        <section key={s.id} className={styles.sectionGroup}>
          {sections.length > 1 ? <h2 className={styles.sectionHead}>{s.title}</h2> : null}
          <div className={styles.cards}>
            {s.months.map((m, i) => {
              const first = m.lessons[0];
              const doneCount = ready ? m.lessons.filter((l) => isDone(l.id)).length : 0;
              const heading = m.title.replace(/^(?:Month|Part)\s*\d+\s*[—-]\s*/, "");
              const body = (
                <>
                  <div className={styles.mnum}>{s.label} {i + 1}</div>
                  <h3>{heading}</h3>
                  <p>{m.desc}</p>
                  <div className={styles.mprog}>{doneCount} / {m.lessons.length} complete</div>
                </>
              );
              return first ? (
                <Link key={m.id} href={`/lesson/${first.id}`} className={styles.card}>{body}</Link>
              ) : (
                <div key={m.id} className={`${styles.card} ${styles.cardInert}`} aria-disabled="true">{body}</div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
```

Add `.sectionGroup`, `.sectionHead` and `.cardInert` to `components/home/home.module.css` — reuse the existing tokens (`--muted`, the card border, the section-head type scale) rather than inventing new values. In `Sidebar.module.css` add a `.sectionHead` for the sidebar's own section label.

- [ ] **Step 10: Write `app/lesson/[id]/page.tsx`**

P1 renders every lesson unconditionally — **P3 adds the gate**. The structure already puts `getLessonBody()` where the gate will wrap it, so P3 is an insertion rather than a rewrite.

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCatalog, getLessonMeta, getLessonBody } from "@/lib/content/queries";
import { inlineText } from "@/lib/content/blocks";
import { navFrom } from "@/lib/nav";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { InlineNodes } from "@/components/blocks/Inline";
import { LessonFooter } from "@/components/lesson/LessonFooter";

export const dynamicParams = true; // access is DB state, not build state

export async function generateStaticParams() {
  const order = navFrom(await getCatalog()).order;
  return order.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const meta = await getLessonMeta(id);
  if (!meta) return {};
  return { title: `${meta.title} — The Algorithm`, description: inlineText(meta.desc) };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = await getLessonMeta(id);
  if (!meta || meta.status !== "published") notFound();

  const { prev, next } = navFrom(await getCatalog()).prevNext(id);

  // P3 wraps this call in `if (canRead(meta, user, entitlements))` — invariant 1.
  const blocks = await getLessonBody(id);
  if (!blocks) notFound();

  return (
    <article className="lesson">
      <div className="lesson-hero">
        <div className="crumb">{meta.crumb}</div>
        <h1>{meta.heading}</h1>
        <div className="desc"><InlineNodes nodes={meta.desc} /></div>
      </div>

      {meta.videoUrl ? (
        <a className="lesson-video" href={meta.videoUrl} target="_blank" rel="noopener noreferrer">
          <span className="lv-ico">▶</span>
          <span>Watch the source video <span className="lv-sub">— opens on YouTube</span></span>
        </a>
      ) : null}

      <BlockRenderer blocks={blocks} lessonId={id} />

      {meta.kind === "lesson" ? <LessonFooter id={id} prev={prev} next={next} /> : null}
    </article>
  );
}
```

`LessonFooter`'s props were typed `LessonMeta` on the old branch; retype them to `CatalogLesson`.

- [ ] **Step 11: Rewire `app/page.tsx` and `app/layout.tsx`**

`app/page.tsx` becomes a server component that fetches the catalog and renders `<SectionCards sections={catalog} />`.

Keep the ported hero heading and the closing provenance sentence exactly as they are. **One approved edit**, which the user signed off on: the hero described only Section 1, so a Section 2 sentence joins it. Every descriptive phrase in the new sentence is lifted verbatim from `content/s2-2022-mentorship/section.js`'s own `desc` — only the structural connectives are new, and the counts (40 lessons, 6 parts) are counted from `content/`. Use this copy exactly:

```tsx
<div className={styles.hero}>
  <h1>
    Learn how price is <em>really delivered</em>.
  </h1>
  <p>
    An interactive course built from ICT&apos;s Mentorships. Section 1 — the{" "}
    <em>ICT Core Content</em> — is 38 lessons across 4 months: market maker
    templates, equilibrium &amp; fair valuation, liquidity, institutional order
    flow, PD arrays, and the market maker traps. Section 2 — the{" "}
    <em>ICT 2022 Mentorship</em> — is 40 lessons across 6 parts: one
    stripped-down intraday model taught end to end, from fair value gaps and
    liquidity to market structure shifts, the killzones, and reading the daily
    bias. Every word comes from ICT&apos;s mentorship notes and the original ICT
    video transcripts; every chart is pulled from the notes.
  </p>
</div>
```

Leave `styles.notice` ("…work through the lessons in order… Your progress and quiz answers are saved in your browser automatically.") **unchanged for now** — it is still true while progress is localStorage-only. P4 Task 22 Step 4 revises its last sentence once per-user persistence lands.

`app/layout.tsx` gains `ProgressProvider` and `<Sidebar catalog={await getCatalog()} authEnabled={isAuthConfigured} />`. The layout becomes `async`.

- [ ] **Step 12: Delete the CSS probe**

```bash
rm -rf app/dev-css-probe
```

Move the smoke test's assertions onto a real lesson page in the next step, then delete `tests/e2e/smoke.spec.ts`'s probe test.

- [ ] **Step 13: Write the e2e test**

```ts
// tests/e2e/lessons.spec.ts
import { test, expect } from "@playwright/test";

test("home lists both sections' months", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Month 1", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Part 1", { exact: false }).first()).toBeVisible();
});

test("a lesson renders its prose from the database with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/lesson/m4-03");
  await expect(page.locator(".lesson-hero h1")).toHaveText("Orderblocks");
  await expect(page.locator(".lesson-hero .crumb")).toHaveText("Month 4 · Lesson 3");
  await expect(page.locator("article.lesson h3").first()).toHaveText("Definition & Validation");
  await expect(page.locator("article.lesson .callout")).toHaveCount(1);
  await expect(page.locator(".lesson-video")).toHaveAttribute("href", /^https?:\/\//);
  expect(errors).toEqual([]);
});

test("every lesson in the catalog renders a hero and some body", async ({ page, request }) => {
  // The sidebar is the catalog's own view of itself — walk it.
  await page.goto("/lesson/m1-01");
  const hrefs = await page.locator("nav a[href^='/lesson/']").evaluateAll((as) =>
    (as as HTMLAnchorElement[]).map((a) => a.getAttribute("href")!),
  );
  expect(hrefs.length).toBe(82);

  for (const href of hrefs) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
    const html = await res.text();
    expect(html, href).toContain('class="lesson-hero"');
  }
});

test("the review and exam pages render", async ({ page }) => {
  await page.goto("/lesson/s1-review");
  await expect(page.locator(".lesson-hero h1")).toContainText("Section Summary");
  await page.goto("/lesson/s2-exam");
  await expect(page.locator(".lesson-hero h1")).toHaveText("Final Exam");
});
```

The exam page has an empty body in P1, so it renders only its hero — the exam widget arrives in P4. The `82` count includes the two reviews and two exams; adjust only if the sidebar deliberately omits them.

- [ ] **Step 14: Run everything**

```bash
pnpm lint && pnpm test:unit && pnpm build && pnpm test:e2e
```

Expected: all green. `pnpm build` should prerender 82 lesson routes plus `/` and the auth views. Kill any stale port-3000 listener first.

- [ ] **Step 15: Stage**

```bash
git add components/blocks components/shell components/home components/lesson components/progress \
        app/page.tsx app/layout.tsx app/lesson lib/nav.ts \
        tests/unit/render-blocks.test.tsx tests/e2e/lessons.spec.ts vitest.config.ts
git add -A components/mdx app/dev-css-probe
```

**P1 gate — stop here and check in with the user.** Report: the round-trip gate result (80/80), the import counts, `pnpm build`'s page count, and the two things needing their decision — the home hero's "38 lessons" sentence, and which lessons should be `free` (P3 needs the answer).

---

# P2 — Media on private R2

Deliverable: 339 chart PNGs plus WebP and AVIF derivatives live in the private R2 bucket, `media` rows carry intrinsic dimensions, and charts reach the browser only through `/api/media/[id]`.

`next/image` is deliberately unused: its optimizer fetches the source URL server-side without the visitor's cookies, so every gated chart would 404.

### Task 14: The R2 client

**Files:**
- Create: `lib/media.ts`
- Test: `tests/unit/media.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `r2Configured: boolean`; `presign(key: string, seconds?: number): Promise<string>`; `getObject(key: string): Promise<{ body: ReadableStream; mime: string; bytes: number }>`; `putObject(key, body: Buffer, mime: string): Promise<void>`; `pickVariants(rows: MediaRow[]): { original: MediaRow; webp?: MediaRow; avif?: MediaRow }[]`.

- [ ] **Step 1: Add the dependency**

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

These are runtime dependencies — presigning happens per request in Task 16.

- [ ] **Step 2: Write the failing test**

`pickVariants` is the only pure part, so it is the only part unit-tested; the network paths are covered by the e2e in Task 16.

```ts
// tests/unit/media.test.ts
import { describe, it, expect } from "vitest";
import { pickVariants } from "@/lib/media";
import type { MediaRow } from "@/lib/db/schema";

const row = (over: Partial<MediaRow>): MediaRow =>
  ({
    id: "00000000-0000-0000-0000-000000000000",
    lessonId: "m4-03",
    kind: "image",
    ord: 0,
    storageKey: "k",
    mime: "image/png",
    width: 1200,
    height: 700,
    bytes: 1,
    variantOf: null,
    alt: "",
    ...over,
  }) as MediaRow;

describe("pickVariants", () => {
  it("groups derivatives under their original, in ord order", () => {
    const png2 = row({ id: "b", ord: 1, mime: "image/png" });
    const png1 = row({ id: "a", ord: 0, mime: "image/png" });
    const webp = row({ id: "c", ord: 0, mime: "image/webp", variantOf: "a" });
    const avif = row({ id: "d", ord: 0, mime: "image/avif", variantOf: "a" });
    const out = pickVariants([webp, png2, avif, png1]);
    expect(out.map((g) => g.original.id)).toEqual(["a", "b"]);
    expect(out[0].webp?.id).toBe("c");
    expect(out[0].avif?.id).toBe("d");
    expect(out[1].webp).toBeUndefined();
  });

  it("ignores an orphaned derivative rather than throwing", () => {
    expect(pickVariants([row({ id: "x", mime: "image/webp", variantOf: "missing" })])).toEqual([]);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

```bash
pnpm test:unit tests/unit/media.test.ts
```

Expected: FAIL — cannot resolve `@/lib/media`.

- [ ] **Step 4: Write `lib/media.ts`**

```ts
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { MediaRow } from "@/lib/db/schema";

const accountId = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const r2Configured = Boolean(accountId && bucket && accessKeyId && secretAccessKey);

/** The bucket is private: no r2.dev URL, no custom domain, no public policy. */
const client = r2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    })
  : null;

function must(): S3Client {
  if (!client) throw new Error("R2 is not configured (need R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)");
  return client;
}

/** 60s by default: long enough for the browser to follow one redirect. */
export function presign(key: string, seconds = 60): Promise<string> {
  return getSignedUrl(must(), new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: seconds });
}

export async function getObject(key: string) {
  const res = await must().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!res.Body) throw new Error(`R2 object has no body: ${key}`);
  return {
    body: res.Body.transformToWebStream(),
    mime: res.ContentType ?? "application/octet-stream",
    bytes: res.ContentLength ?? 0,
  };
}

export async function putObject(key: string, body: Buffer, mime: string): Promise<void> {
  await must().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: mime }));
}

export interface VariantGroup {
  original: MediaRow;
  webp?: MediaRow;
  avif?: MediaRow;
}

/** Originals in `ord` order, each with whatever derivatives exist. */
export function pickVariants(rows: MediaRow[]): VariantGroup[] {
  const originals = rows.filter((r) => r.variantOf === null).sort((a, b) => a.ord - b.ord);
  return originals.map((original) => {
    const kids = rows.filter((r) => r.variantOf === original.id);
    return {
      original,
      webp: kids.find((k) => k.mime === "image/webp"),
      avif: kids.find((k) => k.mime === "image/avif"),
    };
  });
}
```

- [ ] **Step 5: Run the test and verify R2 credentials work**

```bash
pnpm test:unit tests/unit/media.test.ts
node --env-file=.env.local --experimental-strip-types -e "
const {r2Configured,putObject,getObject}=await import('./lib/media.ts');
console.log('configured',r2Configured);
await putObject('_healthcheck.txt',Buffer.from('ok'),'text/plain');
const o=await getObject('_healthcheck.txt');
console.log('read back',o.mime,o.bytes,'bytes');
"
```

Expected: 2 unit tests PASS; `configured true`; `read back text/plain 2 bytes`. Never print the credentials themselves.

- [ ] **Step 6: Confirm the bucket is still private**

```bash
node --env-file=.env.local -e "console.log('https://pub-'+process.env.R2_ACCOUNT_ID+'.r2.dev/_healthcheck.txt')"
```

Fetch that URL and expect a failure (DNS error or 401/403). If it returns `ok`, the bucket has a public dev URL enabled — **stop and tell the user**; the whole gating design rests on this being off.

- [ ] **Step 7: Stage**

```bash
git add lib/media.ts tests/unit/media.test.ts package.json pnpm-lock.yaml
```

---

### Task 15: Upload the charts and write `media` rows

**Files:**
- Create: `lib/content/import-media.ts`
- Modify: `scripts/import-content.mjs` (add a media pass behind `--media`), `package.json`
- Test: `tests/unit/import-media.test.ts`

**Interfaces:**
- Produces: `planMedia(root: string, lessons: { id: string; slug: string }[]): PlannedMedia[]` where `PlannedMedia = { lessonId: string; ord: number; file: string; slug: string }` — pure, filesystem-only; `deriveVariants(png: Buffer, key: string): Promise<{ mime: string; key: string; body: Buffer; width: number; height: number }[]>`.

Keys are content-addressed by their source name so a re-import overwrites rather than duplicating: `charts/{slug}-{NN}.png`, `charts/{slug}-{NN}.webp`, `charts/{slug}-{NN}.avif`.

- [ ] **Step 1: Add sharp**

```bash
pnpm add -D sharp
```

`sharp` is dev-only: derivatives are generated at import time, never per request.

- [ ] **Step 2: Write the failing test**

```ts
// tests/unit/import-media.test.ts
import { describe, it, expect } from "vitest";
import { planMedia } from "@/lib/content/import-media";
import { readContentTree } from "@/lib/content/import";

const lessons = readContentTree("content").lessons.map((l) => ({ id: l.id, slug: l.slug }));
const plan = planMedia("images", lessons);

describe("planMedia", () => {
  it("finds all 339 chart files", () => {
    expect(plan).toHaveLength(339);
  });

  it("numbers each lesson's charts from 0 in filename order", () => {
    const m403 = plan.filter((p) => p.lessonId === "m4-03").sort((a, b) => a.ord - b.ord);
    expect(m403[0].ord).toBe(0);
    expect(m403.map((p) => p.file)).toEqual([...m403.map((p) => p.file)].sort());
  });

  it("attributes every file to a real lesson", () => {
    const ids = new Set(lessons.map((l) => l.id));
    expect(plan.every((p) => ids.has(p.lessonId))).toBe(true);
  });

  it("leaves no chart file unclaimed", () => {
    // A PNG whose stem matches no lesson slug is an authoring error, not a
    // file to skip silently.
    expect(() => planMedia("images", lessons.slice(0, 1))).toThrow(/no lesson matches/);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

```bash
pnpm test:unit tests/unit/import-media.test.ts
```

Expected: FAIL — cannot resolve `@/lib/content/import-media`.

- [ ] **Step 4: Write `lib/content/import-media.ts`**

```ts
import { readdirSync } from "node:fs";
import { join } from "node:path";

export interface PlannedMedia {
  lessonId: string;
  slug: string;
  ord: number;
  /** Absolute-ish path under the images/ directory. */
  file: string;
  /** e.g. "charts/m4-03-orderblocks-01.png" */
  key: string;
}

/**
 * images/{slug}-{NN}.png → media rows. `ord` comes from the NN in the filename,
 * which is the ordering authority the old build derived counts from.
 */
export function planMedia(imagesDir: string, lessons: { id: string; slug: string }[]): PlannedMedia[] {
  const bySlug = [...lessons].sort((a, b) => b.slug.length - a.slug.length); // longest match wins
  const out: PlannedMedia[] = [];

  for (const name of readdirSync(imagesDir).filter((f) => f.toLowerCase().endsWith(".png")).sort()) {
    const stem = name.slice(0, -4);
    const m = /^(.*)-(\d{2,})$/.exec(stem);
    if (!m) throw new Error(`images/${name}: does not match {slug}-{NN}.png`);
    const [, slug, nn] = m;
    const lesson = bySlug.find((l) => l.slug === slug);
    if (!lesson) throw new Error(`images/${name}: no lesson matches slug "${slug}"`);
    out.push({
      lessonId: lesson.id,
      slug,
      ord: Number(nn) - 1,
      file: join(imagesDir, name),
      key: `charts/${name}`,
    });
  }
  return out;
}

/** The PNG plus a WebP and an AVIF derivative, all at native size. */
export async function deriveVariants(png: Buffer, key: string) {
  const { default: sharp } = await import("sharp");
  const img = sharp(png);
  const { width, height } = await img.metadata();
  if (!width || !height) throw new Error(`${key}: could not read intrinsic dimensions`);

  const stem = key.replace(/\.png$/, "");
  const [webp, avif] = await Promise.all([
    sharp(png).webp({ quality: 82 }).toBuffer(),
    sharp(png).avif({ quality: 55 }).toBuffer(),
  ]);

  return [
    { mime: "image/png", key, body: png, width, height },
    { mime: "image/webp", key: `${stem}.webp`, body: webp, width, height },
    { mime: "image/avif", key: `${stem}.avif`, body: avif, width, height },
  ];
}
```

- [ ] **Step 5: Run the test**

```bash
pnpm test:unit tests/unit/import-media.test.ts
```

Expected: PASS, 4 tests. If the `339` count is off, list which files failed to match a slug — a slug mismatch is a real content bug worth reporting, not a reason to relax the matcher.

- [ ] **Step 6: Add the media pass to `scripts/import-content.mjs`**

Appended after the lesson loop, gated behind `--media` so the fast text-only import stays fast:

```js
// --- media pass (opt-in: --media) -----------------------------------------
if (process.argv.includes("--media")) {
  const { planMedia, deriveVariants } = await import("../lib/content/import-media.ts");
  const { putObject } = await import("../lib/media.ts");
  const { media } = await import("../lib/db/schema.ts");
  const { readFileSync } = await import("node:fs");

  const files = planMedia("images", plan.lessons.map((l) => ({ id: l.id, slug: l.slug })));
  console.log(`media: ${files.length} charts → ${files.length * 3} objects`);

  let done = 0;
  for (const f of files) {
    const variants = await deriveVariants(readFileSync(f.file), f.key);
    const [original, ...derivatives] = variants;

    for (const v of variants) await putObject(v.key, v.body, v.mime);

    // Replace this chart's rows so a re-run is idempotent.
    await db.delete(media).where(eq(media.storageKey, original.key));
    const [row] = await db
      .insert(media)
      .values({
        lessonId: f.lessonId,
        kind: "image",
        ord: f.ord,
        storageKey: original.key,
        mime: original.mime,
        width: original.width,
        height: original.height,
        bytes: original.body.byteLength,
        alt: "",
      })
      .returning({ id: media.id });

    for (const v of derivatives) {
      await db.delete(media).where(eq(media.storageKey, v.key));
      await db.insert(media).values({
        lessonId: f.lessonId,
        kind: "image",
        ord: f.ord,
        storageKey: v.key,
        mime: v.mime,
        width: v.width,
        height: v.height,
        bytes: v.body.byteLength,
        variantOf: row.id,
        alt: "",
      });
    }
    if (++done % 25 === 0) console.log(`  ${done}/${files.length}`);
  }
  console.log(`media: ${done} charts uploaded`);
}
```

`delete`-before-`insert` on `storage_key` (which has a unique index) makes the pass re-runnable. Deleting an original cascades to its derivatives via `variant_of`, which is why the original is deleted first.

- [ ] **Step 7: Run the media import**

```bash
node --env-file=.env.local --experimental-strip-types scripts/import-content.mjs --media
```

Expected: `media: 339 charts → 1017 objects` and `media: 339 charts uploaded`. This uploads ~78 MB of PNG plus derivatives, so expect several minutes. Run it in the background and report progress rather than blocking.

- [ ] **Step 8: Verify the row counts and the size win**

```bash
node --env-file=.env.local --experimental-strip-types -e "
const {sql}=await import('drizzle-orm');
const {db}=await import('./lib/db/index.ts');
const {media}=await import('./lib/db/schema.ts');
const rows=await db.select({mime:media.mime,n:sql\`count(*)::int\`,mb:sql\`round(sum(bytes)/1048576.0,1)\`}).from(media).groupBy(media.mime);
for(const r of rows)console.log(r.mime,r.n,r.mb+'MB');
"
```

Expected: 339 rows each of `image/png`, `image/webp`, `image/avif`; PNG ≈78 MB, WebP and AVIF each substantially smaller (the spec estimated 25–35 MB for the served set). Report the actual numbers.

- [ ] **Step 9: Stage**

```bash
git add lib/content/import-media.ts scripts/import-content.mjs tests/unit/import-media.test.ts \
        package.json pnpm-lock.yaml
```

---

### Task 16: `/api/media/[id]` and the chart renderer

**Files:**
- Create: `app/api/media/[id]/route.ts`
- Modify: `components/blocks/Figures.tsx`, `components/blocks/FigureImage.tsx` (new), `components/blocks/BlockRenderer.tsx`, `app/lesson/[id]/page.tsx`
- Test: `tests/e2e/media.spec.ts`

**Interfaces:**
- Consumes: `getObject`, `presign`, `pickVariants`; `canRead` does not exist yet, so P2 ships the route with a **`status === 'published'`** check and a `// P3: add canRead` marker at the exact line the gate belongs on. P3 Task 19 replaces that check.
- Produces: `GET /api/media/{uuid}` → image bytes; `getLessonMedia(lessonId): Promise<VariantGroup[]>` added to `lib/content/queries.ts`.

- [ ] **Step 1: Add `getLessonMedia` to `lib/content/queries.ts`**

```ts
import { media, type MediaRow } from "@/lib/db/schema";
import { pickVariants, type VariantGroup } from "@/lib/media";

/** Cached with the body: charts are part of the lesson, gated identically. */
export function getLessonMedia(lessonId: string): Promise<VariantGroup[]> {
  return cache(
    async (id: string) => {
      const rows: MediaRow[] = await db
        .select()
        .from(media)
        .where(eq(media.lessonId, id))
        .orderBy(asc(media.ord));
      return pickVariants(rows);
    },
    ["lesson-media", lessonId],
    { tags: [`lesson:${lessonId}`] },
  )(lessonId);
}
```

Also add a `mediaById(id)` that returns `{ media: MediaRow; lesson: LessonMetaResult }` in one join — the route needs the owning lesson's gating columns:

```ts
export async function mediaWithLesson(mediaId: string) {
  const [row] = await db
    .select({
      key: media.storageKey,
      mime: media.mime,
      lessonId: lessons.id,
      sectionId: lessons.sectionId,
      access: lessons.access,
      status: lessons.status,
      kind: lessons.kind,
    })
    .from(media)
    .innerJoin(lessons, eq(lessons.id, media.lessonId))
    .where(eq(media.id, mediaId))
    .limit(1);
  return row ?? null;
}
```

- [ ] **Step 2: Write `app/api/media/[id]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { mediaWithLesson } from "@/lib/content/queries";
import { getObject, presign } from "@/lib/media";

/** A UUID, so a malformed id 404s before touching the database. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return new NextResponse(null, { status: 404 });

  const row = await mediaWithLesson(id);
  // 404, never 403 — a 403 confirms the asset exists.
  if (!row || row.status !== "published") return new NextResponse(null, { status: 404 });

  // P3: replace the line above with
  //   const allowed = canRead(row, await getCurrentUser(), await myEntitlements());
  //   if (!allowed) return new NextResponse(null, { status: 404 });
  const isFree = row.access === "free";

  if (isFree) {
    // Public and immutable by id: the CDN caches it and R2 is hit once.
    const obj = await getObject(row.key);
    return new NextResponse(obj.body, {
      headers: {
        "content-type": obj.mime,
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Gated: hand out a short-lived presigned URL instead of proxying bytes.
  const url = await presign(row.key, 60);
  return NextResponse.redirect(url, {
    status: 302,
    headers: { "cache-control": "private, max-age=300" },
  });
}
```

- [ ] **Step 3: Write `components/blocks/FigureImage.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useLightbox } from "@/components/lightbox/LightboxProvider";
import styles from "./Figures.module.css";

export interface FigureSources {
  /** /api/media/{uuid} for the PNG original. */
  src: string;
  webp?: string;
  avif?: string;
  width: number;
  height: number;
  alt: string;
}

export function FigureImage({ fig, gallery }: { fig: FigureSources; gallery: boolean }) {
  const [broken, setBroken] = useState(false);
  const { open } = useLightbox();

  // A missing image removes its own figure, as the old img.onerror did.
  if (broken) return null;

  // No next/image: its optimizer fetches server-side without the visitor's
  // cookies, so every gated chart would 404.
  const picture = (
    <picture>
      {fig.avif ? <source srcSet={fig.avif} type="image/avif" /> : null}
      {fig.webp ? <source srcSet={fig.webp} type="image/webp" /> : null}
      <img
        src={fig.src}
        alt={fig.alt}
        width={fig.width}
        height={fig.height}
        loading="lazy"
        decoding="async"
        className={gallery ? styles.galleryImg : styles.figImg}
        onError={() => setBroken(true)}
      />
    </picture>
  );

  return (
    <figure className={styles.fig}>
      {gallery ? (
        <button type="button" className={styles.galleryBtn} onClick={() => open(fig.src, fig.alt)} aria-label="Open chart">
          {picture}
        </button>
      ) : (
        <button type="button" className={styles.plainBtn} onClick={() => open(fig.src, fig.alt)} aria-label="Open chart">
          {picture}
        </button>
      )}
    </figure>
  );
}
```

The old non-gallery figure put `onClick` on the `<img>`; wrapping it in a button instead makes the chart keyboard-reachable. Add a `.plainBtn` rule to `Figures.module.css` that resets the button (no background, no border, no padding, `display: block`, `width: 100%`) so the layout is unchanged.

- [ ] **Step 4: Rewrite `components/blocks/Figures.tsx`**

```tsx
import { FigureImage, type FigureSources } from "./FigureImage";
import styles from "./Figures.module.css";

/** Galleries render when there are more than two charts, as they always have. */
export function Figures({ figures }: { figures: FigureSources[] }) {
  if (figures.length === 0) return null;
  const gallery = figures.length > 2;
  return (
    <div className={gallery ? styles.gallery : undefined}>
      {figures.map((f) => (
        <FigureImage key={f.src} fig={f} gallery={gallery} />
      ))}
    </div>
  );
}
```

`BlockRenderer` now needs the figures as data, so give it a `figures: FigureSources[]` prop and have the `figures` case render `<Figures figures={figures} />`. A lesson has at most one `fig-slot` (67 slots across 78 lessons), so one array on the renderer is enough — assert that in the renderer test rather than assuming it:

```ts
it("passes the lesson's figures to the single figures block", () => { /* … */ });
```

- [ ] **Step 5: Feed the figures from the lesson page**

In `app/lesson/[id]/page.tsx`, after the body fetch (still inside what will become the `canRead` branch):

```tsx
const groups = await getLessonMedia(id);
const figures = groups.map((g) => ({
  src: `/api/media/${g.original.id}`,
  webp: g.webp ? `/api/media/${g.webp.id}` : undefined,
  avif: g.avif ? `/api/media/${g.avif.id}` : undefined,
  width: g.original.width,
  height: g.original.height,
  alt: g.original.alt,
}));
// …
<BlockRenderer blocks={blocks} lessonId={id} figures={figures} />
```

- [ ] **Step 6: Write the e2e test**

```ts
// tests/e2e/media.spec.ts
import { test, expect } from "@playwright/test";

test("a lesson's charts load through the media route", async ({ page }) => {
  const failed: string[] = [];
  page.on("response", (r) => {
    if (r.url().includes("/api/media/") && r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });

  await page.goto("/lesson/m4-03");
  const imgs = page.locator("figure picture img");
  await expect(imgs.first()).toBeVisible();

  // Every rendered chart decoded — no broken images, no zero-size boxes.
  const sizes = await imgs.evaluateAll((els) =>
    (els as HTMLImageElement[]).map((i) => ({ w: i.naturalWidth, h: i.naturalHeight, src: i.getAttribute("src") })),
  );
  expect(sizes.length).toBeGreaterThan(0);
  for (const s of sizes) {
    expect(s.src, "chart src must be the media route, never an R2 URL").toMatch(/^\/api\/media\/[0-9a-f-]{36}$/);
    expect(s.w, JSON.stringify(s)).toBeGreaterThan(0);
  }
  expect(failed).toEqual([]);
});

test("the media route 404s an unknown or malformed id", async ({ request }) => {
  expect((await request.get("/api/media/not-a-uuid")).status()).toBe(404);
  expect((await request.get("/api/media/11111111-1111-1111-1111-111111111111")).status()).toBe(404);
});

test("intrinsic dimensions are emitted so there is no layout shift", async ({ page }) => {
  await page.goto("/lesson/m4-03");
  const attrs = await page.locator("figure picture img").first().evaluate((el) => ({
    w: el.getAttribute("width"),
    h: el.getAttribute("height"),
  }));
  expect(Number(attrs.w)).toBeGreaterThan(0);
  expect(Number(attrs.h)).toBeGreaterThan(0);
});
```

- [ ] **Step 7: Run everything**

```bash
pnpm lint && pnpm test:unit && pnpm build && pnpm test:e2e
```

Expected: all green, charts visible on `/lesson/m4-03`.

Note: with every lesson still `access='members'`, the route takes the **302-to-presigned** path in these tests. That is the harder path, so it is the right one to have covered first; the `free` proxy path gets its test in P3 once a lesson is actually free.

- [ ] **Step 8: Clean up the healthcheck object and stage**

```bash
node --env-file=.env.local --experimental-strip-types -e "
const {S3Client,DeleteObjectCommand}=await import('@aws-sdk/client-s3');
const c=new S3Client({region:'auto',endpoint:'https://'+process.env.R2_ACCOUNT_ID+'.r2.cloudflarestorage.com',credentials:{accessKeyId:process.env.R2_ACCESS_KEY_ID,secretAccessKey:process.env.R2_SECRET_ACCESS_KEY}});
await c.send(new DeleteObjectCommand({Bucket:process.env.R2_BUCKET,Key:'_healthcheck.txt'}));
console.log('healthcheck object removed');
"
git add app/api/media components/blocks lib/content/queries.ts app/lesson tests/e2e/media.spec.ts
```

**P2 gate:** charts render from R2 through `/api/media`, no R2 URL appears in any page's HTML, `r2.dev` is unreachable. Report and pause.

---

# P3 — Roles, entitlements, the gate and the caching model

Deliverable: `canRead` is the single choke point for every body and every chart byte; free lessons are publicly ISR-cached, members lessons are dynamic and uncached; quizzes come only from `/api/quiz/[id]`; and flipping `access` purges the public cache at the write boundary.

**Ask the user first:** which lessons are `free`? Recommended default — `m1-01` and `m1-02` (the first two lessons of Section 1) as the funnel, everything else `members`. The gating tests need at least one free and one members lesson to exercise both paths, so do not proceed with zero free lessons.

### Task 17: Access tables and the admin bootstrap

**Files:**
- Modify: `lib/db/schema.ts`, `lib/auth.ts`
- Create: `lib/db/access-queries.ts`, `drizzle/0001_*.sql` (generated)

**Interfaces:**
- Produces: tables `userRoles`, `entitlements`; `myEntitlements(): Promise<EntitlementRow[]>`; `isAdminUser(userId: string): Promise<boolean>`; `ensureAdminRole(user: { id: string; email?: string }): Promise<void>`.

- [ ] **Step 1: Append the two tables to `lib/db/schema.ts`**

```ts
/**
 * ADMINS ONLY. There is deliberately no 'member' role: membership is the
 * presence of an unexpired entitlement, and two ways to express it would let
 * them disagree. Absence of a row here is the normal case.
 */
export const userRoles = pgTable("user_roles", {
  userId: text("user_id").primaryKey(),
  role: text("role").notNull().default("admin"),
  grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * The entire seam paid subscriptions need (project #3): Stripe's webhook writes
 * a row with source='subscription' and an expires_at, and canRead does not change.
 */
export const entitlements = pgTable(
  "entitlements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    /** 'admin_grant' | 'subscription' */
    source: text("source").notNull(),
    /** 'all' | 'section' */
    scope: text("scope").notNull().default("all"),
    sectionId: text("section_id").references(() => sections.id, { onDelete: "cascade" }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
    /** null = never expires. */
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (t) => [index("entitlements_user_idx").on(t.userId)],
);

export type UserRoleRow = typeof userRoles.$inferSelect;
export type EntitlementRow = typeof entitlements.$inferSelect;
```

- [ ] **Step 2: Write `lib/db/access-queries.ts`**

```ts
import { and, eq, isNull, or, gt } from "drizzle-orm";
import { db } from "./index";
import { entitlements, userRoles, type EntitlementRow } from "./schema";
import { getCurrentUser } from "@/lib/auth";

export async function isAdminUser(userId: string): Promise<boolean> {
  const [row] = await db.select().from(userRoles).where(eq(userRoles.userId, userId)).limit(1);
  return Boolean(row);
}

/** Unexpired entitlements only — expiry is enforced in SQL, not in the caller. */
export async function entitlementsFor(userId: string): Promise<EntitlementRow[]> {
  return db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.userId, userId),
        or(isNull(entitlements.expiresAt), gt(entitlements.expiresAt, new Date())),
      ),
    );
}

/**
 * Bootstraps an admin row from the ADMIN_EMAILS allowlist. Called on every
 * authenticated request that needs a role, so a newly-listed email is promoted
 * on their next visit with no manual SQL.
 */
export async function ensureAdminRole(user: { id: string; email?: string | null }): Promise<void> {
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!user.email || !allow.includes(user.email.toLowerCase())) return;
  await db.insert(userRoles).values({ userId: user.id, role: "admin" }).onConflictDoNothing();
}

/** The per-request access context every gate call needs. */
export async function accessContext() {
  const user = await getCurrentUser();
  if (!user) return { user: null, isAdmin: false, entitlements: [] as EntitlementRow[] };
  await ensureAdminRole(user);
  const [admin, ents] = await Promise.all([isAdminUser(user.id), entitlementsFor(user.id)]);
  return { user, isAdmin: admin, entitlements: ents };
}
```

- [ ] **Step 3: Migrate**

```bash
pnpm db:generate
node --env-file=.env.local ./node_modules/drizzle-kit/bin.cjs migrate
node --env-file=.env.local scripts/db-ping.mjs
```

Expected: `public: 7 table(s)`.

- [ ] **Step 4: Add your own email to `ADMIN_EMAILS`**

Append `ADMIN_EMAILS=<the user's email>` to `.env.local`. Ask the user which address to use rather than assuming the git email.

- [ ] **Step 5: Stage**

```bash
git add lib/db/schema.ts lib/db/access-queries.ts drizzle
```

---

### Task 18: `canRead` — the choke point

A **pure** function of `(lesson, ctx)`, so it is exhaustively unit-testable with no database and no auth.

**Files:**
- Create: `lib/access.ts`
- Test: `tests/unit/access.test.ts`

**Interfaces:**
- Produces:

```ts
export interface Gated { sectionId: string; access: string; status: string }
export interface AccessCtx { user: { id: string } | null; isAdmin: boolean; entitlements: { scope: string; sectionId: string | null }[] }
export function canRead(lesson: Gated, ctx: AccessCtx): boolean
export function hasEntitlement(ctx: AccessCtx, sectionId: string): boolean
```

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/access.test.ts
import { describe, it, expect } from "vitest";
import { canRead, hasEntitlement, type AccessCtx, type Gated } from "@/lib/access";

const anon: AccessCtx = { user: null, isAdmin: false, entitlements: [] };
const signedIn: AccessCtx = { user: { id: "u1" }, isAdmin: false, entitlements: [] };
const memberAll: AccessCtx = { user: { id: "u1" }, isAdmin: false, entitlements: [{ scope: "all", sectionId: null }] };
const memberS1: AccessCtx = { user: { id: "u1" }, isAdmin: false, entitlements: [{ scope: "section", sectionId: "s1" }] };
const admin: AccessCtx = { user: { id: "u9" }, isAdmin: true, entitlements: [] };

const lesson = (over: Partial<Gated> = {}): Gated => ({ sectionId: "s1", access: "members", status: "published", ...over });

describe("canRead", () => {
  it("lets anyone read a published free lesson", () => {
    expect(canRead(lesson({ access: "free" }), anon)).toBe(true);
  });

  it("hides a members lesson from anonymous and merely-signed-in users", () => {
    expect(canRead(lesson(), anon)).toBe(false);
    expect(canRead(lesson(), signedIn)).toBe(false);
  });

  it("lets a scope=all member read any section", () => {
    expect(canRead(lesson({ sectionId: "s2" }), memberAll)).toBe(true);
  });

  it("scopes a section entitlement to its own section", () => {
    expect(canRead(lesson({ sectionId: "s1" }), memberS1)).toBe(true);
    expect(canRead(lesson({ sectionId: "s2" }), memberS1)).toBe(false);
  });

  it("restricts access='admin' to admins even for members", () => {
    expect(canRead(lesson({ access: "admin" }), memberAll)).toBe(false);
    expect(canRead(lesson({ access: "admin" }), admin)).toBe(true);
  });

  it("hides a draft from everyone but an admin, whatever its access", () => {
    for (const access of ["free", "members", "admin"]) {
      expect(canRead(lesson({ access, status: "draft" }), anon)).toBe(false);
      expect(canRead(lesson({ access, status: "draft" }), memberAll)).toBe(false);
      expect(canRead(lesson({ access, status: "draft" }), admin)).toBe(true);
    }
  });

  it("fails closed on an unknown access value", () => {
    expect(canRead(lesson({ access: "somethingelse" }), memberAll)).toBe(false);
    expect(canRead(lesson({ access: "" }), memberAll)).toBe(false);
  });

  it("fails closed on an unknown status value", () => {
    expect(canRead(lesson({ access: "free", status: "archived" }), anon)).toBe(false);
  });
});

describe("hasEntitlement", () => {
  it("is false without a user", () => {
    expect(hasEntitlement(anon, "s1")).toBe(false);
  });
  it("ignores a section entitlement with a null sectionId", () => {
    expect(hasEntitlement({ ...memberS1, entitlements: [{ scope: "section", sectionId: null }] }, "s1")).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
pnpm test:unit tests/unit/access.test.ts
```

Expected: FAIL — cannot resolve `@/lib/access`.

- [ ] **Step 3: Write `lib/access.ts`**

```ts
/**
 * THE gate. Every body render and every media request passes through canRead —
 * that single choke point is what makes "nobody without access can see the
 * content" auditable rather than hopeful.
 *
 * Pure by design: no database, no auth SDK, no request. The caller assembles
 * AccessCtx once per request (see lib/db/access-queries.ts accessContext).
 */

export interface Gated {
  sectionId: string;
  /** 'free' | 'members' | 'admin' — anything else fails closed. */
  access: string;
  /** 'draft' | 'published' — anything else fails closed. */
  status: string;
}

export interface AccessCtx {
  user: { id: string } | null;
  isAdmin: boolean;
  /** Already filtered to unexpired rows by entitlementsFor(). */
  entitlements: { scope: string; sectionId: string | null }[];
}

export function hasEntitlement(ctx: AccessCtx, sectionId: string): boolean {
  if (!ctx.user) return false;
  return ctx.entitlements.some(
    (e) => e.scope === "all" || (e.scope === "section" && e.sectionId === sectionId),
  );
}

export function canRead(lesson: Gated, ctx: AccessCtx): boolean {
  // Unpublished (or any unrecognised status) is admin-only.
  if (lesson.status !== "published") return ctx.isAdmin;

  switch (lesson.access) {
    case "free":
      return true;
    case "members":
      return ctx.isAdmin || hasEntitlement(ctx, lesson.sectionId);
    case "admin":
      return ctx.isAdmin;
    default:
      // Fail closed: an unknown access value locks content rather than leaking it.
      return false;
  }
}
```

- [ ] **Step 4: Run the test**

```bash
pnpm test:unit tests/unit/access.test.ts
```

Expected: PASS, 10 tests.

- [ ] **Step 5: Stage**

```bash
git add lib/access.ts tests/unit/access.test.ts
```

---

### Task 19: Wire the gate into the lesson route and the media route

**Files:**
- Modify: `app/lesson/[id]/page.tsx`, `app/api/media/[id]/route.ts`
- Create: `components/lesson/LockedBody.tsx` + `.module.css`

**Interfaces:**
- Consumes: `canRead`, `accessContext`, `getLessonMeta`, `getLessonBody`, `getLessonMedia`.

The caching split, restated as code contracts:

| `access` | Render | Headers |
|---|---|---|
| `free` | prerendered by `generateStaticParams`, ISR, tag `lesson:{id}` | `public` (Next's default for a static route) |
| `members` / `admin` | dynamic, never prerendered | `private, no-store` |

- [ ] **Step 1: Restrict `generateStaticParams` to free lessons**

```tsx
export const dynamicParams = true; // a lesson flipped to free renders on demand, never 404s

export async function generateStaticParams() {
  const catalog = await getCatalog();
  // Only free lessons are prerendered: a members lesson in a public ISR cache
  // is exactly the leak this architecture exists to prevent.
  return catalog
    .flatMap((s) => [...s.months.flatMap((m) => m.lessons), s.review, s.exam])
    .filter((l): l is NonNullable<typeof l> => Boolean(l) && l!.access === "free")
    .map((l) => ({ id: l.id }));
}
```

- [ ] **Step 2: Put the gate around the body fetch — invariant 1**

```tsx
export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = await getLessonMeta(id);
  if (!meta) notFound();

  const isPublic = meta.access === "free" && meta.status === "published";

  // A free lesson must not read cookies — that would opt the route out of
  // static rendering and lose the public cache entirely.
  const ctx = isPublic
    ? { user: null, isAdmin: false, entitlements: [] }
    : await accessContext();

  if (!canRead(meta, ctx)) {
    // Nothing below this line fetches the body. Do not hoist getLessonBody()
    // above this branch: the prose would land in the RSC payload even though
    // the JSX is suppressed. See spec §6 and invariant 1.
    return (
      <article className="lesson">
        <LessonHero meta={meta} />
        <LockedBody signedIn={Boolean(ctx.user)} />
      </article>
    );
  }

  const [blocks, groups] = await Promise.all([getLessonBody(id), getLessonMedia(id)]);
  if (!blocks) notFound();
  // …render as in P1, plus figures from `groups`
}
```

Extract the hero into a small `LessonHero` component so both branches share it. The hero is safe on the locked branch: title, crumb and one-line description are already public in the nav.

- [ ] **Step 3: Set the response headers for the gated branch**

A dynamic route needs its `Cache-Control` set explicitly. Do it in `middleware.ts` rather than the page (a page cannot set headers), keyed on the route:

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

/**
 * A members lesson is rendered per-request and must never enter a shared cache.
 * Next marks dynamic responses private already; this makes it explicit and
 * survives a future config change.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/lesson/")) {
    res.headers.set("Vary", "Cookie");
  }
  return res;
}

export const config = { matcher: ["/lesson/:path*"] };
```

Setting `no-store` in middleware would also kill the free lessons' public cache, so the page itself opts out for the gated branch instead — add `export const dynamic = "force-dynamic"` **only** if the e2e in Task 21 shows a members lesson being served from a shared cache. Prefer the narrower fix: `await accessContext()` reads cookies, which already makes the request dynamic. Verify with the test rather than adding config speculatively.

- [ ] **Step 4: Write `components/lesson/LockedBody.tsx`**

```tsx
import Link from "next/link";
import styles from "./LockedBody.module.css";

export function LockedBody({ signedIn }: { signedIn: boolean }) {
  return (
    <div className={styles.locked}>
      <h3>This lesson is for members</h3>
      <p>
        {signedIn
          ? "Your account doesn't have access to this section yet."
          : "Sign in with a member account to read this lesson, study its charts and take the lesson check."}
      </p>
      {signedIn ? null : (
        <Link className="btn primary" href="/auth/sign-in">
          Sign in
        </Link>
      )}
    </div>
  );
}
```

This is interface copy, not course content, so §1 does not constrain it — but keep it factual and short. Style `.locked` from the existing callout tokens.

- [ ] **Step 5: Replace the placeholder check in the media route**

```ts
const row = await mediaWithLesson(id);
if (!row) return new NextResponse(null, { status: 404 });

const isPublic = row.access === "free" && row.status === "published";
const ctx = isPublic ? { user: null, isAdmin: false, entitlements: [] } : await accessContext();
// 404, never 403 — a 403 confirms the asset exists.
if (!canRead(row, ctx)) return new NextResponse(null, { status: 404 });
```

Delete the `// P3: add canRead` marker comment.

- [ ] **Step 6: Make two lessons free**

```bash
node --env-file=.env.local --experimental-strip-types scripts/set-access.mjs free m1-01 m1-02
```

`scripts/set-access.mjs` is written in Task 21 — do Task 21 before this step, or set the two rows by hand once and re-run through the script afterwards to prove the revalidating path works.

- [ ] **Step 7: Run everything**

```bash
pnpm lint && pnpm test:unit && pnpm build && pnpm test:e2e
```

Expected: the build prerenders **2** lesson pages (the free ones) instead of 82, and the media e2e now exercises the free proxy path on `m1-01` and the gated 302 path on `m4-03`.

- [ ] **Step 8: Stage**

```bash
git add app/lesson app/api/media components/lesson middleware.ts
```

---

### Task 20: `/api/quiz/[id]` — quizzes are members-only, unconditionally

Making the quiz a client fetch is what keeps a free lesson page 100% statically cacheable, and it is why correct answers never reach a non-member.

**Files:**
- Create: `app/api/quiz/[id]/route.ts`, `components/quiz/Quiz.tsx` (adapted from the ported `components/mdx/Quiz.tsx`), `components/quiz/quiz.module.css`, `components/quiz/QuizGate.tsx`
- Modify: `app/lesson/[id]/page.tsx`
- Test: `tests/e2e/quiz.spec.ts`

**Interfaces:**
- Produces: `GET /api/quiz/{lessonId}` → `{ questions: { id: string; q: string; o: string[]; a: number; e: string }[] }` for a member, `401` with `{ error: "members only" }` otherwise.
- `<Quiz lessonId={string} />` fetches on mount; `<QuizGate />` renders the sign-in prompt while unauthorised.

**Answers are sent to members' browsers on purpose.** Grading stays instant with no round trip per question; a member could read them in devtools but is entitled to that content anyway, so server-side grading would buy latency and nothing else (spec §6).

- [ ] **Step 1: Write the route**

```ts
// app/api/quiz/[id]/route.ts
import { NextResponse } from "next/server";
import { getLessonMeta, getQuiz } from "@/lib/content/queries";
import { accessContext } from "@/lib/db/access-queries";
import { canRead } from "@/lib/access";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = await getLessonMeta(id);
  if (!meta) return NextResponse.json({ error: "not found" }, { status: 404 });

  const ctx = await accessContext();

  // Quizzes are members-only regardless of the lesson's own access, so a free
  // lesson's page stays fully static while its quiz stays behind the gate.
  const asMembers = { sectionId: meta.sectionId, access: "members", status: meta.status };
  if (!canRead(asMembers, ctx)) {
    return NextResponse.json(
      { error: "members only" },
      { status: 401, headers: { "cache-control": "private, no-store" } },
    );
  }

  const rows = await getQuiz(id);
  return NextResponse.json(
    {
      questions: rows.map((r) => ({
        id: r.id,
        q: r.q,
        o: r.options as string[],
        a: r.answer,
        e: r.explanation,
      })),
    },
    { headers: { "cache-control": "private, no-store" } },
  );
}
```

- [ ] **Step 2: Adapt the ported `Quiz` component**

Three changes to `components/mdx/Quiz.tsx` as it moves to `components/quiz/Quiz.tsx`:

1. **Questions arrive by fetch**, not as a prop: `useEffect` → `GET /api/quiz/{lessonId}`; a `401` renders `<QuizGate />`; a network error renders nothing rather than an empty quiz shell.
2. **Question identity is the uuid** — `answered` is keyed by `question.id`, and P4's persistence sends `questionId`. Invariant 4.
3. **Shuffling stays render-time** (the seeded Fisher–Yates the old branch used, seeded on the question **id** now rather than its text, so an edited question keeps its order).

Keep the rest — the shuffle helpers, the graded classes, the explanation reveal — byte-for-byte from the port. Persistence lands in P4; until then `choose()` only sets local state.

```tsx
// the fetch, replacing the frontmatter prop
const [state, setState] = useState<{ status: "loading" | "locked" | "error" } | { status: "ready"; questions: ApiQuestion[] }>({ status: "loading" });

useEffect(() => {
  let cancelled = false;
  fetch(`/api/quiz/${lessonId}`)
    .then(async (r) => {
      if (cancelled) return;
      if (r.status === 401) return setState({ status: "locked" });
      if (!r.ok) return setState({ status: "error" });
      const body = (await r.json()) as { questions: ApiQuestion[] };
      setState({ status: "ready", questions: body.questions });
    })
    .catch(() => !cancelled && setState({ status: "error" }));
  return () => { cancelled = true; };
}, [lessonId]);
```

`QuizGate` renders the "sign in to test yourself" prompt named in the spec:

```tsx
export function QuizGate() {
  return (
    <section className={styles.gate} aria-label="Lesson quiz">
      <h3>Check yourself</h3>
      <p>The lesson check is for members — sign in to test yourself on this lesson.</p>
      <Link className="btn primary" href="/auth/sign-in">Sign in</Link>
    </section>
  );
}
```

- [ ] **Step 3: Mount the quiz on the lesson page**

Below the body, inside the readable branch, for `kind === "lesson"` only:

```tsx
{meta.kind === "lesson" ? <Quiz lessonId={id} /> : null}
```

It hydrates below the fold, so a free lesson's HTML stays static.

- [ ] **Step 4: Write the e2e test**

```ts
// tests/e2e/quiz.spec.ts
import { test, expect } from "@playwright/test";

test("an anonymous visitor gets the gate, not the answers", async ({ page, request }) => {
  // m1-01 is FREE, so its page is public — but its quiz must not be.
  const res = await request.get("/api/quiz/m1-01");
  expect(res.status()).toBe(401);
  const body = await res.text();
  expect(body).not.toMatch(/"e":/);

  await page.goto("/lesson/m1-01");
  await expect(page.getByText(/lesson check is for members/i)).toBeVisible();
  // No option buttons, and no explanation text anywhere in the DOM.
  await expect(page.locator("[data-quiz-option]")).toHaveCount(0);
});

test("the free lesson's HTML contains no quiz answers", async ({ request }) => {
  const html = await (await request.get("/lesson/m1-01")).text();
  expect(html).not.toContain('"answer"');
  expect(html).not.toContain('"explanation"');
});

test("the quiz route 404s an unknown lesson", async ({ request }) => {
  expect((await request.get("/api/quiz/nope-99")).status()).toBe(404);
});
```

The signed-in half of this needs a member session; Task 24 adds the authenticated fixture and the grading assertions there.

- [ ] **Step 5: Run and stage**

```bash
pnpm lint && pnpm build && pnpm test:e2e
git add app/api/quiz components/quiz app/lesson
```

---

### Task 21: Revalidation at the write boundary — invariant 2

A lesson prerendered while `free` sits in a **public** ISR cache. Flip it to `members` and that public copy survives until revalidated: the gate is correct while the cache is stale. So the revalidation happens in the same function as the write, never as a follow-up.

**Files:**
- Create: `lib/content/mutations.ts`, `scripts/set-access.mjs`
- Test: `tests/e2e/gating.spec.ts`

**Interfaces:**
- Produces: `setLessonAccess(id: string, access: "free" | "members" | "admin"): Promise<void>`; `publishLesson(id, status): Promise<void>`; `saveLessonBody(id: string, bodyJson: string): Promise<void>` — note the **string** parameter, invariant 5.

- [ ] **Step 1: Write `lib/content/mutations.ts`**

```ts
"use server";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessons } from "@/lib/db/schema";
import { assertBlocks } from "./blocks";
import { accessContext } from "@/lib/db/access-queries";

async function requireAdmin(): Promise<void> {
  const ctx = await accessContext();
  if (!ctx.isAdmin) throw new Error("admin only");
}

/**
 * Every path that changes what a cached page would show revalidates here, in
 * the same function as the write. Invariant 2: a free → members flip otherwise
 * leaves a readable copy in the PUBLIC ISR cache until the next revalidation.
 */
function revalidateLesson(id: string): void {
  revalidateTag(`lesson:${id}`);
  revalidateTag(`lesson-meta:${id}`);
  revalidateTag("catalog");
}

export async function setLessonAccess(id: string, access: "free" | "members" | "admin"): Promise<void> {
  await requireAdmin();
  await db.update(lessons).set({ access, updatedAt: new Date() }).where(eq(lessons.id, id));
  revalidateLesson(id);
}

export async function publishLesson(id: string, status: "draft" | "published"): Promise<void> {
  await requireAdmin();
  await db
    .update(lessons)
    .set({ status, publishedAt: status === "published" ? new Date() : null, updatedAt: new Date() })
    .where(eq(lessons.id, id));
  revalidateLesson(id);
}

/**
 * INVARIANT 5: the body arrives as a JSON *string*. React Flight silently drops
 * a ProseMirror/Tiptap node's attrs (including an image src) across the
 * client→server boundary — text and marks survive, so it looks like it works.
 * This already cost a debugging session on the previous branch.
 */
export async function saveLessonBody(id: string, bodyJson: string): Promise<void> {
  await requireAdmin();
  const blocks = assertBlocks(JSON.parse(bodyJson));
  await db.update(lessons).set({ body: blocks, updatedAt: new Date() }).where(eq(lessons.id, id));
  revalidateLesson(id);
}
```

- [ ] **Step 2: Write `scripts/set-access.mjs`**

The script cannot call the Server Action (no request scope), so it writes the row **and** hits a revalidation endpoint, keeping the invariant honest from the CLI too:

```js
// scripts/set-access.mjs
// Usage: node --env-file=.env.local scripts/set-access.mjs free m1-01 m1-02
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { inArray } from "drizzle-orm";
import { lessons } from "../lib/db/schema.ts";

const [access, ...ids] = process.argv.slice(2);
if (!["free", "members", "admin"].includes(access) || ids.length === 0) {
  console.error("usage: set-access.mjs <free|members|admin> <lessonId…>");
  process.exit(1);
}

const db = drizzle(neon(process.env.DATABASE_URL));
const rows = await db
  .update(lessons)
  .set({ access, updatedAt: new Date() })
  .where(inArray(lessons.id, ids))
  .returning({ id: lessons.id, access: lessons.access });
console.log("updated:", rows.map((r) => `${r.id}=${r.access}`).join(" "));

// Invariant 2: purge the public cache in the same breath as the write.
const base = process.env.REVALIDATE_BASE_URL ?? "http://localhost:3000";
const secret = process.env.REVALIDATE_SECRET;
if (!secret) {
  console.warn("REVALIDATE_SECRET is not set — the ISR cache was NOT purged. Set it and re-run, or redeploy.");
  process.exit(1);
}
for (const id of ids) {
  const res = await fetch(`${base}/api/revalidate?tag=lesson:${id}`, { headers: { "x-revalidate-secret": secret } });
  console.log(`revalidate lesson:${id} → ${res.status}`);
}
const res = await fetch(`${base}/api/revalidate?tag=catalog`, { headers: { "x-revalidate-secret": secret } });
console.log(`revalidate catalog → ${res.status}`);
```

Add `app/api/revalidate/route.ts` guarded by a constant-time comparison of `x-revalidate-secret` against `process.env.REVALIDATE_SECRET`, returning 404 (not 401) when the secret is wrong, and add `REVALIDATE_SECRET` to `.env.example` and `.env.local` (generate it the same way as the cookie secret).

- [ ] **Step 3: Write the gating tests — these are security tests**

```ts
// tests/e2e/gating.spec.ts
import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";

/** The lesson used for the flip test — free at the start of this file. */
const FLIP = "m1-02";

function setAccess(access: string, id: string) {
  execFileSync("node", ["--env-file=.env.local", "--experimental-strip-types", "scripts/set-access.mjs", access, id], {
    stdio: "inherit",
  });
}

test("a members lesson leaks no prose to an anonymous request", async ({ request }) => {
  const html = await (await request.get("/lesson/m4-03")).text();

  // A distinctive sentence from the lesson body — if this appears, the body was
  // fetched before the gate and landed in the RSC payload. Invariant 1.
  expect(html).not.toContain("lowest down-close candle");
  expect(html).not.toContain("mean threshold");
  // The hero IS public (it is already in the nav), so assert what SHOULD show.
  expect(html).toContain("Orderblocks");
  expect(html).toMatch(/is for members/i);
});

test("a members lesson's charts 404 for an anonymous request", async ({ request }) => {
  // Discover a real media id via a members lesson's own page? It is gated — so
  // read one from the catalog's free lesson and one from the DB fixture instead.
  const res = await request.get("/api/media/00000000-0000-0000-0000-000000000000");
  expect(res.status()).toBe(404);
  // The seeded gated id is written by tests/e2e/fixtures/gated-media-id.txt in
  // Task 24's setup; until then assert the unknown-id case only.
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
```

If the flip test fails, the bug is real and is invariant 2 — fix the revalidation, do not relax the test. Note that against a `next start` server the ISR cache is on disk, so this test is meaningful locally; on Vercel it exercises the same tag path.

- [ ] **Step 4: Run and stage**

```bash
pnpm lint && pnpm test:unit && pnpm build && pnpm test:e2e
git add lib/content/mutations.ts scripts/set-access.mjs app/api/revalidate \
        tests/e2e/gating.spec.ts .env.example
```

**P3 gate:** the four gating tests pass, `pnpm build` prerenders only the free lessons, and no gated prose or chart byte is reachable anonymously. Report and pause.

---

# P4 — Per-user data, the exam, and the verification suite

Deliverable: progress, quiz results and notes persist per user (with a `localStorage` fallback that merges on first sign-in), the exam grades against 80% and is retakeable, and a Playwright suite plus CI replaces `verify.py`.

> **Depth note, stated plainly:** P0–P3 give every step's code in full. In P4, the schema, the pure `planMerge` helper and every test are written out, but four component/route bodies (`Exam.tsx`, `app/api/exam/[id]`, the ported action rewrites, and the CI YAML) are specified as exact interfaces plus numbered behavioural rules rather than finished code. That is deliberate — they depend on the ported files' actual shapes, which are only knowable once P0's port lands — but it does mean P4's tasks need more judgement from their implementer than P1's do. Re-read the ported file before writing each one.

### Task 22: Per-user tables, queries and the localStorage merge

**Files:**
- Modify: `lib/db/schema.ts`, `app/actions/progress.ts` (ported, then rewritten), `components/progress/ProgressProvider.tsx`, `components/quiz/Quiz.tsx`
- Create: `lib/db/progress-queries.ts`, `drizzle/0002_*.sql` (generated)
- Test: `tests/unit/merge-local.test.ts`

**Interfaces:**
- Produces: tables `progress`, `quizResults`, `examResults`, `notes`; server actions `loadMyProgress()`, `toggleDone(lessonId)`, `loadMyQuiz(lessonId)`, `recordQuizAction(lessonId, questionId, selected, correct)`, `mergeLocalState(payloadJson: string)`; pure helper `planMerge(local, server)`.

- [ ] **Step 1: Append the per-user tables**

```ts
export const progress = pgTable(
  "progress",
  {
    userId: text("user_id").notNull(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

/**
 * INVARIANT 4: keyed on question_id, never on a question index. Reordering or
 * inserting a question in the CMS would otherwise silently re-point every
 * user's stored history at the wrong question.
 */
export const quizResults = pgTable(
  "quiz_results",
  {
    userId: text("user_id").notNull(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => quizQuestions.id, { onDelete: "cascade" }),
    /** The picked option index, so the graded UI restores on reload. */
    selected: integer("selected").notNull(),
    correct: boolean("correct").notNull(),
    answeredAt: timestamp("answered_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.questionId] })],
);

/**
 * One row per (user, exam lesson). `picks` stores option TEXT, not indices,
 * because options re-shuffle on every render.
 */
export const examResults = pgTable(
  "exam_results",
  {
    userId: text("user_id").notNull(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    best: integer("best").notNull().default(0),
    last: integer("last").notNull().default(0),
    taken: integer("taken").notNull().default(0),
    submitted: boolean("submitted").notNull().default(false),
    picks: jsonb("picks").notNull().default({}),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    /** One Tiptap document per (user, lesson). */
    content: jsonb("content"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("notes_user_lesson_uq").on(t.userId, t.lessonId)],
);
```

Add `boolean` and `primaryKey` to the drizzle imports at the top of the file.

- [ ] **Step 2: Write the failing merge test**

The merge is the only tricky part, and it is pure, so it gets a unit test. The old localStorage shapes must keep working: `ict-done` is an array of lesson ids, `ict-quiz` maps `"{lessonId}-{qIndex}"` → picked option index.

```ts
// tests/unit/merge-local.test.ts
import { describe, it, expect } from "vitest";
import { planMerge } from "@/lib/db/progress-queries";

describe("planMerge", () => {
  it("unions completed lessons, keeping the server's timestamps", () => {
    const out = planMerge(
      { done: ["m1-01", "m1-02"], quiz: {} },
      { done: ["m1-02", "m1-03"], answered: {} },
      { "m1-01": true, "m1-02": true, "m1-03": true },
      {},
    );
    expect(out.doneToInsert.sort()).toEqual(["m1-01"]);
  });

  it("drops a local completion for a lesson that no longer exists", () => {
    const out = planMerge({ done: ["gone-99"], quiz: {} }, { done: [], answered: {} }, { "m1-01": true }, {});
    expect(out.doneToInsert).toEqual([]);
    expect(out.dropped).toContain("gone-99");
  });

  it("maps a local q_index answer onto the question's uuid", () => {
    const out = planMerge(
      { done: [], quiz: { "m1-01-0": 2 } },
      { done: [], answered: {} },
      { "m1-01": true },
      { "m1-01": [{ id: "uuid-a", ord: 0, answer: 2 }, { id: "uuid-b", ord: 1, answer: 0 }] },
    );
    expect(out.answersToInsert).toEqual([{ questionId: "uuid-a", selected: 2, correct: true }]);
  });

  it("never overwrites an answer the server already has", () => {
    const out = planMerge(
      { done: [], quiz: { "m1-01-0": 1 } },
      { done: [], answered: { "uuid-a": 3 } },
      { "m1-01": true },
      { "m1-01": [{ id: "uuid-a", ord: 0, answer: 2 }] },
    );
    expect(out.answersToInsert).toEqual([]);
  });

  it("drops a local answer whose question index no longer exists", () => {
    const out = planMerge(
      { done: [], quiz: { "m1-01-7": 1 } },
      { done: [], answered: {} },
      { "m1-01": true },
      { "m1-01": [{ id: "uuid-a", ord: 0, answer: 2 }] },
    );
    expect(out.answersToInsert).toEqual([]);
    expect(out.dropped).toContain("m1-01-7");
  });

  it("tolerates malformed local storage without throwing", () => {
    expect(() => planMerge({ done: null as never, quiz: "nope" as never }, { done: [], answered: {} }, {}, {})).not.toThrow();
  });
});
```

- [ ] **Step 3: Run it to verify it fails, then implement `planMerge`**

```bash
pnpm test:unit tests/unit/merge-local.test.ts
```

Expected: FAIL. Then write it in `lib/db/progress-queries.ts`:

```ts
export interface LocalState {
  done: string[];
  /** "{lessonId}-{qIndex}" → picked option index (the pre-migration shape). */
  quiz: Record<string, number>;
}

export interface ServerState {
  done: string[];
  /** questionId → picked option index. */
  answered: Record<string, number>;
}

export interface MergePlan {
  doneToInsert: string[];
  answersToInsert: { questionId: string; selected: number; correct: boolean }[];
  /** Local keys discarded because they no longer resolve — reported, not silent. */
  dropped: string[];
}

/**
 * Pure: the caller supplies the lesson id set and each lesson's questions, so
 * this is testable with no database. Server state always wins; local state only
 * fills gaps.
 */
export function planMerge(
  local: LocalState,
  server: ServerState,
  lessonIds: Record<string, true>,
  questionsByLesson: Record<string, { id: string; ord: number; answer: number }[]>,
): MergePlan {
  const plan: MergePlan = { doneToInsert: [], answersToInsert: [], dropped: [] };
  const serverDone = new Set(server.done);

  for (const id of Array.isArray(local.done) ? local.done : []) {
    if (!lessonIds[id]) plan.dropped.push(id);
    else if (!serverDone.has(id)) plan.doneToInsert.push(id);
  }

  const quiz = local.quiz && typeof local.quiz === "object" ? local.quiz : {};
  for (const [key, selected] of Object.entries(quiz)) {
    if (typeof selected !== "number") { plan.dropped.push(key); continue; }
    const m = /^(.*)-(\d+)$/.exec(key);
    const lessonId = m?.[1];
    const ord = m ? Number(m[2]) : NaN;
    const q = lessonId ? questionsByLesson[lessonId]?.find((x) => x.ord === ord) : undefined;
    if (!q) { plan.dropped.push(key); continue; }
    if (q.id in server.answered) continue; // server wins
    plan.answersToInsert.push({ questionId: q.id, selected, correct: selected === q.answer });
  }
  return plan;
}
```

- [ ] **Step 4: Write the server actions**

`app/actions/progress.ts` — ported shape, new keys. Every action calls `requireUserId()` first and returns `null` when signed out so the client falls back to `localStorage`:

- `loadMyProgress()` → `string[] | null` (completed lesson ids)
- `toggleDone(lessonId)` → inserts or deletes one `progress` row
- `loadMyQuiz(lessonId)` → `Record<questionId, { selected: number; correct: boolean }> | null`
- `recordQuizAction(lessonId, questionId, selected, correct)` → upsert on `(userId, questionId)`
- `mergeLocalState(payloadJson: string)` → `JSON.parse`, build the two lookup maps from the DB, call `planMerge`, insert, and return `{ merged: number; dropped: string[] }`

**The payload is a string** — invariant 5. It is only progress data here, not block JSON, but the same boundary bug applies to any nested object, and keeping one rule is cheaper than remembering the exception.

`ProgressProvider` calls `mergeLocalState` **once** after a successful sign-in (guard with a `localStorage` flag `ict-merged` so a refresh does not re-run it) and then clears `ict-done`/`ict-quiz`. **It must never clear `ict-notes`** — CLAUDE.md §3: no reset ever clears notes.

Now that persistence is per-user, the home page's `styles.notice` block ends with a sentence that is no longer accurate. Replace **only** its final sentence:

- was: `Your progress and quiz answers are saved in your browser automatically.`
- now: `Your progress and quiz answers save to your account when you're signed in, and to your browser otherwise.`

Leave the rest of that paragraph untouched.

- [ ] **Step 5: Port the notes stack onto R2**

```bash
git checkout nextjs-migration -- components/notes app/actions/notes.ts lib/db/notes-queries.ts
```

Then three changes:

1. `uploadNoteImage` writes to **R2** via `putObject` under `notes/{userId}/{uuid}.{ext}` instead of `@vercel/blob`. There is one media path now, not two (spec §11).
2. The image proxy moves to `app/api/notes/image/route.ts` reading from R2: `getCurrentUser()`, then an ownership check that the key starts with `notes/{userId}/`, then stream `getObject(key)`. Keep returning `/api/notes/image?p={key}` as the stored URL.
3. `saveNote(lessonId, JSON.stringify(json))` and `loadNote` returning a string stay exactly as ported — that is invariant 5, and it was diagnosed the hard way.

Confirm `@vercel/blob` is absent from `package.json` afterwards.

- [ ] **Step 6: Migrate, run, stage**

```bash
pnpm db:generate && node --env-file=.env.local ./node_modules/drizzle-kit/bin.cjs migrate
pnpm lint && pnpm test:unit && pnpm build && pnpm test:e2e
git add lib/db app/actions components/progress components/notes components/quiz app/api/notes drizzle \
        tests/unit/merge-local.test.ts
```

Expected: `public: 11 table(s)`.

---

### Task 23: The exam

**Files:**
- Create: `components/quiz/Exam.tsx`, `components/quiz/exam.module.css`, `app/api/exam/[id]/route.ts`, `app/actions/exam.ts`
- Modify: `app/lesson/[id]/page.tsx`
- Test: `tests/e2e/exam.spec.ts`

Behaviour, reproduced from `engine/app.js` on `main`: nothing is graded until **Submit**; the pass mark is **80%**; it is retakeable; and `picks` are stored **by option text** because options re-shuffle on every render.

- [ ] **Step 1: Write the exam route**

Identical gating to the quiz route — an exam is members-only by nature — but keyed on the exam lesson's own id and returning the question count in the response so the page can state it:

```ts
// app/api/exam/[id]/route.ts — same 401 shape as /api/quiz/[id]
// returns { questions: [...], passMark: 0.8, saved: ExamResult | null }
```

Include the user's saved `examResults` row in the same response so the client restores a previous attempt in one round trip.

- [ ] **Step 2: Write `components/quiz/Exam.tsx`**

A client component. Rules to implement exactly:

- All questions render at once with radio-style option buttons; **no grading, no colour, no explanation** until Submit.
- Submit computes `score = correct / total`, calls `submitExam(lessonId, JSON.stringify({ picks, score }))`, then reveals every question's correctness and explanation.
- The result line states the score, the 80% pass mark, and pass/fail.
- "Retake" clears local state and resets to the ungraded view; `taken` increments and `best` keeps the maximum server-side.
- Restoring: if `saved.submitted`, render the graded view immediately, matching `picks` by **option text** against the freshly shuffled options.

- [ ] **Step 3: Mount it and write the e2e**

On the lesson page: `{meta.kind === "exam" ? <Exam lessonId={id} /> : null}`.

```ts
// tests/e2e/exam.spec.ts — signed in as the member fixture from Task 24
test("the exam grades nothing until submit, then scores against 80%", async ({ page }) => {
  await page.goto("/lesson/s1-exam");
  const opts = page.locator("[data-exam-option]");
  await expect(opts.first()).toBeVisible();

  await opts.first().click();
  // Still ungraded: no correct/wrong styling, no explanation revealed.
  await expect(page.locator("[data-exam-correct]")).toHaveCount(0);
  await expect(page.locator("[data-exam-explanation][data-shown='true']")).toHaveCount(0);

  await page.getByRole("button", { name: /submit/i }).click();
  await expect(page.getByText(/%/)).toBeVisible();
  await expect(page.getByText(/80%/)).toBeVisible();
  await expect(page.locator("[data-exam-explanation][data-shown='true']").first()).toBeVisible();

  // Retakeable, and the graded state survives a reload before the retake.
  await page.reload();
  await expect(page.locator("[data-exam-explanation][data-shown='true']").first()).toBeVisible();
  await page.getByRole("button", { name: /retake/i }).click();
  await expect(page.locator("[data-exam-explanation][data-shown='true']")).toHaveCount(0);
});
```

Add the `data-exam-*` attributes to `Exam.tsx` as the test's stable hooks — they are cheaper and less brittle than class-name selectors under CSS Modules.

- [ ] **Step 4: Run and stage**

```bash
pnpm lint && pnpm build && pnpm test:e2e
git add components/quiz app/api/exam app/actions/exam.ts app/lesson tests/e2e/exam.spec.ts
```

---

### Task 24: The Playwright suite that replaces `verify.py`

**Files:**
- Create: `tests/e2e/fixtures/auth.ts`, `tests/e2e/setup/seed.ts`, `tests/e2e/lightbox.spec.ts`, `tests/e2e/all-lessons.spec.ts`
- Modify: `playwright.config.ts`

`verify.py`'s checks, carried over and extended. Every one of these is a check the static site had and must not lose:

| `verify.py` check | New home |
|---|---|
| every lesson present | `all-lessons.spec.ts` — walks the catalog, asserts 200 + hero for each |
| every chart image resolves | `media.spec.ts` (Task 16) + `all-lessons.spec.ts` naturalWidth sweep |
| every quiz renders 4 options, shuffles, grades on click | `quiz.spec.ts`, signed in |
| every quiz exposes a working reset | `quiz.spec.ts` — reset clears graded state |
| lightbox opens, browses, zooms, closes on outside click but not on the image | `lightbox.spec.ts` |
| review + exam pages render; exam grades on submit | `exam.spec.ts`, `lessons.spec.ts` |
| the summary's stated question count matches the exam | `exam.spec.ts` — new assertion, see below |
| a video link per lesson with a non-empty `video.txt` | `all-lessons.spec.ts` |
| zero console/page JS errors | a shared `expectNoErrors` helper used by every spec |
| **new:** gating as security | `gating.spec.ts` (Task 21) |

- [ ] **Step 1: Write the authenticated fixture**

The old branch's technique, which is the only one that works with OTP: mark the test user's `emailVerified` true directly in `neon_auth."user"`, then `POST /api/auth/sign-in/email` through `request` so the cookie is shared with the page context.

```ts
// tests/e2e/fixtures/auth.ts
import { test as base, type BrowserContext } from "@playwright/test";

export const MEMBER = { email: process.env.E2E_MEMBER_EMAIL!, password: process.env.E2E_MEMBER_PASSWORD! };

export async function signIn(ctx: BrowserContext) {
  const res = await ctx.request.post("/api/auth/sign-in/email", { data: MEMBER });
  if (!res.ok()) throw new Error(`sign-in failed: ${res.status()} ${await res.text()}`);
}

export const test = base.extend<{ member: void }>({
  member: [async ({ context }, use) => { await signIn(context); await use(); }, { auto: true }],
});
```

`tests/e2e/setup/seed.ts` (a Playwright `globalSetup`) creates the member if absent, sets `emailVerified = true`, and grants them a `scope='all'` entitlement — so the member fixture is a *real* member, not an admin taking a shortcut. It also writes one gated lesson's media id to a file for `gating.spec.ts`'s "gated charts 404 anonymously" assertion.

Add `E2E_MEMBER_EMAIL` / `E2E_MEMBER_PASSWORD` to `.env.example` and `.env.local`, and ask the user before creating a user row in their auth database.

- [ ] **Step 2: Write `tests/e2e/all-lessons.spec.ts`**

For every id in the catalog, signed in as the member: request the page, assert 200, assert the hero, assert every `figure picture img` decoded (`naturalWidth > 0`), assert a `.lesson-video` link exists exactly when the DB has a `video_url`, and assert zero console errors. 82 pages is slow — shard it with Playwright's `test.describe.configure({ mode: "parallel" })` and assert on the request/response level where a full page render is not needed.

- [ ] **Step 3: Write `tests/e2e/lightbox.spec.ts` — the three documented traps**

```ts
test("clicking a chart opens the whole lesson's set and browses it", async ({ page }) => {
  await page.goto("/lesson/m4-03");
  await page.locator("figure picture img").first().click();
  await expect(page.locator(".lb-stage img")).toBeVisible();
  const first = await page.locator(".lb-stage img").getAttribute("src");
  await page.getByRole("button", { name: /next/i }).click();
  expect(await page.locator(".lb-stage img").getAttribute("src")).not.toBe(first);
});

test("an outside click closes it but a click on the image does not", async ({ page }) => {
  await page.goto("/lesson/m4-03");
  await page.locator("figure picture img").first().click();
  const img = page.locator(".lb-stage img");
  await expect(img).toBeVisible();

  // REAL mouse input, never el.click(): a synthetic click passes through the
  // e.target fallback and hides the pointer-capture retargeting bug.
  const box = (await img.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(img).toBeVisible(); // clicking the image must NOT close

  await page.mouse.click(5, 5);
  await expect(img).toBeHidden();
});

test("zoom keeps the caption panel pinned", async ({ page }) => {
  await page.goto("/lesson/m4-03");
  await page.locator("figure picture img").first().click();
  const panelBefore = (await page.locator(".lb-panel").boundingBox())!;
  await page.getByRole("button", { name: /zoom in/i }).click();
  const panelAfter = (await page.locator(".lb-panel").boundingBox())!;
  expect(Math.abs(panelAfter.y - panelBefore.y)).toBeLessThan(2);
});
```

Read the ported `LightboxProvider` for the real selectors and button labels before writing these — the class names above come from the static site's markup and the React port may differ.

- [ ] **Step 4: Add the summary-vs-exam count assertion**

`verify.py` checked that the prose count a `summary.html` states matches the exam that actually renders. Reproduce it against the DB:

```ts
test("the summary's stated question count matches the exam", async ({ request }) => {
  const page = await (await request.get("/lesson/s1-review")).text();
  const stated = /(\d+)\s+questions?/i.exec(page)?.[1];
  const exam = await (await request.get("/api/exam/s1-exam")).json();
  if (stated) expect(Number(stated)).toBe(exam.questions.length);
  // A summary may state no count; it may not state a wrong one.
});
```

- [ ] **Step 5: Run the whole suite and stage**

```bash
pnpm test:e2e
git add tests playwright.config.ts .env.example
```

---

### Task 25: CI

**Files:**
- Create: `.github/workflows/nextjs-ci.yml`
- Modify: `.github/workflows/ci.yml` (the legacy `build.py`/`verify.py` workflow)

- [ ] **Step 1: Write the workflow**

Jobs: `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm test:unit` → `pnpm build` → `pnpm test:e2e`. Secrets needed as repo secrets: `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `ADMIN_EMAILS`, the four `R2_*`, `REVALIDATE_SECRET`, `E2E_MEMBER_*`.

**The unit tests need no secrets** — the round-trip gate, the parser, the exporter, `canRead` and `planMerge` are all pure and read only `content/`. Split them into a job that runs with no environment at all, so a fork PR still gets the fidelity gate and the gating logic checked. The DB-backed e2e job runs only when the secrets are present (`if: github.event_name == 'push' || github.repository == github.event.pull_request.head.repo.full_name`).

Upload `playwright-report/` as an artifact on failure.

- [ ] **Step 2: Decide the legacy workflow's fate**

`.github/workflows/ci.yml` runs `build.py` and asserts the committed `index.html` is in sync with `content/`. That check is still **true and useful** while `content/` remains the importer's input: it proves the source tree is well-formed. But the spec retires the static build.

**Ask the user** rather than deciding: keep it as a source-tree lint, or delete it with the static build. Recommended — keep it until the CMS (project #2) makes `content/` non-authoritative, then delete both together. Do not delete `build.py`, `verify.py` or `index.html` in this project either way; the spec retires them, but that is a separate, explicitly-requested cleanup.

- [ ] **Step 3: Stage**

```bash
git add .github/workflows
```

**P4 gate:** the full suite green locally, CI configured, and the summary of what still needs the user — repo secrets, the legacy-workflow decision, and the final authenticated walkthrough (sign in, read a members lesson, take a quiz and an exam, write a note with a pasted image).

---

## Appendix: what this plan deliberately does not do

- **Retire the static build.** `build.py`, `verify.py`, `index.html` and `engine/` stay on this branch untouched. The spec retires them; doing so is a separate request.
- **Delete `content/` or `images/`.** They remain the importer's input.
- **The admin CMS** (project #2) or **billing** (project #3). `saveLessonBody`, `setLessonAccess`, `publishLesson` and the `entitlements` table are the seams they will use, and they are built and tested here — but no UI and no Stripe.
- **Video hosting.** `media.kind` carries the seam; nothing uses it. Lessons keep their outbound links.
- **Search.** Not requested.

## Appendix: verification cheat-sheet

```bash
pnpm test:unit                                    # pure: blocks, parser, exporter, round-trip, access, merge
pnpm test:unit tests/unit/roundtrip.test.ts       # THE import fidelity gate — 80 files
pnpm lint && pnpm build                           # types + prerender (only free lessons prerender)
pnpm test:e2e                                     # rendering, gating-as-security, quiz, exam, lightbox
node --env-file=.env.local scripts/db-ping.mjs    # connectivity + table counts
node --env-file=.env.local --experimental-strip-types scripts/import-content.mjs --dry-run
```

Stale `next start` on port 3000 serves an old build and produces confusing failures:

```bash
netstat -ano | grep :3000 && taskkill //PID <pid> //F
```
