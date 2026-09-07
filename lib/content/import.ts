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

/** A question ready for `upsertQuiz`: the planned payload plus a matched id. */
export interface IdentifiedQuestion {
  id?: string;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

/**
 * Pairs the id-less questions parsed from `content/**​/quiz.js` against the
 * question ids already in the database, so a re-import can UPDATE rows in
 * place instead of delete-and-reinsert.
 *
 * WHY THIS EXISTS: `quiz_results` references `quiz_questions.id` with
 * `onDelete: cascade` and has no lesson column, so regenerating an id destroys
 * every saved answer for that question. The importer used to do exactly that
 * on every lesson it wrote.
 *
 * THE IDENTITY KEY IS THE QUESTION TEXT, deliberately. `quiz.js` carries no
 * ids, so identity must be inferred, and the only two candidates are the
 * question's text and its ordinal:
 *
 *  - **Ordinal** survives a rewording, but inserting or removing a question
 *    shifts every ordinal after it, so each id would be re-pointed at
 *    different prose and every stored answer silently re-attributed to the
 *    wrong question. That is precisely the failure `schema.ts`'s invariant 4
 *    ("never on a question index") exists to prevent — disqualifying.
 *  - **Text** survives reorders, insertions and removals exactly. Its only
 *    loss case is a genuinely reworded question, whose id is dropped and whose
 *    answers cascade away — and a reworded question IS a different question,
 *    so those answers were about prose that no longer exists.
 *
 * So the worst case here is bounded, honest loss on the one question actually
 * edited, versus silent corruption across the whole lesson. Matching is greedy
 * and in order: each existing row is consumed at most once, so duplicated
 * question text cannot hand the same id to two questions (`assertQuiz` rejects
 * that anyway) and pairs off in the order both sides list them.
 */
export function matchQuestionIds(
  existing: { id: string; q: string }[],
  incoming: PlannedQuestion[],
): IdentifiedQuestion[] {
  const byText = new Map<string, string[]>();
  for (const row of existing) {
    const bucket = byText.get(row.q);
    if (bucket) bucket.push(row.id);
    else byText.set(row.q, [row.id]);
  }
  // The payload is built field by field rather than spread-minus-ord: it must
  // carry EXACTLY what assertQuiz accepts, so a field later added to
  // PlannedQuestion cannot leak into the quiz write and be rejected there.
  // `ord` in particular is deliberately dropped — upsertQuiz derives ord from
  // array position, which is the same value and the only one it trusts.
  return incoming.map((question) => {
    const payload = {
      q: question.q,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation,
    };
    const id = byText.get(question.q)?.shift();
    return id ? { id, ...payload } : payload;
  });
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
          throw new Error(`${lessonDir}: folder name and lesson id="${m.id}" disagree`);
        if (m.monthId !== monthDir)
          throw new Error(`${lessonDir}: month folder="${monthDir}" and lesson data-month="${m.monthId}" disagree`);

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
