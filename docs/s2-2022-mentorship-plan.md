# Section 2 — ICT 2022 Mentorship: build plan & session protocol

This is the **persistent context** for adding Section 2 to The Algorithm. It exists so that
each build session can start cold, read *only this file plus its own batch's sources*, and
produce finished lessons without re-deriving anything.

**If you are starting a new conversation on Section 2: read this file, then jump to
§6 Session protocol and pick the first unchecked batch in §7.**

Read `CLAUDE.md` first — §1 (content purity) and §3 (conventions) still govern everything here.

---

## 1. Goal

Add the **ICT 2022 Mentorship** (41 episodes) as `content/s2-2022-mentorship/`, a sibling of
`content/s1-ict-core/`, using the existing engine: content sources → `python build.py` →
single offline `index.html`.

**One episode = one lesson.** No thematic re-cutting, no merging. This keeps every lesson
traceable to exactly one transcript and one notes block (CLAUDE.md §1), and it makes the
work cleanly divisible across sessions.

---

## 2. Source inventory

| Source | Location | Status |
|--------|----------|--------|
| Transcripts | `transcripts/2022 Mentorship/2022 ICT Mentorship Episode N*.txt` | 41 files, 1.42 MB. Git-ignored. |
| Notes (prose) | `notes/2022-mentorship/ep-NN.md` | 39 files, ~25 KB total. Git-ignored. |
| Notes (charts) | `notes/2022-mentorship/raw/ep-NN-KK.png` | 80 PNGs. Git-ignored staging. |
| All notes in one file | `notes/2022-mentorship/DIGEST.md` | Every episode's prose, images stripped. ~25 KB — cheap to read whole. |

**The Notion page has already been harvested — do not re-fetch it.** Its image URLs are
presigned with `X-Amz-Expires=300` (5 minutes), so a re-fetch only yields dead links. The
80 PNGs in `notes/2022-mentorship/raw/` are the permanent copy. If an image is ever
genuinely missing, re-fetch the Notion page and download within 5 minutes
(`notion-fetch` → parse `![](url)` → download immediately).

Source page (for provenance only):
<https://cobalt-sight-9b7.notion.site/2022-Mentorship-275791461e9081a28b66fb172367c5e8>

### Gaps — flagged, not filled

- **Episode 28 has no source at all**: its transcript file is 0 bytes and the notes page has
  no Episode 28 block. Per CLAUDE.md §1 it **cannot be authored** and is omitted. Section 2
  is therefore **40 lessons**, numbered by episode with 28 skipped.
- **Episodes 26 and 28 have no notes.** Ep 26 still has a 11 KB transcript, which is a valid
  primary source, so it is built from the transcript alone.
- **Video URLs are not in hand.** Every lesson needs its real source video URL in `video.txt`
  (CLAUDE.md §3) and inventing one is forbidden. Until a real list is supplied, write an
  **empty `video.txt`** — the engine renders nothing, which is the correct graceful state.
  See §8 Open questions.

---

## 3. Structure decisions

### Parts (the "month" tier)

The engine's middle tier is a month; the 2022 Mentorship has no months, so it is grouped
into **6 sequential parts**. Grouping follows the mentorship's own running order — it is
sequential by design — with boundaries placed where the subject matter turns.

| Part | Episodes | Lessons | Theme |
|------|----------|---------|-------|
| `p1` | 1–7   | 7 | Foundations & the 2022 model — FVGs, liquidity, MSS, killzones, premium/discount |
| `p2` | 8–13  | 6 | Order blocks, Power of Three, and market structure (STH/ITH/LTH) |
| `p3` | 14–19 | 6 | Bias, fibs & OTE, the daily narrative, and knowing when not to trade |
| `p4` | 20–25 | 6 | Correlation (DXY/SMT), tape reading, news days, daily rebalance theory |
| `p5` | 26–33 | 7 | Session playbooks & special days (28 omitted — no source) |
| `p6` | 34–41 | 8 | Dealing range, reversals, algorithmic theory, daily bias, risk & psychology |

Part titles above are **provisional**. They are confirmed in the final polish session (§7),
once every lesson is written and the actual content of each part is known.

