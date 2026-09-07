// scripts/set-status.mjs
// Usage: node --env-file=.env.local --experimental-strip-types scripts/set-status.mjs <draft|published> <lessonId…>
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// mcp/host.ts (and its dependencies) use extensionless relative imports,
// which Node's ESM resolver does not resolve. Map the specifier here — same
// shim as scripts/import-content.mjs.
registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith(".") && !/\.[a-z]+$/i.test(spec)) {
      const url = new URL(spec + ".ts", ctx.parentURL);
      if (existsSync(fileURLToPath(url))) return next(spec + ".ts", ctx);
    }
    return next(spec, ctx);
  },
});

const [status, ...ids] = process.argv.slice(2);
if (!["draft", "published"].includes(status) || ids.length === 0) {
  console.error("usage: set-status.mjs <draft|published> <lessonId…>");
  process.exit(1);
}

const { createHost, preflight } = await import("../mcp/host.ts");

// PREFLIGHT BEFORE ANY WRITE, exactly as scripts/set-access.mjs does. Checking
// only after the write commits leaves a stale readable copy in the public ISR
// cache with no way back short of a manual purge. setStatus also stamps
// publishedAt, so this is the last chance to refuse before that timestamp
// changes irreversibly.
try {
  await preflight();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}

const { writer } = createHost();

// Each id is independent: accumulate failures and keep going, exactly as
// scripts/set-access.mjs does — some writes may already have committed by
// the time one throws, so completing as many as possible beats stopping
// early and leaves the human with a full picture of what actually changed.
//
// Three distinct outcomes per id, since this script IS the publish gate:
//  - success: writer.setStatus returned true.
//  - "no such lesson": writer.setStatus returned false (RETURNING matched
//    zero rows) — e.g. a typo'd id. Must be reported, not silently skipped.
//  - thrown error: an unexpected failure (DB blip, etc).
let failed = false;
for (const id of ids) {
  try {
    const ok = await writer.setStatus(id, status);
    if (ok) {
      console.log(`${id} → ${status}`);
    } else {
      console.error(`NO SUCH LESSON: ${id} — nothing changed`);
      failed = true;
    }
  } catch (err) {
    console.error(`FAILED ${id} → ${status}: ${err instanceof Error ? err.message : String(err)}`);
    failed = true;
  }
}

if (failed) {
  console.error("one or more lessons failed to update — see FAILED lines above.");
  // exitCode, not exit(): by this point createHost() has opened the
  // neon-http driver's fetch keep-alive socket, and forcing an immediate
  // process.exit() while it's open crashes Node on Windows (libuv
  // assertion). Setting exitCode lets the event loop drain first and still
  // exits non-zero.
  process.exitCode = 1;
}
