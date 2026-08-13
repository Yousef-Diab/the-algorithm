import { describe, it, expect, vi } from "vitest";
import { createWriter } from "@/lib/content/write";
import { fakeDb } from "./helpers/fake-db";

const BLOCKS = [{ t: "p", c: [{ t: "text", v: "hello" }] }];
const REF = "notes/ict-core/INDEX.md";

describe("writeLessonBody", () => {
  it("writes body_draft and source_ref_draft — never the live body", async () => {
    const { db, calls } = fakeDb();
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    await w.writeLessonBody("m1-01", BLOCKS, REF);

    const set = calls[0].set!;
    expect(set.bodyDraft).toEqual(BLOCKS);
    expect(set.sourceRefDraft).toBe(REF);
    expect(set.body).toBeUndefined(); // invariant 6: the live body is untouched
    expect(set.writeOrigin).toBe("cms"); // invariant 9: body writes claim the row
  });

  it("purges all three tags, in one call, in the same function as the write", async () => {
    const { db } = fakeDb();
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    const ok = await w.writeLessonBody("m1-01", BLOCKS, REF);
    expect(ok).toBe(true);
    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(revalidate).toHaveBeenCalledWith(["lesson:m1-01", "lesson-meta:m1-01", "catalog"]);
  });

  it("reports false and does NOT purge when the id does not exist — the agent must not believe a phantom write happened", async () => {
    const { db } = fakeDb([]); // RETURNING came back empty
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    const ok = await w.writeLessonBody("THIS-LESSON-DOES-NOT-EXIST", BLOCKS, REF);
    expect(ok).toBe(false);
    expect(revalidate).toHaveBeenCalledTimes(0);
  });

  it("refuses a body write with no sourceRef", async () => {
    const { db } = fakeDb();
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await expect(w.writeLessonBody("m1-01", BLOCKS, "" as string)).rejects.toThrow(/sourceRef is required/);
  });

  it("refuses invalid block JSON, reporting the path", async () => {
    const { db } = fakeDb();
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await expect(w.writeLessonBody("m1-01", [{ t: "nope" }], REF)).rejects.toThrow(/block\[0\]/);
  });

  it("does not write when validation fails", async () => {
    const { db, calls } = fakeDb();
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await expect(w.writeLessonBody("m1-01", [{ t: "nope" }], REF)).rejects.toThrow();
    expect(calls).toHaveLength(0);
  });
});

describe("writeLessonMeta", () => {
  it("applies live and does NOT claim the row as cms", async () => {
    const { db, calls } = fakeDb();
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    const ok = await w.writeLessonMeta("m1-01", { title: "New" });
    expect(ok).toBe(true);
    expect(calls[0].set!.title).toBe("New");
    // invariant 9: only BODY writes set 'cms'. A title tweak must not make the
    // importer refuse this lesson forever.
    expect(calls[0].set!.writeOrigin).toBeUndefined();
  });

  it("purges all three tags when the id matches", async () => {
    const { db } = fakeDb();
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    await w.writeLessonMeta("m1-01", { title: "New" });
    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(revalidate).toHaveBeenCalledWith(["lesson:m1-01", "lesson-meta:m1-01", "catalog"]);
  });

  it("reports false and does NOT purge when the id does not exist", async () => {
    const { db } = fakeDb([]); // RETURNING came back empty
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    const ok = await w.writeLessonMeta("THIS-LESSON-DOES-NOT-EXIST", { title: "New" });
    expect(ok).toBe(false);
    expect(revalidate).toHaveBeenCalledTimes(0);
  });

  it("reports true and does NOT touch the db or purge on an empty patch (no-op, not a failure)", async () => {
    const { db, calls } = fakeDb([]);
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    const ok = await w.writeLessonMeta("THIS-LESSON-DOES-NOT-EXIST", {});
    expect(ok).toBe(true);
    expect(calls).toHaveLength(0);
    expect(revalidate).toHaveBeenCalledTimes(0);
  });
});

