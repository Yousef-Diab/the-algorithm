import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCatalog, getLessonMeta, getLessonBody, getLessonMedia } from "@/lib/content/queries";
import { inlineText } from "@/lib/content/blocks";
import { navFrom } from "@/lib/nav";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { InlineNodes } from "@/components/blocks/Inline";
import { LessonFooter } from "@/components/lesson/LessonFooter";

export const dynamicParams = true; // access is DB state, not build state

export async function generateStaticParams() {
  const order = navFrom(await getCatalog()).order;
  return order.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const meta = await getLessonMeta(id);
  if (!meta) return {};
  return { title: `${meta.title} — The Algorithm`, description: inlineText(meta.desc) };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = await getLessonMeta(id);
  if (!meta || meta.status !== "published") notFound();

  const { prev, next } = navFrom(await getCatalog()).prevNext(id);

  // P3 wraps this call in `if (canRead(meta, user, entitlements))` — invariant 1.
  const blocks = await getLessonBody(id);
  if (!blocks) notFound();

  const groups = await getLessonMedia(id);
  const figures = groups.map((g) => ({
    src: `/api/media/${g.original.id}`,
    webp: g.webp ? `/api/media/${g.webp.id}` : undefined,
    avif: g.avif ? `/api/media/${g.avif.id}` : undefined,
    width: g.original.width,
    height: g.original.height,
    alt: g.original.alt,
  }));

  return (
    <article className="lesson">
      <div className="lesson-hero">
        <div className="crumb">{meta.crumb}</div>
        <h1>{meta.heading}</h1>
        <div className="desc"><InlineNodes nodes={meta.desc} /></div>
      </div>

      {meta.videoUrl ? (
        <a className="lesson-video" href={meta.videoUrl} target="_blank" rel="noopener noreferrer">
          <span className="lv-ico">▶</span>
          <span>Watch the source video <span className="lv-sub">— opens on YouTube</span></span>
        </a>
      ) : null}

      <BlockRenderer blocks={blocks} lessonId={id} figures={figures} />

      {meta.kind === "lesson" ? <LessonFooter id={id} prev={prev} next={next} /> : null}
    </article>
  );
}
