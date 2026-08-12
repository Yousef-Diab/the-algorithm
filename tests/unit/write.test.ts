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
