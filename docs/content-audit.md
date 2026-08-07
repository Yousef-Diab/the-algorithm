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

Sources: `transcripts/` (79 `.txt`), `notes/ict-core/` (Section 1) and
`notes/2022-mentorship/` (39 `ep-NN.md`, Section 2). All git-ignored, local-only.

> **Source-set correction, 2026-08-07.** Batch A was originally run against the
> Section 1 **transcripts only**, because ICT's Section 1 notes were not in the
> repo. They have since been harvested from Notion into `notes/ict-core/`
> (see [`notes/ict-core/INDEX.md`](../notes/ict-core/INDEX.md) for the page-ID
> map and fetch method). §1 permits **both** the transcripts and the notes, so
> every Section 1 batch must be checked against both. Month 1 has been
> re-verified; the effect on batch A's findings is recorded inline below —
> **one finding (A1) is withdrawn**, one is strengthened, one is added, and the
> open question (A12) is resolved. Batches B–E must fetch that month's notes
> *before* reading its transcripts.

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
| A | S1 · Month 1 | m1-01 … m1-08 (8) | 39 | ☑ 2026-08-07 (notes + transcripts) |
| B | S1 · Month 2 | m2-01 … m2-08 (8) | 37 | ☑ 2026-08-07 (notes + transcripts) |
| C | S1 · Month 3 | m3-01 … m3-08 (8) | 25 | ☑ 2026-08-07 (notes + transcripts) |
| D | S1 · Month 4a | m4-01 … m4-07 (7) | 24 | ☐ fetch notes first |
| E | S1 · Month 4b | m4-08 … m4-14 (7) | 20 | ☐ fetch notes first |
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
>
> **Verdict (batch C): for Month 3 the count *is* a defect.** Unlike Months 1–2,
> Month 3's question counts run *inverse* to the material — see **C18**. Four
> lessons are under-tested (m3-01, m3-03, m3-04, m3-05); m3-02, m3-07 and m3-08
> are fine and m3-06 is generous.

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

Sources read: all 8 `transcripts/Month 1/*.txt` **and** all 8
`notes/ict-core/m1-NN.md`. Lessons, quizzes, `video.txt` and slugs checked for
all of m1-01 … m1-08.

**Headline:** fidelity is genuinely good — better than the first pass suggested.
Every substantive claim across the eight lessons traces to that lesson's own
transcript or its own note page, usually closely enough to point at a line. The
weakest dimension is not fidelity but **quiz construction** — the correct option
is the longest of the four in 31 of Month 1's 39 questions.

#### Content fidelity (§1)

**A1 · ~~should-fix~~ → WITHDRAWN · m1-02** —
*Originally logged as an invention: the Weekly Template's "Wednesday — Another
expansion" and "Friday — Reverse or retrace" rows, neither day appearing anywhere
in the transcript.* **This finding is wrong and is withdrawn.** Both days are
explicit in ICT's notes, which the first pass did not have:

```
Same thing happens on the weekly
Sunday open = consolidation
Monday = expansion
Tuesday = reversal
Wednesday = expansion
Thursday = consolidation midweek
Friday = reverse or retrace
```

(`notes/ict-core/m1-02.md`). The lesson reproduces this faithfully. The apparent
self-contradiction I flagged ("Wednesday" followed by "Midweek") is also not the
lesson's doing — the notes say *"Thursday = consolidation midweek"*, and the
lesson **under-claims** it as plain "Midweek", which is the direction §1 asks for.
No action. If anything that row could gain the day label the notes give it.

