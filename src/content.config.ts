// Content layer for the new static site.
//
// Custom loaders walk the existing `content/` folder exactly like build.py
// used to: section.js / months.js are bare JS object literals, lessons are
// folders with lesson.html + quiz.js + video.txt, and chart counts come from
// images/{slug}-NN.png. No lesson content is migrated or reformatted — the
// authoring convention stays the same, the renderer changed.
import { defineCollection, z } from "astro:content";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Loader } from "astro/loaders";
import type {
  LessonData,
  MonthData,
  Question,
  SectionData,
  Segment,
} from "./lib/course";

const ROOT = process.cwd();
const CONTENT = join(ROOT, "content");
const IMAGES = join(ROOT, "images");

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const SEMI_BRACE_RE = /;\s*}/g;
const SEMI_END_RE = /;\s*$/;
const CHART_FILE_RE = /^(.+)-(\d{2})\.png$/;
const LESSON_ID_RE = /<section\b[^>]*\bid="([^"]+)"/;
const DATA_TITLE_RE = /data-title="([^"]+)"/;
const DESC_RE = /<div class="desc">\s*([\s\S]*?)\s*<\/div>/;
const CRUMB_RE = /<div class="crumb">\s*([\s\S]*?)\s*<\/div>/;
const DATA_SLUG_RE = /data-slug="([^"]+)"/;
const WRAP_OPEN_RE = /^\s*<section\b[^>]*>/;
const WRAP_CLOSE_RE = /<\/section>\s*$/;

function jsEval(code: string): unknown {
  // Tolerate a trailing `;` — some source files were saved by a formatter
  // that puts one before the closing brace ({ ...; }) or at the very end.
  const src = code.trim().replace(SEMI_BRACE_RE, "}").replace(SEMI_END_RE, "");
  return new Function(`return (${src});`)();
}

/** Parse one bare object literal per line / per block (months.js style). */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: string-quote state machine
function parseObjLiterals(code: string): unknown[] {
  const out: unknown[] = [];
  const src = code.trim();
  let i = 0;
  while (i < src.length) {
    const start = src.indexOf("{", i);
    if (start === -1) {
      break;
    }
    let depth = 0;
    let inStr = false;
    let quote = "";
    let j = start;
    for (; j < src.length; j += 1) {
      const ch = src[j];
      if (inStr) {
        if (ch === "\\") {
          j += 1;
        } else if (ch === quote) {
          inStr = false;
        }
      } else if (ch === '"' || ch === "'") {
        inStr = true;
        quote = ch;
      } else if (ch === "{") {
        depth += 1;
      } else if (ch === "}") {
        depth -= 1;
        if (depth === 0) {
          break;
        }
      }
    }
    if (depth !== 0) {
      throw new Error(`unbalanced object literal at offset ${start}`);
    }
    out.push(jsEval(src.slice(start, j + 1)));
    i = j + 1;
  }
  return out;
}

/** Remove the first <div class="…"> block (balanced nesting) and return both parts. */
function cutDiv(
  html: string,
  className: string
): { rest: string; div: string } {
  const re = new RegExp(
    `<div\\b[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`
  );
  const start = html.search(re);
  if (start === -1) {
    return { div: "", rest: html };
  }
  let depth = 0;
  const tagRe = /<div\b[^>]*>|<\/div>/g;
  tagRe.lastIndex = start;
  let m: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: exec-advance pattern; tagRe.lastIndex is stateful
  while ((m = tagRe.exec(html))) {
    if (m[0].startsWith("</div>")) {
      depth -= 1;
    } else {
      depth += 1;
    }
    if (depth === 0) {
      return {
        div: html.slice(start, m.index + m[0].length),
        rest: html.slice(0, start) + html.slice(m.index + m[0].length),
      };
    }
  }
  return { div: "", rest: html };
}

/** Chart counts per slug: sequential images/{slug}-01.png … until a gap. */
function chartCounts(): Map<string, number> {
  const map = new Map<string, number>();
  if (!existsSync(IMAGES)) {
    return map;
  }
  for (const file of readdirSync(IMAGES)) {
    const m = CHART_FILE_RE.exec(file);
    if (!m) {
      continue;
    }
    const n = Number.parseInt(m[2], 10);
    const cur = map.get(m[1]) ?? 0;
    if (n > cur) {
      map.set(m[1], n);
    }
  }
  return map;
}

