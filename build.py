#!/usr/bin/env python3
"""Assemble the self-contained index.html from engine/ + content/.

Run this after editing any lesson/quiz/video/month. Output is a single
offline file (index.html) identical in behaviour to the hand-authored original.

Content model (one predictable edit point per change):
  content/<section>/months.js            -> the MONTHS entries for that section
  content/<section>/<month>/<id>/lesson.html   -> the <section> markup (verbatim)
  content/<section>/<month>/<id>/quiz.js       -> that lesson's quiz array literal
  content/<section>/<month>/<id>/video.txt     -> the source video URL (or empty)

IMG_COUNTS is DERIVED here by counting images/<slug>-NN.png, so there is no
manual image-count table to keep in sync.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
ENGINE = ROOT / "engine"
CONTENT = ROOT / "content"
IMAGES = ROOT / "images"
OUT = ROOT / "index.html"

def read(p):
    return p.read_text(encoding="utf-8")

# --- validation: fail fast with clear messages on common authoring slips ---
_id_re = re.compile(r'id="([^"]+)"')
_quiz_re = re.compile(r'data-quiz="([^"]+)"')
_dataslug_re = re.compile(r'data-slug="([^"]+)"')

def validate(all_lessons):
    """Collect every problem, then abort if any are errors. Warnings don't abort."""
    errors, warnings, seen_ids = [], [], {}
    for _s, ldir in all_lessons:
        lid = ldir.name
        rel = ldir.relative_to(ROOT)
        lh = ldir / "lesson.html"
        if not lh.exists():
            errors.append(f"{rel}: missing lesson.html"); continue
        html = read(lh)
        m = _id_re.search(html)
        if not m:
            errors.append(f'{rel}/lesson.html: no id="…" on the <section>')
        elif m.group(1) != lid:
            errors.append(f'{rel}: folder id "{lid}" != lesson.html id="{m.group(1)}"')
        q = _quiz_re.search(html)
        if q and q.group(1) != lid:
            errors.append(f'{rel}: data-quiz="{q.group(1)}" should equal the lesson id "{lid}"')
        if lid in seen_ids:
            errors.append(f'duplicate lesson id "{lid}" ({rel} and {seen_ids[lid]})')
        seen_ids[lid] = rel
        if not (ldir / "quiz.js").exists():
            warnings.append(f"{rel}: no quiz.js (lesson will render without a quiz)")
        for slug in _dataslug_re.findall(html):
            if not list(IMAGES.glob(f"{slug}-*.png")):
                warnings.append(f'{rel}: data-slug="{slug}" has no images/{slug}-NN.png (no charts render)')
    for w in warnings:
        print(f"  warning: {w}")
    if errors:
        print("\nBUILD ABORTED - fix these:", file=sys.stderr)
        for e in errors:
            print(f"  error: {e}", file=sys.stderr)
        sys.exit(1)

# --- sections in order (s1-ict-core, then s2-..., ...) --------------------
sections = sorted(d for d in CONTENT.iterdir() if d.is_dir())

# --- lessons, in month/lesson order --------------------------------------
def lessons_for(section):
    months = sorted(d for d in section.iterdir() if d.is_dir())
    out = []
    for mdir in months:
        for ldir in sorted(d for d in mdir.iterdir() if d.is_dir()):
            out.append(ldir)
    return out

all_lessons = [(s, l) for s in sections for l in lessons_for(s)]

validate(all_lessons)

# --- assemble body --------------------------------------------------------
parts = [read(ENGINE / "head.html"),
         read(ENGINE / "shell-top.html"),
         read(ENGINE / "home.html")]
lesson_html_all = read(ENGINE / "home.html")
for _s, ldir in all_lessons:
    html = read(ldir / "lesson.html").rstrip("\n")
    parts.append("\n" + html + "\n")
    lesson_html_all += html
parts.append(read(ENGINE / "shell-bottom.html"))

# --- MONTHS block ---------------------------------------------------------
months_entries = "\n".join(read(s / "months.js").rstrip("\n") for s in sections)
parts.append(
    "<script>\n"
    "/* ---------- course meta ---------- */\n"
    "const MONTHS = [\n" + months_entries + "\n];\n"
    "/* filled after lessons defined */\n"
    "</script>\n"
)

# --- IMG_COUNTS (derived by globbing images/<slug>-NN.png) ----------------
slug_re = re.compile(r'data-slug="([^"]+)"')
seen = []
for slug in slug_re.findall(lesson_html_all):
    if slug not in seen:
        seen.append(slug)
img_lines = []
for slug in seen:
    n = len(list(IMAGES.glob(f"{slug}-*.png")))
    if n:
        img_lines.append(f'  "{slug}":{n},')
img_block = "\n".join(img_lines).rstrip(",")

# --- QUIZZES block --------------------------------------------------------
quiz_lines = []
for _s, ldir in all_lessons:
    lid = ldir.name
    qf = ldir / "quiz.js"
    if qf.exists():
        quiz_lines.append(f' "{lid}":' + read(qf).rstrip("\n") + ",")
quiz_block = "\n".join(quiz_lines).rstrip(",")

# --- VIDEOS block ---------------------------------------------------------
vid_lines = []
for _s, ldir in all_lessons:
    lid = ldir.name
    vf = ldir / "video.txt"
    url = read(vf).strip() if vf.exists() else ""
    vid_lines.append(f' "{lid}":"{url}",')
vid_block = "\n".join(vid_lines).rstrip(",")

# --- data + app.js script block ------------------------------------------
parts.append(
    "<script>\n"
    "/* ---------- image manifest (slug -> count of images/{slug}-NN.png) — DERIVED by build.py ---------- */\n"
    "const IMG_COUNTS = {\n" + img_block + "\n};\n\n"
    "/* ---------- quiz bank (every question derived from the notes) ---------- */\n"
    "const QUIZZES = {\n" + quiz_block + "\n};\n\n"
    "/* ---------- video links (lesson id -> source video) ---------- */\n"
    "const VIDEOS = {\n" + vid_block + "\n};\n\n"
    + read(ENGINE / "app.js").rstrip("\n") + "\n"
    "</script>\n"
)

parts.append("</body>\n</html>\n")

OUT.write_text("".join(parts), encoding="utf-8", newline="\n")
print(f"built index.html: {len(all_lessons)} lessons, "
      f"{len(img_lines)} image sets, {len(quiz_lines)} quizzes")
