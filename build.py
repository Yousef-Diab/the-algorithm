#!/usr/bin/env python3
"""Assemble the self-contained index.html from engine/ + content/.

Run this after editing any lesson/quiz/video/month. Output is a single
offline file (index.html) identical in behaviour to the hand-authored original.

Content model (one predictable edit point per change):
  content/<section>/section.js           -> that section's meta {id,title,short,desc}
  content/<section>/months.js            -> the MONTHS entries for that section
  content/<section>/summary.html         -> the section's revision summary page
  content/<section>/exam.js              -> the section's final-exam array literal
  content/<section>/<month>/<id>/lesson.html   -> the <section> markup (verbatim)
  content/<section>/<month>/<id>/quiz.js       -> that lesson's quiz array literal
  content/<section>/<month>/<id>/video.txt     -> the source video URL (or empty)

IMG_COUNTS is DERIVED here by counting images/<slug>-NN.png, so there is no
manual image-count table to keep in sync. The final-exam PAGE is generated here
too (from section.js) — only its questions live in exam.js.
"""
import json, re, sys, pathlib

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
_meta_re = re.compile(r'(\w+)\s*:\s*"([^"]*)"')
_obj_re = re.compile(r"\{[^{}]*\}")

def parse_objs(text):
    """Every {...} of string fields in a meta file, as dicts.

    Deliberately tolerant: JS formatters treat a bare `{…}` in a .js file as a
    BLOCK statement and will happily insert a `;` inside it (or a `;` after a
    top-level array). Pulling the key:"value" pairs out and re-emitting the JS
    from Python means such a reformat can never produce a broken index.html.
    """
    return [dict(_meta_re.findall(m.group(0))) for m in _obj_re.finditer(text)]

def js_literal(text):
    """A quiz/exam array literal, with any formatter-added trailing `;` removed.

    One combined strip set, so `];\\n;` collapses too — rstrip(";") alone stops
    at the newline and leaves a semicolon behind.
    """
    return text.strip().rstrip("; \t\r\n")

def section_meta(sdir):
    """(id, title, fields) for a section. fields is None when there's no section.js."""
    f = sdir / "section.js"
    if not f.exists():
        return sdir.name, sdir.name, None
    objs = parse_objs(read(f))
    fields = objs[0] if objs else {}
    return fields.get("id", sdir.name), fields.get("title", sdir.name), fields

def validate_sections(sections):
    """Section-level files are optional, but if present they must line up."""
    errors, seen = [], {}
    for sdir in sections:
        sid, _title, fields = section_meta(sdir)
        rel = sdir.relative_to(ROOT)
        if (sdir / "summary.html").exists() or (sdir / "exam.js").exists():
            if fields is None:
                errors.append(f"{rel}: has summary.html/exam.js but no section.js to name the section")
                continue
        if fields is None:
            continue
        if not fields.get("id"):
            errors.append(f'{rel}/section.js: no id:"…" field found')
        if not parse_objs(read(sdir / "months.js")):
            errors.append(f"{rel}/months.js: no month entries found")
        if sid in seen:
            errors.append(f'duplicate section id "{sid}" ({rel} and {seen[sid]})')
        seen[sid] = rel
        summ = sdir / "summary.html"
        if summ.exists():
            html = read(summ)
            m = _id_re.search(html)
            want = f"{sid}-review"
            if not m:
                errors.append(f'{rel}/summary.html: no id="…" on the <section>')
            elif m.group(1) != want:
                errors.append(f'{rel}/summary.html: id="{m.group(1)}" should be "{want}"')
            if 'data-kind="review"' not in html:
                errors.append(f'{rel}/summary.html: missing data-kind="review" on the <section>')
            if '<div class="review-footer">' not in html:
                errors.append(f'{rel}/summary.html: missing the <div class="review-footer"></div> slot')
    return errors

def validate(all_lessons, extra_errors=()):
    """Collect every problem, then abort if any are errors. Warnings don't abort."""
    errors, warnings, seen_ids = list(extra_errors), [], {}
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

