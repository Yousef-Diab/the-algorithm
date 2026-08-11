"use client";

import { useEffect, useMemo, useState } from "react";
import { QuizGate } from "./QuizGate";
import { loadMyQuiz, recordQuizAction, resetLessonQuiz } from "@/app/actions/progress";
import { seededShuffle } from "./shuffle";
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

type FetchState =
  | { status: "loading" }
  | { status: "locked" }
  | { status: "error" }
  | { status: "ready"; questions: ApiQuestion[] };

export function Quiz({ lessonId }: QuizProps) {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [answered, setAnswered] = useState<Record<string, number>>({});
  const [resetting, setResetting] = useState(false);

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

  // Await-before-clear: the server delete must succeed before the local
  // `answered` state is wiped, so a rejected call leaves the quiz exactly as
  // graded as it still is in the database — never a cleared UI backed by
  // ungraded-looking-but-still-recorded rows. Disabled while in flight so a
  // double-click can't fire two deletes.
  async function handleReset() {
    if (resetting) return;
    setResetting(true);
    try {
      await resetLessonQuiz(lessonId);
      setAnswered({});
    } catch {
      /* server call failed — leave graded state as-is, it still matches the DB */
    } finally {
      setResetting(false);
    }
  }

  if (state.status === "loading" || state.status === "error") return null;
  if (state.status === "locked") return <QuizGate />;

  const hasAnswers = Object.keys(answered).length > 0;

  return (
    <section className={styles.quiz} aria-label="Lesson quiz">
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Check yourself</h3>
          <p className={styles.sub}>
            {questions.length} question{questions.length === 1 ? "" : "s"} · options
            are shuffled
          </p>
        </div>
        {hasAnswers && (
          <button
            type="button"
            className={styles.reset}
            data-quiz-reset
            disabled={resetting}
            onClick={handleReset}
          >
            Reset
          </button>
        )}
      </div>

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
