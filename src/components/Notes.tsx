import { useEffect, useRef, useState } from "react";

interface Props {
  lessonId: string;
}

const NOTES_KEY = "ict-notes";

export default function Notes({ lessonId }: Props) {
  const [value, setValue] = useState("");
  const [savedValue, setSavedValue] = useState("");
  const [status, setStatus] = useState("");
  const loaded = useRef(false);
  const hideTimer = useRef(0);

  useEffect(() => {
    // biome-ignore lint/suspicious/noUnnecessaryConditions: loaded ref mutates after mount; biome cannot see ref writes
    if (loaded.current) {
      return;
    }
    loaded.current = true;
    try {
      const all = JSON.parse(localStorage.getItem(NOTES_KEY) || "{}") || {};
      if (typeof all[lessonId] === "string") {
        setValue(all[lessonId]);
        setSavedValue(all[lessonId]);
      }
    } catch {
      /* ignore */
    }
  }, [lessonId]);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  const dirty = value !== savedValue;

  const persist = (next: string, message: string) => {
    try {
      const all = JSON.parse(localStorage.getItem(NOTES_KEY) || "{}") || {};
      if (next) {
        all[lessonId] = next;
      } else {
        delete all[lessonId];
      }
      localStorage.setItem(NOTES_KEY, JSON.stringify(all));
      setSavedValue(next);
      setStatus(message);
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setStatus(""), 2200);
    } catch {
      /* ignore */
    }
  };

  const save = () => persist(value, "✓ Saved");

  const clear = () => {
    persist("", "✓ Cleared");
    setValue("");
  };

  return (
    <div className="notes">
      <h3>My Notes</h3>
      <div className="notes-sub">
        Saved locally on this device — not part of the course content.
      </div>
      <textarea
        aria-label="My notes"
        className="notes-area"
        onChange={(e) => setValue(e.target.value)}
        placeholder="Jot down anything you want to remember about this lesson…"
        value={value}
      />
      <div className="notes-actions">
        <button
          className="btn save-btn"
          disabled={!dirty}
          onClick={save}
          type="button"
        >
          Save notes
        </button>
        <button
          className="btn clear-btn"
          disabled={value === ""}
          onClick={clear}
          type="button"
        >
          Clear
        </button>
        <div
          aria-live="polite"
          className={`notes-status${dirty && !status ? " unsaved" : ""}`}
        >
          {status || (dirty ? "Unsaved changes" : "")}
        </div>
      </div>
    </div>
  );
}
