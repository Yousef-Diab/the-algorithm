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
    await w.writeLessonBody("m1-01", BLOCKS, REF);
    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(revalidate).toHaveBeenCalledWith(["lesson:m1-01", "lesson-meta:m1-01", "catalog"]);
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
    await w.writeLessonMeta("m1-01", { title: "New" });
    expect(calls[0].set!.title).toBe("New");
    // invariant 9: only BODY writes set 'cms'. A title tweak must not make the
    // importer refuse this lesson forever.
    expect(calls[0].set!.writeOrigin).toBeUndefined();
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

  it("purges all three tags on an access flip (invariant 2)", async () => {
    const { db } = fakeDb();
    const revalidate = vi.fn();
    const w = createWriter({ db: db as never, revalidate });
    await w.setAccess("p1-02", "free");
    expect(revalidate).toHaveBeenCalledWith(["lesson:p1-02", "lesson-meta:p1-02", "catalog"]);
  });
});
