"use client";

import { useState } from "react";
import { useLightbox } from "@/components/lightbox/LightboxProvider";
import styles from "./Figures.module.css";

export interface FigureSources {
  /** /api/media/{uuid} for the PNG original. */
  src: string;
  webp?: string;
  avif?: string;
  width: number;
  height: number;
  alt: string;
}

export function FigureImage({
  fig,
  gallery,
  siblings,
  index,
}: {
  fig: FigureSources;
  gallery: boolean;
  /** The whole lesson's set, so the lightbox can browse it (ruling R2). */
  siblings: FigureSources[];
  index: number;
}) {
  const [broken, setBroken] = useState(false);
  const { open } = useLightbox();
  const openSet = () =>
    open(siblings.map((s) => ({ src: s.src, caption: s.alt })), index);

  // A missing image removes its own figure, as the old img.onerror did.
  if (broken) return null;

  // No next/image: its optimizer fetches server-side without the visitor's
  // cookies, so every gated chart would 404.
  const picture = (
    <picture>
      {fig.avif ? <source srcSet={fig.avif} type="image/avif" /> : null}
      {fig.webp ? <source srcSet={fig.webp} type="image/webp" /> : null}
      <img
        src={fig.src}
        alt={fig.alt}
        width={fig.width}
        height={fig.height}
        loading="lazy"
        decoding="async"
        className={gallery ? styles.galleryImg : styles.figImg}
        onError={() => setBroken(true)}
      />
    </picture>
  );

  return (
    <figure className={styles.fig}>
      {gallery ? (
        <button type="button" className={styles.galleryBtn} onClick={openSet} aria-label="Open chart">
          {picture}
        </button>
      ) : (
        <button type="button" className={styles.plainBtn} onClick={openSet} aria-label="Open chart">
          {picture}
        </button>
      )}
    </figure>
  );
}
