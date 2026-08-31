import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  jsonb,
  boolean,
  index,
  uniqueIndex,
  unique,
  foreignKey,
  primaryKey,
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
    /** Block[] — the UNREVIEWED body. Admin-only unconditionally (invariant 6). */
    bodyDraft: jsonb("body_draft"),
    /** Provenance of the LIVE body — a path under transcripts/ or notes/. */
    sourceRef: text("source_ref"),
    /** Provenance of the DRAFT body. Promoted/cleared with it, never apart. */
    sourceRefDraft: text("source_ref_draft"),
    /** 'import' | 'cms'. Set to 'cms' by body writes only (invariant 9). */
    writeOrigin: text("write_origin").notNull().default("import"),
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

/**
 * ADMINS ONLY. There is deliberately no 'member' role: membership is the
 * presence of an unexpired entitlement, and two ways to express it would let
 * them disagree. Absence of a row here is the normal case.
 */
export const userRoles = pgTable("user_roles", {
  userId: text("user_id").primaryKey(),
  role: text("role").notNull().default("admin"),
  grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * The entire seam paid subscriptions need (project #3): Stripe's webhook writes
 * a row with source='subscription' and an expires_at, and canRead does not change.
 */
export const entitlements = pgTable(
  "entitlements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    /** 'admin_grant' | 'subscription' */
    source: text("source").notNull(),
    /** 'all' | 'section' */
    scope: text("scope").notNull().default("all"),
    sectionId: text("section_id").references(() => sections.id, { onDelete: "cascade" }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
    /** null = never expires. */
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (t) => [index("entitlements_user_idx").on(t.userId)],
);

/**
 * A record of what the admin console did. Deliberately NOT a control:
 * invariant 13 — nothing reads this to make an authorization decision, and a
 * failure to write a row never fails the action it describes.
 *
 * No FK to lessons: a cascade would delete a lesson's history along with the
 * lesson, destroying exactly the record you would want afterwards.
 */
export const adminActions = pgTable(
  "admin_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
    /** neon_auth."user".id, or null when the actor was not signed in. NEVER the email. */
    actorUserId: text("actor_user_id"),
    /** 'promote' | 'discard' | 'set_status' | 'set_access' */
    action: text("action").notNull(),
    /** Plain text, no foreign key — see above. */
    lessonId: text("lesson_id"),
    /** 'ok' | 'noop' | 'denied' | 'error' */
    outcome: text("outcome").notNull(),
    /** Field values and the draft fingerprint. NEVER body content (invariant 6). */
    detail: jsonb("detail"),
  },
  (t) => [index("admin_actions_at_idx").on(t.at)],
);

export type UserRoleRow = typeof userRoles.$inferSelect;
export type EntitlementRow = typeof entitlements.$inferSelect;
export type AdminActionRow = typeof adminActions.$inferSelect;

// --------------------------------------------------------------- per-user

export const progress = pgTable(
  "progress",
  {
    userId: text("user_id").notNull(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

/**
 * INVARIANT 4: keyed on question_id, never on a question index. Reordering or
 * inserting a question in the CMS would otherwise silently re-point every
 * user's stored history at the wrong question.
 */
export const quizResults = pgTable(
  "quiz_results",
  {
    userId: text("user_id").notNull(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => quizQuestions.id, { onDelete: "cascade" }),
    /** The picked option index, so the graded UI restores on reload. */
    selected: integer("selected").notNull(),
    correct: boolean("correct").notNull(),
    answeredAt: timestamp("answered_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.questionId] })],
);

/**
 * One row per (user, exam lesson). `picks` stores option TEXT, not indices,
 * because options re-shuffle on every render.
 */
export const examResults = pgTable(
  "exam_results",
  {
    userId: text("user_id").notNull(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    best: integer("best").notNull().default(0),
    last: integer("last").notNull().default(0),
    taken: integer("taken").notNull().default(0),
    submitted: boolean("submitted").notNull().default(false),
    picks: jsonb("picks").notNull().default({}),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    /** One note document per (user, lesson). Text-only today: the stored shape
     *  is `{ "type": "text", "text": "..." }`. jsonb keeps a future rich-text
     *  upgrade non-breaking. */
    content: jsonb("content"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("notes_user_lesson_uq").on(t.userId, t.lessonId)],
);

export type ProgressRow = typeof progress.$inferSelect;
export type QuizResultRow = typeof quizResults.$inferSelect;
export type ExamResultRow = typeof examResults.$inferSelect;
export type NoteRow = typeof notes.$inferSelect;
