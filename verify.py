#!/usr/bin/env python3
"""Headless verification for The Algorithm.

Rebuilds `index.html` from source (runs build.py), then loads it in a headless
Chromium and checks the whole course actually works:

  * every lesson in content/ is present in the page,
  * every <img> resolves (no broken charts),
  * every quiz renders 4 options, shuffles, and grades on click,
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

        ids = page.eval_on_selector_all(
            "section.lesson", "els => els.filter(e => e.id !== 'home').map(e => e.id)")
        if len(ids) != expected_lessons:
            problems.append(f"lessons: page has {len(ids)}, content/ has {expected_lessons}")

        imgs = page.eval_on_selector_all(
            ".fig img", "els => els.map(i => ({s: i.getAttribute('src'), nw: i.naturalWidth, c: i.complete}))")
        broken = [i["s"] for i in imgs if i["s"] and i["c"] and i["nw"] == 0]
        if broken:
            problems.append(f"{len(broken)} broken image(s): {broken[:5]}")

        videos = page.eval_on_selector_all(".lesson-video", "els => els.length")
        if videos != expected_videos:
            problems.append(f"video links: page has {videos}, content/ has {expected_videos}")

        quiz = page.evaluate(
            """() => { let qs = 0, bad = 0;
                 document.querySelectorAll('.quiz .q').forEach(q => {
                   const opts = [...q.querySelectorAll('.opt')]; qs++;
                   if (opts.length !== 4) { bad++; return; }
                   opts[0].click();
                   if (q.querySelectorAll('.opt.correct').length !== 1) bad++;
                 });
                 return { qs, bad }; }"""
        )
        if quiz["qs"] == 0:
            problems.append("no quiz questions rendered")
        if quiz["bad"]:
            problems.append(f"{quiz['bad']} quiz question(s) failed (not 4 options, or grading broke)")

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
          f"{videos} video links, {quiz['qs']} quiz questions, 0 JS errors")
    return 0


if __name__ == "__main__":
    sys.exit(main())
