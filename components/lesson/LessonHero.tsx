import { InlineNodes } from "@/components/blocks/Inline";
import type { LessonMetaResult } from "@/lib/content/queries";

/**
 * Shared by the free and locked branches of the lesson page so they cannot
 * drift: title, crumb and the one-line description are already public in the
 * sidebar nav, so this markup is safe to render regardless of access.
 */
export function LessonHero({ meta }: { meta: LessonMetaResult }) {
  return (
    <div className="lesson-hero">
      <div className="crumb">{meta.crumb}</div>
      <h1>{meta.heading}</h1>
      <div className="desc">
        <InlineNodes nodes={meta.desc} />
      </div>
    </div>
  );
}
