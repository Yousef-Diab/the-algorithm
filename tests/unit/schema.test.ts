import { describe, it, expect } from "vitest";
import { getTableColumns } from "drizzle-orm";
import { lessons, sections, months, quizQuestions, media } from "@/lib/db/schema";

describe("content schema", () => {
  it("keys lessons by text id and carries the gating columns", () => {
    const c = getTableColumns(lessons);
    expect(c.id.primary).toBe(true);
    expect(c.sectionId.notNull).toBe(true);
    expect(c.monthId.notNull).toBe(false);
    expect(c.access.notNull).toBe(true);
    expect(c.access.default).toBe("members"); // invariant 3: fail closed
    expect(c.status.default).toBe("draft");
    expect(c.kind.default).toBe("lesson");
  });

  it("exposes body and desc as jsonb", () => {
    const c = getTableColumns(lessons);
    expect(c.body.dataType).toBe("json");
    expect(c.desc.dataType).toBe("json");
  });

  it("gives quiz questions a uuid primary key", () => {
    const c = getTableColumns(quizQuestions);
    expect(c.id.primary).toBe(true);
    expect(c.id.columnType).toBe("PgUUID"); // invariant 4: results key on this
  });

  it("gives media a variant_of self-reference and intrinsic dimensions", () => {
    const c = getTableColumns(media);
    expect(c.variantOf.notNull).toBe(false);
    expect(c.width.notNull).toBe(true);
    expect(c.height.notNull).toBe(true);
  });

  it("orders sections and months explicitly", () => {
    expect(getTableColumns(sections).ord.notNull).toBe(true);
    expect(getTableColumns(months).ord.notNull).toBe(true);
  });
});
