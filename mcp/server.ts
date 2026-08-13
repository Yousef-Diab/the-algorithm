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
const { createHost, preflight } = await import("./host.ts");

const host = createHost();
const server = new Server({ name: "the-algorithm-content", version: "1.0.0" }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: "list_lessons",
    description: "List lessons with their access, status, whether a draft is pending, and provenance.",
    inputSchema: { type: "object", properties: { sectionId: { type: "string" } } },
  },
  {
    name: "get_lesson",
    description: "Full lesson row including the live body and any pending draft body.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
];

TOOLS.push(
  {
    name: "write_lesson_body",
    description: "Write the lesson's DRAFT body. Never touches the live body. Requires sourceRef, a real path under transcripts/ or notes/.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, blocks: { type: "array" }, sourceRef: { type: "string" } },
      required: ["id", "blocks", "sourceRef"],
    },
  },
  {
    name: "write_lesson_meta",
    description: "Update title/heading/crumb/desc/videoUrl. Applies LIVE (this metadata is already public via the catalog). slug is not writable.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, patch: { type: "object" } }, required: ["id", "patch"] },
  },
  {
    name: "upsert_quiz",
    description: "Insert/update questions, preserving question_id so user answers survive. Refused while a draft body is pending.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, questions: { type: "array" }, deleteMissing: { type: "boolean" } },
      required: ["id", "questions"],
    },
  },
  {
    name: "create_lesson",
    description: "Create a text-only lesson. Starts as an unpublished draft; access defaults to members.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, sectionId: { type: "string" } }, required: ["id", "sectionId"] },
  },
);

function ok(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function err(e: unknown) {
  return { isError: true, content: [{ type: "text", text: e instanceof Error ? e.message : String(e) }] };
}

// STDIO ONLY. An HTTP transport would recreate the public authenticated write
// surface this design deliberately refused.
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: a = {} } = req.params as { name: string; arguments?: Record<string, unknown> };
  try {
    switch (name) {
      case "list_lessons":
        return ok(await host.admin.listLessonsAdmin(a.sectionId as string | undefined));
      case "get_lesson":
        return ok(await host.admin.getLessonForEdit(a.id as string));
      case "write_lesson_body":
        await preflight();
        await host.writer.writeLessonBody(a.id as string, a.blocks, a.sourceRef as string);
        return ok({ ok: true, wrote: "body_draft", note: "not visible to readers until a human promotes it" });
      case "write_lesson_meta":
        await preflight();
        await host.writer.writeLessonMeta(a.id as string, a.patch);
        return ok({ ok: true, applied: "live" });
      case "upsert_quiz":
        await preflight();
        return ok(await host.writer.upsertQuiz(a.id as string, a.questions, a.deleteMissing === true));
      case "create_lesson":
        await preflight();
        return ok({ id: await host.writer.createLesson(a) });
      default:
        throw new Error(`unknown tool: ${name}`);
    }
  } catch (e) {
    return err(e);
  }
});

await server.connect(new StdioServerTransport());
