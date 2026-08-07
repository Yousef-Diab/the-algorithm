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
| C | S1 · Month 3 | m3-01 … m3-08 (8) | 25 | ☐ fetch notes first |
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
