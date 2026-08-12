import { existsSync } from "node:fs";
import { resolve, relative, sep } from "node:path";
import type { Inline } from "./blocks";

export interface QuizInput {
  id?: string;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface MetaPatch {
  title?: string;
  heading?: string;
  crumb?: string;
  desc?: Inline[];
  videoUrl?: string | null;
}

function fail(msg: string): never {
  throw new Error(`invalid write: ${msg}`);
}

/** Mirrors blocks.ts's assertInlines — kept local so this module imports no runtime code. */
function assertInlines(v: unknown, where: string): Inline[] {
  if (!Array.isArray(v)) fail(`${where}: expected an array of inline nodes`);
  return v.map((n, i) => {
    if (typeof n !== "object" || n === null) fail(`${where}[${i}]: expected an object`);
    const node = n as Record<string, unknown>;
    switch (node.t) {
      case "text":
        if (typeof node.v !== "string") fail(`${where}[${i}]: text.v must be a string`);
        return { t: "text", v: node.v } as Inline;
      case "br":
        return { t: "br" } as Inline;
      case "strong":
      case "em":
      case "src":
        return { t: node.t, c: assertInlines(node.c, `${where}[${i}]/${node.t}`) } as Inline;
      default:
        return fail(`${where}[${i}]: unknown inline type "${String(node.t)}"`);
    }
  });
}

export function assertQuiz(v: unknown): QuizInput[] {
  if (!Array.isArray(v)) fail("questions must be an array");
  return v.map((raw, i) => {
    const at = `question[${i}]`;
    if (typeof raw !== "object" || raw === null) fail(`${at}: expected an object`);
    const q = raw as Record<string, unknown>;
    if (q.id !== undefined && typeof q.id !== "string") fail(`${at}: id must be a uuid string when supplied`);
    if (typeof q.q !== "string" || q.q.length === 0) fail(`${at}: q must be a non-empty string`);
    if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o) => typeof o !== "string"))
      fail(`${at}: options must be an array of exactly 4 strings`);
    if (typeof q.answer !== "number" || !Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
      fail(`${at}: answer must be a 0-based index into options`);
    if (typeof q.explanation !== "string" || q.explanation.length === 0)
      fail(`${at}: explanation must be a non-empty string`);
    return {
      ...(q.id ? { id: q.id as string } : {}),
      q: q.q,
      options: q.options as string[],
      answer: q.answer,
      explanation: q.explanation,
    };
  });
}

const META_KEYS = ["title", "heading", "crumb", "desc", "videoUrl"] as const;

export function assertMeta(v: unknown): MetaPatch {
  if (typeof v !== "object" || v === null) fail("meta must be an object");
  const m = v as Record<string, unknown>;
  // The slug is the chart filename stem the media manifest keys on, and it
  // carries a unique index. Renaming it in the DB alone decouples the two.
  if ("slug" in m) fail("slug is not writable");
  const out: MetaPatch = {};
  for (const k of META_KEYS) {
    if (!(k in m)) continue;
    if (k === "desc") out.desc = assertInlines(m.desc, "desc");
    else if (k === "videoUrl") {
      if (m.videoUrl !== null && typeof m.videoUrl !== "string") fail("videoUrl must be a string or null");
      out.videoUrl = m.videoUrl as string | null;
    } else {
      if (typeof m[k] !== "string" || (m[k] as string).length === 0) fail(`${k} must be a non-empty string`);
      out[k] = m[k] as string;
    }
  }
  return out;
}

const SOURCE_ROOTS = ["transcripts", "notes"];

/**
 * §1 AUDITABILITY. This verifies the citation EXISTS, not that it supports the
 * prose — see the spec §6, which is deliberately honest that the human promote
 * gate is the real control. This raises the floor from "unchecked string" to
 * "checked pointer" for about five lines.
 */
export function assertSourceRef(ref: unknown, repoRoot: string): string {
  if (typeof ref !== "string" || ref.length === 0) fail("sourceRef is required on a body write");
  const abs = resolve(repoRoot, ref);
  const rel = relative(repoRoot, abs);
  const root = rel.split(sep)[0];
  if (rel.startsWith("..") || !SOURCE_ROOTS.includes(root))
    fail(`sourceRef must be a path under transcripts/ or notes/ (got "${ref}")`);
  if (!existsSync(abs)) fail(`sourceRef does not exist: ${ref}`);
  return ref;
}
