// scripts/promote-draft.mjs
// Usage: node --env-file=.env.local --experimental-strip-types scripts/promote-draft.mjs <promote|discard> <lessonId…>
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

const [verb, ...ids] = process.argv.slice(2);
if (!["promote", "discard"].includes(verb) || ids.length === 0) {
  console.error("usage: promote-draft.mjs <promote|discard> <lessonId…>");
  process.exit(1);
}

const { createHost, preflight } = await import("../mcp/host.ts");

// PREFLIGHT BEFORE ANY WRITE, exactly as scripts/set-access.mjs does. Checking
// only after the write commits leaves a stale readable copy in the public ISR
// cache with no way back short of a manual purge.
try {
  await preflight();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}

const { writer } = createHost();

// Each id is independent: accumulate failures and keep going, exactly as
// scripts/set-access.mjs and scripts/set-status.mjs do — some writes may
// already have committed by the time one throws, so completing as many as
// possible beats stopping early. The try/catch covers an UNEXPECTED throw
// (transient DB error, network blip); the boolean already covers the
// EXPECTED "no draft pending" case.
let failed = false;
for (const id of ids) {
  try {
    const ok = verb === "promote" ? await writer.promoteDraft(id) : await writer.discardDraft(id);
    console.log(`${verb} ${id}: ${ok ? "done" : "NO DRAFT PENDING — nothing changed"}`);
    if (!ok) failed = true;
  } catch (err) {
    console.error(`FAILED ${verb} ${id}: ${err instanceof Error ? err.message : String(err)}`);
    failed = true;
  }
}

if (failed) {
  // exitCode, not exit(): the neon-http driver's fetch keep-alive socket is
  // still open at this point, and forcing an immediate process.exit() while
  // it's open crashes Node on Windows (libuv assertion). Setting exitCode
  // lets the event loop drain first and still exits non-zero.
  process.exitCode = 1;
}
