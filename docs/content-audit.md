# Content audit — The Algorithm

A full review of every piece of course content against the governing rule in
[`CLAUDE.md`](../CLAUDE.md) §1: **course content must come purely from the source
material** (the transcripts in `transcripts/` and, for Section 2, the notes in
`notes/2022-mentorship/`).

This is a **review**, not a fix-up. Findings are logged here; content is not
edited unless separately approved. The one exception is genuinely broken things
(invalid HTML, dead cross-references, build failures) — those are fixed in place
and recorded under *Fixed in flight*.

Started 2026-08-07.

---

## Scope (verified 2026-08-07)

| | Lessons | Quiz Qs | Exam Qs | Summary | Images | Videos |
|---|---|---|---|---|---|---|
| Section 1 — ICT Core (Months 1–4) | 38 | 145 | 45 | yes | — | 38 |
| Section 2 — 2022 Mentorship (Parts 1–6) | 40 | 306 | 40 | yes | — | 40 |
| **Total** | **78** | **451** | **85** | 2 | 339 | 78 |

Sources: `transcripts/` (79 `.txt`), `notes/2022-mentorship/` (39 `ep-NN.md`,
Section 2 only). Both git-ignored, local-only.

---

## Review dimensions (priority order)

1. **Content fidelity (§1)** — is every claim traceable to that lesson's
   transcript/notes? Outside trading knowledge, invented examples and "improved"
   concepts are the highest-value findings.
2. **Coverage gaps** — material in the source that never reached the lesson.
3. **Quiz & exam quality** — §3 authoring rules: correct option + `e`
   source-traceable; four option lengths comparable so the answer isn't
   conspicuous; distractors plausible; no exam question tests something absent
   from its section's summary.
4. **Consistency** — terminology across sections, `(L4)` / `(P3 L3)`
   cross-references resolving, slug/id prefix alignment, `data-month` correct.

### Severity

