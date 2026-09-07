export interface ConsoleLessonRow {
  id: string;
  title: string;
  access: string;
  status: string;
  hasDraft: boolean;
  writeOrigin: string;
  sourceRef: string | null;
  sectionId: string;
  /** NULL for reviews and exams — schema.ts:60. Never assume it is set. */
  monthId: string | null;
  kind: string;
}

export interface MonthGroup {
  monthId: string;
  lessons: ConsoleLessonRow[];
}

export interface SectionGroup {
  sectionId: string;
  months: MonthGroup[];
  /** Reviews and exams: they belong to the section but to no month. */
  sectionLevel: ConsoleLessonRow[];
}

export interface GroupedLessons {
  /** A shortcut view. These lessons ALSO appear in `sections` — the tree is complete. */
  pending: ConsoleLessonRow[];
  sections: SectionGroup[];
}

/** Reading order for the section-level pages, matching queries.ts:209-214. */
const KIND_ORDER: Record<string, number> = { review: 0, exam: 1 };

/**
 * Pure. Input order is authoritative for months and lessons — the caller
 * (lib/admin/console-queries.ts) already orders by monthId, ord, id, and
 * re-sorting here would silently disagree with it.
 */
export function groupLessons(rows: ConsoleLessonRow[]): GroupedLessons {
  const sections: SectionGroup[] = [];
  const bySection = new Map<string, SectionGroup>();
  const byMonth = new Map<string, MonthGroup>();

  for (const row of rows) {
    let section = bySection.get(row.sectionId);
    if (!section) {
      section = { sectionId: row.sectionId, months: [], sectionLevel: [] };
      bySection.set(row.sectionId, section);
      sections.push(section);
    }

    if (row.monthId === null) {
      section.sectionLevel.push(row);
      continue;
    }

    const key = `${row.sectionId} ${row.monthId}`;
    let month = byMonth.get(key);
    if (!month) {
      month = { monthId: row.monthId, lessons: [] };
      byMonth.set(key, month);
      section.months.push(month);
    }
    month.lessons.push(row);
  }

  for (const section of sections) {
    section.sectionLevel.sort(
      (a, b) => (KIND_ORDER[a.kind] ?? 99) - (KIND_ORDER[b.kind] ?? 99) || (a.id < b.id ? -1 : 1),
    );
  }

  return { pending: rows.filter((r) => r.hasDraft), sections };
}
