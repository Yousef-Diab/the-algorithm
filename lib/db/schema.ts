import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  jsonb,
  index,
  uniqueIndex,
  unique,
  foreignKey,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

/**
 * Users are managed by Neon Auth and live in the neon_auth schema. We reference
 * neon_auth."user".id as text and never write to that schema.
 */

// ------------------------------------------------------------------ content

export const sections = pgTable("sections", {
  id: text("id").primaryKey(),
  short: text("short").notNull(),
  title: text("title").notNull(),
  desc: text("desc").notNull().default(""),
  /** Names the middle tier on the home cards: "Month" (s1) | "Part" (s2). */
  label: text("label").notNull().default("Month"),
  ord: integer("ord").notNull(),
});

export const months = pgTable(
  "months",
  {
    id: text("id").primaryKey(),
    sectionId: text("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    desc: text("desc").notNull().default(""),
    ord: integer("ord").notNull(),
  },
  (t) => [
    index("months_section_ord_idx").on(t.sectionId, t.ord),
    // Unique target for lessons' composite FK (R8) — id alone is already the
    // primary key, so this adds no real constraint beyond what Postgres needs
    // to reference (id, section_id) as a pair.
    unique("months_id_section_id_uq").on(t.id, t.sectionId),
  ],
);

export const lessons = pgTable(
  "lessons",
  {
    /** mX-NN for lessons, {sid}-review / {sid}-exam for the section pages. */
    id: text("id").primaryKey(),
    /** Always set — reviews and exams belong to a section but to no month. */
    sectionId: text("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    /** FK to months is the composite (month_id, section_id) constraint below. */
    monthId: text("month_id"),
    /** m{month}-{NN}-{kebab-title}; also the chart filename stem. */
    slug: text("slug").notNull(),
    /** Nav/card/SEO title (the source's data-title). */
    title: text("title").notNull(),
    /** Hero <h2>. Differs from `title` in 6 of 80 source files. */
    heading: text("heading").notNull(),
    crumb: text("crumb").notNull(),
    /** Inline[] — one lesson's description contains an <em>. */
    desc: jsonb("desc").notNull().default([]),
    videoUrl: text("video_url"),
    ord: integer("ord").notNull(),
    /** 'lesson' | 'review' | 'exam' — reproduces the old data-kind. */
    kind: text("kind").notNull().default("lesson"),
    /** 'free' | 'members' | 'admin'. Defaults closed. */
    access: text("access").notNull().default("members"),
    /** 'draft' | 'published'. */
    status: text("status").notNull().default("draft"),
    /** Block[] — see lib/content/blocks.ts. */
    body: jsonb("body").notNull().default([]),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [
    index("lessons_section_ord_idx").on(t.sectionId, t.ord),
    index("lessons_month_ord_idx").on(t.monthId, t.ord),
    index("lessons_access_status_idx").on(t.access, t.status),
    uniqueIndex("lessons_slug_uq").on(t.slug),
    // R8: a lesson's month must belong to the lesson's own section. MATCH
    // SIMPLE (the default) skips enforcement when month_id IS NULL, which is
    // exactly the review/exam rows — the nullable month_id design is preserved.
    foreignKey({
      columns: [t.monthId, t.sectionId],
      foreignColumns: [months.id, months.sectionId],
      name: "lessons_month_section_fk",
    }).onDelete("cascade"),
  ],
);

export const quizQuestions = pgTable(
  "quiz_questions",
  {
    /** Stable uuid — quiz_results keys on this, never on an index. */
    id: uuid("id").defaultRandom().primaryKey(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    ord: integer("ord").notNull(),
    q: text("q").notNull(),
    /** string[4]. */
    options: jsonb("options").notNull(),
    /** 0-based index into options. */
    answer: integer("answer").notNull(),
    explanation: text("explanation").notNull(),
  },
  (t) => [uniqueIndex("quiz_questions_lesson_ord_uq").on(t.lessonId, t.ord)],
);

export const media = pgTable(
  "media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    /** 'image' | 'video' — the video seam, unused in project #1. */
    kind: text("kind").notNull().default("image"),
    ord: integer("ord").notNull(),
    /** Object key in the private R2 bucket. */
    storageKey: text("storage_key").notNull(),
    mime: text("mime").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    bytes: integer("bytes").notNull(),
    /** A webp/avif derivative points at its original here. */
    variantOf: uuid("variant_of").references((): AnyPgColumn => media.id, { onDelete: "cascade" }),
    alt: text("alt").notNull().default(""),
  },
  (t) => [
    index("media_lesson_ord_idx").on(t.lessonId, t.ord),
    index("media_variant_idx").on(t.variantOf),
    uniqueIndex("media_storage_key_uq").on(t.storageKey),
  ],
);

export const sectionsRelations = relations(sections, ({ many }) => ({
  months: many(months),
  lessons: many(lessons),
}));

export const monthsRelations = relations(months, ({ one, many }) => ({
  section: one(sections, { fields: [months.sectionId], references: [sections.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  section: one(sections, { fields: [lessons.sectionId], references: [sections.id] }),
  month: one(months, { fields: [lessons.monthId], references: [months.id] }),
  questions: many(quizQuestions),
  media: many(media),
}));

export type SectionRow = typeof sections.$inferSelect;
export type MonthRow = typeof months.$inferSelect;
export type LessonRow = typeof lessons.$inferSelect;
export type QuizQuestionRow = typeof quizQuestions.$inferSelect;
export type MediaRow = typeof media.$inferSelect;
