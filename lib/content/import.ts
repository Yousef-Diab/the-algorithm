import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseLessonHtml } from "./parse-html";
import { parseObjs, parseQuiz } from "./parse-meta";
import type { Block, Inline, LessonKind } from "./blocks";

export interface PlannedQuestion {
  ord: number;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface PlannedLesson {
  id: string;
  sectionId: string;
  monthId: string | null;
  slug: string;
  title: string;
  heading: string;
  crumb: string;
  desc: Inline[];
  videoUrl: string | null;
  ord: number;
  kind: LessonKind;
  body: Block[];
  questions: PlannedQuestion[];
}

export interface ImportPlan {
  sections: { id: string; short: string; title: string; desc: string; label: string; ord: number }[];
  months: { id: string; sectionId: string; title: string; desc: string; ord: number }[];
  lessons: PlannedLesson[];
}

const REVIEW_ORD = 1000;
const EXAM_ORD = 1001;

const dirs = (p: string) => readdirSync(p).filter((d) => statSync(join(p, d)).isDirectory()).sort();

function kebab(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function read(p: string): string {
  return readFileSync(p, "utf8");
}

/** The exam page copy, reproduced verbatim from build.py:exam_page(). */
function examDesc(n: number): string {
  return `${n} questions drawn from every lesson in this section. Nothing is graded until you submit — and you can retake it as many times as you like.`;
}

export function readContentTree(root: string): ImportPlan {
  const plan: ImportPlan = { sections: [], months: [], lessons: [] };

  dirs(root).forEach((secDir, secIdx) => {
    const secPath = join(root, secDir);
    const secFile = join(secPath, "section.js");
    if (!existsSync(secFile)) throw new Error(`${secDir}: no section.js`);
    const fields = parseObjs(read(secFile))[0];
    if (!fields?.id) throw new Error(`${secDir}/section.js: no id:"…" field`);
    const sectionId = fields.id;
    plan.sections.push({
      id: sectionId,
      short: fields.short ?? fields.title ?? sectionId,
      title: fields.title ?? sectionId,
      desc: fields.desc ?? "",
      label: fields.label ?? "Month",
      ord: secIdx,
    });

    const monthMeta = new Map(parseObjs(read(join(secPath, "months.js"))).map((m) => [m.id, m]));

    dirs(secPath).forEach((monthDir, monthIdx) => {
      const meta = monthMeta.get(monthDir);
      if (!meta) throw new Error(`${secDir}/months.js: no entry for folder "${monthDir}"`);
      plan.months.push({
        id: monthDir,
        sectionId,
        title: meta.title ?? monthDir,
        desc: meta.desc ?? "",
        ord: monthIdx,
      });

      dirs(join(secPath, monthDir)).forEach((lessonDir, lessonIdx) => {
        const lp = join(secPath, monthDir, lessonDir);
        const { meta: m, blocks } = parseLessonHtml(read(join(lp, "lesson.html")), {
          sectionId,
          monthId: monthDir,
        });
        if (m.id !== lessonDir)
          throw new Error(`${lessonDir}: folder name and section id="${m.id}" disagree`);

        const figSlug = blocks.find((b): b is Extract<Block, { t: "figures" }> => b.t === "figures")?.slug;
        const videoFile = join(lp, "video.txt");
        const video = existsSync(videoFile) ? read(videoFile).trim() : "";

        plan.lessons.push({
          ...m,
          slug: figSlug ?? `${m.id}-${kebab(m.title)}`,
          videoUrl: video || null,
          ord: lessonIdx,
          body: blocks,
          questions: parseQuiz(read(join(lp, "quiz.js"))).map((r, i) => ({
            ord: i,
            q: r.q,
            options: r.o,
            answer: r.a,
            explanation: r.e,
          })),
        });
      });
    });

    // --- the section's review page ------------------------------------------
    const summary = join(secPath, "summary.html");
    if (existsSync(summary)) {
      const { meta: m, blocks } = parseLessonHtml(read(summary), { sectionId, monthId: null });
      plan.lessons.push({
        ...m,
        slug: m.id,
        videoUrl: null,
        ord: REVIEW_ORD,
        body: blocks,
        questions: [],
      });
    }

    // --- the section's exam page (generated, as build.py does) ---------------
    const examFile = join(secPath, "exam.js");
    if (existsSync(examFile)) {
      const rows = parseQuiz(read(examFile));
      const sectionTitle = plan.sections.at(-1)!.title;
      plan.lessons.push({
        id: `${sectionId}-exam`,
        sectionId,
        monthId: null,
        slug: `${sectionId}-exam`,
        title: "Final Exam",
        heading: "Final Exam",
        crumb: `${sectionTitle} · Section Review`,
        desc: [{ t: "text", v: examDesc(rows.length) }],
        videoUrl: null,
        ord: EXAM_ORD,
        kind: "exam",
        body: [],
        questions: rows.map((r, i) => ({
          ord: i,
          q: r.q,
          options: r.o,
          answer: r.a,
          explanation: r.e,
        })),
      });
    }
  });

  const ids = plan.lessons.map((l) => l.id);
  const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupIds.length) throw new Error(`duplicate lesson ids: ${[...new Set(dupIds)].join(", ")}`);
  const slugs = plan.lessons.map((l) => l.slug);
  const dupSlugs = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupSlugs.length) throw new Error(`duplicate lesson slugs: ${[...new Set(dupSlugs)].join(", ")}`);

  return plan;
}