### IDs and slugs

**Hard engine constraint:** `app.js` does `SLUG_BY_ID[slug.slice(0,5)] = slug`, so a lesson
id must be **exactly 5 characters** and globally unique across all sections.

- Month/part folder + `months.js` id: `p1` … `p6` (no collision with s1's `m1`–`m4`).
- Lesson folder + `<section id>`: `p{part}-{NN}`, `NN` restarting at `01` in each part.
- Slug: `p{part}-{NN}-{kebab-title}`, e.g. `p1-02-fvgs-liquidity-and-the-judas-swing`.
- `data-month="p1"` on the lesson section.

Grouping is done purely by `data-month`; the id prefix is convention, not machinery.

### Episode → lesson id map

| Part | Lesson ids | Episodes |
|------|-----------|----------|
| p1 | `p1-01` … `p1-07` | 1, 2, 3, 4, 5, 6, 7 |
| p2 | `p2-01` … `p2-06` | 8, 9, 10, 11, 12, 13 |
| p3 | `p3-01` … `p3-06` | 14, 15, 16, 17, 18, 19 |
| p4 | `p4-01` … `p4-06` | 20, 21, 22, 23, 24, 25 |
| p5 | `p5-01` … `p5-07` | 26, 27, **29**, 30, 31, 32, 33 |
| p6 | `p6-01` … `p6-08` | 34, 35, 36, 37, 38, 39, 40, 41 |

Note the p5 offset: `p5-03` is Episode **29**, not 28.

### Images

Charts move from staging to their final home, renamed to the lesson's slug:

```
notes/2022-mentorship/raw/ep-02-01.png  →  images/p1-02-{kebab-title}-01.png
```

`build.py` derives `IMG_COUNTS` by counting the files, so nothing else is edited. `images/`
is committed; `notes/` is not.

---

## 4. Engine changes — **done in Phase A**

CLAUDE.md §7 predicted Section 2 would need no engine changes. That was *almost* true — the
data model was ready, but three rendering details assumed a single section. All three are
now fixed; this section is kept as the record of what changed and why.

1. **`renderCards()` hardcodes the word "Month" and numbers cards globally.** It iterates
   `MONTHS` flat, so Section 2's parts would render as "Month 5" … "Month 10". Fix: iterate
   `SECTIONS` → `sec.months`, number within the section, and take the noun from a new
   `label` field on `section.js` (`"Month"` for s1, `"Part"` for s2).
2. **Home and sidebar have no section heading.** With two sections the flat list of 10
   groups is unreadable. Fix: emit a section heading in `renderCards()` and `renderNav()`.
3. **A part with no lessons yet is a crash.** `renderCards()` does
   `show(items[0].id)` on click, which throws when `items` is empty. Because Section 2 is
   built up part by part, empty parts *will* exist mid-build. Fix: guard the click and
   render the card as inert when `items.length === 0`.

`section.js` gains one optional field, `label`, defaulting to `"Month"` when absent so
Section 1 is untouched.

---

## 5. Why the work is split this way

The transcripts are the entire context problem: 1.42 MB ≈ 370k tokens, far beyond one
session. The notes are not — all 39 episodes of prose are ~25 KB and can be read whole in
any session.

So each session is sized by **transcript weight**, targeting **≤ 120 KB (~30k tokens)** of
transcript per session. That leaves ample room to read the notes digest, write 2–5 lessons
with quizzes, build, and verify. Episode 19 (131 KB) exceeds the target on its own and gets
a session to itself.

---

## 6. Session protocol

Each content session does exactly this, for one batch from §7:

1. **Read this file.** Do not read other sessions' lessons; the conventions are here.
2. **Read `notes/2022-mentorship/DIGEST.md`** (cheap, whole-section context) or just the
   `ep-NN.md` files for this batch.
3. **For each episode in the batch, one at a time:**
   a. Read `transcripts/2022 Mentorship/2022 ICT Mentorship Episode N*.txt`.
   b. Derive the lesson **title** from what the episode actually teaches.
   c. Write `content/s2-2022-mentorship/{part}/{id}/lesson.html` — the section markup per
      CLAUDE.md §3, reusing `.callout`, `.callout.rule`, `.callout.warn`, `.kv`,
      `.flip-row`, `<h3>`. Content comes **only** from that episode's transcript + notes.
   d. Write `quiz.js` — 4–6 questions, the shape and authoring rules in CLAUDE.md §3
      (balanced option lengths; the correct option and `e` must be source-traceable).
   e. Write `video.txt` — empty until real URLs are supplied (§8).
   f. Copy that episode's `raw/ep-NN-KK.png` into `images/` renamed to the lesson slug.
   **Then move to the next episode.** Finishing each lesson before starting the next keeps
   only one transcript live in context.
4. **Add the part to `months.js`** if this is the batch that first populates it.
5. **`python build.py && python verify.py`** — both must pass clean.
6. **Commit** with a message naming the episodes, e.g.
   `feat: add Section 2 lessons for episodes 1-2`. Do **not** push (see memory: no auto-push).
7. **Tick the batch in §7 and commit that too**, so the next session knows where to resume.

Guardrails worth repeating:
- Never hand-edit `index.html` — it is a build artifact.
- Never add trading knowledge that is not in that episode's transcript or notes.
- If the source is thin (several episodes are), write a **short lesson**. Under-claiming is
  correct; padding is not.

---

## 7. Batches — progress tracker

15 content sessions, then one polish session. Tick a box when its lessons are built,
verified and committed.

| # | Part | Episodes | Lessons | Transcript | Done |
|---|------|----------|---------|-----------|------|
| A | p1 | 1 | Phase A: engine, scaffold + pilot lesson `p1-01` | 30 KB | [x] |
| 1 | p1 | 2–3 | `p1-02`–`p1-03` | 104 KB | [ ] |
| 2 | p1 | 4–6 | `p1-04`–`p1-06` | 93 KB | [ ] |
| 3 | p1 | 7 | `p1-07` | 60 KB | [ ] |
| 4 | p2 | 8–10 | `p2-01`–`p2-03` | 106 KB | [ ] |
| 5 | p2 | 11–12 | `p2-04`–`p2-05` | 99 KB | [ ] |
| 6 | p2 | 13 | `p2-06` | 44 KB | [ ] |
| 7 | p3 | 14–17 | `p3-01`–`p3-04` | 90 KB | [ ] |
| 8 | p3 | 18 | `p3-05` | 63 KB | [ ] |
| 9 | p3 | 19 | `p3-06` | 131 KB | [ ] |
| 10 | p4 | 20–22 | `p4-01`–`p4-03` | 106 KB | [ ] |
| 11 | p4 | 23–25 | `p4-04`–`p4-06` | 118 KB | [ ] |
| 12 | p5 | 26–33 (no 28) | `p5-01`–`p5-07` | 106 KB | [ ] |
| 13 | p6 | 34–38 | `p6-01`–`p6-05` | 116 KB | [ ] |
| 14 | p6 | 39 | `p6-06` | 82 KB | [ ] |
| 15 | p6 | 40–41 | `p6-07`–`p6-08` | 98 KB | [ ] |
| P | — | — | Polish: part titles, `summary.html`, `exam.js`, home copy | — | [ ] |

**Polish session (P)** — only after all 40 lessons exist:
- Confirm/rewrite the six part titles and descriptions in `months.js` from the real content.
- Write `content/s2-2022-mentorship/summary.html` (`id="s2-review"`, `data-kind="review"`,
  `.review-footer` slot) — it re-states the lessons, it adds nothing.
- Write `content/s2-2022-mentorship/exam.js` — the exam page itself is generated.
- Update the home hero copy in `engine/home.html` and the README to describe both sections.

---

## 8. Open questions for the user

1. **Video URLs.** Every Section 1 lesson links its source video; Section 2 cannot without a
   real list of the 41 episode URLs (a YouTube playlist would do). Until then `video.txt`
   stays empty. Supplying the playlist at any point makes this a single mechanical pass.
2. **Episode 28.** No transcript, no notes. Confirm it should be omitted, or supply the
   transcript to include it.
3. **Part titles.** The §3 themes are provisional and get confirmed in the polish session.
