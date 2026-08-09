import { useEffect, useState } from "react";
import type { Question } from "@/lib/course";

interface Props {
  questions: Question[];
  /** localStorage key prefix, e.g. the lesson id (ict-quiz["m1-01-0"]). */
  quizKey: string;
}

interface AnswerState {
  correct: boolean;
  picked: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function readSaved(quizKey: string): Record<number, boolean> {
  if (typeof window === "undefined") {
    return {};
  }
  const out: Record<number, boolean> = {};
  try {
    for (let i = 0; i < 99; i += 1) {
      const v = localStorage.getItem(`${quizKey}-${i}`);
      if (v === null) {
        continue;
      }
      out[i] = v === "true";
    }
  } catch {
    /* ignore */
  }
  return out;
}

function writeSaved(quizKey: string, i: number, correct: boolean) {
  try {
    localStorage.setItem(`${quizKey}-${i}`, String(correct));
  } catch {
    /* ignore */
  }
}

export default function Quiz({ quizKey, questions }: Props) {
  // Natural option order during SSR + initial hydration so server and client
  // HTML match; shuffle right after mount (random order per visit, like the
  // original site).
  const [order, setOrder] = useState<number[][]>(() =>
    questions.map((q) => q.o.map((_, j) => j))
  );
  // Hydrate with saved answers only AFTER the first client render, so the
  // server markup (ungraded) always matches the initial hydration render.
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only effect; questions array is static per lesson
  useEffect(() => {
    setOrder(questions.map((q) => shuffle(q.o.map((_, j) => j))));
    const saved = readSaved(quizKey);
    const out: Record<number, AnswerState> = {};
    for (const i of Object.keys(saved)) {
      const idx = Number(i);
      if (Number.isNaN(idx) || idx >= questions.length) {
        continue;
      }
      out[idx] = { correct: saved[idx], picked: "" };
    }
    setAnswers(out);
  }, [quizKey, questions.length]);

  const grade = (i: number, picked: string) => {
    const q = questions[i];
    const correct = picked === q.o[q.a];
    setAnswers((prev) => ({ ...prev, [i]: { correct, picked } }));
    writeSaved(quizKey, i, correct);
  };

  const resetQuiz = () => {
    try {
      for (let i = 0; i < questions.length; i += 1) {
        localStorage.removeItem(`${quizKey}-${i}`);
      }
    } catch {
      /* ignore */
    }
    setAnswers({});
  };

  const anyAnswered = Object.keys(answers).length > 0;

  return (
    <div className="quiz">
      <div className="quiz-head">
        <div>
          <h3>Lesson Check</h3>
          <div className="q-sub">
            Answers come straight from the notes above.
          </div>
        </div>
        <button
          className="mini-btn"
          disabled={!anyAnswered}
          onClick={resetQuiz}
          type="button"
        >
          Reset quiz
        </button>
      </div>

      {questions.map((q, i) => {
        const st = answers[i];
        const idxs = order[i];
        return (
          <div className="q" key={q.q}>
            <div className="q-text">
              {i + 1}. {q.q}
            </div>
            {idxs.map((j) => {
              const opt = q.o[j];
              const cls = ["opt"];
              if (st) {
                if (j === q.a) {
                  cls.push("correct");
                } else if (st.picked === opt) {
                  cls.push("wrong");
                }
              }
              return (
                <button
                  className={cls.join(" ")}
                  disabled={!!st}
                  key={j}
                  onClick={() => grade(i, opt)}
                  type="button"
                >
                  {opt}
                </button>
              );
            })}
            <div aria-live="polite" className={`expl${st ? " show" : ""}`}>
              {q.e}
            </div>
          </div>
        );
      })}
    </div>
  );
}
