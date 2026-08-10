import { describe, it, expect } from "vitest";
import { pickVariants } from "@/lib/media";
import type { MediaRow } from "@/lib/db/schema";

const row = (over: Partial<MediaRow>): MediaRow =>
  ({
    id: "00000000-0000-0000-0000-000000000000",
    lessonId: "m4-03",
    kind: "image",
    ord: 0,
    storageKey: "k",
    mime: "image/png",
    width: 1200,
    height: 700,
    bytes: 1,
    variantOf: null,
    alt: "",
    ...over,
  }) as MediaRow;

describe("pickVariants", () => {
  it("groups derivatives under their original, in ord order", () => {
    const png2 = row({ id: "b", ord: 1, mime: "image/png" });
    const png1 = row({ id: "a", ord: 0, mime: "image/png" });
    const webp = row({ id: "c", ord: 0, mime: "image/webp", variantOf: "a" });
    const avif = row({ id: "d", ord: 0, mime: "image/avif", variantOf: "a" });
    const out = pickVariants([webp, png2, avif, png1]);
    expect(out.map((g) => g.original.id)).toEqual(["a", "b"]);
    expect(out[0].webp?.id).toBe("c");
    expect(out[0].avif?.id).toBe("d");
    expect(out[1].webp).toBeUndefined();
  });

  it("ignores an orphaned derivative rather than throwing", () => {
    expect(pickVariants([row({ id: "x", mime: "image/webp", variantOf: "missing" })])).toEqual([]);
  });
});
