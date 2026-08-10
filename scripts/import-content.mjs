// scripts/import-content.mjs
// Usage: node --env-file=.env.local --experimental-strip-types scripts/import-content.mjs [--dry-run]
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

const { drizzle } = await import("drizzle-orm/neon-http");
const { neon } = await import("@neondatabase/serverless");
const { eq, sql } = await import("drizzle-orm");
const { readContentTree } = await import("../lib/content/import.ts");
const { assertBlocks } = await import("../lib/content/blocks.ts");
const { sections, months, lessons, quizQuestions } = await import("../lib/db/schema.ts");

const dryRun = process.argv.includes("--dry-run");
const plan = readContentTree("content");

// Fail before writing anything if any body is malformed.
for (const l of plan.lessons) assertBlocks(l.body);

const tally = {};
for (const l of plan.lessons) for (const b of l.body) tally[b.t] = (tally[b.t] ?? 0) + 1;

console.log(
  `plan: ${plan.sections.length} sections · ${plan.months.length} months · ` +
    `${plan.lessons.length} lessons (${plan.lessons.filter((l) => l.kind === "lesson").length} lesson, ` +
    `${plan.lessons.filter((l) => l.kind === "review").length} review, ` +
    `${plan.lessons.filter((l) => l.kind === "exam").length} exam) · ` +
    `${plan.lessons.reduce((n, l) => n + l.questions.length, 0)} questions`,
);
console.log("blocks:", Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(" "));

if (dryRun) {
  console.log("--dry-run: nothing written");
  process.exit(0);
}

const db = drizzle(neon(process.env.DATABASE_URL));

for (const s of plan.sections) {
  await db.insert(sections).values(s).onConflictDoUpdate({ target: sections.id, set: s });
}
for (const m of plan.months) {
  await db.insert(months).values(m).onConflictDoUpdate({ target: months.id, set: m });
}

for (const l of plan.lessons) {
  const { questions, ...row } = l;
  // access is NOT in `set`: an import must never reopen a lesson the CMS closed.
  const values = { ...row, status: "published", publishedAt: new Date(), updatedAt: new Date() };
  await db
    .insert(lessons)
    .values({ ...values, access: "members" })
    .onConflictDoUpdate({ target: lessons.id, set: values });

  await db.delete(quizQuestions).where(eq(quizQuestions.lessonId, l.id));
  if (questions.length) {
    await db.insert(quizQuestions).values(questions.map((q) => ({ ...q, lessonId: l.id })));
  }
}

const [{ n: nl }] = await db.select({ n: sql`count(*)::int` }).from(lessons);
const [{ n: nq }] = await db.select({ n: sql`count(*)::int` }).from(quizQuestions);
console.log(`written: ${nl} lessons, ${nq} questions`);
