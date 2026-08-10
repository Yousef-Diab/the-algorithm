import { unstable_cache as cache } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessons, months, sections, quizQuestions, type QuizQuestionRow } from "@/lib/db/schema";
import { assertBlocks, inlineText, type Block, type Inline, type LessonKind } from "./blocks";

export interface CatalogLesson {
  id: string;
  title: string;
  desc: string;
  kind: LessonKind;
  access: string;
  ord: number;
}

export interface CatalogMonth {
  id: string;
  title: string;
  desc: string;
  lessons: CatalogLesson[];
}

export interface CatalogSection {
  id: string;
  short: string;
  title: string;
  desc: string;
  label: string;
  months: CatalogMonth[];
  review?: CatalogLesson;
  exam?: CatalogLesson;
}

export interface LessonMetaResult {
  id: string;
  sectionId: string;
  monthId: string | null;
  slug: string;
  title: string;
  heading: string;
  crumb: string;
  desc: Inline[];
  videoUrl: string | null;
  kind: LessonKind;
  access: string;
  status: string;
}

/**
 * Nav/cards/sidebar data. Byte-identical for every visitor, so it is CDN-safe:
 * titles and one-line descriptions are already public. Bodies are NOT here.
 */
export const getCatalog = cache(
  async (): Promise<CatalogSection[]> => {
    const [secRows, monthRows, lessonRows] = await Promise.all([
      db.select().from(sections).orderBy(asc(sections.ord)),
      db.select().from(months).orderBy(asc(months.ord)),
      db
        .select({
          id: lessons.id,
          sectionId: lessons.sectionId,
          monthId: lessons.monthId,
          title: lessons.title,
          desc: lessons.desc,
          kind: lessons.kind,
          access: lessons.access,
          status: lessons.status,
          ord: lessons.ord,
        })
        .from(lessons)
        .orderBy(asc(lessons.ord)),
    ]);

    const published = lessonRows.filter((l) => l.status === "published");
    const toCatalog = (l: (typeof published)[number]): CatalogLesson => ({
      id: l.id,
      title: l.title,
      desc: inlineText((l.desc ?? []) as Inline[]),
      kind: l.kind as LessonKind,
      access: l.access,
      ord: l.ord,
    });

    return secRows.map((s) => ({
      id: s.id,
      short: s.short,
      title: s.title,
      desc: s.desc,
      label: s.label,
      months: monthRows
        .filter((m) => m.sectionId === s.id)
        .map((m) => ({
          id: m.id,
          title: m.title,
          desc: m.desc,
          lessons: published.filter((l) => l.monthId === m.id && l.kind === "lesson").map(toCatalog),
        })),
      review: published.filter((l) => l.sectionId === s.id && l.kind === "review").map(toCatalog)[0],
      exam: published.filter((l) => l.sectionId === s.id && l.kind === "exam").map(toCatalog)[0],
    }));
  },
  ["catalog"],
  { tags: ["catalog"] },
);

/** Hero, crumb, video and the gating columns. Safe for anyone — no prose. */
export function getLessonMeta(id: string): Promise<LessonMetaResult | null> {
  return cache(
    async (lessonId: string) => {
      const [row] = await db
        .select({
          id: lessons.id,
          sectionId: lessons.sectionId,
          monthId: lessons.monthId,
          slug: lessons.slug,
          title: lessons.title,
          heading: lessons.heading,
          crumb: lessons.crumb,
          desc: lessons.desc,
          videoUrl: lessons.videoUrl,
          kind: lessons.kind,
          access: lessons.access,
          status: lessons.status,
        })
        .from(lessons)
        .where(eq(lessons.id, lessonId))
        .limit(1);
      if (!row) return null;
      return {
        ...row,
        desc: (row.desc ?? []) as Inline[],
        kind: row.kind as LessonKind,
      };
    },
    ["lesson-meta", id],
    { tags: [`lesson-meta:${id}`, `lesson:${id}`] },
  )(id);
}

/**
 * INVARIANT 1: call this ONLY inside the canRead branch. Calling it above the
 * gate puts gated prose into the RSC payload even when the JSX is suppressed.
 */
export function getLessonBody(id: string): Promise<Block[] | null> {
  return cache(
    async (lessonId: string) => {
      const [row] = await db
        .select({ body: lessons.body })
        .from(lessons)
        .where(eq(lessons.id, lessonId))
        .limit(1);
      return row ? assertBlocks(row.body) : null;
    },
    ["lesson-body", id],
    { tags: [`lesson:${id}`] },
  )(id);
}

/** Never cached: the caller has already checked membership, per-request. */
export async function getQuiz(lessonId: string): Promise<QuizQuestionRow[]> {
  return db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.lessonId, lessonId))
    .orderBy(asc(quizQuestions.ord));
}

/** Reading order: months in order, then the section's review, then its exam. */
export function lessonOrder(catalog: CatalogSection[]): string[] {
  return catalog.flatMap((s) => [
    ...s.months.flatMap((m) => m.lessons.map((l) => l.id)),
    ...(s.review ? [s.review.id] : []),
    ...(s.exam ? [s.exam.id] : []),
  ]);
}
