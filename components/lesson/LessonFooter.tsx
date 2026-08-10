"use client";

import Link from "next/link";
import { useProgress } from "@/components/progress/ProgressProvider";
import type { CatalogLesson } from "@/lib/content/queries";

interface LessonFooterProps {
  id: string;
  prev?: CatalogLesson;
  next?: CatalogLesson;
}

export function LessonFooter({ id, prev, next }: LessonFooterProps) {
  const { isDone, toggle, ready } = useProgress();
  const done = ready && isDone(id);

  return (
    <div className="lesson-footer">
      {prev ? (
        <Link className="btn" href={`/lesson/${prev.id}`}>
          ← {prev.title}
        </Link>
      ) : (
        <span />
      )}

      <button
        type="button"
        className={`btn ${done ? "primary" : ""}`}
        onClick={() => toggle(id)}
      >
        {done ? "✓ Completed" : "Mark complete"}
      </button>

      {next ? (
        <Link className="btn primary" href={`/lesson/${next.id}`}>
          {next.title} →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
