import { useCallback, useEffect, useRef, useState } from "react";

interface ImgData {
  alt: string;
  cap: string;
  src: string;
}

const ZOOM_MIN = 1;
const ZOOM_MAX = 5;
const ZOOM_STEP = 1.25;

export default function Lightbox() {
  const [open, setOpen] = useState(false);
  const [imgs, setImgs] = useState<ImgData[]>([]);
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(ZOOM_MIN);
  const imgRef = useRef<HTMLImageElement>(null);
  const fitW = useRef(1);
  const zoomRef = useRef(ZOOM_MIN);
  const dragState = useRef<{
    x: number;
    y: number;
    sl: number;
    st: number;
  } | null>(null);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const applyZoom = useCallback((z: number) => {
    const img = imgRef.current;
    // biome-ignore lint/suspicious/noUnnecessaryConditions: img ref is null until the element mounts
    if (!img) {
      return;
    }
    if (z <= ZOOM_MIN) {
      img.style.removeProperty("width");
      img.style.removeProperty("max-width");
      img.style.removeProperty("max-height");
    } else {
      img.style.maxWidth = "none";
      img.style.maxHeight = "none";
      img.style.width = `${Math.round(fitW.current * z)}px`;
    }
  }, []);

  const setZoomState = useCallback(
    (z: number) => {
      const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
      setZoom(clamped);
      requestAnimationFrame(() => {
        applyZoom(clamped);
        const stage = document.querySelector(".lb-stage") as HTMLElement | null;
        if (stage) {
          stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
          stage.scrollTop = (stage.scrollHeight - stage.clientHeight) / 2;
        }
      });
    },
    [applyZoom]
  );

  const openAt = useCallback(
    (i: number) => {
      const scope = document.querySelector(".lesson");
      const figs = scope
        ? scope.querySelectorAll(".fig img")
        : document.querySelectorAll(".fig img");
      const list: ImgData[] = [];
      for (const el of figs) {
        const img = el as HTMLImageElement;
        list.push({
          alt: img.alt,
          cap: img.dataset.cap || img.alt,
          src: img.currentSrc || img.src,
        });
      }
      if (list.length === 0) {
        return;
      }
      setImgs(list);
      setIdx(Math.min(i, list.length - 1));
      setZoomState(ZOOM_MIN);
      setOpen(true);
    },
    [setZoomState]
  );

  // Open on any .fig img click inside the current lesson.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".fig img")) {
        const scope = target.closest(".lesson");
        const list = scope
          ? Array.from(scope.querySelectorAll(".fig img"))
          : Array.from(document.querySelectorAll(".fig img"));
        const i = list.indexOf(target as HTMLImageElement);
        openAt(i === -1 ? 0 : i);
      }
    };
    document.addEventListener("click", onClick);
    document.documentElement.setAttribute("data-lb-ready", "true");
    return () => document.removeEventListener("click", onClick);
  }, [openAt]);

  // Reset zoom when browsing to another chart.
  // biome-ignore lint/correctness/useExhaustiveDependencies: idx is an intentional re-run trigger; setZoomState is a stable callback
  useEffect(() => {
    if (open) {
      setZoomState(ZOOM_MIN);
    }
  }, [idx, open]);

  // Keyboard controls while open.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          setOpen(false);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setIdx((i) => Math.max(0, i - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setIdx((i) => Math.min(imgs.length - 1, i + 1));
          break;
        case "+":
        case "=":
          e.preventDefault();
          setZoomState(zoomRef.current * ZOOM_STEP);
          break;
        case "-":
        case "_":
          e.preventDefault();
          setZoomState(zoomRef.current / ZOOM_STEP);
          break;
        case "0":
          e.preventDefault();
          setZoomState(ZOOM_MIN);
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, imgs.length, setZoomState]);

  // Body scroll lock + re-fit on window resize while open.
  useEffect(() => {
    if (!open) {
      return;
    }
    document.body.classList.add("lb-lock");
    const onResize = () => {
      requestAnimationFrame(() => applyZoom(zoomRef.current));
    };
    window.addEventListener("resize", onResize);
    return () => {
      document.body.classList.remove("lb-lock");
      window.removeEventListener("resize", onResize);
    };
  }, [open, applyZoom]);

  if (!open) {
    return null;
  }
  const img = imgs[idx];
  const multi = imgs.length > 1;
  const label = `${Math.round(zoom * 100)}%`;

  return (
    <div
      aria-label="Chart lightbox"
      aria-modal="true"
      className="open"
      id="lightbox"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false);
        }
      }}
      role="dialog"
    >
      <div
        className={`lb-stage${zoom > 1 ? " zoomed" : ""}`}
        onPointerCancel={() => {
          dragState.current = null;
        }}
        onPointerDown={(e) => {
          if (zoom <= 1) {
            return;
          }
          const stage = e.currentTarget as HTMLElement;
          dragState.current = {
            sl: stage.scrollLeft,
            st: stage.scrollTop,
            x: e.clientX,
            y: e.clientY,
          };
          stage.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = dragState.current;
          // biome-ignore lint/suspicious/noUnnecessaryConditions: dragState ref is null until a drag starts
          if (!d) {
            return;
          }
          const stage = e.currentTarget as HTMLElement;
          stage.scrollLeft = d.sl - (e.clientX - d.x);
          stage.scrollTop = d.st - (e.clientY - d.y);
        }}
        onPointerUp={() => {
          dragState.current = null;
        }}
      >
        {img && (
          <img
            alt={img.alt}
            draggable={false}
            onLoad={() => {
              const el = imgRef.current;
              // biome-ignore lint/suspicious/noUnnecessaryConditions: img ref is null until the element mounts
              if (!el) {
                return;
              }
              el.style.removeProperty("width");
              el.style.removeProperty("max-width");
              el.style.removeProperty("max-height");
              fitW.current = el.clientWidth || 1;
              applyZoom(zoomRef.current);
            }}
            ref={imgRef}
            src={img.src}
          />
        )}
      </div>
      <div className="lb-cap">{img?.cap ?? ""}</div>
      <div className="lb-panel">
        <button
          aria-label="Previous chart"
          className="lb-btn"
          data-lb="prev"
          disabled={!multi || idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          type="button"
        >
          ←
        </button>
        <span aria-live="polite" className="lb-count">
          {multi ? `${idx + 1} / ${imgs.length}` : ""}
        </span>
        <button
          aria-label="Next chart"
          className="lb-btn"
          data-lb="next"
          disabled={!multi || idx === imgs.length - 1}
          onClick={() => setIdx((i) => Math.min(imgs.length - 1, i + 1))}
          type="button"
        >
          →
        </button>
        <span aria-hidden="true" className="lb-sep" />
        <button
          aria-label="Zoom in"
          className="lb-btn"
          data-lb="in"
          disabled={zoom >= ZOOM_MAX - 0.001}
          onClick={() => setZoomState(zoomRef.current * ZOOM_STEP)}
          type="button"
        >
          +
        </button>
        <span aria-live="polite" className="lb-zoom">
          {label}
        </span>
        <button
          aria-label="Zoom out"
          className="lb-btn"
          data-lb="out"
          disabled={zoom <= ZOOM_MIN + 0.001}
          onClick={() => setZoomState(zoomRef.current / ZOOM_STEP)}
          type="button"
        >
          −
        </button>
        <button
          aria-label="Reset zoom to fit"
          className="lb-btn lb-wide"
          data-lb="reset"
          disabled={zoom <= ZOOM_MIN + 0.001}
          onClick={() => setZoomState(ZOOM_MIN)}
          type="button"
        >
          Fit
        </button>
        <span aria-hidden="true" className="lb-sep" />
        <button
          aria-label="Close lightbox"
          className="lb-btn"
          data-lb="close"
          onClick={() => setOpen(false)}
          type="button"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
