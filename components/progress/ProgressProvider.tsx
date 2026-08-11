"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadMyProgress, mergeLocalState, toggleDone } from "@/app/actions/progress";

/**
 * P1: progress was localStorage-only, exactly as it was for the static site
 * (see CLAUDE.md's `ict-done` key). P4 Task 22 adds per-user persistence for
 * signed-in users: `loadMyProgress()` returning null IS the signed-out
 * signal, so this component stays free of any auth SDK import.
 */
const DONE_KEY = "ict-done";
const QUIZ_KEY = "ict-quiz";
const MERGED_KEY = "ict-merged";

interface ProgressApi {
  done: ReadonlySet<string>;
  isDone: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
  ready: boolean;
}

const ProgressContext = createContext<ProgressApi | null>(null);

export function useProgress(): ProgressApi {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}

function readLocalDone(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(DONE_KEY) ?? "[]");
    if (Array.isArray(raw)) return new Set(raw.map(String));
  } catch {
    /* ignore malformed storage */
  }
  return new Set();
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    // Deferred to a microtask (rather than called synchronously in the
    // effect body) so this mount-time read of an external store doesn't
    // trip react-hooks/set-state-in-effect.
    let cancelled = false;
    Promise.resolve().then(async () => {
      if (cancelled) return;
      const localDone = readLocalDone();
      setDone(localDone);
      setReady(true);

      const serverDone = await loadMyProgress();
      if (cancelled) return;
      if (serverDone === null) return; // signed out — stay in localStorage mode

      setSignedIn(true);

      const alreadyMerged = localStorage.getItem(MERGED_KEY);
      const localQuizRaw = localStorage.getItem(QUIZ_KEY);
      const hasLocalData = localDone.size > 0 || Boolean(localQuizRaw && localQuizRaw !== "{}");

      if (!alreadyMerged && hasLocalData) {
        try {
          let quiz: Record<string, number> = {};
          try {
            const parsed = JSON.parse(localQuizRaw ?? "{}");
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) quiz = parsed;
          } catch {
            /* ignore malformed local quiz state */
          }
          await mergeLocalState(JSON.stringify({ done: [...localDone], quiz }));
          localStorage.setItem(MERGED_KEY, "1");
          // NEVER clear ict-notes here — CLAUDE.md §3: no reset ever clears notes.
          localStorage.removeItem(DONE_KEY);
          localStorage.removeItem(QUIZ_KEY);
          const merged = await loadMyProgress();
          if (!cancelled && merged !== null) setDone(new Set(merged));
        } catch {
          // A failed merge must never lose the user's data — leave the local
          // keys alone and keep the app usable in localStorage mode.
        }
      } else {
        setDone(new Set(serverDone));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback(
    (id: string) => {
      // wasDone/next are computed here, outside setDone's updater, so the
      // toggleDone(...) side effect (a network round trip) never runs from
      // inside a setState updater — React may invoke updaters twice under
      // StrictMode, which would otherwise fire the action twice per click.
      const wasDone = done.has(id);
      const next = new Set(done);
      if (wasDone) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(DONE_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore storage errors */
      }
      setDone(next);

      if (signedIn) {
        toggleDone(id, !wasDone).catch(() => {
          // Optimistic update rejected — roll it back.
          setDone((cur) => {
            const rolledBack = new Set(cur);
            if (wasDone) rolledBack.add(id);
            else rolledBack.delete(id);
            return rolledBack;
          });
        });
      }
    },
    [done, signedIn],
  );

  const value = useMemo<ProgressApi>(
    () => ({
      done,
      isDone: (id: string) => done.has(id),
      toggle,
      count: done.size,
      ready,
    }),
    [done, toggle, ready],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
