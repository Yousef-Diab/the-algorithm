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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

/** @returns {ManifestEntry[]} */
function loadManifest() {
  if (force || !existsSync(MANIFEST_PATH)) return [];
  try {
    const parsed = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // A corrupt manifest should not block a resume; treat it as empty.
    return [];
  }
}

function saveManifest(entries) {
  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2));
}

// --- Plan ---------------------------------------------------------------------
const lessons = readContentTree("content").lessons.map((l) => ({ id: l.id, slug: l.slug }));
const allCharts = planMedia("images", lessons);
const charts = typeof limit === "number" && Number.isFinite(limit) ? allCharts.slice(0, limit) : allCharts;

const manifest = loadManifest();
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