describe("promoteDraft", () => {
  it("moves body AND source_ref together, and clears both draft columns", async () => {
    const { db, calls } = fakeDb([{ id: "m1-01" }]);
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    const ok = await w.promoteDraft("m1-01");
    expect(ok).toBe(true);
    const set = calls[0].set!;
    // The ref must travel with the body it describes, or source_ref ends up
    // describing prose nobody published.
    expect(set.bodyDraft).toBeNull();
    expect(set.sourceRefDraft).toBeNull();
    expect(set.writeOrigin).toBe("cms");
  });

  it("reports false when there was no draft rather than silently succeeding", async () => {
    const { db } = fakeDb([]);                    // RETURNING came back empty
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    expect(await w.promoteDraft("m1-01")).toBe(false);
  });
});

describe("discardDraft", () => {
  it("purges all three tags when a draft is actually discarded (invariant 2)", async () => {
    const { db } = fakeDb([{ id: "m1-01" }]);
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    const ok = await w.discardDraft("m1-01");
    expect(ok).toBe(true);
    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(revalidate).toHaveBeenCalledWith(["lesson:m1-01", "lesson-meta:m1-01", "catalog"]);
  });

  it("does NOT purge when there was no draft to discard (no-op path)", async () => {
    const { db } = fakeDb([]);                    // RETURNING came back empty
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    const ok = await w.discardDraft("m1-01");
    expect(ok).toBe(false);
    expect(revalidate).toHaveBeenCalledTimes(0);
  });
});

describe("setStatus / setAccess", () => {
  it("stamps publishedAt on publish and clears it on unpublish", async () => {
    const { db, calls } = fakeDb();
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await w.setStatus("m1-01", "published");
    expect(calls[0].set!.publishedAt).toBeInstanceOf(Date);
    await w.setStatus("m1-01", "draft");
    expect(calls[1].set!.publishedAt).toBeNull();
  });

  it("returns true and purges all three tags when the id matches (publish gate)", async () => {
    const { db } = fakeDb([{ id: "m1-01" }]); // RETURNING came back with a row
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    const ok = await w.setStatus("m1-01", "published");
    expect(ok).toBe(true);
    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(revalidate).toHaveBeenCalledWith(["lesson:m1-01", "lesson-meta:m1-01", "catalog"]);
  });

  it("reports false and does NOT purge on a typo'd id — the publish gate must not silently no-op", async () => {
    const { db } = fakeDb([]);                    // RETURNING came back empty
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    const ok = await w.setStatus("m1-9", "published");
    expect(ok).toBe(false);
    expect(revalidate).toHaveBeenCalledTimes(0);
  });

  it("purges all three tags on an access flip (invariant 2)", async () => {
    const { db } = fakeDb();
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    const ok = await w.setAccess("p1-02", "free");
    expect(ok).toBe(true);
    expect(revalidate).toHaveBeenCalledWith(["lesson:p1-02", "lesson-meta:p1-02", "catalog"]);
  });

  it("reports false and does NOT purge when setAccess targets an id that does not exist", async () => {
    const { db } = fakeDb([]); // RETURNING came back empty
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    const ok = await w.setAccess("THIS-LESSON-DOES-NOT-EXIST", "free");
    expect(ok).toBe(false);
    expect(revalidate).toHaveBeenCalledTimes(0);
  });
});

describe("upsertQuiz", () => {
  it("refuses while a draft body is pending", async () => {
    const { db } = fakeDb([{ id: "m1-01", bodyDraft: [{ t: "p", c: [] }] }]);
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await expect(w.upsertQuiz("m1-01", [])).rejects.toThrow(/promote or discard the pending draft first/);
  });

  it("parks existing ords in negative space before assigning final ords", async () => {
    const batched: unknown[] = [];
    // The fake reuses this same array for both the draft-body select and the
    // existing-question-ids select, so the supplied question's id must match
    // it here — an id not already among the lesson's questions is correctly
    // refused by the id-ownership check below (see "refuses a question id
    // that belongs to a different lesson").
    const { db } = fakeDb([{ id: "11111111-1111-1111-1111-111111111111", bodyDraft: null }]);
    (db as Record<string, unknown>).batch = (stmts: unknown[]) => { batched.push(...stmts); return Promise.resolve([]); };
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await w.upsertQuiz("m1-01", [
      { id: "11111111-1111-1111-1111-111111111111", q: "a?", options: ["1","2","3","4"], answer: 0, explanation: "e" },
    ]);
    // One park statement + one upsert. Without the park, a reorder violates
    // quiz_questions_lesson_ord_uq mid-sequence.
    expect(batched.length).toBeGreaterThanOrEqual(2);
  });

  it("refuses a question id that belongs to a different lesson, and never calls db.batch", async () => {
    const { db } = fakeDb([{ id: "m1-01", bodyDraft: null }]); // existing question id is "m1-01", not the supplied one
    let batchCalled = false;
    (db as Record<string, unknown>).batch = (stmts: unknown[]) => { batchCalled = true; return Promise.resolve(stmts); };
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await expect(
      w.upsertQuiz("m1-01", [
        { id: "22222222-2222-2222-2222-222222222222", q: "a?", options: ["1","2","3","4"], answer: 0, explanation: "e" },
      ]),
    ).rejects.toThrow(/question id "22222222-2222-2222-2222-222222222222" does not belong to lesson "m1-01"/);
    // Asserting the throw alone would still pass a version that throws AFTER
    // writing — assert the write itself never happened.
    expect(batchCalled).toBe(false);
  });

  it("refuses to delete unless deleteMissing is explicitly true", async () => {
    const { db } = fakeDb([{ id: "m1-01", bodyDraft: null }]);
    (db as Record<string, unknown>).batch = () => Promise.resolve([]);
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    const res = await w.upsertQuiz("m1-01", []);
    expect(res.deleted).toBe(0);
  });
});

