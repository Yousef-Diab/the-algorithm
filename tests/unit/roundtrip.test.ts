import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseLessonHtml } from "@/lib/content/parse-html";
import { exportLessonHtml } from "@/lib/content/export-html";
import { canonicalHtml, canonicalizeSource, type DialectCounts } from "@/lib/content/canonical";

const CONTENT = join(process.cwd(), "content");

interface SourceFile {
  path: string;
  label: string;
  sectionId: string;
  monthId: string | null;
}

function sectionIdOf(dir: string): string {
  const src = readFileSync(join(CONTENT, dir, "section.js"), "utf8");
  const id = /id\s*:\s*"([^"]+)"/.exec(src);
  if (!id) throw new Error(`${dir}/section.js has no id`);
  return id[1];
}

function sourceFiles(): SourceFile[] {
  const out: SourceFile[] = [];
  for (const sec of readdirSync(CONTENT).filter((d) => statSync(join(CONTENT, d)).isDirectory())) {
    const sectionId = sectionIdOf(sec);
    for (const month of readdirSync(join(CONTENT, sec)).filter((d) =>
      statSync(join(CONTENT, sec, d)).isDirectory(),
    )) {
      for (const lesson of readdirSync(join(CONTENT, sec, month))) {
        const path = join(CONTENT, sec, month, lesson, "lesson.html");
        try {
          statSync(path);
        } catch {
          continue;
        }
        out.push({ path, label: lesson, sectionId, monthId: month });
      }
    }
    const summary = join(CONTENT, sec, "summary.html");
    try {
      statSync(summary);
      out.push({ path: summary, label: `${sectionId}-review`, sectionId, monthId: null });
    } catch {
      /* a section need not have a summary */
    }
  }
  return out;
}

const FILES = sourceFiles();

describe("round-trip fidelity", () => {
  it("finds all 80 source files", () => {
    expect(FILES.filter((f) => f.monthId !== null)).toHaveLength(78);
    expect(FILES.filter((f) => f.monthId === null)).toHaveLength(2);
  });

  const counts: DialectCounts = { bCell: 0, spanCell: 0, kvWrappedRow: 0, flipIn: 0, flipFace: 0, comment: 0 };

  for (const f of FILES) {
    it(`${f.label} survives blocks → HTML unchanged`, () => {
      const src = readFileSync(f.path, "utf8");
      const { meta, blocks } = parseLessonHtml(src, { sectionId: f.sectionId, monthId: f.monthId });
      const exported = exportLessonHtml(meta, blocks);
      expect(canonicalHtml(exported)).toBe(canonicalHtml(canonicalizeSource(src, counts)));
    });
  }

  it("applied exactly the surveyed number of dialect normalisations", () => {
    expect(counts).toEqual({ bCell: 34, spanCell: 46, kvWrappedRow: 40, flipIn: 13, flipFace: 26, comment: 17 });
  });

  it("canonicalHtml is idempotent", () => {
    const src = readFileSync(FILES[0].path, "utf8");
    const once = canonicalHtml(src);
    expect(canonicalHtml(once)).toBe(once);
  });

  it("does not fuse two words separated only by whitespace between inline elements", () => {
    const spaced = canonicalHtml("<section class=\"lesson\"><p><strong>a</strong> <em>b</em></p></section>");
    const fused = canonicalHtml("<section class=\"lesson\"><p><strong>a</strong><em>b</em></p></section>");
    expect(spaced).not.toBe(fused);
    expect(spaced).toContain("a</strong> <em>");
    expect(fused).toContain("a</strong><em>");
  });

  it("does not fuse two words when a comment sits between them", () => {
    const counts: DialectCounts = { bCell: 0, spanCell: 0, kvWrappedRow: 0, flipIn: 0, flipFace: 0, comment: 0 };
    const withComment = canonicalizeSource(
      '<section class="lesson"><p>keep<!-- x -->me</p></section>',
      counts,
    );
    expect(canonicalHtml(withComment)).not.toContain("keepme");
    expect(canonicalHtml(withComment)).toContain("keep me");
  });

  it("still absorbs hand-indentation between block-level siblings", () => {
    const tight = canonicalHtml('<section class="lesson"><div><p>a</p><p>b</p></div></section>');
    const indented = canonicalHtml(`<section class="lesson">
      <div>
        <p>a</p>
        <p>b</p>
      </div>
    </section>`);
    expect(indented).toBe(tight);
  });
});
