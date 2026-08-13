// scripts/import-content.mjs
// Usage: node --env-file=.env.local --experimental-strip-types scripts/import-content.mjs [--dry-run] [--only <id>] [--force]
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// lib/content/*.ts use extensionless relative imports, which Node's ESM
// resolver does not resolve. Those files are frozen, so map the specifier here.
registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith(".") && !/\.[a-z]+$/i.test(spec)) {
      const url = new URL(spec + ".ts", ctx.parentURL);
      if (existsSync(fileURLToPath(url))) return next(spec + ".ts", ctx);
    }
    return next(spec, ctx);
  },
});

const { drizzle } = await import("drizzle-orm/neon-http");
const { neon } = await import("@neondatabase/serverless");
const { eq, sql, inArray } = await import("drizzle-orm");
const { readContentTree } = await import("../lib/content/import.ts");
const { assertBlocks } = await import("../lib/content/blocks.ts");
const { sections, months, lessons, quizQuestions } = await import("../lib/db/schema.ts");
const { importDecision } = await import("../lib/content/import-guard.ts");

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const onlyIx = process.argv.indexOf("--only");
const only = onlyIx >= 0 ? process.argv[onlyIx + 1] : null;
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

// `--only <id>` that matches nothing used to filter every lesson out, print
// the unchanged "written: 82 lessons, 564 questions" totals and exit 0 — a
// phantom success on an import that imported nothing. Checked BEFORE the DB
// connection is opened, so process.exit is safe here (see the exitCode note in
// set-status.mjs for why it would not be afterwards).
if (only && !plan.lessons.some((l) => l.id === only)) {
  console.error(`--only ${only}: no lesson with that id is in content/ — nothing would be written.`);
  process.exit(1);
}

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

let skipped = 0;
for (const l of plan.lessons) {
  if (only && l.id !== only) continue;

  const [existing] = await db
    .select({ writeOrigin: lessons.writeOrigin, bodyDraft: lessons.bodyDraft })
    .from(lessons)
    .where(eq(lessons.id, l.id))
    .limit(1);
  const decision = importDecision(existing ?? null, force);
  if (!decision.write) {
    console.warn(`SKIP ${l.id}: ${decision.reason}`);
    skipped++;
    continue;
  }

  const { questions, ...row } = l;
  // status, access, publishedAt, bodyDraft, sourceRef, sourceRefDraft and
  // writeOrigin are NOT in `set`: an import must never re-publish a lesson a
  // human pulled down, reopen a lesson the CMS closed, restamp its publish
  // time, destroy a pending draft, or erase provenance.
  //
  // status joined that list because the import guard protects the BODY and the
  // DRAFT but not the visibility decision: `pnpm content:status draft m2-07`
  // leaves a write_origin='import' row with no pending draft, so
  // importDecision returns {write:true} and the next `pnpm content:import`
  // silently flipped it back to published. Like access and publishedAt, it is
  // still set on the INSERT path, so a brand-new lesson is still born
  // published.
  //
  // updatedAt DOES belong in `set` — it genuinely describes the latest write.
  const values = { ...row, updatedAt: new Date() };
  await db
    .insert(lessons)
    .values({ ...values, status: "published", access: "members", publishedAt: new Date() })
    .onConflictDoUpdate({ target: lessons.id, set: values });

  await db.delete(quizQuestions).where(eq(quizQuestions.lessonId, l.id));
  if (questions.length) {
    await db.insert(quizQuestions).values(questions.map((q) => ({ ...q, lessonId: l.id })));
  }
}
if (skipped) console.log(`skipped ${skipped} lesson(s) that were not writable`);

const [{ n: nl }] = await db.select({ n: sql`count(*)::int` }).from(lessons);
const [{ n: nq }] = await db.select({ n: sql`count(*)::int` }).from(quizQuestions);
console.log(`written: ${nl} lessons, ${nq} questions`);

