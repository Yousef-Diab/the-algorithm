"use client";

import { useEffect, useMemo, useState } from "react";
import { QuizGate } from "./QuizGate";
import { loadMyQuiz, recordQuizAction } from "@/app/actions/progress";
import styles from "./quiz.module.css";

export interface ApiQuestion {
  /** Stable uuid — INVARIANT 4: question identity, never a positional index. */
  id: string;
  /** question text */
  q: string;
  /** options */
  o: string[];
  /** index of the correct option in `o` */
  a: number;
  /** explanation, traceable to the source notes */
  e: string;
}

interface QuizProps {
  lessonId: string;
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic PRNG so the shuffle is identical on server and client. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded Fisher-Yates — a stable per-question option order that still keeps
 *  the correct answer out of a predictable slot (no SSR hydration mismatch).
 *  Seeded on the question id so editing a question's wording keeps its order. */
function seededShuffle(n: number, seed: string): number[] {
  const rnd = mulberry32(hashSeed(seed));
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type FetchState =
  | { status: "loading" }
  | { status: "locked" }
  | { status: "error" }
  | { status: "ready"; questions: ApiQuestion[] };

export function Quiz({ lessonId }: QuizProps) {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [answered, setAnswered] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/quiz/${lessonId}`)
      .then(async (r) => {
        if (cancelled) return;
        if (r.status === 401) return setState({ status: "locked" });
        if (!r.ok) return setState({ status: "error" });
        const body = (await r.json()) as { questions: ApiQuestion[] };
        setState({ status: "ready", questions: body.questions });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  useEffect(() => {
    if (state.status !== "ready") return;
    let cancelled = false;
    loadMyQuiz(lessonId)
      .then((server) => {
        if (cancelled || !server) return; // null: signed out, or refused — leave answered empty
        const restored: Record<string, number> = {};
        for (const [questionId, r] of Object.entries(server)) restored[questionId] = r.selected;
        setAnswered((prev) => ({ ...restored, ...prev }));
      })
      .catch(() => {
        /* ignore — quiz still works ungraded-on-reload if this fails */
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId, state.status]);

  const questions = useMemo(
    () => (state.status === "ready" ? state.questions : []),
    [state],
  );

  const orders = useMemo(
    () => questions.map((qq) => seededShuffle(qq.o.length, qq.id)),
    [questions],
  );

  function choose(question: ApiQuestion, optIndex: number) {
    if (answered[question.id] !== undefined) return;
    // Optimistic: set local state immediately, don't block the UI on the
    // round trip. Deliberately not rolled back on rejection — the quiz is
    // members-only (a signed-out click can't happen; QuizGate is shown
    // instead), so a failure here is a transient write error, not a
    // permission problem, and leaving the picked option visible is less
    // confusing than silently reverting a user's answer.
    setAnswered((prev) => ({ ...prev, [question.id]: optIndex }));
    recordQuizAction(lessonId, question.id, optIndex).catch(() => {
      /* see comment above — optimistic state is kept on failure */
    });
  }

  if (state.status === "loading" || state.status === "error") return null;
  if (state.status === "locked") return <QuizGate />;

  return (
    <section className={styles.quiz} aria-label="Lesson quiz">
      <h3 className={styles.title}>Check yourself</h3>
      <p className={styles.sub}>
        {questions.length} question{questions.length === 1 ? "" : "s"} · options
        are shuffled
      </p>

      {questions.map((qq, qi) => {
        const order = orders[qi];
        const picked = answered[qq.id];
        const isAnswered = picked !== undefined;
        return (
          <div key={qq.id} className={styles.q}>
            <div className={styles.qText}>{qq.q}</div>
            {order.map((optIndex) => {
              const isCorrect = optIndex === qq.a;
              const isPicked = picked === optIndex;
              const cls = [
                styles.opt,
                isAnswered && isCorrect ? styles.correct : "",
                isAnswered && isPicked && !isCorrect ? styles.wrong : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={optIndex}
                  type="button"
                  className={cls}
                  data-quiz-option
                  disabled={isAnswered}
                  onClick={() => choose(qq, optIndex)}
                >
                  {qq.o[optIndex]}
                </button>
              );
            })}
            <div className={`${styles.expl} ${isAnswered ? styles.show : ""}`}>
              {qq.e}
            </div>
          </div>
        );
      })}
    </section>
  );
}
