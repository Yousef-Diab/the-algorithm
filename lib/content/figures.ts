import type { VariantGroup } from "@/lib/media";
import type { FigureSources } from "@/components/blocks/FigureImage";

/**
 * getLessonMedia() returns VariantGroup[]; BlockRenderer takes FigureSources[].
 * This is the bridge, extracted from app/lesson/[id]/page.tsx so the admin
 * review page renders charts through the SAME transform the reader gets. A copy
 * would let the reviewer's view drift from the view it exists to reproduce.
 *
 * Every id becomes a /api/media/{id} URL; that route runs its own access check,
 * so nothing here is a gate.
 */
export function figuresFromMedia(groups: VariantGroup[]): FigureSources[] {
  return groups.map((g) => ({
    src: `/api/media/${g.original.id}`,
    webp: g.webp ? `/api/media/${g.webp.id}` : undefined,
    avif: g.avif ? `/api/media/${g.avif.id}` : undefined,
    width: g.original.width,
    height: g.original.height,
    alt: g.original.alt,
  }));
}
