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

const { Server } = await import("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
const { ListToolsRequestSchema, CallToolRequestSchema } = await import("@modelcontextprotocol/sdk/types.js");
const { createHost } = await import("./host.ts");

const host = createHost();
const server = new Server({ name: "the-algorithm-content", version: "1.0.0" }, { capabilities: { tools: {} } });

const TOOLS: unknown[] = []; // filled in by Tasks 10 and 11

// STDIO ONLY. An HTTP transport would recreate the public authenticated write
// surface this design deliberately refused.
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

await server.connect(new StdioServerTransport());
