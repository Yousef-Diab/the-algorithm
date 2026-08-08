import { atom } from "nanostores";

export interface ExamState {
  best: number | null;
  last: number | null;
  /** Picks keyed by question index, stored by option TEXT (options re-shuffle). */
  picks: Record<number, string>;
  submitted: boolean;
  taken: number;
}

const DONE_KEY = "ict-done";
const EXAM_KEY = "ict-exam";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

/** Completed lesson ids (localStorage key ict-done). */
export const doneStore = atom<string[]>(readJson<string[]>(DONE_KEY, []));

export function toggleDone(id: string) {
  const cur = doneStore.get();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  doneStore.set(next);
  writeJson(DONE_KEY, next);
}

export function markDone(id: string) {
  if (!doneStore.get().includes(id)) {
    toggleDone(id);
  }
}

export function clearDone() {
  doneStore.set([]);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DONE_KEY);
  }
}

/** Per-section exam results (localStorage key ict-exam). */
export const examStore = atom<Record<string, ExamState>>(
  readJson<Record<string, ExamState>>(EXAM_KEY, {})
);

export function saveExamResult(sectionId: string, patch: Partial<ExamState>) {
  const prev = examStore.get()[sectionId] ?? {
    best: null,
    last: null,
    picks: {},
    submitted: false,
    taken: 0,
  };
  const next: ExamState = { ...prev, ...patch };
  const all = { ...examStore.get(), [sectionId]: next };
  examStore.set(all);
  writeJson(EXAM_KEY, all);
}

export function clearExams() {
  examStore.set({});
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(EXAM_KEY);
  }
}
