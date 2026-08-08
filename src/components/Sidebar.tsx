import { useStore } from "@nanostores/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { u } from "../lib/course";
import { doneStore, examStore } from "../stores/progress";

export interface NavLesson {
  id: string;
  title: string;
}
export interface NavMonth {
  head: string;
  id: string;
  lessons: NavLesson[];
}
export interface NavSection {
  examHref: string | null;
  id: string;
  months: NavMonth[];
  reviewHref: string | null;
  short: string;
  title: string;
}

interface Props {
  activeId: string | null;
  nav: NavSection[];
  totalLessons: number;
}

const COLLAPSED_KEY = "ict-sidebar-collapsed";
const MONTH_ID_RE = /^([mp]\d{1,2})-\d{2}$/;
const DESKTOP_QUERY = "(min-width: 901px)";

/** Desktop = above the 900px mobile breakpoint. */
const isDesktop = () =>
  typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches;

/** Reactive matchMedia subscription (updates on viewport changes). */
function subscribeDesktop(onChange: () => void): () => void {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getDesktop = (): boolean => window.matchMedia(DESKTOP_QUERY).matches;
const getDesktopServer = (): boolean => false;

/** Lesson id "m1-03" -> month "m1" (also "p2-01" -> "p2"); null otherwise. */
function monthOf(id: string | null): string | null {
  if (!id) {
    return null;
  }
  const m = MONTH_ID_RE.exec(id);
  return m ? m[1] : null;
}

/** Review-group state key for a section id ("s1" -> "rv-s1"). */
const reviewKey = (sectionId: string) => `rv-${sectionId}`;

/** Whether every lesson of a month is done. */
function monthComplete(m: NavMonth, done: string[]): boolean {
  return m.lessons.every((l) => done.includes(l.id));
}

/** How many lessons of a month are done. */
function countDone(m: NavMonth, done: string[]): number {
  return m.lessons.filter((l) => done.includes(l.id)).length;
}

/** Per-month completion map for all sections. */
function computeStatus(
  nav: NavSection[],
  done: string[]
): Map<string, boolean> {
  const status = new Map<string, boolean>();
  for (const s of nav) {
    for (const m of s.months) {
      status.set(m.id, monthComplete(m, done));
    }
  }
  return status;
}

/** What to auto-open after `fromIndex` in a section: next incomplete month,
 * or the review group when the section ends there; null when nothing follows. */
function nextOpenTarget(
  s: NavSection,
  fromIndex: number,
  status: Map<string, boolean>
): string | null {
  const nextIncomplete = s.months
    .slice(fromIndex + 1)
    .find((mm) => !status.get(mm.id));
  if (nextIncomplete) {
    return nextIncomplete.id;
  }
  if (s.reviewHref || s.examHref) {
    return reviewKey(s.id);
  }
  return null;
}

export default function Sidebar({ nav, activeId, totalLessons }: Props) {
  const doneRaw = useStore(doneStore);
  const examsRaw = useStore(examStore);
  // Reactive desktop flag: re-renders when the viewport crosses the 900px
  // breakpoint, so aria-expanded and the collapsed class stay in sync.
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktop,
    getDesktopServer
  );
  // Hydrate flag: until the first client effect runs, render the same empty
  // progress the server rendered (avoids React 418 text mismatches).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const done = hydrated ? doneRaw : [];
  const exams = hydrated ? examsRaw : {};
  // Mobile drawer state.
  const [open, setOpen] = useState(false);
  // Desktop full collapse; persisted so it survives island remounts on every
  // navigation. The server renders expanded (no window on SSR).
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined" || !isDesktop()) {
      return false;
    }
    try {
      return window.localStorage.getItem(COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  // Menu toggle button (#menu-toggle) lives in the topbar: on mobile it slides
  // the drawer in/out, on desktop it collapses/expands the whole sidebar.
  useEffect(() => {
    const onClick = (e: Event) => {
      if ((e.target as HTMLElement).closest("[data-menu-toggle]")) {
        if (isDesktop()) {
          setCollapsed((c) => !c);
        } else {
          setOpen((o) => !o);
        }
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Persist the desktop collapsed state.
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    try {
      if (collapsed) {
        window.localStorage.setItem(COLLAPSED_KEY, "1");
      } else {
        window.localStorage.removeItem(COLLAPSED_KEY);
      }
    } catch {
      /* storage unavailable — ignore */
    }
  }, [collapsed, hydrated]);

  // The drawer only exists below the 900px breakpoint: clear a leftover open
  // drawer when the viewport grows, so it never lingers on desktop.
  useEffect(() => {
    if (desktop && open) {
      setOpen(false);
    }
  }, [desktop, open]);

  // Mirror the sidebar state on the topbar button and lock body scroll for the
  // mobile drawer only. On desktop only the collapsed flag counts; `open` is
  // drawer-only state and must not inflate aria-expanded.
  const menuExpanded = desktop ? !collapsed : open;
  useEffect(() => {
    const btn = document.querySelector("[data-menu-toggle]");
    if (btn) {
      btn.setAttribute("aria-expanded", String(menuExpanded));
    }
    document.body.style.overflow = open ? "hidden" : "";
  }, [menuExpanded, open]);

  // Close the mobile drawer when tapping outside of it (the toggle button and
  // the drawer itself keep their own handlers).
  const asideRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) {
      return;
    }
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (asideRef.current?.contains(target)) {
        return;
      }
      const toggle = document.querySelector("[data-menu-toggle]");
      if (toggle?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  // ---- collapsible month groups -------------------------------------------
  // Default on every mount: only the month containing the active lesson opens
  // (plus the review group on review/exam pages); everything else — including
  // fully completed months — starts closed. Manual toggles last until the next
  // navigation, because the island remounts per page.
  const activeMonth = monthOf(activeId);
  const activeReview =
    activeId?.endsWith("-review") || activeId?.endsWith("-exam")
      ? reviewKey(activeId.slice(0, 2))
      : null;
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (activeMonth) {
      s.add(activeMonth);
    }
    if (activeReview) {
      s.add(activeReview);
    }
    return s;
  });

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Auto-collapse: when an OPEN month becomes 100% complete, collapse it and
  // open the next incomplete month in the section (or the review group when
  // the section ends there). Only fires on a real incomplete -> complete
  // transition, never on mount (the empty `prevStatus` marks the first run).
  const prevStatus = useRef<Map<string, boolean>>(new Map());
  useEffect(() => {
    const status = computeStatus(nav, done);
    const prev = prevStatus.current;
    prevStatus.current = status;
    if (prev.size === 0) {
      return;
    }
    const next = new Set(openGroups);
    let nextHead: string | null = null;
    for (const s of nav) {
      for (let i = 0; i < s.months.length; i += 1) {
        const m = s.months[i];
        if (!next.has(m.id) || prev.get(m.id) || !status.get(m.id)) {
          continue;
        }
        next.delete(m.id);
        const target = nextOpenTarget(s, i, status);
        if (target) {
          nextHead = target;
          next.add(target);
        }
      }
    }
    if (nextHead) {
      setOpenGroups(next);
      requestAnimationFrame(() => {
        document
          .querySelector(`[data-nav-head="${nextHead}"]`)
          ?.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    }
  }, [done, nav, openGroups]);

  const pct =
    totalLessons > 0 ? Math.round((done.length / totalLessons) * 100) : 0;

  const asideClass = [
    open && !desktop ? "open" : "",
    collapsed && desktop ? "collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <aside
        aria-label="Course navigation"
        className={asideClass}
        id="sidebar"
        ref={asideRef}
      >
        <div className="brand">
          <h1>
            The <span>Algorithm</span>
          </h1>
          <div className="sub">ICT mentorship course</div>
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="progress-label">
              {done.length} / {totalLessons} lessons complete
            </div>
          </div>
        </div>

        {nav.length > 1 &&
          nav.map((s) => (
            <div className="nav-section" key={`ns-${s.id}`}>
              {s.short || s.title}
            </div>
          ))}

        {nav.map((s) => {
          const rvKey = reviewKey(s.id);
          const rvOpen = openGroups.has(rvKey);
          return (
            <div key={s.id}>
              {s.months.map((m) => {
                const doneCt = countDone(m, done);
                const isOpen = openGroups.has(m.id);
                return (
                  <div key={m.id}>
                    <button
                      aria-expanded={isOpen}
                      className={`month-head${isOpen ? " open" : ""}`}
                      data-nav-head={m.id}
                      onClick={() => toggleGroup(m.id)}
                      type="button"
                    >
                      <span className="mt">{m.head}</span>
                      <span className="count">
                        {doneCt}/{m.lessons.length}
                      </span>
                      <span aria-hidden="true" className="chev">
                        ▾
                      </span>
                    </button>
                    <div className={`month-group${isOpen ? " open" : ""}`}>
                      <div className="month-group-inner">
                        {m.lessons.map((l, i) => (
                          <a
                            className={`nav-lesson${
                              done.includes(l.id) ? " done" : ""
                            }${activeId === l.id ? " active" : ""}`}
                            href={u(`course/${s.id}/${m.id}/${l.id}`)}
                            key={l.id}
                            onClick={() => setOpen(false)}
                          >
                            <span aria-hidden="true" className="dot">
                              ✓
                            </span>
                            <span className="n">{i + 1}</span>
                            <span>{l.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {(s.reviewHref || s.examHref) && (
                <div className="review-group">
                  <button
                    aria-expanded={rvOpen}
                    className={`month-head${rvOpen ? " open" : ""}`}
                    data-nav-head={rvKey}
                    onClick={() => toggleGroup(rvKey)}
                    type="button"
                  >
                    <span className="mt">{s.short || s.title} · Review</span>
                    {s.examHref &&
                      (() => {
                        const st = exams[s.id];
                        return (
                          <span className="count">
                            {st && st.taken > 0 ? `Best ${st.best}%` : ""}
                          </span>
                        );
                      })()}
                    <span aria-hidden="true" className="chev">
                      ▾
                    </span>
                  </button>
                  <div className={`month-group${rvOpen ? " open" : ""}`}>
                    <div className="month-group-inner">
                      {s.reviewHref && (
                        <a
                          className={`nav-lesson${
                            activeId === `${s.id}-review` ? " active" : ""
                          }`}
                          href={s.reviewHref}
                          onClick={() => setOpen(false)}
                        >
                          <span aria-hidden="true" className="dot rdot">
                            ◆
                          </span>
                          <span>Section Summary</span>
                        </a>
                      )}
                      {s.examHref && (
                        <a
                          className={`nav-lesson${
                            activeId === `${s.id}-exam` ? " active" : ""
                          }`}
                          href={s.examHref}
                          onClick={() => setOpen(false)}
                        >
                          <span aria-hidden="true" className="dot rdot">
                            ◆
                          </span>
                          <span>Final Exam</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </aside>
      {/* Mobile-only scrim: dims and blurs the content behind the open drawer
          so the topbar and the sidebar keep their normal colors. Rendered as
          a sibling so the drawer's translateX transform can't become its
          containing block. */}
      <div
        aria-hidden="true"
        className={`drawer-scrim${open && !desktop ? " open" : ""}`}
        onClick={() => setOpen(false)}
      />
    </>
  );
}
