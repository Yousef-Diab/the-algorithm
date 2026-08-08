import { useStore } from "@nanostores/react";
import { useEffect, useRef, useState } from "react";
import type { Question } from "../lib/course";
import { examStore, saveExamResult } from "../stores/progress";

interface Props {
  questions: Question[];
  sectionId: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Exam({ sectionId, questions }: Props) {
  const exams = useStore(examStore);
  // Gate localStorage-derived state behind a hydrated flag so the initial
  // client render matches the server HTML.
  const [hydrated, setHydrated] = useState(false);
  const st = hydrated ? exams[sectionId] : undefined;
  const m = questions.length;

  // Natural option order during SSR + initial hydration so server and client
  // HTML match; shuffle right after mount (random order per visit).
  const [order, setOrder] = useState<number[][]>(() =>
    questions.map((q) => q.o.map((_, j) => j))
  );
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [result, setResult] = useState<{
    score: number;
    correct: number;
  } | null>(null);
  const headRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only effect; shuffle + pick restore must run once
  useEffect(() => {
    setHydrated(true);
    setOrder(questions.map((q) => shuffle(q.o.map((_, j) => j))));
    setPicks(exams[sectionId]?.picks ?? {});
  }, []);

  const submitted = st?.submitted ?? false;
  const isSubmitted = submitted || result !== null;

  const grade = (p: Record<number, string>) => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (p[i] === q.o[q.a]) {
        correct += 1;
      }
    });
    return { correct, score: Math.round((correct / m) * 100) };
  };

  const shown =
    result ?? (submitted ? grade(st?.picks ?? {}) : { correct: 0, score: 0 });
  const shownScore = isSubmitted ? shown.score : 0;
  const shownCorrect = isSubmitted ? shown.correct : 0;

  const answered = Object.keys(picks).length;

  const pick = (i: number, opt: string) => {
    const next = { ...picks, [i]: opt };
    setPicks(next);
    saveExamResult(sectionId, { picks: next, submitted: false });
  };

  const submit = () => {
    if (answered < m) {
      // biome-ignore lint/suspicious/noAlert: native confirm is intentional for exam submission UX
      const ok = window.confirm(
        `You've answered ${answered} of ${m}. Submit anyway? Unanswered questions count as wrong.`
      );
      if (!ok) {
        return;
      }
    }
    const res = grade(picks);
    const prev = exams[sectionId];
    saveExamResult(sectionId, {
      best:
        prev && prev.best !== null ? Math.max(prev.best, res.score) : res.score,
      last: res.score,
      picks,
      submitted: true,
      taken: (prev?.taken ?? 0) + 1,
    });
    setResult(res);
    headRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const retake = () => {
    setPicks({});
    setResult(null);
    saveExamResult(sectionId, { picks: {}, submitted: false });
  };

  const badge =
    st && st.taken > 0
      ? `Best ${st.best}% · ${st.taken} ${st.taken === 1 ? "attempt" : "attempts"}`
      : "Not attempted yet";

  return (
    <div className="exam" ref={headRef}>
      <div className="quiz-head">
        <div>
          <h3>Final Exam</h3>
          <div className="q-sub">
            {m} questions · 80% to pass · retake it as often as you like.
          </div>
        </div>
        <div className="exam-best">{badge}</div>
      </div>

      {questions.map((q, i) => {
        const picked = picks[i];
        const idxs = order[i];
        const missed = isSubmitted && !picked;
        return (
          <div className={`q${missed ? " missed" : ""}`} key={q.q}>
            <div className="q-text">
              {i + 1}. {q.q}
            </div>
            {idxs.map((j) => {
              const opt = q.o[j];
              const cls = ["opt"];
              if (isSubmitted) {
                if (j === q.a) {
                  cls.push("correct");
                } else if (picked === opt) {
                  cls.push("wrong");
                }
              } else if (picked === opt) {
                cls.push("picked");
              }
              return (
                <button
                  className={cls.join(" ")}
                  disabled={isSubmitted}
                  key={j}
                  onClick={() => pick(i, opt)}
                  type="button"
                >
                  {opt}
                </button>
              );
            })}
            <div
              aria-live="polite"
              className={`expl${isSubmitted ? " show" : ""}`}
            >
              {q.e}
            </div>
          </div>
        );
      })}

      <div className="exam-bar">
        {isSubmitted ? (
          <div>
            <span
              className={`exam-score${shownScore >= 80 ? " pass" : " fail"}`}
            >
              {shownScore}%
            </span>
            <span className="exam-sub">
              {shownCorrect} of {m} correct —{" "}
              {shownScore >= 80
                ? "passed. Read the explanations on anything you missed."
                : "keep revising, 80% to pass."}
            </span>
          </div>
        ) : (
          <div className="exam-status">
            {answered} / {m} answered
          </div>
        )}
        <div className="exam-actions">
          {isSubmitted && (
            <button className="btn" onClick={retake} type="button">
              Retake exam
            </button>
          )}
          {!isSubmitted && (
            <button
              className="btn primary"
              disabled={answered === 0}
              onClick={submit}
              type="button"
            >
              Submit exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
