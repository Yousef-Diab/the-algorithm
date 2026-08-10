// scripts/upload-media.mjs
//
// R2 upload half of Task 15 (Task 15a). Reads the 339 chart PNGs from
// images/, derives WebP/AVIF variants, and uploads all three per chart to
// the private R2 bucket via lib/media.ts's putObject.
//
// Deliberately does NOT touch the database — that is Task 15b, which reads
// the manifest this script writes and inserts `media` rows from it, so a
// database failure never forces a re-encode.
//
// Usage:
//   node --env-file=.env.local --experimental-strip-types scripts/upload-media.mjs [--dry-run] [--force] [--limit N]
import { registerHooks } from "node:module";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// lib/content/*.ts and lib/media.ts use extensionless relative imports,
// which Node's ESM resolver does not resolve. Those files are frozen, so map
// the specifier here (same pattern as scripts/import-content.mjs).
registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith(".") && !/\.[a-z]+$/i.test(spec)) {
      const url = new URL(spec + ".ts", ctx.parentURL);
      if (existsSync(fileURLToPath(url))) return next(spec + ".ts", ctx);
    }
    return next(spec, ctx);
  },
});

const { planMedia, deriveVariants } = await import("../lib/content/import-media.ts");
const { putObject } = await import("../lib/media.ts");
const { readContentTree } = await import("../lib/content/import.ts");

// --- CLI flags --------------------------------------------------------------
const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const force = argv.includes("--force");
const limitArg = argv.find((a) => a.startsWith("--limit"));
const limit = limitArg
  ? Number(limitArg.includes("=") ? limitArg.split("=")[1] : argv[argv.indexOf(limitArg) + 1])
  : undefined;

// --- Concurrency -------------------------------------------------------------
const CONCURRENCY = 8;

// --- Manifest -----------------------------------------------------------------
const MANIFEST_PATH = join(
  process.cwd(),
  ".superpowers/sdd/2026-08-10-content-in-postgres-gated/media-manifest.json",
);

/** @typedef {{ key: string, mime: string, lessonId: string, ord: number, width: number, height: number, bytes: number, isOriginal: boolean }} ManifestEntry */

/**
 * Reads the manifest file as-is (no `--force` awareness here — that's the
 * caller's job). A missing file is NOT an error (returns `[]`); a *present
 * but corrupt* file IS an error, because silently treating corruption as
 * "nothing uploaded yet" would erase the resumability this script exists to
 * provide (F2).
 * @returns {ManifestEntry[]}
 */
function loadManifestRaw() {
  if (!existsSync(MANIFEST_PATH)) return [];
  const raw = readFileSync(MANIFEST_PATH, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `media manifest at ${MANIFEST_PATH} is corrupt and cannot be parsed as JSON ` +
        `(${err instanceof Error ? err.message : String(err)}). Refusing to silently treat it as ` +
        `empty — that would discard the record of every already-uploaded object and force a full ` +
        `re-encode/re-upload. Inspect/repair the file, or pass --force with no --limit to ` +
        `intentionally discard it and start over.`,
    );
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`media manifest at ${MANIFEST_PATH} does not contain a JSON array; refusing to treat it as empty.`);
  }
  return parsed;
}

/** Atomic write: temp file + rename, so a kill mid-write never leaves a truncated manifest (F2). */
function saveManifest(entries) {
  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  const tmpPath = `${MANIFEST_PATH}.tmp`;
  writeFileSync(tmpPath, JSON.stringify(entries, null, 2));
  renameSync(tmpPath, MANIFEST_PATH);
}

// --- Plan ---------------------------------------------------------------------
const lessons = readContentTree("content").lessons.map((l) => ({ id: l.id, slug: l.slug }));
const allCharts = planMedia("images", lessons);
const charts = typeof limit === "number" && Number.isFinite(limit) ? allCharts.slice(0, limit) : allCharts;
const scoped = typeof limit === "number" && Number.isFinite(limit);

// F1: `--force` must only discard entries for charts actually in this run's
// scope. An unscoped `--force` (no --limit) legitimately means "redo
// everything" and may skip reading the file entirely. A scoped `--force
// --limit N` must still load and preserve the ~1000 unrelated entries — only
// entries whose stem belongs to one of `charts` gets dropped, so a later
// `--media` pass never "forgets" objects that are untouched in R2/Postgres.
let manifest;
if (force && !scoped) {
  manifest = [];
} else {
  try {
    manifest = loadManifestRaw();
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
  if (force && scoped) {
    const inScopeStems = new Set(charts.map((c) => c.key.replace(/\.png$/, "")));
    const stemOf = (key) => key.replace(/\.(png|webp|avif)$/, "");
    manifest = manifest.filter((e) => !inScopeStems.has(stemOf(e.key)));
  }
}

const doneKeys = new Set(manifest.map((e) => e.key));

/** A chart is done when all three of its variant keys are already recorded. */
function isChartDone(chart) {
  const stem = chart.key.replace(/\.png$/, "");
  return (
    doneKeys.has(chart.key) && doneKeys.has(`${stem}.webp`) && doneKeys.has(`${stem}.avif`)
  );
}

const pending = charts.filter((c) => !isChartDone(c));
const skipped = charts.length - pending.length;

console.log(
  `media: ${charts.length} charts planned (${charts.length * 3} objects) · ` +
    `${skipped} already uploaded · ${pending.length} pending${dryRun ? " [dry-run]" : ""}`,
);

if (pending.length === 0) {
  console.log("media: nothing to do");
  process.exit(0);
}

if (dryRun) {
  for (const c of pending.slice(0, 10)) console.log(`  would upload ${c.key}`);
  if (pending.length > 10) console.log(`  ...and ${pending.length - 10} more`);
  process.exit(0);
}

// --- Upload with bounded concurrency ------------------------------------------
let uploaded = 0;
let failed = 0;
const failures = [];

async function uploadChart(chart) {
  const png = readFileSync(chart.file);
  const variants = await deriveVariants(png, chart.key);
  const [original] = variants;

  for (const v of variants) {
    await putObject(v.key, v.body, v.mime);
    manifest.push({
      key: v.key,
      mime: v.mime,
      lessonId: chart.lessonId,
      ord: chart.ord,
      width: v.width,
      height: v.height,
      bytes: v.body.byteLength,
      isOriginal: v.key === original.key,
    });
  }
  saveManifest(manifest); // persist incrementally — a crash must not lose prior progress
}

async function runPool(items, worker, concurrency) {
  let next = 0;
  let doneCount = 0;

  async function runOne() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      const item = items[i];
      try {
        await worker(item);
        uploaded += 1;
      } catch (err) {
        failed += 1;
        failures.push({ key: item.key, error: err instanceof Error ? err.message : String(err) });
      }
      doneCount += 1;
      if (doneCount % 25 === 0 || doneCount === items.length) {
        console.log(`  ${doneCount}/${items.length} charts processed (${uploaded} ok, ${failed} failed)`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runOne());
  await Promise.all(workers);
}

await runPool(pending, uploadChart, CONCURRENCY);

console.log(`media: ${uploaded} charts uploaded, ${failed} failed, ${skipped} skipped (already done)`);

if (failed > 0) {
  console.error("media: failures:");
  for (const f of failures) console.error(`  ${f.key}: ${f.error}`);
  process.exit(1);
}
