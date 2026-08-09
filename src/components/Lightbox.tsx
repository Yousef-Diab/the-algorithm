import { useCallback, useEffect, useState } from "react";
import LightboxComponent from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Download from "yet-another-react-lightbox/plugins/download";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Share from "yet-another-react-lightbox/plugins/share";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/styles.css";

interface Slide {
  alt?: string;
  description?: string;
  download?: boolean;
  share?: boolean;
  src: string;
}

export default function Lightbox() {
  const [open, setOpen] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);

  const openAt = useCallback((i: number) => {
    const scope = document.querySelector(".lesson");
    const figs = scope
      ? scope.querySelectorAll(".fig img")
      : document.querySelectorAll(".fig img");
    const list: Slide[] = [];
    for (const el of figs) {
      const img = el as HTMLImageElement;
      list.push({
        alt: img.alt,
        description: img.dataset.cap || img.alt,
        download: true,
        share: true,
        src: img.currentSrc || img.src,
      });
    }
    if (list.length === 0) {
      return;
    }
    setSlides(list);
    setIndex(Math.min(i, list.length - 1));
    setOpen(true);
  }, []);

  // Intercept clicks on any .fig img and open the lightbox at that index.
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

  return (
    <LightboxComponent
      carousel={{ finite: true }}
      close={() => setOpen(false)}
      controller={{ closeOnBackdropClick: true }}
      fullscreen={{ auto: false }}
      index={index}
      labels={{
        Download: "Download chart",
        "Enter Fullscreen": "Enter fullscreen",
        "Exit Fullscreen": "Exit fullscreen",
        Pause: "Pause slideshow",
        Play: "Play slideshow",
        Share: "Share chart",
      }}
      on={{ view: ({ index: newIndex }) => setIndex(newIndex) }}
      open={open}
      plugins={[Captions, Zoom, Download, Share, Slideshow, Fullscreen]}
      slides={slides}
      slideshow={{ autoplay: false, delay: 3000 }}
      zoom={{ maxZoomPixelRatio: 5 }}
    />
  );
}