| Severity | Meaning |
|---|---|
| **blocker** | Violates §1 (unsourced claim presented as ICT's), or breaks the build/page. |
| **should-fix** | Material coverage gap, misleading phrasing, or a quiz rule breach that gives the answer away. |
| **nit** | Wording, consistency, polish. No reader is misled. |

---

## Batches

One batch per month/part. Work one at a time: read that batch's lessons and only
that batch's transcripts, log findings below, tick the row, commit, stop for
go-ahead.

| # | Batch | Lessons | Quiz Qs | Status |
|---|---|---|---|---|
| A | S1 · Month 1 | m1-01 … m1-08 (8) | 39 | ☑ 2026-08-07 |
| B | S1 · Month 2 | m2-01 … m2-08 (8) | 37 | ☐ |
| C | S1 · Month 3 | m3-01 … m3-08 (8) | 25 | ☐ |
| D | S1 · Month 4a | m4-01 … m4-07 (7) | 24 | ☐ |
| E | S1 · Month 4b | m4-08 … m4-14 (7) | 20 | ☐ |
| F | S1 · summary + exam | `summary.html`, `exam.js` | 45 | ☐ |
| G | S2 · Part 1 | p1-01 … p1-07 (7) | 44 | ☐ |
| H | S2 · Part 2 | p2-01 … p2-06 (6) | 49 | ☐ |
| I | S2 · Part 3 | p3-01 … p3-06 (6) | 47 | ☐ |
| J | S2 · Part 4 | p4-01 … p4-06 (6) | 45 | ☐ |
| K | S2 · Part 5 | p5-01 … p5-07 (7) | 57 | ☐ |
| L | S2 · Part 6 | p6-01 … p6-08 (8) | 64 | ☐ |
| M | S2 · summary + exam | `summary.html`, `exam.js` | 40 | ☐ |
| N | Cross-cutting sweep | terminology, cross-refs, slugs, `data-month` | — | ☐ |

---

## Structural observations (whole-corpus, gathered up front)

These come from a mechanical scan of `content/`, not from reading the sources.
They frame the per-batch work; individual findings live under each batch.

**S1 · Quiz-count asymmetry.** Section 1 carries 2–6 questions per lesson;
Section 2 carries 5–12. Fourteen Section 1 lessons sit below the four that
`CLAUDE.md` §3's four-option/quiz shape implies as a floor:

| Questions | Lessons |
|---|---|
| 2 | m3-01, m3-04, m3-05, m4-08, m4-10, m4-11 |
| 3 | m2-03, m3-02, m3-03, m4-04, m4-05, m4-06, m4-07, m4-12, m4-14 |

Notably these cluster in Months 3–4, the image-heaviest lessons (m3-03 has 23
charts and 3 questions; m4-03 has 20 charts and 4). Verdict to be recorded per
batch, against how much material each lesson actually carries.

> **Verdict so far (batch A):** Month 1 is *not* affected — 4-6 questions per
> lesson, in proportion to each lesson's content, and all 39 traceable. The
> count asymmetry is a Months 3–4 problem, to be judged in batches C, D and E.
> The real Section 1 quiz defect is not *how many* questions but *how they are
> written* — see finding **A10**.

**S1 · `p3-01` slug with no images.** `build.py` warns that
`content/s2-2022-mentorship/p3/p3-01` declares
`data-slug="p3-01-a-requested-execution-the-model-in-real-time"` but no matching
PNGs exist, so nothing renders. Either the charts were never harvested or the
slot is spurious. Resolve in batch I.

**Lessons with no `.fig-slot` at all** (no charts in the source): m1-04, m1-05,
m1-06, m1-08, m2-03, m2-05, p5-01 — plus p1-01, p2-01, p2-04, which omit it too
but *annotate* the omission with an HTML comment. Section 1 omits silently.
Cosmetic inconsistency; confirm per batch that the source genuinely has no
charts.

---

## Findings

Format: `severity · file:line — finding`. Fidelity findings cite the transcript
line or note section that does (or does not) support the claim.

### Batch A — Section 1, Month 1

Sources read: all 8 `transcripts/Month 1/*.txt`. Lessons, quizzes, `video.txt`
and slugs checked for all of m1-01 … m1-08.

**Headline:** fidelity is genuinely good. Every substantive claim across the
eight lessons traces to its own transcript, usually closely enough to point at a
line. Two exceptions are logged below, one of which is a real invention. The
weakest dimension is not fidelity but **quiz construction** — the correct option
is the longest of the four in 31 of Month 1's 39 questions.

#### Content fidelity (§1)

**A1 · should-fix · [m1-02/lesson.html:37-46](../content/s1-ict-core/m1/m1-02/lesson.html#L37-L46)** —
The Weekly Template table attributes two days ICT never names. His transcript
gives only: *"Sunday's open consolidation, then there's an expansion move in
Monday, then there's a reversal on Tuesday or Monday, and then there's another
expansion move, then it goes back in consolidation midweek, and then it's either
going to reverse or it's going to retrace"*
(`How Market Makers Condition The Market.txt:582-597`). The lesson renders the
unnamed fourth step as **"Wednesday — Another expansion"** and the unnamed final
step as **"Friday — Reverse or retrace"**. Neither day appears anywhere in the
transcript (`grep -i wednesday|thursday|friday` returns nothing). A learner reads
this as a rule ICT gave. It also contradicts itself: the row below "Wednesday"
is "Midweek — Consolidation", and Wednesday *is* midweek.
*Fix:* relabel those two rows to the source's own vagueness ("Then" / "Late
week"), keeping the sequence intact.

**A2 · nit · [m1-04/lesson.html:15](../content/s1-ict-core/m1/m1-04/lesson.html#L15)** —
*"Only fib **pure, obvious** swings"* is not in m1-04's transcript (`grep -i
"pure|sloppy|questionable"` on *Equilibrium Vs. Discount* returns nothing
relevant). It is verbatim ICT, but from the **next** lesson's transcript
(*Equilibrium Vs. Premium*: *"if it looks sloppy… obvious price swings are the
ones we look at"*, lines 266-274), where m1-05 already carries it correctly. So
the rule is taught one lesson before it is sourced. Same-month sibling
borrowing — harmless in substance, but it is the pattern §1 exists to prevent.
The rest of that bullet (the Sunday-candle exclusion) *is* in m1-04's own
transcript at lines 396-403.

**A3 · nit · [m1-02/lesson.html:10](../content/s1-ict-core/m1/m1-02/lesson.html#L10)** —
*"that's not your broker, it's the interbank feed"* over-tightens ICT, who says
both: *"it's not really your broker, it's the interbank feed that drives price
against the funds **and the brokers are going to expand the spread as well on you
and knock you out**"* (lines 221-227). The lesson drops the concession and turns
a "both" into an "either/or".

#### Coverage gaps

**A4 · should-fix · m1-04** — the lesson carries no risk management, though its
transcript states it plainly twice:

- *"if we understand this is the low we draw our fib from, a stop loss has to be
  below there on this time frame"* (lines 786-789) — explicit stop placement.
- *"if the market is below equilibrium we are in a discount market and it should
  **not** go below the old low it forms… wherever the impulse price swing is,
  that low it starts from, it can't go below that"* (lines 771-778) — the
  invalidation condition for the whole setup.

m1-04 is the lesson that teaches buying discounts; it tells the reader where to
enter and where to exit but never where the idea is wrong. This is the largest
single omission found in Month 1.

**A5 · nit · m1-01** — omits the three prerequisite series ICT names by name and
tells students to work through (*Market Maker Series*, *Precision Trading
Concepts*, *Sniper Series*, lines 144-161), plus his aside that USDCHF is choppy
and therefore unusually good for turtle soups and false breaks (lines 393-402).

**A6 · nit · m1-03** — omits ICT's inversion of indicators: *"we're going to be
able to use these indicators to be informed as to what the uninformed traders are
actually thinking… when we talk about sentiment next month"* (lines 91-99). The
lesson only tells the reader to strip indicators off; the source also tells them
what indicators are still good for, and forward-links to Month 2.

**A7 · nit · m1-05** — omits (a) why three candles and not five: *"this is why I
do not use the Williams fractal, it requires five candles, I only need three"*
(lines 330-335); (b) the swing-selection tiebreak *"I'm going to use this
[swing high] because it has more price action around it"* (lines 549-555).

**A8 · nit · m1-06** — buy-side only. The transcript's sell-side mirror is
dropped: *"if we were looking at a sell position we would be looking for areas
where the market in the past has moved up a great deal with speed, and lows where
stops would be building up below it… look for the lower end of the most recent
range for valuation"* (lines 569-578). Relatedly, the lesson defines the bullish
order block but not its stated counterpart: *"up candles before the market drops
down — that up candle is exactly where resistance is on an institutional basis"*
(lines 471-474).

**A9 · nit · m1-08** — the London protraction row gives only "After midnight NY";
ICT also pins it as *"after four GMT on the Forex LTD demo account"* (lines
163-166).

#### Quiz quality

**A10 · should-fix · corpus-wide, surfaced in Month 1** — **option length gives
the answer away.** Since the renderer shuffles positions (§3), length is the only
remaining tell, and it is a strong one. Measured across every question in the
repo (536 parsed: 451 quiz + 85 exam):

| Batch | n | correct = longest | spread > 10 chars |
|---|---|---|---|
| **m1** | 39 | **31 (79%)** | 14 (36%) |
| m2 | 37 | 27 (73%) | 10 (27%) |
| m3 | 25 | 18 (72%) | 6 (24%) |
| **m4** | 44 | **41 (93%)** | 8 (18%) |
| S1 exam | 45 | 25 (56%) | 0 |
| p1–p6 | 306 | 153 (50%) | 32 (10%) |
| S2 exam | 40 | 22 (55%) | 0 |
| **All** | **536** | **317 (59%)** | 70 (13%) |

Chance is 25%. A reader who knows nothing and always clicks the longest option
scores **59%** across the course — and **93%** on Month 4, comfortably past the
80% exam pass mark had those questions been on an exam. Section 1 is far worse
than Section 2 (79/73/72/93% vs 39–61%), so this is a legacy-authoring problem
that later work already improved on. Worst offenders in Month 1 by spread:
m1-05 q1 (28 vs 11 chars), m1-05 q3 (26 vs 9), m1-03 q5 (38 vs 24),
m1-02 q2 (38 vs 25), m1-04 q2/q4/q5 (all 37-39 vs 24-26).
*Fix shape (per §3):* trim the correct option to a concise phrase and push the
citation into `e`; inflate the terse distractors into full plausible statements.
No content changes needed — this is pure option-text balancing.
*Tooling:* the measurement script is reproducible; see note under
*Method* below.

**A11 · nit · [m1-02/quiz.js:6](../content/s1-ict-core/m1/m1-02/quiz.js#L6)** —
the inverse of A10. Q5's correct option `"The banks"` (9 chars) is conspicuously
the *shortest* against `"Large retail funds"` (18). Being the odd one out either
way is a tell.

All 39 Month 1 questions are otherwise **source-traceable** — every correct
option and every `e` explanation checks out against the lesson's own transcript.
No fabricated answers found.

#### Consistency — clean

Verified mechanically and by reading; nothing to fix:

- All 8 lessons carry `data-month="m1"`; ids are `m1-NN`; the 4 slugs present
  (`m1-01/02/03/07`) match their id prefix.
- **Video links spot-checked live against YouTube titles — 5 of 8 confirmed
  exact**, including the three most confusable (m1-04 *Equilibrium Vs. Discount*,
  m1-05 *Equilibrium Vs. Premium*, m1-06 *Fair Valuation*), plus m1-01 and m1-08.
  No mismatches.
- No `(L4)`-style cross-references appear in Month 1 lessons (they live only in
  the two `summary.html` files — deferred to batches F and M).
- `python build.py` and `python verify.py` both pass; 0 JS errors.

#### Open question for the owner

**A12** — m1-04, m1-05, m1-06 and m1-08 have **no `.fig-slot`**, so they render
chart-free, and m1-04/05/06 are exactly the lessons whose transcripts are
30-60 minutes of ICT walking a chart. Whether that is correct is **not verifiable
from what is in the repo**: `notes/` contains `2022-mentorship/` only, so Section
1's chart provenance (the Notion scrape) is not available locally to check
against. Flagging rather than guessing (§1). If the Section 1 notes had figures
for these four, they were never harvested.

---

## Fixed in flight

Genuinely-broken things repaired during the audit rather than logged.

_None yet._ Batch A found nothing broken: `build.py` and `verify.py` both pass,
the page has 0 JS errors, all Month 1 HTML is well-formed, and every video link
spot-checked resolves to the right video.

---

## Method notes

- **Per batch:** read only that batch's lessons, quizzes and transcripts, then
  log findings here with file/line refs and a severity. Transcripts outside the
  current batch are deliberately not read — they are large and would exhaust
  context.
- **Quiz option-length measurement (finding A10)** is mechanical and rerunnable.
  A throwaway script in the session scratchpad parses every `quiz.js` / `exam.js`
  with `\{\s*q:\s*"…"\s*,\s*o:\s*\[…\]\s*,\s*a:\s*(\d+)` and reports, per batch,
  how often the option at index `a` is the longest of the four and how often the
  max-min spread exceeds 10 characters. It is not committed (throwaway
  exploration belongs in the scratchpad per `CLAUDE.md` §5); the regex above is
  enough to reconstruct it.
- **Video links** are checked by fetching the YouTube watch page and comparing
  its `<title>` to the lesson's `data-title`.
- Nothing in `content/` was edited in batch A.
