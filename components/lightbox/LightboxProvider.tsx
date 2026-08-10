"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import styles from "./Lightbox.module.css";

interface LightboxApi {
  open: (src: string, caption?: string) => void;
}

const LightboxContext = createContext<LightboxApi | null>(null);

export function useLightbox(): LightboxApi {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox must be used within LightboxProvider");
  return ctx;
}

interface LightboxState {
  src: string;
  caption?: string;
}

/* Zoom is expressed relative to the fitted size (100% = fit, max 500%);
   ported 1:1 from engine/app.js's ZOOM_MIN/ZOOM_MAX/ZOOM_STEP. */
const ZOOM_MIN = 1;
const ZOOM_MAX = 5;
const ZOOM_STEP = 1.25;

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null);
  const [zoom, setZoom] = useState(1);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const fitWidthRef = useRef(0);
  const draggingRef = useRef(false);
  const draggedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const clampZoom = useCallback((z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)), []);

  /* Measure the fitted width with the CSS caps back on, then scale a fixed
     pixel width from it — a plain percentage would be relative to the
     stage, not to the image's own fitted size. Ported from lbApplyZoom. */
  const applyZoom = useCallback((z: number) => {
    const img = imgRef.current;
    const stage = stageRef.current;
    if (!img || !stage) return;
    img.style.width = "";
    img.style.maxWidth = "";
    img.style.maxHeight = "";
    if (img.clientWidth) fitWidthRef.current = img.clientWidth;
    if (z > 1) {
      img.style.maxWidth = "none";
      img.style.maxHeight = "none";
      img.style.width = `${Math.round(fitWidthRef.current * z)}px`;
    }
    stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
    stage.scrollTop = (stage.scrollHeight - stage.clientHeight) / 2;
  }, []);

  const setClampedZoom = useCallback(
    (z: number) => {
      const next = clampZoom(z);
      setZoom(next);
      applyZoom(next);
    },
    [clampZoom, applyZoom]
  );

  const open = useCallback((src: string, caption?: string) => {
    setZoom(1);
    setState({ src, caption });
  }, []);

  const close = useCallback(() => setState(null), []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "+" || e.key === "=") setClampedZoom(zoom * ZOOM_STEP);
      else if (e.key === "-" || e.key === "_") setClampedZoom(zoom / ZOOM_STEP);
      else if (e.key === "0") setClampedZoom(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, close, zoom, setClampedZoom]);

  // Re-fit on resize, same as the `window.addEventListener('resize', …)` in engine/app.js.
  useEffect(() => {
    if (!state) return;
    const onResize = () => applyZoom(zoom);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [state, zoom, applyZoom]);

  // Lock body scroll while open, same as `document.body.classList.add('lb-lock')`.
  useEffect(() => {
    if (!state) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [state]);

  const handleImageLoad = useCallback(() => applyZoom(zoom), [applyZoom, zoom]);

  /* TRAP 1 of 3: hit-test the image rect rather than trusting e.target. While
     zoomed, the stage holds a pointer capture (see handlePointerDown below),
     so Chromium retargets the follow-up click from the image to the
     capturing stage element — a plain click on the image would otherwise
     arrive with e.target === the stage, not the image. The rect test also
     gets the letterbox right (inside the stage but beside the image counts
     as "outside"). Synthetic clicks report clientX/Y as 0, hence the
     e.target fallback for those. Ported verbatim from lbHitsImage. */
  const hitsImage = useCallback((e: ReactMouseEvent) => {
    const img = imgRef.current;
    if (!img) return false;
    if (e.target === img) return true;
    if (!e.clientX && !e.clientY) return false;
    const r = img.getBoundingClientRect();
    return (
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom
    );
  }, []);

  const handleOverlayClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (draggedRef.current) {
        draggedRef.current = false; // a pan gesture, not a click
        return;
      }
      const target = e.target as HTMLElement;
      // Anything that isn't the image or the control panel is "outside" -> close.
      if (hitsImage(e) || target.closest(`.${styles.panel}`)) return;
      close();
    },
    [hitsImage, close]
  );

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (zoom <= 1 || e.target !== imgRef.current) return;
      draggingRef.current = true;
      draggedRef.current = false;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: stageRef.current?.scrollLeft ?? 0,
        scrollTop: stageRef.current?.scrollTop ?? 0,
      };
      stageRef.current?.setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [zoom]
  );

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !stageRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) draggedRef.current = true;
    stageRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;
    stageRef.current.scrollTop = dragStartRef.current.scrollTop - dy;
  }, []);

  const endDrag = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      stageRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  }, []);

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}
      {state ? (
        <div
          className={styles.lightbox}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
        >
          {/* TRAP 2 of 3: the stage takes ALL the leftover height (flex:1;
              min-height:0 — see Lightbox.module.css .stage) so the caption
              and panel are pinned to a fixed spot regardless of the image's
              aspect ratio or zoom level. */}
          <div
            ref={stageRef}
            className={zoom > 1 ? `${styles.stage} ${styles.zoomed}` : styles.stage}
            data-testid="lightbox-stage"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imgRef} src={state.src} alt={state.caption ?? ""} onLoad={handleImageLoad} />
          </div>
          {state.caption ? <div className={styles.caption}>{state.caption}</div> : null}
          <div className={styles.panel} data-testid="lightbox-panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.btn}
              onClick={() => setClampedZoom(zoom / ZOOM_STEP)}
              disabled={zoom <= ZOOM_MIN + 1e-3}
              aria-label="Zoom out"
              title="Zoom out (-)"
            >
              −
            </button>
            <div className={styles.zoomLabel}>{Math.round(zoom * 100)}%</div>
            <button
              type="button"
              className={styles.btn}
              onClick={() => setClampedZoom(zoom * ZOOM_STEP)}
              disabled={zoom >= ZOOM_MAX - 1e-3}
              aria-label="Zoom in"
              title="Zoom in (+)"
            >
              +
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.wide}`}
              onClick={() => setClampedZoom(1)}
              disabled={zoom <= ZOOM_MIN + 1e-3}
              title="Fit to screen (0)"
            >
              Fit
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={close}
              aria-label="Close"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}
    </LightboxContext.Provider>
  );
}