/* ------------------------------------------------------------------ */
/* walking content/                                                    */
/* ------------------------------------------------------------------ */

interface WalkResult {
  lessons: { data: LessonData }[];
  months: { data: MonthData }[];
  sections: { data: SectionData }[];
}

let cache: WalkResult | null = null;

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: content-tree walker needs nested branches
function walk(): WalkResult {
  if (cache) {
    return cache;
  }
  const counts = chartCounts();
  const sections: WalkResult["sections"] = [];
  const months: WalkResult["months"] = [];
  const lessons: WalkResult["lessons"] = [];
  let sOrder = 0;

  for (const sdir of readdirSync(CONTENT).sort()) {
    const sPath = join(CONTENT, sdir);
    if (!existsSync(join(sPath, "section.js"))) {
      continue;
    }

    const meta = jsEval(
      readFileSync(join(sPath, "section.js"), "utf8")
    ) as Record<string, unknown>;
    const secId = String(meta.id);
    const label = typeof meta.label === "string" ? meta.label : "Month";

    // exam.js — array literal, may contain /* … */ comments (valid JS)
    let exam: Question[] | null = null;
    const examPath = join(sPath, "exam.js");
    if (existsSync(examPath)) {
      exam = jsEval(readFileSync(examPath, "utf8")) as Question[];
    }

    // summary.html — body minus the review-footer slot and the lesson-hero
    // (the review page renders its own hero)
    let summary: string | null = null;
    const sumPath = join(sPath, "summary.html");
    if (existsSync(sumPath)) {
      let raw = readFileSync(sumPath, "utf8");
      raw = cutDiv(raw, "review-footer").rest;
      raw = cutDiv(raw, "lesson-hero").rest;
      summary = raw.trim();
    }

    const monthIds: string[] = [];
    const monthsFile = join(sPath, "months.js");
    const monthList = existsSync(monthsFile)
      ? (parseObjLiterals(readFileSync(monthsFile, "utf8")) as Record<
          string,
          unknown
        >[])
      : [];
    monthList.forEach((m, i) => {
      const id = String(m.id);
      monthIds.push(id);
      months.push({
        data: {
          desc: String(m.desc ?? ""),
          id,
          label,
          order: i,
          section: secId,
          title: String(m.title),
        },
      });
    });

    let mIndex = 0;
    for (const mdir of readdirSync(sPath).sort()) {
      if (!monthIds.includes(mdir)) {
        continue;
      }
      const mPath = join(sPath, mdir);
      let lIndex = 0;
      for (const ldir of readdirSync(mPath).sort()) {
        const lessonHtml = join(mPath, ldir, "lesson.html");
        if (!existsSync(lessonHtml)) {
          continue;
        }
        lessons.push({
          data: makeLesson(secId, mdir, mIndex, lIndex, lessonHtml, counts),
        });
        lIndex += 1;
      }
      mIndex += 1;
    }

    sections.push({
      data: {
        desc: String(meta.desc ?? ""),
        exam,
        id: secId,
        label,
        months: monthIds,
        order: sOrder,
        short: String(meta.short),
        summary,
        title: String(meta.title),
      },
    });
    sOrder += 1;
  }

  // Global lesson order: sections → months → lessons, in walk order.
  lessons.forEach((l, i) => {
    l.data.order = i;
  });

  cache = { lessons, months, sections };
  return cache;
}