// --- media pass (opt-in: --media) -------------------------------------------
// Reads the manifest scripts/upload-media.mjs already produced (Task 15a) and
// writes `media` rows from it. Never re-encodes, never re-uploads: every
// value the table needs (storageKey, mime, width, height, bytes, lessonId,
// ord, isOriginal) is already in the manifest.
if (process.argv.includes("--media")) {
  const { readFileSync, existsSync } = await import("node:fs");
  const { media } = await import("../lib/db/schema.ts");

  const MANIFEST_PATH = "./.superpowers/sdd/2026-08-10-content-in-postgres-gated/media-manifest.json";
  if (!existsSync(MANIFEST_PATH)) {
    console.error(
      `media: manifest not found at ${MANIFEST_PATH} — run scripts/upload-media.mjs first`,
    );
    process.exit(1);
  }

  /** @type {{key:string,mime:string,lessonId:string,ord:number,width:number,height:number,bytes:number,isOriginal:boolean}[]} */
  const rawManifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  if (!Array.isArray(rawManifest) || rawManifest.length === 0) {
    console.error(`media: manifest at ${MANIFEST_PATH} is empty — run scripts/upload-media.mjs first`);
    process.exit(1);
  }

  // Dedupe by key: a crash mid-chart followed by a resume can record one key
  // twice, and a duplicate would collide with the unique index on storage_key.
  const byKey = new Map();
  for (const e of rawManifest) byKey.set(e.key, e);
  const entries = [...byKey.values()];

  const originals = entries.filter((e) => e.isOriginal);
  const derivatives = entries.filter((e) => !e.isOriginal);

  console.log(
    `media: manifest has ${entries.length} objects (${originals.length} originals, ${derivatives.length} derivatives)`,
  );

  // Idempotent: delete before insert, keyed on storage_key. Delete originals
  // first — variant_of cascades, so removing an original also removes its
  // derivatives, which is why order matters.
  const CHUNK = 300;
  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  for (const c of chunk(originals, CHUNK)) {
    await db.delete(media).where(inArray(media.storageKey, c.map((e) => e.key)));
  }
  for (const c of chunk(derivatives, CHUNK)) {
    await db.delete(media).where(inArray(media.storageKey, c.map((e) => e.key)));
  }

  const keyToId = new Map();
  for (const c of chunk(originals, CHUNK)) {
    // NOTE: media.id is regenerated (defaultRandom()) on every idempotent
    // re-run of this pass, because it's delete-then-insert keyed on
    // storage_key, not id. storage_key is the stable identity — never cache
    // or link a media row by id across re-imports.
    const rows = await db
      .insert(media)
      .values(
        c.map((e) => ({
          lessonId: e.lessonId,
          kind: "image",
          ord: e.ord,
          storageKey: e.key,
          mime: e.mime,
          width: e.width,
          height: e.height,
          bytes: e.bytes,
          alt: "",
        })),
      )
      .returning({ id: media.id, storageKey: media.storageKey });
    for (const r of rows) keyToId.set(r.storageKey, r.id);
  }

  function stemOf(key) {
    return key.replace(/\.(png|webp|avif)$/, "");
  }

  const derivativeRows = derivatives.map((e) => {
    const originalKey = `${stemOf(e.key)}.png`;
    const variantOf = keyToId.get(originalKey);
    if (!variantOf) {
      throw new Error(`media: no original found for derivative ${e.key} (expected ${originalKey})`);
    }
    return {
      lessonId: e.lessonId,
      kind: "image",
      ord: e.ord,
      storageKey: e.key,
      mime: e.mime,
      width: e.width,
      height: e.height,
      bytes: e.bytes,
      variantOf,
      alt: "",
    };
  });

  for (const c of chunk(derivativeRows, CHUNK)) {
    await db.insert(media).values(c);
  }

  const [{ n: nm }] = await db.select({ n: sql`count(*)::int` }).from(media);
  console.log(`media: ${nm} rows written (${originals.length} originals, ${derivativeRows.length} derivatives)`);
}
