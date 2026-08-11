"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadNote, saveNote } from "@/app/actions/notes";
import styles from "./notes.module.css";

interface NotesSectionProps {
  lessonId: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 800;

export function NotesSection({ lessonId }: NotesSectionProps) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Deferred to a microtask (rather than called synchronously in the
    // effect body) so this mount-time read doesn't trip
    // react-hooks/set-state-in-effect — mirrors ProgressProvider (22b).
    let cancelled = false;
    Promise.resolve().then(async () => {
      const result = await loadNote(lessonId);
      if (cancelled) return;
      setSignedIn(result.signedIn);
      setText(result.text);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleChange(next: string) {
    setText(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setStatus("saving");
      saveNote(lessonId, JSON.stringify({ type: "text", text: next }))
        .then(() => setStatus("saved"))
        .catch(() => setStatus("error"));
      // A failed save never clears the textarea — `text` state above is
      // untouched by the catch branch.
    }, AUTOSAVE_DELAY_MS);
  }

  if (!ready) return null;

  return (
    <section className={styles.notes} aria-label="Lesson notes" data-notes>
      <h3 className={styles.title}>Your notes</h3>
      {signedIn ? (
        <>
          <label className={styles.label} htmlFor={`notes-${lessonId}`}>
            Private notes for this lesson
          </label>
          <textarea
            id={`notes-${lessonId}`}
            className={styles.textarea}
            data-notes-input
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Write anything you want to remember about this lesson…"
          />
          <div className={styles.status} aria-live="polite">
            {status === "saving" && "Saving…"}
            {status === "saved" && "Saved"}
            {status === "error" && "Couldn't save"}
          </div>
        </>
      ) : (
        <p className={styles.gate}>
          <Link href="/auth/sign-in">Sign in</Link> to take notes on this lesson — saved to your
          account.
        </p>
      )}
    </section>
  );
}
