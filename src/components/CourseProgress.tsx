import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import { doneStore, examStore } from "../stores/progress";

interface Props {
  /** Month cards to patch: [data-prog="{id}"] + [data-mprog="{id}"] */
  months: { id: string; total: number; charts: number }[];
  /** Section review cards: [data-exam-best="{id}"] + [data-summary-prog="{id}"] */
  sections: { id: string; monthIds: string[] }[];
}

export default function CourseProgress({ months, sections }: Props) {
  const done = useStore(doneStore);
  const exams = useStore(examStore);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: data-driven patch loop over fixed collections
  useEffect(() => {
    for (const m of months) {
      const prefix = `${m.id}-`;
      const doneCt = done.filter((id) => id.startsWith(prefix)).length;
      const prog = document.querySelector(`[data-prog="${m.id}"]`);
      if (prog) {
        prog.textContent = `${doneCt}/${m.total} lessons · ${m.charts} charts`;
      }
      const pill = document.querySelector(`[data-mprog="${m.id}"]`);
      if (pill) {
        pill.textContent = `${doneCt}/${m.total}`;
      }
    }
    for (const s of sections) {
      const doneCt = done.filter((id) =>
        s.monthIds.some((mid) => id.startsWith(`${mid}-`))
      ).length;
      const sp = document.querySelector(`[data-summary-prog="${s.id}"]`);
      if (sp) {
        sp.textContent = `${doneCt} completed`;
      }
      const eb = document.querySelector(`[data-exam-best="${s.id}"]`);
      if (eb) {
        const st = exams[s.id];
        eb.textContent =
          st && st.taken > 0
            ? `Best ${st.best}% · last ${st.last}% · ${st.taken} ${
                st.taken === 1 ? "attempt" : "attempts"
              }`
            : "Not attempted yet";
      }
    }
  }, [done, exams, months, sections]);

  return null;
}
