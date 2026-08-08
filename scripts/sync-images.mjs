// Mirror images/ -> public/images before dev/build so the Astro dev server and
// the static build can serve the chart PNGs. images/ stays the authoring
// location (one place to drop charts); public/images is a build-time mirror
// that is git-ignored.
import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(ROOT, "images");
const dst = join(ROOT, "public", "images");

mkdirSync(dirname(dst), { recursive: true });
cpSync(src, dst, { recursive: true });
console.log("synced images/ -> public/images/");
