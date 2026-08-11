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
  // Set the moment the user types in THIS mount, so a load response that
  // resolves late never clobbers keystrokes made while it was in flight.
  const typedRef = useRef(false);
  // Mirrors `text` synchronously (state updates are async), so a flush at
  // unmount always saves the latest keystroke rather than a stale render.
  const textRef = useRef("");
  // Monotonic id per issued save. A response is only trusted — for status
  // display or otherwise — if it is still the most recently issued one,
  // which keeps an out-of-order resolution from resurrecting stale text.
  const seqRef = useRef(0);
  const latestIssuedSeqRef = useRef(0);

  /** Fires a save for `targetLessonId` with `value`, tagged with a fresh
   *  sequence number. A response is only reflected in `status` if it is
   *  still the latest issued save (guards against out-of-order resolution)
   *  and no newer edit is currently pending in `timerRef` (guards against
   *  showing "Saved" while a later keystroke hasn't been sent yet). */
  function fireSave(targetLessonId: string, value: string) {
    const seq = ++seqRef.current;
    latestIssuedSeqRef.current = seq;
    setStatus("saving");
    saveNote(targetLessonId, JSON.stringify({ type: "text", text: value }))
      .then(() => {
        if (seq !== latestIssuedSeqRef.current) return; // superseded by a newer save
        if (timerRef.current) return; // a newer edit is still waiting to be sent
        setStatus("saved");
      })
      .catch(() => {
        if (seq !== latestIssuedSeqRef.current) return;
        setStatus("error");
        // A failed save never clears the textarea — `text` state is
        // untouched here.
      });
  }

  useEffect(() => {
    // Deferred to a microtask (rather than called synchronously in the
    // effect body) so this mount-time read doesn't trip
    // react-hooks/set-state-in-effect — mirrors ProgressProvider (22b).
    let cancelled = false;
    Promise.resolve().then(async () => {
      const result = await loadNote(lessonId);
      if (cancelled) return;
      setSignedIn(result.signedIn);
      // Do not overwrite text the user already started typing in this
      // mount while the load was in flight.
      if (!typedRef.current) {
        setText(result.text);
        textRef.current = result.text;
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  useEffect(() => {
    // Re-runs whenever the lesson identity changes (in addition to true
    // unmount), so a pending autosave for the lesson being left is flushed
    // — saved against ITS lessonId, not dropped or misattributed to the
    // next one.
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        fireSave(lessonId, textRef.current);
      }
    };
  }, [lessonId]);

  function handleChange(next: string) {
    typedRef.current = true;
    setText(next);
    textRef.current = next;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      fireSave(lessonId, next);
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