function makeLesson(
  secId: string,
  monthId: string,
  monthIndex: number,
  monthLessonIndex: number,
  htmlPath: string,
  counts: Map<string, number>
): LessonData {
  const dir = join(htmlPath, "..");
  const raw = readFileSync(htmlPath, "utf8");

  const id = LESSON_ID_RE.exec(raw)?.[1] ?? "";
  const title = DATA_TITLE_RE.exec(raw)?.[1] ?? "";
  const desc = DESC_RE.exec(raw)?.[1]?.trim() ?? "";
  const crumb = CRUMB_RE.exec(raw)?.[1]?.trim() ?? "";

  // the source wraps the lesson in a <section class="lesson">; the page
  // renders its own <article class="lesson">, so unwrap before splitting
  const unwrapped = raw.replace(WRAP_OPEN_RE, "").replace(WRAP_CLOSE_RE, "");

  // strip the hero (the page re-renders it), then split the body into
  // interleaved html chunks and figure slots, preserving document order
  const body = cutDiv(unwrapped, "lesson-hero").rest;
  const segments: Segment[] = [];
  let cursor = body;
  for (;;) {
    const cut = cutDiv(cursor, "fig-slot");
    if (!cut.div) {
      break;
    }
    const at = cursor.indexOf(cut.div);
    if (at > 0) {
      segments.push({ html: cursor.slice(0, at), t: "h" });
    }
    const slug = DATA_SLUG_RE.exec(cut.div)?.[1];
    if (slug) {
      segments.push({ count: counts.get(slug) ?? 0, slug, t: "f" });
    }
    cursor = cursor.slice(at + cut.div.length);
  }
  // trailing interactive slots
  cursor = cutDiv(cursor, "quiz").rest;
  cursor = cutDiv(cursor, "lesson-footer").rest;
  if (cursor.trim()) {
    segments.push({ html: cursor, t: "h" });
  }

  let quiz: Question[] = [];
  const quizPath = join(dir, "quiz.js");
  if (existsSync(quizPath)) {
    quiz = jsEval(readFileSync(quizPath, "utf8")) as Question[];
  }

  let video: string | null = null;
  const videoPath = join(dir, "video.txt");
  if (existsSync(videoPath)) {
    const v = readFileSync(videoPath, "utf8").trim();
    if (v) {
      video = v;
    }
  }

  return {
    crumb,
    desc,
    id,
    month: monthId,
    monthIndex,
    monthLessonIndex,
    order: 0,
    quiz,
    section: secId,
    segments,
    title,
    video,
  };
}

/* ------------------------------------------------------------------ */
/* collections                                                         */
/* ------------------------------------------------------------------ */

function makeLoader(name: "sections" | "months" | "lessons"): Loader {
  return {
    // biome-ignore lint/suspicious/useAwait: required by Astro's Loader API (load() must return Promise<void>)
    async load({ store }) {
      const result = walk();
      store.clear();
      let entries: { data: SectionData | MonthData | LessonData }[];
      if (name === "sections") {
        entries = result.sections;
      } else if (name === "months") {
        entries = result.months;
      } else {
        entries = result.lessons;
      }
      for (const e of entries) {
        store.set({
          data: e.data as unknown as Record<string, unknown>,
          id: e.data.id,
        });
      }
    },
    name,
  };
}

const questionSchema = z.object({
  a: z.number().int(),
  e: z.string(),
  o: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  q: z.string(),
});

const sections = defineCollection({
  loader: makeLoader("sections"),
  schema: z.object({
    desc: z.string(),
    exam: z.array(questionSchema).nullable(),
    id: z.string(),
    label: z.string(),
    months: z.array(z.string()),
    order: z.number().int(),
    short: z.string(),
    summary: z.string().nullable(),
    title: z.string(),
  }),
});

const months = defineCollection({
  loader: makeLoader("months"),
  schema: z.object({
    desc: z.string(),
    id: z.string(),
    label: z.string(),
    order: z.number().int(),
    section: z.string(),
    title: z.string(),
  }),
});

const lessons = defineCollection({
  loader: makeLoader("lessons"),
  schema: z.object({
    crumb: z.string(),
    desc: z.string(),
    id: z.string(),
    month: z.string(),
    monthIndex: z.number().int(),
    monthLessonIndex: z.number().int(),
    order: z.number().int(),
    quiz: z.array(questionSchema),
    section: z.string(),
    segments: z.array(
      z.discriminatedUnion("t", [
        z.object({ html: z.string(), t: z.literal("h") }),
        z.object({
          count: z.number().int().nonnegative(),
          slug: z.string(),
          t: z.literal("f"),
        }),
      ])
    ),
    title: z.string(),
    video: z.string().nullable(),
  }),
});

export const collections = { lessons, months, sections };
