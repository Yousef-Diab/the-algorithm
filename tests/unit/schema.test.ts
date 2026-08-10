import { describe, it, expect } from "vitest";
import { getTableColumns } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
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

  it("ties a lesson's month to its own section (R8) via a composite FK", () => {
    // getTableColumns cannot express a table-level constraint, so this uses
    // getTableConfig instead, which exposes the foreignKeys/uniqueConstraints
    // drizzle-kit compiles from the table's third `(t) => [...]` argument.
    const monthFk = getTableConfig(lessons).foreignKeys.find((fk) => fk.getName() === "lessons_month_section_fk");
    expect(monthFk).toBeDefined();
    const ref = monthFk!.reference();
    expect(ref.columns.map((c) => c.name)).toEqual(["month_id", "section_id"]);
    expect(ref.foreignColumns.map((c) => c.name)).toEqual(["id", "section_id"]);
    expect(monthFk!.onDelete).toBe("cascade"); // deleting a month must still cascade to its lessons

    // No lingering single-column month_id -> months.id FK: the composite FK replaces it.
    expect(getTableConfig(lessons).foreignKeys.some((fk) => fk.getName() === "lessons_month_id_months_id_fk")).toBe(
      false,
    );

    // The composite FK's unique target on months.
    const monthsUnique = getTableConfig(months).uniqueConstraints.find((u) => u.name === "months_id_section_id_uq");
    expect(monthsUnique).toBeDefined();
    expect(monthsUnique!.columns.map((c) => c.name)).toEqual(["id", "section_id"]);
  });
});
