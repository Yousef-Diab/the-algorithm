"use client";

import { useEffect, useMemo, useState } from "react";
import { QuizGate } from "./QuizGate";
import { submitExam, retakeExam } from "@/app/actions/exam";
// Typed from the dedicated lib/db/exam-types.ts, not from a "use server"
// file: see the comment in app/actions/exam.ts for why a type re-export from
// a server-action module throws ReferenceError at SSR module evaluation, and
// not from lib/db/exam-queries.ts either, since that file carries
// `import "server-only"` — exam-types.ts exists specifically to be an
// unambiguous, side-effect-free type source for both boundaries.
import type { ExamResultDto } from "@/lib/db/exam-types";
import { seededShuffle } from "./shuffle";
import styles from "./exam.module.css";

export interface ApiExamQuestion {
  /** Stable uuid — question identity, never a positional index. */
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

interface ExamProps {
  lessonId: string;
}

type FetchState =
  | { status: "loading" }
  | { status: "locked" }
  | { status: "error" }
  | { status: "ready"; questions: ApiExamQuestion[]; passMark: number; saved: ExamResultDto | null };

/**
 * Resolves a saved pick (stored as option TEXT) back onto the CURRENT set of
 * options for a question. Text, not index, is the stored identity — see
 * app/actions/exam.ts — so a question edited since the attempt was recorded
 * can leave a pick whose text matches nothing; that question is then treated
 * as unanswered rather than throwing or mis-highlighting an option.
 */
function resolvePickedIndex(question: ApiExamQuestion, picks: Record<string, string>): number | undefined {
  const text = picks[question.id];
  if (text === undefined) return undefined;
  const index = question.o.indexOf(text);
  return index === -1 ? undefined : index;
}

export function Exam({ lessonId }: ExamProps) {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const [last, setLast] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/exam/${lessonId}`)
      .then(async (r) => {
        if (cancelled) return;
        if (r.status === 401) return setState({ status: "locked" });
        if (!r.ok) return setState({ status: "error" });
        const body = (await r.json()) as {
          questions: ApiExamQuestion[];
          passMark: number;
          saved: ExamResultDto | null;
        };
        setState({ status: "ready", questions: body.questions, passMark: body.passMark, saved: body.saved });
        // Seed the editable local state from the server's saved result in
        // the same tick as the fetch resolves — not a second effect reacting
        // to `state`, which would be deriving state from state rather than
        // syncing with the external fetch.
        setPicks(body.saved?.picks ?? {});
        setSubmitted(Boolean(body.saved?.submitted));
        setBest(body.saved?.best ?? null);
        setLast(body.saved?.last ?? null);
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const questions = useMemo(() => (state.status === "ready" ? state.questions : []), [state]);
  const passMark = state.status === "ready" ? state.passMark : 0.8;
  const passPct = Math.round(passMark * 100);

  const orders = useMemo(
    () => questions.map((qq) => seededShuffle(qq.o.length, qq.id)),
    [questions],
  );

  function choose(question: ApiExamQuestion, optIndex: number) {
    if (submitted) return;
    setPicks((prev) => ({ ...prev, [question.id]: question.o[optIndex] }));
  }

  async function handleSubmit() {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      const result = await submitExam(lessonId, JSON.stringify({ picks }));
      if (result) {
        setPicks(result.picks);
        setSubmitted(result.submitted);
        setBest(result.best);
        setLast(result.last);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRetake() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await retakeExam(lessonId);
      setPicks(result?.picks ?? {});
      setSubmitted(Boolean(result?.submitted));
      setBest(result?.best ?? best);
      setLast(result?.last ?? last);
    } finally {
      setSubmitting(false);
    }
  }

  if (state.status === "loading" || state.status === "error") return null;
  if (state.status === "locked") return <QuizGate />;

  const passed = submitted && last !== null && last >= passPct;

  return (
    <section className={styles.exam} aria-label="Section exam">
      <h3 className={styles.title}>Final exam</h3>
      <p className={styles.sub}>
        {questions.length} question{questions.length === 1 ? "" : "s"} · answer everything, then
        submit
      </p>

      {questions.map((qq, qi) => {
        const order = orders[qi];
        const pickedIndex = resolvePickedIndex(qq, picks);
        return (
          <div key={qq.id} className={styles.q}>
            <div className={styles.qText}>{qq.q}</div>
            {order.map((optIndex) => {
              const isCorrect = optIndex === qq.a;
              const isPicked = pickedIndex === optIndex;
              const cls = [
                styles.opt,
                !submitted && isPicked ? styles.picked : "",
                submitted && isCorrect ? styles.correct : "",
                submitted && isPicked && !isCorrect ? styles.wrong : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={optIndex}
                  type="button"
                  className={cls}
                  data-exam-option
                  {...(submitted && isCorrect ? { "data-exam-correct": "" } : {})}
                  disabled={submitted}
                  onClick={() => choose(qq, optIndex)}
                >
                  {qq.o[optIndex]}
                </button>
              );
            })}
            <div
              className={`${styles.expl} ${submitted ? styles.show : ""}`}
              data-exam-explanation
              data-shown={submitted ? "true" : "false"}
            >
              {submitted ? qq.e : null}
            </div>
          </div>
        );
      })}

      <div className={styles.footer}>
        {submitted ? (
          <>
            <p className={styles.result} data-exam-result>
              Score: {last}% {best !== null && best !== last ? `(best ${best}%)` : ""} · Pass mark{" "}
              {passPct}% · {passed ? "Passed" : "Not passed"}
            </p>
            <button type="button" className={styles.action} disabled={submitting} onClick={handleRetake}>
              Retake
            </button>
          </>
        ) : (
          <button type="button" className={styles.action} disabled={submitting} onClick={handleSubmit}>
            Submit
          </button>
        )}
      </div>
    </section>
  );
}