**A2 · nit · [m1-04/lesson.html:15](../content/s1-ict-core/m1/m1-04/lesson.html#L15)** —
*"Only fib **pure, obvious** swings"* appears in neither m1-04's transcript nor
m1-04's notes. It is verbatim ICT, but from the **next** lesson — and now
traceable to both of m1-05's sources: the notes say *"If its a good and **pure
and obvious** price swing then we measure it and put a fib on it"*
(`notes/ict-core/m1-05.md`, near-verbatim to the lesson's wording, so that is
plainly where it was written from), and the transcript says *"if it looks
sloppy… obvious price swings are the ones we look at"* (lines 266-274). m1-05
already carries the rule correctly. So it is taught one lesson before it is
sourced — harmless in substance, but it is the pattern §1 exists to prevent.
The rest of that bullet (the Sunday-candle exclusion) *is* in m1-04's own
transcript (lines 396-403) and its own notes.

**A3 · nit · [m1-02/lesson.html:10](../content/s1-ict-core/m1/m1-02/lesson.html#L10)** —
*"that's not your broker, it's the interbank feed"* over-tightens ICT, who says
both: *"it's not really your broker, it's the interbank feed that drives price
against the funds **and the brokers are going to expand the spread as well on you
and knock you out**"* (lines 221-227). The lesson drops the concession and turns
a "both" into an "either/or".

#### Coverage gaps

A5–A9 were re-checked against `notes/ict-core/` — each is a **transcript-only**
gap (the notes do not carry those points either), so none changes severity. Two
things the notes settled in the lesson's favour, and which are therefore *not*
gaps:

- m1-03's *"Three charts total: the executable, the 15-minute MTF, and the HTF"*
  reads like the lesson glossing ICT. It is not — the notes say exactly
  *"Use 3 different charts / 1. executable chart / 2. MTF, 15m / 3. HTF"*.
- m1-08's three protraction times are confirmed twice over. The notes give two
  renderings — *"1. 00 GMT 2. Midnight New York 3. 1100 GMT, New York open"* and
  *"MNO, 7am NY, 8pm NY"* — which agree with each other (11:00 GMT = 7 AM NY,
  00 GMT = 8 PM NY) and with the lesson.

**A4 · should-fix — strengthened by the notes · m1-04** — the lesson carries no
risk management, though its transcript states it plainly twice:

- *"if we understand this is the low we draw our fib from, a stop loss has to be
  below there on this time frame"* (lines 786-789) — explicit stop placement.
- *"if the market is below equilibrium we are in a discount market and it should
  **not** go below the old low it forms… wherever the impulse price swing is,
  that low it starts from, it can't go below that"* (lines 771-778) — the
  invalidation condition for the whole setup.

**The notes carry it too**, as a standalone line: *"The low where the impulse
starts from, it should not go below that"* (`notes/ict-core/m1-04.md`). So this
rule survives in **both** of ICT's records of the lesson and in neither the
lesson nor its quiz. m1-04 teaches buying discounts; it tells the reader where to
enter and where to exit but never where the idea is wrong. Now the clearest
finding in batch A.

**A13 · nit · [m1-04/lesson.html:38](../content/s1-ict-core/m1/m1-04/lesson.html#L38)** —
*(new, from the notes)* the lesson says markets reach for stops *"in grades of
**10 and 20 pips** above a high"*. The notes say *"Price reaches to 10-20 pips
above a high to reach for stops, **sometimes 30**"* (`notes/ict-core/m1-04.md`).
The upper bound is dropped, which understates the range a reader should expect.

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

> **Correction, batch C.** The table above counts a **tie** for longest as
> "correct = longest". That overstates the tell: when two options tie for
> longest, the length carries no signal at all. Re-measured with ties excluded
> and with the guesser's real expected score (always click the longest, break
> ties at random), the corpus figure is **52%, not 59%**, and Month 4 is **90%,
> not 93%**. The finding stands — 52% against a 25% chance is still a strong
> tell, and Month 4 is still the outlier — but the headline numbers below are
> the ones to quote. Full per-batch figures are in **C17**.

Chance is 25%. A reader who knows nothing and always clicks the longest option
scores **~~59%~~ 52%** across the course — and **~~93%~~ 90%** on Month 4,
comfortably past the 80% exam pass mark had those questions been on an exam.
Section 1 is far worse than Section 2, so this is a legacy-authoring problem
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

#### A12 — RESOLVED (was: open question for the owner)

*Originally flagged as unverifiable: m1-04, m1-05, m1-06 and m1-08 render
chart-free, and three of them are lessons where ICT talks over a chart for
30-60 minutes, but Section 1's notes were not in the repo to check against.*

**Now verified, and the answer is clean.** Every Month 1 note page's image count
matches `images/` exactly, 1:1 and in order:

| Lesson | Charts in notes | PNGs in `images/` | |
|---|---|---|---|
| m1-01 | 8 | 8 | ✓ |
| m1-02 | 4 | 4 | ✓ |
| m1-03 | 1 | 1 | ✓ |
| m1-04 | 0 | none | ✓ correctly no `.fig-slot` |
| m1-05 | 0 | none | ✓ correctly no `.fig-slot` |
| m1-06 | 0 | none | ✓ correctly no `.fig-slot` |
| m1-07 | 5 | 5 | ✓ |
| m1-08 | 0 | none | ✓ correctly no `.fig-slot` |

The four chart-free lessons are chart-free **in ICT's notes**. Nothing was
missed by the scrape, and no `.fig-slot` is absent that should be present. The
"S1 omits the no-fig-slot comment that S2 writes" cosmetic point stands, but it
is purely stylistic.

### Batch B — Section 1, Month 2

Sources read: all 8 `transcripts/Month 2/*.txt` **and** all 8
`notes/ict-core/m2-NN.md` (fetched from Notion at the start of this batch).

**Headline:** the strongest month audited so far on fidelity. Month 2 is heavy
with specific numbers — price levels, pip counts, percentage tables — and
**almost all of them check out to the digit**. m2-04's six-row accuracy/RR table
(+2/+8/+15/+28/+40/+20%) is correct in every row; m2-06's "seven things in
agreement" framework (2 of 4, 2 of 3, 1 of each of 3) matches the transcript's
structure exactly; m2-08's measured moves (108.75→109.25, 108.85→109.80, the
109.90 terminus on the daily bearish OB) are verbatim. Two numeric problems in
m2-02 are the only fidelity findings, and one traces to a garbled transcript.

#### Content fidelity (§1)

**B1 · should-fix · [m2-02/lesson.html:22](../content/s1-ict-core/m2/m2-02/lesson.html#L22)** —
*"the same move that gives the hourly trader 1:1 gives you 3:1"* is not in the
source, and it is wrong at the point being described. ICT's actual claim is
narrower: *"as we hit the entry that would be assumed on the hourly chart at that
7542 level, we're hitting that level here with lower risk and we're getting a
3 to 1 reward ratio"* (`Framing Low Risk Trade Setups.txt:209-217`). At the
moment price reaches 7542 the hourly trader is **being filled** — they are at
0R, not 1:1. The comparison is invented and it overstates by a full R.
*Fix:* say what ICT says — by the time the hourly entry fills, the refined trade
is already at 3R.

**B2 · should-fix · [m2-02/lesson.html:19](../content/s1-ict-core/m2/m2-02/lesson.html#L19)** —
the 15-minute row reads *"buyer at 7520, stop 7507 — **17 pips**"*. **7520 − 7507
= 13.** ICT does say "17 pip stop loss" (line 157), which implies the stop is
**7503**. The transcript renders the level as `757` in both places it appears —
once for the 15-minute stop and once for the 5-minute stop — and the two cannot
both be right: 7507 makes the 5-minute row's *"less than 10 Pips… eight Pips"*
correct (7515 − 7507 = 8 ✓), while 7503 makes the 15-minute row's 17 correct.
The lesson picked 7507 for both and inherited the contradiction into a row a
reader can check with mental arithmetic. The notes don't disambiguate.
*Fix (per §1's prefer-under-claiming):* drop the explicit stop price from the
15-minute row and keep ICT's stated "17 pips", or mark the level approximate.

#### Coverage gaps

**B3 · should-fix · m2-06** — the lesson is *about* the decision framework, yet
omits the ordered hierarchy the transcript spends ~150 lines laying out before
it reaches the three perspectives (`The Secrets To Selecting High Reward
Setups.txt:166-320`): **patience → what defines a tradeable environment → trade
parameters (what makes it a buy or sell) → executable criteria (what negates it,
where the stop goes, is it still a buy after a stop-out) → why the trade should
pan out**. The lesson jumps to "process-oriented thinking" and the 7-count. The
hierarchy is the spine of the source, and it answers the "what do I do first"
question the lesson otherwise leaves open.

**B4 · nit · m2-06** — the *"you can't copy someone else"* line is ICT quoting
and crediting **Chris Laurie** by name (line 1684). The lesson carries the idea
without the attribution. `CLAUDE.md` §6 asks that attribution to original
creators survive changes.

**B5 · nit · m2-06** — the transcript explicitly permits skipping top-down
analysis altogether: *"you can trade really without the monthly weekly and daily
chart and trade on an idea relative to the commitment of traders and sentiment"*
(1035-1049). The lesson carries the weaker version ("only one timeframe needed").

**B6 · nit · m2-04** — two asides dropped: the half-percent case (*"what if you
were to drop that risk per trade down to a half a percent — would you be upset
with 10% return per month?"*, 387-393), and the point that the 20%/month goal
**buys you the cushion to trade only half the year** — *"there are some months in
the year that you don't really want to be trading"* (431-441).

**B7 · nit · m2-01** — *"once you get one or two [big payouts] in your month you
can now start lowering your risk-to-reward… you can get bread and butter
scenarios, two to one, three to one"* (332-345) — the permission to downshift
after a big win is absent.

**B8 · nit · m2-03** — the fallback for traders who can't refine to a 10-pip
stop: stuck with the 1-hour 20-pip setup, a 50-pip run on the second portion
still makes *"over ten percent right there"* (398-441). The lesson's numbers all
assume the refined entry.

**B9 · nit · m2-07** — asymmetric detail. The false **bull** flag gets its price
(76.97, matched to the pip on the 5m and 15m); the false **bear** flag half gets
none, though the transcript supplies them — 74.70 entry, equal highs cleared at
75.68 / 75.73, and the pattern-trader's projected 73.55 target versus the actual
74.42 low (549-554, 634-670).

**B10 · nit · m2-05** — the transcript's second devil's-advocate cascade (330-381):
two stop-outs in a row, risk stepping 2% → 1% → 0.5%, and even at 0.5% the run
mitigates the original 2%. The lesson gestures at it ("One trade doesn't have to
erase all your losses") without the worked case.

#### Quiz quality

All 37 questions are **source-traceable** — every correct option and every `e`
checks out. Month 2 is the most *uneven* month so far on the §3 length rule:
several quizzes are models of good construction, a few are not.

**B11 · should-fix · [m2-02/quiz.js:3](../content/s1-ict-core/m2/m2-02/quiz.js#L3)** —
the worst single question in Months 1-2. Q2's options run 36 / 30 / 17 / **10**
characters; the correct answer is the longest and `"It doesn't"` is a 10-character
throwaway nobody picks. Spread 26.

Others over spread 13: m2-06 q5 (26 vs `"Random"` at 6), m2-05 q3 (33 vs 17),
m2-05 q4 — note q4 is *inverted*, the correct option is the shortest —
m2-04 q1 (26 vs 12), m2-04 q5 (18 vs `"Guess"` at 5), m2-07 q5 (34 vs 20).

**Worth copying elsewhere**, since these show the fix costs nothing:
m2-04 q4 (all four options 27-29 chars), m2-05 q2 (32-35), m2-05 q4 (30-33),
m2-01 q5 (10-15), and the numeric answers in m2-04 q2 / m2-06 q1, where options
like `1%` / `2%` / `5%` / `10%` make length meaningless by construction.

Month 2 scores 27/37 (73%) correct-is-longest against Month 1's 79% — see
**A10** for the corpus-wide picture.

#### Consistency

**B12 · nit · terminology drift within the month** — "mean threshold" is defined
twice, differently. m2-04 calls it *"the middle of the down candle"*
([lesson.html:18](../content/s1-ict-core/m2/m2-04/lesson.html#L18)); m2-07 calls
it *"body-low to body-high midpoint"*
([lesson.html:15](../content/s1-ict-core/m2/m2-07/lesson.html#L15)). **Both are
verbatim from their own transcripts** (m2-04:60-66, m2-07:416-419), so neither is
a §1 breach — but a reader meeting both may not realise they are the same
measure. The notes settle it in favour of the body reading: *"Mean treshold is
from body high/low to body low/high, not the wicks"* (`notes/ict-core/m2-07.md`).
A one-clause cross-reference in m2-04 would close it.

Otherwise clean: all 8 lessons carry `data-month="m2"`, ids are `m2-NN`, the 6
slugs present match their id prefix, and **all 8 note pages' chart counts match
`images/` exactly** — 4 / 4 / 0 / 5 / 0 / 9 / 5 / 4, with m2-03 and m2-05
correctly carrying no `.fig-slot`. `build.py` and `verify.py` pass, 0 JS errors.

#### Noted, not a finding

**m2-04's position-sizing formula silently corrects ICT.** The transcript
inverts the arithmetic — *"if you have 25 stop you divide that by 50 dollars"*
(486-488) — which yields 0.5, not a per-pip value. The lesson states it the right
way round ("1% of $5,000 = $50; divide by your stop… for your dollar-per-pip
leverage"), as does the quiz (`Risk $ ÷ stop pips`). This is a departure from the
literal source in the direction of correctness, and it preserves ICT's intent.
Flagging for visibility rather than repair.

#### Quiz-count verdict (m2-03, 3 questions)

**Not a defect.** m2-03's note page is three lines, and its transcript largely
re-walks the case study already built in m2-01 and m2-02. Three questions is
proportionate to the genuinely new material. The count question remains live for
Months 3-4 (batches C-E), where the 2-question lessons cluster.

### Batch C — Section 1, Month 3

Sources read: all 8 `transcripts/Month 3/*.txt` **and** all 8
`notes/ict-core/m3-NN.md` (fetched from Notion at the start of this batch).

**Headline:** Month 3 splits sharply. Lessons 1–6 are as well-sourced as
anything audited so far — m3-03 and m3-06 in particular reproduce long,
specific passages (the 4 stages of a price swing, the midnight-NY-open
accumulation rule, the whole 10yr/30yr SMT chain and the election-night call)
close to verbatim. The two **market-maker-trap lessons that close the month,
m3-07 and m3-08, are the weakest content in Section 1 so far** — and they carry
this audit's **first two blockers**: m3-08 teaches the inverse head & shoulders
backwards, and m3-07 invents a mechanism for the triangle that the quiz then
tests. Both trap lessons have the thinnest sources in the month (m3-08's note
page is a single line of prose), which is very likely how the gap opened.

Month 3 is also where the **quiz-count question gets its answer** (C18) and
where **A10's measurement needed correcting** (C17).

#### Content fidelity (§1)

**C1 · blocker · [m3-08/lesson.html:18](../content/s1-ict-core/m3/m3-08/lesson.html#L18)** —
**the inverse head & shoulders is taught backwards.** The lesson says it is
*"the mirror trap **at a discount** — sell stops below the 'head' are the target
**before the real move up**."* ICT teaches the exact opposite, twice, and at
length:

> *"the inverted head shoulders i would do the opposite **if i'm looking for
> price action to be bearish** as a higher time frame would indicate… i don't
> see that as a bullish breakout above the neckline i'm actually looking at that
> as **a run on buy stops and i'm going to look to go short there** and not
> expect to see price go higher but in fact blow out those equal highs and then
> make a run for the cell stops below what would be deemed as the head"*
> (`Market Maker Trap Head Shoulders Pattern.txt:190-206`)

The worked example confirms it — Oct 2015 cable, *"so you can be a seller above
5502… your objective would be to cover below that low"* (399-445). So the
inverse H&S is faded **short**, from a **premium**, and the sell stops below the
head are the **profit target of that short**, not a staging post before a rally.
The lesson gets one clause of three right. It also contradicts its own
neighbouring bullet: if the standard H&S is faded long *"in an institutionally
trained bullish environment… at a long term or intermediate term low"* (154-157)
— i.e. at a discount — the mirror cannot also be at a discount. A reader
following this line takes the wrong side of the trade.
*Fix:* rewrite as the short-side mirror; the source supports it sentence by
sentence.

**C2 · blocker · [m3-07/lesson.html:19](../content/s1-ict-core/m3/m3-07/lesson.html#L19)** —
**the triangle's mechanism is invented, and the quiz tests the invention.** The
lesson explains: *"The **triangle / wedge** is the same mechanism — converging
trendlines just stack buy stops above and sell stops below the **apex** so the
breakout can be faded."* Neither **"wedge"** nor **"apex"** appears anywhere in
Month 3's transcripts or notes (grepped). What ICT actually says about the
triangle is that he has *not* taught it yet:

> *"also you may see a classic chart pattern here that **we haven't spoke about
> but we're going to talk about it in this mentorship as well**: classic chart
> pattern triangle and false breakout here they would have been wrong even
> trading with that"* (`Market Maker Trap Trendline Phantoms.txt:528-534`)

— and m3-07's note page says only *"Classic chart pattern, triangle"*. So the
source observes that the triangle breakout failed and explicitly defers the
explanation; the lesson supplies an explanation ICT never gave, in his voice.
Worse, [`m3-07/quiz.js:5`](../content/s1-ict-core/m3/m3-07/quiz.js#L5) then makes
it a question — *"Why does the triangle / wedge work the same way?"* → *"Stops
stack on both sides"*, with an `e` that restates the invented mechanism as
sourced fact. This is the one place in Month 3 where a **quiz explanation is not
traceable to either source**.
*Fix:* either cut the bullet and q4, or reduce both to what ICT says — the
triangle appears here, its breakout failed, and the mentorship treats it later.

**C3 · should-fix · [m3-07/lesson.html:10](../content/s1-ict-core/m3/m3-07/lesson.html#L10)** —
**a quotation ICT did not say**, set in italics and quotation marks as if
verbatim: *"If everyone's looking at the same thing and everyone can't win, the
majority has to be wrong."* The words "majority", "everyone can't win" and any
near-variant appear **nowhere** in Month 3's transcripts or notes. Not a
blocker, because the *idea* is genuinely ICT's and is well covered in the same
transcript — *"price has no awareness of your trend line… price only respects
where the actual liquidity is"* (71-74), *"the Banks don't care what you're
scribbling all over your charts"* (129-132), *"it's really associated closely to
flipping a coin"* (288-289). But manufacturing a quote is exactly what §1 exists
to prevent, and there are three real ones to use instead.
*Fix:* drop the quotation marks and italics, or swap in one of the three above.

**C4 · should-fix · [m3-01/lesson.html:27](../content/s1-ict-core/m3/m3-01/lesson.html#L27)
and [m3-01/quiz.js:2](../content/s1-ict-core/m3/m3-01/quiz.js#L2)** — the lesson
and its quiz name **two different triads**. The `<h3>` is *"ICT's Only 3
Setups"* and the flip cards read **trade inside the range / orderblocks &
breakers / stop runs**. Quiz q1 asks *"Which are ICT's only 3 patterns?"* and
marks **orderblocks, stop runs, liquidity voids** correct. Both are
source-traceable — ICT gives the first list at
`Timeframe Selection.txt:1304-1318` (*"i only have really technically three i
trade inside of a range… or i'm selling at a bearish order block or i'm selling
short into a run above a previous high"*) and the second at 1349-1360 (*"it may
be order blocks… you'll be able to trade turtle soups. But maybe you can't do
that either. Well you'll trade in liquidity voids"*), and the note page ends on
the second list verbatim. So neither is wrong; the defect is that a reader who
learns the lesson cannot answer its own quiz from it. (The question survives on
elimination — the other three options are all retail chart patterns — which is
why this is should-fix and not a blocker.)
*Fix:* one clause on the cards noting ICT states the same three both ways, or
align the quiz to the cards.

**C5 · nit · [m3-04/lesson.html:17](../content/s1-ict-core/m3/m3-04/lesson.html#L17)** —
wrong timeframe on a mean threshold. The lesson says the election knee-jerk
*"never challenged the mean threshold of **the monthly OB**"*. In the transcript
ICT has already dropped to the daily by that point — *"here we go into a daily
chart… this is the beginning of the bullish order block here and **mean
threshold of this down candle** would be about right here and it's not even
challenged at all"* (`Anticipatory Skill Development.txt:223-233`). It's the
**daily** OB's mean threshold. Small, but it sends a reader to the wrong chart.

**C6 · nit · [m3-04/lesson.html:9](../content/s1-ict-core/m3/m3-04/lesson.html#L9)** —
*"A few overlapping opens/closes is fine — **that's confluence**."* ICT says only
*"you may have a few overlapping levels… that's okay"* (58-63). "Confluence" is
the lesson's gloss, and it upgrades a shrug into a positive signal.

**C7 · nit · [m3-08/lesson.html:10](../content/s1-ict-core/m3/m3-08/lesson.html#L10)** —
over-tightening, the same shape as **A3**. Lesson: picking tops and bottoms is
*"the **single worst thing** a trader can do"*. ICT: *"picking tops and bottoms
is **one of the worst games to play** especially the new trader"* (112-116).
Also in the same bullet, *"retail sells the right shoulder"* — in the source
retail sells the **neckline break** with a measured-move objective (255-273);
the right shoulder is where *ICT* takes first profit (207-209), not where retail
enters.

**C8 · nit · [m3-02/lesson.html:12](../content/s1-ict-core/m3/m3-02/lesson.html#L12)** —
a third rendering of "mean threshold", extending **B12**. m3-02 says *"the middle
of the **orderblock candle**"*; m2-04 said *"the middle of the down candle"*;
m2-07 said *"body-low to body-high midpoint"*. m3-02's own note page settles it
the same way m2-07's did — *"The bodies of the candles should respect the mean
threshold **of the body** of the OB"* — so dropping "of the body" under-specifies
it. B12's suggested one-clause cross-reference would now fix three lessons.

#### Coverage gaps

**C9 · should-fix · m3-05** — **half the SMT framework is missing.** The lesson
presents two symmetrical rows and two non-symmetrical rows, but *both*
non-symmetrical rows are dollar-**bullish** variants (they restate the same
slide, once from the dollar's side and once from the case study's). The
transcript's fourth condition is dropped entirely:

> *"when the dollar index **fails to make a higher high** while foreign
> currencies make a lower low… that means there's underlying weakness… they'll
> rally the market higher, the dollar index will sell off which would support
> foreign currency long positions"* (`Institutional Market Structure.txt:156-183`)

So the reader gets no rule for spotting a dollar **top**. This is the same
one-sidedness as **A8** (m1-06 buy-side only), and it matters more here because
SMT is presented as a symmetric four-cell table — the missing cell is
conspicuous by the table's own logic.

**C10 · should-fix · m3-07** — **the buy-side phantom play is missing.** The
lesson's "Phantom Play" section is entirely a sell setup. ICT gives the long
mirror in full — a whole slide plus a worked example:

> *"between the high formed at Point number two and point number three, the low
> in between those two points I'm going to be aiming for a reason to be a buyer
> down there… I'm looking for a bullish order block at that low in between the
> two points… **or I will accept a break just below that low for a turtle soup
> long entry**"* (221-259, worked at 457-503)

The lesson's only nod is a half-clause in an earlier bullet ("sell stops rest
below point 2 of a bullish/rising one"). A reader is taught to fade rising
trendlines and left with nothing for falling ones.

**C11 · should-fix · m3-08** — the **real-vs-trap filter** is dropped. ICT names
the diagnostic twice, once per pattern: these patterns *"generally… form
**genuinely at intermediate or long-term highs only**, and due to the low
understanding of most retail traders they tend to seek these classic topping
patterns **on lower time frames**… and many times at a significant low in price,
but they marry the pattern"* (38-46, mirrored at 78-91). That is the whole
answer to "when is this pattern real and when is it bait" — the question a
reader will actually have — and the lesson never poses it.

**C12 · nit · m3-03** — the concrete entry offset is dropped, though ICT states
it three times while walking the chart: *"five pips added to the level you could
be a buyer at that point"* (929-930), *"add five pips to that level we could be a
buyer"* (973-976). The lesson gives the level but not how to price the entry off
it.

**C13 · nit · m3-01** — the **breaker tiebreak** is dropped: *"this breaker is
lower than this one here so we're gonna have to refer to that one here"*
(1036-1040), which the note page independently records (*"He uses that breaker
because its lower then the other one"*). Notable because m3-04 *does* carry the
exactly parallel orderblock tiebreak (larger body wins), so the omission looks
like an oversight rather than a choice.

**C14 · nit · m3-01** — two drops from a 1,427-line transcript: the whole
**contrarian-trader** passage (445-493 — trading reversal patterns at market
extremes, capitulation, and the short-term version "we may go above a previous
month's high and that may be a really good selling scenario"), and *"exits by
2 pm New York time"* (502) from the day-trading row of the timeframe table.

**C15 · nit · m3-08** — two execution details dropped: the **measured move**
(neckline-to-head subtracted from the neckline, 25-30, worked at 259-273) which
is precisely *why* retail's stops sit where they do, and *"you can actually take
your **first profit at the right shoulder** on both these patterns"* (207-209).

#### Consistency

**C16 · nit · three lessons — "the notes" cited for things the notes don't
contain.** Three callouts attribute material to ICT's notes that appears only in
the transcripts:

| Lesson | Claim | Actually from |
|---|---|---|
| [m3-02:23](../content/s1-ict-core/m3/m3-02/lesson.html#L23) | "the notes map EURUSD mid-2008 → mid-2012 this way" | transcript 330-333 |
| [m3-04:17](../content/s1-ict-core/m3/m3-04/lesson.html#L17) | "From the notes' examples" (10326/10628, 13080, 7005) | transcript 209-273 |
| [m3-05:28](../content/s1-ict-core/m3/m3-05/lesson.html#L28) | "The notes also show installing an MT4 overlay chart-line indicator" | transcript 399-481 |

All three claims are **true of the source material** — this is a citation-label
problem, not a §1 breach. m3-05's is the furthest off: ICT posted those MT4
indicators to the *mentorship forum thread*, not to any notes (*"here we are over
at the ICT monthly mentorship forum… i gave you several MT4 indicators today"*,
401-408). Simplest fix is to say "the source"/"the lesson video" rather than
naming the wrong artefact.

**Otherwise clean.** All 8 lessons carry `data-month="m3"`; ids are `m3-NN`; all
8 slugs match their id prefix; no `(L4)`-style cross-references appear. **All 8
note pages' chart counts match `images/` exactly** — 8 / 9 / 23 / 10 / 14 / 3 /
13 / 11, 1:1 and in order, with no chart-free lessons in this month. `build.py`
and `verify.py` pass, 0 JS errors.

#### Quiz quality

**23 of 25 questions are source-traceable.** The two exceptions are both in
m3-07: **q4** (the invented triangle mechanism, **C2**) and, more mildly, q1,
whose `e` repeats the manufactured quotation from **C3**. Everything else —
including all five of m3-06's and all four of m3-08's — checks out against the
lesson's own transcript or note page.

**C17 · A10 re-measured — the tell is real but was overstated.** Re-running the
A10 script surfaced a counting choice worth correcting: it scored a **tie** for
longest as "correct = longest", and a tie is not a tell. Three columns, so the
difference is visible: *ties-counted* reproduces A10's published table exactly;
*strict* requires the correct option to be **uniquely** longest; *expected score*
is what the guesser actually gets (click the longest, break ties at random).

| Batch | n | ties-counted (A10) | strict | expected score |
|---|---|---|---|---|
| m1 | 39 | 31 (79%) | 28 (72%) | 76% |
| m2 | 37 | 27 (73%) | 24 (65%) | 68% |
| **m3** | 25 | 18 (72%) | **13 (52%)** | **61%** |
| m4 | 44 | 41 (93%) | 38 (86%) | **90%** |
| S1 exam | 45 | 25 (56%) | 14 (31%) | 42% |
| p1–p6 | 306 | 153 (50%) | 111 (36%) | 43% |
| S2 exam | 40 | 22 (55%) | 15 (38%) | 45% |
| **All** | **536** | **317 (59%)** | **243 (45%)** | **52%** |

**A10's conclusion survives** — 52% against a 25% chance is a strong tell, Month
4 is still the outlier at 90%, and Section 1 is still much worse than Section 2.
Two claims need softening: the corpus headline is **52%, not 59%**, and — a
useful reassurance — **neither exam is guessable past its own 80% pass mark**
(S1 42%, S2 45%).

**Month 3 is the best-constructed month in Section 1 so far**, and the gap
between its loose (72%) and strict (52%) numbers is the largest of any batch —
i.e. five of its questions were being counted against it for ties that give
nothing away. The reason is a technique worth naming and copying: **mirror-pair
distractors**, where the wrong option is the correct one with the terms swapped,
so the two are identical in length by construction.

- [`m3-02/quiz.js:2`](../content/s1-ict-core/m3/m3-02/quiz.js#L2) — `"Bodies — wicks are retail"` (25) vs `"Wicks — bodies are retail"` (25).
- [`m3-06/quiz.js:2`](../content/s1-ict-core/m3/m3-06/quiz.js#L2) — `"Dollar up, bonds down"` (21) vs `"Dollar down, bonds up"` (21).

Both register as spread > 10 only because of the short throwaway options beside
them (`"Neither"`, `"Both up"`), which is a separate and much smaller problem.
Also well balanced: m3-06 q4 (28/28/29/30, spread 2), m3-07 q2 (13/13/14/16),
m3-05 q1 (11/12/14/14), m3-07 q3 (24/24/24/28), m3-08 q1 (16/19/19/21).

Only two questions in the month are genuinely conspicuous:

- **[`m3-08/quiz.js:5`](../content/s1-ict-core/m3/m3-08/quiz.js#L5)** — spread **20**: correct `"The HTF premium/discount array"` (30) against `"The volume"` (10). Worst in Month 3.
- **[`m3-01/quiz.js:2`](../content/s1-ict-core/m3/m3-01/quiz.js#L2)** — spread 16: correct `"Orderblocks, stop runs, liquidity voids"` (39) against `"Doji, hammer, engulfing"` (23).

#### C18 — Quiz-count verdict for Month 3: **it is a defect** (for 4 of 8 lessons)

Batches A and B ruled the thin counts *not* a defect for Months 1–2, because
they tracked how much material each lesson carried. **Month 3 breaks that
defence: the counts run inverse to the material.**

| Lesson | Transcript lines | Charts | Quiz Qs | |
|---|---|---|---|---|
| m3-01 | **1427** | 8 | **2** | under-tested |
| m3-02 | 854 | 9 | 3 | ok |
| m3-03 | **1245** | **23** | **3** | under-tested |
| m3-04 | 331 | 10 | **2** | under-tested |
| m3-05 | 536 | 14 | **2** | under-tested |
| m3-06 | 525 | 3 | 5 | generous |
| m3-07 | 572 | 13 | 4 | ok |
| m3-08 | 477 | 11 | 4 | ok |

The two longest teachings in the month (m3-01 at 1,427 lines, m3-03 at 1,245
lines and 23 charts) carry the two smallest question counts, while the shortest
(m3-06, 525 lines and 3 charts) carries the most. That is not proportionality.

What actually goes untested:

- **m3-01 (2 Qs)** — the timeframe→trading-style table is the lesson's largest block and nothing touches it; nor "start on the daily whatever you intend to become", money velocity, or the 13-months-to-set-up / 6-months-to-unfold asymmetry.
- **m3-03 (3 Qs, 23 charts)** — the **4-criteria checklist for a long**, the **4 stages of a price swing**, "don't hunt reversals or divergences at each old high", and the market-structure-shift rule (price will not return to the origin) are all absent. The three questions cover a definition, the lethargy test and the midnight-NY open.
- **m3-04 (2 Qs)** — neither the bearish mirror nor the larger-body tiebreak, which are 2 of the lesson's 4 stated rules.
- **m3-05 (2 Qs)** — the symmetrical-market warning (*"stalking reversal patterns in this condition is NOT high probability — avoid it altogether"*) is the most actionable rule in the lesson and is untested.

*Recommendation:* a floor of **4 questions** for any lesson carrying a
multi-step procedure or a rules table, which would mean +2 each for m3-01,
m3-04 and m3-05 and +1–3 for m3-03. The material to write them from is already
in the lessons — no new sourcing needed. Carry this test forward into batches D
and E, where 9 more lessons sit at 2–3 questions.

#### Noted, not a finding

**m3-06 asks not to be published — resolved, no action.** ICT closes the lesson:
*"keep it close to your vest, in other words **don't share it with the general
public**… please please don't make a common knowledge"*
(`Macro Economic To Micro Technical.txt:498-524`), the only such request in
Month 3. **Owner's answer (2026-08-07): moot.** The request was made to a
private mentorship cohort; ICT has since published the mentorship on his own
YouTube channel, so the material is public by his own act — and each lesson here
links back to his video (`CLAUDE.md` §3). Recorded so later batches don't
re-raise it if the line recurs.

---

## Fixed in flight

Genuinely-broken things repaired during the audit rather than logged.

_None yet._ Batch A found nothing broken: `build.py` and `verify.py` both pass,
the page has 0 JS errors, all Month 1 HTML is well-formed, and every video link
spot-checked resolves to the right video.

---

## Method notes

- **Per batch:** read only that batch's lessons, quizzes, **notes and
  transcripts**, then log findings here with file/line refs and a severity.
  Sources outside the current batch are deliberately not read — they are large
  and would exhaust context.
- **Both sources, always.** §1 permits ICT's notes *and* the transcripts. Batch A
  was first run against transcripts alone and produced a false positive (A1) as a
  direct result. For Sections 1 and 2 alike, **fetch/read that batch's notes
  first** — they are short, they are what the lesson was most likely written
  from, and they resolve most "is this invented?" questions in one line.
- **Fetching Section 1 notes** (batches B-E): use the Notion connector against
  `https://cobalt-sight-9b7.notion.site/<page-id>`, taking page IDs from
  [`notes/ict-core/INDEX.md`](../notes/ict-core/INDEX.md). WebFetch will not work
  (SPA shell) and the `app.notion.com/p/<id>` form 404s. Strip the presigned S3
  image URLs when saving — they expire in 5 minutes and are enormous; keep an
  `![chart NN]` placeholder so counts and layout survive, which is what makes the
  notes-vs-`images/` cross-check in A12 possible.
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
