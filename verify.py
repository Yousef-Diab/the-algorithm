#!/usr/bin/env python3
"""Headless verification for The Algorithm.

Rebuilds `index.html` from source (runs build.py), then loads it in a headless
Chromium and checks the whole course actually works:

  * every lesson in content/ is present in the page,
  * every <img> resolves (no broken charts),
  * every quiz renders 4 options, shuffles, and grades on click,
  * every quiz exposes a working reset control,
  * the lightbox opens, browses the lesson's charts, zooms, and closes correctly,
  * each section's summary + final exam pages render, and the exam grades on submit,
  * a video link renders for each lesson that has a non-empty video.txt,
  * zero console/page JS errors.

Exit 0 on success, non-zero (with a list of problems) on any failure — so it
works both locally (`python verify.py`) and in CI.

Requires: pip install playwright && python -m playwright install chromium
"""
import subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent


def main() -> int:
    # 1. Rebuild so we always verify the current source, never a stale artifact.
    if subprocess.run([sys.executable, str(ROOT / "build.py")]).returncode != 0:
        print("verify: build.py failed", file=sys.stderr)
        return 1

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("verify: playwright not installed — "
              "pip install playwright && python -m playwright install chromium",
              file=sys.stderr)
        return 2

    # Expected counts, derived from content/ (never hard-coded).
    lesson_files = list((ROOT / "content").glob("*/*/*/lesson.html"))
    expected_lessons = len(lesson_files)
    expected_videos = sum(
        1 for lh in lesson_files
        if (v := lh.parent / "video.txt").exists() and v.read_text(encoding="utf-8").strip()
    )
    expected_summaries = len(list((ROOT / "content").glob("*/summary.html")))
    expected_exams = len(list((ROOT / "content").glob("*/exam.js")))

    url = (ROOT / "index.html").resolve().as_uri()
    problems: list[str] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_context(viewport={"width": 1400, "height": 900}).new_page()
        errs: list[str] = []
        page.on("pageerror", lambda e: errs.append(f"pageerror: {e}"))
        page.on("console", lambda m: errs.append(f"console.error: {m.text}")
                if m.type == "error" else None)
        page.goto(url, wait_until="networkidle")

        # Force every lesson visible + every chart image eager so lazy charts load.
        # Scope to `.fig img` — the injected chart images; ignore the lightbox <img>.
        page.evaluate(
            "() => { document.querySelectorAll('.lesson').forEach(s => s.classList.add('visible'));"
            "document.querySelectorAll('.fig img').forEach(i => { i.loading = 'eager'; i.src = i.src; }); }"
        )
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(400)

        page.on("dialog", lambda d: d.accept())

        def probe(expr, label, fallback):
            """Run a DOM check that must never mask a page error with a traceback.

            When app.js has died (e.g. a data block failed to parse) the widgets
            it renders don't exist, so these probes hit nulls. Report that as a
            problem — the real cause shows up in the JS-error list below."""
            try:
                return page.evaluate(expr)
            except Exception as exc:  # noqa: BLE001 - any page failure is a finding
                problems.append(f"{label} check could not run: {str(exc).splitlines()[0]}")
                return fallback

        # Review/exam pages are .lesson sections too — they carry data-kind and
        # must not be counted as lessons.
        ids = page.eval_on_selector_all(
            "section.lesson",
            "els => els.filter(e => e.id !== 'home' && !e.dataset.kind).map(e => e.id)")
        if len(ids) != expected_lessons:
            problems.append(f"lessons: page has {len(ids)}, content/ has {expected_lessons}")

        summaries = page.eval_on_selector_all('section.lesson[data-kind="review"]', "e => e.length")
        if summaries != expected_summaries:
            problems.append(f"summary pages: page has {summaries}, content/ has {expected_summaries}")
        exam_pages = page.eval_on_selector_all('section.lesson[data-kind="exam"]', "e => e.length")
        if exam_pages != expected_exams:
            problems.append(f"exam pages: page has {exam_pages}, content/ has {expected_exams}")

        imgs = page.eval_on_selector_all(
            ".fig img", "els => els.map(i => ({s: i.getAttribute('src'), nw: i.naturalWidth, c: i.complete}))")
        broken = [i["s"] for i in imgs if i["s"] and i["c"] and i["nw"] == 0]
        if broken:
            problems.append(f"{len(broken)} broken image(s): {broken[:5]}")

        videos = page.eval_on_selector_all(".lesson-video", "els => els.length")
        if videos != expected_videos:
            problems.append(f"video links: page has {videos}, content/ has {expected_videos}")

        quiz = probe(
            """() => { let qs = 0, bad = 0;
                 document.querySelectorAll('.quiz .q').forEach(q => {
                   const opts = [...q.querySelectorAll('.opt')]; qs++;
                   if (opts.length !== 4) { bad++; return; }
                   opts[0].click();
                   if (q.querySelectorAll('.opt.correct').length !== 1) bad++;
                 });
                 return { qs, bad }; }""",
            "quiz", {"qs": 0, "bad": 0}
        )
        if quiz["qs"] == 0:
            problems.append("no quiz questions rendered")
        if quiz["bad"]:
            problems.append(f"{quiz['bad']} quiz question(s) failed (not 4 options, or grading broke)")

        # Every quiz must offer a reset that actually clears the graded state.
        resets = probe(
            """() => { const qs = [...document.querySelectorAll('.quiz')];
                 const btns = qs.map(q => q.querySelector('.quiz-head .mini-btn'));
                 if (!qs.length || btns.some(b => !b)) return {missing: true};
                 btns[0].click();
                 const q = qs[0].querySelector('.q');
                 if (!q) return {missing: true};
                 return {missing: false, quizzes: qs.length,
                         cleared: q.querySelectorAll('.opt.correct, .opt.wrong').length === 0,
                         enabled: [...q.querySelectorAll('.opt')].every(o => !o.disabled)}; }""",
            "quiz reset", {"missing": True}
        )
        if resets.get("missing"):
            problems.append("at least one quiz has no reset button")
        elif not (resets["cleared"] and resets["enabled"]):
            problems.append("quiz reset did not clear the graded state")

        # Lightbox: opens on a chart, browses that lesson's set, zooms, and
        # closes on an outside click but NOT on a click on the image itself.
        # Uses REAL mouse input, not el.click() — while zoomed the stage holds a
        # pointer capture that retargets the click, and only real input sees it.
        def lb_state(what):
            return page.evaluate(
                """() => { const lb = document.getElementById('lightbox'),
                             big = lb.querySelector('img'),
                             t = k => (lb.querySelector(k) || {}).textContent || '';
                       return {open: lb.classList.contains('open'), src: big.src,
                               w: big.clientWidth, count: t('.lb-count'), zoom: t('.lb-zoom'),
                               lock: document.body.classList.contains('lb-lock')}; }""")
        try:
            first = page.query_selector(".lesson .fig img")
            if first is None:
                raise RuntimeError("no chart images to open")
            first.click(timeout=5000)
            page.wait_for_timeout(250)
            st = lb_state("open")
            if not st["open"]:
                problems.append("lightbox did not open on a chart click")
            if not st["lock"]:
                problems.append("lightbox did not lock background scrolling")
            total = st["count"].split("/")[-1].strip()
            if not total.isdigit() or int(total) < 2:
                problems.append(f"lightbox group looks wrong (counter {st['count']!r})")

            page.click('[data-lb="next"]', timeout=5000); page.wait_for_timeout(300)
            if lb_state("next")["src"] == st["src"]:
                problems.append("lightbox next did not change the image")
            page.click('[data-lb="prev"]', timeout=5000); page.wait_for_timeout(300)

            w0 = lb_state("fit")["w"]
            page.click('[data-lb="in"]', timeout=5000); page.wait_for_timeout(250)
            zs = lb_state("zoomed")
            if not (zs["w"] > w0 and zs["zoom"] == "125%"):
                problems.append(f"lightbox zoom-in failed ({w0} -> {zs['w']}, {zs['zoom']})")
            # A plain click on the image while zoomed must NOT close it.
            box = page.eval_on_selector(
                "#lightbox img",
                "e => { const r = e.getBoundingClientRect();"
                "return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }")
            page.mouse.click(box["x"], box["y"]); page.wait_for_timeout(250)
            if not lb_state("after image click")["open"]:
                problems.append("lightbox closed when the image itself was clicked")
            page.click('[data-lb="reset"]', timeout=5000); page.wait_for_timeout(250)
            if lb_state("refit")["w"] != w0:
                problems.append("lightbox fit did not restore the original size")

            page.mouse.click(5, 5); page.wait_for_timeout(250)
            end = lb_state("closed")
            if end["open"]:
                problems.append("lightbox did not close on an outside click")
            if end["lock"]:
                problems.append("lightbox left the body scroll lock on after closing")
        except Exception as exc:  # noqa: BLE001 - any page failure is a finding
            problems.append(f"lightbox check could not run: {str(exc).splitlines()[0]}")
            page.evaluate("() => { document.getElementById('lightbox')"
                          ".classList.remove('open');"
                          "document.body.classList.remove('lb-lock'); }")

        # Answer a whole exam, submit, and confirm it grades to a real score.
        exam = probe(
            """() => { const out = [];
                 document.querySelectorAll('.exam').forEach(ex => {
                   const qs = [...ex.querySelectorAll('.q.eq')];
                   const bad = qs.filter(q => q.querySelectorAll('.opt').length !== 4).length;
                   qs.forEach(q => { const o = q.querySelector('.opt'); if (o) o.click(); });
                   const submit = ex.querySelector('.exam-actions .btn.primary');
                   if (submit) submit.click();
                   const score = ex.querySelector('.exam-score');
                   out.push({qs: qs.length, bad, submit: !!submit,
                             score: score ? score.textContent.trim() : null,
                             retake: !!ex.querySelector('.exam-actions .btn:not([style*="none"])')});
                 });
                 return out; }""",
            "exam", []
        )
        if len(exam) != expected_exams:
            problems.append(f"exams rendered: {len(exam)}, content/ has {expected_exams}")
        for i, e in enumerate(exam):
            if e["qs"] == 0:
                problems.append(f"exam {i}: no questions rendered")
            if e["bad"]:
                problems.append(f"exam {i}: {e['bad']} question(s) without 4 options")
            if not e["submit"]:
                problems.append(f"exam {i}: no submit button rendered")
            if not (e["score"] or "").endswith("%"):
                problems.append(f"exam {i}: submit did not produce a score (got {e['score']!r})")
            if not e["retake"]:
                problems.append(f"exam {i}: no retake control after submitting")

        if errs:
            problems.append(f"{len(errs)} JS error(s): {errs[:5]}")

        browser.close()

    if problems:
        print("VERIFY FAILED:", file=sys.stderr)
        for pr in problems:
            print(f"  - {pr}", file=sys.stderr)
        return 1

    imgs_ok = len([i for i in imgs if i["s"]])
    print(f"verify OK: {len(ids)} lessons, {imgs_ok} images, "
          f"{videos} video links, {quiz['qs']} quiz questions, "
          f"{summaries} summary page(s), {sum(e['qs'] for e in exam)} exam questions "
          f"across {len(exam)} exam(s), 0 JS errors")
    return 0


if __name__ == "__main__":
    sys.exit(main())
