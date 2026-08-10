import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCatalog, getLessonMeta, getLessonBody, getLessonMedia } from "@/lib/content/queries";
import { inlineText } from "@/lib/content/blocks";
import { navFrom } from "@/lib/nav";
import { canRead } from "@/lib/access";
import { accessContext } from "@/lib/db/access-queries";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { LessonFooter } from "@/components/lesson/LessonFooter";
import { LessonHero } from "@/components/lesson/LessonHero";
import { LockedBody } from "@/components/lesson/LockedBody";

export const dynamicParams = true; // a lesson flipped to free renders on demand, never 404s

export async function generateStaticParams() {
  const catalog = await getCatalog();
  // Only free lessons are prerendered: a members lesson in a public ISR cache
  // is exactly the leak this architecture exists to prevent.
  return catalog
    .flatMap((s) => [...s.months.flatMap((m) => m.lessons), s.review, s.exam])
    .filter((l): l is NonNullable<typeof l> => Boolean(l) && l!.access === "free")
    .map((l) => ({ id: l.id }));
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
  if (!meta) notFound();

  const isPublic = meta.access === "free" && meta.status === "published";

  // A free lesson must not read cookies — that would opt the route out of
  // static rendering and lose the public cache entirely.
  const ctx = isPublic
    ? { user: null, isAdmin: false, entitlements: [] }
    : await accessContext();

  // A draft is not otherwise public — getCatalog() filters to published, so
  // its title/crumb/desc never leaked into the nav — so an anonymous or
  // non-admin request for it must 404 rather than render the locked branch
  // with the draft's real metadata.
  if (meta.status !== "published" && !ctx.isAdmin) notFound();

  if (!canRead(meta, ctx)) {
    // Nothing below this line fetches the body. Do not hoist getLessonBody()
    // above this branch: the prose would land in the RSC payload even though
    // the JSX is suppressed. See spec §6 and invariant 1.
    return (
      <article className="lesson">
        <LessonHero meta={meta} />
        <LockedBody signedIn={Boolean(ctx.user)} />
      </article>
    );
  }

  const { prev, next } = navFrom(await getCatalog()).prevNext(id);

  const [blocks, groups] = await Promise.all([getLessonBody(id), getLessonMedia(id)]);
  if (!blocks) notFound();

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
      <LessonHero meta={meta} />

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
