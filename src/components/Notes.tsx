import { useEffect, useRef, useState } from "react";

interface Props {
  lessonId: string;
}

const NOTES_KEY = "ict-notes";

export default function Notes({ lessonId }: Props) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");
  const loaded = useRef(false);

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
      }
    } catch {
      /* ignore */
    }
  }, [lessonId]);

  useEffect(() => {
    // biome-ignore lint/suspicious/noUnnecessaryConditions: loaded ref mutates after mount; biome cannot see ref writes
    if (!loaded.current) {
      return;
    }
    const t = setTimeout(() => {
      try {
        const all = JSON.parse(localStorage.getItem(NOTES_KEY) || "{}") || {};
        if (value) {
          all[lessonId] = value;
        } else {
          delete all[lessonId];
        }
        localStorage.setItem(NOTES_KEY, JSON.stringify(all));
        setStatus("Saved");
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [value, lessonId]);

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
      <div aria-live="polite" className="notes-status">
        {status}
      </div>
    </div>
  );
}
