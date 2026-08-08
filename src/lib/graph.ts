import { type CollectionEntry, getCollection } from "astro:content";

export type LessonEntry = CollectionEntry<"lessons">;
export type MonthEntry = CollectionEntry<"months"> & { lessons: LessonEntry[] };
export type SectionEntry = CollectionEntry<"sections"> & {
  months: MonthEntry[];
};

export interface Graph {
  allLessons: LessonEntry[];
  sections: SectionEntry[];
  totalCharts: number;
  totalLessons: number;
}

/** Number of chart images a lesson carries (sum of its figure segments). */
export function chartCount(entry: LessonEntry): number {
  return entry.data.segments
    .filter((s) => s.t === "f")
    .reduce((acc, s) => acc + s.count, 0);
}

/** Build the nested sections → months → lessons graph, ordered as authored. */
export async function getGraph(): Promise<Graph> {
  const sections = (await getCollection("sections")).sort(
    (a, b) => a.data.order - b.data.order
  );
  const months = (await getCollection("months")).sort(
    (a, b) => a.data.order - b.data.order
  );
  const allLessons = (await getCollection("lessons")).sort(
    (a, b) => a.data.order - b.data.order
  );

  const sectionEntries: SectionEntry[] = sections.map((s) => ({
    ...s,
    months: months
      .filter((m) => m.data.section === s.data.id)
      .map((m) => ({
        ...m,
        lessons: allLessons.filter((l) => l.data.month === m.data.id),
      })),
  }));

  return {
    allLessons,
    sections: sectionEntries,
    totalCharts: allLessons.reduce((acc, l) => acc + chartCount(l), 0),
    totalLessons: allLessons.length,
  };
}
