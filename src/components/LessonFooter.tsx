import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { doneStore, markDone, toggleDone } from "../stores/progress";

interface Props {
  isLast: boolean;
  lessonId: string;
  nextHref: string;
  nextLabel: string;
  prevHref: string;
  prevLabel: string;
}

export default function LessonFooter({
  lessonId,
  prevHref,
  prevLabel,
  nextHref,
  nextLabel,
  isLast,
}: Props) {
  // Hydrate flag: keeps the initial client render identical to the server
  // HTML (both render 'Mark complete'), then applies saved progress.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const done = useStore(doneStore);
  const isDone = hydrated && done.includes(lessonId);

  return (
    <div className="lesson-footer">
      <a className="btn" href={prevHref}>
        ← {prevLabel}
      </a>
      <button
        className={`btn done-btn${isDone ? " marked" : ""}`}
        onClick={() => toggleDone(lessonId)}
        type="button"
      >
        {isDone ? "✓ Completed" : "Mark complete"}
      </button>
      <a
        className="btn primary"
        href={nextHref}
        onClick={() => markDone(lessonId)}
      >
        {isLast ? "Finish course" : `Next: ${nextLabel} →`}
      </a>
    </div>
  );
}
