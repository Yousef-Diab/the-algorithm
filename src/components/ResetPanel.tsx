import { useState } from "react";
import { clearDone, clearExams } from "../stores/progress";

const ACTIONS: {
  label: string;
  confirm: string;
  status: string;
  danger?: boolean;
  run: () => void;
}[] = [
  {
    confirm:
      "Clear every lesson-check answer? You can then take them all again.",
    label: "Reset lesson quizzes",
    run: () => {
      try {
        localStorage.removeItem("ict-quiz");
      } catch {
        /* ignore */
      }
    },
    status: "Lesson quizzes reset.",
  },
  {
    confirm: "Clear every final exam — including the best scores?",
    label: "Reset final exams",
    run: () => {
      try {
        localStorage.removeItem("ict-exam");
      } catch {
        /* ignore */
      }
      clearExams();
    },
    status: "Final exams reset.",
  },
  {
    confirm: "Clear which lessons are marked complete?",
    label: "Reset lesson progress",
    run: () => {
      try {
        localStorage.removeItem("ict-done");
      } catch {
        /* ignore */
      }
      clearDone();
    },
    status: "Lesson progress reset.",
  },
  {
    confirm:
      "Clear all quizzes, exams and lesson progress? Your notes are kept.",
    danger: true,
    label: "Reset everything",
    run: () => {
      try {
        localStorage.removeItem("ict-quiz");
        localStorage.removeItem("ict-exam");
        localStorage.removeItem("ict-done");
      } catch {
        /* ignore */
      }
      clearDone();
      clearExams();
    },
    status: "Everything reset — notes kept.",
  },
];

export default function ResetPanel() {
  const [status, setStatus] = useState("");

  return (
    <div className="reset-panel">
      <h3>Start over</h3>
      <div className="reset-sub">
        Clear saved answers so you can take everything again.{" "}
        <strong>Your personal lesson notes are never touched.</strong>
      </div>
      <div className="reset-btns">
        {ACTIONS.map((a) => (
          <button
            className={`btn${a.danger ? " danger" : ""}`}
            key={a.label}
            onClick={() => {
              // biome-ignore lint/suspicious/noAlert: native confirm is intentional for destructive resets
              if (window.confirm(a.confirm)) {
                a.run();
                setStatus(a.status);
              }
            }}
            type="button"
          >
            {a.label}
          </button>
        ))}
      </div>
      <div aria-live="polite" className="reset-status">
        {status}
      </div>
    </div>
  );
}
