import { describe, it, expect } from "vitest";
import { figuresFromMedia } from "@/lib/content/figures";

const group = (over: Record<string, unknown> = {}) =>
  ({
    original: { id: "orig-1", width: 1200, height: 800, alt: "a chart" },
    webp: { id: "webp-1" },
    avif: { id: "avif-1" },
    ...over,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

describe("figuresFromMedia", () => {
  it("maps ids to /api/media URLs and carries the dimensions through", () => {
    expect(figuresFromMedia([group()])).toEqual([
      {
        src: "/api/media/orig-1",
        webp: "/api/media/webp-1",
        avif: "/api/media/avif-1",
        width: 1200,
        height: 800,
        alt: "a chart",
      },
    ]);
  });

  it("leaves webp undefined when there is no webp variant", () => {
    expect(figuresFromMedia([group({ webp: null })])[0].webp).toBeUndefined();
  });

  it("leaves avif undefined when there is no avif variant", () => {
    expect(figuresFromMedia([group({ avif: null })])[0].avif).toBeUndefined();
  });

  it("preserves order", () => {
    const rows = figuresFromMedia([
      group({ original: { id: "a", width: 1, height: 1, alt: "" } }),
      group({ original: { id: "b", width: 1, height: 1, alt: "" } }),
    ]);
    expect(rows.map((f) => f.src)).toEqual(["/api/media/a", "/api/media/b"]);
  });

  it("returns an empty array for a lesson with no media", () => {
    expect(figuresFromMedia([])).toEqual([]);
  });
});