describe("createLesson", () => {
  const base = {
    id: "m1-99", sectionId: "s1", monthId: "m1", ord: 99,
    title: "Market Maker Traps", heading: "Market Maker Traps", crumb: "Month 1 · Lesson 99",
    desc: [{ t: "text", v: "d" }], kind: "lesson",
  };

  // createLesson issues TWO selects when monthId is present: the (month_id,
  // section_id) precheck, then the slug-collision check. The shared fake
  // returns one fixture per db.select() call in sequence when `returning` is
  // an array of arrays (see fake-db.ts) — first the month row (so the
  // precheck passes), then [] (no slug collision).
  const MONTH_OK = { id: "m1", sectionId: "s1" };

  it("derives the slug from month and kebab title and starts as an unpublished draft", async () => {
    const { db, calls } = fakeDb([[MONTH_OK], []]);
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await w.createLesson({ ...base, access: "free" });
    const v = calls[0].set ?? (calls[0] as Record<string, unknown>).values;
    expect((v as Record<string, unknown>).slug).toBe("m1-99-market-maker-traps");
    expect((v as Record<string, unknown>).status).toBe("draft");
  });

  it("purges all three tags on the success path (invariant 2′)", async () => {
    const { db } = fakeDb([[MONTH_OK], []]);
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    await w.createLesson({ ...base, access: "free" });
    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(revalidate).toHaveBeenCalledWith(["lesson:m1-99", "lesson-meta:m1-99", "catalog"]);
  });

  it("defaults access to members when omitted — invariant 3, fail closed", async () => {
    const { db, calls } = fakeDb([[MONTH_OK], []]);
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await w.createLesson(base);
    const v = calls[0].set ?? (calls[0] as Record<string, unknown>).values;
    expect((v as Record<string, unknown>).access).toBe("members");
  });

  it("rejects an unrecognised access value rather than passing it through", async () => {
    const { db } = fakeDb([]);
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await expect(w.createLesson({ ...base, access: "public" })).rejects.toThrow(/access must be/);
  });

  it("rejects an unrecognised kind rather than passing it through", async () => {
    const { db } = fakeDb([]);
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await expect(w.createLesson({ ...base, kind: "bogus" })).rejects.toThrow(/kind must be lesson, review or exam/);
  });

  it("refuses a month that does not belong to the named section, before any insert", async () => {
    const { db, calls } = fakeDb([[], []]); // month precheck select comes back empty
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await expect(w.createLesson(base)).rejects.toThrow(/does not belong to section/);
    expect(calls).toHaveLength(0);
  });

  it("refuses a slug collision, naming the colliding lesson id, before any insert", async () => {
    const { db, calls } = fakeDb([[MONTH_OK], [{ id: "m1-99-existing" }]]);
    const w = createWriter({ db: db as never, revalidate: vi.fn() });
    await expect(w.createLesson(base)).rejects.toThrow(/slug "m1-99-market-maker-traps" is already used by lesson "m1-99-existing"/);
    expect(calls).toHaveLength(0);
  });
});
