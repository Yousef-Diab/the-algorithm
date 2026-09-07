import { lessonOrder, type CatalogLesson, type CatalogSection } from "@/lib/content/queries";

export function navFrom(catalog: CatalogSection[]) {
  const order = lessonOrder(catalog);
  const byId = new Map<string, CatalogLesson>();
  for (const s of catalog) {
    for (const m of s.months) for (const l of m.lessons) byId.set(l.id, l);
    if (s.review) byId.set(s.review.id, s.review);
    if (s.exam) byId.set(s.exam.id, s.exam);
  }
  return {
    order,
    byId,
    /** Only kind='lesson' rows count toward the progress bar, as today. */
    lessonCount: catalog.flatMap((s) => s.months).flatMap((m) => m.lessons).length,
    prevNext(id: string): { prev?: CatalogLesson; next?: CatalogLesson } {
      const i = order.indexOf(id);
      if (i < 0) return {};
      return {
        prev: i > 0 ? byId.get(order[i - 1]) : undefined,
        next: i < order.length - 1 ? byId.get(order[i + 1]) : undefined,
      };
    },
  };
}
