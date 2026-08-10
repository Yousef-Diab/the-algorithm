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

/**
 * P1: progress is localStorage-only, exactly as it was for the static site
 * (see CLAUDE.md's `ict-done` key). P4 Task 22 adds per-user persistence for
 * signed-in users; this provider gains a server-sync path then, not now.
 */
const DONE_KEY = "ict-done";

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

  useEffect(() => {
    // Deferred to a microtask (rather than called synchronously in the
    // effect body) so this mount-time read of an external store doesn't
    // trip react-hooks/set-state-in-effect.
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setDone(readLocalDone());
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(DONE_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  }, []);

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