validate(all_lessons, validate_sections(sections))

def exam_page(sid, title, n):
    """The final-exam PAGE is generated — only its questions are authored (exam.js)."""
    return (
        f'<section class="lesson" id="{sid}-exam" data-kind="exam" data-section="{sid}"'
        f' data-title="Final Exam">\n'
        f'  <div class="lesson-hero">\n'
        f'    <div class="crumb">{title} · Section Review</div>\n'
        f'    <h2>Final Exam</h2>\n'
        f'    <div class="desc">{n} questions drawn from every lesson in this section. '
        f'Nothing is graded until you submit — and you can retake it as many times as you like.</div>\n'
        f'  </div>\n'
        f'  <div class="exam" data-exam="{sid}"></div>\n'
        f'  <div class="review-footer"></div>\n'
        f'</section>'
    )

# --- assemble body --------------------------------------------------------
parts = [read(ENGINE / "head.html"),
         read(ENGINE / "shell-top.html"),
         read(ENGINE / "home.html")]
lesson_html_all = read(ENGINE / "home.html")
section_lines, exam_lines, review_pages = [], [], 0
for sdir in sections:
    sid, stitle, fields = section_meta(sdir)
    for ldir in lessons_for(sdir):
        html = read(ldir / "lesson.html").rstrip("\n")
        parts.append("\n" + html + "\n")
        lesson_html_all += html

    review_id = None
    summ = sdir / "summary.html"
    if summ.exists():
        html = read(summ).rstrip("\n")
        parts.append("\n" + html + "\n")
        lesson_html_all += html
        review_id = f"{sid}-review"
        review_pages += 1

    exam_id = None
    examf = sdir / "exam.js"
    if examf.exists():
        questions = js_literal(read(examf))
        exam_lines.append(f' "{sid}":' + questions + ",")
        n_q = len(re.findall(r"\{\s*q\s*:", questions))
        parts.append("\n" + exam_page(sid, stitle, n_q) + "\n")
        exam_id = f"{sid}-exam"
        review_pages += 1

    meta = dict(fields or {"id": sid, "title": stitle})
    meta.update(id=sid,
                months=[d.name for d in sorted(d for d in sdir.iterdir() if d.is_dir())],
                review=review_id, exam=exam_id)
    section_lines.append("  " + json.dumps(meta, ensure_ascii=False) + ",")

parts.append(read(ENGINE / "shell-bottom.html"))

# --- MONTHS + SECTIONS block ----------------------------------------------
months_entries = "\n".join(
    "  " + json.dumps(m, ensure_ascii=False) + ","
    for s in sections for m in parse_objs(read(s / "months.js"))).rstrip(",")
parts.append(
    "<script>\n"
    "/* ---------- course meta ---------- */\n"
    "const MONTHS = [\n" + months_entries + "\n];\n"
    "/* ---------- sections (months/review/exam are DERIVED by build.py) ---------- */\n"
    "const SECTIONS = [\n" + "\n".join(section_lines) + "\n];\n"
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
        quiz_lines.append(f' "{lid}":' + js_literal(read(qf)) + ",")
quiz_block = "\n".join(quiz_lines).rstrip(",")

# --- EXAMS block (section id -> final exam questions) ---------------------
exam_block = "\n".join(exam_lines).rstrip(",")

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
    "/* ---------- final exams (section id -> questions) ---------- */\n"
    "const EXAMS = {\n" + exam_block + "\n};\n\n"
    "/* ---------- video links (lesson id -> source video) ---------- */\n"
    "const VIDEOS = {\n" + vid_block + "\n};\n\n"
    + read(ENGINE / "app.js").rstrip("\n") + "\n"
    "</script>\n"
)

parts.append("</body>\n</html>\n")

OUT.write_text("".join(parts), encoding="utf-8", newline="\n")
print(f"built index.html: {len(all_lessons)} lessons, "
      f"{len(img_lines)} image sets, {len(quiz_lines)} quizzes, "
      f"{review_pages} review page(s) across {len(section_lines)} section(s)")
