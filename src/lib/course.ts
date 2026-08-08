// Shared course-domain types + server-side helpers.
// The content loaders (src/content.config.ts) walk the existing `content/`
// folder — the same source of truth the old build.py used — so lessons,
// quizzes and charts keep their authoring format.

export interface Question {
  a: number; // 0-based index of the correct option
  e: string; // explanation, traceable to the notes/transcript
  o: [string, string, string, string];
  q: string;
}

/** A lesson body is HTML chunks interleaved with figure slots (a chart
 *  group may sit mid-lesson, not just at the end). */
export type Segment =
  | { t: "h"; html: string }
  | { t: "f"; slug: string; count: number };

export interface SectionData {
  desc: string;
  /** Parsed exam questions, or null when the section has no exam. */
  exam: Question[] | null;
  id: string;
  label: string;
  months: string[];
  order: number;
  short: string;
  /** Raw summary.html body (review page), or null. */
  summary: string | null;
  title: string;
}

export interface MonthData {
  desc: string;
  id: string;
  label: string;
  order: number;
  section: string;
  title: string;
}

export interface LessonData {
  crumb: string;
  desc: string;
  id: string;
  month: string;
  monthIndex: number;
  monthLessonIndex: number;
  order: number;
  quiz: Question[];
  section: string;
  segments: Segment[];
  title: string;
  video: string | null;
}

/** Strip leading slashes so u() accepts both 'images/x.png' and '/images/x.png'. */
const LEADING_SLASH_RE = /^\/+/;

/** Absolute path from the site root (base-aware): u('images/x.png'). */
export function u(path: string): string {
  const base = import.meta.env.BASE_URL;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${b}/${path.replace(LEADING_SLASH_RE, "")}`;
}
