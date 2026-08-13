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

for (const id of ids) {
  await writer.setStatus(id, status);
  console.log(`${id} → ${status}`);
}
