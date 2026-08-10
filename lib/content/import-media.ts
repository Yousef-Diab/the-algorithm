import { readdirSync } from "node:fs";
import { join } from "node:path";

export interface PlannedMedia {
  lessonId: string;
  slug: string;
  ord: number;
  /** Absolute-ish path under the images/ directory. */
  file: string;
  /** e.g. "charts/m4-03-orderblocks-01.png" */
  key: string;
}

/**
 * images/{slug}-{NN}.png → media rows. `ord` comes from the NN in the filename,
 * which is the ordering authority the old build derived counts from.
 */
export function planMedia(imagesDir: string, lessons: { id: string; slug: string }[]): PlannedMedia[] {
  const bySlug = [...lessons].sort((a, b) => b.slug.length - a.slug.length); // longest match wins
  const out: PlannedMedia[] = [];

  for (const name of readdirSync(imagesDir).filter((f) => f.toLowerCase().endsWith(".png")).sort()) {
    const stem = name.slice(0, -4);
    const m = /^(.*)-(\d{2,})$/.exec(stem);
    if (!m) throw new Error(`images/${name}: does not match {slug}-{NN}.png`);
    const [, slug, nn] = m;
    const lesson = bySlug.find((l) => l.slug === slug);
    if (!lesson) throw new Error(`images/${name}: no lesson matches slug "${slug}"`);
    out.push({
      lessonId: lesson.id,
      slug,
      ord: Number(nn) - 1,
      file: join(imagesDir, name),
      key: `charts/${name}`,
    });
  }
  return out;
}

export interface MediaVariant {
  mime: string;
  key: string;
  body: Buffer;
  width: number;
  height: number;
}

/** The PNG plus a WebP and an AVIF derivative, all at native size. */
export async function deriveVariants(png: Buffer, key: string): Promise<MediaVariant[]> {
  const { default: sharp } = await import("sharp");
  const img = sharp(png);
  const { width, height } = await img.metadata();
  if (!width || !height) throw new Error(`${key}: could not read intrinsic dimensions`);

  const stem = key.replace(/\.png$/, "");
  const [webp, avif] = await Promise.all([
    sharp(png).webp({ quality: 82 }).toBuffer(),
    sharp(png).avif({ quality: 55 }).toBuffer(),
  ]);

  return [
    { mime: "image/png", key, body: png, width, height },
    { mime: "image/webp", key: `${stem}.webp`, body: webp, width, height },
    { mime: "image/avif", key: `${stem}.avif`, body: avif, width, height },
  ];
}
