import { FigureImage, type FigureSources } from "./FigureImage";
import styles from "./Figures.module.css";

/** Galleries render when there are more than two charts, as they always have. */
export function Figures({ figures }: { figures: FigureSources[] }) {
  if (figures.length === 0) return null;
  const gallery = figures.length > 2;
  return (
    <div className={gallery ? styles.gallery : undefined}>
      {figures.map((f, i) => (
        <FigureImage key={f.src} fig={f} gallery={gallery} siblings={figures} index={i} />
      ))}
    </div>
  );
}
