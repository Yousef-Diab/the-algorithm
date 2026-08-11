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
import { Quiz } from "@/components/quiz/Quiz";
import { NotesSection } from "@/components/notes/NotesSection";

/**
 * Why this route is fully dynamic rather than partially prerendered.
 *
 * The natural shape here is `generateStaticParams()` returning only the FREE
 * lessons plus `dynamicParams = true`, so a members lesson renders on demand.
 * On Next 16.2.11 that combination is broken: a request for a param NOT in the
 * partial list is served by ATTEMPTING A STATIC GENERATION, and the `cookies()`
 * read inside `accessContext()` throws `DynamicServerError` to bail that attempt
 * to dynamic — but the bail is never converted into a per-request dynamic
 * render, so it escapes as an uncaught 500. Reproduced with a minimal route
 * containing zero project code (no DB, no auth SDK, no `unstable_cache`), on
 * both Turbopack and webpack. See task-21-report.md "Fix round 3".
 *
 * `force-dynamic` renders every lesson per request, which is correct and safe:
 * the gate below runs on every request and no lesson body ever enters a public
 * ISR cache. The cost is losing the free lessons' prerendered shells.
 *
 * If this project ever adopts Cache Components (`cacheComponents: true`), the
 * documented fix is to restore `generateStaticParams` + `dynamicParams` here and
 * move the gated branch into a `<Suspense>` child so the shell prerenders and
 * the per-request part streams in. That migration additionally requires moving
 * `lib/content/queries.ts` off `unstable_cache`, which is currently frozen.
 */
export const dynamic = "force-dynamic";

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

      {meta.kind === "lesson" ? <Quiz lessonId={id} /> : null}

      {meta.kind === "lesson" ? <NotesSection key={id} lessonId={id} /> : null}

      {meta.kind === "lesson" ? <LessonFooter id={id} prev={prev} next={next} /> : null}
    </article>
  );
}
