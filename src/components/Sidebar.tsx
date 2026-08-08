import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
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

export default function Sidebar({ nav, activeId, totalLessons }: Props) {
  const doneRaw = useStore(doneStore);
  const examsRaw = useStore(examStore);
  // Hydrate flag: until the first client effect runs, render the same empty
  // progress the server rendered (avoids React 418 text mismatches).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const done = hydrated ? doneRaw : [];
  const exams = hydrated ? examsRaw : {};
  const [open, setOpen] = useState(false);

  // Menu toggle button (#menu-toggle) lives in the topbar.
  useEffect(() => {
    const onClick = (e: Event) => {
      if ((e.target as HTMLElement).closest("[data-menu-toggle]")) {
        setOpen((o) => !o);
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

  useEffect(() => {
    const btn = document.querySelector("[data-menu-toggle]");
    if (btn) {
      btn.setAttribute("aria-expanded", String(open));
    }
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const pct =
    totalLessons > 0 ? Math.round((done.length / totalLessons) * 100) : 0;

  return (
    <aside
      aria-label="Course navigation"
      className={open ? "open" : ""}
      id="sidebar"
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

      {nav.map((s) => (
        <div key={s.id}>
          {s.months.map((m) => {
            const doneCt = m.lessons.filter((l) => done.includes(l.id)).length;
            return (
              <div key={m.id}>
                <div className="month-head">
                  <h2>{m.head}</h2>
                  <span className="count">
                    {doneCt}/{m.lessons.length}
                  </span>
                </div>
                {m.lessons.map((l, i) => (
                  <a
                    className={`nav-lesson${done.includes(l.id) ? " done" : ""}${
                      activeId === l.id ? " active" : ""
                    }`}
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
            );
          })}

          {(s.reviewHref || s.examHref) && (
            <div className="review-group">
              <div className="month-head">
                <h2>{s.short || s.title} · Review</h2>
                {s.examHref &&
                  (() => {
                    const st = exams[s.id];
                    return (
                      <span className="count">
                        {st && st.taken > 0 ? `Best ${st.best}%` : ""}
                      </span>
                    );
                  })()}
              </div>
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
          )}
        </div>
      ))}
    </aside>
  );
}
