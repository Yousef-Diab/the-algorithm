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
| D | S1 · Month 4a | m4-01 … m4-07 (7) | 24 | ☑ 2026-08-07 (notes + transcripts) |
| E | S1 · Month 4b | m4-08 … m4-14 (7) | 20 | ☑ 2026-08-07 (notes + transcripts) |
| F | S1 · summary + exam | `summary.html`, `exam.js` | 45 | ☑ 2026-08-07 (lessons + findings A–E) |
| G | S2 · Part 1 | p1-01 … p1-07 (7) | 44 | ☑ 2026-08-07 (notes + transcripts) |
| H | S2 · Part 2 | p2-01 … p2-06 (6) | 49 | ☑ 2026-08-08 (notes + transcripts) |
| I | S2 · Part 3 | p3-01 … p3-06 (6) | 47 | ☑ 2026-08-08 (notes + transcripts) |
| J | S2 · Part 4 | p4-01 … p4-06 (6) | 45 | ☑ 2026-08-08 (notes + transcripts) |
| K | S2 · Part 5 | p5-01 … p5-07 (7) | 57 | ☑ 2026-08-08 (notes + transcripts) |
| L | S2 · Part 6 | p6-01 … p6-08 (8) | 64 | ☑ 2026-08-08 (notes + transcripts) |
| M | S2 · summary + exam | `summary.html`, `exam.js` | 40 | ☑ 2026-08-08 (all 40 lessons) |
| N | Cross-cutting sweep | terminology, cross-refs, slugs, `data-month`, reconciliation | — | ☑ 2026-08-08 (all 160 content files) |

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
>
> **Verdict (batch D): the same defect, in three more lessons** — see **D14**.
> m4-06 is the worst case in Section 1 so far (longest transcript in its month,
> joint-lowest question count, its entire bullish mirror untested); m4-04 and
> m4-05 also sit below C18's floor of 4, each with half the lesson untested.
> m4-01, m4-02 and m4-07 are proportionate.
>
> **Verdict (batch E), and Section 1 is now complete on this question: four more
> lessons** — see **E18**. Month 4b's counts are not *inverse* to the material as
> Month 3's and Month 4a's were, they are simply **uncorrelated** with it: the
> second-longest transcript in the month (m4-10, 531 lines) carries the same two
> questions as the shortest (m4-08, 211 lines). m4-10 and m4-11 are the worst
> cases, and m4-11's is compounded by **E1** — one of its two questions tests an
> incorrect definition, leaving effectively one working question for an 8-chart
> lesson. m4-09 and m4-13 are fine.
>
> **Section 1 total: 11 of 38 lessons are under-tested** on C18's floor —
> m3-01, m3-03, m3-04, m3-05, m4-04, m4-05, m4-06, m4-10, m4-11, m4-12, m4-14 —
> plus m4-03 and m4-08 at the margin. All of Months 1–2 are proportionate, so
> this is entirely a Months 3–4 defect, as the first pass suspected.

**~~S1 · `p3-01` slug with no images.~~ → RESOLVED (batch I, fixed in flight).**
*`build.py` warned that `content/s2-2022-mentorship/p3/p3-01` declared
`data-slug="p3-01-a-requested-execution-the-model-in-real-time"` but no matching
PNGs existed, so nothing rendered.* **The slot was spurious, not a scrape gap** —
`ep-14.md` has 0 image references and `raw/ep-14-*.png` is empty, so episode 14
genuinely has no charts. The slot was replaced with the Section 2 no-charts
comment; the warning is gone and `image sets` is unchanged at 67. See
*Fixed in flight*.

**Lessons with no `.fig-slot` at all** (no charts in the source): m1-04, m1-05,
m1-06, m1-08, m2-03, m2-05, p5-01 — plus p1-01, p2-01, p2-04 and now **p3-01**,
which omit it too but *annotate* the omission with an HTML comment. Section 1
omits silently. Cosmetic inconsistency; confirm per batch that the source
genuinely has no charts. **Confirmed for every Section 2 lesson through Part 5**
(batches G, H, I, K): each chart-free lesson is chart-free in ICT's own notes.
**p5-01 is the last one and the most thoroughly confirmed** — episode 26 has no
`ep-26.md` at all, no `raw/ep-26-*.png` and no `images/p5-01-*.png` (**K17**). It
is the only Section 2 lesson that omits the slot *and* the annotating comment, so
it is the single remaining site for that cosmetic fix.

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

**A8 · nit · FIXED · m1-06** — buy-side only. The transcript's sell-side mirror is
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

**A10 · should-fix · FIXED · corpus-wide, surfaced in Month 1** — **option length gives
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

> **Correction, batch D — this fix shape is right for Month 1 and wrong for
> Month 4.** It treats the tell as *conspicuousness* (one long option beside
> short throwaways), which is Month 1's problem: 35% of its questions have a
> spread over 10 characters. Month 4 has the **highest** tell in the corpus (86%
> strict, 90% expected score) and the **lowest** spread of any Section 1 month
> (18%) — its options are already comparable, and the correct one merely wins by
> a median of **3 characters**. Balancing spread would barely dent it. See
> **D15** for the measurement and the technique that does work.
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

**B1 · should-fix · FIXED · [m2-02/lesson.html:22](../content/s1-ict-core/m2/m2-02/lesson.html#L22)** —
*"the same move that gives the hourly trader 1:1 gives you 3:1"* is not in the
source, and it is wrong at the point being described. ICT's actual claim is
narrower: *"as we hit the entry that would be assumed on the hourly chart at that
7542 level, we're hitting that level here with lower risk and we're getting a
3 to 1 reward ratio"* (`Framing Low Risk Trade Setups.txt:209-217`). At the
moment price reaches 7542 the hourly trader is **being filled** — they are at
0R, not 1:1. The comparison is invented and it overstates by a full R.
*Fix:* say what ICT says — by the time the hourly entry fills, the refined trade
is already at 3R.

**B2 · should-fix · FIXED · [m2-02/lesson.html:19](../content/s1-ict-core/m2/m2-02/lesson.html#L19)** —
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

**B11 · should-fix · FIXED by Tier 4, marked in the Tier 5 pass · [m2-02/quiz.js:3](../content/s1-ict-core/m2/m2-02/quiz.js#L3)** —
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

**C1 · blocker · FIXED · [m3-08/lesson.html:18](../content/s1-ict-core/m3/m3-08/lesson.html#L18)** —
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

**C2 · blocker · FIXED · [m3-07/lesson.html:19](../content/s1-ict-core/m3/m3-07/lesson.html#L19)** —
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

**C3 · should-fix · FIXED · [m3-07/lesson.html:10](../content/s1-ict-core/m3/m3-07/lesson.html#L10)** —
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

**C4 · should-fix · FIXED · [m3-01/lesson.html:27](../content/s1-ict-core/m3/m3-01/lesson.html#L27)
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

**C9 · should-fix · FIXED · m3-05** — **half the SMT framework is missing.** The lesson
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

**C10 · should-fix · FIXED · m3-07** — **the buy-side phantom play is missing.** The
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

#### C18 · should-fix · FIXED — Quiz-count verdict for Month 3: **it is a defect** (for 4 of 8 lessons)

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

### Batch D — Section 1, Month 4a (m4-01 … m4-07)

Sources read: the 7 matching `transcripts/Month 4/*.txt` **and** all 7
`notes/ict-core/m4-NN.md` (fetched from Notion at the start of this batch).
m4-08 … m4-14 deliberately not read — they are batch E.

**Headline: fidelity is the best of any Section 1 batch so far, and the quiz
problem is worse and differently shaped than expected.** Every substantive claim
across the seven lessons traces to that lesson's own transcript or note page,
usually to a line — m4-03 reproduces ICT's entire orderblock procedure (twelve
separate rules) without a slip, and m4-02's whole pip-goal table checks out
number by number against lines 788-919. There is **one** fidelity finding in the
batch (**D1**) and it is a should-fix, not a blocker. Batch C's warning that thin
note pages predict invented mechanism **did not reproduce**: m4-05 and m4-07 have
the two thinnest note pages in the month (five lines of prose each) and both
lessons are clean, because their transcripts are tightly structured.

The real defects are elsewhere. Coverage is the weak dimension — six substantive
omissions, including **m4-02 never defining internal/external range liquidity**,
the two words its own bullets lean on. And **A10's option-length tell is
confirmed as Month 4's outstanding problem but its shape is not what A10 and C17
described** — see **D15**, which corrects the recommended fix.

#### Content fidelity (§1)

**D1 · should-fix · FIXED · [m4-05/lesson.html:26](../content/s1-ict-core/m4/m4-05/lesson.html#L26)** —
*"A breaker uses the **entire candle range and the bodies**."* These are two
different rules and the lesson asserts both in one clause. The transcript states
only the first, and states it as a deliberate choice:

> *"it's trading inside the range that's created with this last up candle **why
> am i using this one and not this one here because this one was the highest one
> prior to the drop down and we're using the entire range**"*
> (`ICT Breaker Block.txt:230-236`)

"and the bodies" traces to exactly one line, in the note page — *"ICT also likes
to use the bodies of the breaker, instead of the whole candle, **thats what i saw
in another video**"* (`notes/ict-core/m4-05.md`). The note-taker is flagging it as
an import from a **different teaching**, and the word *instead* makes it an
alternative to the entire-range rule, not an addition to it. The lesson joins the
two with "and", so a reader is told to use the whole candle and the bodies at the
same time. [`m4-05/quiz.js:3`](../content/s1-ict-core/m4/m4-05/quiz.js#L3)'s `e`
repeats the merged phrase.
*Fix:* say "the entire candle range", per this lesson's transcript. If the body
variant is worth keeping, mark it as the alternative the note calls it.

**D2 · nit · [m4-07/lesson.html:12](../content/s1-ict-core/m4/m4-07/lesson.html#L12)** —
the quoted phrase *"like X-ray vision"* is attached to the **buy** model (old
sell-side *down* candles being reclaimed). ICT says it in the **sell** model, of
*up* candles: *"we can match that up and see it **like x-ray vision** into price
action by looking at every single up candle that has a small displacement"*
(`Reclaimed ICT Orderblock.txt:205-209`). The technique is symmetric so nothing
is taught wrongly; it is a verbatim quotation moved to its mirror.

#### Coverage gaps

**D3 · should-fix · m4-02** — **the lesson never defines internal or external
range liquidity.** Both terms appear in its first two bullets and carry the
entire lesson, and the reader is given only two parentheticals — "(e.g. an
orderblock)" and "(old highs/lows)". The transcript opens with the definitions,
as its first thirty lines:

> *"external range liquidity — the current trading range will have buy side
> liquidity above the range high… sell side liquidity below the range low…
> secondly we have internal range of liquidity — when the current trading range
> is likely to remain, liquidity voids will fill in… fair value gaps will also
> fill in… order blocks inside the trading range will be populated with new buys
> and or sells"* (`Reinforcing Liquidity Concepts & Price Delivery.txt:7-46`)

Notably the definition of *internal* is broader than the lesson's usage: it is
voids, FVGs **and** orderblocks, not just orderblocks.

**D4 · should-fix · m4-02** — **the timeframe-relativity of the two, which is the
module's central idea, is absent.** The same run is external on one chart and
internal on another:

> *"every time we create a new higher high… **that is a run on external range
> liquidity on this time frame being the daily, but on the monthly chart it's
> still internal range liquidity** because you're just inside of a larger monthly
> range"* (249-260)

The note page carries it independently and just as plainly — *"We can run
external range liquidity on the daily but on the monthly it can still be
internal"* (`notes/ict-core/m4-02.md`). **In both of ICT's records and in neither
the lesson nor its quiz.** Without it, the lesson's "entries internal, exits
external" rule reads as a property of price levels rather than of the timeframe
you framed them on, and a reader has no way to reconcile "exit at external
liquidity" with "hold for the monthly objective".

**D5 · should-fix · m4-01** — **the transmission mechanism is missing: the lesson
never says how interest rates actually move the dollar.** It asserts rates are
the #1 driver and then teaches only the divergence pattern. ICT closes the
chain, twice, and the second time flags the trap that the charts are *bond
prices*, not rates:

> *"if the interest rate markets are dropping lower that means interest rates are
> going to go higher which means the interest rate is going to drive the dollar
> index higher; if the dollar index is going to go higher that's going to drive
> foreign currencies lower"* (459-466)
>
> *"as these interest rates on charts **as they move up or trend higher that's
> actually interest rates declining** and that's going to be bearish for dollar"*
> (533-538)

This is the one thing in the lesson a reader cannot reconstruct for themselves,
and the inversion is a genuine tripwire — a chart of the 30-year going up means
rates going *down*. The lesson's kv table and rule callout both talk about the
triad "making higher highs" with no note that this is price, not yield.

**D6 · should-fix · m4-03** — **the liquidity-based bias block is compressed to a
single clause.** The lesson says only "always in the direction of the
monthly/weekly/daily bias". The transcript spends ~120 lines (324-448) building
the rule set that clause stands in for, and two parts of it are actionable and
absent:

- **Where the target comes from.** *"you want to be primarily looking to see
  what's near term on the daily chart, what liquidity is resting on that daily
  chart… and then preferably look for something in the weekly chart that would
  support even higher, because if you have something higher on the weekly chart
  you probably will have a lot better odds"* (358-441). The lesson tells the
  reader to exit into external range liquidity but never how to pick which one.
- **The hierarchy between the three timeframes.** *"the daily chart is the most
  dynamic of these three… that weekly chart will have a lot longer time period
  required to change direction versus the daily chart that can go up and down
  multiple times and still maintain the bearish nature of the weekly and the
  monthly"* (373-393) — i.e. why a daily reversal does not invalidate the bias.

**D7 · should-fix · m4-03** — **the scale-out-and-add-back technique is dropped
entirely.** The lesson's only exit guidance is "exit into external range
liquidity". ICT works a three-stage exit and re-entry:

> *"even after taking this level out here you can **take partial profits** out
> here… take a little bit more profits out at an old **weekly high** here… and
> then **leave a little bit on**, and when price comes back down we can now **add
> back on the positions we took off** here and here, add them here as new longs"*
> (804-818)

This is the one place in Month 4 that describes managing a position after entry
rather than opening one.

**D8 · should-fix · m4-06** — **the turtle-soup contrast that motivates the whole
lesson is absent.** ICT spends the first quarter of the transcript (22-320)
establishing the familiar pattern — false breaks at major highs and lows, turtle
soup long and turtle soup sell — precisely so he can then say the rejection block
is *"a different approach to looking at distribution and accumulation"* (346-352)
for the case where price never makes the new high or low:

> *"some of you probably understand that higher high failure swing and lower low
> failure swing, or turtle soup long and turtle soup sell — **some of you
> probably aren't aware that there are other distribution and accumulation
> patterns that take place at highs and lows**"* (250-274)

The lesson opens straight into the rejection block. Its "No higher high is
required" clause is the residue of the contrast, but the reader is never told
what the rejection block is an alternative *to*, which is the question "when do I
use this instead of a turtle soup?"

**D9 · nit · m4-06** — the rejection block as a **profit target**, not just an
entry, is dropped: *"we can anticipate levels like this to be taking profits at
if we're short… we could look at the take profit objectives to be **covering the
short just below the lowest open or close in the previous swing low**"*
(1111-1138). The lesson gives three entry choices and no exit use. Its sibling
m4-03 *does* carry the equivalent (bearish OBs as profit-taking targets), so the
omission reads as an oversight — the same shape as **C13**.

**D10 · nit · m4-05** — the patience filter before the breaker confirms:
*"initially it may come up and flirt with that same old low and give an
indication it may want to view that as a resistance price point — **we're more
inclined to wait to see if it wants to show a real significant price move
higher**"* (19-25). The lesson jumps to the confirmed structure shift.

**D11 · nit · m4-04** — two drops. (a) There is **no time limit** on the setup:
*"there's no rule as to how long it takes before that low is violated, we just
note it and when it's broken it's seen as a short-term support level that's given
way"* (100-106) — a reader will ask this. (b) The exit discipline once the target
is reached — *"we would be **collapsing our trade and moving to the sidelines
waiting for new developments**"* (199-201), which the note page records verbatim
(*"Collapse the trade and wait for new developments"*). In both sources.

**D12 · nit · m4-01** — the caveat that one divergence is not always enough:
*"cable failed to make a higher high when euro dollar made the higher high and
dollar made the lower low, so it's not always just simply looking for a
divergence in one specific location or one asset — **you have to blend a couple
things sometimes** to get to understanding what the smart money is doing"*
(435-444). Also in the notes (*"You have to blend a couple things sometimes to
know what smart money is doing, so multiple assets"*). The lesson's rule callout
presents the green light as a single clean test.

**D13 · nit · PARTLY FIXED — the bearish mirror only; the other two drops stand · m4-02** — three smaller drops: the fallback *"if you can't
ascertain where the market's going on a monthly you just simply drop down into a
weekly chart"* (704-707, also in the notes); the position-trader passage where
the same orderblock is revisited three or four times while the position is built,
averaging 113.25-113.50 (396-412); and the bearish mirror of the whole method
(960-976) — the lesson is buy-side only, the same one-sidedness as **A8** and
**C9**, though milder here because the mechanism is plainly symmetric.

#### Quiz quality

**All 24 questions are source-traceable.** Every correct option and every `e`
checks out against that lesson's own transcript or note page — no repeat of
**C2**, where an explanation restated an invention. The one wobble is
`m4-05/quiz.js:3`'s `e`, which inherits **D1**'s merged phrase from the lesson.

**D14 · should-fix · FIXED — the quiz counts are again inverse to the material, for three
lessons.** Carrying **C18**'s test forward (a floor of 4 questions for any lesson
with a multi-step procedure or a rules table):

| Lesson | Transcript lines | Charts | Quiz Qs | |
|---|---|---|---|---|
| m4-01 | 553 | 11 | 4 | ok |
| m4-02 | **1078** | 5 | 4 | ok |
| m4-03 | 962 | **20** | 4 | at floor, thinnest per unit of material |
| m4-04 | 339 | 15 | **3** | under-tested |
| m4-05 | 253 | 15 | **3** | under-tested |
| m4-06 | **1197** | 13 | **3** | **worst in the batch** |
| m4-07 | 299 | 5 | 3 | ok |

- **m4-06 (3 Qs)** — the longest transcript in Month 4 and the joint-lowest
  question count. The **entire bullish mirror** goes untested, as do two of the
  three entry choices (only "sell on weakness" is asked) and the closing rule
  that a wicky old high is swept at the **bodies**, not the wicks.
- **m4-04 (3 Qs)** — the stop placement, the target (the liquidity void's mean
  threshold) and the "buyer's remorse" / support-turns-resistance mechanic are
  all untested; the three questions cover the structure shift, the A-B-C return
  and the body rule.
- **m4-05 (3 Qs)** — all three questions are the bullish breaker or generic. The
  **bearish breaker**, which is half the lesson, is untested.
- **m4-03 (4 Qs)** — at the floor, but it carries twelve stated rules across
  three blocks. Untested: the 5-pip spread add, stop placement, raising to 50%,
  the internal→external pairing, the stop-run/bigger-block substitution, the
  top-down refinement, and the bearish-OB profit-taking rule.

*Recommendation:* +1 each for m4-04, m4-05 and m4-06 (m4-06 arguably +2), and +2
for m4-03. As in **C18**, the material is already in the lessons — no new
sourcing needed.

#### D15 — A10/C17 re-measured on Month 4: the tell is confirmed, but the fix A10 prescribed will not remove it

Month 4 is the corpus outlier, as A10 said and C17 restated: **86% strict** (the
correct option is uniquely the longest in 38 of 44), and a reader who knows
nothing and always clicks the longest scores **90%** — past the 80% exam pass
mark, against a corpus average of 52%. Batch D's own seven lessons are 20/24
(83%) for an **88%** expected score. All confirmed; nothing to correct there.

**What is wrong is the diagnosis of *why*, and therefore the fix.** A10 read the
tell as conspicuousness — one long correct option beside short throwaway
distractors ("It doesn't", "Guess", "Random") — and prescribed *"trim the correct
option and inflate the terse distractors"*. That is Month **1**'s problem. It is
not Month 4's. Measured side by side, the two months are near-opposites:

| | correct uniquely longest | spread > 10 chars | median margin over 2nd-longest |
|---|---|---|---|
| m1 | 71% | **35%** | 5 |
| m2 | 64% | 27% | 4 |
| m3 | 52% | 24% | 4 |
| **m4** | **86%** | **18%** *(lowest in Section 1)* | **3** *(26 of 38 within 4 chars)* |

**Month 4 has the highest tell in the corpus and the *smallest* spread of any
Section 1 month.** Its options are not lopsided; they are tidy. m4-03 q1 runs
25 / 30 / 31 / 34, m4-05 q1 runs 24 / 26 / 29 / 32, m4-04 q3 runs 17 / 20 / 23 /
24 — four comparable phrases each time, and the correct one on top by three
characters, over and over. Nothing looks wrong to a reader eyeballing a single
question; the signal only exists across the set.

The consequence matters for any fix: **`CLAUDE.md` §3's rule — "keep all four
options comparable in length (aim within ~5 characters)" — is necessary but not
sufficient, and Month 4 is the proof.** Most of these questions already satisfy
it, or come close, and are still a 90% giveaway. Balancing the spread would leave
the tell almost untouched.

*Fix shape for Month 4 (superseding A10's for this month):* the correct option
must not be **reliably at the top of the sorted order**, which means at least
some questions need the correct option written *shorter* than a distractor, not
merely comparable. The cheapest route is the technique **C17** identified in
Month 3 — **mirror-pair distractors**, where the wrong option is the correct one
with its terms swapped, so the two match by construction and no margin exists to
read. Month 4 is unusually well suited to it, being fourteen definitional lessons
whose concepts come in mirrored pairs. Three that would take the treatment
directly:

- `m4-05/quiz.js:2` — `"Old low swept, swing high broken"` (32) invites
  `"Old high swept, swing low broken"` (32) as the distractor. That is the actual
  bearish breaker, so it is a *better* distractor than the present
  `"An old high gets taken out"` (26), and it kills the margin.
- `m4-02/quiz.js:2` — `"Entries internal, exits external"` (32) already has its
  mirror `"Entries external, exits internal"` (32) as option 0. **This is the one
  question in the batch with no margin at all** and it got there for free.
- `m4-06/quiz.js:2` — `"Highest wick to highest body"` (28) mirrors to
  `"Highest body to highest wick"` (28).

**Also worth copying:** `m4-07/quiz.js:4` (21 / 22 / 23 / 24 — correct is neither
longest nor shortest) and `m4-06/quiz.js:4` (5 / 12 / 12 / 14 — the correct
`"Distribution"` ties with a distractor). Two of the four questions in the batch
that a longest-clicker gets wrong are in m4-07 and m4-06, so the technique is
already present in the batch and just needs applying consistently.

#### Consistency

**D16 — the mean-threshold thread (B12 → C8) closes here, in the lesson's
favour.** m4-03 gives the fourth and by far the most precise rendering, and it
**agrees** with the notes' body reading that m2-07 and m3-02 pointed to:

> *"the best orderblocks will not see price trade down below the midway point of
> **the entire body of the candle** — you're going to measure the open to the
> close on the down candle to measure where the middle of it is, **do not use the
> wicks**, don't use the very high or the very low"* (`Orderblocks.txt:247-273`)

and the note page independently: *"50% measured from the body open to close, the
mean threshold"* (`notes/ict-core/m4-03.md`). The lesson reproduces it exactly —
*"the 50% mean threshold (measured open-to-close, not the wicks)"* — including
ICT's tolerance that *"it can stab through it just by a little bit"*.

So all four renderings describe the same measure, and **m4-03 is the canonical
one**. The single cross-reference B12 proposed should therefore point *here*:
add one clause to m2-04 ("the middle of the down candle") and m3-02 ("the middle
of the orderblock candle") noting the measure is **body open-to-close, not the
wicks — see m4-03**. That closes three lessons with one edit and needs no new
sourcing. (m4-04's *"mean threshold of a liquidity void"* is a different object —
the midpoint of a void, not of a candle — and is correct as written.)

**Otherwise clean.** All 7 lessons carry `data-month="m4"`; ids are `m4-NN`; all
7 slugs match their id prefix; no `(L4)`-style cross-references appear. **All 7
note pages' chart counts match `images/` exactly** — 11 / 5 / 20 / 15 / 15 / 13 /
5, 1:1 and in order, with no chart-free lessons. `build.py` and `verify.py` pass,
0 JS errors.

#### Noted, not a finding

**Thin note pages did *not* predict invented mechanism this time.** Batch C's
lead — that m3-07 and m3-08's blockers both landed in lessons with nearly empty
note pages — was checked first and does not reproduce. m4-05 (15 charts, five
lines of prose) and m4-07 (5 charts, four lines, and it never defines "reclaimed
orderblock" in prose at all) are the two thinnest pages in Month 4, and both
lessons are faithful. The difference looks like the transcript: Month 3's trap
lessons trail off into asides, while `ICT Breaker Block.txt` and
`Reclaimed ICT Orderblock.txt` are short, tightly structured and give the
definition twice each. Thin notes are a reason to read the transcript harder, not
a predictor on their own.

**m4-03 silently resolves an ambiguity in the notes, correctly.** The note page
reads *"ICT wants to see 2/3 rallies away, so 2/3 the size of the orderblock"* —
which reads as the fraction two-thirds. The transcript settles it: *"what i like
to look for is **two to three heights or the range** if you will of the order
block, i want to see **at least two to three times that** as a rally away"*
(741-776). The lesson has "a rally of **2–3×** the orderblock's body height",
which is right, and the quiz `e` agrees. Same shape as m2-04's silently-corrected
position-sizing formula — flagging for visibility, not repair.

**m4-04's "No higher high needed" is sourced, just not from m4-04.** Its own
transcript says only *"it's a failure swing with a confirmation break in market
structure"* (61-62); the explicit statement lives two lessons later — *"price
does not need to make a higher high to have a failure swing"*
(`ICT Rejection Block.txt:544-550`). Since a failure swing means exactly that,
and the source is inside the same month, this is a fair gloss rather than an
**A2**-style import. No action.

**Every question in Section 1 marks `a:1`; every question in Section 2 and both
exams marks `a:0`.** Mechanically confirmed across all 536 questions (m1 and m2
have 9 exceptions between them). This is an authoring template showing through
and it is **harmless** — the renderer Fisher-Yates shuffles options at render
time, so `a` sets no on-screen position (§3). Recorded so a later batch does not
mistake it for a tell.

### Batch E — Section 1, Month 4b (m4-08 … m4-14)

Sources read: the 7 matching `transcripts/Month 4/*.txt` **and** all 7
`notes/ict-core/m4-NN.md` (fetched from Notion at the start of this batch).
m4-01 … m4-07 deliberately not re-read — they are batch D, cited rather than
re-checked. The one exception is a 28-line window of `Orderblocks.txt` (132-159)
read to verify the forward reference in **E7**.

**Headline: five of the seven lessons are as faithful as batch D, and the sixth
contains the audit's third blocker.** m4-12, m4-13 and m4-14 are excellent —
m4-12 reproduces ICT's three-candle FVG framing to the pip (105.00 → 104.75,
"about 25 pips"), m4-13's whole three-step trap mechanic checks out line by line
including the "~30 pips" retail gets before the reversal, and m4-14's measured
move is right including the target being hit "off by one pip". But **m4-11
defines the liquidity void as its own opposite** (**E1**), and it does so from a
note-taker addition that post-dates the teaching by six years — the D1 pattern
again, this time landing on the definition of the lesson's title.

Coverage is once more the weak dimension, and this batch has a distinct shape:
**four of the seven lessons teach what a thing *is* and never say how to trade
it.** m4-10 gives the entry zone and the stop but never the order type or the
target; m4-11 never says the entry is the stop-run low below the void; m4-12 has
no entry technique at all; m4-13 criticises retail for having no qualified target
and then supplies none. And **the wick-vs-body question m4-03 explicitly deferred
to this stretch is answered in two of these transcripts and dropped from both
lessons** (**E7**).

On the quiz side both leads from the prompt are confirmed and neither needs
correcting: the counts are again out of proportion (**E18**) and Month 4b is
**90% strict / 92% expected score** — the worst stretch in the corpus (**E19**).

#### Content fidelity (§1)

**E1 · blocker · FIXED · [m4-11/lesson.html:9](../content/s1-ict-core/m4/m4-11/lesson.html#L9)
and [m4-11/quiz.js:2](../content/s1-ict-core/m4/m4-11/quiz.js#L2)** —
**the liquidity void is defined as its opposite.** The lesson opens: a liquidity
void is *"where absolutely **no trading took place** — e.g. a big news candle
(CPI) where **neither buyside nor sellside** was offered."* ICT's definition is
that **one** side was offered and the other was not, and he states it four times:

> *"a liquidity void is a range in price delivery where **one side** of the
> market liquidity is shown in wide or long one-sided ranges or candles"* (7-11)
>
> *"it was all on s[ell] side liquidity **only very little buying took place**
> in that rundown"* (101-103)
>
> *"remember it's a **void of buy side liquidity** that causes downward ranges
> like this which is what we call a liquidity void"* (111-114)
>
> *"again it's **the absence of buyers or buy side liquidity**"* (125-126)

The mechanism depends on it entirely: price returns to deliver the *missing*
side, and *"when it does that price action has been balanced out… it's been
offered on the down move and it's been offered on the buy move up"* (153-158).
**The lesson's own later bullets assume the correct definition and therefore
contradict its first one** — line 13 says a void is *"big candles delivered to
one side"* and line 14 says *"once both sides have been offered, price is
balanced out"*. Neither is possible if no trading took place.

Where it came from: the note page, verbatim — *"Liquidity void is where there was
absolutely no trading taking place at all… neither buyside or sellside was
offered. Take the **10-11-2022** CPI candle as example"*
(`notes/ict-core/m4-11.md`). That date is **six years after this teaching**
(transcript line 3: *"the ICT mentorship content for December 2016"*), so the
example — and the gloss built on it — is the note-taker's own, not ICT's. Same
shape as **D1**, but D1 was one clause in a rule; this is the definition of the
lesson's subject.

Why it is a blocker rather than a should-fix: *"no trading took place at all"* is
a precise description of a **gap**, which is what the **vacuum block** is —
m4-09's own transcript says *"there's absolutely no way for any trader to
execute, there's **no trade between those two price points**"* (m4-09:105-108).
So the lesson collapses the distinction between m4-09 and m4-11, two adjacent
lessons, and a reader hunting for candles where nothing traded will never
identify a liquidity void. The quiz `e` carries it and manages to
self-contradict inside one sentence: *"A liquidity void is where absolutely no
trading took place — big one-sided candles delivered to one side."*
*Fix:* use the transcript's definition (a one-sided range; a void of the *other*
side's liquidity). The lesson's remaining bullets already assume it, so this is a
two-line repair — and it doubles as the fix for **E19**'s q1 (see there).

**E2 · should-fix · FIXED · [m4-11/lesson.html:10](../content/s1-ict-core/m4/m4-11/lesson.html#L10)** —
the same source, the same error, one line later: *"Voids where there was **no
trading at all** are the best draw on liquidity."* Traceable only to the note
page (*"Liquidity voids where there was no trading at all, those are the best for
a draw on liquidity"*) and nowhere in the transcript, which makes no such ranking
claim and attaches "draw" to price rather than to liquidity — *"the ultimate
**draw on price** was to get up to that 104.76 level"* (176-177). Inherits
**E1**; §1's prefer-under-claiming would drop the superlative.

**E3 · nit · [m4-09/lesson.html:11](../content/s1-ict-core/m4/m4-09/lesson.html#L11)** —
**"breakaway" is attached to the wrong discriminator.** The lesson makes the
label depend on where the gap starts: *"A gap up from a discount after a decline
= a breakaway gap (strength). A gap after an extended rally = an exhaustion gap
/ capitulation."* The exhaustion half is exactly right (61-71). The breakaway
half is not the source's usage — ICT uses it two other ways: as a plain synonym
for the whole concept, *"a vacuum block is nothing more than a breakaway gap"*
(343-344), and specifically for a gap that **stays unfilled**, *"but if it stays
open we would label that while we're bullish as a breakaway gap and it would show
willingness and strength"* (363-367). Both readings are in the notes too. The
discount-origin setup is real and is ICT's preferred one — *"if we gap up away
from a market that's in a discount"* (82-85), and the notes say plainly *"Vacuum
block is the best when we're in a retracement on a bullish market… if we gap up
from a market that has been in discount"* — so `quiz.js:2`'s "best gap" answer
stands. Only the name has been reassigned.

**E4 · nit · [m4-08/lesson.html:9](../content/s1-ict-core/m4/m4-08/lesson.html#L9)** —
a quotation moved to its neighbour, the same shape as **D2**. The lesson calls
the propulsion candle *"highly sensitive, 'predisposed to go higher.'"* In the
transcript that clause describes the **prior** orderblock the propulsion candle
drops into, not the propulsion candle itself:

> *"what makes it propulsion is that it's already dropped back down into a[n]
> o[rder] block **that's already predisposed to go higher** / then we created
> another higher order block that touches the initial one / that new higher level
> bullish order block… will be **highly sensitive**"* (22-29)

"Highly sensitive" is correctly attributed; the quoted phrase belongs to the
block below it. Nothing is taught wrongly — the propulsion candle inherits the
bias — but it is a verbatim quote on the wrong object.

#### Coverage gaps

**E5 · should-fix · m4-11** — **the entry is missing, and it is the whole trade.**
The lesson says a void gets filled and never says where you buy. ICT's sequence
is explicit and he walks it twice: sell stops build below the short-term lows
beneath the void (*"while price is showing a short-term support level like this
what's going to be building up below those lows — **sell stops**"*, 131-137);
those stops get run (159-160); and **that run is what funds the move that closes
the void**:

> *"note again the stops that were ran below that low here right before the void
> was closed — **that low would be the buying opportunity**"* (179-183)
>
> *"that run on those [sell] stops was necessary for them to **facilitate new
> l[ong]s** so that way if they're going to take out the 104.76 they're going to
> make it worth their while, you're going to pick up some buy orders around
> 104.05"* (195-200)

The lesson's line 15 gestures at the same event but keeps only the note-taker's
colour — *"sometimes it first drops lower, **faking people out**, then fills
completely"* — where the transcript has the mechanism: it comes back down to run
the equal lows and *then* completes the fill (164-170). A reader is told a void
is a magnet and given no way to trade it.

**E6 · should-fix · m4-10** — **the order type and the exit are both absent.**
The lesson's sweep-mechanics callout says to buy under the low, but not that the
order rests there in advance:

> *"when [the] underlying market is bullish, **before** price trades under the
> recent low you're going to place a **buy limit order** just below or at the
> recent low — you're buying the sell stops like a bank trader or any other smart
> money entity would"* (232-239)

— nor the validation condition that turns the setup on (*"validation of this
setup or condition is when the low is violated… and the sell stops become market
orders to sell at market"*, 223-227). The exit is dropped too, though ICT names
it in the framework and then in all four worked examples: *"wait for a repricing
for the market to trade above an old high so we can unload that position, or
trade up into a bearish order block take profits, or trade up into a fair value
gap or a liquidity void"* (153-158), realised at 133.60 on USDCAD, at the
101.25 / 101.30 / 101.45 layers on USDCHF, and at 124.75 on cable. The lesson
carries the accumulate/distribute idea only as an aside in a "Notes" callout, not
as the exit rule. Same shape as **D9**.

**E7 · should-fix · m4-12 and m4-13** — **the wick-vs-body question m4-03
deferred to this stretch is answered in both transcripts and dropped from both
lessons.** m4-03 tells the reader *"Use wicks only where they overlap FVGs;
otherwise focus on bodies"*
([m4-03/lesson.html:16](../content/s1-ict-core/m4/m4-03/lesson.html#L16)), which
is the lesson's rendering of ICT's promise:

> *"i'm using the bodies of the candles, you may end up using the wick… and when
> we talk about wicks **i'm going to overlap order blocks with fair value gaps
> because that's going to be the answer to many of your questions as it relates
> to when do we use the wicks and when do we use the b[odies] of the candles**"*
> (`Orderblocks.txt:134-148`)

The answer arrives twice in batch E, and both times the lesson omits it:

- **m4-12**, where the FVG overlap actually happens: *"look at the bod[ies']
  close on this candle right here, the close is 104.72, that's exactly the high
  on this candle's close 104.72 — **the wick trades through the body but the
  bodies of the candle completely close in here**… this is exactly what i'm
  referring to as **efficiency in terms of the price delivery**"* (330-344). The
  gap is filled at the bodies; the wick through it does not count.
- **m4-13**, more plainly still, as a student question answered outright: *"now
  the question is going to be, Michael, do i use the high or do i use the body?
  **You use the body**, why — because of the condition that's here, we have a
  wick and price has already traded several times through here"* (472-483).

Grepped: neither m4-12 nor m4-13 contains the word "wick" or "body". The only
survivor anywhere in Month 4b is m4-11's *"Watch how the bodies close a void
in"*, which states the observation without the rule. So the single most-promised
rule in the month is missing from the two lessons that were meant to deliver it.

**E8 · should-fix · m4-14** — **the first worked example is dropped, and it is the
month's only integrated setup.** Before the measured move, ICT maps *both* sides
of liquidity around a double top on one chart (9-162): above it a **liquidity
void** (the 77.42 opening down to the 77.00 high), below it a **fair value gap**
and a **bullish orderblock** at the last down candle's open. He then poses two
competing resolutions —

> *"here are the two scenarios"* … *"if price drops down to that level we could
> reasonably expect price to go back up and clear out these buy stops, **or** the
> market could come up trade into this void, close it in, and then trade lower to
> close this fair value gap"* (105-120)

— explains which side resolves first (*"we know they're going to be looking for
this side of the liquidity first"*, 122-124), and the target lands **to the pip**
(the high at 77.42 against the candle open at 77.42, 145-151). This is the only
place in Section 1 where the void, the FVG, the orderblock, the double top and
the buy-stop pool are drawn on one chart and traded as a sequence — i.e. it
operationalises m4-03, m4-11 and m4-12 together. The lesson keeps only the second
example.

**E9 · should-fix · m4-12** — **no entry technique at all.** 450 transcript lines
and the lesson explains what an FVG is, why it fills, and never how to take it.
The second half of the transcript (253-441) is a worked entry, twice over:

- the refined sell at the two-pip gap — *"we can be a seller at a more refined
  price level… we said that we could be a seller at **104.70 on a limit**; when
  price trades back up to that level, if it doesn't give us an opportunity to go
  on a limit we can trade it right as it hits it live"* (319-329);
- a second FVG at 104.55 traded to a stated objective — *"we could be a seller at
  104.55 or 104.50 looking for a move down below 104.15 to 104.10"* (407-409),
  which then delivers (410-441).

It also introduces **"perfect delivery"** as a completeness test — a range where
buy side *and* sell side have both been offered is *"a full block of delivery
[efficiency] up and down, both ranges on both sides of the delivery of price"*
(417-424) and is therefore finished. The lesson uses the phrase "perfect
delivery" once, parenthetically, without the test.

**E10 · should-fix · m4-13** — **the attribution ICT insists on is dropped.** He
spends twenty lines crediting **Nick Van Nice** for releasing hidden /
trend-following divergence, and explicitly correcting the credit usually given to
George Lane:

> *"it's been never really associated to who discovered it, but **Nick Van Nice**
> — he was the guy that released it to the trading community at large. **George
> Lane gets a lot of credit and falsely** i might add; he was not the creator of
> stochastic, he's not the inventor if you will of divergence… it's one of those
> pet peeves of mine… i have to keep reminding the folks that are in trading, if
> they talk about divergence they probably should be thanking a guy that they'll
> probably never even meet"* (79-100)

The lesson teaches Type 2 hidden divergence with no attribution. Same shape as
**B4** (ICT crediting Chris Laurie, dropped) but stronger: ICT frames this one as
a correction of a false credit and asks the reader to carry it forward, and
`CLAUDE.md` §6 asks that attribution to original creators survive changes.

**E11 · should-fix · m4-13** — **the lesson faults retail for having no target
and then gives none itself.** Its step 1 says retail sells the divergence *"with
no qualified target"* — which is ICT's point (*"what they're looking for is 'get
me in at the low and i'll figure out where i'm going to get out later on'"*,
322-326). His own contrast is that he has both:

> *"so we're doing two things: we're bringing prognostication, we're forecasting,
> and we still have targeting, so we know what we're looking for for entry —
> we're going to **go long around 96.45 with an exit around 97.08**"* (519-526)

and the low prints at exactly 96.45 (544) before price clears 97.28 and 97.60
(567-570). The invalidation is stated just as plainly — *"we do **not** expect
that low to be violated"*, and *"we expect the stochastic to trade lower than
this low in the indicator but not show it in price"* (491-502) — so the lesson
omits the entry, the target and the falsification condition of its own worked
example.

**E12 · should-fix · m4-10** — **liquidity itself is never defined**, in the
lesson whose title is Liquidity Pools. The transcript's first sentence is the
definition — *"liquidity is the **open interest of buyers and sellers** in the
market, and can be further defined by those entities at or near specific price
levels"* (5-8) — and the pool follows from it: *"above old highs there's **a pool
or a collection of orders** that traders will build up"* (91-93). The lesson uses
"pool of liquidity" as a given.

**E13 · nit · m4-11** — two structural drops. (a) **The void is
timeframe-relative and the lesson doesn't say so**, though ICT demonstrates it by
walking the same void across three charts — many small candles on the 1-minute
(63-70), *"only showing as one big five minute candle"* (119-123), *"that big one
single 15 minute candle"* (209-213). Conspicuous because its sibling m4-12 makes
exactly this point for FVGs, and the two lessons are each other's
cross-reference. (b) **ICT's name for the gap he trades here is dropped** — he
calls it a **"common gap"** (289-296), distinct from m4-09's breakaway/exhaustion
and m4-12's FVG. In a stretch that is largely gap taxonomy, losing one of the
four names costs the reader the taxonomy.

**E14 · nit · m4-09** — two drops. (a) The session filter: a gap like this is a
New York event, *"highly unlikely that it does it in London"* (234-241) — also in
the notes. (b) A go/no-go filter on the post-fill rally: *"we want to see that low
be cleanly broke through, **we don't want to see it hesitate here because
otherwise that would be a bearish order block**"* (308-314). The lesson has the
warning sign for *after* the rally (its `.callout.warn`) but not this one for the
rally's start.

**E15 · nit · m4-08** — two drops from the bullish worked example: that **three
consecutive down candles are framed as one bullish orderblock** and confirmed
when price trades through the highest of them (63-92), and the premium/discount
framing that sets the trade up — price traded down but *"falls short of
equilibrium"* (66-75). The first matters because the propulsion candle in the
example lands on a *grouped* block, not a single candle.

**E16 · nit · m4-13 and m4-14** — two cross-lesson threads dropped. (a) The
divergence trap **fires three more times** on the way up, which is the practical
lesson: *"another bearish divergence… this is probably the top now, it's got to
eventually happen… price doesn't make a sell-off, it just goes higher and it
ultimately punches one more time up and then it gives off a s[ell]"* (m4-13:
578-606). (b) m4-14 deliberately puts a momentum indicator on its own chart to
tie back to m4-13 — *"just for completeness sake in this month's teaching, let's
put a momentum indicator up… retail is going to think this is a sell… we're
thinking it's going up to 74.45"* (m4-14:211-224). Each lesson drops the other's
hand.

#### Consistency

**E17 · should-fix — m4-04's target has no definition anywhere.** Batch D
recorded that m4-04's stated target is *"the liquidity void's mean threshold"*
(**D14**), and **D16** correctly ruled it a different object from the candle's
mean threshold — the midpoint of a void, not of a candle — and therefore not a
reopening of the B12 → C8 thread. Confirmed, and the thread stays closed: m4-08
and m4-09 both use "mean threshold" in m4-03's canonical sense (50% of the
*body*; the gap treated as its own candle), and neither m4-11 nor m4-12 uses the
term at all. **But the void's own midpoint is defined nowhere.** Grepped: the
strings "mean threshold", "midway", "midpoint" and "50 percent" do not occur in
either the m4-11 or the m4-12 transcript, nor in their note pages, nor in the
m4-11 lesson. So m4-04 points forward at a measure the liquidity-void lesson
never introduces. Either m4-04 should say what it means by it, or m4-11 should
define it — but under §1 it can only be defined if a source supports it, and in
this batch none does. **Flagging the gap rather than filling it.**

**Otherwise clean.** All 7 lessons carry `data-month="m4"`; ids are `m4-NN`; all
7 slugs match their id prefix; no `(L4)`-style cross-references appear (grepped).
**All 7 note pages' chart counts match `images/` exactly** — 5 / 6 / 5 / 8 / 6 /
2 / 3, 1:1 and in order, with no chart-free lessons. That completes Section 1:
**all 38 note pages match `images/` 1:1**. `build.py` and `verify.py` pass, 0 JS
errors.

#### Quiz quality

**18 of 20 questions are source-traceable.** The two exceptions are both in
m4-11 and both are **E1**: q1's correct option *"Where no trading took place"* is
the note-taker's definition rather than ICT's, and its `e` restates it while
simultaneously contradicting it. Everything else checks out against that lesson's
own transcript or note page — including all four of m4-13's, which are the
best-written set in the month.

**E18 · should-fix · FIXED — the counts are out of proportion again, for four lessons.**
Carrying **C18**'s floor of 4 questions for any lesson with a multi-step
procedure or a rules table:

| Lesson | Transcript lines | Charts | Quiz Qs | |
|---|---|---|---|---|
| m4-08 | 211 *(shortest in Month 4)* | 5 | **2** | low but near-proportionate |
| m4-09 | 396 | 6 | 4 | ok — one question per bullet |
| m4-10 | **531** | 5 | **2** | **worst in the batch** |
| m4-11 | 343 | **8** | **2** | under-tested |
| m4-12 | 450 | 6 | **3** | under-tested |
| m4-13 | **621** *(longest in the batch)* | 2 | 4 | at floor |
| m4-14 | 362 | 3 | **3** | under-tested |

Unlike Month 3 the counts are not strictly *inverse* to the material — they are
simply **uncorrelated with it**. The second-longest transcript in the month
(m4-10, 531 lines) carries the same two questions as the shortest (m4-08, 211
lines), and m4-13 at 621 lines carries the same four as m4-09 at 396.

What goes untested:

- **m4-10 (2 Qs)** — the entire **Sweep mechanics** callout is a three-rule table
  (10–20 pip sweep / 30–50 pip stop / beyond 25 pips is not a sweep) and nothing
  touches it; nor the premium-discount frame, nor the HTF-bias-then-wait rule,
  which is the lesson's stated "trick". The two questions cover where to sell and
  the roleplay.
- **m4-11 (2 Qs)** — with q1 testing the wrong definition (**E1**), effectively
  one working question for an 8-chart lesson. Untested: displacement and
  balance, the no-time-limit rule, selling inside the gap, and the bodies rule.
- **m4-14 (3 Qs)** — the **double-bottom mirror** is untested (only the top is
  asked), as is the timeframe scaling that is the lesson's only callout (15m
  10–20 pips vs the hourly's measured range) and the spike-reversal consequence.
  Same one-sidedness as **D14**'s m4-05 and m4-06.
- **m4-12 (3 Qs)** — the three questions are well chosen (framing, timeframe
  relativity, rangey style), but the turtle-soup + EQH rationale, "perfect
  delivery" and the bodies-fill rule (**E7**) are all absent.
- **m4-08 (2 Qs)** — the **bearish mirror** is untested, again the D14 shape,
  though this is the mildest case in the batch: 211 lines and a single-mechanism
  concept.

*Recommendation:* +2 each for m4-10 and m4-11, +1 each for m4-12, m4-13 and
m4-14, +1 for m4-08. As in **C18** and **D14** the material is already in the
lessons — except m4-11, where **E1** must be fixed before its q1 can be
rewritten.

#### E19 — A10/C17/D15 re-measured on Month 4b: **the worst stretch in the corpus, and D15's diagnosis holds**

Measured D15's way — ties counted as *not* a tell (**C17**), and the margin taken
over the **second-longest** option rather than as a max-min spread:

| | n | strict (uniquely longest) | expected score | median margin *(when uniquely longest)* | spread > 10 |
|---|---|---|---|---|---|
| m1 | 39 | 72% | 76% | 5 | **36%** |
| m2 | 37 | 65% | 68% | 4 | 27% |
| m3 | 25 | 52% | 61% | 4 | 24% |
| m4a *(batch D)* | 24 | 83% | 88% | 3 | 17% |
| **m4b *(batch E)*** | **20** | **90%** | **92%** | 3.5 | 20% |
| m4 all | 44 | 86% | 90% | 3 | 18% |

**Confirmed exactly as the lead predicted: 90% strict, 92% expected.** 18 of the
20 questions have the correct option uniquely the longest. A reader who knows
nothing and always clicks the longest scores **92%** on this stretch, against a
corpus average of 52% and a chance rate of 25% — and past the 80% exam pass mark
with room to spare.

**D15's diagnosis needs no correction, and this batch is the cleanest
demonstration of it yet.** The margins are tiny: m4-12 q3 wins by **1**
character (22 vs 21), m4-13 q1 by **1** (19 vs 18), m4-12 q1 by **2**, and eight
more by 3. Nothing looks wrong to a reader eyeballing one question — m4-13 q3 and
q4 both run 25 / 26 / 26 / 29, which satisfies §3's "within ~5 characters" — yet
across the set the correct option is on top eighteen times out of twenty. §3's
rule is necessary and not sufficient, exactly as D15 said.

Only two questions in the batch defeat a longest-clicker, and both are worth
copying:

- **[`m4-14/quiz.js:4`](../content/s1-ict-core/m4/m4-14/quiz.js#L4)** — the
  correct option is **shorter** than a distractor (35 vs 36; lens 33/35/36/36).
  The only question in Month 4b where length points the wrong way.
- **[`m4-10/quiz.js:3`](../content/s1-ict-core/m4/m4-10/quiz.js#L3)** — a clean
  tie at the top: `"Roleplay: where would my own stop be?"` (37) against
  `"Measure a fixed distance off the high"` (37), with the other two at 34 and 36.
  Zero margin, and the tie was free.

**The mirror-pair fix (C17, D15) suits this batch better than any so far**, and
in three cases it also *improves* the distractor, because the wrong answer becomes
the genuine opposite concept rather than a throwaway:

- [`m4-12/quiz.js:2`](../content/s1-ict-core/m4/m4-12/quiz.js#L2) —
  `"Left candle low to right candle high"` (36) mirrors to
  `"Left candle high to right candle low"` (36), an exact match by construction
  and a far better distractor than the present `"The wick of the down candle
  itself"` (34). Margin 2 → 0.
- [`m4-11/quiz.js:2`](../content/s1-ict-core/m4/m4-11/quiz.js#L2) — fixing
  **E1** hands this one over for free: `"Only one side of liquidity offered"`
  (34) against `"Both sides of liquidity offered"` (30) and the *pool*'s
  definition as a third option. Better still, phrase the mirror so it is
  **longer** than the answer, which reverses the tell instead of neutralising it.
- [`m4-09/quiz.js:2`](../content/s1-ict-core/m4/m4-09/quiz.js#L2) —
  `"A breakaway gap from a discount"` (31) against
  `"An exhaustion gap from a premium"` (32) is the actual contrast ICT draws
  (**E3**), and the distractor is one character longer. Margin 7 → −1.
- [`m4-13/quiz.js:3`](../content/s1-ict-core/m4/m4-13/quiz.js#L3) — the two
  divergence types are *already* mirrors and merely mis-trimmed:
  `"Higher low in price, lower stochastic low"` (41) against
  `"Higher high in price, lower momentum"` (36). Making the type-1 distractor
  `"Higher high in price, lower momentum high"` (40) takes the margin to 1. This
  question also carries the batch's worst **spread** — its other two options are
  `"Equal highs"` (11) and `"A gap"` (5), a spread of 36 — so it is the one
  question in Month 4b with *both* A10's problem and D15's.

Four questions exceed spread 10 (20%): m4-09 q1 and q2, m4-13 q2, m4-14 q2. Only
m4-13 q2 is egregious.

*Measurement note:* D15's "median margin" column is conditional on the correct
option being uniquely longest — reproduced exactly (m1 5, m2 4, m3 4, m4 3). The
unconditional median across all questions is 3 for m1, m2, m4 and 2 for m3, which
is a different and less useful statistic. Recording this so a later batch
reproduces the same column.

#### Noted, not a finding

**Every gap in this batch is a different object, and the lessons mostly keep them
straight.** Month 4b introduces four gap-like things in five lessons — the vacuum
block (m4-09), the liquidity void (m4-11), the common gap inside a void (m4-11),
and the fair value gap (m4-12) — and the sources cross-reference them constantly
(m4-12:6-13 defines the FVG partly *by* the void; m4-14 maps a void and an FVG on
one chart). The lessons carry the overlap correctly (m4-12's line 19 is explicit
about it). **E1** is the one place where two of them are conflated, and **E13**(b)
the one place a name is lost. Worth recording because the taxonomy is the
month's real content and a later batch may see the terms recur in Section 2.

**ICT names a fifth gap type that is never taught.** *"There's a lot of
information about fair value gaps and breakaway gaps and **measuring gaps**
that's going to be coming your way in the form of the December study notes"*
(m4-12:216-220). "Measuring gap" appears nowhere else in Section 1. The PDF study
notes ICT refers to are not among the permitted sources, so there is nothing to
write from — noting the dangling term, not proposing a fix.

**The five supplementary teachings explain the shape of Month 4b.** m4-10's
transcript closes by announcing five extra pre-recorded videos for the week of
Christmas covering *"these liquidity pool runs, fair value gaps, liquidity voids,
o[rder] blocks, mitigation blocks and reclaimed order blocks"* (516-530), and
m4-11 and m4-12 both repeat the promise. That is why the month runs to fourteen
lessons rather than eight, and why several of them are short. Useful context for
judging **E18**'s counts: the thin lessons are thin because the *teachings* were
supplementary — but m4-10 and m4-11, the two worst-tested, are core teachings 4
and 5 of 8, not supplements.

**Thin note pages again did not predict trouble — but a thin page plus a long
transcript did.** m4-13 has the thinnest page in Month 4b (two charts, six lines
of prose) against the batch's longest transcript, and the lesson is the
best-written in the batch. m4-11's page is one of the fuller ones and produced
the batch's blocker. Batch D's conclusion stands: page length is not the
predictor. What **did** predict **E1** is a note page containing a **dated
example that post-dates the teaching** — a concrete, greppable signal worth
carrying into batch F and Section 2.

### Batch F — Section 1, revision summary + final exam

Read in full: `content/s1-ict-core/summary.html` (314 lines, **9 `<h3>` + 23
`<h4>` = 32 blocks**, not the 30 estimated) and `content/s1-ict-core/exam.js`
(**45** questions, 275 lines). Per the batch method the reference set was **all
38 Section 1 lessons** (~121 KB, read in full) plus findings A–E; no transcripts
were re-read, and `notes/ict-core/m2-04.md` was the only note page opened, to
settle **F9**.

**Headline: these two pages are the best-constructed content in Section 1, and
blocker propagation is far narrower than the leads predicted.** Of the three open
Section 1 blockers only **E1** reaches this batch — and it reaches it in the
worst possible slot, the definitional one (**F1**). **C1** (the backwards inverse
head & shoulders) is **absent**: the summary simply doesn't carry the inverse
pattern, so on that point it is *more* correct than the lesson it summarises.
**C2**'s invented apex mechanism is gone too; only a one-clause residue survives
(**F2**). **D1** and **B2** likewise do not propagate.

The two dimensions the leads flagged as high-risk both came back clean. **All 24
`(Lx)` cross-references resolve to the lesson that actually teaches the thing**
(**F12**) — the first and only place in the corpus where they could be checked,
and there are no dead ones. **The 15-row "numbers worth memorising" table checks
out row by row against the lesson each number came from** (**F13**); B2's shape
does not recur. Exam coverage is *not* uneven — 36 of 38 lessons are represented
and per-month sampling tracks lesson count almost exactly (**F8**), so the
`"vacuum"`-appears-0-times signal was a false positive.

What is left is six should-fix items — four of them defects inherited from
lessons, one exam question testing something the summary never states (**F6**),
and one stale self-referential number (**F7**) — plus the confirmation that the
exam is the best-constructed question set in Section 1 **and now a mechanical
account of why**, which is the transferable fix for **E19** (**F13**, **F14**).

#### Content fidelity (§1) — and the §3 "re-states the lessons" test

**F1 · blocker · FIXED ·
[summary.html:240](../content/s1-ict-core/summary.html#L240) and
[exam.js:235-237](../content/s1-ict-core/exam.js#L235)** —
**E1 propagates to both pages, in the one slot where it does most damage: the
definition.** The summary's liquidity-void row reads *"Where **absolutely no
trading took place** — big one-sided candles. There is no specific time for a
void to fill; it gets covered back over **once both sides have been offered**."*
Three things make this worse than E1 was in m4-11:

- **The self-contradiction is now inside a single table cell.** "No trading took
  place" and "once both sides have been offered" are one sentence apart.
- **The vacuum block's row sits two rows above it** (**N15**; F1 published
  *four*) and reads *"a gap from a
  volatility event … where **no trade could occur**."* So the summary hands the
  same definition to two different PD arrays inside one table. E1 noted that
  m4-11 collapses the m4-09 distinction; here the collapse is visible at a
  glance, on the page designed for side-by-side revision.
- **The correct formulation is one row *below*.** (**N15**; F1 published *two*.)
  The FVG row says *"**Only one
  side of liquidity was offered** there, so price is drawn back to rebalance
  it"* — which is exactly ICT's liquidity-void definition
  (`m4-11` transcript 7-11, 111-114, 125-126, quoted in **E1**). The table
  therefore holds the right words and the wrong ones simultaneously.

In the exam, q39 (`exam.js:235`) asks *"What is a liquidity void?"* and marks
*"A range where no trading took place"*; its `e` reproduces E1's
one-sentence self-contradiction verbatim — *"absolutely no trading took place —
big candles delivered to one side. It gets covered back over later, once both
sides have been offered."* Note that **none of q39's four options states ICT's
actual definition**, so this question cannot be salvaged by re-marking `a`; it
needs rewriting after E1 is fixed. **E19** already showed the fix hands
`m4-11/quiz.js:2` a free mirror-pair; the same phrasing serves here.

*Scope, measured:* of the **7** "liquidity void" mentions in `summary.html` and
**4** in `exam.js`, exactly **one each** uses the wrong reading. The other nine
are neutral, and two of them *presuppose* the correct one — `summary.html:150`
(*"first objective the liquidity void the false flag created"*) and
`summary.html:243` (*"on a lower timeframe show up as a liquidity void"*), both
of which describe ranges where trading demonstrably occurred. So the repair is
two cells, not eleven.

**F2 · should-fix · FIXED ·
[summary.html:222](../content/s1-ict-core/summary.html#L222)** —
**C2's residue: *"Triangles and wedges are the same mechanism."*** The invented
apex mechanism is gone (the string "apex" appears in `summary.html` **zero**
times), but the claim that triangles and wedges *work by* the trendline
mechanism survives, and neither word appears anywhere in Month 3's transcripts or
notes — ICT explicitly defers the triangle (**C2**). Because the summary states
it in six words with no mechanism attached, it is a should-fix here rather than a
blocker; the fix is to delete the clause when m3-07 is fixed.

*Related, and deliberately not a finding:* "apex" **does** appear in the exam, at
[`exam.js:169`](../content/s1-ict-core/exam.js#L169) — but only as a
**distractor** (*"Sell stops at the apex"*), and §3 exempts distractors from
source-traceability. Worth flagging for the fix pass rather than the audit: if
C2's repair removes the concept from the course, that distractor starts
referencing a term the reader has never met, which is a weak distractor even
though it is a permissible one.

**F3 · should-fix · FIXED ·
[summary.html:222](../content/s1-ict-core/summary.html#L222)** —
**C3 propagates, and is *promoted* from quotation to assertion.** m3-07 sets the
manufactured line in italics and quotation marks — *"If everyone's looking at the
same thing and everyone can't win, the majority has to be wrong."* The summary
drops the marks and folds the claim into its own prose: *"everyone draws them,
everyone sees the same touches, and **the majority has to be wrong**."* **C3**
established that "majority", "everyone can't win" and any near-variant appear
**nowhere** in Month 3's sources. Losing the quotation marks arguably makes it
worse, not better: it now reads as the course's own assertion rather than as
ICT's words, so a reader has no cue that it is a paraphrase at all. The three
real ICT lines **C3** identified are still the fix.

**F4 · should-fix · FIXED ·
[summary.html:223](../content/s1-ict-core/summary.html#L223)** —
**C7 propagates verbatim.** *"trying to pick tops and bottoms is the **single
worst thing** a trader can do."* ICT: *"picking tops and bottoms is **one of the
worst games to play** especially the new trader"*
(`Market Maker Trap Head Shoulders Pattern.txt:112-116`). The same
over-tightening as **A3** and **C7**, now on the last page a reader reads before
the exam. (m3-08's other C7 half — "retail sells the right shoulder" — is **not**
carried over; the summary says only that the stops above the head and shoulders
are the engineered liquidity, which is correct.)

**F5 · should-fix · FIXED ·
[summary.html:123](../content/s1-ict-core/summary.html#L123)** —
**B1 propagates: *"the same move that pays the hourly trader 1:1 pays you
3:1."*** **B1** showed this comparison is not in the source and overstates by a
full R — at the moment price reaches 7542 the hourly trader is *being filled*, at
0R, not at 1:1. B1's fix applies unchanged: by the time the hourly entry fills,
the refined trade is already at 3R.

*The good half of the same line:* **B2 does not propagate.** The summary keeps the
pip counts (*"1-hour entry with a 20-pip stop, 15-minute refinement at 17 pips,
5-minute refinement at under 10 pips"*) and **drops the 7520 / 7507 price
levels**, so the row a reader could falsify with mental arithmetic
(7520 − 7507 = 13, not 17) never reaches this page. That is exactly the shape of
fix B2 recommended, already applied here.

#### Exam quality (review dimension 3)

**F6 · should-fix ·
[exam.js:228-232](../content/s1-ict-core/exam.js#L228) (q38)** — **the one exam
question that tests something the summary does not state.** Q38 asks *"The
higher-timeframe bias is bullish. What do you wait for?"* → *"An old low to be
taken out first"*, and its `e` names it as *"the trick"*. That is m4-10's stated
trick, verbatim from the lesson —
*"The trick is knowing the **underlying HTF bias**. If it wants to go higher —
wait for an old low to be taken out, then be a buyer"*
([m4-10/lesson.html:12](../content/s1-ict-core/m4/m4-10/lesson.html#L12)) — so it
is source-traceable and passes §1. It fails dimension 3: grepped, `summary.html`
never states it. Its liquidity-pool row
([summary.html:239](../content/s1-ict-core/summary.html#L239)) carries only the
sweep mechanics (*"buy **under** the low, not at it"*), which **presumes** the
low has already been taken rather than telling the reader to wait for it.

Worse, the summary's only explicit statement about a broken old low pulls the
other way: [summary.html:126](../content/s1-ict-core/summary.html#L126) —
*"Breaking an old low is **not** by itself a reason to expect a reversal"*
(m2-02's warning, correctly carried). A reader revising from this page alone is
set up to answer q38 wrongly.

Note where this rule now sits: **E18** already recorded it as untested in m4-10's
own two-question quiz. So m4-10's central trick is absent from its quiz, absent
from the summary, and examined once — the single worst-supported rule in
Section 1. Whichever way it is fixed (a clause in the liquidity-pool row, or a
line in the m4-10 block), the summary is the cheaper place.

**F7 · should-fix · FIXED ·
[summary.html:311](../content/s1-ict-core/summary.html#L311)** — **the summary
tells the reader the exam has 40 questions; it has 45.** *"take the **Final
Exam** — **40 questions** across all four months."* `exam.js` holds 45 (verified
mechanically; `verify.py` reports 85 exam questions across 2 exams, S2 holding
40). The exam page's own count is **derived** — `build.py`'s `exam_page(sid,
title, n)` writes *"{n} questions drawn from every lesson in this section"*
([build.py:157](../build.py#L157)) — so the generated page says 45 while the
hand-written summary says 40, one click apart. Almost certainly a stale figure
from when the S1 exam matched S2's 40.
*Fix:* delete the number (the sentence reads fine as "across all four months")
or write 45; the exam page's figure maintains itself.

*Secondary, in generated text rather than content:* that same derived line claims
the questions are *"drawn from **every** lesson in this section"*, which **F8**
shows is not quite true. If `build.py`'s wording is ever revisited, "from across
the section" would be accurate for both sections without needing a check.

**F8 · nit — exam coverage is even, and only two lessons go untested.** Tabulated
by reading all 45 questions and their `(Month N, Lesson N)` citations, then
verifying each against the cited lesson:

| Month | Qs | Lessons | Qs per lesson | Lessons with 0 questions |
|---|---|---|---|---|
| Month 1 | 10 | 8 | 1.25 | **m1-03** |
| Month 2 | 9 | 8 | 1.13 | **m2-03** |
| Month 3 | 10 | 8 | 1.25 | — |
| Month 4 | 16 | 14 | 1.14 | — |
| **Total** | **45** | **38** | **1.18** | **2** |

Per-lesson counts: m1-04 ×3; m1-02, m2-01, m2-08, m3-03, m3-06, m4-02, m4-03 ×2;
every other covered lesson ×1.

**The lead's suspicion of unevenness is not confirmed, and one specific worry was
a false positive.** `"vacuum"` appears 0 times in `exam.js`, but **m4-09 is
tested** — q37 asks the 10–11am gap rule (*"It stays open and becomes an FVG"*),
which is m4-09's time-of-day fill rule, without using the block's name. Sampling
tracks lesson count to within 0.12 questions per lesson across all four months,
and **Months 3 and 4 have every single lesson represented** — including all
fourteen of Month 4, which is the month the lead expected to be under-sampled.

The two gaps are **m1-03** (the daily price-action log) and **m2-03** (10%
months). Both are summarised — m1-03 gets a whole block at
[summary.html:95-96](../content/s1-ict-core/summary.html#L95) — so both are
eligible under dimension 3, and m1-03 is the more notable absence: it is the one
lesson in Section 1 that tells the reader what to *do* every day, and **A4/A12**
already noted it as the habit the whole course is built on. m2-03's is defensible
for the same reason batch B ruled its 3-question quiz proportionate — it re-walks
m2-01/m2-02's case study, and q11/q14 already test that material.

**F9 · nit · [exam.js:79](../content/s1-ict-core/exam.js#L79) (q13) — "the
notes" cited for something the notes do not contain.** Extends **C16** with its
first instance outside a lesson. q13's `e`: *"50% accuracy at 5:1 with 1% risk
returns about 20% a month — **stated in the notes** as the optimal trading
goal."* `notes/ict-core/m2-04.md` is twelve lines of prose and contains no such
statement — what it has is *"1% risk makes millionaires / 2% risk is the industry
standard"*, the mean-threshold rule and the FVG note. The +20% / optimal-goal row
comes from the transcript and from the lesson's own table
([m2-04/lesson.html:478](../content/s1-ict-core/m2/m2-04/lesson.html#L478)),
both verified in batch B. As with C16 this is a citation-label problem, not a §1
breach — the claim is true of the source material. It is the **only** such
instance in either file: `summary.html` cites "the notes" **zero** times, so
the batch is otherwise clean on C16's problem.

**F10 · nit · FIXED ·
[summary.html:204-209](../content/s1-ict-core/summary.html#L204) — the SMT table
drops a row the lesson has.** m3-05 states four cells (two symmetrical, two
non-symmetrical); the summary compresses them to two and keeps only the
dollar-**bottom** non-symmetrical case (*"USDX makes a lower low but FX fails to
make a higher high"*). The lesson's second non-symmetrical row —
[m3-05/lesson.html:173](../content/s1-ict-core/m3/m3-05/lesson.html#L173),
*"USDX fails to make a lower low while FX makes a higher high — underlying dollar
strength"* — is gone. Since **C9** already found the lesson missing ICT's fourth
condition (the rule for spotting a dollar *top*), a reader working from the
summary can now diagnose the setup in only one direction. Condensation is a
revision page's job, but this one drops a case rather than shortening it, and the
table's own *symmetrical / non-symmetrical* framing invites the mirror. Same
one-sidedness family as **A8**, **C9**, **D13**, **E18**.

**F11 · nit — two small drifts.**
(a) [summary.html:47](../content/s1-ict-core/summary.html#L47) softens m1-02's
*"**always** by way of some news event/driver"*
([m1-02/lesson.html:55](../content/s1-ict-core/m1/m1-02/lesson.html#L55)) to
*"**usually** around a news driver"*. §1 prefers under-claiming, so this is safe
in substance — recorded only because drift from the summarised lesson is the
defect class this batch is looking for, and this is the sole instance of it in
the four templates and tables.
(b) [summary.html:33](../content/s1-ict-core/summary.html#L33) is the **only one
of the 24 `(Lx)` references not inside an `<h4>`** — it sits in a
`<span class="tag">` inside a `.callout.rule`. `engine/head.html` styles `.src`
only as `.lesson h4 .src`
([head.html:182](../engine/head.html#L182)), so this one inherits the callout
tag's uppercase gold label styling instead of the small dim treatment the other
23 get, and reads as part of the label ("THE RULES OF CONDITIONS (L2)").
Cosmetic only, and **the reference itself resolves correctly** — not a dead
cross-reference, so not a *Fixed in flight* item.

#### F12 — the 24 `(Lx)` cross-references: all resolve, none dead

Batches A–E each recorded "no `(L4)`-style cross-references appear" because they
live **only** in the two `summary.html` files. This is where they finally get
checked. There are **24**, not the 25 estimated, and **every one resolves to the
lesson that actually teaches the thing**, with the number correct for that
month's numbering (Months 1–3 run to L8, Month 4 to L14):

| Block | Ref | Resolves to | |
|---|---|---|---|
| The four conditions + tools | (L1) | m1-01 Elements Of A Trade Setup | ✓ |
| The rules of conditions | (L2) | m1-02 How Market Makers Condition The Market | ✓ |
| The daily template | (L2) | m1-02 | ✓ |
| The weekly template | (L2) | m1-02 | ✓ |
| Market protraction | (L8) | m1-08 Impulse Price Swings & Market Protraction | ✓ |
| Equilibrium, discount, premium | (L4, L5, L6) | m1-04 / m1-05 / m1-06 | ✓ |
| Liquidity runs | (L7) | m1-07 Liquidity Runs | ✓ |
| The habit that starts it all | (L3) | m1-03 What To Focus On Right Now | ✓ |
| Reward-to-risk beats accuracy | (L1, L4) | m2-01 (the accuracy table) / m2-04 (the %-month table) | ✓ |
| Framing a low-risk setup | (L2, L3) | m2-02 / m2-03 | ✓ |
| Mitigating a loss | (L5) | m2-05 | ✓ |
| Seven things in agreement | (L6) | m2-06 | ✓ |
| Traps 1 & 2 | (L7, L8) | m2-07 false flag / m2-08 false breakout | ✓ |
| What each timeframe is for | (L1) | m3-01 Timeframe Selection | ✓ |
| Institutional order flow | (L2) | m3-02 | ✓ |
| Institutional sponsorship | (L3) | m3-03 | ✓ |
| The anticipation drill | (L4) | m3-04 Anticipatory Skill Development | ✓ |
| Institutional market structure — SMT | (L5) | m3-05 | ✓ |
| Macro economic to micro technical | (L6) | m3-06 | ✓ |
| Traps 3 & 4 | (L7, L8) | m3-07 trendline phantoms / m3-08 head & shoulders | ✓ |
| The ten arrays at a glance | (L3–L12) | m4-03 … m4-12 | ✓ |
| Internal vs. external liquidity | (L2, L3) | m4-02 / m4-03 | ✓ |
| The interest rate triad | (L1) | m4-01 | ✓ |
| Traps 5 & 6 | (L13, L14) | m4-13 divergence phantoms / m4-14 double tops | ✓ |

Two are worth calling out as unusually well done. **(L3–L12)** is a ten-lesson
range against a ten-row table, and **the row order matches the lesson order
exactly** — orderblock, mitigation, breaker, rejection, reclaimed, propulsion,
vacuum, liquidity pool, liquidity void, FVG = m4-03 … m4-12. And **(L1, L4)** in
Month 2 correctly splits one block across the two lessons that each own half of
it: m2-01 has the accuracy/RR ladder, m2-04 has the six %-per-month rows.

So the *Fixed in flight* exception for dead cross-references never fires. Nothing
in `content/` was edited in this batch either.

#### F13 — "The numbers worth memorising" checks out, row by row

The lead named this the highest-risk block, on the reasoning that a numbers table
is where **B2**'s shape recurs — a figure a reader can falsify with mental
arithmetic. **All 15 rows are correct against the lesson each number came from:**

| Row | Traces to | |
|---|---|---|
| 62 / 70.5 / 79% — the OTE zone | m1-04:167 (62/70.5/79), m1-05:202 (sells 62–79) | ✓ |
| 50% — equilibrium, and the mean threshold measured open-to-close | m1-04:164, m4-03:97 | ✓ |
| 3 candles — wait for the 4th to confirm | m1-04:155 | ✓ |
| 3 protractions — 0 GMT, after midnight NY, after 7 AM NY | m1-08:332-336 | ✓ |
| 10–20 pips sweep; beyond 25 probably not a sweep | m4-10:305-307 | ✓ |
| ~5 pips added to a limit order for the dealing spread | m4-03:96, m2-01:382 | ✓ |
| 1% risk — "one percent makes millionaires", half the 2% standard | m2-04:482 | ✓ |
| 3:1 — wrong 75% of the time and still net profitable | m2-01:367 | ✓ |
| 50% acc · 5:1 · 1% → +20% a month, the optimal goal | m2-04:478 | ✓ |
| 6% a month doubles the account — 20 pips/week, 1.5%, 1:1 | m2-01:381 | ✓ |
| Half risk on re-entry; mitigated at R2 | m2-05:508-509 | ✓ |
| 7 things — 2 + 2 + 3 in agreement | m2-06:543 | ✓ |
| 2–3× the orderblock body height before a second entry | m4-03:105 | ✓ |
| 3–4 months — the quarterly shift | m2-06:548, m3-06:212 | ✓ |
| 40+ pips — the minimum range for a 1-hour setup | m4-02:54, m4-02:64 | ✓ |

Month 2's tables reproduce to the digit in the summary as they did in the
lessons: the six accuracy/RR rows (+2 / +8 / +15 / +28 / +40 / **+20%**) and the
four-row RR-vs-accuracy ladder (75% / 50-50 / 40% / 25–33%) are exact. **No drift
of the summary's own** was found anywhere in this block — the one number in the
whole page that is wrong is the *question count* in the closing callout
(**F7**), which is not a trading figure at all.

#### F14 — the exam re-measured: C17 confirmed, and now the mechanism behind it

Re-run the D15/E19 way (a tie counted as *not* a tell per **C17**; margin taken
over the **second-longest** option per **D15**). **C17's figures reproduce
exactly** — every Section 1 column below is identical to the published ones:

| | n | strict (uniquely longest) | expected score | median margin | spread > 10 | **correct option is *shorter* than a distractor** |
|---|---|---|---|---|---|---|
| m1 | 39 | 72% | 76% | 5 | 36% | 8 (21%) |
| m2 | 37 | 65% | 68% | 4 | 27% | 10 (27%) |
| m3 | 25 | 52% | 61% | 4 | 24% | 7 (28%) |
| m4 | 44 | **86%** | **90%** | 3 | 18% | **3 (7%)** |
| **S1 quizzes** | **145** | **71%** | **76%** | 4 | 26% | 28 (19%) |
| **S1 exam** | **45** | **31%** | **42%** | **1** | **0%** | **20 (44%)** |

**Confirmed as the lead predicted: 31% strict / 42% expected, and zero questions
over spread 10** (max spread is 9; median 3; 39 of 45 within §3's ~5 characters).
The exam sits **comfortably below its own 80% pass mark** — a guesser who always
clicks the longest option fails it — and it is the best-constructed set in
Section 1 by a wide margin, against quizzes averaging 76%.

**Why it is better is now measurable, and it is *not* spread discipline.** That
was **D15**'s point in reverse: Month 4 has the **lowest** spread in Section 1
(18%) and the **worst** tell (90%). The distinguishing column is the last one:

- **The exam writes the correct option *shorter* than at least one distractor in
  20 of 45 questions (44%).** Month 4 does it 3 times in 44 (**7%**); Section 1's
  quizzes 19%.
- **Counting ties, 31 of the exam's 45 questions (69%) deny a longest-clicker a
  clean win.** Month 4: 6 of 44 (**14%**).
- **And when the correct option does win on length, it wins by a median of 1
  character** (m1 5, m2 4, m3 4, m4 3).

So the operative metric for a fix pass is **not** max-min spread and **not** §3's
"within ~5 characters" — the exam satisfies both and so, largely, does Month 4.
It is *the share of questions where the correct option is not the longest*. The
exam is at 69%; a set at chance would be ~75%. **That is the number to move for
E19**, and it is achieved by three techniques all visible in `exam.js`:

- **Whole-set parallel construction**, not just a mirrored pair. `exam.js:266`
  runs all four options through one grammar — *"Enter internal range, exit
  external" / "Enter external range, exit internal" / "Enter and exit on internal
  range" / "Enter and exit on external range"* — which is **C17**'s mirror-pair
  technique extended to the full option set. `exam.js:248` does the same for the
  four divergence permutations, and `exam.js:157` for a paradigm set (*"Rates are
  lowering / increasing / unchanged / irrelevant"*).
- **Deliberate exact ties.** 11 of 45 questions tie for longest, two of them at
  spread **0** (`exam.js:66` q11, `exam.js:78` q13) — and a tie costs nothing to
  author.
- **Letting the correct option be the short one.** q20's answer is *"The daily
  chart"* (15 chars) against *"The 15-minute chart"* (19); q26's is *"Rates are
  lowering"* (18) against *"Rates are increasing"* (20). The nuance goes in `e`,
  exactly as §3 prescribes — which is the half of §3's rule Month 4 never
  applied.

Only two questions in the exam give a longest-clicker a real margin: q7
(+5, *"The sell stops inject counterparties"*) and q1
(+4, *"Fair value gaps and liquidity voids"*). Both would take a parallel-set
rewrite in one line.

**Not re-flagged:** every one of the 45 questions marks `a: 0` (mechanically
confirmed, 45/0/0/0). **D14/D15** settled that this is a harmless authoring
template — options Fisher-Yates shuffle at render time, so `a` sets no on-screen
position (§3).

#### What does *not* propagate — checked explicitly

Recorded because the leads expected most of it to, and because it tells a fix
pass which lesson repairs need a summary edit and which do not:

| Finding | Reaches summary/exam? | |
|---|---|---|
| **C1** — m3-08's backwards inverse head & shoulders | **No.** The Traps 3 & 4 block never mentions the inverse pattern; it stops at *"The neckline break is a turtle soup, not a sell signal. Only fade it in the direction the HTF bias already supports"*, which is correct. **The summary is more correct than the lesson here.** | ✓ |
| **C2** — the invented apex mechanism | **Only a residue.** "apex" is absent from the summary; one six-word clause survives (**F2**). | ~ |
| **C3** — the manufactured quotation | **Yes, and promoted to plain assertion** (**F3**). | ✗ |
| **C7** — "the single worst thing a trader can do" | **Yes, verbatim** (**F4**). Its "retail sells the right shoulder" half does not. | ✗ |
| **D1** — breaker = "entire candle range **and** the bodies" | **No.** summary:234 says only *"The last up candle inside that swing high is the bullish breaker"*; the merged clause is gone. | ✓ |
| **B1** — the 1:1-vs-3:1 comparison | **Yes** (**F5**). | ✗ |
| **B2** — the 7520/7507 = 17-pip arithmetic | **No.** The pip counts are kept and the price levels dropped — B2's own recommended fix, already applied. | ✓ |
| **C4** — m3-01's two competing triads | **No third variant.** The summary sides with the flip cards (trade inside the range / orderblocks & breakers / stop runs), i.e. with the lesson body rather than its quiz. | ✓ |
| **C5** monthly-vs-daily OB, **C6** "that's confluence", **C8** m3-02's mean threshold | **None.** All three lines are dropped rather than restated. | ✓ |
| **D2**, **E4** — verbatim quotes attached to the wrong object | **Neither.** "like X-ray vision" and "predisposed to go higher" are both absent. | ✓ |
| **E3** — "breakaway" attached to the wrong discriminator | **No.** The vacuum row omits the breakaway/exhaustion naming entirely. | ✓ |
| **E2** — "voids with no trading at all are the best draw on liquidity" | **No.** The superlative is dropped; only **F1**'s definitional half survives. | ✓ |
| **A13** — stop runs "10 and 20 pips" (source: sometimes 30) | **Yes**, but only as the lesson states it (summary:85). Not a new defect — A13's fix covers both sites. | ~ |
| **B12 → C8 → D16** — the mean-threshold thread | **Closed and consistent.** The summary uses m4-03's canonical reading in both places it appears (*"the **mean threshold** of any orderblock (measured open-to-close)"*, summary:268; *"the best ones never trade below the **50% mean threshold**"*, summary:232). No fifth rendering. | ✓ |

#### Consistency — clean

- HTML is well-formed: tags balanced, **zero** unclosed elements and zero
  mismatched closers (checked mechanically over all 314 lines).
- `id="s1-review"`, `data-kind="review"`, `data-section="s1"` and the
  `<div class="review-footer"></div>` slot are all present and correct per §3.
- The exam page is generated, so there is no `exam.html` to drift; its question
  count is derived from `exam.js` (see **F7** for the one place a *hand-written*
  count disagrees with it).
- `summary.html` cites "the notes" zero times (contrast **C16**); the single
  mis-citation in this batch is in the exam (**F9**).
- "PD array" is **not** a term the summary introduces: it is in
  `months.js` (*"Month 4 — The PD Arrays"*), in
  [m4-03/lesson.html:5](../content/s1-ict-core/m4/m4-03/lesson.html#L5), and in
  m3-07's, m3-08's and m4-01's quiz explanations. Checked because the summary
  leans on it in the checklist (summary:290).
- `python build.py` and `python verify.py` both pass — *"verify OK: 78 lessons,
  339 images, 78 video links, 451 quiz questions, 2 summary page(s), 85 exam
  questions across 2 exam(s), 0 JS errors"*. The `p3-01` slug warning is
  pre-existing (batch I).

#### Noted, not a finding

**The nine-step "checklist before any trade" (summary:284-295) is a synthesis the
course never states as a checklist — and every step traces.** Checked
individually because §3 forbids a review page adding material: condition →
rules of conditions (m1-01/m1-02), HTF bias + which side of structure broke
(m3-02:68, m1-06:244), premium/discount (m1-04, m1-05, m4-10:297), untapped
liquidity + low resistance (m2-08:621, m1-07:304-307), which PD array + *"not a
line drawn on a whim"* (m4-05:174), external exit + no-trade-if-range-too-small
(m2-01:375, m4-02:54), confirmations (m3-05, m4-01, m3-03:111), risk sizing and
partials (m2-01:358/373, m2-04:468, m2-03:443, m2-05:503), immediate response
(m3-03:100). §3 bars new *material*, not new *arrangement*, and the page's own
`desc` says "re-ordered" — so this is inside the rule. Recording it because it is
the largest structure on the page with no single lesson behind it, and a future
edit to any of those nine lessons should check back here.

**The same applies, more mildly, to "What the course keeps warning you about"
(summary:297-309).** All eight warnings trace — m1-01:21/28, m3-08 + m4-13,
m2-07:570 + m3-07:245 + m3-08:274, m1-03:130 (verbatim), m3-05:168, m2-05:516,
m1-04:183 + m1-05:212, m1-03:129 + m3-04 — and four of them are the phrasing of
the lesson rather than a paraphrase.

**`content/s1-ict-core/section.js` still carries the stray semicolon `desc: "…";
}` that `CLAUDE.md` §3 warns about.** Confirmed present and confirmed harmless:
`build.py`'s `parse_objs` re-emits `SECTIONS` from the parsed `key:"value"` pairs
rather than pasting the literal, and both `build.py` and `verify.py` pass. Not
touched, not a *Fixed in flight* item — recorded per the batch instruction.

**Corrections to this batch's own scoping estimates.** The summary has **32**
`<h3>`/`<h4>` blocks, not 30, and **24** `(Lx)` references, not 25. Neither
changes a finding; recorded so the counts in **F12** reconcile.

### Section 1 roll-up — batches A–F

Section 1 is now fully audited: 38 lessons, 145 quiz questions, one revision
summary, one 45-question exam.

**Findings: 83, plus one withdrawn (A1) and one open question resolved (A12).**

| Batch | Scope | blocker | should-fix | nit | total |
|---|---|---|---|---|---|
| A | Month 1 | — | 2 | 9 | 11 |
| B | Month 2 | — | 4 | 8 | 12 |
| C | Month 3 | **2** | 6 | 9 | 17 |
| D | Month 4a | — | 8 | 6 | 14 |
| E | Month 4b | **1** | 11 | 6 | 18 |
| F | summary + exam | **1** | 6 | 4 | 11 |
| **Total** | **38 lessons + 2 pages** | **4** | **37** | **42** | **83** |

**Three distinct blockers, at four sites, and they cluster in the tails.**

- **C1** (inverse head & shoulders taught backwards) and **C2** (invented
  triangle mechanism, tested by its own quiz) are both in **m3-07 / m3-08**, the
  two market-maker-trap lessons that *close* Month 3 and have the thinnest
  sources in it (m3-08's note page is a single line of prose).
- **E1** (liquidity void defined as its opposite) is in **m4-11**, and traces to
  a note-page line citing a **2022** chart on a **2016** teaching — a
  note-taker's addition, not ICT's.
- **F1** is E1 reaching `summary.html` and `exam.js`. So **one of the three
  blockers propagated to the section-level pages, and it is the only one that
  did** — C1 is absent from the summary and C2 survives only as a six-word
  clause. Fixing E1 therefore means fixing three files, not one:
  `m4-11/lesson.html`, `m4-11/quiz.js`, `summary.html:240` and `exam.js:235-237`.

**Weakest dimension, per month.** It shifts, which is the useful part:

| Month | Weakest dimension | Shape of it |
|---|---|---|
| 1 | **Quiz construction** | Fidelity is genuinely good (A1 withdrawn on the notes). 9 of 11 findings are nits. But 72% strict / 76% expected on option length, and the **highest spread in the corpus (36%)** — one long correct option beside throwaways like "Guess", "Random". |
| 2 | **Coverage** | 8 of 12 findings are dropped material. The only month with **numeric** fidelity problems (B1, B2) — and one of those (B2) traces to a garbled transcript, not to the author. |
| 3 | **Fidelity** | The only month with fidelity blockers, all three (C1, C2, C3) in its two trap lessons. Best-constructed quizzes in Section 1 (52% strict) via **mirror-pair distractors**. |
| 4a | **Coverage** | 6 consecutive should-fix omissions (D3–D8), including m4-02 never defining internal/external range liquidity — the two terms its own bullets carry. |
| 4b | **Coverage, with a distinct shape** | **Four of seven lessons teach what a thing *is* and never how to trade it** (E5, E6, E9, E11). Plus the worst option-length stretch in the corpus (90%/92%). |
| summary + exam | **Propagation** | Construction is the best in Section 1. The defects are inherited (F1–F5), not native. |

**The quiz-count test (C18 → D14 → E18): 11 of 38 lessons under-tested, all in
Months 3–4.** m3-01, m3-03, m3-04, m3-05, m4-04, m4-05, m4-06, m4-10, m4-11,
m4-12, m4-14 — plus m4-03 and m4-08 at the margin. All of Months 1–2 are
proportionate to the material each lesson carries. Month 3's counts run *inverse*
to the material; Month 4b's are merely *uncorrelated* with it. Worst single case
is **m4-11**: two questions, one of which tests E1's incorrect definition, for an
8-chart lesson — so **E1 must be fixed before its quiz can be rewritten**. The
recommended additions total roughly **+18 questions** and need no new sourcing;
the material is already in the lessons.

**Option length (A10 → C17 → D15 → E19 → F14), final Section 1 figures:**

| | n | strict | expected score | median margin | spread > 10 | correct not longest |
|---|---|---|---|---|---|---|
| m1 | 39 | 72% | 76% | 5 | **36%** | 28% |
| m2 | 37 | 65% | 68% | 4 | 27% | 35% |
| m3 | 25 | **52%** | **61%** | 4 | 24% | 48% |
| m4a | 24 | 83% | 88% | 3 | 17% | — |
| m4b | 20 | **90%** | **92%** | 3.5 | 20% | — |
| m4 all | 44 | 86% | 90% | 3 | **18%** | **14%** |
| **S1 quizzes** | **145** | **71%** | **76%** | 4 | 26% | 29% |
| **S1 exam** | **45** | **31%** | **42%** | **1** | **0%** | **69%** |

The distribution is the finding: **Section 1's quizzes hand a knowledge-free
guesser 76%**, and Month 4's hand them **90%** — past the 80% exam pass mark —
while the exam on the same material gives them **42%**. The corpus's worst and
best question sets sit in the same section, so the fix is a known quantity rather
than a research problem: **F14** names the three techniques that produce the
exam's numbers, and the metric to move is *the share of questions where the
correct option is not the longest* (Month 4: 14%; exam: 69%; chance: ~75%).
§3's "within ~5 characters" rule is **necessary but not sufficient** — that is
**D15**'s conclusion, confirmed twice since, and Month 4 is the proof.

**Two things that came out cleaner than expected**, worth stating so a fix pass
does not go looking for them: **all 38 note pages' chart counts match `images/`
1:1 and in order** (A12 → E), and **all 24 `(Lx)` cross-references resolve**
(F12). Nothing in `content/` was edited across batches A–F.

**Input to batch N.** The cross-cutting sweep should carry forward: the
one-sidedness family (**A8, C9, C10, D13, E18, F10** — buy-side taught,
sell-side dropped, six times across four months); the citation-label family
(**C16, F9** — "the notes" naming the wrong artefact, four sites); verbatim
quotations attached to the wrong object or the wrong lesson (**A2, D2, E4**); and
the note-page signal that predicted the one blocker nobody could have guessed
from the lesson — **an attribution or a date that does not belong to this
teaching** (**D1**'s *"that's what i saw in another video"*, **E1**'s 2022 chart
on a 2016 lesson).

### Batch G — Section 2, Part 1 (p1-01 … p1-07 / episodes 1–7)

Sources read: all 7 `notes/2022-mentorship/ep-0N.md` **and** all 7
`transcripts/2022 Mentorship/…Episode N.txt` (294 KB), plus
[`docs/s2-2022-mentorship-plan.md`](s2-2022-mentorship-plan.md) first per
`CLAUDE.md` §7. Part 1 is **one lesson per episode** (plan §3), so each lesson
has exactly one transcript and one notes block to answer to — a tighter test than
Section 1's.

**Two things to say up front about how different this section is.** Section 2's
lessons are **~3× denser** than Section 1's (Part 1 averages ~10 KB of lesson
HTML against Section 1's ~3 KB) and its notes are **far thinner** (all seven
episodes' prose totals 4.9 KB; ep-01 is five bullets). So the transcript carries
almost the whole evidentiary load here, and the lessons are long enough that a
drifted claim has more places to hide. Neither turns out to be a problem.

*(findings below, added as each episode was audited)*

#### Content fidelity (§1)

**p1-01 and p1-02 are the most faithful lessons audited anywhere in this corpus
so far.** Every substantive claim in both traces to that episode's own transcript,
usually to a line and frequently near-verbatim — and where the lesson's phrasing
matches the *notes* rather than the transcript, the transcript still supports it.
Checked exhaustively:

- **p1-01** — the three stages (transcript 199-236), the three-or-four-month plan
  including the March 2022 gap (240-242, 849-854), the daughter framing and
  "not a lot of moving parts / when not to do something" (69-84, near-verbatim),
  analysis paralysis → kid in the candy store → sharp edges → live ammunition
  (91-120, verbatim), all five promises (48-51, 175-196, 215-224), the
  independence/codependency passage (283-297, verbatim), the 2016 cohort's split
  results (302-309), responsibility as "paramount" (513-518), "transferable skill
  — but the skill must be honed by you the student" (552-555, verbatim), the 1992
  → bonds/S&P → intraday biography (140-164), TradingView (369-377), the
  handle arithmetic (692-697, verbatim), micros at $5/handle (734-740), the CFD /
  US-regulated-exchange point (741-760), "hypothetical income-based strategy …
  not the World Cup, not every Instagram trader" (643-648), 25 handles a week
  (726-729, 796-798), "you don't need to hit home runs" (799-800), the
  $1,500 rent / car payment inspiration (805-823), forgiving entries vs precision
  about bias (703-711, verbatim), and the liquidity matrix / no chart graffiti
  close (777-789).
- **p1-02** — the whole Judas-swing sequence (496-534), the "record this in your
  notes" rule (535-547, verbatim), the relative-equal-highs/engineered-liquidity
  read (578-624), the 1-/2-/3-minute rationale including the HFT
  15/30/45/60-second intervals (645-662), the four-step entry sequence
  (1076-1091), entry/stop/exit (806-810, 1092-1096), the don't-chase and
  sell-into-a-rising-candle passage (833-876), the FVG's 2016 provenance and the
  "not supply and demand, not auction theory" disclaimer (430-441, 735-739),
  premium/discount off a 50% fib (884-909), the worked resolution where price
  takes the sell stops **and** closes the earlier buy-side imbalance (903-976),
  low-hanging-fruit targeting (1199-1211, verbatim), the 8:30-11:00 window
  (1044-1068), keep-the-chart-clean (552-570), and all five homework items
  (1154-1227).

The four reasons given for the bearish weekly bias — **seasonality, the Fed
raising rates, earnings-season volatility, and the daily chart's heavy tone** —
are all four in the transcript (313-324), which is the kind of list a lesson
usually trims or embellishes. **No fidelity findings in either lesson.**

#### Coverage gaps

**G1 · should-fix · p1-02** — **the scale-down fallback for finding the FVG is
missing, and it is the answer to "what if I don't see one?"** The lesson names
the 1-, 2- and 3-minute charts as the best for imbalances and stops there. ICT
gives a procedure for when the gap isn't on the chart you're watching:

> *"if you don't sell there you can drop down to a lower time frame one minute
> chart — if this was a 3 minute chart you can go down to a one minute chart and
> look for that to occur on that time frame as well, and it many times will form
> … if you're looking at a lower time frame like say this was a 5-minute chart
> and you looked at a one minute chart you'd find one down in here. **It's a
> matter of scaling down in your time frames**, because once you have an
> underlying premise the market's likely to go lower it becomes an easy thing to
> look for these types of things"* (716-730)

The lesson's "Don't chase" callout offers a *different* remedy (you can still
enter as price moves down close to the gap), so a reader who cannot see a gap on
the 2-minute is left with nothing. This is the one actionable technique in
episode 2 that did not reach the lesson.

**G2 · nit · p1-01** — **the demo→live psychological shift is dropped**, and it is
the episode's one substantive teaching about trading rather than about mindset
generally:

> *"you can't appreciate how difficult it is until you start trading live funds …
> in the consistently quote-unquote profitable demo trading stage you feel like
> you can do anything, but something magical happens when you go into a live
> account where now suddenly **every little tick means something to you** …
> and **making money in an account is sometimes worse than losing money** because
> it will make you feel like you want another taste of that, and it creates
> opportunities for you to over trade and or over leverage"* (480-510)

The lesson covers what the mentorship asks of the reader but not this, though ICT
flags both over-trading and over-leverage as things the mentorship will return to.

**G3 · nit · p1-01** — **the "demo baller" framing is absent, and it is why the
episode exists.** ICT opens by explaining that he has always taught through a
demo account *"for my own protection"*, that he dubbed himself **the demo
baller**, and that a faction online claims his concepts cannot work in a live
account (10-14, 31-34, 267-282) — which is the entire reason episode 1 shows a
funded account at all. The lesson says only "For showing results outside a demo
account he used a regulated broker", so the reader gets the conclusion without the
question it answers. Related and also dropped: the account's actual size, which
ICT deliberately keeps unimpressive — *"it's only twenty three thousand … six
hundred ninety four dollars and eleven cents … it's not something to brag
about"* (633-639) — and his stated reason for that choice, that results too high
made him feel as a 1990s student that he would never get there, while results too
low inspire nobody (466-469).

**G4 · nit · p1-01** — ICT grounds the "transferable skill" claim the lesson *does*
carry (lesson line 36) in a personal disclosure the lesson drops: *"I'm
obsessively compulsive and I have ADHD … and I'm bipolar, so I have a lot of
mental barriers — but if I can sit down and frame out an idea that repeats at
least once a week, I'm confident that those individuals out there that are like me
or without these barriers can do it as well"* (534-551). So the lesson keeps the
claim and omits its warrant. Recorded as a nit rather than a should-fix because
omitting someone's disclosure about their own health is a defensible editorial
choice — flagging it as the owner's call, not a defect to fix by default.

**G5 · nit · p1-02** — two smaller drops. (a) The **anti-signal-service passage**:
*"you will not need to be a slave to some kind of blackbox system … you don't need
to be a part of a signal service … you want to be able to be **unshackled** …
if you're part of a signal service … you're kind of held captive"* (210-239).
Mild because p1-01 carries the independence theme at length, so the reader is not
short of it. (b) ICT's strongest statement of the algorithmic premise, and his
explicit rejection of the alternative: *"there absolutely is an algorithm and it's
manipulating the markets every single day, every single tick — it's **completely
controlled** … you're led to believe it's buying and selling pressure … no it's
not, **it's liquidity**"* (747-767). The lesson's FVG callout has "it is an
algorithm delivering price" but not the claim that the buying-and-selling-pressure
reading is the illusion being replaced.

#### Noted, not a finding

**p1-02 silently de-garbles a mangled number in the transcript, correctly.** The
transcript renders NQ's full-contract margin as **"$177,000"** twice (125,
131) — an ASR artefact. The lesson writes **≈ $17,000** (lesson line 16), which is
right for NQ at the time and is the only reading consistent with the same
sentence's *"about 12,000 and a half for an e-mini S&P"* and with episode 1's
*"12 13 000 or whatever it is to trade one contract"* (ep1:731). Same shape as
batch B's silently-corrected position-sizing formula and batch D's 2–3× rally —
a departure from the literal source in the direction of correctness. Flagging for
visibility, not repair.

**The trade's handle count is under-claimed, which is the right direction.** ICT
gives the executions as 798 short covered at 675 (184-191) — 123 handles — and
calls it *"over 100 and something"* (1027) and *"125 130 handles"* (1212). The
lesson says *"over 100 handles"*. Correct and conservative per §1.

**ICT promises PDF assignments that are not among the permitted sources.** *"there
will be assignments and pdf files provided for your learning"* (ep1:870-878),
reachable via his community tab. Same situation as batch E's dangling "measuring
gaps" reference to the December study notes: the PDFs are not in `transcripts/` or
`notes/`, so there is nothing to author from. Recorded so a later batch does not
read a lesson's silence about them as an omission.

---

**Episodes 3–4 added below.**

**p1-03 and p1-04 are also clean on fidelity.** p1-04 in particular is the most
exact lesson in the audit so far: episode 4 is an 8 KB transcript and the lesson
renders it almost line for line — both worked examples (S&P Wednesday 26 January,
Nasdaq Thursday 27 January), the "does it create a fair value gap? **No** — so
there is nothing to do" pass on both, the hypothetical 4419 → 4382 short with
ICT's own *"just to be, you know, not perfect"* framing (ep4:86-91), the
three journal items (104-117), the total-range-in-hindsight rationale (115-127),
and the "you can't force it, you can't think it's there, it's there or it's not"
rule (156-165, verbatim). Its quiz quotes the transcript directly twice
(`quiz.js:16`, `quiz.js:32`) and **both quotations are accurate to the word**.
Nothing added, nothing material dropped — **zero findings for p1-04**.

p1-03 checks out across all of it too: shift-vs-break semantics (ep3:57-92), the
equal-highs-over-single-high preference (36-43), the one-condition rule in **both
directions** (190-207 bullish, 522-531 bearish — the lesson states the mirror, so
this is not the one-sidedness family), trade-above-without-closing (397-399), the
next-candle FVG check (400-413), the order block as a change in the state of
delivery (714-739), the series-open reference level (433-442), "the algorithm
remembers that opening price" (733-734, verbatim), the high-probability triad
of gap + liquidity taken + structure shift (704-709), the don't-scale-just-below
rule (563-573), the two-FVG procedure and the nix-the-trade condition
(1240-1293), the HFT-orders-don't-move-price passage (624-655), engineered
liquidity (848-865), all four session windows (974-1003, exact), the
hours-of-operation callout including the after-noon prohibition and the
1:00/1:30-4:00 afternoon carve-out as out of scope (1004-1037, exact), the
internal-range-liquidity definition (1045-1048, verbatim), the 3–3.5% / 4.5% risk
parameters (1419-1425, exact), watch-the-chart-not-the-P&L (1338-1350), the
pre-desensitising point (1392-1406), keep-the-chart-naked (940-969), and the
whole homework block including *"look for this not being true"* (338-339).

**G6 · should-fix · p1-03 — ICT's provenance claim for the order block is
dropped, and the lesson carries the parallel claim for the FVG.** Episode 3 makes
the attribution emphatically and with dates:

> *"they're out here running around on YouTube trying to teach order block theory
> … **order blocks — okay, I invented it, it's mine. No one talked about it
> before me and I first mentioned it in 2010 on Baby Pips. Prior to that, 1996, I
> was only teaching it to people one-on-one** … you can't find it in books prior
> to that, it's mine"* (417-430)

p1-02 **does** carry the equivalent for the fair value gap — *"The FVG is not in
any book — it was introduced back in **2016**"* (p1-02 lesson line 59, sourced to
ep2:735-739). So the section keeps one provenance claim and drops the other, from
adjacent episodes, in the lesson whose subject *is* the order block. This is the
same family as **B4** (ICT crediting Chris Laurie, dropped) and **E10** (Nick Van
Nice, dropped), except the creator being credited here is ICT himself, and
`CLAUDE.md` §6 asks that attribution to the original creators survive any
refactor. Also dropped from the same passage: the Baby Pips 2010 origin of the
prove-me-wrong challenge that the lesson's own homework reproduces (340-351).

**G7 · should-fix · p1-03 and p1-01 — the micro contract's handle value is
given for the S&P and never for the NASDAQ, which is the section's main market.**
Episode 3 states it: micros are *"essentially two dollars per handle … or 50 cents
per tick"* (302-311), immediately contrasted with NQ's *"twenty dollars per
handle and there's four ticks in each handle"* (308-312). Both figures are right
(MNQ is $2/point, $0.50/tick). **Episode 6 states it a second time**, in the same
contrast — *"there's micros, you're only trading two dollars per handle there, it's
not twenty dollars per handle … or 50 cents each tick"* (ep6:267-270) — so the
figure is in **two** of Part 1's seven episodes and reaches **neither** lesson.
**p1-03 and p1-06 both omit it.** What the
reader has instead is p1-01's table row *"Micros — **$5 per handle**"*, which is
correct **for the S&P micro** and correctly sourced (ep1:734-737, *"while you're
not making fifty dollars per handle on e-mini S&P you're making five dollars per
handle"*), sitting in a table whose other rows are all ES.

The problem is what happens across the two lessons: p1-02 establishes **NQ as the
main focus of the mentorship** and gives NQ at $20/handle, but no lesson in Part 1
gives **MNQ at $2**. A reader who takes p1-01's "$5 per handle" into a micro
NASDAQ position is out by 2.5×, and there is no way to derive $2 from $20 without
knowing the 1/10 ratio. This is a number a reader uses to size a trade, so it
lands as should-fix rather than a nit. *Fix:* one row in p1-03, or a contract
label on p1-01's row.

**G8 · nit · p1-03 — the episode's live worked trade is dropped, and it is the
bullish mirror.** The last third of episode 3 (1217-1505) is a live long on NQ:
a bullish FVG after a bullish market structure shift with an imbalance in a
premium above, sized at **3.25%**, held through **$455** of drawdown, collapsed at
the low end of the target for **$1,190** (1449-1467). The lesson keeps every
*teaching* from that segment — the two-FVG rule, the risk parameters, the
watch-the-chart point, the desensitising point — and drops the trade. Recorded as
a nit rather than a should-fix precisely because the lesson's rule callout already
states both directions, so this is not the **A8/C9/D13** one-sidedness pattern; the
loss is a worked example, not a rule. Also dropped from the same stretch: ICT
noting the model as taught is deliberately partial — *"there are ways to know when
to sell short right above that, not even wait for the shift in market
structure"* (269-277) and *"that's all I'm going to give you on the free
mentorship level"* (735-736) — which p1-01 covers thematically as the
stripped-down model.

**G9 · nit · p1-03 — two scope statements dropped.** (a) *"this works in forex
too, it's not just limited to futures"* (539-542) — p1-01 carries the forex point,
so the reader is not short of it. (b) ICT's explicit refusal to extend the claim
to crypto: *"I'm not going to co-sign the crypto markets because … only my
students are reporting that this stuff works there, I don't even mess around with
it that much"* (556-561). That is a limit on where the model is claimed to work,
and §1's prefer-under-claiming reasoning makes a stated limit worth keeping.

#### Noted, not a finding (episodes 3–4)

**p1-03 de-garbles a second abbreviated number, correctly.** The slippage example
renders as *"you may think you're getting in at 14 62 but by the time your order
is executed and confirmed you're in 14 664 … and it filled you at 14 661, that's
positive slippage"* (642-650). "14 62" is ICT's shorthand; the lesson writes
**14,662**, which is the only value the bracketing 14,661 / 14,664 permits. Same
family as p1-02's $17,000 margin reading.

**Section 2 reports ICT risking 3–4.5% per trade; Section 1 teaches 1–2% as a
ceiling. Both are faithfully sourced — this is one for batch N.** p1-03 has
*"comfortable 3–3.5%"* and *"maximum 4.5% when trading competitively"*
(ep3:1419-1425, exact), and the live trade in that episode is sized at 3.25%.
Section 1 has *"ideally **2% risk, no more**, as a new trader"*
([m2-01/lesson.html:358](../content/s1-ict-core/m2/m2-01/lesson.html#L358)) and
*"**one percent makes millionaires** — 2% is the industry standard and you're
doing half of it"* (m2-04:482). A reader taking both sections at face value gets
a 4.5× spread in position size with no reconciliation. **p1-03 hedges it
correctly** — *"This is stated as a personal parameter, **not** a suggestion for
your size"* — and both numbers are what their own sources say, so neither lesson
is wrong and there is nothing to fix inside either. Recording it as a
**cross-section** item for batch N, which is where terminology and figures that
collide across sections belong.

---

**Episode 5 added below.**

**p1-05 is clean on fidelity as well.** Verified across the whole lesson: the
scope statement including the Russell 2000 and the Asian-range exclusion
(ep5:31-40), the four delivery-month codes and third-Friday expiration (48-73),
the front-month / next-month-out naming (76-81), the open-interest rollover rule
(105-121, near-verbatim), the barchart.com route including *"the first one, that's
the cash, you don't want to look at that"* (82-89), the 15-minute bellwether
framing (159-172), the 8:30-clone-lunch-clone layout (184-203), the New York local
time insistence and its stated reason (204-224), the noon-to-1:00 no-trade rule
*"not even in demo"* (226-234), the before-11:00 preference (246-264), the
three-candle swing definitions including *"it does not matter if the candles are up
or down closes"* (334-354, verbatim), the look-for-the-first-one rule (773-779),
the 5-minute drop-down (354-364), the third-drive-needn't-clear reasoning
(409-423), displacement and the elephant (432-457), the four-step walk-through of
passes and the final smash-down (496-525), the these-patterns-fail /
Murphy's-Law warning (459-479), the 1:30 rule and its stated reason (765-790), the
too-clean-level point (798-803), spooling and *"it does not matter what the volume
is"* (818-846), the two-patterns callout including *"you don't need breakers, you
don't need an order block"* (876-896, verbatim), the 3:40/3:50/4:00
market-on-close phenomenon (643-656), the NASDAQ 1:30 example (897-952), the
floor-has-dropped-out feel (941-952), the not-25-or-30-trades close (1073-1086),
the three daily profiles with the 200 + 200 = 400 measured move (710-724), the
Forex-daily-range parallel re-based to New York (678-696), the stand-aside-when-
noisy rule (996-1007) and the July/August caveat (1055-1058).

**Its attribution is intact, which is worth noting against G6:** the three drives
pattern is credited to *"Linda Raschke and Larry Connors' Street Smarts"* and to
its original name (ep5:372-402), and the lesson keeps both.

**G10 · should-fix · p1-05 vs p1-03 — the lesson says order blocks are out of
scope, two lessons after the section taught them as the entry reference, with no
reconciliation.** p1-05 line 25: *"**Order blocks are deliberately kept out of this
mentorship** — there are models that don't rely on them at all. The **fair value
gap is the main focus**."* Its two-patterns callout goes further: *"no fifteen
gimmicky names, no breakers, no order blocks."* But **p1-03 is built on the order
block** — a whole `<h3>` defining it as a change in the state of delivery, the
series-open as the reference level, and the entry stated as *"the **opening price
of the order block**, inside the fair value gap"* (p1-03 lesson lines 29-33).

Both lessons are faithful to their own episodes: ep3 teaches the order block at
length, and ep5 says *"yes I'll look for order blocks **but I'm going to try to
stay away from order blocks** in this lesson, in this mentorship really, because I
have models that don't even rely on order blocks"* (159-172). So ICT himself
narrows the model between episodes 3 and 5 — but a reader working through Part 1
in order meets a core entry technique in L3 and is told in L5 that it isn't part of
the model, with nothing joining the two.

Two smaller things in the same finding: p1-05 hardens ICT's *"I'm going to **try**
to stay away"* into *"deliberately kept out"*, and the reader is left unable to
tell whether p1-03's entry still stands.

**Episode 7 settles what the answer should be, which makes the fix concrete.**
ICT returns to the complaint and resolves it in practice: *"I went in long in close
proximity to this **order block** … I promised I wasn't going to teach order blocks
that much in this mentorship, and some of you have been leaving comments 'oh I'm
not into this now because you're not teaching order blocks' … I'm going to teach it
the way I want to teach it, okay, **it works**"* (ep7:480-493). So the order block
is still live as a reference — p1-07's own entry is taken *at* one, and the lesson
correctly says so (*"in close proximity to an order block, with no gap of its own
required"*). *Fix:* one clause in p1-05 — the order block from L3 remains a valid
reference while the fair value gap is the primary pattern from here on — or a
forward note in p1-03. No new sourcing needed; ep7 supplies the wording.

**G11 · nit · p1-05 — two morning-session diagnostics are dropped.** (a) **Rising
swing lows as an accumulation tell:** *"if you start seeing the swing lows that
are forming — every candle has a higher low to the left and higher low to the
right — if they start building up and every time they create a new one it's going
higher, **that's an underpinning of the marketplace that's showing
accumulation**"* (615-624), which ICT stacks with the relative-equal-highs /
retail-resistance read and the crowd's crash expectation (596-637). The lesson
carries the equal-lows half in its NASDAQ example but not this progressive-low
tell, which is the closest thing episode 5 offers to a bias signal.
(b) **The lunch-hour swing point is explicitly excluded** — *"especially if you
start seeing the swing lows, **not the one in lunch time, ignore that one**"*
(615-617). The lesson tells the reader not to *trade* the lunch hour but not to
exclude its swing points when marking levels, which is a different instruction and
one a reader annotating a chart will need.

**G12 · nit · p1-05 — two framing points dropped.** (a) Why the mentorship is on
index futures at all: *"right now in the last couple months really **Forex has
been rather funky**, and because of that we have transitioned to index futures …
there are times of the year where I teach index futures because they're
predominantly more liquid"* (1037-1054). The lesson states the scope without the
reason for it. (b) ICT's direct instruction against live trading, and his own
practice: *"**I'm actually telling you not to trade with live funds** … I'm not
going to do it in 2023, I'm not going to do it forever … even in my paid
mentorship group I don't trade live funds there because for my protection I'm
doing what I'm showing you right here **in a demo**"* (1087-1102). p1-01 carries
the not-an-enticement framing, so the reader is not without it, but the explicit
instruction is stronger than what survives.

#### Noted, not a finding (episode 5)

**p1-05 resolved a notes-vs-transcript conflict in the transcript's favour, and it
got it right.** `notes/2022-mentorship/ep-05.md` reads *"Afternoon follows the
trend most of the time, **7:30 starts algo**"*. The transcript is unambiguous:
*"at 1:30 that's usually when I'm wanting to start trading the afternoon … why
1:30, because **there's an algorithm macro that starts running at 1:30**"*
(780-790). The lesson uses **1:30** throughout and ties it to the macro exactly as
ICT does. This is the **inverse of E1**, where a lesson took a note-taker's line
over its transcript and inverted a definition — and it is direct evidence for the
method note added in batch E: when a note line and the transcript disagree, the
transcript is the one to follow, and a note figure that appears nowhere in the
audio is the tell. Worth recording as the positive case of that rule.

**Two more de-garbles, both correct.** *"Russell 200000"* (33) → Russell 2000, and
*"the three little **endings** pattern"* (400) → *"three little indians"*, which is
the actual name of the pattern in *Street Smarts*. Third and fourth instances of
the pattern noted for p1-02 and p1-03.

---

**Episodes 6–7 added below, completing the batch.**

**p1-06 and p1-07 are both clean on fidelity, and p1-06 is the most numerically
exact lesson in the batch.** Its live trade is reproduced to the tick — short
**2 minis at 14,792.5**, first partial **14,675**, limit filling the rest at
**14,647** (ep6:408-414), *"60 handles"* in *"eleven"* one-minute candles and
*"over a thousand dollars in a matter of time that would probably be longer spent
for someone that smokes a cigarette"* (372-378), inside a **120-handle** move
(396-400). Every figure matches. The three-candle criteria (111-120), the
candle-1-low / candle-2-resides / candle-3-high mapping (161-166), the paint
roller (123-129), the after-a-run-into-buy-side-liquidity condition (146-152),
the entry one tick above candle 3 with the stop above candle 1 or 2 and the
take-the-wider-one advice (167-177), the displacement range (192-199), the
no-gap-no-trade rule (213-218), the bullish mirror (219-237), the don't-mutate-it
warning (238-243), the 9:30-first-run-is-opposite rule (318-327), the
three-entries walk-through (331-356), the internal/external split with partials at
the internal (424-434), and the don't-roll-the-stop-early passage (380-393) all
check out. Even the waved-away return is quoted accurately (420-423).

p1-07 likewise: the four-down-candle range (7-40), the two up-closed candles
(135-140), *"being right is not equivalent to being profitable"* (180-181,
verbatim), the magic-bullet passage and the grey area (192-221), the full leverage
ladder — 4.5% max / 3.5% preferred / counter-trend dialled back / **under 1% for
you, "about a half percent or a quarter percent"** (97-127, 243-252), the
consolidation hurdle and *"Intel"* (51-61), *"no trading? no"* → intraday
liquidity pools, nimble, surgical strike, don't overstay (260-272), *"I don't know
… is not ignorance, it's not an absence of skill, it's honesty"* (1114-1118,
verbatim), the use-the-extreme rule (281-288), *"algorithms run on time and price,
not price and time"* (696-699, verbatim), the whole S&P-times-the-NASDAQ sequence
including **10:36**, entry **14,505.5**, exit **14,622.75**, **117 handles** and
**$2,345** (449-450, 928-931, 1340-1348 — all exact), the Dow/NASDAQ/S&P stacking
(542-554), confirmation-not-signal (555-570), the blown-accounts-in-the-'90s
admission (618-634), *"the Dow is not going down because buyers are coming in"* →
an unwillingness to deliver (679-686, verbatim), the macro definition (687-690,
verbatim), the George Angell single-contract technique and the feedback loop
(764-851), the **~$750** cost of the leaders and the **~$1,100** net day
(976, 1348-1350), the demo-can't-give-you-this limitation (898-909), the stop just
below the entry candle's low (388-395), *"I'm afraid to be wrong"* (716-729), and
the closing $60,000 / $144,000 / car-note contrast (1142-1181).

**G13 · should-fix · p1-07 — the narrative principle is stated as the reason the
whole model exists, and only its divergence-specific corollary survives.** Episode
7 has a passage on why ICT teaches this way at all:

> *"they have been fooled by listening to people talk about the **left side of the
> chart** all the time and they can't execute on the right side … if your educator
> can't trade on the **hard right edge of the chart** it … creates a false sense
> of confidence that quickly gets evaporated when you trade with a live account,
> or creates **analysis paralysis** … they call it SMC, smart money concepts, and
> they'll think this is what's going to have to happen in the chart, and it isn't,
> because **they're lacking narrative** … what's the logic, why should the market
> do what it's doing? **It's not enough to see how a low is taken out and expect
> it to go higher** … there has to be some greater context behind it"*
> (340-376)

The lesson does carry narrative — but only inside the *Cracks in correlation*
callout, as the thing a divergence needs before you trade it (*"hunting
divergences with **no narrative** behind why the pattern should even form"*). As a
general principle it is absent, and so is the left-side/right-side critique that
motivates it. This is the closest thing Part 1 has to a statement of its own
method, and it is the answer to "why do I need all these conditions rather than
just the pattern?" — the question the whole part provokes.

**G14 · nit · p1-06 — the time-based-chart defence is dropped.** The lesson
correctly carries *"time is the most crucial element"* (ep6:34-36), but not ICT's
argument for it against the alternative: *"there's some out there that will say
time-based charts are useless — that's because they don't know how to use a
time-based chart, because **algorithms, the first element they operate under is
time**. Hello, quants"* (108-110), stated alongside his dismissal of volume
profile and depth-of-market as *"a religion … your interpretation is a private
interpretation"* (100-107). Conspicuous because p1-06 is the lesson that makes
time primary.

**G15 · nit · p1-07 — three closing-section drops.** (a) **ICT's own stated
numbers**: *"it's 51 plus percent … in two weeks of trading"* on the shown account
(1068-1077), and *"I'm pulling out **$6,000 a week** consistently … the high 90% of
you could live pretty nice on $6,000 a week"* (1186-1193) — plus the community poll
asking whether **20% a month** is a respectable return, which came back
predominantly yes (1088-1093). The lesson keeps only the modest half of the
argument (car note, half the rent) and the $60,000/$144,000 contrast. §1 prefers
under-claiming so this is safe, and it is recorded partly because **20% a month is
exactly Section 1's stated optimal goal** (m2-04's *"+20% month — the optimal
trading goal"*), which is a cross-section resonance batch N may want.
(b) **"My goal is no losing days"** and the drawdown-correction stance —
*"I refuse to let my negative day stay negative at the close"* (1406-1408), *"I fix
the draw down, I know how to do that"* (1056), both explicitly hedged as
*"not something that you should have as a goal coming out of the gates as a new
student"* (1046-1049). Distinctive, contestable, and hedged in the source; the
lesson drops it entirely. (c) **Larry Williams** is named alongside the floor
trader and George Angell as a source of ICT's S&P insights (766-771); the lesson
credits floor traders and Angell. Angell *is* the right attribution for the
one-contract technique, so this is the mildest instance of the **B4 / E10 / G6**
family.

#### Quiz quality

**All 44 questions across Part 1 are source-traceable.** Every correct option and
every `e` checks against that episode's own transcript or notes — no repeat of
**C2** or **E1**, where an explanation restated something the source did not
support. Several `e` fields quote the transcript directly and **every quotation
checked is accurate to the word**: p1-04's *"8:30 in the morning starts the hunt —
basically that's what 8:30 in the morning is to me"* and *"this is a 5 minute
chart, this is the time frame you start with and you work down"*; p1-05's
*"don't trade during that time, not even in demo"* and *"that's the only two
patterns you need"*; p1-06's *"quick"*/displacement line; p1-07's *"No trading?
No."*, *"The Dow is not going down because buyers are coming in"* and *"I'm not
telling you to use 3 and a half percent"*.

**G16 · should-fix · FIXED — p1-06's quiz is the one badly-constructed set in Part 1, and
it is an outlier by a wide margin.** Measured the D15/E19/F14 way:

| Lesson | n | strict | expected score | median margin | not-longest | max spread |
|---|---|---|---|---|---|---|
| p1-01 | 5 | **0%** | **15%** | — | **100%** | 3 |
| p1-02 | 6 | 50% | 69% | 1 | 50% | 3 |
| p1-03 | 6 | 17% | 42% | 1 | 83% | 6 |
| p1-04 | 6 | 33% | 50% | 3 | 67% | 4 |
| p1-05 | 7 | 29% | 32% | 4 | 71% | 9 |
| **p1-06** | 8 | **75%** | **75%** | **6** | **25%** | **15** |
| p1-07 | 6 | 17% | 25% | 1 | 83% | 4 |
| **Part 1** | **44** | **34%** | **46%** | 3 | **66%** | 15 |

**Part 1 as a whole is well constructed** — 46% expected against Section 1's
quizzes at 76%, and consistent with **C17**'s figure for p1–p6 (36% strict / 43%
expected across 306 questions). **p1-01 is the best-constructed quiz found
anywhere in the corpus so far: a longest-clicker scores 15%, *below* the 25%
chance rate**, because the correct option is never uniquely longest in any of its
five questions. p1-07 (25%) and p1-05 (32%) are also at or below chance.

p1-06 breaks the pattern: **6 of 8 correct options are uniquely the longest, by a
median of 6 characters**, and it holds the batch's only question over spread 10 —
[`p1-06/quiz.js:58`](../content/s2-2022-mentorship/p1/p1-06/quiz.js#L58), *"When
may the protective stop be rolled down?"*, whose options run 38 / 44 / 45 / **53**
and where the correct answer wins by **8**. Four more win by 6:
`quiz.js:10` (candle three), `quiz.js:26` (the displacement range),
`quiz.js:50` (internal vs external, spread 10) and p1-05's `quiz.js:34`
(spooling). *Fix:* the same **mirror-pair / parallel-set** technique **C17**,
**D15** and **F14** identified — and p1-06 is unusually suited to it, since its
subject is a three-candle formation whose bullish and bearish versions are exact
inversions. `quiz.js:2` already does it correctly (*"The low of candle number
one"* vs *"The high of candle number one"*, 26 vs 27 characters), so the technique
is present in the lesson and just needs applying to the other six.

**Not re-flagged:** 43 of Part 1's 44 questions mark `a: 0`, the exception being
`p1-02/quiz.js` q1 at `a: 1`. **D14** settled that the `a`-index is harmless
(options Fisher-Yates shuffle at render), and it is noted here only because batch
D recorded Section 2 as uniformly `a: 0` — Part 1 has one exception.

#### Consistency — clean

Verified mechanically:

- All 7 lessons carry `data-month="p1"`; ids are `p1-NN`; **all 6 slugs present
  match their id prefix**, and p1-01 correctly has **no** `data-slug` — with the
  omission annotated in the markup (`<!-- no fig-slot: the notes carry no charts
  for this episode -->`), which is the Section 2 convention the structural
  observations noted Section 1 lacks.
- **Chart counts match the harvested notes exactly, 1:1 and in order** — ep1 0,
  ep2 2, ep3 2, ep4 2, ep5 2, ep6 3, ep7 4 = **15**, against 15 files in
  `notes/2022-mentorship/raw/` and 15 in `images/`. This is the Section 2
  equivalent of the **A12** check and it comes back clean. ep1 having no charts is
  correct: `notes/2022-mentorship/ep-01.md` is five bullets with no image
  references.
- **All 7 `video.txt` URLs appear in
  [`docs/s2-2022-mentorship-videos.md`](s2-2022-mentorship-videos.md)** and each
  maps to the right lesson id in that table (rows 10-16). The plan calls that
  table the only permitted source for a Section 2 video URL, so this is the §1
  check for videos and it passes for all seven.
- One episode = one lesson throughout, per plan §3: p1-01…p1-07 ↔ episodes 1…7,
  no re-cutting or merging.
- `python build.py` and `python verify.py` pass, 0 JS errors.

#### Batch G summary

| | |
|---|---|
| Lessons audited | 7 (episodes 1–7, ~294 KB of transcript) |
| Findings | **16** — 0 blockers, **6** should-fix, **10** nits |
| Fidelity findings | **zero** |
| Quiz questions traceable | **44 of 44** |

**The headline is that Part 1 has no fidelity findings at all — the first batch in
this audit to manage that.** Every substantive claim across seven lessons traces
to that episode's own transcript or notes, and the numbers are exact where they
matter: p1-06's trade to the tick, p1-07's 117 handles and $2,345, p1-04's
4419/4382, p1-02's 60/120-handle counts. The lessons are ~3× denser than Section
1's, which gave far more room for drift, and none appeared.

Three things about *why* it holds up, worth carrying into batches H–L:

1. **One episode per lesson removes the failure mode that produced Section 1's
   blockers.** **A2**, **C1**, **C2**, **D1** and **E1** all involved material
   migrating between lessons or in from outside the teaching. With a 1:1 mapping
   there is nowhere for that to come from, and the batch found no instance.
2. **The lessons follow the transcript when the notes disagree.** ep-05's notes
   say *"7:30 starts algo"*; the lesson says 1:30, which is what the transcript
   says (see the note under episode 5). That is exactly the discipline **E1**
   lacked, and it is the single most useful signal this batch produced.
3. **The de-garbling is consistently sound.** Five mangled numbers or names were
   silently corrected — $177,000 → $17,000, "14 62" → 14,662, "Russell 200000" →
   Russell 2000, "three little endings" → three little indians, and a dropped
   negation in ep7's *"now every single day is going to be a down clos candle"* →
   *"a bearish bias does not mean every single day closes down"*. Every one is
   right, and each is checkable against its own sentence.

**The weak dimension is coverage, as in Section 1 — but with a different shape.**
Ten of the sixteen findings are omissions, and they cluster into two kinds:
**attribution** (**G6** the order block's provenance, **G15**(c) Larry Williams)
and **the reasoning behind the method** (**G13** narrative and the
left-side/right-side critique, **G14** the time-based-chart defence, **G12**(a) why
futures rather than forex, **G2**/**G3** the demo-baller framing and the
demo→live shift). Part 1 reproduces *what* to do with unusual fidelity and drops a
noticeable amount of *why*.

**Two genuinely cross-lesson defects, both fixable with one clause each:**
**G10** (p1-05 declares order blocks out of scope two lessons after p1-03 taught
them as the entry reference) and **G7** (the micro NASDAQ handle value is stated
in **two** episodes and reaches neither lesson, leaving a reader with the S&P
micro's $5 for a section whose main market is NQ).

**Both quiz leads reverse relative to Section 1.** Part 1 scores **46% expected**
against Section 1's quizzes at 76% — and **p1-01 at 15% is the best-constructed
quiz in the corpus**, below the chance rate. The one exception, **p1-06 at 75%**
(**G16**), is the only Section-1-shaped quiz in the batch.

### Batch H — Section 2, Part 2 (p2-01 … p2-06 / episodes 8–13)

Sources read: all 6 `notes/2022-mentorship/ep-{08..13}.md` **and** all 6
`transcripts/2022 Mentorship/…Episode N.txt` (256 KB), plus
[`docs/s2-2022-mentorship-plan.md`](s2-2022-mentorship-plan.md) first per
`CLAUDE.md` §7. One episode per lesson throughout, as in Part 1.

Part 2 is the **densest quiz block in the corpus** — 49 questions across six
lessons (8.2 each), against Section 1's 3.8. It is also the first batch where ICT
teaches concepts Section 1 also teaches (order blocks, market structure), so
cross-section drift is newly possible in a way it was not for Part 1.

*(findings below, added as each episode was audited)*

#### Content fidelity (§1)

**Episodes 8 and 9 first.** p2-01 is a near-complete rendering of a 12 KB
transcript — the FOREX.com feed *"for forex pairs only"* (ep8:12-16), the
relative equal lows and the run higher (45-49), the two points of market
structure (59-68), the two fair value gaps in the leg (69-75), the horseshoes
analogy (79-92, near-verbatim), the 10 February 2022 daily candle and the
failure-swing allowance (94-109), both killzones (139-143, 259-273) and the
Asia/London-close concession (292-295), the New York-local-time insistence and
*"it won't work"* (155-157, 301-305), the two questions asked of each leg
(178-184), the two-gaps advice (186-193), the fib at **−1 standard deviation**
projecting **133.153** against a high of 133.153 (221-243), the OTE primer
pointer (230-234), and the 6E-front-month-continuous / yen-weak read (319-340).
One clause in it is inverted — **H1**.

p2-02 is likewise exact where it counts, and its numbers all check: the 2:34 pm
short-term low at **14528.50**, the **14520.25** limit and the *"28 even"*
alternative (ep9:507-521), the **14.25** handles of risk (528-532), **$85 → $300
≈ 3.5:1** (533-540), the **nine points** of heat one candle late (551-553), the
~five handles of unused stop room (618-623), the 4:00 bell versus his **4:30**
close (199-212), the four down-close candles anchored to the daily bullish order
block (160-170), and the order-block definition verbatim (171-181). No fidelity
finding in p2-02.

**H1 · should-fix · FIXED ·
[p2-01/lesson.html:16](../content/s2-2022-mentorship/p2/p2-01/lesson.html#L16)** —
**ICT's stated reason for disliking the yen pairs is reversed.** The lesson's
warn callout says they *"tend to **lack** the double return to a specific level
he likes to see."* The transcript has the opposite verb:

> *"now here is why i do not like the [yen] pairs okay i get questions all the
> time why don't you like [yen] pairs ICT, they move around nice, they do this
> they do that — **they tend to have like a double return to a specific level i
> like to see** and you're going to see it right here okay: swing high, the
> market rallies through that, there's no fair value out there, it drops back
> down in, then it runs again taking out this swing high"* (ep8:50-64)

He then demonstrates the double return happening on the chart in front of him —
price trades above the swing high, comes back, and takes it again. So the yen
pairs **do** the double return and that is the complaint; the lesson turns it
into an absence. The source sentence is genuinely garbled ("*have like a double
return to a specific level i like to see*" can be parsed two ways), which is why
this is a should-fix rather than a blocker — but the lesson resolved the
ambiguity in the one direction the words do not support, and §1 asks for
under-claiming when a source is ambiguous. *Fix:* state it as ICT does, or drop
the mechanism and keep only *"he does not like the yen pairs"*, which is
unambiguous in both the transcript (19-20, 248-251) and `ep-08.md`.

#### Coverage gaps

**H2 · should-fix · p2-02** — **the account-level consequence of trading a
chopped-up session is dropped, and it is ICT's stated reason for the whole
avoid-the-morning rule.** The lesson's *Don't chase it* callout ends at *"Expect
chop, not precision, and don't try to trade in and out of it."* The transcript
goes considerably further, twice:

> *"I personally don't think that this is high probability trading — you can get
> chopped up, you can get losing trades, you can draw your account down, if you
> don't control yourself **you can blow your account in these types of
> conditions**. How do you avoid that … if you're a high frequency type of a
> trader, **how do you draw back on the frequency and look for the better
> setups**?"* (ep9:398-418)

> *"that idea leads many times to losing trades and then it starts this cycle
> where you go into this chasing chasing chasing, and then when the market does
> these sideways consolidations and sloppy choppy market conditions **it's
> literally like a blowtorch on your account** … you can literally talk yourself
> into millions of trades and then draw your account down"* (576-594)

So the lesson keeps the instruction and drops both the consequence and the
prescription (reduce frequency, wait for the better setup) that answer *why*.
Same family as **A4** — the lesson tells the reader what to do and not where the
idea costs them money.

**H3 · should-fix · FIXED · p2-02 and G7 — the micro risk figure implies $1 per handle,
which is wrong, and it now conflicts with p1-01's $5.** The lesson reproduces
ICT's sizing: *"about **14.25 handles of risk**, roughly **$85 on six micros to
make about $300** — somewhere near **3.5 to 1**"* (ep9:528-540). On MNQ, which is
the instrument on screen, 14.25 handles × 6 micros × **$2** = **$171**, not $85 —
ICT has multiplied 14.25 × 6 and treated the micro as **$1 per handle**. He flags
his own roughness in the same breath (*"I'm roughing, I don't have a calculator in
front of me folks, just you do the math"*, 540-543) and the lesson drops that
hedge. Also dropped from the same passage: the heat expressed in money
(*"nine points of heat … basically **$54** if you were trading six micros"*,
551-554) and the mini's *"**$20 per handle**"* (555-558) — which is the one
figure in the episode that is right and that a reader could scale down from.

> **Corrected after reading episode 13 — the second half of this finding was
> wrong.** As first written, H3 concluded that *"G7 was logged as a Part 1
> coverage gap; it is now a **Section-2-wide** one"*, on the evidence of the
> first three Part 2 episodes. **That is not true.** `p2-06` states the figure
> explicitly — *"Micro E-mini NASDAQ — **1 point = 4 ticks = $2**"* — sourced to
> ep13:344-349 (*"this is the micro e-mini nasdaq, so every one point, or four
> ticks, is equivalent to two dollars"*). The correct MNQ handle value **does**
> reach a lesson, four lessons after p2-02. See the **G7 verdict** in the batch
> summary; the paragraph below is the corrected version.

**What this actually is: an internal contradiction inside Part 2, four lessons
wide.** p2-02 reproduces arithmetic implying **$1** per micro handle; p2-06
states **$2** outright. Both are faithful to their own episodes — the error is
ICT's rough mental maths in ep9, not the author's — but a reader working through
Part 2 in order meets a sizing example that is out by 2× and then, four lessons
later, the figure that shows it was. That makes this **more** actionable than
when it looked like an omission: the correct number is already in the corpus, so
the fix is a pointer rather than new sourcing. *Fix:* restore ICT's own hedge
(*"I'm roughing, I don't have a calculator"*), or add the $20/handle mini
reference he gives in the very next sentence, or cross-reference p2-06's row.
**G7 itself narrows to Part 1**, where it was logged and where it still holds.

**H4 · nit · p2-02 — the squawk-box sentiment read is dropped.** ICT describes a
practice for reading the crowd in real time:

> *"as a personal study there's two or three YouTubers that I watch that trade the
> equities market indices … I'd like to read kind of like a **Squawk Box** what
> their interpretation of price is … so when I'm watching price **I'm listening
> for them to want to be a buyer** — when they're trying to be a buyer that means
> they're already hunting a continuation of this move, [and] **I want to see a
> low form**"* (ep9:312-338)

The lesson carries the retail-mindset logic in its other form (the stops jammed
under the relative equal lows *"because that is what the books say to do"*), so
the reader is not without the idea — but the episode's one described *method* for
knowing the crowd is leaning the wrong way is absent. Recorded as a nit because
the lesson's timing rule is a clock rule (wait past 1:00 pm), so nothing
actionable is missing.

**H5 · nit · p2-02 — a scope qualifier sits on the wrong claim, following the
note page rather than the transcript.** The lesson attaches *"(this part is not
forex)"* to the **consolidation-after-a-big-run** claim. ICT attaches it to the
**avoid-the-morning-session rule**: *"if there's a big move overnight for
equities — this is not forex okay, this part is not forex, it's just for trading
like NASDAQ, Dow and e-mini S&P — if there's a big run overnight avoid the New
York session"* (ep9:353-359). Of the don't-chase principle he says the opposite:
*"when you're trading equities **this also works with forex too**, so it's
important, try not to chase price"* (262-265).

The lesson's placement traces to `ep-09.md` — *"For equities typically when a big
run up or down happens (not forex) we see a consolidation shortly after"* — so it
**is** sourced and this is not a §1 breach. Two things soften it further: the
lesson's rule callout names *"NASDAQ, Dow or e-mini S&P"* explicitly, so the
equities-only scope is carried where it matters most, and the misplacement costs
the reader nothing they act on. What is genuinely lost is ICT's statement that
the don't-chase principle **does** extend to forex — which matters here because
the immediately preceding lesson, p2-01, is the forex lesson. Recorded as the
batch's first instance of the notes-vs-transcript divergence that batch G named
as Part 1's most useful signal; unlike **E1**, nothing is inverted.

**H6 · nit · p2-01 — the episode's one interactive instruction is dropped.**
Before marking anything up ICT stops and hands the chart to the reader: *"I want
you to take a look at [the chart], do your own mock-up on it … pause the video if
you're not ready"* (ep8:36-39). Part 1's lessons carry ICT's homework blocks
(p1-02's five items, p1-03's *"look for this not being true"*), so this is a
departure from what the section otherwise does with the same kind of instruction.

**H7 · nit · p2-01 — the reason the mentorship is on indices at all is stated
again here and dropped again.** *"it's predominantly a forex channel and it's
only been recently with the 2022 mentorship I'm talking and teaching about the
stock indices"* (ep8:278-282). This is the second statement of the point
**G12**(a) logged from ep5 (*"forex has been rather funky … we have transitioned
to index futures"*), and neither lesson carries it. Conspicuous specifically in
p2-01, the lesson whose whole subject is the return to forex.

#### Noted, not a finding (episodes 8–9)

**ICT points at material outside the permitted sources, twice.** He walked
through a Judas swing *"last week on my community tab"* and was *"only off by a
quarter of a point for the low"* (ep9:77-84, referenced again at 265-274), and
the bonus setup at the end is *"exactly right out of my high probability
short-term trading or scalping series"* on the YouTube channel (ep9:648-655). The
lesson names the second (*"from the pattern already taught free in his short-term
trading series"*) and not the first. Neither is in `transcripts/` or `notes/`, so
there is nothing to author from — same situation as batch G's PDF assignments and
batch E's December study notes. Recorded so a later batch does not read the
silence as an omission.

**p2-01 under-claims a fib projection's precision, in the safe direction.** ICT's
−1 standard deviation lands at **133.153** and he reads the actual high as
*"133 15 and three"* — i.e. 133.153, an exact hit, *"right to the point that
you'd be looking for"* (ep8:235-241). The lesson writes *"the high printed at
133.15"*, dropping the third decimal that makes it exact. Wrong direction for
impressiveness, right direction for §1.

---

**Episodes 10–11 added below.**

**p2-03 and p2-04 are both clean on fidelity, and p2-03 is the most complete
rendering of a long transcript anywhere in this audit** — a 70 KB episode
reproduced across 15 KB of lesson with nothing added. Verified exhaustively:
forexfactory and the red/orange/yellow impact scale (ep10:26-39), the 8:30 news
embargo and the smokescreen/catalyst pair (40-59), *"the number one question I
get is ICT can you please teach me the daily bias"* (79-89) and the *"brass
tacks"* answer (90-99), the bearish/bullish daily shapes (215-228), *"take the
close out"* (443-451, near-verbatim), the one-down-day-takes-you-out-of-your-game
passage including *"I felt that too in the 90s"* (240-248), the three-candle
swing and the Williams-fractal dismissal (456-465), the opening-range
construction and *"my students are actually going to smile"* (325-350), *"every
premium array … will reside and form in the range between the open and its
high"* (332-342), close-proximity entries and the can't-chase rule (350-372,
516-519), the three phases mapped onto the day (316-323, 403-416), the 3:30/3:45
time reference for the low (417-430), the whole daily walk-through in both
directions (166-188, 471-575), the paint roller (682-710, near-verbatim), the
17 February bias (751-768), the midnight-open dashed level (769-778), the
pumping-ahead-of-8:30 read (914-928), the 7:00 am sweep (929-932), the
energetic-versus-lethargic market structure shift test (941-951), the
5→4→3→2→1 strip and *"you don't have a trade"* (953-974), the two-gap money
management rule (932-937, 1009-1014), the bearish breaker and the lower-half
stop foundation (1017-1032), the lowest-threshold entry (1057-1066), the
**14381** target and the ×2 projection (890-896, 854-860), the 15-minute
bellwether passage (867-887), the discount-margin warning and the 100-point
one-minute candle (1096-1114), the **$10,000** minimum and **$15,000** preference
(1146-1150), the ~**$22,000** house margin (1306-1309), the raise-the-margins
tell (1438-1447), the **582%** two-week paper account with its three losing
trades on the 14th and every disclaimer attached to it (1226-1302, 1409-1421),
*"traders are professional losers … a professional management company of losing
trades"* (1590-1602, near-verbatim), the two-down-closes / five-up-closes count
and the over-leveraged/over-trading diagnosis (1614-1632), write-your-intentions
(1503-1508), the backtest-annotation method (1552-1572), months of tape reading
(790-795), the replay-versus-screen-recording point (824-832), and the
bullish-fair-value-gap complaint that closes it (1491-1503).

p2-04 likewise checks out end to end, and its numbers are exact: the 8:30 open at
**13,798.50** (ep11:204), the **10:33** fill at **13,858.25** and the
**13,612.25** exit (153-158, 285-293), the **$4,920** close (875-876), the
three-day rebalance (73-76), the 1:00 pm holiday close and 6:00 pm reopen
(124-129), the nesting-of-highs reasoning in full (294-348), the halo system
(415-443), the swing-high definition (408-414), the alternative entry and the
explicit *"I'm not waiting for a breakout below that low"* (526-556), the
don't-need-the-highest-high rule (560-564), the demo-after-a-win practice
(619-632), the dopamine/no-support-structure passage (671-703), *"if you keep
pushing your edge you're gonna dull it"* (704-712, near-verbatim), the
trader-styles list (757-775), and the broker settlement adjustment that is
*"not a losing trade"* (836-857).

**p2-04 carries the Larry Williams attribution in full, and that is the clearest
counter-example this audit has produced to the attribution family.** ICT credits
the short-/intermediate-/long-term high framework to *"Larry Williams … a video
course that I bought back in the early 90s … the Future Millionaires Confidential
Trading Course … four VHS tapes"* (364-377) and to *"his book How I Made a
Million Dollar[s] Trading Commodities Last Year … a lot of things in that book I
think is just fluff, all the moon phases … but his chapters on market structure …
are still true today"* (449-463). The lesson reproduces the course, the format,
the book, the recommendation **and** the moon-phase caveat. **B4** (Chris Laurie),
**E10** (Nick Van Nice), **G6** (ICT's own order-block provenance) and **G15**(c)
(Larry Williams himself, dropped from p1-07) all logged the opposite. So the
family is not a systematic authoring habit — p2-04 shows the section doing it
right, which makes the G6 fix a matter of applying an existing practice rather
than establishing one.

#### Coverage gaps (episodes 10–11)

**H8 · should-fix · p2-03 — "model" is used three times and never defined, though
the episode defines it.** The lesson's practice callout opens with *"Write down
your **intentions** each morning before the market opens — that is the purpose of
having a model"*, and its closing paragraph turns on *"the bias was bearish"*
being what a model would have told you. ICT spells out what a model actually
contains:

> *"once … you can formulate a well-written **model on paper** where everything is
> outlined: **when do you buy, when do you sell, where do you put your stop at,
> when do you move your stop, how many contracts do you trade, what constitutes a
> day where you don't take a trade** — all those types of things, I will teach you
> those lessons in this YouTube mentorship"* (ep10:1329-1344)

That is a six-item checklist, it is the answer to *"what is a model?"*, and it is
the one thing in the episode a reader could act on the same evening. Same shape as
**D3–D8** — the lesson leans on a term its own source defines and the definition
does not survive.

**H9 · should-fix · p2-04 — the exit is given as a number and the reasoning
behind it is dropped, including the fact that he missed his own target.** The
lesson says only *"the exit, after the holiday reopen, was 13,612.25"*. ICT
explains the whole decision:

> *"I was looking at the **13,590 / 13,586 level** real time and **I couldn't get
> to my screen fast enough** to close it out there, and **I didn't want to put a
> limit order in** because if it got really far down below and started running
> with a lot of speed, I didn't want to limit my profitable exit — so I just left
> it **open-ended** and I wanted to see how far it would reach down in there"*
> (ep11:136-152)

Three things go with it: the target he was actually working to, his stated reason
for not resting a limit order at it, and the admission that the fill he shows is
a manual exit he was late to. As written the reader gets a clean 246-handle exit
that reads as planned. This is the episode's only exit-management teaching, in a
lesson whose subject is one trade start to finish.

**H10 · nit · p2-04 — "two separate reference points", followed by a table of
three.** The lesson says *"They are **two** separate reference points:"* and then
lists midnight, 8:30 **and** 1:30. ICT's sentence is explicit that there are two
(*"there's two reference points being specifically dealt with there … the entire
daily range … the opening price at midnight, but … the morning session … the 8:30
in the morning opening price"*, ep11:219-228) and the transcript never mentions
1:30. The third row is properly sourced — `ep-11.md` reads *"AMD for entire daily
range starts at 12:00 am / AMD for the AM session start at 8:30 am / **AMD for the
PM session starts at 1:30 pm**"* — and it agrees with p1-05's 1:30 afternoon macro
(ep5:780-790), so nothing is wrong with the content. Only the lead-in sentence
mis-counts its own table. *Fix:* say "three", or split the notes-sourced PM row
out of the pair ICT names.

**H11 · nit · p2-04 — two "this is not what you think it is" warnings dropped.**
(a) *"when they see me put a rectangle in the chart they're saying 'oh it's
**supply and demand**' — it's not, there's so many more factors involved that it's
just not even in the same vicinity"* (352-358). p1-02 carries the equivalent
disclaimer for the fair value gap (*"not supply and demand, not auction theory"*),
so the reader is not without it, but this is the lesson where the rectangles are
actually drawn. (b) The warning against second-hand teaching: *"watching someone
else parrot what I say and then say 'wow he did it in five minutes, he's teaching
it better' … you have no idea what you're doing, you're not even teaching it
correctly, and those that believe they're learning it correctly are going out
there and **wrecking themselves**"* (388-398).

**H12 · nit · p2-03 — the model's applicability to the other sessions is
dropped.** Having shown the rebalance happening in the London session, ICT
generalises: *"that's how you can use that model — the same model, you can use it
in **Asian session** (you ain't going to get a lot of movement, it's typically not
a lot of movement in that time of day), but you can trade it in **London close**,
you can trade it in the **New York open** like I'm teaching you, and **London
open** — London open, if you know what you're doing with a daily bias you can
catch **enormous moves** … but sometimes you're going to have to weigh out a lot
of give and take back and forth"* (ep10:659-678). p2-01 gives the two forex
killzones, so a reader is not without session guidance, but this is the statement
that the daily-bias framework itself is session-agnostic — and it comes with its
own caveat, which §1's prefer-under-claiming reasoning makes worth keeping.

**H13 · nit · p2-03 — the legal reason ICT teaches on a demo is dropped for the
third time in the section.** *"that's the number one reason why I taught for a
long time with a demo and still teach with a demo, because number one **legal
reasons — I'm not trying to be held liable because I'm not licensed to give trade
advice** … but it's not trade advice in a demo account"* (ep10:1171-1181),
together with the promise to publish the live account *"line by line, every single
trade"* at year end (1184-1191). The lesson carries the paper-account disclaimers
but not the reason behind the practice. This is the third statement of it in
Section 2 — **G3** logged it from ep1 (*"for my own protection"*, the demo-baller
framing) and **G12**(b) from ep5 (*"even in my paid mentorship group I don't trade
live funds there because for my protection"*) — and no lesson carries it. Logged
here as the recurrence rather than a new gap: it is now the single most-repeated
dropped point in Section 2.

#### Noted, not a finding (episodes 10–11)

**Three more de-garbles, all correct — the pattern from Part 1 replicates.**

| Transcript | Lesson | Check |
|---|---|---|
| *"that's $1,000 times your eight contracts you just lost **$88,000**"* (ep10:1128-1130) | **$8,000** | 50 pts × $20 × 8 = $8,000 ✓ |
| *"almost 20 $2,000 to trade one contract"* / *"almost **$22,000** … you need about **$222,000** … about $17,604.13"* (ep10:1306-1309, 1435-1437) | *"close to **$22,000** per contract"* | the only self-consistent reading ✓ |
| *"that's not a little bit of ticks okay **204 some plus** handles … you take that **240 sum** times that by four"* (ep11:159-163) | *"Over **240 handles**"* | 13,858.25 − 13,612.25 = **246** ✓ |

Eight silent corrections across Parts 1 and 2 now, and every one is right and
checkable against its own sentence. The third is also **conservative** — the true
figure is 246 and the lesson says "over 240", which is the direction §1 asks for.

**Episode 10's micro reference is a margin figure, not a handle value, so it does
not bear on G7.** The lead for this batch flagged *"the micro for less than a 100
bucks"* (ep10:1102) as a possible third statement of the micro's handle value. It
is not — it is what a discount broker will let you post to trade one, and the
lesson carries it correctly as *"a micro for under a hundred dollars"* in the
margin warning. The episode does imply the **mini** at $20/handle through the
slippage arithmetic (50 points × 8 contracts = $8,000), but never states it. So
after three episodes of Part 2, **G7 stands unchanged on the omission side** and
is strengthened only by **H3**.

**p2-04 renders chart-free and the source agrees.** `ep-11.md` carries no image
references, `images/` holds none for it, and the lesson annotates the omission
(`<!-- no fig-slot: the notes carry no charts for this episode -->`) per the
Section 2 convention. So a nine-question live-trade lesson with no charts is
correct, not a scrape gap — the same answer **A12** reached for Section 1.

**ICT's forward price targets are dropped, correctly.** *"I like 13,300 … and
maybe even if we get really excited it can trade down into 12,850, 12,875 … I'm
not suggesting you should take a trade in it or not, just thinking out loud"*
(ep11:792-803). Explicitly hedged speculation about the future; omitting it is
what §1's prefer-under-claiming asks for.

---

**Episode 12 added below.**

**p2-05 is clean on fidelity, and it is the hardest lesson in the batch to have
got right** — a 70 KB transcript of material ICT says he has never taught anyone,
rendered into 15 KB without a slip. Verified across the whole lesson: the opening
warning and *"even my paid mentorship group has yet to see"* (ep12:6-16), the
works-in-forex/stocks/bonds scope and the mining-the-vein framing (26-45), the
not-picking-tops-and-bottoms disclaimer including that he teaches the paid group
the same (59-68), the four-part narrative question and *"that is the number one
question that I have before I sit down in front of my charts"* (144-160), the
rejection list (161-168), *"lipstick"* and the labels-in-my-mind-not-on-my-chart
practice (200-212, 326-334), the daily-range-won't-always-submit caveat and the
lecture's stated purpose (182-199), the parent/child hierarchy and the
volume-on-the-daily reasoning (264-268, 496-513), the long-term-high invalidation
and the *"demand more information … sit on my hands"* response (269-283), the
cost-of-doing-business passage (283-289, near-verbatim), the false-bull-flag fade
(299-314), **the central rule** — *"every single time price rebalances an
imbalance … that swing … I immediately label … as an intermediate term high or …
low"* (316-343, near-verbatim) — the ITL/ITH short-term-low symmetry (344-350,
978-980), the between-two-STHs definition (408-413), the two classifications
(981-989), the Larry Williams departure with the VHS course and *Long-Term
Secrets to Short-Term Trading* out of a 2,000-book collection (426-440, 523-531),
**the tell** (561-573, 897-903), the anticipated failed swing and the order block
forming live (596-608), the don't-force-it response (989-1000, 1250-1259), the
John Murphy passage and *"we don't do technical analysis, we do technical
science"* (370-392, verbatim), the daily/hourly/15-minute/lower ladder (678-690),
don't-over-mark (671-678), the fractal (658-664), **the order-block definition and
*"that is not my order block … stop teaching that"*** (588-596, 1035-1046), the
aggressive entry that needs no swing low broken (623-627, 932-944), the
one-candle drawdown against a many-times-risk objective (1085-1096), the classic
low-risk short (1011-1018), the quarter-point precision claim and *"don't take my
word for it"* (1021-1034), the colouring-outside-the-lines allowance (1111-1127),
the significant-break threshold (690-696, 738-746), range replication (747-754),
the fib anchored ITH→LTL at **−1.5 standard deviation** (755-777), *"the
retracement that fails … that starts the decline"* (770-776), institutional order
flow in both directions (1282-1286), speed bumps (1221-1228), the
nearest-candle-not-overcome reasoning (1177-1192), the one permitted violation
(1270-1281), the two components (1241-1250, 1291-1296), the neutral close and the
full no-trade list (1390-1402, 1582-1590), the high-probability grading rule and
the 1990s blown accounts (1444-1476), the riddle and the two principles
(1652-1700), the offer-buyers-an-opportunity explanation (1620-1642), the salmon
(1338-1350), the counter-direction traps (1367-1381), and the five-day forecast
horizon with *"it took me six years"* (720-737).

**A second notes-versus-transcript divergence, resolved the right way.**
`ep-12.md` renders the permitted-violation rule bearishly — *"In bearish
conditions, all upclosed candles should be respected … If that doesnt happen its
only allowed if theres a **STH above it**"* — while the transcript states it
bullishly: *"those down closed candles should support price … if it does [go
below] it's only permissible if there's a **short-term low in close proximity** to
it, and it's then likely just go down and take out some sell stops if it's
bullish and then reaccumulate"* (1270-1281). The two are mirrors and neither is
wrong, but the lesson follows the **transcript**. Second instance in this batch
(after **H5**, where it followed the note) and consistent with batch G's finding
that Section 2 gets this discipline right where **E1** did not.

#### Coverage gaps (episode 12)

**H14 · should-fix · FIXED · p2-05 — the algorithmic rationale for the whole taxonomy is
dropped, and it is the answer to "why should I classify highs at all?"** This is
the pattern the batch lead predicted would hurt most in p2-05, and it does. Two
passages, both absent:

**(a) Why the labels correspond to anything.** ICT builds the bridge from the
algorithm to the structure explicitly:

> *"if there's an algorithm that means it must follow some form of **logic**. And
> how does it reference how far to go up and how far to go down? **It cannot see
> your stop** … it doesn't see Michael's stop, it doesn't see Renee's stop … that's
> outside of its capability. **But it knows where people will have their stops
> based on these ideas** — short-term high, short-term low, intermediate term high,
> intermediate term low, long-term low, long-term high — **and where the imbalances
> are**"* (806-841)

That is the entire justification for the lesson. Without it the taxonomy reads as
an arbitrary labelling scheme; with it, every label is a stop-location forecast.
The lesson's closing *two principles* callout carries the conclusion (liquidity
and imbalance) but not the step that connects it to market structure.

**(b) ICT's own hedge on what he is teaching.** He is careful, twice, that the
labels approximate the algorithm rather than being it:

> *"I'm leaning on algorithmic principles that are in the marketplace **that can't
> be taught to you**, but **I'm creating a language** so that way you can see it
> visually in your chart and you can measure and reference certain things — **not
> exactly like the algorithm does, but very very close** to what it's doing"*
> (851-862), and *"I made a **language** within price charts that communicates very
> closely what it's doing … this is the language that **I created** for all of you"*
> (1066-1075)

The lesson does explain why the labels sit on the chart (*"to communicate how he
internalises the structure"*) — that is the chart-hygiene reason, from a different
passage (326-334). The epistemic hedge is a different point and it is the one §1
cares about: a source that says *"very close, not exact"* about its own model, in
a lesson the reader will otherwise take as a set of hard rules (*"Write this one
down"*). Dropping a source's hedge is the same defect as adding a claim, in the
opposite direction.

**H15 · should-fix · p2-05 — the bullish counterpart teaching is dropped, and it
is a direct correction of a retail reading.** The lesson works the whole example
bearishly and states the bullish side only as one-clause inversions (*"The bullish
case is the same idea inverted"*; *"Bullish swings — down close candles are your
support"*). ICT gives a concrete bullish application that is not an inversion of
anything in the lesson:

> *"when you hear people talk about market structure and they're looking for a
> higher high, higher high, higher high … and then you have a **failed higher
> high** and then it breaks the swing low right before that failed higher high —
> **they look at that as a change in trend. Not all the time. Many times that's a
> good buying opportunity for me**, because really that's just coming back down to
> a deep discount, and I'm going to buy those and continue higher"* (476-490)

So the pattern the retail reader treats as a trend reversal is often ICT's entry.
This is the **A8 / C9 / C10 / D13 / E18 / F10** one-sidedness family, in its milder
form — the mirror *rules* are stated, so nothing is left undefined; what is lost
is the one worked bullish application in a 70 KB bearish lesson, and it happens to
be the passage that corrects the most common misreading of the subject.

**H16 · nit · p2-05 — the closing homework instruction is dropped, the second
time in this batch.** ICT ends with a specific assignment: *"I want you to go back
to your charts and **look at every time the market rebalances, classify that as an
intermediate term high or intermediate term low** … and then watch how price stays
away from violating it"* (1315-1322). With **H6** (p2-01's mock-up instruction)
this makes two of five Part 2 lessons dropping an explicit study instruction that
Part 1's lessons carried (p1-02's five homework items, p1-03's *"look for this not
being true"*). Worth recording as a small pattern rather than two isolated nits —
and it is the cheapest of all the gaps to close, since the wording exists.

**H17 · nit · p2-05 — the Baby Pips attribution is dropped from a line the lesson
otherwise keeps.** The lesson's *Why anchor there* callout opens *"The answer to
the question he was asked constantly on **the forums**"*. ICT names the forum:
*"when I was on **Baby Pips** I got lots of emails all the time and people would
post in the forum, why are you anchoring your fib to that swing high and not this
swing high"* (786-791). Trivial on its own; logged because **G6** flagged Baby
Pips as the venue for the order-block provenance claim, and this is the batch's
only other occurrence of it — in a *different* context, which is the useful part
(see the G6 verdict in the batch summary).

#### Noted, not a finding (episode 12)

**The lesson correctly declines to de-garble an unusable figure.** ICT says the
outlined move *"moved **14,500 points** based on that logic — that's a lot, that's
a very significant price move"* (1543-1546). On a NASDAQ trading near 14,000 a
14,500-point move is impossible, and unlike the eight de-garbles logged so far
there is no bracketing sentence that fixes what he meant. The lesson omits the
figure entirely rather than guessing at it. That is exactly what §1 asks for when
a source is ambiguous — flag the gap, don't fill it — and it is worth recording
beside the de-garbles as the case where the same author correctly did **not**
correct.

**Two self-referential passages dropped, both in the safe direction.** *"I gave up
**millions of dollars a year** to come out here and teach for free … what's in it
for me? **I'm already rich**, I already know how to trade"* (1716-1731), and the
trust-can't-be-transposed answer to *"how do I know I'm going to sell above an old
high"* (100-117), whose substance the lesson carries elsewhere (*"you cannot learn
it in one video"*, *"it took him six years"*). Omitting the first is what
under-claiming looks like.

**A forward reference the lesson does not need to carry.** *"framing that within
the context of forex they would be utilizing the fundamental idea of **interest
rate differentials**, which I'll talk a little bit about, not in this lesson"*
(920-926). A pointer to material outside episode 12; recorded so a later batch can
check whether the promise is kept.

**p2-04 and p2-05 cite two different Larry Williams books, and both are right.**
p2-04 has *How I Made a Million Dollars Trading Commodities Last Year*
(ep11:449-451); p2-05 has *Long-Term Secrets to Short-Term Trading*
(ep12:434-436). ICT names a different book in each episode and each lesson follows
its own source. Not a consistency defect.

---

**Episode 13 added below, completing the batch.**

**p2-06 is clean on fidelity, and it holds more verbatim quotation than any other
lesson in the batch — nine direct quotations, every one accurate to the word.**
Checked: *"it's one thing to talk about it and provide the basis as to what I'm
doing when I'm doing these executions"* (ep13:11-15), *"20 isn't money — it's a
percentage"* (86-88), *"if you don't aim for a target you're going to hit nothing
100% of the time"* (1098-1100), *"I got into a trade and then I tried to figure
out what I was supposed to do once I was there"* (204-206), *"eats at you like
mental cancer"* (413-414), *"stop thinking you need a lot to make a lot"*
(928-930), *"well, there you go — you probably did the right thing by getting
stopped out, because it might be failing and going lower"* (766-772), *"period.
That's it"* on the three ingredients (518), and *"it's yours — like riding a
bike"* (1237-1246).

The rest checks line by line too: the reason for the demo including the
compliance framing (226-277), the eat-at-me-all-through-March passage (245-252),
the weekly/daily/monthly objective ladder (68-83), the never-answer-that-email
policy (123-140), the 1992 one-two-three top and **50%** first trade (145-161),
the butterfly test (170-184), the six-item documented-plan list (190-198), the
two magnets above (283-300), all-boats-rise-in-high-tide (302-322), the
relative-equal-highs read and **14,110** (372-383, 490-498), the
algorithm-not-letting-price-go-lower reasoning (376-383), the support/resistance
pair from the previous night (392-401), the three ingredients and
no-engulfing-candle (507-526), the fractal hierarchy (504-506, 580-587, 623-631),
the 9:30 Judas swing and both don't-chase warnings (543-559), the four-item
checklist (560-577), the willing-buyers / buy-stops-become-market-orders
explanation (595-615), the intermediate term low that should hold to the
objective (634-642, 709-716), the mean-threshold entry stop and the
stay-below-that-candle's-low trailing rule (724-748), the raise-only-after-a-set
rule (758-765), the accumulate-more-long-positions reading (650-673), the
near-the-objective shallow retracement (683-696), the **3 + 2 + 1 = six micros**
pyramid and the inverted-pyramid image (935-971), **$1,200** margin (1005-1007),
**$10,000** optimal gearing (1008-1015), **$12,111** and **over 21%**
(973-990, 1016-1017), the not-an-invitation-to-trade-daily warning (1033-1046),
whose-fault-is-that and the **60 or 70 trades in a day** admission (1047-1070),
the goal-not-the-starting-point framing (1075-1082), **six months** of practice
(1120-1129), the no-Elliott/harmonics/supply-and-demand list (911-916), the
winners-have-it / losers-are-missing-it claim (1185-1196), the
only-the-examples-that-sell-the-book passage and the divergence anecdote
(1314-1346), and the whole closing on losses, inflation and slow learners
(1226-1283).

#### Coverage gaps (episode 13)

**H18 · should-fix · p2-06 — the prerequisite for going live is dropped, while
the same number survives attached to a different claim.** ICT states a concrete
gate:

> *"if you're a new developing student [who has] worked very hard to find and
> refine your own model with the things I'm teaching, and you have a trading plan
> that is well documented … and **you've been consistent with a demo account for
> six months** — **then and only then** would I … consider maybe going into live
> fund trading"* (102-122)

The lesson's *Are you ready for live money?* section carries the butterfly test
and the documented-plan list but not this. What makes it worse than a plain
omission is where the number went instead: **"six months" does appear in the
lesson** — *"he believes a YouTube student can do this consistently after about
six months of practice and screen time"* — which is ICT's **other** six-months
claim, from the end of the episode (1120-1129), about acquiring the skill. So a
reader meets the figure attached to *how long until I'm good* and never to *how
long on a demo before I risk money*. The safety gate is the one that went
missing, in the lesson whose subject is readiness. Same family as **A4** (m1-04's
missing risk management) and **H2**.

**H19 · should-fix · FIXED · p2-06 — the $256,000 context is dropped, and with it ICT's
own hedge on the number the lesson does report.** The lesson presents
*"$10,000 → **$12,111** in one morning, over **21%** on one trade"* cleanly. The
episode opens by explaining why that demonstration exists at all:

> *"I got a lot of questions as to how I ran the ten thousand dollar account up
> to, which was at **$256,000** this morning — but it quickly got to a point where
> **it no longer can be appreciated from a student's perspective**, it's too fast
> of growth … you have no connection to it if you don't know how to do this"*
> (17-31)

and returns to it:

> *"I ran up the other paper trading account to like 200-some thousand dollars
> this morning and I was thinking to myself, okay, now we're in territories it's
> just gonna feel silly … **now we're absurd**, you know, it's just ridiculous,
> you're not going to believe that this is possible — or maybe some of you do and
> you think you want to go out there and try to do the same thing with your live
> account. **Either one of those things are not my goal.** It's just me losing
> myself in price action, so I treat it like a game, it's a puzzle"* (863-883)

So the 21% morning is a deliberate scaling-down from a run ICT judged
uninstructive, and he names both failure modes it is meant to avoid (disbelief,
and imitation with live funds). p2-03 handled the equivalent problem well — its
582% paragraph carries every disclaimer ICT attached. p2-06 does not, and it is
the lesson reporting the number a reader is most likely to try to reproduce.
Same shape as **H14**(b): the source's hedge is dropped while its claim is kept.

**H14 strengthened — the "I created a language" hedge is stated a third time, in
this episode, and dropped again.** Logged under episode 12 as a p2-05 gap; ep13
restates it more strongly and p2-06 drops it too:

> *"I had to **create a language** that gets to generally the basis of what that
> is doing without all the complications within it … you're probably looking at
> your chart thinking 'how do I classify this swing high as an intermediate term
> high versus a short term high versus a long term high — how does he know?'
> **Right, that's the part you're never going to get.** So I had to create a
> language that makes it simple"* (1141-1165)

p2-06's opening carries the *fact* of the simplification (*"simplified back down
into the language of the channel"*) but not the reason — that the underlying
classification is, in ICT's own words, not fully transmissible. Across p2-05 and
p2-06 the hedge is now stated **three times in two episodes** and carried in
neither lesson, which makes it the batch's clearest single instance of the
"reproduces *what*, drops *why*" pattern batch G identified.

**H20 · nit · p2-06 — Chris Laurie is named and dropped, for the second time in
this audit.** ICT's list of what the trade is *not* ends on a name the lesson
cuts: *"there's nothing here that's Elliott wave, none of it's harmonic, none of
it is supply and demand, **none of this is Chris Laurie's stuff** — I have a lot
of Chris Laurie students, lots of them, and they'll tell you this isn't even
taught in his stuff either"* (911-920). The lesson keeps the first three and drops
the fourth. **B4** logged the same name being dropped from m2-06, where ICT was
*crediting* him; here he is distinguishing his method from Laurie's, so the
direction is opposite but the omission is identical. Worth recording as a
cross-section item for batch N: Chris Laurie is named in both sections' sources
and appears in neither section's lessons. Mild here, and conspicuous only against
**p2-04**, which got the Larry Williams attribution completely right.

#### Noted, not a finding (episode 13)

**The named discount broker is dropped, reasonably.** ICT specifies the
hypothetical account: *"the discount broker I'm hypothetically using while I'm
taking these executions is … an **AMP Futures** account, and I'll show you their
margins"* (351-362). The lesson says *"Roughly $1,200 at a discount broker"*.
Dropping a named broker avoids an endorsement, and the substance — the margin
figure and the gearing judgement — survives. Note also that this does **not**
conflict with p2-03's *"brokers that let you trade … a micro for under a hundred
dollars are asking you to blow the account"*: ICT's objection there is to the
leverage such margins permit, and both lessons carry his resolution
(*"$10,000 — optimal gearing; more than this would be too much leverage"*).

**Two smaller drops, both defensible.** The named student — *"I have a woman in
my group from the first group from Australia that is phenomenal"* (1111-1114) —
is dropped while the cohort point survives generically (*"for students who have
put the time in"*). And the jab at *"a guy out there trying to hawk a **seven
dollar indicator** … and it's all about order blocks, and I'm not going to change
the name on that"* (527-536) is dropped; it carries no teaching, but it is a data
point for the **G6** verdict below, since it is ICT asserting ownership of the
order-block name inside Part 2.

#### Quiz quality

**All 49 questions across Part 2 are source-traceable.** Every correct option and
every `e` checks against that episode's own transcript or notes — no repeat of
**C2** or **E1**. As in Part 1, several `e` fields quote the transcript directly
and **every quotation checked is accurate to the word**: p2-05's *"the retracement
that fails … that starts the decline"*, p2-06's *"if you don't aim for a target
you're going to hit nothing 100% of the time"* and *"stop thinking you need a lot
to make a lot"*, p2-03's *"you don't have a trade"*, p2-02's order-block
definition.

**Part 2 is the best-constructed question set in the corpus — better than either
exam.** Measured the **D15/E19/F14** way (ties counted as *not* a tell; margin
over the **second-longest**; F14's decisive not-longest column):

| Lesson | n | strict | expected score | median margin | not-longest | max spread |
|---|---|---|---|---|---|---|
| p2-01 | 6 | **0%** | 22% | — | **100%** | 5 |
| p2-02 | 7 | 14% | 31% | 3 | 86% | 5 |
| **p2-03** | 9 | 11% | **11%** | 3 | 89% | 6 |
| p2-04 | 9 | 22% | 28% | 2.5 | 78% | 8 |
| p2-05 | 10 | **40%** | **48%** | 1.5 | 60% | 7 |
| p2-06 | 8 | **0%** | 29% | — | **100%** | 9 |
| **Part 2** | **49** | **16%** | **29%** | **2** | **84%** | **9** |

For context: Part 1 was 34% / 46% / 66%; Section 1's quizzes 71% / 76% / 29%;
the **S1 exam**, previously the corpus benchmark, 31% / 42% / 69%. Part 2 beats
all three on every column. **A knowledge-free guesser who always clicks the
longest option scores 29% here against a 25% chance rate**, and in **p2-03 they
score 11% — the lowest figure recorded anywhere in this audit**, displacing
p1-01's 15%.

Three things about *why*, since **F14** asked for the mechanism:

1. **The margins are too small to exploit.** The single worst question in the
   whole part — [`p2-04/quiz.js:6`](../content/s2-2022-mentorship/p2/p2-04/quiz.js#L6),
   *"Why is a down close candle after a run-up not automatically an order
   block?"* — wins by **4 characters** (49 against 45). Nothing else exceeds 3.
   Compare p1-06's worst at **+8** and Month 3's at **+20**.
2. **The option sets are built to a width.** p2-02, p2-03 and p2-04 run their
   four options at 44-54, 45-50 and 44-49 characters respectively — the options
   are written to a target length, not trimmed after the fact. That is the
   **parallel-set** technique **C17**/**D15**/**F14** identified, applied
   systematically rather than to the odd question.
3. **The two 0%-strict lessons get there by ties, not by shortness.** p2-01 and
   p2-06 never have a uniquely-longest correct option, which is why their strict
   score is zero while their expected score sits near chance. That is the
   mirror-pair effect **C17** first named in m3-02/m3-06, here at lesson scale.

**No p1-06-shaped outlier exists in Part 2.** The batch lead asked for one; the
answer is that the weakest set, **p2-05 at 48% expected**, is still better than
Section 1's *best* month (m3 at 61%) and only marginally worse than Part 1's
average. It is worth one sentence rather than a finding: p2-05 is the lesson
where four of ten correct options are uniquely longest, all by 1-2 characters,
which is inside §3's "within ~5 characters" rule and below the threshold at which
length carries usable signal.

**Not re-flagged:** all 49 questions mark `a: 0`. **D14** settled that the
`a`-index is harmless (options Fisher-Yates shuffle at render). Noted only because
Part 1 had one `a: 1` exception and Part 2 has none.

#### Consistency — clean

Verified mechanically:

- All 6 lessons carry `data-month="p2"`; ids are `p2-NN`; **all 4 slugs present
  match their id prefix**, and p2-01 and p2-04 correctly carry **no** `data-slug`,
  each with the omission annotated (`<!-- no fig-slot: the notes carry no charts
  for this episode -->`) per the Section 2 convention.
- **Chart counts match the harvested notes exactly, 1:1 and in order** —
  ep8 **0**, ep9 **3**, ep10 **1**, ep11 **0**, ep12 **5**, ep13 **3** = **12**,
  against 12 files in `notes/2022-mentorship/raw/` and 12 in `images/`. The two
  chart-free lessons are chart-free **in ICT's notes**, so p2-04 being a
  nine-question live-trade lesson with no charts is correct rather than a scrape
  gap — the same answer **A12** reached for Section 1 and **G**'s check reached
  for Part 1.
- **All 6 `video.txt` URLs appear in
  [`docs/s2-2022-mentorship-videos.md`](s2-2022-mentorship-videos.md)** and each
  maps to the right episode **and** the right lesson id in that table (rows
  17-22: ep8→`p2-01` … ep13→`p2-06`). The plan calls that table the only
  permitted source for a Section 2 video URL, so this is the §1 check for videos
  and it passes for all six.
- One episode = one lesson throughout, per plan §3: p2-01…p2-06 ↔ episodes 8…13,
  no re-cutting or merging.
- `python build.py` and `python verify.py` pass, 0 JS errors.

#### Batch H summary

| | |
|---|---|
| Lessons audited | 6 (episodes 8–13, 256 KB of transcript) |
| Findings | **20** — 0 blockers, **9** should-fix, **11** nits |
| Fidelity findings | **1** (**H1**) |
| Quiz questions traceable | **49 of 49** |

**The headline is that Part 2's weak dimension is coverage, and it is coverage of
one specific kind: ICT's hedges.** Eighteen of the twenty findings are omissions,
and the four largest — **H14** (the algorithm-can't-see-your-stop rationale *and*
the "I created a language" caveat), **H19** (the $256,000 context behind the 21%
morning), **H18** (the six-months-of-demo gate) and **H2** (the blowtorch
consequence) — are all cases where **the lesson keeps a claim and drops the
qualification the source attached to it.** Batch G described Part 1 as
reproducing *what to do* and dropping *why*; Part 2 sharpens that: it reproduces
what to do, and drops **what the source said about the limits of what to do**.
That is a different and slightly more consequential shape, because §1's
prefer-under-claiming principle cuts against it directly — dropping a hedge moves
a lesson in the over-claiming direction even when every sentence in it is sourced.

**H14 is the clearest instance and the cheapest to fix**: ICT says three times
across two episodes that his market-structure labels are *"a language … not
exactly like the algorithm does, but very very close"* and that the underlying
classification is *"the part you're never going to get"*. Neither p2-05 nor p2-06
carries it, and p2-05 is the lesson that opens *"Write this one down."*

**Do the Part 1 conclusions replicate? Two of three cleanly, one with a
correction:**

1. **One episode per lesson prevents migration defects — replicates.** No
   instance of material crossing between lessons or arriving from outside the
   teaching, the failure mode behind **A2**, **C1**, **C2**, **D1** and **E1**.
   Six lessons, six transcripts, no leakage.
2. **The transcript beats the notes — replicates, and now has a counter-case.**
   p2-05 follows the transcript's bullish framing of the permitted-violation rule
   where `ep-12.md` frames it bearishly. But **H5** is the inverse: p2-02 places
   the *"(this part is not forex)"* qualifier where the **note page** puts it
   rather than where the transcript does. Nothing is inverted and the note is a
   permitted source, so this is not an **E1** repeat — but it is the first Section
   2 instance of a lesson preferring the note, and it is worth watching in
   batches I–L.
3. **The de-garbling is sound — replicates, three more times** ($88,000 → $8,000,
   the $22,000 margin, "204/240" → over 240 handles against a true 246). **Eight
   silent corrections across Parts 1 and 2, all correct.** Part 2 adds something
   new and better: in ep12 ICT says a move *"moved 14,500 points"* — impossible,
   and with no bracketing sentence to repair it — and **p2-05 omits the figure
   rather than guessing**. So the same author both de-garbles when the source
   permits it and declines to when it does not, which is exactly the §1 posture.

**What contradicts batch G.** Batch G's headline was **zero fidelity findings**
across seven lessons, and it framed one-episode-per-lesson as the reason Part 1
held up. Part 2 has **one** (**H1**, p2-01's inverted yen-pair reason), and it
arrived in a way the G conclusions did not predict: not from material migrating,
but from a lesson **resolving a genuinely garbled sentence in the direction the
words do not support**. The de-garbling that produces eight correct silent fixes
is the same disposition that produced H1 — it is the one place in two parts where
the repair went the wrong way. Worth saying plainly, because it means "the
de-garbling is sound" is a claim about a *tendency*, not a guarantee, and the
tell is that H1's source sentence contains a verb (*"tend to **have**"*) the
lesson reversed rather than a mangled number.

**Verdicts on the three leads carried in from batch G.**

**G10 — upgraded in scope, unchanged in severity, and it is now the
highest-value should-fix in Section 2.** p1-05 tells the reader *"**Order blocks
are deliberately kept out of this mentorship** — there are models that don't rely
on them at all"* and *"no fifteen gimmicky names, no breakers, no order blocks."*
With Part 2 in view that is not a two-lesson tension, it is a section-wide one:

| | |
|---|---|
| Part 2's own title (`months.js`) | **"Part 2 — Order Blocks, Power of Three & Structure"** |
| p2 lessons that teach the order block | **4 of 6** (p2-02, p2-04, p2-05, p2-06) |
| "order block" mentions in p2 lesson HTML | **20** |
| …across all of Section 2 | **102** (p1 8, p2 20, p3 30, p4 14, p5 11, p6 19) |

p2-02 gives the definition (*"consecutive down close candles right before a price
surge that has an imbalance — that's how you find your order blocks"*), p2-05
gives the advanced interpretation and an entry that needs no market structure
shift, and p2-06 gives the three ingredients that make one high probability. So
the reader is told in **L5 of 40** that a technique is out of scope, and then
taught it as a primary entry vehicle for the next 35 lessons.

**It stays should-fix, not a blocker**, and the reason matters: p1-05's claim is
*sourced* — ICT does say *"I'm going to **try** to stay away from order blocks …
in this mentorship really"* (ep5:159-172) — so nothing is fabricated. The defect
is the **hardening** of *"try to stay away"* into *"deliberately kept out"*, which
is the **A3 / C7** over-tightening family, and it is that hardening rather than
the claim that misdescribes the course. G10's proposed fix (one clause, using
ep7's *"I'm going to teach it the way I want to teach it … it works"*) is still
the right shape but should now say more: the order block remains a **taught entry
technique** that Part 2 develops in two directions, not merely a surviving
reference.

**G6 — narrows to a p1-03 fix, but does not dissolve.** The lead asked whether
the order-block provenance recurs in episodes 8-13. It does not. What Part 2
*does* carry is ICT's **authorship** of the concept, twice, and both times a
lesson keeps it: p2-05's *"that is not my order block … so stop calling it one"*
(ep12:588-596) and, dropped but harmless, ep13's jab at the $7 order-block
indicator (*"I'm not going to change the name on that"*). Baby Pips also recurs
at ep12:787 — but in a **different** context, the fib-anchoring question, which
p2-05 carries minus the venue name (**H17**). So the section does assert ICT's
ownership of order block theory; what it drops is specifically the **dated**
provenance (*"I invented it … first mentioned it in 2010 on Baby Pips. Prior to
that, 1996, one-on-one"*), and those dates exist only in episode 3. **G6 is
therefore a one-file fix in `p1-03`**, and the parallel it was logged against —
p1-02 keeping the FVG's 2016 date — is the exact template.

**G7 — resolved, and my own mid-batch reading of it was wrong.** G7 held that the
micro's handle value reaches no lesson. **p2-06 states it: *"Micro E-mini NASDAQ —
1 point = 4 ticks = $2"***, sourced to ep13:344-349. Earlier in this batch (see
the correction inside **H3**) I concluded from the first three episodes that G7
was becoming a Section-2-wide coverage finding; **that was wrong and is
withdrawn.** G7 stands as logged — a **Part 1** gap, where the figure is stated in
two episodes and reaches neither lesson — and it is closed thirteen lessons later
by p2-06. What survives is narrower and more tractable: **H3**, an internal
contradiction four lessons wide, where p2-02's arithmetic implies $1/handle and
p2-06 states $2. The correct number already being in the corpus makes the fix a
cross-reference rather than new sourcing.

**Three items for batch N** (recorded, not fixed here):

1. **"intermediate term" is unhyphenated 21 times in Part 2 and hyphenated 0
   times.** Measured across `lesson.html` + `quiz.js`: Section 1 writes
   **intermediate-term** (1, hyphenated, 0 unhyphenated); the rest of Section 2
   is split **7 unhyphenated / 6 hyphenated**; Part 2 is uniformly unhyphenated.
   Corpus total: **28 unhyphenated / 7 hyphenated**. Densest user is **p2-05**
   (8 in the lesson, 4 in the quiz). *(Slight correction to the batch lead, which
   put the non-p2 remainder at 7/4; counting `quiz.js` as well as `lesson.html`
   gives 7/6.)*
2. **Power of Three: the two sections are compatible, and Section 1 never defines
   it.** Section 1 names it at **three** sites, not one — m2-06 as a bare list
   item inside *"time & price theory (quarterly effect, monthly effect, weekly
   range, daily range / **power of three**, time of day)"*, m3-03's midnight-NY
   callout (*"This is **power of 3** in action: buying near or below the open of
   an up day and exiting toward the close"*), and `summary.html` repeating m3-03.
   None defines the accumulation–manipulation–distribution shape. Section 2 defines
   it fully in p2-02 and p2-03 (*"Power of Three is the daily bias"*) and uses it
   16 times across five parts. **The usages agree**: Section 1's "buy near or
   below the open of an up day, exit toward the close" is precisely the trading
   application of Section 2's bullish shape. So this is not a conflict to
   reconcile but a **forward reference to add** — m2-06's undefined list item is
   the one that would most repay a pointer.
3. **Chris Laurie is named in both sections' sources and appears in neither
   section's lessons** — **B4** (m2-06, ICT crediting him) and **H20** (p2-06, ICT
   distinguishing his method from Laurie's). Same name, opposite direction, same
   omission.

### Batch I — Section 2, Part 3 (p3-01 … p3-06 / episodes 14–19)

Sources read: all 6 `notes/2022-mentorship/ep-{14..19}.md` **and** all 6
`transcripts/2022 Mentorship/…Episode N.txt` (**291 KB — the heaviest batch in
the corpus**), plus [`docs/s2-2022-mentorship-plan.md`](s2-2022-mentorship-plan.md)
first per `CLAUDE.md` §7. One episode per lesson throughout, as in Parts 1–2.

Part 3 is the batch with the widest internal spread of any so far: **ep14 is
3.8 KB and ep19 is 133.9 KB**, a 35× range, and the lessons are sized to
something other than that (4.3 KB and 18.7 KB — a 4× range). That mismatch is
where the batch's largest findings live.

*(findings below, added as each episode was audited — five instalments, with
episode 19 taking one to itself as the build did)*

#### Content fidelity (§1) — episodes 14–15

**p3-01 and p3-02 are both near-complete transcriptions of their episodes, and
they are the two most closely-checkable lessons in Section 2** — the transcripts
are short enough that every claim can be pinned to a line, and both were. p3-01
carries 4.3 KB of lesson from a 3.8 KB transcript; p3-02 carries 6.7 KB from
7.6 KB. Everything traces:

- **p3-01** — the market structure shift and the Friday-close gap fill (ep14:4-7),
  12 micro NASDAQ contracts (9-11), the limit inside the FVG (14, 22), all three
  objectives 14,160 / 14,180 / 14,220 (16-21), the FVG at "14,122 to 14,138"
  (32-36, transcribed as spelled-out numerals), *"I'm not watching the number
  underneath that profit"* (28-30, verbatim), *"swat bust through the door"*
  (70-71), the E-mini S&P micro check and *"gives me fuel or confidence"* (87-92),
  six contracts off / stops to even / limit at 14,220 (77-83), *"it's getting real
  close to the closure of that gap"* (94-97), and both of ICT's self-deprecating
  asides — *"that's not bad, it's the low candle"* (106) and *"probably random"*
  (55-56).
- **p3-02** — the vacation framing (1-6), the 20%-a-month purpose and *"without
  pushing the envelope"* (15-23), the swing-high break (28-31), the 14,000 daily
  target *"a little bit of a stretch"* (31-34), the close completing the imbalance
  (40-42), *"painfully wrong"* (62), the sell stops at **13,612** (75-76),
  *"high-risk entry"* (77), the 680-level FVG above equilibrium and ~50 handles /
  ~$1,000 (113-118), the not-below-630 support read (124-130), the whole stop-loss
  passage including *"I'm not trying to encourage you to trade without a stop"*
  (98-108), the $1,255 on two trades less ~$15 commissions (172-176), and the
  latency-test explanation for the high commissions (184-189).

**I1 · should-fix · FIXED · [p3-01/lesson.html:22](../content/s2-2022-mentorship/p3/p3-01/lesson.html#L22)
and [p3-01/quiz.js:4](../content/s2-2022-mentorship/p3/p3-01/quiz.js#L4)** —
**a rationale the source never gives, and the quiz makes it a question.** The
lesson ends the paragraph on the expected pause with *"**Anticipating the pause is
what stops the pause from shaking you out.**"* ICT states the *observation* and
nothing else:

> *"now they can start to consolidate in that area and reaccumulate for new longs
> kind of like a pausing maybe like think like a bowl flag that's kind of like
> what i anticipate forming between 14 1 20 14 140 in that area"* (ep14:38-45)

He says he anticipates it. He never says *why anticipating it matters*, and
`ep-14.md` is a single line (a video link), so there is no second source to
supply it. The gloss is a reasonable inference and it is the sort of thing ICT
says elsewhere — but it is not in this teaching, and
[`p3-01/quiz.js:4`](../content/s2-2022-mentorship/p3/p3-01/quiz.js#L4) then makes
it q3, *"Why anticipate a pause on the way to the objective?"* → **"So the pause
can't shake you out"**, with an `e` that restates the gloss as though sourced.

This is the **C2 shape at a much lower amplitude** — an unsourced clause promoted
into a quiz answer — and it is the **only untraceable correct option found
anywhere in Part 3** (46 of 47 check out). It is not a blocker because nothing is
misdescribed: the fact underneath (he expects a consolidation / bull flag) is
solidly sourced, and only the purpose clause is added. Compare **C6**, logged a
nit, where *"that's confluence"* upgraded a shrug — the aggravating difference
here is the quiz.
*Fix:* drop the sentence and re-point q3 at what he does say — that he expects
consolidation and reaccumulation for new longs, like a bull flag, between roughly
14,120 and 14,140.

**I2 · nit · [p3-01/lesson.html:16](../content/s2-2022-mentorship/p3/p3-01/lesson.html#L16)** —
the **condition attached to the 14,220 objective is dropped.** The lesson's `kv`
lists it flatly as *"**14,220** thought possible"*. ICT makes it contingent:
*"i'm thinking i might take the limit order up to 14220 **but we'll see how we
trade above the short term high made prior to 10 o'clock in the morning**"*
(ep14:49-53). The pre-10 AM short-term high is the only reference level in the
episode the lesson does not carry, and it is the thing that would tell a reader
*when* the third objective becomes live. The lesson does keep ICT's other hedge on
the same number (*"I might be wrong, but just for general principles"*), so this
is a single dropped clause rather than a pattern within the lesson.

**I3 · nit · [p3-02/lesson.html:46](../content/s2-2022-mentorship/p3/p3-02/lesson.html#L46)** —
**a hedge dropped from a number, batch H's shape in miniature.** The lesson states
*"Drawdown from the entry candle's low **was** about three handles — roughly $60"*.
ICT does not know:

> *"very little draw down about three handles of draw down if that from the entry
> … **I have to go watch the video and see what the actual draw down was from the
> point of entry I'm not sure if I had any** if I did then that's what it was
> limited to 60 bucks or so"* (ep15:149-158)

Two hedges — *"if that"* and *"I'm not sure if I had any"* — become a stated
measurement. Low stakes (the figure is small either way, and it is ICT's own
estimate), but it is the **H14/H18/H19 pattern**: the claim is kept and the
qualification attached to it is not. Recorded here mainly because it is the
batch's first data point on whether that pattern replicates outside Part 2.

#### Coverage — episodes 14–15

**Effectively none, and this is worth stating positively.** Both lessons are
near-exhaustive against their transcripts. What is left out of p3-01 is ICT
fumbling the platform and the closing *"hopefully found this insightful, james"*;
out of p3-02, the Trade Station / TradingView aside about hitting the wrong
control (ep15:165-170) and the month name (*"the day and the month of March"*,
172-173, where the lesson says only "the day and the month"). Nothing
substantive. After two parts in which coverage was the weak dimension, the two
shortest episodes in Section 2 are the first lessons in this audit with no
coverage finding at all.

#### Noted, not a finding (episodes 14–15)

**Two more silent de-garbles, both correct, and one of them confirmed by the
notes.** This is the ninth and tenth in Section 2 (**G** counted five, **H**
three).

| Transcript | Lesson | Verdict |
|---|---|---|
| ep14:42 *"think like a **bowl** flag"* | "something like a **bull flag**" | ✓ obvious |
| ep15:26 *"cherry pick trades in **AO** account"* | "not just cherry-picking trades in a **demo** account" | ✓ — the contrast is *"I can trade with live funds too"* (27), and demo-vs-live is the section's running theme (**H18**) |
| ep15:135-136 *"because it's **F1 see** … and **FC** you can trade in the morning"* | **FOMC** | ✓ — and independently confirmed by `ep-15.md`: *"At FOMC you can trade in the morning but make sure you're done early"* |

The FOMC case is the cleanest instance yet of the **method note's** point that the
notes resolve garbled transcript in one line: the acronym is mangled twice in the
transcript and spelled correctly in the note.

**A composite quotation, flagged for transparency rather than as a finding.**
[`p3-02/quiz.js:7`](../content/s2-2022-mentorship/p3/p3-02/quiz.js#L7)'s `e`
quotes *"At FOMC you can trade in the morning but you got to be done early."* The
first half is the **note's** wording and the second half is the **transcript's**;
neither source contains that exact sentence. Both halves are sourced and both are
permitted sources, so this is not **C3** (a manufactured quotation) — but it is a
quotation mark around a sentence nobody said, and it is the second Section 2
instance of a lesson taking the note's phrasing over the transcript's (**H5** was
the first). Worth watching for a third in batches J–L; two is not yet a pattern.

**ICT's own notes independently confirm two video URLs.** `ep-14.md` and
`ep-15.md` each carry a live-trading link — `youtu.be/NUdu1n-ML98` and
`youtu.be/tGxuitjtO88` — and those are the exact video IDs in `p3-01/video.txt`
and `p3-02/video.txt`, and the ones
[`docs/s2-2022-mentorship-videos.md`](s2-2022-mentorship-videos.md) rows 23-24
give for episodes 14 and 15. Three-way agreement on two of the batch's six links.

#### Content fidelity (§1) — episode 16

**p3-03 has no fidelity finding, and it is the most claim-dense lesson in Part 3
by a wide margin** — 19.2 KB of lesson covering six numbered setups, a swing
projection worked to the tick, the algorithm summary, the back-testing method and
the pyramiding rule. Every one of them traces. The numbers in particular are
exact: the daily bullish order block at **4504** (ep16:110), both fib projections
**4514.5** and **4501.25** (317-322), that 4501.25 was *"exactly the candles low"*
(344-351, restated 362-365), the two-transaction candle argument (1308-1322), and
the pyramid **five → three → two** (1456-1467). The long verbatim quotations are
accurate to the word: *"I'm showing you how the algorithm is going to read the
price — the wicks and the tails are all distractions"* (283-286), *"if that was
the case I would never take a losing trade, you would never take a losing trade,
we wouldn't need stop losses"* (196-199), *"you're not trying to do things
correctly in back testing — back testing is you in a mode of discovery that proves
efficacy"* (1194-1197), *"don't Netflix binge-watch ICT"* (609), *"I've roasted
accounts doing it"* (1471-1472).

The one claim that looks like drift on a literal reading of the transcript is not
— see the note below on the old-high array, which is a transcript garble the
**notes** resolve.

#### Coverage gaps — episode 16

**I4 · should-fix · FIXED · [p3-03/lesson.html:8](../content/s2-2022-mentorship/p3/p3-03/lesson.html#L8)** —
**both of ICT's hindsight caveats are dropped, and this is the batch's strongest
confirmation that batch H's pattern replicates.** The lesson opens by saying the
whole Friday "gets walked through, setup by setup" and then presents six setups
with no acknowledgement that they are being identified after the fact. ICT
pre-empts exactly that objection, twice, at both ends of the episode:

> *"now obviously **i have the benefit of hindsight here** but i promise you if
> you study what i'm teaching you you'll see this repeating"* (ep16:81-84)

> *"i know there's a large number of you that are going to watch this and it's
> going to feel and seem like **obviously anybody can go back in time and do these
> types of things** — but a lot of my trades when you see my examples and you see
> the things i record and show you they're using logic like this, so **it's not
> contrived it's not form-fitted it's not cherry-picked**"* (1137-1150)

Both are the **H14/H18/H19 shape**: the claim is kept and the qualification
attached to it is dropped. It matters more here than in **I3**, because what is
being qualified is the *evidential status of the entire lesson* — six setups
found in review, presented as six setups. §1's prefer-under-claiming principle
cuts directly against the omission.
*Fix:* one clause in the opening paragraph. ICT's own second passage supplies both
halves — the concession and the answer to it.

**I5 · should-fix · p3-03** — **the morning-session entry-timing rule is missing
from the lesson about morning-session entries.** The lesson says the morning
"typically offers two to three [setups], because volatility arrives at the 9:30
open" and then goes straight to the setups. ICT attaches a warning and an
instruction to that same sentence:

> *"that can be very tricky if you're not really sure what you're doing — you can
> get caught up in the initial volatility and offside real quick and it can run
> against you aggressively and hurt you. **I prefer to see my students look for
> the initial move to kind of like qualify what you're expect[ing]** — lower
> prices, right? So does it give it here? Yes it does"* (ep16:562-573)

That is the answer to *when* in the morning session you are allowed to act, and
it is the only place in the episode ICT gives it. Note that **p3-02 carries the
negative half of the same idea** (*"you don't know how far it is going to whip
below that low"*, ep15:60-62) but not the positive instruction, so the rule is
absent from both of the batch's opening-session lessons.

**I6 · nit · p3-03** — two dropped items that both connect this lesson to its
neighbours:

- The **live-account continuity**. ICT reports mid-episode that he *"took the live
  account up another thousand dollars today so we're over **fifty one thousand
  dollars**"* (ep16:622-624). p3-02 is the lesson that sets **$50,000** as the
  milestone being run at; ep16 is where it is passed, one lesson later. The
  arithmetic thread across two consecutive lessons is dropped in the second.
- The ***Real Money Real Results* series** (497-502), which is the context for the
  four-trade question the whole episode answers — *"where I was showing actual
  live account results and proving that these things make money **not just in
  demo**."* Same demo-vs-live theme as **G3** and **H18**, and the third time it
  has gone unrecorded.

Also dropped, and grouped here rather than logged separately because it is the
same register batch G already named: the whole **purpose** passage — feeding your
family, reducing expenses after a job loss, "legacy wealth", and the repeated
insistence that the material is free (629-636, 1169-1181, 1347-1375). Part 1
"drops the *why*" (**G13**, **G14**); this is the motivational rather than the
methodological *why*, and its absence is a consistent editorial choice across
three parts rather than a defect in this lesson.

#### Quiz quality — episode 16

**All 11 questions are source-traceable.** At 11 questions for 54.6 KB and a
19.2 KB lesson, p3-03 is the *generous* end of the proportionality test
(**D14/E18**) and comfortably justified — it is the only lesson in the batch where
every major block gets a question.

**I7 · should-fix · FIXED by Tier 4, marked in the Tier 5 pass · [p3-03/quiz.js:8](../content/s2-2022-mentorship/p3/p3-03/quiz.js#L8)** —
**the worst-constructed question in Part 3, and the worst in Section 2 so far.**
q7, *"When does an old high act as support?"*, runs its options at **58 / 38 / 34 /
28** characters. The correct option — *"Once price has traded above it, making it
a discount array"* — is **20 characters longer than the next longest** and more
than **twice** the shortest. For scale: Part 2's single worst question won by
**4** characters (**H**), Part 1's by **8** (**G16**), and the worst in all of
Month 3 by **20** (m3-08 q5). This one ties the Section 1 record inside the
best-scoring section.

It is also avoidable in the way §3 describes, because the extra length is pure
citation: *"making it a discount array"* is the explanation, and it is already in
the `e`. Trimming the option to *"Once price has traded above it"* (29) would put
all four inside a 10-character band and cost nothing.

Three others sit above a +5 margin and are worth naming since the rest of the
lesson is fine: q11 (+7, correct 40 against 30), q8 (+6, 49 against 43), q5 (+4).
p3-03's totals — **73% strict, 73% expected, 27% not-longest, max spread 30** —
make it the **p1-06 / G16 of this batch**: a single Section-1-shaped quiz inside a
Section 2 part, and here it is the largest quiz in the part, so it carries
disproportionate weight in the totals.

#### Noted, not a finding (episode 16)

**The old-high array claim looks like drift and is not — the transcript is
garbled and the notes settle it.** [p3-03/lesson.html:85](../content/s2-2022-mentorship/p3/p3-03/lesson.html#L85)
says *"**Old highs are a premium array** — until price trades above them, after
which that old high becomes a **discount** array."* The transcript says *discount*
**both** times:

> *"old highs are a **discount** array — if we trade above an old high that old
> high becomes a **discount** array"* (ep16:1056-1060)

which is vacuous as transcribed. `ep-16.md` resolves it in one line — *"**First
old highs are a premium array.** Old highs are a discount array once they've been
traded through"* — and the lesson matches the note exactly. This is the
**method note's** claim about the notes at its most useful, and it is a genuine
de-garble rather than a preference for the note over the transcript (**H5**),
because the transcript as rendered has no coherent reading to prefer.

#### Content fidelity (§1) — episode 17

**p3-04 has no fidelity finding either, and its numbers are the most exacting in
the batch.** All three fib candidates — **1.0919**, **1.09**, **1.0901**
(ep17:166-171) — the entry at **1.096** and stop at **1.09728** rounded to ten
pips (657-665), the better-than-**8:1** ratio (679-680), the **$100,000** demo
(681-684), the **1.0900 → 1.0905** fluffed exit (596-604), and the **1.0901** day's
low (584) all check to the digit. So do the qualitative claims: *"I don't care
about the raw data, I don't care what the expectation is"* (352-354), *"it's a
rigged game — you're not supposed to be in it … not consistently profitable"*
(369-372), *"every buyer has to have a seller"* (489-490), *"many amazing exits
elude me because of my overzealous targeting"* (616-622), and *"I didn't take this
trade — I haven't taken any FX pair trades at all, not for 2022 at least"*
(734-737), which the lesson keeps as its closing footnote.

#### F14's forex cross-check — **no drift, to the minute**

This was the batch lead's concrete test, prompted by **H7**: two forex lessons
twelve apart is the first place forex-specific drift could appear. It does not.
Every session time in Section 2 agrees with every other:

| Claim | Site | Source |
|---|---|---|
| NY open killzone, FX: **7:00–10:00** NY local | p2-01:32, **p3-04:34**, **p3-05:37** | ep8:139-143 / ep17:283-289, 701-704 |
| London killzone: **2:00–5:00** NY local | p2-01:33 | ep8:259-273 |
| Index futures: **8:30–11:00** | p1-03:55, **p3-04:35** | ep17:290-293, 741-742 |
| Index, latest entry **10:40 / 10:45** | p3-04:35 | ep17:705-710 |
| Afternoon macro from **1:30** | p1-05:33/55, p2-04:21 | (Part 1–2 episodes) |
| Morning *session* **8:30–noon** | p1-03:75, p3-03:12 | ep16:12-16 |

Three lessons in three different parts state the FX killzone and all three say
7:00–10:00; two state the index window and both say 8:30–11:00. The one thing a
reader could conflate is the **morning session (8:30–noon)** against the **index
killzone (8:30–11:00)** — p3-03 gives the first and p3-04 the second, one lesson
apart, without either noting the distinction. Both are correctly sourced and they
are different concepts (when the market is in its morning phase vs. when you are
permitted to enter), so this is not a **B12**-style drift, but a one-clause
cross-reference in p3-04 would remove the only ambiguity in the set.

#### Coverage gaps — episode 17

**I8 · should-fix · [p3-04/lesson.html:44](../content/s2-2022-mentorship/p3/p3-04/lesson.html#L44)** —
**ICT points the reader at another lesson in this course and the pointer is
dropped.** The lesson's *"Why the high held"* callout carries the
intermediate-term-high reasoning correctly. What it omits is that ICT explicitly
sources it:

> *"again i mentioned this in a recent video — i think if i'm not mistaken it was
> **episode 12**. i'm going by memory so please don't roast me in the comments
> section if that's the wrong one, but it's basically what i'm talking about,
> **intermediate term, short term and long term highs and lows**"* (ep17:413-423)

Episode 12 is **p2-05** (plan §3's map), which is precisely the STH/ITH/LTH lesson
and, per **H**, the densest user of the term in the corpus. **ICT's memory is
correct and the reference resolves.** This is the only in-source cross-reference in
the batch, the course already has the notation for it (`.src` spans, and Section
2's `(P2 L5)` form), and **F12** established that all 24 of Section 1's existing
cross-references resolve — so adding this one is a zero-risk, one-span change that
reconnects a Part 3 claim to the Part 2 lesson that establishes it.
*Fix:* `<span class="src">(P2 L5)</span>` on the intermediate-term-high clause.

**I9 · nit · p3-04** — **two more dropped hedges, and they confirm I4 is a
part-level pattern rather than a p3-03 defect.** ep17 contains a third hindsight
caveat that does not reach a lesson, plus a permission the lesson also drops:

- *"we're focusing primarily on the shorting opportunity here **in hindsight**, so
  that way you can get a better feel for how to use this model with fx"*
  (ep17:549-554) — the same acknowledgement as **I4**'s two, in a different
  episode. **Three hindsight caveats across two episodes, none of them carried.**
- *"you **may not want to trade high impact news drivers** and that's
  understandable if you don't know what you're doing — **but don't be afraid of
  them**"* (720-726). p3-04's news callout explains what news is *for* and never
  gives ICT's own opt-out for readers who aren't ready. Note this hedge runs in
  the *permissive* direction, which is the first of its kind logged; the H-family
  hedges all restrained a claim.

Also dropped, and worth one line rather than its own finding: ICT dates his own FX
practice — *"predominantly I've been doing that **since 2010**"* (760-762). The
lesson keeps the striking fact (no FX trades in 2022) and drops the context that
makes it striking. Same **dated-provenance** family as **G6**, and the third time
in Section 2 a date attached to ICT's own history has not survived.

#### Quiz quality — episode 17

**All 10 questions are source-traceable**, including the two that depend on the
episode's finer distinctions: q7 (the bias staying bearish after three down
closes, because the lower relative equal lows were untouched — ep17:47-61) and q8
(the bearish order block identified by displacement → fair value gap → return to
the last up close candle — 297-310, with the body-not-wick preference at 437-448).

Construction is the **second-weakest in the batch** — 60% strict, 60% expected,
40% not-longest, max spread 13. Four questions have the correct option winning by
6 or more: q7 (**+8**, 43 against 35), q8 (+6, 49 against 40), q10 (+6, 44 against
34), q2 (+2 but spread 10). The shape is **D15**'s, not **A10**'s: the options are
mostly comparable and the correct one simply wins by a few characters more often
than chance — so trimming spread would not fix it. F14's technique applies:
q7's *"Bearish — sell-side liquidity was untouched"* would come down to
*"Bearish — liquidity sat untouched below"* and the distractors up, putting all
four inside a 5-character band.

#### Content fidelity (§1) — episode 18

**p3-05 has no fidelity finding, and the definitional passage it is named for is
reproduced with unusual care.** Every element of ICT's order-block correction
survives intact and in the right relation to the others:

| Lesson claim | Source |
|---|---|
| All **three consecutive candles** are the bearish order block; it **begins at the lowest candle's low** | ep18:1113-1121 |
| It is **not** the last up close candle before the down move — *"that's what everybody says an order block is, it is not that"* | 1187-1190 |
| Price **never reached** that candle and didn't need to, because the **parent 15-minute imbalance** stops the run | 1232-1242 |
| *"What makes an order block valid — **it has to have an imbalance. Without the imbalance there is no order block.**"* | 1194-1199 |
| Therefore **not supply and demand**, which *"requires fresh zones … I'll cut through fractals and go through and find something over here and still trade on it"* | 1200-1208 |
| An order block is **a change in the state of delivery** — the algorithm changes state as soon as price gets below that candle's open | 1371-1382 |
| *"Any rally after that is just setting up another run to go lower … this is a **suspect rally**"* | 1379-1382 |

The lesson's own framing — *"that's also the answer to 'how do I pick the right
order block': you pick it by **where delivery changed**, not by counting
candles"* — is ICT's, near-verbatim: *"what's the right order block, how do I pick
the right order block? **I just answered it.** What is an order block? It's a
change in the state of delivery"* (1367-1372). And the notes agree independently:
*"An orderblock is a change of the state of delivery"* and, underlined in
`ep-18.md`, *"**What makes an order block valid? It has to have an imbalance after
it.**"*

The rest of the lesson checks the same way: the 5:25am sweep of the April 6th low
(1341-1346), London giving nothing (1349-1354), the 9:30 rich premium (1355-1359),
the 10:00 order placement (955-956), the 2:45pm fill at **40 pips** (1446-1455),
the 11:30 rule (1415-1442), the *"you can't get hurt, because it's already
happened"* / surgeon-studying-hindsight passage (1600-1606, 1725-1726), the two
bears in the snow (1679-1699), and *"that's how it was for me for a long time in
the 90s"* (1715-1718).

#### The four-way order block cross-check — **they agree, and p3-05 adds rather than corrects**

The batch lead's newest test. Four lessons now define the order block; the
question was whether they drift. **They do not** — the four are consistent and
cumulative, and the two that look opposed are mirror images of each other:

| Lesson | What it says | Relation |
|---|---|---|
| **p2-02** | *"consecutive **down** close candles right before a price surge that has an imbalance"* | the **bullish** OB |
| **p2-05** | *"the consecutive series of **up** close candles — **not** the last up close candle before the down move"* | the **bearish** OB; already states the correction |
| **p2-06** | three ingredients: down close candle + imbalance + narrative; *"no engulfing candle requirement"* | adds the **narrative** ingredient |
| **p3-05** | three consecutive candles, beginning at the lowest candle's low; **not** the last up close candle; **valid only with an imbalance**; **a change in the state of delivery** | adds the **validity test** and the **mechanism** |

p2-02's *down* closes and p3-05's *up* closes are the bullish and bearish cases of
one rule, not a contradiction. p2-05 already carries p3-05's headline correction,
so p3-05 restates rather than overturns it — which is worth saying plainly,
because the lesson's own `desc` calls it *"the correction that an order block is a
change in the state of delivery"*, and a reader coming from Part 2 has met the
"not the last up close candle" half already.

**Two things p3-05 genuinely adds that no earlier lesson states**, and both are
sourced only here: the **imbalance as a validity test** (*"without the imbalance
there is no order block"*, which converts p2-06's third ingredient into a
necessary condition) and the **parent/subordinate timeframe rule** that explains
*why* price stops short (*"no, it never works like that — the higher timeframe
imbalances are going to be parent to the subordinate smaller time frames"*,
1004-1025). Nothing an earlier lesson said becomes wrong. **No cross-section
drift.**

#### G10 — finalised, and p3-05 is its decisive evidence

The lead asked whether p3-05 is the lesson that most flatly contradicts p1-05's
*"Order blocks are deliberately kept out of this mentorship."* **It is**, and by a
different mechanism than Part 2's, which is why it settles the finding.

Part 2's evidence was volume and use: four of six lessons *teach* the order block
as an entry vehicle. Episode 18 is stronger because ICT does three things inside
the mentorship that "kept out" cannot survive:

1. He gives it a **titled segment** — the lesson's own title, from the note page's
   underlined line, is *"What makes an order block valid?"*
2. He **corrects other teachers** on it, at length: *"I get upset when people try
   to teach what they heard me teach … they're doing things that are not accurate
   … so that way your viewers won't be harmed or they won't use something that's
   done incorrectly and **dubbed as my order block**"* (ep18:1132-1166).
3. He **claims authorship of the concept** — *"you didn't learn it properly from
   **the person that created it**"* (1229-1231) — the same assertion **H** found in
   p2-05, now repeated.

Recount, since the lead's figures were approximate: **"order block" appears 124
times across Section 2's lesson HTML** — p1 12, p2 29, **p3 34**, p4 16, p5 11,
p6 22 (case-insensitive, counting plurals). Slightly higher than **H**'s 102, but
the distribution and the conclusion are unchanged: **Part 3 is the densest part in
the corpus**, and within it p3-03 (13), p3-06 (10) and p3-05 (9) carry almost all
of it.

**G10 stays should-fix, and the fix wording is now final.** Nothing is fabricated
— ICT does say *"I'm going to **try** to stay away from order blocks … in this
mentorship really"* (ep5:159-172). The defect is the **hardening** of *"try to
stay away"* into *"deliberately kept out"* (the **A3/C7** over-tightening family),
which misdescribes 35 of the course's 40 lessons. The replacement clause should
say what actually happened: ICT *intended* to keep them out, and the mentorship
went on to teach them as a primary entry technique, define them (p2-02), develop
them in two directions (p2-05, p2-06) and devote a lesson to their validity
(p3-05). One clause in `p1-05`, using ep7's *"I'm going to teach it the way I want
to teach it … it works"*. **G10 needs no further evidence and should not be
revisited in batches J–L.**

#### Coverage gaps — episode 18

**I10 · should-fix · FIXED · [p3-05/lesson.html:8](../content/s2-2022-mentorship/p3/p3-05/lesson.html#L8)** —
**the lesson keeps ICT's answer and drops the half of it that says the answer
isn't a guarantee.** The lesson opens by stating the question — *"if you only had
one way of doing it, what would you do, and what does that look like on the chart,
step by step?"* — and answers *"the answer is **this model** — nothing else bolted
on."* ICT's actual answer begins the other way round:

> *"a specific style of trading that if I only had to pick one way of doing it,
> one style of trading, that obviously hits all the time — **well there is no
> method that hits every single time**, okay. Everything that I trade with and
> teach is like everything else, **it's imperfect**. That means there's going to
> be losing transactions **largely because of the operator** — me or whoever else
> is using it — and **you have to take ownership of that**"* (ep18:117-135)

He reinforces it twice more: *"if I had a way that I would never lose, I would
have never came out publicly and became a teacher"* (377-380), and *"**you don't
need to be perfect and I've proven imperfection still doubles the account**"*
(388-390).

Attached to that, and **absent from the lesson entirely**, is a substantive
teaching in its own right — the answer to a student's question about win rate:

> *"what if your win rate is really really low, can you still double an account?
> **Yes** — because I was thumbing my nose at this idea that **a risk to reward
> model is the essential for you to be net profitable. That's not true.** I've
> proven that with a live account"* (392-401)

That is a direct claim about how the method makes money, sourced to one sentence,
and it is nowhere in Part 3. The lesson does carry the **bias**-level hedge
(*"your bias isn't going to be perfect"*, correctly, at line 24) — but that is
about bias, not about the model, and its presence makes the method-level omission
read as an editorial choice rather than an oversight. Same **H14/H18/H19** shape
as **I3**, **I4** and **I9**: the claim survives, the qualification does not.
*Fix:* one clause in the opening paragraph, plus the win-rate/RR point as a
`.callout` — the material is two sentences of ICT.

**I11 · should-fix · FIXED · p3-05** — **the batch's proportionality finding: six
questions do not cover this lesson.** Per the lead, C18's floor is not the test
here (6 > 4); **D14/E18**'s is, and p3-05 fails it on both denominators:

| Lesson | Transcript | Lesson KB | Qs | KB transcript / Q | Qs per KB of lesson |
|---|---|---|---|---|---|
| p3-01 | 3.8 KB | 4.3 | 6 | **0.6** | **1.40** |
| p3-02 | 7.6 KB | 6.7 | 7 | 1.1 | 1.04 |
| p3-03 | 54.6 KB | 19.2 | 11 | 5.0 | 0.57 |
| p3-04 | 26.1 KB | 11.5 | 10 | 2.6 | 0.87 |
| **p3-05** | **64.7 KB** | 15.4 | **6** | **10.8** | **0.39** |
| **p3-06** | **133.9 KB** | 18.7 | **7** | **19.1** | **0.37** |

The count is not the defect — **p3-01 carries the same six questions and they
cover every beat of its lesson.** What is untested in p3-05 is the top half of it:
all six questions sit in the entry-mechanics cluster (validity, stop placement,
the bellwether, the parent imbalance, the 11:30 rule, gold), and **nothing at all
tests Step 1 or Step 2** — the three-chart layout, "set your charts to New York",
*"a bias is just an idea that you want to work within"*, or the previous-daily-
highs-and-lows targeting with its *"you're never going to run out of trades,
ever."* Nor does anything test the **low threshold entry** rule, which is the
lesson's only risk-management teaching (*"that higher risk in terms of number of
pips, not in terms of the amount of money … the amount of allocation in terms of
the leverage you're using, that's the most important thing"*, 1056-1070).

Two of the lesson's four numbered steps and its one leverage rule go untested.
*Recommendation:* +3, drawn from the bias rule, the previous-day targeting and the
leverage point. No new sourcing needed — all three are already written into the
lesson.

**I12 · nit · p3-05** — two dropped passages, both belonging to families the audit
already tracks:

- **The order-block authorship polemic** (ep18:1122-1231). The lesson carries the
  *correction* — *"the common answer … is the one he is correcting here"* — but
  not that ICT is correcting **named-in-the-abstract other teachers**, nor his
  claim to have created the concept. This is **G6**'s dated-provenance family, and
  it is the second Section 2 site (after p2-05, per **H**) where ICT's authorship
  claim is dropped. It is also the evidence **G10** most wants.
- **The live-account explanation** (286-331, 402-413), which is the fuller version
  of something the corpus half-carries already. ICT explains that the executions
  in his live-account videos are him deliberately reproducing situations paying
  students asked about — *"a lot of those executions you're seeing is just simply
  me pushing a button … it's going to cost you commission, it's going to look like
  you have no idea what you're doing."* p3-02 gives the thin version of this
  (latency tests, mimicking a new trader); ep18 gives the reason, and p3-05 drops
  it. Also dropped from the same stretch: ICT's opinion on funded-account programs
  (*"do I believe everyone should do that? I don't personally believe everyone
  should — but it is an avenue you have to consider"*, 434-439).

#### Noted, not a finding (episode 18)

**A hedge that *did* survive — the first clear counter-case to I3/I4/I9/I10.**
ICT's gold warning comes with an explicit scope limit: *"am I saying there aren't
people out there that are making money consistently in gold? **No, I'm not saying
that.** I'm saying [it] because I'm speaking to people with the expectation that
you're just now learning how to do this"* (ep18:1536-1549). p3-05's gold callout
keeps it — *"He does not believe it is the ideal market for someone to be
aggressively short-term trading **while learning**"* — and
[`p3-05/quiz.js:7`](../content/s2-2022-mentorship/p3/p3-05/quiz.js#L7)'s `e`
repeats the scope. So the dropped-hedge pattern is a **tendency, not a rule**, and
the same lesson that drops the largest hedge in the batch (**I10**) preserves a
smaller one accurately. Worth recording because four findings in a row could
otherwise read as a systematic editorial policy, and it is not one.

**The best-built quiz in Part 3 is the one with the fewest questions.** p3-05
scores **17% strict / 17% expected / 83% not-longest**, with a max spread of 7 —
within touching distance of p2-03's corpus record (11%). So **I11** is a coverage
complaint about the six questions, not a construction complaint: they are
well-made, there are simply not enough of them and they cluster.

#### Content fidelity (§1) — episode 19

**p3-06 has no fidelity finding either, which means Part 3 closes with zero.**
This is the largest transcript in the corpus (133.9 KB, 3,712 lines) compressed
into 18.7 KB — a ~7:1 drop, the steepest in the batch — and every claim that made
it through is accurate. Spot-checked exhaustively against all four reading passes:

- **The "when not to trade" block** — *"there's absolutely zero, nothing in this
  chart, nothing to trade on, not one thing"* (ep19:1797-1800), the definition of
  sloppy (1821-1827), *"closing the charts, turning your computer off and go do
  something you love to do"* (1840-1847), the hobby-outside-trading instruction
  (1848-1853), and the months without a cable trade *"because this is simply not
  delivering what I'm looking for"* (1861-1871). The lesson's *"not because the
  algorithm changed"* is ICT's own next sentence (1868-1871).
- **The gambling line** — *"put the potato chips down, put your drink down,
  listen, you do not need to trade every single day"* (1939-1943, verbatim),
  *"if you can't reasonably outline that then you're gambling"* (1956-1958),
  *"that's a gambler's mentality"* (1963), the four things he does not promote
  (1964-1968), and **one contract / double the account / lowest leverage /
  "if you don't have the patience to do that you're a gambler"** (1969-1984).
- **The three failure modes** — *"they lack responsibility number one, they lack
  the adherence to rules, and they have not put enough time"* (964-970), with the
  push-button point at 961-963.
- **The two weeks without a trade** — *"for some of you it's going to [drive you]
  nuts, others it's going to make you want to change the style of trading, and
  **they're both wrong**"* (2179-2184).
- **The bias block** — the dealing range from the most recent swing low with a
  higher low either side (2313-2320), the ~50% retracement (2321-2323), and the
  headline stated word for word: *"it went down to equilibrium or short-term
  discount — **the next day we can expect it to go higher**"* (2394-2398), through
  to *"sometimes your cookies ain't going to rise"* (2412-2414).
- **The four targets** — candle low / open / mean threshold / high, *"the high is
  the less likely, the easiest is [the] one down here"* (2435-2442), and the
  developing student picking the easiest and being content (2492-2495). Mean
  threshold as *"the half point or median of an order block"* is 2374-2380.
- **Purge and revert** — purge the sell stops, *"revert back to the high in the
  last three days, so day one two three"* (2496-2511), buy stops above because
  shorts trail their stops there (2517-2522). This matches `ep-19.md` exactly,
  including the **purge day counted as day one**.
- **The opening prices** — midnight as *"the price I want to preferably be buying
  below"* (2854-2855), **8:30 because the news embargo lifts** (2860-2863), and
  the tiebreak verbatim at 2908-2915.
- **The closing block** — *"make it as boring as possible … you won't be a victim
  of your emotions"* (3391-3396), *"next time use realistic leverage"*
  (3586-3591), clout as a barrier (3562-3564, 3604-3609), *"points or pips, not
  the money — the money is a derivative of doing the right things"* (3421-3427),
  *"don't try to be an olympic trader"* (2156-2161), and *"I'm gonna make
  mistakes, I'm gonna read it wrong, I'm going to react too late, I'm going to
  react too soon"* (3335-3339).

The rattlesnake (2111-2127), the bookmark (705-736) and the "engineers buy stops"
narrative (2605-2682) are all reproduced with their reasoning intact.

#### The batch lead's hedging test — **episode 19 reverses the pattern**

The lead predicted ep19 would be the strongest confirmation of batch **H**'s
finding: largest transcript, subject is *when not to trade*, highest drop ratio in
the batch. **It is the opposite** — p3-06 is the lesson in Part 3 that keeps ICT's
hedges. Grepping ep19's hedging register (34 lines of *"try/trying to"*, 5 of
*"I don't know"*, 1 of *"nothing is guaranteed"* — the densest in the batch) and
tracing each to the lesson:

| ICT's hedge | Reached p3-06? |
|---|---|
| *"how long does it take? **I don't know.** how long is it going to take you? I don't know"* (1971-1974) | ✓ line 21 |
| *"sometimes your **cookies ain't going to rise**"* (2412-2414) | ✓ line 40 |
| *"I could be absolutely wrong … **I don't mind being wrong** by not trying to pick tops and bottoms"* (504-510) | ✓ line 26 |
| *"**you can and will absolutely lose money** trading this style"* (787-788) | ✓ line 29 |
| *"I'm human, I'm gonna make mistakes"* (3335-3339) | ✓ line 79 |
| *"**nothing is guaranteed** that's going to repeat — that's why we have to have stop loss"* (3473-3475) | ✗ (**I14**) |
| *"not that it's going to absolutely work in the future all the time"* (3468-3469) | ✗ (**I14**) |

**Five of seven survive**, including the two most load-bearing (the counter-trend
warning and the bias-isn't-perfect concession). So the dropped-hedge pattern in
Part 3 is **concentrated in p3-01, p3-03, p3-04 and p3-05 and absent from the
lesson that was predicted to show it worst.** That is worth stating plainly
because it changes the diagnosis: this is not a Section 2 editorial policy, it is
lesson-by-lesson variance, and **p3-06 is the model to copy** rather than the
worst case.

#### Coverage gaps — episode 19

**I13 · should-fix · p3-06** — **the flip-a-quarter demonstration is missing, and
the lesson keeps the conclusion it proves.** p3-06 says money management "does the
heavy lifting" (line 78) and that one contract doubling an account is the goal
(line 21). ICT's argument for both is a concrete, numbered exercise, and none of
it reaches the lesson:

> *"there's people out there that don't trade like me and they make millions
> **because they are good money managers, period** … I don't think that profitable
> systems outside of what I'm teaching are linked to their actual system, it's
> linked to their **adherence to their rules, sound money management, and not over
> trading and not over leveraging** — because literally **I could flip a quarter**
> and you could too with sound money management [and] make an account be
> profitable … **do it with a demo** … flip a quarter, if it's heads you buy, if
> it's tails you sell short, do it every single day, **don't risk more than a half
> percent, aim for one percent** … **use a 30 pip stop** and trade a forex pair …
> and see how hard it is to blow the account"* (ep19:999-1053)

That is the only place in Part 3 where a **risk-per-trade number** is given
(0.5% risk / 1% target / 30-pip stop), and it is the evidential basis for the
lesson's own money-management claim. Section 1 carries comparable numbers
(m2-04's accuracy/RR table, **B6**'s half-percent case); Section 2, on this
evidence, does not.
*Fix:* a `.callout` reproducing the exercise, which is four sentences of ICT and
needs no interpretation.

**I14 · nit · [p3-06/lesson.html:76](../content/s2-2022-mentorship/p3/p3-06/lesson.html#L76)** —
**the one hedge ep19 does lose, and it is attached to the teaching most in need of
it.** The lesson's *"How to annotate a back test"* callout reproduces the
self-talk method faithfully — write it as if you saw it beforehand, keep every
annotation positive, build pseudo-experience. ICT ends that same passage with the
limit:

> *"you're fortifying your expectations going forward on this pattern yielding
> something in the past — **not that it's going to absolutely work in the future
> all the time**, but we as price action traders we look for signatures that
> repeat. **Nothing is guaranteed that's going to repeat — that's why we have to
> have stop loss**, that way we know that there's risk in this market"*
> (ep19:3466-3477)

A method whose stated purpose is *"tricking your brain"* into confidence is the
one place a "nothing is guaranteed, use a stop" clause carries the most weight,
and it is the single hedge the lesson drops. Low severity because the lesson is
otherwise the batch's best on hedges (see above), but it is the sharpest instance
of the shape in Part 3.

**I15 · nit · p3-06** — three attributions and one illustration dropped, all in
families the audit already tracks:

- **The Goldman Sachs rebuttal** (ep19:2573-2586): *"the guys over in Goldman
  Sachs … like to say that **intraday is just noise**, and one of those guys
  actually said he tried very hard to make it work and if anybody tells you that
  intraday trading is profitable and you can do it consistently, run away from
  them because they're a con artist. It's kind of funny that I'm proving technical
  science."* ICT names the counter-claim he is answering, and the lesson carries
  neither. **B4 / G15 / H20** attribution family.
- **The dates on his own history** — *"I started in futures in **1992**"*
  (1331-1332) and *"I've been doing this stuff **30 years**"* (1368-1370). p3-06
  carries **no date at all**. With **I9** (FX since 2010) and **I12** (order block
  authorship), that is **three Part 3 lessons in a row** where a date attached to
  ICT's own history is dropped — the **G6** family, now clearly a part-level
  habit rather than three coincidences.
- **The crypto self-exclusion** (448-456). The lesson's *"it applies to forex,
  futures and bonds"* (line 71) is ICT's list verbatim (444-446); his very next
  sentence limits it — *"I am not a crypto trader, if I traded crypto I would blow
  my accounts out … I'm good in forex, I'm good at futures, that's it."* The
  lesson correctly declines to add crypto (§1 — ICT only reports what students
  claim), so the omission is of the self-limitation, not of scope.
- **The euro no-bias case** (1524-1584), which is the lesson's own thesis
  demonstrated on a second pair and arguably the stronger illustration, because
  euro is the pair ICT had just been *right* about: *"I don't have a bias at the
  very moment for euro … not on a daily chart, not on the four hour chart and not
  on the hourly … I have nothing to go on at this very moment."* The lesson
  builds the stand-aside case entirely on cable.

**I16 · should-fix · p3-06** — **the second half of the proportionality finding:
seven questions for 133.9 KB is the thinnest ratio in the corpus** (19.1 KB of
transcript per question; see **I11**'s table). Unlike p3-05, p3-06's seven are
*well distributed* — the stand-aside thesis (q2, q7), the bias rule (q1), the 8:30
tiebreak (q4), purge and revert (q5), relative equal highs (q6) and the bookmark
(q3) hit six different sections. The gap is what falls outside them:

- **The four-target ladder** (candle low → open → mean threshold → high, in order
  of ease) — the lesson's only procedural sequence and its only explicit
  instruction to a *developing* student, untested.
- **The counter-trend warning** — *"You can and will absolutely lose money trading
  this style"* — the lesson's strongest `.callout warn`, untested.
- **The entire closing block** — "make it boring", realistic leverage, points not
  money, the annotation method. p3-03's quiz tests back testing, so the method is
  covered at part level, but the leverage and boring-is-the-goal material is not
  tested anywhere in Part 3.

*Recommendation:* +3, from the four-target ladder, the counter-trend warning and
the realistic-leverage rule. As with **I11**, all three are already written into
the lesson.

#### Noted, not a finding (episode 19)

**A garbled sentence resolved the *right* way — the direct counterpart to H1.**
Batch **H**'s only fidelity finding was a lesson resolving an ambiguous ICT
sentence in the direction the words do not support, and **H** noted the tell was a
**reversed verb** rather than a mangled number. Episode 19 contains the same
hazard and the lesson gets it right:

> *"now you may not feel comfortable buying the london or overnight lows, that's
> fine — **you don't need to wait for 8 30**"* (ep19:2967-2969)

Read literally, that says *don't* wait for 8:30, which reverses the point. The
lesson reads it as *"you don't need to [buy those] — wait for 8:30"*
([p3-06:63](../content/s2-2022-mentorship/p3/p3-06/lesson.html#L63): *"you can
wait for 8:30"*), and that is right on all three checks: the very next sentence
develops the 8:30 entry (2970-2973), the whole section exists to give a second
reference point later in the day, and `ep-19.md` states the rule the same way. So
the disposition that produced **H1** produced the correct repair here — which
supports **H**'s framing of the de-garbling as a *tendency* with variance, and
adds a case on the good side of the ledger.

**A pointer that correctly goes nowhere.** ICT says *"purge and revert — you can
do a YouTube search on that, it's in my YouTube channel"* (2496-2501). Unlike
**I8**'s episode-12 reference, this points **outside** the mentorship to ICT's
wider channel, and there is no lesson in this course to cross-reference. The
lesson teaches purge and revert in full and adds no pointer, which is correct.

#### Quiz quality — Part 3 overall

**All 47 questions were checked; 46 are source-traceable.** The single exception
is **I1** (p3-01 q3's rationale), which is the first untraceable correct option
found in Section 2 — Parts 1 and 2 were 44/44 and 49/49. Every quoted `e` in the
part is accurate to the word where it claims to quote, with the one composite
noted under episode 15.

**Part 3 is the weakest question set in Section 2, and it ends the "Section 2 is
improving" reading.** Measured the **D15/E19/F14** way (ties are *not* a tell;
margin over the **second-longest**; F14's not-longest column leading):

| Lesson | n | strict | expected score | median margin | not-longest | max spread |
|---|---|---|---|---|---|---|
| p3-01 | 6 | 50% | 50% | 1 | 50% | 5 |
| p3-02 | 7 | 29% | 36% | 1 | 71% | 10 |
| **p3-03** | 11 | **73%** | **73%** | 3.5 | **27%** | **30** |
| p3-04 | 10 | 60% | 60% | 4 | 40% | 13 |
| **p3-05** | 6 | **17%** | **17%** | 3 | **83%** | 7 |
| p3-06 | 7 | 43% | 43% | 2 | 57% | 10 |
| **Part 3** | **47** | **49%** | **50%** | **2** | **51%** | **30** |

Against the corpus:

| | strict | expected | not-longest |
|---|---|---|---|
| Part 1 | 34% | 46% | 66% |
| **Part 2** | **16%** | **29%** | **84%** |
| **Part 3** | **49%** | **50%** | **51%** |
| S1 quizzes | 71% | 76% | 29% |
| S1 exam | 31% | 42% | 69% |
| S2 exam | 38% | 45% | — |

**The lead's open question — is Section 2 improving monotonically, or is Part 2
the peak? — is answered: Part 2 is the peak.** Part 3 is worse than Part 1 on
every column, worse than **both exams**, and only Section 1's quizzes are worse.
A knowledge-free guesser who always clicks the longest option scores **50%** here
against a 25% chance rate — up from 29% one part earlier. So the corpus trend is
**not** a steady improvement from Section 1 through Section 2; it is Section 1 bad
→ Part 1 good → Part 2 best → **Part 3 regressing halfway back**.

Two lessons drive it, and they pull in opposite directions:

- **p3-03 is the batch's Section-1-shaped quiz** — 73%/73%/27% with **I7**'s
  30-character spread. It is also the **largest** quiz in the part (11 of 47
  questions), so it carries 23% of the weight. Removing it alone takes Part 3 to
  ~42% expected.
- **p3-05 at 17%/17%/83%** is the second-best lesson quiz in Section 2 after
  p2-03, and shows the technique had not been lost — it is applied inconsistently
  within one part rather than forgotten.

This is the **G16 / p1-06 pattern repeating with a larger blast radius**: one
Section-1-shaped quiz inside an otherwise-fine part, except that in Part 1 the
outlier was a 4-question lesson and here it is an 11-question one.

**Not re-flagged:** all 47 questions mark `a: 0`, as all 49 of Part 2's did.
**D14** settled that the `a`-index is harmless (options Fisher-Yates shuffle at
render).

#### Consistency — clean

Verified mechanically:

- All 6 lessons carry `data-month="p3"`; ids are `p3-01` … `p3-06`; **all 5
  `data-slug`s present match their id prefix**, and after the fix in flight p3-01
  correctly carries **no** `data-slug`, with the omission annotated per the
  Section 2 convention (see *Fixed in flight*).
- **Chart counts match the harvested notes exactly, 1:1 and in order** —
  ep14 **0**, ep15 **1**, ep16 **7**, ep17 **2**, ep18 **2**, ep19 **1** = **13**,
  against 13 files in `notes/2022-mentorship/raw/` and 13 in `images/`. The lead
  predicted this would come back clean and it does, on all three counts.
- **All 6 `video.txt` URLs appear in
  [`docs/s2-2022-mentorship-videos.md`](s2-2022-mentorship-videos.md)** and each
  maps to the right episode **and** the right lesson id (rows 23-28: ep14→`p3-01`
  … ep19→`p3-06`). Two of the six are independently confirmed by ICT's own notes
  (see the episode 14-15 notes above) — the first time a Section 2 video URL has a
  third source.
- One episode = one lesson throughout, per plan §3: p3-01…p3-06 ↔ episodes 14…19.
- **Session times agree across the whole section** — see the forex cross-check
  under episode 17. No drift between p2-01, p3-04 and p3-05.
- `python build.py` and `python verify.py` pass, 0 JS errors, and the repo's only
  build warning is gone.

**I17 · nit · corpus-wide, surfaced in Part 3** — **three quiz-file formatting
styles coexist.** Classified mechanically across all 78 `quiz.js` plus both
`exam.js`:

| Style | Files | Where |
|---|---|---|
| `{q:"…",o:[…],a:0,e:"…"}` (compact, no space) | **39** | all of Section 1, plus one Section 2 lesson |
| `{ q:"…", o:[…], a:0, e:"…" }` (compact, spaced) | **34** | most of Section 2, including p3-01 … p3-05 |
| Multi-line pretty-printed `{\n  q: "…",\n  o: [\n …` | **7** | `p1-07`, **`p3-06`**, `p6-06/07/08`, **and both `exam.js`** |

It is **harmless to the build** — `verify.py` passes and all 451 quiz questions
plus 85 exam questions parse. It matters only as a measurement trap: a naive
`grep -c '{ q:'` returns **0** for the seven pretty-printed files *and* for all 39
compact-no-space ones, which is how a manual quiz count can go wrong. The
Method-notes regex handles all three, and Part 3 really does total 47.

To be explicit, since `CLAUDE.md` §3 warns about formatter hazards in the meta
files: **this is not one of them.** §3's hazard is a JS formatter inserting a `;`
into `section.js` / `months.js` (block statements) or trailing a `;` onto an array
literal — `build.py`'s `parse_objs` and `js_literal` already defend against both,
and reformatting an *array* literal is the safe case. So these files can be
normalised freely; it is a cosmetic inconsistency, not a risk.

#### Batch I summary

| | |
|---|---|
| Lessons audited | 6 (episodes 14–19, **291 KB of transcript — the heaviest batch in the corpus**) |
| Findings | **17** — 0 blockers, **9** should-fix, **8** nits |
| Fidelity findings | **1** (**I1**) |
| Quiz questions traceable | **46 of 47** |
| Fixed in flight | **1** — the p3-01 slug (the first in nine batches) |

**The headline is that Part 3's weak dimension is the quiz, not the content** —
the first batch in this audit where that is true. Five of the six lessons have no
fidelity finding at all, the sixth has one mild one, and the four largest
findings by consequence are split evenly between **coverage** (**I10** the
"no method hits every time" answer, **I13** the flip-a-quarter money-management
demonstration) and **quiz construction/coverage** (**I7** the corpus-record
30-character spread, **I11**/**I16** the two proportionality failures). Part 3
carries **47 questions for 291 KB of transcript**, and the distribution is the
problem: p3-01 gets 6 questions for 3.8 KB and p3-06 gets 7 for 133.9 KB.

**Do the Part 1 and Part 2 conclusions replicate? Three of four, and the fourth
reverses:**

1. **One episode per lesson prevents migration defects — replicates, third
   time.** No instance of material crossing between lessons or arriving from
   outside the teaching (**A2**, **C1**, **C2**, **D1**, **E1**'s failure mode).
   Nineteen Section 2 lessons audited, no leakage. **I1** is the closest thing —
   an unsourced *rationale* — but nothing migrated; the clause was written, not
   imported.
2. **The transcript beats the notes — replicates, with the strongest supporting
   case yet.** ep16's old-high array claim is **incoherent as transcribed**
   (*"discount"* twice) and `ep-16.md` resolves it in one line (*"First old highs
   are a premium array"*). The lesson matches the note, which is the correct
   reading. Watch-list item from **H5** stands at two instances (p2-02's scope
   qualifier, p3-02's composite FOMC quotation) — still not a pattern.
3. **The de-garbling is sound — replicates, four more times, all correct**
   (*"bowl flag"* → bull flag, *"AO account"* → demo account, *"F1 see"/"FC"* →
   FOMC, *"white golf"* → Wyckoff, plus *"45 04 and a quarter"* read correctly as
   4501.25). **Twelve silent corrections across Parts 1–3, all correct.** Part 3
   also adds both of the harder cases: a **figure correctly left out** when the
   source could not support it (ep16's *"the 45 32 the 45 40 level"*, the second
   Section 2 instance after p2-05's *"14,500 points"*), and — most usefully — an
   **H1-shaped garbled sentence resolved the right way** (ep19's *"you don't need
   to wait for 8 30"*). **H1** remains the only repair that went the wrong way.
4. **"Hedges get dropped" — replicates in four lessons and REVERSES in the one
   predicted to show it worst.** Batch **H**'s headline was that Part 2 keeps
   claims and drops the qualifications attached to them. Part 3 does it in
   p3-01 (**I2**), p3-02 (**I3**), p3-03 (**I4** — two hindsight caveats),
   p3-04 (**I9**) and p3-05 (**I10** — the largest instance in the batch). But
   **p3-06 keeps five of ICT's seven hedges**, including the two most
   load-bearing, and it is the lesson with the largest transcript, the highest
   drop ratio and *when not to trade* as its subject — exactly the lesson the lead
   expected to be the strongest confirmation. **So this is lesson-by-lesson
   variance, not a Section 2 editorial policy.** That distinction matters for
   batches M/N: the fix is per-lesson, and **p3-06 is the template**.

**What contradicts an earlier reading.** Two things, both worth stating plainly:

- **The lead's prediction about episode 19 was wrong, and the data says so
  clearly** (point 4 above). The largest transcript in the corpus produced the
  batch's *best* hedge retention, not its worst.
- **"Section 2's quizzes are improving" is withdrawn.** Batch **G** reported Part
  1 at 46% expected against Section 1's 76%, and **H** reported Part 2 at 29% —
  "better than both exams", the corpus best. Part 3 is **50%**, worse than Part 1
  and worse than both exams. The trend is not monotone, and **Part 2 is the peak
  so far**. Whether Parts 4-6 recover is now an open question for batches J-L
  rather than a settled direction.

**Three verdicts closed by this batch, so later batches need not revisit them:**

- **G10 — finalised.** p3-05 is the decisive evidence (titled segment, correction
  of other teachers, authorship claim). Stays should-fix; the defect is the
  hardening of *"try to stay away"* into *"deliberately kept out"*; fix wording is
  recorded above. **Do not revisit in J-L.**
- **The four-way order block definition — no drift.** p2-02, p2-05, p2-06 and
  p3-05 are consistent and cumulative; p3-05 adds the imbalance validity test and
  the parent/subordinate rule and overturns nothing.
- **The forex cross-check — no drift.** Every session time in Section 2 agrees;
  **H7**'s worry does not generalise.

**Two items carried to batch N** (recorded, not fixed):

1. **`intermediate term` hyphenation, now with per-part numbers** — and the
   pattern is sharper than **H** stated. Measured across `lesson.html` + `quiz.js`
   plus the section-level files:

   | | hyphenated | unhyphenated |
   |---|---|---|
   | S1 lessons | 1 | 0 |
   | p1 | **3** | 0 |
   | p2 | 0 | **21** |
   | **p3** | **0** | **4** |
   | p4 | 0 | 3 |
   | p5 / p6 | 0 | 0 |
   | S2 `summary.html` | **1** | 0 |
   | S2 `exam.js` | **2** | 0 |
   | **Total** | **7** | **28** |

   This confirms **H**'s totals exactly (7 / 28). The new observation: the
   **hyphenated** form survives only in Section 1, in **Part 1**, and in the
   **section-level pages** — so `summary.html` and `exam.js` use a spelling that
   **no lesson from p2 onward uses**, which is the pair of files a reader meets
   last. That makes the review pages, not the lessons, the natural place to
   normalise from.
2. **The quiz-file formatting split** (**I17**) — three styles, cosmetic, safe to
   normalise, and not a §3 formatter hazard.

**Input to batches J-L.** Watch for: (a) whether the **hedge-dropping** continues
or whether p3-06's retention is the new normal; (b) whether the **quiz regression**
is a Part 3 anomaly or a Section 2 second-half trend — measure Part 4 early;
(c) a **third** instance of a lesson preferring the note's phrasing over the
transcript's (**H5**, p3-02's composite quote); (d) more **dated provenance** on
ICT's own history going missing — three consecutive Part 3 lessons dropped one
(**I9**, **I12**, **I15**), which with **G6** makes it the most consistent
omission family in Section 2.

**A figure correctly left out.** ICT names the PM buy-side pool as *"the 45 32 the
45 40 level"* (ep16:1039) — a rendering that could be 4532/4540 or a mangled
single level, with no bracketing sentence to repair it. The lesson describes the
pool qualitatively and omits the numbers, in a lesson that otherwise quotes every
price to the quarter-point. That is the same posture batch **H** praised in p2-05
over ep12's impossible *"14,500 points"*: de-garble when the source permits,
decline when it does not. Second instance in Section 2.

**Two more silent de-garbles, both correct.** ep16:336 renders the projection as
*"45 04 and a quarter"* where every other mention in the episode says **4501.25**
(322, 362-365, 443) — the lesson uses 4501.25 and correctly reads the 4504 in that
sentence as the *order block*, which is the only arithmetic that works (*"just
below … that daily bullish order block at 4504"*). And ep16:1293's *"white golf"*
becomes **Wyckoff**. That is twelve across Section 2, still all correct.

### Batch J — Section 2, Part 4 (p4-01 … p4-06 / episodes 20–25)

Sources: `transcripts/2022 Mentorship/…Episode {20..25}.txt` (229 KB) and
`notes/2022-mentorship/ep-{20..25}.md` (**3.1 KB — the thinnest note set of any
batch**). One episode per lesson throughout, per the plan's §3 map.

**Mechanical checks, run first — all clean.**

| Check | Result |
|---|---|
| Charts: notes `![]` refs → `raw/*.png` → `images/*.png` | **1 / 1 / 1 / 1 / 2 / 6 = 12** on all three counts, in order |
| `video.txt` vs `docs/s2-2022-mentorship-videos.md` | rows **29–34**, ep20→`p4-01` … ep25→`p4-06`, all six URLs present and correctly mapped |
| Quiz questions | **45** (7/8/9/6/7/8), every one `a: 0`, all six files in the `{ q:` format |
| `build.py` warnings | **zero** (unchanged) |

#### Content fidelity (§1) — episodes 20–22

**J1 · should-fix · FIXED · `p4-02:70`** — **two dollar figures merged into a range that
describes neither.** The lesson says holding *"one of the two contracts would have
been roughly **$8,000 to $12,000**."* The transcript gives the two numbers for two
different position sizes: *"if I would have just held on to what I had in the
morning … I could have done around **twelve thousand dollars** today alone"*
(ep21:539-542) — that is what he was actually carrying — and, separately,
*"wishing I just would have had at least one of the two contracts I had on, one
still and just let it run and I could have done … about **eight grand** or so"*
(ep21:655-660) — that is one contract. The range is manufactured by putting both
figures behind the same subject. Nothing is invented, but a reader learns the
wrong per-contract arithmetic.

**J2 · should-fix · FIXED · `p4-02:40`** — **the hindsight qualifier is dropped from the
lesson's single strongest read, and this is the third instance of a lesson
preferring the note over the transcript (H5's family).** The callout states the
two-opening-price test as a live tell: *"That combination is **the tell**:
extremely bearish."* ICT states it with an explicit qualifier —

> *"did we rally above the opening price at midnight? no. did we rally above the
> opening price at 8 30? no. and we're bearish. what does that indicate to you?
> **obviously with the benefit of hindsight** it's extremely bearish"*
> (ep21:499-512)

`ep-21.md` carries it **without** the qualifier (*"When bearish and price doesn't
rally above MNO and 830 for a fake rally, it means were extremely bearish so look
where its drawing to and how you can get involved"*), and the lesson follows the
note. Both are permitted sources so nothing is unsourced — but batch **I** asked
for *"(c) a third instance of a lesson preferring the note's phrasing over the
transcript's"* and this is it, after **H5** (p2-02's scope qualifier) and p3-02's
composite quotation. Unlike those two it has a consequence: the reader is left
believing the test is callable in real time.

Nothing else in episodes 20–22 fails fidelity. Every number checks: p4-01's
99.92 / 99.95, the entry 1.09244 (*"1.0924 and four pipettes"*, ep20:440), the stop
1.09365 (*"1.0936 and a half"*, 443), the 1.09301 drawdown and *"about five pips"*
(447-457); p4-02's 4320, 15-20 handles, the 3:00am London break; p4-03's entire
execution — 13,334.75 low, 13,335 entry (*"only a quarter of a point above"*),
13,339.5 heat = 4.5 handles, six contracts bought back at 13,285 even, the 13,409
scalp exit against a wanted 13,425, ~$740 (ep22:937-997, 1121-1136).

**Three more silent de-garbles, all correct** (running total **15** across Section 2):

| Source | Rendered | Where |
|---|---|---|
| *"an **enemy term** high … they're both **enemy and term** highs"* | **intermediate term high** | ep22:706-721 → `p4-03:49` |
| *"retraces back up into this up closed candle … **pay a shorter block**"* | **bearish order block** | ep22:739-742 → `p4-03:54` |
| *"retraced back in **bear shoulder block**"* / *"rallies up to a **fair shoulder block**"* | **bearish order block** | ep21:362, 1093 → `p4-02:39,44` |

Each is forced by its own sentence — an up-close candle retraced into during a
bearish market **is** a bearish order block, and *"enemy term"* has no other reading
beside *"intermediate term"* in a passage that also says *"intermediate term high
by definition"* (ep22:711).

**And the transcript still beats the notes.** `ep-21.md` says *"**DXY and ES are
correlated**"*; the transcript and the lesson both say **inverted** (ep21:163-165,
`p4-02:18`). Fourth clean instance of the discipline **E1** lacked.

#### Coverage gaps — episodes 20–22

**J3 · should-fix · `p4-03:54-55`** — **the subordination rule is dropped**, and it
is the objection ICT stops to answer. Narrating his own entry he is standing inside
a **bullish** order block on the 1-minute while short:

> *"some of you might look at this and say oh but this is that order block, fair
> value gap here — and what happens if it rallies? well it does a little bit. But
> **what's it subordinate to?** All the things I outlined over here and on the five
> minute chart with a higher swing high. So the market structure is bearish —
> **I'm not looking at this setup.**"* (ep22:789-800)

The lesson keeps the calibration step (refine the 5-minute order block down to the
1-minute) and the *"I'm telling you how to read the tape"* disclaimer, but never
states the rule that an opposing lower-timeframe setup is **subordinate** to the
higher-timeframe structure and is therefore ignored. Batch **I** recorded p3-05 as
*adding* the parent/subordinate rule to the four-way order block definition; ep22
restates it in the sharpest form in Section 2 and p4-03 lets it go.

**J4 · should-fix · `p4-02:58-59`** — **the option not to trade is removed.** The
lesson's answer to a market too heavy to rally is to drop to the 2- and 1-minute
charts and use small imbalances, framed by **L59**'s *"Either you get in … or you
miss the move entirely."* ICT offers a third choice, and prefaces it with a warning
the lesson also drops:

> *"so it takes a little bit of **courage** to get in here and trade these types of
> setups — but that's what you do, **or you don't do anything and you just tape
> read, you watch it**"* (ep21:1082-1090)

Same shape as **I10**: the lesson keeps the instruction and drops what the source
said about its limits.

**J5 · nit · `p4-02:71`** — **the Bitcoin call record is compressed to one clause.**
ICT lists nine dated public calls (7,500 → 20,000; *"right before 20,000 I said it
wasn't going to 20,000, it was 19,700"*; → 6,000, called 3,000, went to ~3,200;
→ 20,000 by Christmas 2020; → 30,000, *"off by about 18 hours"*, hit on 2 January
2021; → 55,000 and 66,000, *"we went just a little bit above 66,000"*) at
ep21:963-986. The lesson keeps only *"He called Bitcoin's runs publicly for years
and never traded a single one with real money."* The **point** survives intact —
this is the "permission to be human" section, not a Bitcoin lesson — so it is a nit,
not a coverage failure. Logged because it is dated provenance of ICT's own history,
the family **G6/I9/I12/I15** established. **But Part 4 breaks that streak in the
same lesson:** `p4-02:61` keeps *"**1992, 1993, 1994** — I blew account after
account after account"* (ep21:917-919) verbatim. What p4-02 drops is only the
round-number version (*"almost 30 years"*, ep21:208; *"three decades"*, 921).

**J6 · nit · `p4-02:45`** — the **micro-contract and paper-trading fallback** is
dropped from the two-gaps callout: *"you can trade a micro — or maybe you could, I
shouldn't say that you can, I don't know what all of your risk parameters are …
while you're learning in paper trading obviously you can use anything because it's
all hypothetical money"* (ep21:606-614). The lesson keeps *"you may not like that
much risk and may not be able to take the trade"* but not the way out. Mild because
**p4-03:43** supplies the micros fallback three pages later.

**J7 · nit · `p4-01:8`** — the episode's **opening hedge on the algorithm** never
reaches the lesson: *"this is just one piece of price action in the delivery that
the algorithm **will likely — not every single instance, but it will likely
repeat**"* (ep20:15-22). It is the first thing ICT says after the greeting, and it
qualifies the whole demonstration that follows.

**J8 · nit · `p4-01:30`** — *"and **I'm not trying to trade forex right now**"*
(ep20:337-338) is dropped. The lesson keeps *"He took neither side of it"* and the
*"I went to sleep"* quote, so the behaviour is there; the reason is not.

**J9 · nit · `p4-03:82`** — the standard-deviation projection is stated without the
caveat ICT attached on the spot: *"this was a little bit excited because it went
**below** an important low, but that's enough for government work"* (ep22:1312-1315).
The lesson says only that the projections *"give a good idea of where the low should
form."*

**J10 · nit · `p4-03:38`** — the demo framing of the big-stop lesson is dropped:
*"so when you're practicing on your demo account keep that in mind, that way you're
not trying to overextend yourself"* (ep22:501-503).

**J11 · nit · `p4-03`** — the **TradingView humility and the pinned-tips
invitation** are dropped: *"admittedly most everything I know about TradingView
**my own students have taught me** … there's going to be a comment posted and
pinned by me underneath this video, it'll be TradingView tips"* (ep22:35-50),
echoed at 759-766. The lesson teaches four TradingView procedures (bullseye/magnet,
compare-pane, fib style, price note + shift) and presents all four as his.

#### Noted, not a finding (episodes 20–22)

- **`p4-01:50`'s GBPUSD is note-sourced, not invented.** *"Use the **dollar index
  for EURUSD and GBPUSD** bias"* — ep20's transcript never mentions cable; the line
  is `ep-20.md`'s first bullet verbatim (*"Use DXY for EURUSD and GBPUSD bias"*).
  Permitted source, so it stands.
- **`p4-03:14`'s *"that's high probability"* is likewise the note page**, not the
  transcript: ep22:245-252 gives the mechanism (bodies inside, wicks reaching for
  liquidity, *"the bulk of the volume is being held inside this imbalance"*) and
  `ep-22.md` supplies the verdict (*"If the bodies of the candles respect the FVG
  that's says a lot, that's high probability"*). The quiz quotes the note, correctly.
- **`p4-03:75`'s repricing rule is note-only too** — *"If ES enters a sell program …
  it will likely reprice to the low where something was respected and not the low
  where a SSL purge already occurred"* is `ep-22.md`'s last bullet and appears
  nowhere in the 48 KB transcript. Sourced; flagged only because three of Part 4's
  first three lessons each carry one note-only claim.
- **`p4-01:19`'s London killzone is 2:00am–5:00am New York** (ep20:246-256), which
  is the fourth part to state it and the fourth to agree — see the forex table below.
- **The hedge test, per lesson.** p4-01 drops two (**J7**, **J8**) and keeps
  *"close to the outlined level, **not exactly on it, and that is fine**"* and *"I'm
  not convinced the dollar's top was in."* p4-02 drops three (**J2**, **J4**,
  **J6**) and keeps five, including *"this is one of those times where I didn't get
  it right and I have no problem telling you"*, *"Power of Three was in effect —
  just so small it may not be useful to you"*, *"you may not be able to take the
  trade; that's part of the game"*, *"it doesn't mean the concepts don't work"* and
  *"those entries aren't scalable with the model shared publicly."* p4-03 drops two
  minor ones (**J9**, **J10**) and keeps ICT's own SMT hedge verbatim — *"they
  generally move together in tandem — **not all the time**"* (ep22:1200-1201) — plus
  *"this isn't always going to happen"*, *"it's not always"* on overbought premiums,
  and *"the best thing that can happen is for me to get it wrong sometimes."*
  **Lesson-by-lesson variance again, exactly as batch I concluded**; p4-03 is the
  batch's p3-06.

#### The C9 cross-check — **p4-03 does not close it**

The batch lead asked whether Section 2's SMT lesson supplies the cell **C9** found
missing from `m3-05`: ICT's fourth condition, *"when the dollar index **fails to
make a higher high** while foreign currencies make a lower low … they'll rally the
market higher, the dollar index will sell off"*
(`Institutional Market Structure.txt:156-183`) — the rule for spotting a dollar
**top**. **It does not, and it could not have.** Two reasons, both worth recording
so batches K/L don't re-run the same test the same way:

1. **It is a different pairing.** m3-05's SMT is **DXY against foreign currency** —
   an inverse pair, which is why its framework is a four-cell table with
   symmetrical and non-symmetrical rows. p4-03's is **NQ against ES** — two
   positively-correlated composites, where the divergence is read as *one index
   failing to confirm the other's stop run*. The two are the same technique on
   different instruments; the missing cell is not a cell of p4-03's table.
2. **p4-03's one-sidedness is the source's, not the author's.** ICT teaches only
   the bearish direction in episode 22: *"so **if we're bearish** and we're
   expecting lower prices and we see this but the s p doesn't do it, that's showing
   you that this is a stop run and it shows that s p is really weak"* (ep22:1202-1210).
   There is no bullish mirror in the episode to drop. So this is **not** a new
   **A8/C9/C10/D13/E18/F10** one-sidedness finding — the lesson reproduces what the
   source contains.

**Net effect on C9: unchanged. It stays a rewrite of `m3-05`, not a
cross-reference.** What Part 4 *does* add for batch N is a corpus-level
observation: after five of the nine SMT lessons (m2-06, m3-05, m3-06, p4-03 read;
p5-03, p6-01, p6-02, p6-05, p6-07 still to come in K/L), **a reader has been given
no rule for reading SMT in the bullish direction anywhere.** Whether that holds is
a batch-K/L question, not a batch-J one.

#### The pyramiding cross-check — **four sites, no drift, and p4-03 adds a condition**

| Site | Ladder | Rationale given |
|---|---|---|
| `p2-06:58-63` | **3 → 2 → 1** micros | Biggest first so later entries have equity behind them; *"one, then two, then three is an inverted pyramid"* |
| `p3-03:100-101` | **5 → 3 → 2** | Biggest first; *"one, then two, then four, then eight — I've roasted accounts doing it"* |
| **`p4-03:59-65`** | **3 → 2 → 1** | Biggest first; five contracts of built-in equity make the last one's 4.5 handles of heat *"insignificant"* |
| `summary.html:117,351,367` | **3 → 2 → 1** | *"Pyramid biggest first — never one, then two, then three"* |

The ladders differ because the trades differ; **the rule is identical at all four
sites** and the two anti-patterns (1-2-3 and 1-2-4-8) are compatible statements of
the same error. **p4-03 adds one condition the other three do not state**: *where*
the adds go. *"I'm adding the last one here **at logical precise areas** — it's not
randomness, it's not willy-nilly, it's not flipping a coin, it's not guessing,
there's logic here"* (ep22:956-960), each add sitting on a named structure (the
retrace into the bearish order block, the next fair value gap). The other three
lessons give the *sizing* rule without the *placement* rule. Not a finding — an
input to batch M, where `summary.html` states the sizing rule alone.

#### The forex cross-check — extended to four parts, still no drift

| Lesson | Session | Time stated | Source |
|---|---|---|---|
| p1-03, p1-05 | — | (batch I: agree) | — |
| p2-01 | London open | 2:00am–5:00am NY | ep8:259-273 |
| p3-04, p3-05 | — | (batch I: agree) | — |
| **p4-01:19** | **London open** | **2:00am–5:00am NY** | **ep20:246-256** |
| **p4-02:31-32** | **London open / New York** | **2:00–5:00am / 8:30–11:00** | **ep21:381-390, 708-720** |

**Four parts, six lessons, no drift to the minute.** p4-02 adds the New York
session's own window (8:30–11:00) and the 9:30 equity open as a *third*, distinct
time, and keeps them separate exactly as ICT does (*"don't get confused with the New
York midnight candle's opening price"*, ep21:713-720). **H7**'s worry is now dead
four parts running.

#### Content fidelity (§1) — episodes 23–25: **clean, no findings**

Three lessons, 121 KB of transcript, and nothing fails §1. Every figure checks:
p4-04's 13,150 (ICT self-corrects mid-sentence — *"around that thirteen thousand
six — I'm sorry thirteen thousand one fifty"*, ep23:234-236 — and the lesson takes
the correction) and the 13,437 projection that the market then hit (ep23:246-247,
343-344); p4-06's 4044.5 equilibrium (*"the 40 44 and a half level is equilibrium or
50 of the range"*, ep25:1084-1086), the $5-vs-$50 micro/mini handle values
(ep25:1307-1309), the three-months-then-two-or-three-months = six months
(ep25:1680-1693), and the 27 minutes late (ep25:1466).

**Three more silent de-garbles, all correct — and two of them are H1-shaped
sentence repairs, not mangled figures.** Running total **18 across Section 2**.

1. **ep23:128-140 is self-contradictory as transcribed.** ICT says *"the vocabulary
   I'm using here is **running** the tuesday high, **not sweeping** the tuesday
   high"* and then, in the next breath, defines the term against the same move:
   *"the difference between sweeping would be like what it's done here, that will be
   a sweep, that's a real shallow little run above that red line, that's tuesday's
   high, okay so **it swept that** and we're coming back down."* `p4-04:21` resolves
   it as **swept**, which is the only reading his own two definitions permit — price
   went shallow above the level and came back into the range, which is exactly what
   he then defines *sweeping* as. **Second H1-shaped repair in Section 2 that went
   the right way** (after ep19's *"you don't need to wait for 8 30"*).
2. **ep24:1077-1079** — *"that way you don't have to worry about **how hard do i
   need to know** you don't need to know that"* → `p4-05:49` renders *"how far into
   it does it need to go. You don't need to know that."* Forced by the two sentences
   before it (*"it doesn't have to completely close it … anywhere between here and
   here is good"*). **Third H1-shaped repair.**
3. **ep24:907** — *"notice i said **indoor**"* → **endure** (`p4-05:53` and its quiz
   `e`). Trivial homophone, but the whole callout turns on it.

**And one de-garble the lesson declined to make, by dropping the passage instead** —
see **J12**. ep25 renders Wyckoff as *"white golf"* twice (882, 1709), the same
mis-transcription batch **I** logged at ep16:1293. Where `p3-03` took that repair,
p4-06 omits both passages. That is a coverage decision, not a de-garbling failure,
but it is worth separating the two so the running total stays honest.

#### Coverage gaps — episodes 23–25

**J12 · should-fix · `p4-06`** — **ICT distances his method from Wyckoff twice and
claims authorship, and neither passage reaches the lesson.**

> *"I'm showing you how to look at the marketplace like smart money, **not like
> [Wyckoff]** … all these things that people like to attribute — this is not it.
> **This is mine.** I'm telling you how these markets operate."* (ep25:880-887)
>
> *"you want to be like **the composite man** — this is what the composite man's
> doing, **he's not looking at [Wyckoff] schematics** … they're looking at
> liquidity like this, they're looking at how the market's going to allow them to
> **fleece the uninitiated**."* (ep25:1707-1719)

This is the **attribution family** (**G6**, and batch **H**'s finding that Section 2
does assert ICT's ownership of his concepts). Section 2 names Wyckoff exactly
**once** — `p3-03:92`, inside a list of things the algorithm is *not* following
(*"no harmonics, no supply and demand zones, no Elliott wave, no Wyckoff, no
Gann"*) — so a reader gets the dismissal without ever meeting the distinction ICT
actually draws, and never meets the **composite man** at all, though ICT holds it up
as the thing to become.

**J13 · should-fix · FIXED · `p4-05:50` and `p4-06:64`** — **"this may not be for you" is
dropped from both lessons, and it is the same hedge in both.** p4-05 ends on the
promise (*"you're going to learn how to read price better than you ever imagined"*)
and p4-06 ends on the six-month timeline and *"I am absolutely confident that you
will have found your model."* Both keep the promise and drop the release ICT
attached to it:

> *"it's up to you to go through the charts, see if it fits you. **If it doesn't fit
> you, folks, there's a lot of other ways to trade. There's lots of ways to trade,
> you don't need to trade my way.**"* (ep24:768-773)
>
> *"you will decide at that moment if this is something that fits you. **If it
> doesn't fit you there's no harm in that** … I have people that paid me that said
> *I just can't make this work for me*, and I have other people that are killing it.
> **What's the difference? Personality and capacity.**"* (ep25:1596-1608)

Two lessons, two independent statements, both omitted. This is the **H14 / I10**
shape — keep the claim, drop the limit — and it is the only place in Part 4 where
the same hedge goes missing twice.

**J14 · nit · `p4-04:26`** — the live *"if I'm wrong"* on his own call is dropped:
*"if it can drop down to that blue shaded area it might just — **if I'm wrong** it
might just go down to that little bull's eye and then run higher from there, **I'm
hoping it doesn't do that**"* (ep23:143-147). The lesson states the call cleanly.

**J15 · nit · `p4-04:9`** — the **demo instruction** attached to the live narration
is dropped: *"there's a couple ways to use this information — **you can do a trade
here with your demo account, compliance reasons**"* (ep23:43-46). `p4-04:41` carries
the *"not an invitation"* risk warning, which covers the substance; what is missing
is the specific instruction about how the viewer should engage.

**J16 · nit · `p4-05:12`** — the term **"smooth criminal highs"** is normalised away.
The community post says *"drop a horizontal line across those **smooth criminal
highs** in both index — I'll explain what that is in a moment"* (ep24:158-161); the
lesson renders it as *"mark the relative equal highs on both."* The reading is right
(ICT never defines the phrase separately and treats them as relative equal highs for
the rest of the episode), but an ICT coinage quoted verbatim from his own post is
gone.

**J17 · nit · `p4-05:21`** — the stated target is dropped. *"if it trades back down
into a fair value gap inside that displacement then I can go long and **I'll look
for a run into that 4303**"* (ep24:189-195). The lesson describes the same setup
*"targeting the relative equal highs above"* without the number. Defensible — the
episode covers both the Nasdaq and the e-mini S&P charts and never says which
instrument 4303 belongs to, though the level only fits ES — so this sits alongside
the *"14,500 points"* and *"45 32 the 45 40"* omissions rather than against them.

**J18 · nit · `p4-05`** — **a fourth dated provenance goes missing**, with an
external attribution attached to it: *"that's what I shared, that other guy
**Corbs**' video about — I'm sure he has a strategy, but … he just lost control of
himself and started doing things that made no sense … **I know I've done it a lot in
the 90s**, I know exactly what he was talking about"* (ep24:883-895). The lesson's
loss section carries the lesson and not the decade. With **G6**, **I9**, **I12**,
**I15** that makes five; but see the counter-case at **J5** — `p4-02:61` keeps
*"1992, 1993, 1994"* in full, so Part 4 does not simply replicate Part 3's streak.

**J19 · nit · `p4-06:12`** — *"I'm showing you where it's going to go before it
happens **when it's applicable**. **I'm not promising to do that, I'm not an oracle
for you**"* (ep25:564-568) is dropped, and the lesson opens its backdrop section
with *"called in advance."* Logged as a nit rather than a should-fix because p4-06 is
the batch's strongest hedge-keeper — see the tabulation below.

**J20 · nit · `p4-06:63`** — *"I've done **12 specific trading models** in my private
mentorship"* (ep25:1638-1640) is dropped from the callout that describes that group
as *"so rich with material that students can't settle."* The number is what makes
the observation concrete.

**J21 · nit · `p4-06:9`** — a **cross-reference is available and not taken**. ICT
frames the whole lesson against something he taught earlier in the same series:
*"what is it I'm teaching you? Liquidity. I'm showing you that **market efficiency
paradigm that I taught early in this series**"* (ep25:482-486). The lesson explains
what the model is about without pointing back to the lesson that named the paradigm.

**J22 · nit · `p4-05:29`** — the lesson's strongest point is left one step short.
*"The model proved itself by keeping him out"* would land harder with what ICT
volunteers: *"unfortunately today it didn't give me the setup … **because I was
going to trade it. I was going to enter at the low, run the highs, go short** and
write it down that way too. I was going to do it"* (ep24:1105-1111). He did not
merely fail to find a setup; he had planned the trade.

#### The thin-notes hypothesis — **fourth test, and it fails again**

`ep-24.md` is **95 bytes** — the thinnest note page in Section 2 — and reads, in
full, *"Ranting and Model diagrams"* plus two image references. It fronts a 43.3 KB
transcript and an 11.8 KB lesson whose title promises a **named procedure** (*"the
Two Entry Patterns"*), which batch **C** identified as exactly the shape an invented
mechanism attaches to.

**Nothing is invented.** Both entry patterns are ICT's, stated step by step
(ep24:971-1012 for pattern one, 1056-1090 for pattern two) and closed by him with
*"that's the two entry strategies for this model"* (1092-1093). The filter that
`p4-05:45` calls *"the filter that removes the low-probability trades"* is his
sentence verbatim — *"that's how you filter out these trades that may not be high
probability"* (994-997). Every line of the accountability section traces to
ep24:223-500 and 690-720.

And the **D1/E1 tell is absent** as well as the invented mechanism: grepped for a
dated example or an attribution belonging to another teaching, `ep-24.md` has
neither — it has no prose beyond four words. **So the hypothesis batch C raised and
batch D first falsified now stands falsified four times** (m3-08's one-line page,
ep-14's 137-byte page, and now ep-24's 95-byte page, against batch C's two
blockers). **Page length does not predict invented mechanism.** What predicts it is
the D1/E1 tell — an attribution or a date that does not belong to this teaching —
and that is a property of the page's *content*, not its size. This test can be
retired.

#### The rebalancing cross-check — **compatible, and the extension is ICT's own**

The batch lead asked whether `p4-06`'s *named theory* is compatible with the way
Part 2 already uses the word 25 times. **It is, and the widening is in the source,
not the lesson.**

| | Sense used | Object rebalanced |
|---|---|---|
| p2-04, **p2-05**, p2-06 | price returns into an imbalance and fills it | **a fair value gap** — *"every single time price rebalances an imbalance, the swing created at that moment is an intermediate term high or low"* (`p2-05:24`) |
| **p4-06** | price retraces to a level that undoes a whole prior session's move | **a daily range** — *"it's **rebalancing that entire monday range**, it's going back to the previous day prior to monday, it's old low on friday"* (ep25:926-932) |

The second sense is ICT's phrasing verbatim, and `ep-25.md` states it the same way
(*"if there's no FVG use the PDH/PDL like this and look to rebalance the down/up
move of the previous day"*). So this is **not** a **B12/C8** terminology drift, and
**Section 2 still has no instance of that family** after four parts.

One observation for batch M rather than a finding: `p4-06:21` poses the routine as a
question — *"is there a fair value gap in [the last three days]?"* — answers *"on
this occasion there wasn't"*, and works only the **no-gap** branch. The **with-gap**
branch is never stated, in the lesson or in episode 25. It is taught at length in
Part 2, so the fix is a pointer, not new sourcing — the same shape as the Power of
Three forward reference batch **H** proposed for m2-06.

#### The hedge test, per lesson — episodes 23–25

| Lesson | Dropped | Kept |
|---|---|---|
| p4-04 | 2 (**J14**, **J15**) | 4 — *"I'm not Spiderman … you may take one of the eight and never take the other seven"*, *"I'm not worried about being that accurate"*, *"I don't want you thinking this is an invitation … very very risky, extremely risky"*, *"that's a gambler's setup"* |
| p4-05 | 5 (**J13**a, **J16**, **J17**, **J18**, **J22**) | 4 — *"not always, but sometimes"* on the model preventing bad trades, *"it doesn't mean the model's broke"*, *"not that you'll copy his results"*, *"endure — not be defeated"* |
| **p4-06** | **2** (**J13**b, **J19**) | **6** — *"usually, not always, never guaranteed"*, *"not 100% … if I had it I wouldn't give it to you, it doesn't exist and I don't have it"*, *"expect to lose money if you're going to trade with live money"*, *"that is not a promise of profitability or a win rate"*, *"in Asia, not that often"*, *"that's as far as I'm going to go with it"* |

**p4-06 is Part 4's p3-06** — the longest transcript in the batch, the highest
retention, and it keeps the two most load-bearing hedges (the seasonal *"not
always"* and the *"no secret recipe"*). Batch **I**'s correction holds a second
time: **hedge-dropping is lesson-by-lesson variance, not a Section 2 editorial
policy.** Across all six lessons Part 4 drops **13** and keeps **19** — the best
ratio of any Section 2 part so far, and the fix remains per-lesson.

#### Quiz quality — Part 4

**All 45 questions are traceable.** Every correct option and every `e` resolves to
that episode's transcript or note page. One `e` quotes the **note** rather than the
transcript — `p4-03` Q2's *"that says a lot, that's high probability"*, which is
`ep-22.md`'s wording — and it is a permitted source quoted correctly.

**Option length — leading with F14's column, as the method notes require:**

| | n | **correct not longest** | strict | expected score | median margin | spread > 10 |
|---|---|---|---|---|---|---|
| p4-01 | 7 | **29%** | **71%** | **71%** | 3 | — |
| p4-02 | 8 | 62% | 38% | 44% | 6 | — |
| p4-03 | 9 | 56% | 44% | 44% | 8 | — |
| p4-04 | 6 | 67% | 33% | 33% | **10** | — |
| **p4-05** | 7 | **100%** | **0%** | **7%** | — | — |
| p4-06 | 8 | 50% | 50% | 56% | 4 | — |
| **Part 4** | **45** | **60%** | **40%** | **43%** | **6** | **24%** |
| *p1* | *44* | *66%* | *34%* | *46%* | *3* | *2%* |
| *p2* | *49* | *84%* | *16%* | *29%* | *2* | *0%* |
| *p3* | *47* | *51%* | *49%* | *50%* | *2* | *11%* |

**Answering the standing question directly: neither a clean recovery nor a clean
second-half decline — and the two halves of the measurement disagree.**

- On the **headline** metrics Part 4 *does* recover from Part 3: 60% not-longest
  against 51%, 43% expected against 50%. It sits between Part 1 and Part 3 and well
  behind **Part 2, which remains the peak** (84% / 29%).
- On the **conspicuousness** metrics Part 4 is the **worst in Section 2 by a wide
  margin**: a median margin of **6 characters** where p1–p3 run 2–3, and **24%** of
  questions with a max-min spread over 10 where p2 has **0%** and p3 has 11%. So
  when Part 4's correct option *is* the longest, it is longest by roughly twice the
  usual amount.

That combination is the finding, and it is a new shape: **Part 4's problem is not
how often the answer is conspicuous but how conspicuous it is when it is.**
**p4-04:Q4** is the extreme — *"Above the high of the nearest up-close candle to the
left"* at 57 characters against distractors of 43/38/44, a **13-character margin over
the runner-up** and a **19-character spread**, the largest single tell in the batch.
**p4-02, p4-03 and p4-04** all carry median margins of 6–10, against 2–3 everywhere
else in Section 2.

**J23 · nit · `p4-01`** — **the batch's Section-1-shaped quiz, and the p3-03 /
p1-06 / G16 analogue.** At **71% strict / 71% expected** it is the only Part 4 quiz
above Section 1's whole-section 76%-adjacent band, and its shape is the familiar one:
five of seven correct options are uniquely the longest, three of them by 3-4
characters over the runner-up and one (Q1's *"An energetic move away from the gap and
the level taken out"*, 59 chars against 50/45/48) by 9. As predicted, at 7 questions
it drags the part total less than **I7**'s 11-question p3-03 did — remove p4-01 and
Part 4 goes to **38 questions, 68% not-longest, 38% expected**, which *is* a recovery
toward Part 2. One lesson accounts for the whole difference.

**p4-05 is the best-constructed quiz in the four parts audited so far — but the
batch lead's prediction that it would be the corpus best is wrong, and can be checked
now.** At **0% strict / 7% expected / 100% not-longest** it displaces **p2-03** (11%),
but the corpus record is **`p6-07` at 3.6%** (7 questions, 0% strict, 100%
not-longest), which sits in Part 6 and has not been audited. Current corpus ranking:
**p6-07 3.6% · p4-05 7.1% · p2-03 11.1% · p6-01 14.3% · p1-01 15.0%.** Batch **G**'s
*"p1-01 at 15% is the best-constructed quiz in the corpus"* is therefore superseded
twice over; batch **L** should expect to find the technique at its most developed.

**What p4-05 does, since F14 asked for the mechanism and Part 2 supplied three.**
A fourth technique, and the cleanest yet: **the correct option is deliberately the
plainest sentence in the set, and the distractors are the ones carrying the
machinery.** Q1's answer is *"A short-term low taken out with displacement"* (44)
against *"Any close back below the relative equal highs"* (45); Q6's is *"Losses come,
but must not defeat you"* (36) — the shortest of its four — against *"Losses can be
avoided with enough back testing"* (46). Every one of the seven distractor sets is
built from *plausible-sounding trading vocabulary the lesson never uses*, which makes
them long **and** wrong, while the answer stays short **and** right. Length is
neutralised as a signal because the *content* rule generating the options is
length-blind. That is a stronger mechanism than "trim the correct option", because it
does not require the author to measure anything.

#### Quiz-count proportionality (D14/E18/I11) — **Part 4 passes, and plainly so**

Batch **I**'s two-denominator table:

| Lesson | Transcript | Qs | **KB per question** | Lesson | **Qs per KB of lesson** |
|---|---|---|---|---|---|
| p4-01 | 18.9 KB | 7 | **2.7** | 8.3 KB | 0.84 |
| p4-02 | 40.0 KB | 8 | 5.0 | 12.7 KB | 0.63 |
| p4-03 | 47.1 KB | 9 | 5.2 | 17.6 KB | 0.51 |
| p4-04 | 16.5 KB | 6 | **2.7** | 7.7 KB | 0.78 |
| p4-05 | 42.3 KB | 7 | 6.1 | 11.6 KB | 0.61 |
| p4-06 | **59.4 KB** | 8 | **7.4** | 14.5 KB | 0.55 |
| **Part 4** | **224.2 KB** | **45** | **5.0** | **72.4 KB** | **0.62** |

**No failure at either denominator.** The worst case, p4-06 at 7.4 KB/Q, is well
inside the band that batch I called acceptable — its two failures were **p3-05 at
10.8** and **p3-06 at 19.1**. Part 4's ratio of extremes is **2.7 : 1** (p4-06 against
p4-01/p4-04); Part 3's was **5.0 : 1**. On the second denominator the spread is
0.51–0.84, the tightest of any part measured. **C18**'s floor of 4 is not
approached — the minimum is 6. Say it plainly: **Part 4 is the first Section 2 part
where question counts track the material at both denominators**, and the whole of
Section 1's Months 3–4 defect is absent here.

#### Consistency

Clean, with one isolated deviation.

- ids `p4-01`…`p4-06`, **five characters each** as the engine requires; `data-month="p4"` on all six; every `data-slug` prefix matches its lesson id; all three slots (`.fig-slot`, `.quiz`, `.lesson-footer`) present in all six.
- Part 4 carries **no `(Lx)` cross-references at all**, so nothing can be dead.
- **J24 · nit · `p4-05:37,47`** — **the two `.src` spans in Part 4 are the only two
  in the corpus that are not lesson pointers.** `CLAUDE.md` §3 documents `.src` as
  *"an optional `<span class="src">(L4)</span>` **lesson pointer**"*, and of ~70
  uses across `content/` every other one is a reference (`(L2)`, `(P3 L3)`,
  `(L2, L5, L6, P3 L5–L6)`). p4-05 uses it twice for a **directional label** —
  `(bearish)` and `(bearish; reverse it for longs)`. Renders fine and reads fine;
  it is the **F11**(b) family — a class used for something other than its documented
  job — and it is the cheapest fix in the batch.
- **`intermediate term` is 0 hyphenated / 4 unhyphenated in Part 4** — a small
  correction to batch **I**'s table, which recorded 3. The fourth is
  `p4-03:49`'s sentence-initial *"Intermediate term high"*; all four sit in p4-03
  (2 in `lesson.html`, 2 in `quiz.js`). Corpus totals become **7 hyphenated / 29
  unhyphenated**, and **I**'s live observation stands unchanged: the hyphenated form
  survives only in Section 1, Part 1 and the section-level pages, so
  `summary.html` and `exam.js` still use a spelling no lesson from p2 onward uses.
- **Quiz-file formatting**: all six Part 4 files use the compact `{ q:` form, so
  **I17**'s measurement trap does not bite. The regex reconciles to 45.

#### Noted, not a finding (episodes 23–25)

- **`p4-04:32`'s "discount" is the lesson's label, not ICT's word.** He says *"where's
  50 of that — below 50 is where that fair value gap is, that's in turquoise, so
  that's the target"* (ep23:263-275) without naming it. Labelling below-equilibrium
  as a discount is exactly the definition ICT gives in the previous episode
  (ep22:1300-1302, carried at `p4-03:80`), so it is an in-corpus inference rather
  than outside knowledge. Logged only because it is the batch's one place where the
  lesson supplies a term the episode did not.
- **`p4-04:35`'s reconstruction of the eight setups is sound.** ICT counts them aloud
  (*"one, two, three, four, five, six, seven, eight — there's eight trades in this
  whole entire thing"*, ep23:278-287) and enumerates them later (415-463). The
  lesson's list matches item for item, including the eighth *"after the recording
  stopped"* (ep23:460-463).
- **Chris Laurie, third source, third omission.** ep25:86-92 has ICT invoking him by
  name a third time — *"Mr Chris Laurie can come here and tell me if I'm teaching or
  trading anything like him, because I promise you **none of this is found in his
  stuff**, period"*. With **B4** (m2-06, ICT crediting him) and **H20** (p2-06,
  distinguishing his method) that is **three sources, three directions, and zero
  appearances in `content/`** — grep confirms the name is absent corpus-wide.
  Strengthens batch **H**'s third batch-N item from a pair to a trio.
- **`p4-06`'s Baby Pips 2010 date is kept** (`p4-06:20`, ep25:584-588) — worth noting
  against **G6**, which is precisely the loss of *"first mentioned it in 2010 on Baby
  Pips"* from p1-03. The date the corpus drops in Part 1 it keeps in Part 4, attached
  to a different concept. A batch-N fix for G6 can therefore cite p4-06 as the
  in-corpus template as well as p1-02.

#### Batch J summary

| | |
|---|---|
| Lessons audited | 6 (episodes 20–25, **224 KB of transcript**) |
| Findings | **24** — 0 blockers, **6** should-fix, **18** nits |
| Fidelity findings | **2** (**J1**, **J2**) |
| Quiz questions traceable | **45 of 45** |
| Fixed in flight | none |

**The headline is that Part 4 is the strongest part in Section 2 on everything
except one thing.** Two of the four review dimensions come back better than any
previous batch: **quiz-count proportionality passes at both denominators for the
first time in Section 2** (no lesson worse than 7.4 KB/question against Part 3's
19.1), and **hedge retention is the best ratio yet** (19 kept, 13 dropped, and
p4-06 keeps six of eight). Consistency is clean but for a two-site `.src` misuse.
The weak dimension is **coverage**, as in every Section 2 batch, but the drop rate
is lower and the individual losses are smaller — 18 of 24 findings are nits, the
highest nit share of any batch in the audit.

**The exception is option length, and it fails in a way no previous part did.**
Part 4 recovers on the headline metrics (60% not-longest, 43% expected — better than
Parts 1 and 3, well behind Part 2) but is the **worst part in Section 2 on median
margin (6 characters against 2–3) and on spread over 10 (24% against 0–11%)**. The
problem is severity, not frequency: when the answer is the longest option here, it is
longest by about twice the usual amount. `p4-04:Q4` is the extreme at a 13-character
margin. And the distribution is bimodal — `p4-01` at 71%/71% sits in the same part as
`p4-05` at 0%/7%, and removing p4-01 alone moves the part to 68%/38%.

**Do the Part 1–3 conclusions replicate? All four, and one of them for the first time
with a mechanism attached:**

1. **One episode per lesson prevents migration defects — replicates, fourth time.**
   Twenty-five Section 2 lessons audited, no instance of material crossing between
   lessons or arriving from outside the teaching (**A2**, **C1**, **C2**, **D1**,
   **E1**'s failure mode). **J1** is the closest thing and it is not migration — two
   figures from the *same* episode merged behind one subject.
2. **The transcript beats the notes — replicates** (`ep-21.md`'s *"DXY and ES are
   correlated"* against the lesson's correct *inverted*). **But the H5 watch-list
   item is now at three instances and has produced its first consequence** — **J2**,
   where `ep-21.md` states the two-opening-price test without the *"with the benefit
   of hindsight"* qualifier the transcript attaches, and the lesson follows the note.
   Batch I asked for a third instance; this is it, and unlike **H5** and p3-02's
   composite quotation it changes what a reader believes they can do in real time.
   **Three instances is now a pattern, and it should go to batch N as one.**
3. **The de-garbling is sound — replicates, six more times, all correct.** *"enemy
   term high"* → intermediate term high, *"pay a shorter block"* / *"bear shoulder
   block"* / *"fair shoulder block"* → bearish order block, *"indoor"* → endure, and
   **two more H1-shaped sentence repairs that went the right way** (ep23's
   run/sweep self-contradiction, ep24's *"how hard do i need to know"*).
   **Eighteen silent corrections across Parts 1–4, all correct**; **H1** is still the
   only repair that went the wrong way, and its tell — a reversed verb rather than a
   mangled figure — is the same tell ep23:128 carried and p4-04 read correctly.
4. **Hedges are dropped lesson-by-lesson, not by policy — replicates, and p4-06 is
   the second template after p3-06.** The batch's two heaviest transcripts sit at
   opposite ends: p4-05 (42 KB) drops five, p4-06 (59 KB) drops two and keeps six.

**What contradicts an earlier reading — three things:**

- **The C9 lead does not pay out, and it could not have.** The batch's headline lead
  was that `p4-03` might supply the SMT cell **C9** found missing from `m3-05`. It
  does not: p4-03's SMT is **NQ against ES** (positively correlated) where m3-05's is
  **DXY against foreign currency** (inverse), and ICT teaches only the bearish
  direction in episode 22, so there is no mirror in the source to drop. **C9 stays a
  rewrite of m3-05, not a cross-reference**, and p4-03's one-sidedness is *not* a new
  **A8/C9** finding because it is the source's.
- **The prediction that `p4-05` would be the corpus's best-constructed quiz is
  wrong.** It displaces **p2-03** but `p6-07` at **3.6%** is ahead of it — measurable
  now, auditable in batch L. Batch **G**'s *"p1-01 is the best in the corpus"* is
  superseded twice over.
- **The thin-notes hypothesis is falsified a fourth time and should be retired.**
  `ep-24.md` is 95 bytes fronting a 43 KB transcript and a lesson titled after a
  named procedure — batch C's worst-case profile — and `p4-05` invents nothing. Page
  length does not predict invented mechanism; the **D1/E1** tell (an attribution or
  date belonging to another teaching) does, and it is a property of a page's content,
  not its size.

**Two verdicts closed, so batches K–L need not revisit them:**

- **Pyramiding — four sites, no drift.** p2-06 (3→2→1), p3-03 (5→3→2), p4-03
  (3→2→1) and `summary.html` all teach *biggest position first*; the ladders differ
  because the trades differ, and the two anti-patterns (1-2-3, 1-2-4-8) are the same
  error stated twice. **p4-03 adds a placement rule the other three lack** — each add
  must sit on a named structure, *"not randomness, not willy-nilly, not flipping a
  coin"* — which is an input to batch M, since the summary carries the sizing rule
  alone.
- **Rebalancing — no terminology drift.** p2 rebalances *a gap*, p4-06 rebalances *a
  daily range*, and the widening is ICT's own wording in episode 25, corroborated by
  `ep-25.md`. **Section 2 still has no B12/C8 instance after four parts.**

**Four items carried to batch N:**

1. **The H5 family, now three instances and consequential** — a lesson preferring
   the note's phrasing where the transcript qualifies it (**H5**, p3-02, **J2**).
2. **`intermediate term` hyphenation** — corpus totals corrected to **7 / 29**;
   the review pages remain the natural place to normalise from.
3. **Chris Laurie — three sources, three omissions, zero appearances.**
4. **The `.src` misuse at `p4-05:37,47`** (**J24**) — two sites, cosmetic, and the
   only non-pointer uses of the class in the corpus.

**Input to batches K–L.** Watch for: (a) whether the **margin/spread** severity that
distinguishes Part 4 continues, since it is invisible to the strict-longest metric
that batches A–I led with; (b) whether **any** Section 2 lesson gives the **bullish**
SMT reading — five of the nine SMT lessons are now read (m2-06, m3-05, m3-06, p4-03,
plus Section 1's) and none does, with p5-03, p6-01, p6-02, p6-05 and p6-07 left;
(c) `p6-07`'s quiz, which the corpus measurement says is the best-constructed in the
audit; (d) whether **Wyckoff and the composite man** (**J12**) recur — Section 2
names Wyckoff once and never in the sense ICT actually uses it.

### Batch K — Section 2, Part 5 (p5-01 … p5-07 / episodes 26–33, no 28)

Sources: `transcripts/2022 Mentorship/…Episode {26,27,29,30,31,32,33}.txt`
(**106 KB — the lightest batch in the audit**) and
`notes/2022-mentorship/ep-{27,29,30,31,32,33}.md` (**1.9 KB, six pages for seven
lessons**). **There is no `ep-26.md`** — plan §2 records it, and `p5-01` is the
only lesson in the corpus built from a single source.

**The episode-28 offset holds everywhere it is checked.** `p5-03` is episode
**29**; `docs/s2-2022-mentorship-videos.md` rows 26→`p5-01`, 27→`p5-02`,
28→*(skipped, no lesson id)*, 29→`p5-03` … 33→`p5-07`, and all seven `video.txt`
files match their row byte-for-byte. No lesson quotes, cites or numbers an
episode at all, so there is nothing to mis-number. **Zero migration defects for
the fifth consecutive part** — see the summary.

**Charts reconcile on all three counts**: notes image refs → `raw/` → `images/`
are 0 / 2 / 2 / 2 / 1 / 1 / 2 = **10** for p5-01…p5-07. No anomalies.

#### Content fidelity (§1) — episodes 26–29

**p5-01 (ep 26) and p5-02 (ep 27): clean, no findings.** Every substantive claim
in both lessons traces to its transcript, including the numbers — p5-01's 4000
fair value gap, 4051.25 best case, 4036 buy side and the four-then-two contract
build (ep26:9, 48-49, 206, 96-100, 315-321); p5-02's 12,547 / 12,553, 36
contracts, the 12,430 limit that filled at market, and $100,000 → $354,000 since
the 6th (ep27:20-23, 269, 329-346, 606-608).

The three fidelity findings in this instalment are all in **p5-03**, and they are
all in one place: the entry table.

**K1 · should-fix · FIXED · `p5-03/lesson.html:26-31` — the entry table shows three fills
where episode 29 shows two.**

The `kv` lists *First fill* (3994.50), *Second fill* (3996.25, seven ticks of
heat) and *The add* ("a further limit order filled after the highs were taken out
and a small fair value gap formed"). In the source the last two are **the same
event**. ICT describes exactly one add:

> "when the market starts to Rally I have one more indication that the market
> structure has shifted again bullish with these highs taken out here / and then
> they had a small little Fair [value] [g]ap out there and then **you watch me add
> more the limit order came in filled it** I only had one and a half or no I'm
> sorry **one and three quarters handles** okay **seven ticks** … of Heat against
> me" — ep29:226-239

and earlier states the position had two legs — *"me getting in putting a stop
managing the position and **adding the second position** in here"* (ep29:196-198).
Only two prices are ever shown: 3994.50 and 3996.25 (ep29:262-272). So the
seven-tick 3996.25 fill **is** the limit-order add, and the lesson prints it
twice. A reader is told a two-leg position was built in three.

This is the **J1 shape** — two descriptions of one event from the same episode
placed behind separate subjects — not migration; nothing arrived from outside the
teaching.

**K2 · should-fix · FIXED · `p5-03/lesson.html:32` — the close-proximity entry is attached
to the wrong fill, which inverts the point of the lesson.**

The callout reads *"What the second entry actually was — That fill was **not
inside the fair value gap**, it was in close proximity to it."* In the source that
sentence is about the **first** fill:

> "**this one 3994.50** was right in here and the low on this candle 93 in a
> quarter … entering on this candle here and the next candle had a little bit of
> retracement so very very very tight placement and **this was not entering in the
> fair value Gap it was in close proximity to it**" — ep29:272-285

And it has to be the first, because the first is the fumbled one. The whole
close-proximity discussion is introduced *because* the Camtasia restart cost him
the ideal fill — *"I was trying to get the Camtasia Studio to open up … and the
whole time this candle was doing its business and I wanted to see it return into
the [fair value] gap once more and **I got in on this candle here**"*
(ep29:164-174). Moving the label to the second fill severs the rule from the
mistake that motivates it. **A2 / D2 / E4 family** (a verbatim characterisation
attached to the wrong object) — the fourth instance in the corpus and the first
in Section 2.

**K3 · should-fix · FIXED · `p5-03/lesson.html:27` — "less than one handle of heat"
contradicts the two numbers printed beside it.**

The row reads *"**3994.50** — the candle's low was 3993.25, **less than one handle
of heat**."* 3994.50 − 3993.25 = **1.25 handles**. The source contains both
readings, in one self-correcting sentence:

> "**one and a quarter** no less than one yeah **one less than one handle of
> heat**" — ep29:276-277

ICT states the arithmetically correct figure first and then talks himself out of
it; the lesson followed the second half. It is therefore *sourced* — which is why
this is not a blocker — but it is printed next to the very numbers that refute it,
and one row below a second fill where the same lesson followed ICT's
self-correction **correctly** ("one and a half or no I'm sorry one and three
quarters", ep29:233-235 → the lesson's "seven ticks (one and three quarters
handles)", which is right).

**This is the second H1-shaped repair in the corpus and the first since batch H**,
and it sharpens H1's tell. H1's signal was a reversed verb; this one's is a
**self-correction** — a sentence where the source says a thing and then unsays it.
The same lesson met that pattern twice and resolved it right once and wrong once,
so the discriminator is not the author's care but whether the arithmetic was
checked.

#### Coverage gaps — episodes 26–29

**K4 · should-fix · FIXED · `p5-02` — "I'm the author of this algorithm … you have to
understand my language first" is dropped. Third site in the H14 family.**

> "the idea of me seeing it before it happens that's proof of concept and it's
> proof of understanding … **I'm the author of this algorithm so I can operate in
> it very efficiently. You as a student of mine you have to understand my language
> first** and then you go into the charts and you study with that language"
> — ep27:421-434

p5-02 keeps the proof-of-concept claim (line 57) and keeps the strongest
end-of-episode hedge verbatim (*"just because I'm doing it with a demo account
doesn't mean that you're going to be able to go out there and do it too"*), so
this is not the full **H14** failure — but the specific asymmetry ICT states,
that his fluency is authorship and the reader's is second-hand, is the same clause
batch H found missing from p2-05 and p2-06, and it goes missing again. It is one
sentence and the lesson already has the paragraph to hang it on.

**K5 · nit · `p5-01` — the buy side's provenance is dropped.** ICT names *why*
the pool above the short-term high exists: *"noting the buy side liquidity will
take in / clear / profitable shorts"* (ep26:18-21). The lesson's `kv` (line 16)
gives the level and what is done with it and not the reason it is there. The
source line is partly garbled, which is why this is a nit rather than a
should-fix — but the sense (buy stops resting above are the protective orders of
profitable shorts) is ICT's standard framing and survives the garbling.

**K6 · nit · `p5-01` — the softener on the boast is dropped.** The lesson's
*"The standard being set"* callout (line 40) reproduces *"this is me just making
sure you understand that I see this before it happens"* and *"not speaking in
waffles … nothing ambiguous is being hinted at"* (ep26:184-192) at full strength.
Between those two sentences ICT says *"so I'm just being a little facetious here
— you don't see that type of stuff called before it happens that precise"*
(ep26:170-174). Keeping the claim and dropping the qualification is the **H2 /
H14 / H18 / H19** shape; it is tonal rather than mechanical here, hence a nit.

**K7 · nit · `p5-02` — the punch-through is dropped.** The hourly read ends
*"if it's going to go up to this area here my thought process is that it's likely
to probably just **punch through and take the buy stops resting above**"*
(ep27:101-105). The lesson's hourly row (line 15) carries the swept low, the
rebalanced area and the pool, but not how ICT expects the draw to be satisfied.

**K8 · nit · `p5-03` — a second reason for choosing the S&P is dropped.** Beyond
the SMT read, ICT says the NASDAQ was *"a little bit sloppier in here versus the
s p a little bit more structured here"* (ep29:175-180). The lesson attributes the
instrument choice to the divergence alone (line 21). The extra criterion —
readable structure, not just relative strength — is a second filter a reader could
apply.

**K9 · nit · `p5-03` — "no fair value gap revisited" is dropped.** The 9:30
decline is disqualified in the lesson on the 50%-of-the-displacement-leg test
alone (line 15). ICT gives two reasons: *"it does not give me a pattern anyway
notice that **there's no fair value Gap Revisited**"* (ep29:70-72) and then the
50% test. The first is the simpler screen.

#### The bullish SMT reading — **`p5-03` supplies it, and it does not close C9**

This was the batch's headline lead, and the answer is in two halves.

**It closes the gap batch J logged.** After five of the nine SMT lessons, batch J
recorded that *"a reader has been given no rule for reading SMT in the bullish
direction anywhere."* `p5-03` gives one, worked end to end: two correlated indices
both drop to relative equal lows and retrace, **NASDAQ makes a lower low than its
10 o'clock low and the S&P refuses to** (ep29:100-110), and with a bullish bias
already in place the market that refused is the one to buy — *"every execution
that day was in the S&P; there were no NASDAQ trades at all"* (ep29:293-300),
*"even though I originally went in looking for a trade in NASDAQ"* (ep29:17-19).
That is a complete bullish read, and it is the only one in Section 2 so far.

**It does not close C9**, for the reason batch J already established and one more:

1. **Wrong pair.** `m3-05`'s SMT is **DXY against a foreign currency** — an
   *inverse* correlation, where the divergence rule reads differently. `p5-03`'s
   is **NQ against ES**, positively correlated, exactly as `p4-03`'s was. C9 stays
   a rewrite of m3-05, not a cross-reference to a Section 2 lesson.
2. **ICT frames it as one trade, not a principle.** He defines the term
   (*"this is what I dub SMT, smart money technique or smart money tool"*,
   ep29:110-114) and applies it to that afternoon. He never generalises it, and he
   never uses the word *stronger*.

That last point is worth logging on its own, because the lesson does generalise:

**K10 · nit · `p5-03/lesson.html:21` — the generalising clause is the note's word,
not the transcript's.** *"With a bullish bias already in place, the market that
**resisted going lower is the stronger one**"* reads as a rule. The transcript
supports the observation (*"the s p was saying I don't want to go that low so it
was resisting going lower"*, ep29:100-102) and the action (all trades in ES), but
the *stronger* verdict comes from the note page — *"ICT longed ES because it was
**stronger** using the SMT divergence"* (`ep-29.md`). Both are permitted sources,
so nothing is unsourced; but this is the note supplying the generalisation, which
is the same mechanism as batch J's `p4-03` high-probability verdict, and it is
worth naming while the **H5** family is being counted.

#### `p5-01`, the one-source lesson — **it did not drift**

Episode 26 has no note page, so `p5-01` is the only lesson in either section
written from a transcript alone (plan §2). The interesting question was whether
the missing scaffolding shows. **It does not — the opposite.** p5-01 has zero
fidelity findings, quotes every price in the episode correctly (4000, 4051.25,
4036, ep26:9/48/206), reproduces both of ICT's exact stop-management sentences,
carries all four of his in-trade hedges (see below), and contains two silent
de-garbles that are both right. Measured against the batch, it is the *tightest*
transcript-tracking lesson of the three read here — the two lessons that do have
findings, p5-02 (K4) and p5-03 (K1-K3, K10), both have note pages.

The honest reading is not "no notes is better". It is that the note pages in this
part are 100-600 bytes of bullet points and were never doing structural work; the
lesson is carried by the transcript either way. That is consistent with batch J
retiring the thin-notes hypothesis: **page length predicts nothing, and here
page *existence* predicts nothing either.** It is a one-off and will not recur.

#### The pyramiding cross-check — `p5-01` agrees, and adds nothing

Batch J closed this at four sites. `p5-01` is the fifth and the thinnest: the word
appears once, in the lesson's `desc` (line 5, *"pyramiding into six contracts"*),
against ICT's *"the bulk of my position I'm going to try to pyramid and build
this, this is a little bit bigger than just the four contracts"* (ep26:60-64). The
build is **4 then 2** (ep26:96-100, 315-321) — descending, consistent with
p2-06's 3→2→1 and p4-03's 3→2→1. No ladder is stated in the lesson and no rule is
added. **Verdict unchanged; do not reopen.**

#### Noted, not a finding (episodes 26–29)

- **Two more silent de-garbles in `p5-01`, both correct.** ep26:168-169's *"if
  I'm bullish I want to see that **i'm embarrassing** I see it I don't like it"*
  becomes *"if I'm bearish I see it, I don't like it"* — the only reading the
  sentence permits. And ep26:305-307's *"over five hypothetical thousand
  dollars"* becomes *"over five thousand hypothetical dollars"*. That is **20
  across Parts 1–5**, and **K3** is the first since **H1** to go the other way.
- **`p5-02` names no broker.** ICT says *"a discount broker something like AMP
  futures — **I'm not repping AMP futures by the way** — but they have really low
  margins"* (ep27:270-275). The lesson keeps *"a discount broker with low
  margins"* and drops the name, which also disposes of the disclaimer. Correct
  handling; noted because it looks like a dropped hedge and is not one.
- **`p5-02`'s "Friday the 13th" is the source's own words** (ep27:112-113,
  including the *"you scared?"* joke). Whether that date is right is a calendar
  question, and §1 excludes outside data from settling it. Flagged, not filled.
- **`p5-03`'s Twitter return and the five-million-dollar MT4 claim are dropped**
  (ep29:348-354, 382-384). Both are *"I could have easily taken this over to a
  million dollars already"*-shaped, and dropping them is under-claiming, which §1
  prefers. Noted so a fix pass does not restore them.
- **`p5-01` has no `.fig-slot` and no annotating comment** — see *Consistency*.

#### Content fidelity (§1) — episodes 30–31: **clean, no findings**

Both lessons are exact where it is cheapest to be wrong. `p5-04` gets the
one-tick Judas right in both directions — morning high **12,535.75**, afternoon
run **12,535.50**, *"one quarter of a point or one tick short"* (ep30:18-23) — and
carries the fill (12,417.75, *"just below this 20 level"*, ep30:146-148), the
3 o'clock spool (ep30:135-139), the 12,624 next objective (ep30:257-258) and the
*"a little over five thousand dollars"* result (ep30:296-298). `p5-05` gets the
four contracts at **4007.75** (ep31:168-169), the 3910 close (ep31:266) and every
one of the five verbatim quotations in it.

**Two more silent de-garbles in `p5-04`, both correct**, and both of a kind not
seen before in this audit — a mangled *timeframe* and a mangled *word*:
ep30:235's *"we'll look at the 16 inch term"* becomes **Hourly** (the only reading
that fits, since the next thing shown is the 60-minute and then the daily), and
ep30:304's *"if you're publish and it consolidates in lunch"* becomes **"if you're
bullish"**. That takes the running total to **22 across Parts 1–5**.

#### Quiz quality — episode 31

**K11 · should-fix · FIXED · `p5-05/quiz.js:4-5` — Q3 and Q4 are the same question, with
the same answer, from the same source line.**

```js
Q3  "You missed the setup at the open. What then?"
    → "Use a fair value gap in the move"
Q4  "What does he say to students who only watch for the opening setup?"
    → "Use a gap to get involved with the later move"
```

Both trace to the identical passage — *"some of you are fixated on only looking
for the setup at the opening. Well what happens if you don't get a trade at the
opening, can't you use a fair [value gap]? You have to get involved with the move
if it's going to go down to something like this"* (ep31:154-161) — and the two
explanations paraphrase each other almost word for word. An eight-question quiz
is really seven, and a reader who answers either one has been handed the other.

**This is a new defect shape for the audit.** Nine batches have found
under-testing (**C18**, **D14**, **E18**, **I11**), give-away option lengths
(**A10** → **F14**) and one incorrect answer (**E1**), but no duplicate question.
It is also the cheapest finding in the batch to fix: the episode has at least two
untested claims sitting idle — the dollar CAD *"snooze fest"* long off the 8:30
news (ep31:62-67) and the *"I never promised to do that … it does not work for
lazy people"* refusal to hand-hold (ep31:139-147) — either of which would replace
the duplicate without new sourcing.

#### Coverage — episodes 30–31

Both lessons are near-complete; these are all nits, and there is no should-fix
omission in either.

**K12 · nit · `p5-04` — the second "facetious" softener goes the same way as
K6's.** ICT interrupts his own live commentary about the squeeze — *"I was being
facetious when I was recording, because as I was watching I was watching it run
out, then it broke down"* (ep30:89-92). The lesson keeps the commentary
(line 25, *"New shorts are about to be squeezed"*) and not the aside. Same shape
as **K6** in p5-01, two lessons apart, which is worth noting because it is the
only omission that repeats within this batch.

**K13 · nit · `p5-04` — the daily chart restates the no-setup point and the
lesson's daily row drops it.** *"the market did in fact create a big run lower and
then create another run lower here **but that wasn't my setup** — I was drawing
everyone's attention up to that 12,553 level, and this was the run that I liked
and this is the one that was the hunt"* (ep30:283-291). The lesson's `kv` (line
50) keeps only the second half. The first half is ICT making the batch's most
important point a second time, on a second timeframe, which is exactly the kind of
repetition that signals he meant it.

**K14 · nit · `p5-05` — the concession to the forex purists is dropped.** *"if
you're a hardliner, if you're a purist and you don't want to see these types of
moves in this type of market, **I understand** — but learn from it because it
works the same way in forex"* (ep31:54-59). The lesson (line 11) keeps the
instruction and drops the concession, which is a small instance of the **H2 /
H14** shape.

#### G12(a) / H7 — **closed by `p5-05`, and this is the third statement of it**

Batch **G** logged (**G12**a) that ICT's reason for teaching index futures at all
— *"forex has been rather funky … we have transitioned to index futures"*
(ep5:1037-1054) — reaches no lesson. Batch **H** found it stated a second time
(ep8:278-282) and dropped a second time (**H7**), and called it conspicuous.

**Episode 31 states it a third time and `p5-05` carries it in full** (line 11):
the complaint is acknowledged, *"even my paid membership group have seen very
little in terms of forex"*, the reason is *"I'm pushing this asset class because
this is where the volatility is — price is price, it doesn't make a difference"*,
the prediction that index futures will go quiet when forex wakes up *"within the
next 12 months or so"*, and the instruction *"learn from it because it works the
same way in forex"* (ep31:33-59).

So this family resolves the way **G7** did — a Part 1 gap closed much later by a
lesson that keeps what the earlier ones dropped. **G12**(a) and **H7** stand as
logged, and neither needs new sourcing to fix: **the paragraph a reader needs
already exists in the corpus, in `p5-05`**, and the fix in p1-05 and p2-01 is a
pointer rather than a rewrite. This is the batch's most useful coverage result.

#### The order block cross-check — no contradiction

Nineteen order-block mentions across four p5 lessons, and none of them touches the
four-way definition batch **I** verified (p2-02, p2-05, p2-06, p3-05):

| Lesson | What it says | Consistent? |
|---|---|---|
| `p5-01` | bullish OB = **the higher of two down-close candles**, level taken from its **opening price** (ep26:198-213) | yes — the p2-02 definition, plus a which-candle rule |
| `p5-02` | *"down closed candles in here — order block, fair value gap"* (ep27:255-261) | yes |
| `p5-04` | uses it as a level only; no definition (ep30:117-118, 130-131) | n/a |
| `p5-05` | bearish OB = **the up-close candle right before the move lower**, drawn out in time (ep31:182-187) | yes — the exact mirror |

**G10 is not reopened** (batch I closed it, batch J confirmed it); this is recorded
only because p5-01 and p5-05 happen to state the bullish and bearish forms in the
same part, and they mirror each other cleanly.

#### Content fidelity (§1) — episodes 32–33: **clean, no findings**

`p5-06` and `p5-07` are the two densest lessons in the part and neither has a
fidelity finding. Every price checks out: p5-06's 3855 old low against the 3856
stop *"one handle short"* (ep32:92-98), 3933.25 (ep32:72-73), the short at
**3940.75** and the four off at **3908.75** (ep32:246-249), the $6,000 → $10,000
live account (ep32:361-364); p5-07's 3915.25, 3872.25, 3855, and the son's
account arithmetic.

**Four more silent de-garbles, all correct, and one of them is the best-verified
in the audit.** ep33:50-52 renders the day's gain as *"he added another
**$33,700**"* against a previous balance of $9,751.66 and a closing balance of
$13,451.66. The lesson prints **$3,700** — which the transcript itself confirms
sixty lines later (*"push his account up $3,700 today"*, ep33:163) **and** which
is the only figure the two balances permit. Also: ep33:121's *"this **onetick**
Pony"* → **one-trick pony**; ep33:330's *"that level **395 and a quarter**"* →
**3915.25** (the level named six other times in the episode); and ep32:511's
*"gets **raped** across the coals"* → **raked**, which episode 30 spells correctly
(ep30:58) and which p5-04 already uses. **Twenty-six across Parts 1–5.**

**And one figure correctly declined.** ep33:56 puts the son's return alongside
*"number one spot on the **robins** leaderboard in less than a month"* — a
garbled brand name with no bracketing sentence to fix it. The lesson generalises
to *"the accounts topping retail leaderboards"* (line 50) rather than guessing at
the platform. That is the **third** instance of the posture batch H praised in
p2-05 (ep12's *"14,500 points"*) and batch I in p3-04 (ep16's *"the 45 32 the 45
40 level"*) — and the first where what was declined is a **name** rather than a
number.

#### Coverage — episodes 32–33

**K15 · nit · `p5-06` — the "think like the other traders" instruction is
dropped.** ICT states his method for the day explicitly: *"I purposely took
everybody into the marketplace through their own chart and **told them to think
about what was going on in their own mind, what other traders would be thinking**
so that way you could really capture what it feels like to be in there looking for
your own setups and try to think critically about it"* (ep32:281-289). The lesson
carries the day's mechanics and not the exercise. The reader is not left without
it — `p5-04` carries the same technique applied to one trader (*"The internal
dialogue exercise"*, line 27) — but ep32 is where it is stated as a general
instruction.

**K16 · nit · `p5-07` — two small hedges go, in the batch's best hedge-keeping
lesson.** ICT closes on *"that's kind of like what I was helping you with
yesterday and hopefully this morning **if I was successful — at least I was hoping
I was successful**"* (ep33:281-284), and introduces the trade as *"that was **in my
opinion** the better trade"* (ep33:111-112). The lesson keeps the trade's status
(line 45, *"the day's better trade"*) and drops the attribution to opinion. Both
are small; they are logged because p5-07 keeps six other hedges verbatim, so these
two are the exceptions rather than the pattern.

#### The rebalancing cross-check — no drift, and no new sense

Seven uses in Part 5, five in quizzes and two in lessons, and **every one is the
gap sense**: `p5-01`'s *"the rebalanced 8:30 imbalance"* (line 22, ep26:230-234)
and `p5-02`'s *"that area is already rebalanced"* (line 15, ep27:95-98). Neither
touches p4-06's *daily-range* sense, so there is nothing to reconcile. **Section 2
still has no B12 / C8 terminology instance after five parts.**

#### Quiz quality — Part 5

**All 57 questions are traceable**, and none of the three p5-03 fidelity findings
reaches its quiz — unlike **E1**, whose incorrect definition was tested by the
lesson's own question, `p5-03`'s quiz never touches the entry table (**K1**,
**K2**, **K3** are lesson-only). That is worth saying, because it means those
three are a one-file fix.

**Option length, measured the D15 / E19 / F14 way and led by F14's column:**

| Lesson | **not-longest** | strict | expected | median margin | spread > 10 |
|---|---|---|---|---|---|
| `p5-01` | **75%** | 25% | 38% | 3.5 | 0% |
| `p5-02` | 44% | 56% | 61% | 2 | 11% |
| `p5-03` | 43% | 57% | 57% | 4.5 | 29% |
| **`p5-04`** | **25%** | **75%** | **75%** | 2.0 | 12% |
| `p5-05` | **75%** | 25% | 38% | 2.0 | 12% |
| `p5-06` | 33% | 67% | 67% | 3.0 | 22% |
| `p5-07` | 62% | 38% | 44% | 3 | 0% |
| **Part 5** | **51%** | **49%** | **54%** | **2.5** | **12%** |

Three things follow, and they answer the three questions this batch carried in.

**1. Part 5 is indistinguishable from Part 3, and it is the worst expected score
in Section 2.** The sequence across the five parts audited is now:

| | p1 | p2 | p3 | p4 | **p5** |
|---|---|---|---|---|---|
| not-longest | 66% | **84%** | 51% | 60% | **51%** |
| expected | 46% | **29%** | 50% | 43% | **54%** |

Said plainly: **there is no trend.** Part 2 is still the peak by a wide margin and
nothing since has come near it. Batch **I** withdrew *"Section 2's quizzes are
improving"* and hypothesised a second-half decline instead; **that hypothesis is
still not confirmed** — the series 46 → 29 → 50 → 43 → 54 is not monotone in
either direction — but it is **no longer contradicted**, since the two
second-half parts average 48.5% against the first three's 41.7%. Part 6's 64
questions will settle it, and they are the largest single sample in Section 2.

**2. `p5-04` is the worst-constructed quiz in Section 2, and it fails differently
from `p4-01`.** At 75% strict / 75% expected it passes `p4-01`'s 71%. But the two
are not the same defect:

| | `p4-01` (batch J) | `p5-04` |
|---|---|---|
| shape | severity — long answers, **13-character** extremes | **frequency** — 6 of 8 questions, but median margin **2.0** |
| effect of removing it | Part 4 moves 60→68 / 43→38 (**8 and 5 points**) | Part 5 moves 51→55 / 54→51 (**4 and 3 points**) |

So **removing `p5-04` does not move the part materially**, and that is the finding.
Part 4 was bimodal — `p4-01` at 71% beside `p4-05` at 0% — so one bad quiz carried
it. Part 5 is **uniformly mediocre**: four of seven lessons sit at 56-75% strict,
and only `p5-01`, `p5-05` and `p5-07` are above chance on the not-longest measure.
The cause in `p5-04` is visible on the page — the correct options are full clauses
(*"The lows made during the New York lunch hour"*) and the distractors are short
noun phrases (*"The overnight Asian session high"*, *"The previous week's opening
price"*) — which is the §3 breach exactly, and it is a **writing habit**, not one
bad question.

**3. Part 4's severity problem was a Part 4 problem — confirmed.** Part 5's median
margin is **2.5** and spread-over-10 is **12%**, against Part 4's **6** and
**24%**. On both severity measures Part 5 sits with Parts 1, 3 and 6 (margins 2-3,
spread 2-12%) and Part 4 is the outlier. The lead batch **J** carried forward —
*"whether the margin/spread severity that distinguishes Part 4 continues"* — is
answered **no**.

#### Quiz-count proportionality (D14 / E18 / I11) — **the test inverts, and Part 5 passes both ways**

For the first time in the audit the question is not *"is this under-tested?"*
**C18**'s floor of 4 is not approached — the minimum in Part 5 is 7 — so the
inverted question has to be asked instead.

| Lesson | Transcript | Qs | KB / Q | Lesson | Q / KB |
|---|---|---|---|---|---|
| `p5-01` | 10.8 KB | 8 | 1.35 | 7.0 KB | 1.14 |
| `p5-02` | **23.5 KB** | 9 | **2.61** | 9.7 KB | 0.93 |
| `p5-03` | 16.3 KB | 7 | 2.33 | 7.3 KB | 0.96 |
| `p5-04` | 11.5 KB | 8 | 1.44 | 7.4 KB | 1.08 |
| `p5-05` | 9.9 KB | 8 | 1.24 | 7.1 KB | 1.13 |
| `p5-06` | 19.8 KB | 9 | 2.20 | 8.6 KB | 1.05 |
| `p5-07` | 14.3 KB | 8 | 1.79 | 8.4 KB | 0.95 |
| **Part 5** | **106 KB** | **57** | **1.86** | **55.5 KB** | **1.03** |
| *Part 4* | *224 KB* | *45* | *5.0* | *72.6 KB* | *0.62* |
| *Part 3* | *291 KB* | *47* | *6.2* | — | — |

**Verdict: Part 5 is not over-tested, with one exception, and the exception is the
tell.** Fifty-six of the fifty-seven questions land on a distinct sourced claim —
they were checked one by one — and the ratios are what they are because **the
episodes are short, not because the lessons are thin**. Parts 3 and 4 are lecture
series with 40-134 KB transcripts; Part 5 is seven daily trade reviews of 10-24 KB
each. Measured against the lessons rather than the sources, Part 5 at **1.03 q/KB**
is 1.7× Part 4's density, and every extra question is doing work.

The one exception is **K11**, `p5-05`'s duplicate — and it is instructive that it
landed in the lesson with the **second-shortest transcript in the part** (9.9 KB)
and the joint-highest question density. That is what hitting a quota rather than
the material looks like, and it happened once in fifty-seven.

#### The hedge test, per lesson — **Part 5 is the strongest part in the audit**

Batch **I** established the test is per lesson, batch **J** replicated it and named
`p3-06` and `p4-06` as templates. Part 5 gives five more:

| Lesson | kept | dropped | The load-bearing ones |
|---|---|---|---|
| `p5-01` | 5 | 2 | kept *"if it does I'm wrong, and that's fine"*, *"it might just touch that … or may not even touch it at all"*; dropped the facetious softener (**K6**) |
| `p5-02` | 8 | 3 | kept *"just because I'm doing it with a demo account doesn't mean you're going to be able to go out there and do it too"*; **dropped "you have to understand my language first" (K4)** |
| `p5-03` | 7 | 1 | kept **all four**: *"I'm not promising you profitability … you're not going to be able to replicate this"*, *"most of the time before they do it — **not all the time. I take losing trades**"*, the compliance disclaimer, *"do not try to trade tomorrow"* |
| `p5-04` | 7 | 1 | kept *"it's not a fantasy; **it means it's not going to work all the time**"* and *"I'm not going so far as to say that for right now"* |
| `p5-05` | 3 | 2 | kept *"probably start having some pretty wild movement"*, *"it overshoots it granted"*; dropped the purist concession (**K14**) |
| `p5-06` | 6 | 2 | kept *"many times can present opportunities … that really doesn't come to fruition"*, *"50/50"*, *"tends to be a choppy day"* |
| `p5-07` | 6 | 2 | kept *"that kind of return obviously is not typical, and I'm not promising any of you"*, *"yes, he's my son"*, *"I'm not limited to just one model"* (**K16** is the two exceptions) |
| **Part 5** | **42** | **13** | — |

**The raw ratio is not comparable across parts** — these are seven short daily
reviews and ICT hedges constantly in that format, where Parts 2-4 are lectures. The
comparable claim is the one that matters and it is unambiguous:

> **Exactly one load-bearing hedge is dropped in seven lessons (K4), against Part
> 2's four.** Every lesson in Part 5 keeps the qualification attached to its
> largest claim, and `p5-03` and `p5-04` keep every hedge ICT states about the
> limits of the method.

That is the **H2 / H14 / H18 / H19** family arriving at its best result in the
audit, and it means the batch-H headline — *"Section 2 keeps the claim and drops
the limits"* — is now a statement about Part 2 specifically. **Third confirmation
that hedge-dropping is lesson-by-lesson variance and not editorial policy.**

#### The transcript beats the notes — **the strongest case in Section 2, and it is `p5-06`**

`ep-32.md` compresses the day's premise into one sentence that is **wrong in a way
a lesson could easily have inherited**:

> "After an outside day where we went higher and lower than the day before that we
> **typically get a range/choppy day**." — `ep-32.md`

The transcript makes the outside day the *amplifier*, not the cause. The cause is
the **failure to run the old low**:

> "if you're trading down to an old low but **fall short of it** — this is usually
> where that double bottom idea comes in and it feels safe … look for a run
> through that old low, **but if they stop it short it tends to be a choppy day**,
> **especially** if we have an outside day with down close" — ep32:46-62

**`p5-06` reproduces the transcript's structure exactly** (line 15), including the
conditional and the word *especially*. Had it followed the note, the lesson would
teach that any outside day produces chop — which is a materially different and
much weaker rule.

The same page also carries an instruction the transcript never gives — *"**Play the
edges of the daily range**"* (`ep-32.md`) — which sits awkwardly against the
transcript's entire thesis that price gravitates to the **middle**. **The lesson
declines it**, and teaches the midpoint (lines 19, 25, 37). So p5-06 rejects the
note twice on one page: once where the note over-generalises, once where it
contradicts.

Set against **K10** (`p5-03` taking the word *stronger* from `ep-29.md`) and the
**H5** family (three instances, batch J), this is the clearest single case in
Section 2 that **the discipline is present** — the same batch does both, so the
distinction is not the author's habit but whether the note and the transcript
conflict visibly.

#### Consistency — clean, with one cosmetic exception

Everything mechanical checks out: seven lesson ids `p5-01`…`p5-07`, all
`data-month="p5"`, all crumbs numbered 1-7 in order, all six `data-slug` values
prefixed correctly for `SLUG_BY_ID`, `python build.py` reporting **78 lessons, 67
image sets, 78 quizzes, 4 review pages across 2 sections with zero warnings**.
No `(Lx)` or `(Pn Lm)` cross-reference appears anywhere in Part 5, so there is
nothing to resolve, and no `.src` misuse of the **J24** kind.

**K17 · nit · FIXED · `p5-01/lesson.html` — no `.fig-slot` and no annotating comment.**
Episode 26 genuinely has no charts — **confirmed on all three counts**: there is no
`ep-26.md` at all, `notes/2022-mentorship/raw/ep-26-*.png` is empty, and
`images/p5-01-*.png` does not exist. Nothing is broken and `build.py` emits no
warning, so this is **not** a *Fixed in flight* case like `p3-01`'s live-but-empty
slot; it is the opposite. The inconsistency is that `p1-01`, `p2-01`, `p2-04` and
(since batch I) `p3-01` all carry the Section 2 convention —
`<!-- no fig-slot: the notes carry no charts for this episode -->` — and p5-01
carries nothing. One comment line, purely cosmetic. It is already listed in
*Structural observations*; this confirms the source.

**Terminology for batch N.** `intermediate term` appears **0 times in Part 5**, in
either spelling, across `lesson.html` and `quiz.js`. Corpus totals are unchanged at
**7 hyphenated / 29 unhyphenated**, and batch I's observation stands: the
hyphenated form survives only in Section 1, Part 1 and the section-level pages.

**Chris Laurie and Wyckoff — neither appears.** All seven Part 5 transcripts were
grepped for *Laurie / Lawrie / Wyckoff / composite man*: **zero hits**. So the
Chris Laurie family (**B4**, **H20**) gains no fourth source, and **J12** gains no
recurrence. Both stay as logged.

#### Noted, not a finding (episodes 30–33)

- **`p5-06` drops the word "low" from a self-contradicting checklist, and that is
  the right call.** ICT runs the entry checklist as *"is this a **swing low**?
  yes. Is this a fair [value] gap? yes. Does it trade back up into that range?
  yes"* (ep32:236-239) — on a **short**, where the trigger should be a swing high.
  The lesson writes *"is that a **swing**? yes"* (line 40). The source cannot be
  resolved either way without guessing, so under-claiming is what §1 asks for. This
  is the same decline-to-guess posture as the *"robins leaderboard"* case above,
  applied to a word rather than a figure.
- **`p5-04`'s Twitter handle is dropped** (ep30:100-108). Appropriate; noted so a
  fix pass does not read it as a missing citation.
- **`p5-07`'s biographical material is dropped** — the 90-minute Twitter Spaces
  session, *"my children … with the exception of one, not really interested in
  trading"*, the audience feedback (ep33:24-37, 284-290). None of it is teaching.
- **`p5-06` keeps ICT's spelling-error disclaimer** (*"if I make a mistake, a
  spelling error, you're just going to have to deal with it … I don't want any
  deleted tweets"*, ep32:381-389) and drops *"only the diligent are going to want
  to go through something like this"* (ep32:18-19). The first is the load-bearing
  half.

#### Batch K summary

| | |
|---|---|
| Lessons audited | 7 (episodes 26-33, no 28; **106 KB — the lightest batch in the audit**) |
| Findings | **17** — 0 blockers, **4** should-fix, **13** nits |
| Fidelity findings | **3** (**K1**, **K2**, **K3**) — all in `p5-03`, all in one `kv` |
| Quiz questions traceable | **57 of 57** |
| Fixed in flight | none |

**The headline is that Part 5 is the best part in Section 2 on the dimension that
has been weakest in every batch since G — and its defects are concentrated in a
single table in a single lesson.**

Coverage has been the weak dimension in Parts 1, 2, 3 and 4. It is not the weak
dimension here: nine of the ten coverage findings are nits, there is **no
should-fix omission in five of the seven lessons**, and the hedge test — the
sharpest form of the coverage question — returns **exactly one load-bearing hedge
dropped across seven lessons** (**K4**), against Part 2's four. `p5-03` and
`p5-04` keep every qualification ICT attaches to the limits of the method,
including the two most consequential in the part: *"I'm not promising you
profitability … you're not going to be able to replicate this"* and *"it's not a
fantasy; it means it's not going to work all the time."*

**The weak dimension is the quiz**, as in Part 3 — and for two unrelated reasons.
Construction: **51% not-longest / 54% expected**, statistically indistinguishable
from Part 3 (51/50) and **the worst expected score of any Section 2 part**, with
`p5-04` at 75%/75% the worst-constructed quiz in Section 2. Content: **K11**, the
audit's **first duplicate question** — `p5-05`'s Q3 and Q4 are the same question
with the same answer from the same transcript line.

**And the three fidelity findings are one defect.** `p5-03`'s entry table shows
three fills where episode 29 shows two (**K1**), attaches the close-proximity
label to the wrong one (**K2**) — which severs the rule from the fumbled entry
that motivates it — and prints *"less than one handle of heat"* beside the two
numbers that make it 1.25 (**K3**). None of the three reaches its quiz, so it is a
one-file fix. It is also the batch's irony: `p5-03` was the lesson this batch was
most interested in, and it is the only one with a fidelity problem.

**Do the Part 1-4 conclusions replicate? All four, and two of them at their
strongest yet:**

1. **One episode per lesson prevents migration defects — replicates, fifth
   time, and this is the batch where a fifth could have hidden.** Part 5 is the
   only part in Section 2 with an **episode-number offset** (`p5-03` = episode
   29, 28 omitted), which is precisely the structural condition that produced
   **A2** / **C1** / **C2** / **D1** / **E1**. It produced nothing: all seven
   `video.txt` files match their row in `s2-2022-mentorship-videos.md`, no lesson
   cites an episode number at all, and **K1** — the closest thing to a migration
   defect in the batch — is two descriptions of one event from the *same*
   episode. **Thirty-two Section 2 lessons audited, no leakage.**
2. **The transcript beats the notes — replicates, with the strongest case in
   Section 2.** `ep-32.md` makes the outside day the *cause* of a choppy day
   where the transcript makes it the *amplifier* and the failed run at the old
   low the cause; `p5-06` follows the transcript, conditional and all. The same
   note page carries *"play the edges of the daily range"*, which contradicts the
   transcript's midpoint thesis, and the lesson declines it. **The H5 family gains
   no fourth instance** — **K10** is adjacent but not the same mechanism (the note
   *supplies* a generalisation rather than *removing* a qualifier), so it stays at
   three and goes to batch N as logged.
3. **The de-garbling is sound — replicates, eight more times, all correct**
   (*"i'm embarrassing"* → if I'm bearish, *"five hypothetical thousand"* → five
   thousand hypothetical, *"16 inch term"* → hourly, *"if you're publish"* → if
   you're bullish, *"raped across the coals"* → raked, *"onetick pony"* →
   one-trick, *"395 and a quarter"* → 3915.25, and **$33,700 → $3,700**, which
   both the transcript and the two account balances confirm). **Twenty-six across
   Parts 1-5.** Plus a **third decline-to-guess**, and the first on a *name*
   rather than a number (*"the robins leaderboard"* → *"retail leaderboards"*).
4. **Hedges are dropped lesson-by-lesson, not by policy — replicates, third
   confirmation, and Part 5 supplies five more templates** alongside `p3-06` and
   `p4-06`.

**What contradicts an earlier reading — three things:**

- **The batch's headline lead is half wrong, and the half that fails is the half
  that mattered.** The lead held that `p5-03` *"finally delivers the bullish SMT
  reading."* It does — a complete bullish read, the only one in Section 2, worked
  end to end. But the prediction that it would be the batch's best result is
  wrong: **`p5-03` is the only lesson in the batch with fidelity findings**, and
  all three of them are in the trade it uses to teach that read. **C9 is not
  closed** (wrong pair — NQ/ES, not DXY/FX — and ICT frames it as one trade, never
  generalising), so the honest verdict is the one batch J predicted: the *"no
  bullish rule anywhere"* gap closes, **C9** does not.
- **"Is Part 5 over-tested?" — no, and the framing needed correcting.** At
  1.86 KB of transcript per question it looks 3× more generous than Part 4, and at
  1.03 questions per KB of lesson it looks 1.7× denser. Both ratios are artefacts
  of **episode length**: these are seven daily reviews of 10-24 KB, not lectures of
  40-134 KB. Fifty-six of fifty-seven questions test a distinct sourced claim. The
  one that does not is **K11** — and it landed in the lesson with the
  second-shortest transcript, which is what a quota rather than the material looks
  like.
- **`p5-01`'s missing note page changes nothing, and the "one-source lesson" lead
  resolves the opposite way to how it was framed.** The only corpus lesson written
  from a transcript alone has **zero** fidelity findings, quotes every price
  correctly and keeps four of ICT's six hedges — while the two lessons in this
  instalment that *do* have note pages carry all four of the batch's fidelity
  findings and its one load-bearing hedge drop. Batch J retired the thin-notes
  hypothesis on page *length*; this retires it on page *existence* too. The Part 5
  note pages are 100-600 bytes of bullets and were never doing structural work.

**Two verdicts closed, so batch L need not revisit them:**

- **Pyramiding — five sites, no drift.** `p5-01`'s 4-then-2 build agrees with
  p2-06, p3-03, p4-03 and `summary.html`; it states no ladder and adds no rule.
  **Do not reopen.**
- **The Part 4 margin/spread severity does not continue.** Median margin 2.5 and
  spread-over-10 12% put Part 5 with Parts 1, 3 and 6. **Part 4 is the outlier**,
  and batch J's carried-forward lead (a) is answered.

**Four items carried to batch N:**

1. **K11's shape is new to the audit** — a duplicate question. Worth one grep
   across all 80 quiz files during the cross-cutting sweep, since nothing in the
   method to date would have caught it.
2. **`intermediate term`** — 0/0 in Part 5; corpus totals stand at **7 / 29**.
3. **Chris Laurie** — no fourth source; three sources, three omissions, zero
   appearances. **Wyckoff / composite man** (**J12**) — no recurrence in Part 5.
4. **`p5-01`'s missing no-fig-slot comment** (**K17**) — cosmetic, one line, and
   the last outstanding item in the *Lessons with no `.fig-slot`* observation.

**Input to batch L.** Watch for: (a) whether **Part 6's 64 questions** — the
largest single sample in Section 2 — settle the second-half question, which is now
neither confirmed nor contradicted; (b) `p6-07`'s quiz, which the corpus
measurement still calls the best-constructed in the audit (**3.6%**), and whether
reading it confirms that; (c) whether the **bullish SMT** reading recurs in the
four remaining SMT lessons (p6-01, p6-02, p6-05, p6-07) and whether any of them is
**DXY-against-a-currency**, which is the only thing that could still close
**C9** by cross-reference; (d) whether the **H14 family** — the reader's fluency
being second-hand to ICT's authorship (**K4**) — is stated a fourth time in
Part 6, which is where the algorithmic-theory and psychology episodes sit.

### Batch L — Section 2, Part 6 (p6-01 … p6-08 / episodes 34–41)

Sources read: all 8 `notes/2022-mentorship/ep-{34..41}.md` (**6.8 KB**, read whole
up front) **and** all 8 `transcripts/2022 Mentorship/…Episode {34..41}.txt`
(**304 KB — the heaviest batch in the audit**, ahead of batch I's 291 KB and
nearly 3× batch K), against the 8 lessons, their **64** quiz questions and their
8 `video.txt` files. Worked in four instalments along the plan's own build seams
(§7 batches 13–15, with the first split in two): **34–36 / 37–38 / 39 / 40–41**,
≈42 / 77 / 84 / 101 KB.

**Part 6 closes Section 2**, so this is the last lesson batch; `p6-08` is the
mentorship's final episode.

**Up-front mechanical checks — all clean.**

- **Video URLs: 8 of 8** match `s2-2022-mentorship-videos.md` rows 34–41, each on
  the right episode *and* the right lesson id (ep34→`p6-01` … ep41→`p6-08`, no
  offset). Thirty-two Parts 1–5 URLs plus these eight = **all 40 verified**.
- **Charts: 18 / 18 / 18** on notes → `raw/` → `images/`
  (1/1/1/1/2/2/5/5), and **all eight lessons carry a live `.fig-slot`** — Part 6
  is the only part in Section 2 with no chart-free lesson, so **K17**'s cosmetic
  family does not extend here.
- **Duplicate-question grep** (the **K11** check, now part of the method): the
  only pair above threshold is `p6-02` Q2/Q3, and they are a *definition* and its
  *implication* ("what is the mean threshold?" / "what does trading through it
  suggest?"), not a duplicate. **No K11 instance in Part 6.**
- **`intermediate term`: 0 / 0** — the term does not appear in Part 6 at all,
  confirming batch I's per-part table exactly. **Corpus total stands at 7 / 29**
  and the table is now complete (see the batch-N item in the summary).
- **`pyramid`: 0** occurrences, so the closed pyramiding verdict has nothing to
  revisit here, as predicted.
- **`build.py` still emits zero warnings.**

> **Doc repair, not a content edit.** The `## Fixed in flight` heading was
> deleted by accident in batch K's commit (`d508fa1`) — its body text survived as
> an orphan paragraph. Restored below. Nothing in `content/` was touched.

#### Instalment 1 — episodes 34–36 (`p6-01`, `p6-02`, `p6-03`; 42 KB)

**L1 · nit · [p6-01/lesson.html:12](../content/s2-2022-mentorship/p6/p6-01/lesson.html#L12)** —
**a mechanism supplied where the source supplies only a word.** The callout that
handles ICT's own *"that's blasphemy, he just talked retail"* aside closes with
*"what is actually being traded around it is the liquidity that sits there."* The
transcript's reason for the Sunday gap mattering is **valuation**, not liquidity —
*"you'll see that many times there's a lot of valuation around that gap so it'll
be treated as a dynamic price level"* (ep34:261-266). ICT does attach *liquidity*
to the relative equal highs in the same passage (278-279), which is what the
lesson's own next callout uses it for. Low harm, because line 11 carries the
sourced wording verbatim one line earlier — but the gloss is the lesson's, not
ICT's, and §1 prefers under-claiming.

**L2 · nit · `p6-01` coverage** — **the authorship register is dropped, and this
is the H14/K4 family's first Part 6 site.** ep34:90-99: *"it originated really
with index futures bonds and index features … in the 90s i was utilizing these
same tools … these things have been under my control, **my ownership** if you
will, for about **three decades**."* The lesson keeps the *language* half of that
register — line 12's *"it's put in the language you'll already understand"*, from
ep34:258 — and drops the *ownership* half. So the family's tell is present in the
part from its first episode. (Tally continued in instalments 2 and 3; verdict in
the summary.)

**L3 · nit · `p6-01` coverage** — **the forward-looking call keeps two hedges and
loses the third.** *"in my opinion it's not going to be left open"* and *"I'm not
expecting perfect, I'm not suggesting that at all"* both reach line 41; **"i may
be wrong"** (ep34:405) does not. Not load-bearing — the two that survive cover
the same ground on the same claim — but recorded because the hedge test counts
per site.

**L4 · nit · `p6-02` coverage** — **"there's no need to" is dropped, and it is the
same argument `p6-07` will build a stop-placement rule on.** ep35:249-252: *"if
you look at what we did on 8:30, it already snapped down into this gap, and it's
**not likely to go lower than that — there's no need to**."* One clause, and it is
the reasoning behind the whole bullish read that follows: a level that has already
been delivered into does not need revisiting. `ep-40.md` states the same logic as
a rule (*"if the low already took SSL then the low doesn't need to get taken out …
**THEY'RE PROTECTED LOWS**"*), so `p6-02` drops the first statement of an idea the
part later builds on — checked against `p6-07` in instalment 4.

**L5 · should-fix · FIXED · `p6-02` coverage** — **the lesson never says the example sits
outside the model.** ICT raises it twice, unprompted, because his audience had
already asked: *"what about the times you said for the model … teaching you
something that is **outside the model** as the reasons why you're not going to
anticipate or see that typical setup — that's the whole point of why i did it
today"* (ep35:146-153), and again *"i'm **not limited to this model** … why are
we not using the time frame that's used for the model? i'm showing you again just
proof that these things deliver as i teach them"* (413-423). Everything `p6-02`
teaches — mean threshold, the two-stage dealing range, the 9:30 SMT — is
presented as ordinary method, so a reader who has learned Part 1's killzone model
is given no way to reconcile a setup ICT twice flags as off-model. This is the
frame the episode was built around, and it is the batch's first genuine coverage
loss. *Fix:* one callout, in ICT's words.

**L6 · nit · [p6-02/lesson.html:13](../content/s2-2022-mentorship/p6/p6-02/lesson.html#L13)** —
**the note generalises and the lesson follows — the K10 shape, second instance.**
The transcript states the mean threshold only as that day's observation: *"mean
threshold was taken today and that to me bodes well for a continuation to take out
this short-term high"* (ep35:27-30). The note turns it into a rule with a
converse: *"If the mean threshold doesn't hold we can expect the OB to fail"*
(`ep-35.md`). The lesson prints both — the observation at line 12, the note's rule
at line 13 under the tag *"The corollary"*. It is sourced (the notes are a
permitted source, §1) and the two readings do not conflict, so this is a nit. It
matters only as evidence: **K10**'s mechanism — a note *supplying* a
generalisation rather than *removing* a qualifier — now has a second site, which
is one more than the **H5** family gained in batch K.

**L7 · nit · `p6-02`, three sites** — **quotations smoothed, twice by deleting a
qualifier.** Line 30 quotes *"…you're going to encounter what would look like SMT
divergence and then it disappears"*; ICT says *"you're going to **many times**
encounter…"* (ep35:224). Line 33 quotes *"…to set up the next leg."*; ICT
continues *"…**if it's going to have one**"* (ep35:446). Line 20's quoted *"picking
up discount levels each time, the algorithm accumulating more longs to press
deeper into the range"* is a smoothed version of *"picking up discount levels each
time the algorithm is picking up more accumulated longs to press deeper into all
of this range"* (ep35:336-340). No reader is misled — the surrounding prose keeps
*"usually"*, *"probably"* and *"normally"* — but the deleted material is inside
quotation marks in two of the three, and both deletions are hedges.

**L8 · nit · `p6-02` coverage — and it is the correct call.** `ep-35.md` lists
**five** SMT times: *"2 am, 8:30 am, 9:30 am, 10 am, and 1:30 pm"*. The
transcript names **three**: *"what times — 8 30, 9 30, at news events being
released"* (ep35:217-220). The lesson follows the transcript and declines the
note's extra two clock times. Logged as coverage because a permitted source's
material did not reach the lesson; logged as a **nit** because §1's
prefer-under-claiming makes this the right decision, and it is the batch's first
*transcript-beats-notes* instance.

**L9 · nit · `p6-02` coverage** — **the impersonation warning is dropped.**
ep35:122-132: *"it's a lot of people over there pretending to be me … some of
them have been **asking for money** — i'm not asking you for money and I'm never
gonna ask you to DM me, I'm never gonna DM you. So if it ain't being posted
publicly on twitter, it isn't me."* All three lessons in this instalment
correctly drop the administrative asides (the Twitter handle spelled out
letter-by-letter, the live-stream scheduling, *"my twitter feed is not a signal
service"* at ep36:48-51 — the last of which `p6-01` already covers in substance).
This one is different in kind: it protects the reader from being defrauded, and
it is the only such statement in Part 6.

**L10 · nit · `p6-02` coverage** — **a session-hygiene rule dropped.**
ep35:461-467: *"if you're going to be trading, you study in the morning session,
**leave the afternoon to the gamblers** — volume just probably won't be on your
side in the afternoon."* Conditioned on a pre-holiday Friday, which is why it is a
nit rather than a should-fix. Worth carrying to the `p6-05` read, since that
lesson is titled *"…Trading the Afternoon"* — see the cross-check in instalment 2.

**L11 · should-fix · FIXED ·
[p6-03/lesson.html:22](../content/s2-2022-mentorship/p6/p6-03/lesson.html#L22)** —
**the day's two trades are presented as one, and the source is ambiguous about
which numbers belong to which.** ICT is explicit that there were two: the morning
*"small trade"* he recorded and tweeted, *"took partials … and then the limit
order getting hit"*, and then *"**the only other trade i had today** was waiting
for it to drop down to a discount, and when it did i went long here, had a little
bit of heat here — not much, it was like five handles"* with *"stop loss just
below the swing low"* (ep36:100-119). The five figures the lesson prints are all
in the transcript — entry **4120 on five contracts**, three sold at **4139.25**,
final two at **4143.75** (ep36:197-218), heat ≈**5 handles**, stop below the swing
low — but they are gathered into a single *"trade management, stated plainly"*
callout, so the heat and the stop of one trade sit beside the entry and exits of
the other. Which grouping is right is genuinely unclear in the source: the tweet
shown at 199-207 reads *"sell-side liquidity is taken, free to run to 43 and a
half"*, which fits the sell-stop-clearing long, while *"first partial, which is
when I tweeted"* ties the partials to the tweeted trade. **This is the K1 / J1
shape** — two descriptions of the same session merged behind one subject — and per
§1 the fix is to flag the ambiguity, not resolve it: report the entry/partials
chain as one trade and note that ICT describes a second.

**L12 · nit · `p6-03` coverage** — **the tweet's own text never reaches the
lesson.** *"Sell-side liquidity is taken, free to run to 43 and a half"*
(ep36:205-207, de-garbled from *"salsa liquidity"*) is the one place in the
episode where the objective is stated as a *prediction* rather than a
post-hoc description, and ICT points at the timestamp to make exactly that point:
*"it's time and date stamped, that is exactly as you see it here"* (200-204).
`p6-03` gives the 4143.75 fill but not the call that preceded it.

**Instalment 1 — what came back clean.**

- **All 22 quiz questions traceable** (7 + 9 + 6). Every `e` field quotes or
  closely paraphrases its episode; `p6-03`'s six are quotation-led throughout.
- **Hedge test, per lesson: 7 of 10 reached the lesson, and none of the three
  losses is load-bearing.** `p6-01` keeps *"sometimes the week will just run away
  from it"*, *"in my opinion"* and *"I'm not expecting perfect"* (loses *"I may be
  wrong"*, **L3**); `p6-02` keeps *"not that it can't happen, but it's likely to
  not pan out"*, *"probably"* and *"usually"* (loses the two quotation-internal
  qualifiers, **L7**); `p6-03` keeps all three of *"nobody in retail **usually**
  will take a re-entry"* (rendered *"rarely"*), *"I **typically** like to have all
  my trading done by Wednesday"* and *"it can go either direction"*.
- **De-garbling: 10 more silent corrections, all correct.** *"daily bear shoulder
  block"* and *"fair shoulder block"* → bearish order block (ep35:265,271 — the
  same garble family batch J logged three times), *"main threshold"* → mean
  threshold (270), *"watch how it should stay open"* → the gap stayed open
  (ep34:206), *"39.53"* / *"39.54 and a half"* / *"39 26 and three quarters"* →
  3953 / 3954.50 / 3926.75, *"41 39 and a quarter"* / *"41.43 and three quarters"*
  → 4139.25 / 4143.75, and *"two — did you try to sell short"* → *"then tried to
  sell short"* (ep35:319-323), which is an **H1**-shaped sentence repair that went
  the right way.
- **A fourth decline-to-guess, and the second on a name.** ep34 garbles the
  student whose public study prompted the dealing-range correction two ways in
  fifteen lines — *"i was watching **hannah** on her youtube channel"* (413) and
  *"in **anna's** example she was looking for a short"* (434). `p6-01:36`
  prints neither, writing *"a mistake seen in a student's public study"*, which
  ICT's own framing supports (*"some of my students when they first come in to the
  fold they do this type of thing too"*, 422-425). Same decision as batch K's
  *"the robins leaderboard"*.
- **One garbled passage dropped rather than repaired (the J12 shape, and
  correctly).** ep35:272-273's *"i was making rappers to be in the video"* is
  unrecoverable; `p6-02` does not attempt it.
- **The dealing-range correction survives in both directions.** `p6-01:37-38`
  gives the long case (anchor low-to-high on the expansion swing, hunt the
  discount below 50%) *and* the short mirror (*"for a short you anchor to the down
  leg"*) — which is sourced, since ICT's student was looking for a short and he
  says *"you want to look at the price leg that drops"* (ep34:433-436). This is
  **not** an **A8/C9** one-sidedness site.
- **A rebalancing data point the E1 cross-check will need.** ep35:291-292 has ICT
  saying *"all of this movement down here **we completely rebalanced** all that"*,
  and ep36:70-73 has *"rolled up even higher **rebalancing all of this**"*, which
  `p6-03:18` carries. Both are descriptions of what a specific range did, not
  rules about what imbalances must do — which is the distinction episode 38 turns
  out to hang its whole differentiation on. Continued in instalment 2.

#### Instalment 2 — episodes 37–38 (`p6-04`, `p6-05`; 77 KB)

> **The batch's headline lead was wrong on its central claim, and it is worth
> saying first.** The brief held that `p6-05` omits ICT's Chris Laurie passage —
> *"`grep -ril laurie content/` returns **zero**, so this is a fourth source,
> fourth omission, still zero appearances."* **It is not an omission. `p6-05`
> carries the passage in full**, at
> [lesson.html:26](../content/s2-2022-mentorship/p6/p6-05/lesson.html#L26), with
> the differentiation, the *"not likely to occur most times"* qualifier, the nod
> and the no-business-relationship disclaimer. The grep returned zero because the
> lesson spells the name **"Chris Lorie"** — see **L13**. So the **B4 / H20 family
> is retired, not extended**: the corpus's most consistent omission turns out to
> have one appearance, and it is in the one place the material is load-bearing.

**L13 · nit ·
[p6-05/lesson.html:26](../content/s2-2022-mentorship/p6/p6-05/lesson.html#L26)** —
**a real person's name is spelled a fourth way.** The transcript garbles it twice
over inside thirty lines: *"a gentleman by the name of **chris laurie**"*
(ep38:136-137), *"between me and **chris laurie**"* (165), then *"now I'm not
knocking **chris lord**"* (166). The lesson prints **"Chris Lorie"**, which matches
neither transcript spelling — and the trader ICT is referring to spells it **Chris
Lori**. Every other named third party in the corpus is either a verifiable name or
was declined outright (batch K's *"the robins leaderboard"*; the Hannah/Anna garble
in instalment 1 above). *Fix:* either the source spelling with the garble noted, or
the person's actual spelling — not a third form. Low harm to the teaching, but this
is the only living named individual in Section 2 and the audit has already ruled
that garbled names get the decline-to-guess treatment.

**L14 · should-fix · strengthens the Section 1 blocker F1 ·
[p6-05/lesson.html:26](../content/s2-2022-mentorship/p6/p6-05/lesson.html#L26)
against [s1 summary.html:240](../content/s1-ict-core/summary.html#L240) and
[s1 exam.js:235-237](../content/s1-ict-core/exam.js#L235)** —
**episode 38 corroborates E1 from a Section 2 source, and the two sections now
teach opposite things about the same term.** ICT, in his own words, in 2022:

> *"a lot of you are familiar with a gentleman by the name of chris laurie and he
> talks about **liquidity voids** where he teaches how the market wants to come
> back down and **fill all that area in** … as you probably noticed **I don't teach
> that**. I teach obviously there's times when that can occur but because I
> understand the algorithm **that is not likely to occur most times** … I'm not
> trying to insist that these **imbalances** completely rebalance — that's one of
> the main differentiations between me and Chris Laurie."*
> — ep38:136-165

Three things follow, and they are not the same thing:

1. **It refutes E1's reading independently.** ICT uses *liquidity void* and
   *imbalance* interchangeably across those thirty lines — the thing Laurie expects
   to *fill in* is the thing ICT calls an imbalance and declines to insist fully
   rebalances. An area where **no trading took place at all** cannot be an
   imbalance in that sense; it is a gap, which is what **m4-09**'s vacuum block is.
   So the *"neither buyside nor sellside was offered"* definition at
   `m4-11/lesson.html:9` is contradicted by a second, later, independent ICT source
   — not only by its own lesson's later bullets. **E1 no longer rests on a
   single-episode reading.**
2. **It does not supply the replacement definition.** Episode 38 never states
   *"one side was offered and the other was not."* That formulation exists only in
   `m4-11`'s own transcript (7-11, 111-114, 125-126, quoted in **E1**). So the
   answer to the brief's question is **half yes**: E1 can now be *justified* from
   Section 2, but it still has to be *rewritten* from Month 4. The shape of the fix
   does not change; its evidential basis does.
3. **It adds a defect to F1 that F1 did not record.** `summary.html:240` states the
   fill unconditionally — *"it gets covered back over **once both sides have been
   offered**"* — and `exam.js:235-237`'s `e` reproduces it. Episode 38 is ICT
   explicitly refusing that unconditional form. Meanwhile `p6-05`'s own quiz marks
   *"Imbalances always rebalance completely"* as the **wrong** answer
   ([p6-05/quiz.js:4](../content/s2-2022-mentorship/p6/p6-05/quiz.js#L4)). **So the
   built page currently grades a reader wrong in Section 2 for the position it
   teaches them in Section 1.** That is a live cross-section contradiction, it is
   demonstrable without reading any source, and it belongs in batch M's input:
   fixing F1 means adding ICT's *"not likely to occur most times"* qualifier to the
   summary cell, not only correcting the definition.

*Not a new blocker* — the defect is **F1**'s and is already logged at blocker
severity. Recorded at should-fix because it changes F1's scope (three files plus a
qualifier, rather than two cells) and its justification.

**L15 · should-fix · FIXED ·
[p6-05/lesson.html:8](../content/s2-2022-mentorship/p6/p6-05/lesson.html#L8) and
[:80](../content/s2-2022-mentorship/p6/p6-05/lesson.html#L80)** —
**the H14 / K4 family gets its fourth instance, it is load-bearing, and it is
stated twice in one episode.** ICT frames the entire gear-change lecture on his own
authorship, at the top and again at the bottom:

> *"because **I'm the author of these concepts** I have a lot of tools at my
> disposal and I have **a little bit better understanding of price delivery than
> the average student of mine** — so if I go in and I show you something in this
> lecture today, the main takeaways before I get into is this…"* — ep38:73-82
>
> *"because **I'm the author of these concepts** I don't have a limitation to just
> that one."* — ep38:807-809

`p6-05:8` reproduces the *"main takeaways"* framing and the four agenda questions
that immediately follow the first quotation, and stops one sentence short of it.
`p6-05:80` reproduces the *conclusion* of the second (*"When the model speaks, I'm
going to show you — but I'm also teaching you how to read price when the model
isn't giving you a setup"*) without its *premise*. The caveat is what marks
abandoning a live bias mid-session as something ICT can do because he wrote the
concepts — an advanced manoeuvre, not a technique to copy off a 15-minute chart.
Dropped, the lesson reads as general method. Per the brief's own test, **a fourth
instance makes this a batch-M item rather than a per-lesson nit** (**H14** in
`p2-05` / `p2-06`, **K4** in `p5-02`, this).

**L16 · nit · `p6-02` and `p6-05` coverage — the same omission at two sites.** Both
lessons drop ICT locating his own material relative to the published model. `p6-02`
drops it twice (**L5**). `p6-05` drops the provenance of the afternoon material:
*"I gave you rules of engagement when you're trading the afternoon session, and
primarily what I gave you for the model was **a morning session idea** — but
because of other people asking me … I started bringing in some things"*
(ep38:460-468). The lesson keeps the technical consequence (*"The model … is a
scalping model"*, `:38`) and loses the editorial one. Two sites is not yet a
pattern, but it is the shape **L5** identified and the same author decision.

**L17 · nit · `p6-05` coverage** — **a hedge and a target dropped in one line.**
ep38:37-43: *"this is where we could potentially draw up to for our
**[intermediate] term** target, our objective — **but I'm not cosigning that just
yet.** Right here and here is enough."* The lesson's `:18` gives the two premium
arrays as the possible draw and carries neither the longer-term objective nor the
refusal to commit to it. (The transcript reads *"enemy term"* — the garble batch J
de-garbled three times — and `p6-05` sidesteps it by dropping the clause, which is
why `intermediate term` is 0/0 in Part 6.)

**L18 · nit · `p6-05` coverage** — **how wrong he actually was is left out.** The
lesson repeats *"4070 was never tagged"* three times (`:8`, `:18`, `:78`) and never
gives the day's low: *"it made a low of **4076 even** — didn't break out below the
fair value gap"* (ep38:977-980). Six points. That number is the measure of the
whole *"I was wrong and it didn't matter"* argument the lesson closes on, and the
one fact that makes it checkable.

**L19 · nit · `p6-05` coverage** — **the declined entry is dropped, and it is the
concrete case of a principle the lesson states abstractly.** ep38:1343-1357: the
first return into the 15-minute gap was a valid buy — *"am I still buying it there?
I could, I absolutely could do that, **but I'm not willing to**, because I want to
know that what I thought initially, which was 4070 — it could still wipe out that
low, **it's early on in the day**."* `p6-05:32` states *"narrative alone is not an
entry"* in general terms; this is the trade he passed on to prove it, and the answer
to the lesson's own agenda question about *managing* a bias rather than changing it.

**L20 · should-fix · FIXED · `p6-04` coverage** — **the live-money warning is dropped in
full, and it is the safety frame on the whole lesson.** ep37:71-85:

> *"if you're out here trying to gamble with live money — **which is what none of
> you should be doing** — if you're in here learning how to read price, that's why
> you're here … **months from now**, if you come to the conclusion that you think
> you've done well enough **on paper and then demo consistently**, if you decide to
> go into live trading **you've done that on your own — I've done nothing to
> instigate that** or try to get you to do it."*

Together with *"I try to be responsible as a mentor, try to protect you from
yourself"* (151-153), this is the reason the episode's second half is a *journaling*
method rather than a trading method. `p6-04` has ten quiz questions and eleven
callouts and none of them carries it. It is also the strongest Part 6 instance of a
category the audit has treated as content rather than housekeeping: ICT stating the
conditions under which the material may be used.

**L21 · nit ·
[p6-04/lesson.html:31](../content/s2-2022-mentorship/p6/p6-04/lesson.html#L31)** —
**a hedge dropped, partly covered by the modal that survives.** The lesson: NFP
Thursday and Friday *"can be choppy, sporadic, come back against you unexpectedly,
and lose a lot of their precision."* ICT adds a frequency claim the lesson does
not: *"**not all the time but most of the time** they lose their precision"*
(ep37:176-177). The repeated *"can be"* preserves the register, which is why this is
a nit and **L22** is not.

**L22 · should-fix · FIXED ·
[p6-04/lesson.html:50](../content/s2-2022-mentorship/p6/p6-04/lesson.html#L50)** —
**a timetable the source refuses to give, and `p5-02` keeps the refusal.** The
lesson: *"Do it for **weeks and months, certainly through the first year**, and you
will have built all of that pseudo experience."* ICT: *"and over time — **how much
time I don't know** — but when you do this for weeks and months, **maybe half a
year or so**, certainly by the first year of doing it, you will have tricked your
brain"* (ep37:637-645). Two qualifiers gone, and the consequence is cross-lesson:
`p5-02:54` carries the same teaching *with* its hedge — *"**No timetable.** 'You're
going to develop at your own pace and arrive at full understanding right on time.'
A couple of weeks for some, a year or longer for others"* — so a reader who takes
Part 5 then Part 6 is handed an open-ended process and then a one-year one. **This
is the only place the `p6-04` / `p5-02` cross-check comes back anything other than
clean.**

**L23 · nit · `p6-04` coverage** — **FOMC is never named beside NFP.** ICT
generalises the class explicitly: *"the reason why I tell everyone to avoid **big
days like FOMC** and Non-Farm Payroll weeks is because you don't have the
experience"* (ep37:145-149). `p6-04:26` keeps the generalisation in the abstract
(*"On big days precision drops precipitously"*), but every concrete example in the
lesson is NFP and its title says *"News Days"*. A reader meets FOMC in `p6-01` as a
*consolidation* week and never learns it belongs to the same avoid-class.

**L24 · nit ·
[p6-04/lesson.html:27](../content/s2-2022-mentorship/p6/p6-04/lesson.html#L27)** —
**two shorts reported as one.** *"The only setup I liked was obviously the short
**and the re-entry in addition to the short I did**"* (ep37:688-691). The lesson
gives one short, covered below the short-term low. Same shape as **L11** and much
smaller — the re-entry's figures are on the Twitter vignette, not in the episode, so
there is nothing to state beyond its existence.

**L25 · should-fix · FIXED ·
[p6-04/quiz.js](../content/s2-2022-mentorship/p6/p6-04/quiz.js)** —
**the worst-constructed quiz in the corpus, and it fails in a way no previous one
did: frequency without severity.** 80% strict-longest / 80% expected score beats
`p5-04` (75%) and `p4-01` (71%), yet its **median margin is 1.5** — the second
*narrowest* in Part 6. The mechanism is visible question by question: the correct
option is a compound statement carrying the claim and its reason, and the three
distractors are terse alternative actions.

| | correct option (chars) | longest distractor | margin |
|---|---|---|---|
| Q2 | Bullish until the high above is taken (37) | 36 | **+1** |
| Q3 | The rally left a fair value gap to fill (39) | 38 | **+1** |
| Q4 | Study the price action, don't trade it (38) | 31 | +7 |
| Q5 | To demonstrate why he avoids those days (39) | 37 | +2 |
| Q6 | Take no trades and just observe (31) | 29 | **+1** |
| Q7 | It repeats the daily shape at smaller scale (43) | 36 | +7 |
| Q9 | Negative or self-critical remarks (33) | 32 | **+1** |
| Q10 | They refuse to do the journaling work (37) | 36 | **+1** |

Five of the eight are longest by a **single character**, which is why §3's *"within
~5 characters"* rule passes here and the set still hands a knowledge-free guesser
80%: the rule bounds the *gap*, and a guesser needs only the *rank*. **This is
D15's conclusion in its sharpest form yet** — within-5 is necessary but not
sufficient — and the corollary is that `p6-04` cannot be fixed by shortening the
correct options, only by lengthening distractors. The author already knows how:
**Q1 and Q8 are the two non-longest**, and both got there by padding a distractor
(*"The close of the prior month extended"*, +1 over the answer; *"As an honest
record of what you missed"*, +7). The technique was applied twice in ten.

**Removing `p6-04` moves the part from 70/30/34 to 80/20/26** (n=54) — so Part 6's
headline figure is *not* an artefact of one lesson. Without its worst quiz the part
**beats Part 2** (84/16/29) on expected score and becomes the best-constructed part
in Section 2 outright; with it, it is still second. The improvement is 8 points,
against the 30 that removing `p4-01` bought Part 4 — which is the difference between
one bad quiz in a good part and one good quiz in a bad one.

**L26 · nit ·
[p6-05/quiz.js:11](../content/s2-2022-mentorship/p6/p6-05/quiz.js#L11)** —
**the widest single margin in the corpus.** Q10's correct option — *"Old buy-side
liquidity sat there, he could be wrong"* (51) — is **14 characters** longer than its
nearest rival (37), past `p4-04:Q4`'s 13. Two more in the same file are +8 and +7.
It is the one Part 6 question where the answer is unmistakable at a glance, and the
cause is that the option carries *both* halves of a two-part reason where §3 would
push the second half into `e`.

**L27 · nit · corpus-wide, for batch N** — **the `a` index is effectively a
constant, and it explains why the length rule was never exercised.** Measured
across all 80 files:

| | `a:0` | `a:1` | `a:2` | n |
|---|---|---|---|---|
| Section 1 quizzes | — | **136** | 9 | 145 |
| Section 1 exam | **45** | — | — | 45 |
| Section 2 quizzes | **305** | 1 | — | 306 |
| Section 2 exam | **40** | — | — | 40 |

**All 64 Part 6 questions are `a:0`**, as are 305 of Section 2's 306 (the lone
exception is `p1-02`). Section 1's quizzes are the mirror image: `a:1` for 136 of
145. This is **harmless to the reader** — §3's renderer Fisher-Yates shuffles the
options on every load, which is exactly why §3 tells the author not to manage
position — but it is diagnostic. With `a` fixed, the correct option is always
written *first*, so the author never once had to compare it against the three that
followed. That is the authoring habit behind **A10 → F14 → L25**, and it is a
single-pass fix worth naming in the cross-cutting sweep: vary `a`, and the length
imbalance becomes visible while writing.

**Instalment 2 — what came back clean, including two things expected to fail.**

- **All 22 quiz questions traceable** (10 + 12).
- **The `p6-04` / `p5-02` cross-check agrees, with one exception.** Both teach the
  same method from different episodes (ep37, ep27): annotate the old move, write the
  commentary **in the first person as though you saw it in advance**, keep it
  factual, re-read the journals **at the end of the week** — and the mechanism is
  the same, *tricking the subconscious* into **pseudo-experience**. `p6-04` adds one
  step `p5-02` does not carry (*never write anything negative*, sourced to
  ep37:622-632), which is an addition, not a conflict. The only divergence is
  **L22**'s timetable. Nothing else needs reconciling in batch M.
- **The rebalancing cross-check survives episode 38, and `p6-05` is the part's
  authoritative statement of it.** Part 6's five lesson-level mentions were checked
  against ep38:142-165. `p6-03:18` (*"a roll higher that rebalanced all of it"*) and
  its source ep36:70-73 describe **what one range did**, not what imbalances must do
  — and ICT says the same kind of thing twice himself in Part 6 (*"we completely
  rebalanced all that"*, ep35:291-292; *"the market comes back down in here and
  rebalances"*, ep38:289-291), which is exactly the *"there's times when that can
  occur"* half of his own position. `p6-05:24-26` states the differentiation
  explicitly and its quiz marks the absolute form wrong. **So there is no Part 6
  contradiction of ICT's differentiation** — the genuine contradiction the brief
  asked about turns out to be **cross-section**, against Section 1's summary and
  exam, and is logged as **L14**. `p6-07`'s two mentions are checked in instalment 4.
- **A K3-shaped self-correction, resolved the right way — the first since K3 went
  wrong.** ep38:1119-1131 is ICT correcting himself mid-figure: *"my fill 4110 and a
  quarter below that low — **whoops, I'm sorry, I'm doing the wrong one** — the low
  is **4110 and a half** … my candle of entry was here, the low was 4108 and a
  quarter and my fill was still below that, it's 4110 and a quarter, so **one
  quarter point below that**."* The un-corrected half (4108.25) makes the arithmetic
  impossible; the corrected half (4110.50) makes *"a quarter point below"* exact,
  and ICT restates it cleanly 270 lines later (*"I bought below that price 4110 and
  a half, I bought it at 4110 and a quarter"*, 1397-1399). `p6-05:55` prints
  **4110.25 below 4110.50** — the right half, checked against its own printed
  arithmetic, which is precisely the check **K3** failed.
- **An H1-shaped repair against the source's own word, and it is correct.**
  ep38:1157-1166: *"actually I was like **three seconds late** — I was waiting for
  it to give me a nice big candle … I sell the one contract and then it gives that
  little bit of a ramped-up expansion on the candle, so I'm like, ah, I just would
  have waited one more moment."* The word is *late*; the described event is selling
  **before** the expansion. `p6-05:70` writes *"a few seconds **early** of the
  expansion candle"*, following the sentence against the adverb. Same class of
  decision as **H1**, and this one goes the right way — the tell being that the rest
  of the sentence disambiguates the direction.
- **Position arithmetic reconciles exactly.** ep38:1135-1137's *"half the position
  cup up 10 contracts"* is garbled; `p6-05:68`'s reading — **half of ten** — is
  confirmed by the sum of the exits the lesson itself prints: 5 + 3 + 1 + 1 = 10.
  Two further silent corrections in the same passage (*"turtle suit"* → turtle soup;
  *"once twice"* → *"once it has left … it should never come back down"*).
- **Hedge test: ep38 is the best single episode in the batch — 9 of 10 kept.**
  `p6-05` keeps *"there's times when that can occur … not likely to occur most
  times"*, *"it may stall, it may fail, it may just consolidate"*, *"I could be
  wrong like I was wrong about 4070"*, *"I don't know yet"*, *"I could see myself
  stopped out if I'm premature"*, *"not in my opinion the preferred entry
  strategy"*, *"it might need Wednesday's trading"* and *"generally what will
  happen"*. Only *"I'm not cosigning that just yet"* is lost (**L17**). `p6-04`
  keeps *"sometimes they do pan out to script, **but not always**"* and *"I'm
  sometimes going to be wrong"* and loses two (**L21**, **L22**). Running total for
  the batch: **18 of 22 hedges reached the lesson; three of the four losses are
  quotation-internal or redundant and one (L22) is load-bearing.**
- **Editorial asides correctly declined.** Episode 38's longest single block
  (1029-1108) is the closed private group, *"I don't want your money"*, and a
  passage of non-trading commentary (*"it's going to get real hard, folks — read
  between the lines, the world's changing"*). None of it reaches `p6-05`, which is
  the right call under §1 and consistent with instalment 1's handling of the
  administrative material.

#### Instalment 3 — episode 39 (`p6-06`; 84 KB, the largest single transcript in Section 2)

**L28 · should-fix · FIXED ·
[p6-06/quiz.js](../content/s2-2022-mentorship/p6/p6-06/quiz.js)** —
**the I11 inverse distribution recurs, and this is the second-worst
proportionality case in the corpus.** Six questions for **84.1 KB** of transcript
is **14.0 KB per question**, behind only `p3-06`'s 19.1 — and it is the
**joint-lowest question count in Part 6 sitting on the part's largest source**,
while `p6-05` gets **twelve** questions on 52 KB. **C18**'s floor of four is not
breached, so the defect is the distribution, exactly as in Month 3 and Part 3. What
the six questions test: the midnight-open short, time-versus-price, the algorithm
not counting orders, the lunch-hour reprice, the five-point rule, and reading the
failing setup. What the lesson teaches and never tests:

- **the four times of day** (8:30 / 9:30 / 1:30 / 3:00–4:00) — the lesson's own
  spine, and the one thing ICT says he is doing (*"I'm taking you into specific
  times of the day"*, ep39:2182-2185);
- **the bearish breaker** definition, which the lesson gives in full at `:76`;
- **narrative before the open** — the lesson's opening section and its titular idea;
- **the PM checklist** (is the range expanding, reversing, counter-trending, or
  waiting on news?) at `:71-73`;
- **manual intervention / FOMC** and the Pac-Man boundary analogy at `:110-116`;
- **all four flip cards** at `:193-218` — model-must-fit-personality, back-testing
  as the cure for FOMO, stopping after a loss, taking a week off.

*Fix:* roughly **+4 questions**, all sourced from material already in the lesson.

**L29 · should-fix · FIXED ·
[p6-06/lesson.html:98](../content/s2-2022-mentorship/p6/p6-06/lesson.html#L98)** —
**the lesson's strongest negative claim is stated absolutely and ICT concedes the
opposite twenty lines later.** The lesson: *"This is why support and resistance is
a fallacy — anyone can find the level that worked in hindsight; picking it live,
consistently, is the problem."* Both halves are ICT's (ep39:991-1002). But ICT then
answers the obvious objection himself:

> *"I don't know why it's so hard for people to acknowledge when they are met with
> extreme adversities trying to force retail logic to work. **Can you make money
> with retail concepts? Yes. Yes you can — if you understand how to reprice like
> I'm teaching it.**"* — ep39:1199-1207

The concession is conditional, which is what makes it worth keeping: it converts
*"support and resistance is a fallacy"* from a claim about the levels into a claim
about the reasoning. Without it the lesson asserts something ICT explicitly
declines to assert, and a reader who has made money on levels is told the method
cannot work. Same family as **L21** and **L22** — a possibility qualifier removed —
but attached to the most categorical statement in the lesson.

**L30 · should-fix · FIXED · `p6-06` coverage** — **two rules from the son's model are
dropped, and both are the ones that stop him trading.** The lesson gives the model
in detail — the four times, the pattern, five points, one live trade — and omits
both of its brakes:

1. **The no-news-day risk rule.** *"I'm looking for days in my son's model where he
   can go in and engage price **when there is a medium or high impact news event**
   — or, if there is a lack of one, **he can practise but he shouldn't be engaging
   with his normal risk percentage**"* (ep39:1259-1268). The lesson keeps the
   calendar's *use* (`:118`) and not the sizing rule that depends on it.
2. **The no-setup rule.** *"I want to take him to the chart at a specific time of
   day with a specific logic in mind and then have him hopefully see a pattern
   that repeats — **it may not form that day he sits down, then he has to just move
   to the sidelines and do nothing**"* (ep39:856-866). This is the *"choice to say
   I don't see it today"* (867-869), and it is the counterpart to `p6-03`'s
   no-objective-no-trade — which `p6-03` does carry.

A reader gets the model's entries and its exit threshold, and neither of its
conditions for standing down.

**L31 · nit · `p6-06`, `p6-01` and `p6-05` — a systematic split, now at four
sites.** **The lessons keep ICT's *experience* claims and drop his *authorship*
claims, every time.** `p6-06:93` renders *"time and price — **when I wrote this
algorithm**, coding it, leans heavily on the time element"* (ep39:958-964) as
*"Algorithmic theory is based on time and price, and **the code** leans heavily on
the time element"* — the authorship elided to a definite article. Yet the same
lesson keeps *"three decades of experience acting as his internal dialogue"*
(`:160`, from ep39:895-899) without hesitation. The same split occurs in `p6-01`
(**L2**), twice in `p6-05` (**L15**), and again at ep39:1141-1146 (*"being in a
position where I have done a lot of the producing of these things and **the
authorship of it**"*, dropped).

Both readings are worth stating. **For the drop:** *"I wrote the algorithm that
delivers price"* is an extraordinary claim, and a course that repeated it in ICT's
register would be asserting it on the reader's behalf. **Against:** §1 governs what
may be *added*, not what may be *removed*, and this particular claim is the
epistemic basis of everything the framework asserts — dropping it silently
upgrades a personal thesis into an established mechanism. The lessons already state
the mechanism flatly (*"Price is delivered by an algorithm. There is no buying or
selling pressure"*, `p6-06:91`) with the authorship that motivates it removed,
which is the least defensible of the three available positions. Recorded as a nit
per site, carried to batch M as one item with **L15**.

**L32 · nit · `p6-06` coverage** — **the account numbers are left out, and the case
for leaving them out is real.** ICT gives them precisely: an equity low of
**$2,810** rising to **$18,300+** in about four weeks, *"about 400% return"*, on a
named broker, his son having started in the first week of May
(ep39:798-824, 1700-1708). `p6-06:155` gives only the model's arithmetic ($50 a
point, $250 a day, $1,250 a week). Against the omission: `p5-02:57` carries the
comparable figure ($100,000 → ~$354,000) including its losing trades, so the corpus
is inconsistent. For it: this is a **live account belonging to a family member**,
the broker asked for the statement to be taken down (ep39:791-797), and §1's
prefer-under-claiming applies with unusual force to a 400% claim. The lesson's
*"Not a promise"* callout (`:158-163`) does the protective work either way. Logged
so the decision is on the record rather than implicit.

**L33 · nit · `p6-06` coverage — and it does not reopen the closed pyramiding
verdict.** The mechanical scan found `pyramid` **0 times** in all of Part 6, which
the brief read as *"nothing to check"*. There is something to check: the word
appears in the **source**. ep39:1941-1949: *"I want to show you how you can still
many times take something off, and it might not hit your stop loss and then it
resumes going in your favour — and hopefully you can add those three contracts, or
whatever the portion would have been, back on **as a pyramiding type thing**."*
This is a *sixth* pyramiding site and a **new shape**: re-adding a portion closed
defensively, rather than building an initial position. It states **no ladder** and
**no size increase beyond the original position**, so it agrees with p2-06, p3-03,
p4-03, p5-01 and `summary.html` — *"biggest position first"* is untouched.
**The verdict stays closed**; the finding is that Part 6's one pyramiding statement
never reached a lesson.

**L34 · nit · `p6-06` coverage** — **the flip card has the principle and not the
demonstration.** `:209` teaches *"Stop. Don't rush to win it back."* ICT teaches it
from his own previous session, twice: *"yesterday I mapped out an idea on Twitter
and engaged and I took a loss — it was a five point loss … and in fact I called a
level later in the afternoon how I could have easily gained that back"*
(ep39:106-114), and *"I took a loss of five points yesterday, I could have easily
went back in and made four times that later in the afternoon … **I can, and I chose
not to**, because I want you to feel like okay, it's okay"* (1626-1642). He is
explicit about why he mentions it — *"am I saying it to beat my chest and sound
egotistical? No"* (117-119) — the point being that the person who *could* recover
it declines to. The lesson keeps the rule and loses the only evidence that its
author follows it.

**L35 · nit ·
[p6-06/lesson.html:91-93](../content/s2-2022-mentorship/p6/p6-06/lesson.html#L91)
and [:110-116](../content/s2-2022-mentorship/p6/p6-06/lesson.html#L110)** —
**the maximal form of the algorithmic thesis is dropped, and the lesson keeps only
its second clause.** ep39:1220-1234: *"**every tiny minute little fluctuation** in
these price movements are **absolutely controlled, engineered and premeditated** —
either by **AI, artificial intelligence** (that's the algorithm, it's following the
code that's been written for it), **or** there are times when **manual
intervention** comes in."* `p6-06` carries the manual-intervention half in full
(`:110-116`, with the FOMC example) and the thesis in a weaker general form
(`:91`), and never states the disjunction that makes manual intervention the
*exception* rather than an additional mechanism. Consequence: the Pac-Man analogy
reads as an illustration rather than as the first half of a two-part claim.

**Instalment 3 — what came back clean.**

- **All 6 quiz questions traceable**, and `p6-06`'s Q6 is the most demanding
  question in Part 6 — it asks the reader to reconstruct a four-step narrative read
  (multiple sell-side levels taken without movement → the up-close candle should
  have capped price → it didn't → next objective is buy side) from ep39:1880-1971.
  Its `e` reproduces the chain correctly.
- **The de-garbling is sound, and one correction is systematic across the whole
  episode.** ICT says **"470"** for 4070 at nine separate points (288, 292, 326,
  350, 435, 455, 588, 650, 2122) and *"4070"* correctly at four others (42, 486,
  660, 735); `p6-06` prints 4070 throughout. Also *"institutional overflow"* →
  institutional **order** flow (1913, reaching `:177` correctly), *"wealth of equal
  lows"* → relative equal lows (2104), and *"from ezekiel up to where it is now"*
  (1473) → *from the equity low* — a garble the lesson sidesteps by dropping the
  figures (**L32**). **Ten more silent corrections; running total across Parts 1-6
  now 49, all correct.**
- **The live-funds warning that `p6-04` dropped does reach the corpus, one lesson
  later.** ep39:126-136 states it as plainly as ep37 did — *"rush into trading live
  funds when **none of you are ready to do that yet** … you shouldn't be trading
  with live funds with these concepts **because you're still learning them**"* — and
  `p6-06:162` carries it. That does not retire **L20** (`p6-04`'s own source states
  it more fully, with the paper-then-demo progression, and `p6-04` is the lesson
  about deciding which days to engage), but it does mean the reader meets the
  warning inside Part 6.
- **Hedge test: 7 of 13 kept — the weakest episode in the batch, and the drops
  cluster.** Kept: *"you could reasonably pull out five points **if you have the
  experience** — you don't have that experience yet"*, *"I don't want any of you to
  think that you're going to make five points every single day"*, *"it might be a
  buy setup, not just a short setup"*, *"a little setup forms **most days of the
  week**"*, *"maybe it goes close to the stop loss and it doesn't hit it"*,
  *"sometimes you'll get it right, some days you won't"*, *"notice I'm **not
  promising you get rich**"*. Dropped: *"I'm not without imperfections"* (106),
  *"**typically**, if there's going to be a down day"* (321), *"it may not be the
  ideal learning conditions for everyone"* (917), the retail-concepts concession
  (**L29**), the no-setup rule (**L30**), and — **for the second time in this
  batch** — the no-timetable hedge: *"each one of you is gonna have a different
  timeline as to when you're gonna get it. **I don't have a deadline**"*
  (ep39:1789-1794). **That materially strengthens L22**: the hedge is present in
  *both* Part 6 sources that teach the learning curve (ep37, ep39), it is dropped
  in *both* Part 6 lessons (`p6-04`, `p6-06`), and it survives in the corpus only in
  `p5-02`. It is no longer one lesson's omission; it is Part 6's.
- **Editorial restraint, correctly applied, in the batch's most tempting episode.**
  Episode 39 carries ICT's disclosure of his bipolar diagnosis (700-707), his birth
  date and time (1316-1318), his subscriber-count goal (1591-1607), his cars
  (2246-2251), a passage on bosses and taxation (2217-2230), and a request for
  comments on a proposed daily video (2399-2438). None of it reaches `p6-06`.
  Given that the same episode is the source of the lesson's psychology material,
  keeping the coaching and dropping the personal disclosure is the correct line and
  the lesson holds it consistently.

#### Instalment 4 — episodes 40–41 (`p6-07`, `p6-08`; 101 KB, and the mentorship's final episode)

**L36 · should-fix · FIXED (at the summary site) ·
[p6-07/lesson.html:142](../content/s2-2022-mentorship/p6/p6-07/lesson.html#L142),
[:161](../content/s2-2022-mentorship/p6/p6-07/lesson.html#L161),
[p6-07/quiz.js:58](../content/s2-2022-mentorship/p6/p6-07/quiz.js#L58) and
[s2 summary.html:306](../content/s2-2022-mentorship/summary.html#L306)** —
**"protected lows" is the note-taker's phrase, not ICT's, and it has become a named
concept with a heading, a quiz question and a summary row.** Measured: the string
**"protected"** appears **zero times in all fourteen Section 2 transcripts** in and
around Part 6 (episode 37's single hit is *"protect you from yourself"*). It appears
once in the sources, in `ep-40.md`, in the note-taker's own emphasis:

> *"If the low already took SSL then the low doesn't need to get taken out. **This
> is why we put our stops at these lows… THEY'RE PROTECTED LOWS.**"*
> — `notes/2022-mentorship/ep-40.md`

ICT's own words for the same idea are *"trust that it's not likely to take that low
out"* (ep40:1101-1102) and *"it's already rebalanced this, there's no reason for it
to go down, it doesn't need to go down here"* (1155-1160). **The reasoning the
lesson gives is correct and fully sourced** — that is why this is not a fidelity
finding. What is wrong is the attribution: `p6-07` promotes the phrase to an `<h3>`
heading (*"Protected lows: buying before 9:30"*), states it in bold as a rule
(*"That is why stops go under those lows: they are protected lows"*), builds Q6
around it (*"What makes the low beneath such a setup a protected low?"*), and
`summary.html:306` carries it forward — so a note-taker's shorthand now reads as
ICT terminology in four places, including a section-level page.

**This is the first note-page coinage in the audit to reach a section-level page**,
and it is structurally the same propagation path as **E1 → F1** with the crucial
difference that the *content* is right. *Fix:* keep the teaching, attribute the
label — or state it in ICT's own formulation (*"a low that has already taken sell
side does not need to be taken again"*). Direct input to batch M.

**L37 · should-fix · FIXED · `p6-07` coverage** — **the six-rule bias procedure is
presented without the qualifier ICT attaches to it in the same breath.** `p6-07`
renders the keys to daily bias as six numbered `.callout rule` blocks. In the
transcript, Rule 1 arrives with two hedges attached:

> *"everyday bias is unrealistic … **notice I said that I'm not perfect** — some of
> you hold me up to this hero-level status and **I'm not a hero**, okay, I'm just
> somebody that knows what they're looking for … because I'm looking for a procedure
> and process that will lead to an outcome that **generally — not all the time, but
> generally — yields a specific result**."* — ep40:591-607

Neither reaches the lesson. The second is the qualifier on the whole procedure: six
numbered rules with no statement that they *generally* work read as a checklist that
does. ICT also repeats the register later — *"now you might be wrong, because
**sometimes I get it wrong**"* (ep40:658-659) — and that is dropped too. This is
the most consequential hedge loss in the batch after **L22**, because it attaches to
the lesson's central deliverable and to the topic ICT calls his most requested.

**L38 · nit · `p6-07` coverage — and the corpus already covers it, which is why it
is only a nit.** ep40 names two session windows and, uniquely in the corpus, draws
the forex/futures distinction explicitly: *"seven o'clock in the morning New York
time, that's the beginning of my ICT New York killzone — **it's extended to 10
o'clock in the morning when it's forex**, so 7 o'clock to 10"* (242-250), and *"the
New York AM session beginning here from 8:30 in the morning to 11 — **this is
specific to index futures** for the morning session"* (1011-1013). `p6-07` is the
corpus's only lesson that trades forex and index futures side by side and it gives
neither window, referring only to *"killzones intraday"* (Rule 6). Checked before
logging: **both windows are already stated at six other sites** — 7:00–10:00 forex
in `p1-03`, `p2-01`, `p3-04`, `p3-05` and `summary.html`; 8:30–11 index futures in
`p1-02`, `p1-03`, `p4-02`, `p6-08` and `summary.html` — and **all six agree**. So no
reader is deprived; what is lost is only the one place ICT says *why* the two
differ.

**L39 · nit ·
[p6-07/lesson.html:74](../content/s2-2022-mentorship/p6/p6-07/lesson.html#L74)** —
**a superlative that is the note's, not the transcript's.** Rule 2 closes *"That
gives the strongest bias."* `ep-40.md` says *"that will give you the **strongest**
bias"*; the transcript says *"I'm looking for the higher timeframe weekly to expand
in a specific direction — **that starts my bias**"* (ep40:766-770). *Starts* and
*strongest* are different claims about the same step. Sourced to the notes, so
permitted; logged because it is the second note-supplied wording in this one lesson
and §1 prefers under-claiming.

**L40 · nit · Part 6 coverage, consolidating L33** — **the sources carry three
pyramiding statements and the lessons carry none.** `pyramid` is **0** in all eight
Part 6 lessons; in the sources it appears three times — ep39:1941-1949 (**L33**),
ep40:1116-1119 (*"if you want to add, if you want to pyramid the position, you can
add that as it starts to run up higher"*) and ep40:1242-1246 (*"you can add in as
it's taking out this short term high — you can look for pyramiding
opportunities"*). All three are **re-adding or adding into strength**, none states a
ladder or a size increase beyond the initial position, so all three agree with the
closed five-site verdict (*biggest position first*: p2-06, p3-03, p4-03, p5-01,
`summary.html`). **The verdict stays closed.** The finding is that a technique the
corpus teaches five times elsewhere is invited three times in Part 6's sources and
declined every time.

**L41 · nit · `p6-07` coverage** — **the trade and the timeframe are both left
out.** ep40:1247-1260: *"well, I was in a **10-second chart** — I know some of you
were surprised when I said that … the market dropped down, I'm buying there … that's
the fill, that's the price **3741 and three quarters**."* `p6-07:164-166` gives the
three targets and reports all three hit, with no entry and no timeframe. The
10-second chart is the **lowest timeframe named anywhere in the corpus** and it sits
oddly beside `p6-05`'s *"the model … is a scalping model"* — which is exactly why it
is worth a line.

**L42 · should-fix ·
[p6-08/lesson.html:63](../content/s2-2022-mentorship/p6/p6-08/lesson.html#L63),
[:73](../content/s2-2022-mentorship/p6/p6-08/lesson.html#L73) and
[:150](../content/s2-2022-mentorship/p6/p6-08/lesson.html#L150)** —
**nine points is printed four times as the worked example and the source's
"not every trade" qualifier is dropped.** ICT is explicit:

> *"nine — that's the number of points required for the stop **for this particular
> trade. Not every trade is going to require a static nine-point stop.** Sometimes
> you can do a stop with five points — it's hard, **I'm not suggesting that you
> should be trying to do that** — but other trades are going to require you to do
> more than nine: might be 10, might be 12 points."* — ep41:1258-1269

The whole of `p6-08`'s position-sizing arithmetic ($100 ÷ 9 → $11 a point → two
micros → $90 risk → 2.25% return) hangs off that nine, and the lesson presents the
chain as a worked method without the sentence that stops nine becoming the constant.
It also loses the second half of the same passage — that at 2% risk the same trade
is **four micro lots at $20 a point** (1231-1246), which is the ladder's
*upward* case and the arithmetic a funded-account reader needs.

**L43 · nit ·
[p6-08/lesson.html:50](../content/s2-2022-mentorship/p6/p6-08/lesson.html#L50)** —
**the OTE band is stated as 62–70% here and as 62–79% in the other eight places the
corpus states it, and `p6-08` is faithful to its own source.** ep41:546 says *"a 62
to 70 retracement level, less than equilibrium"*; `p6-08:50` prints *"the 62% to
70% retracement"*. Every other site says 62–79 with 70.5 as the middle level:
`m1-04:26` (*"62%, 70.5%, 79%"*), `m1-05:14`, `m1-08:21`, `m1-04/quiz.js`,
`m1-05/quiz.js`, `s1 exam.js:35`, `s1 summary.html:80,267` and — one lesson earlier
— **`p6-05:59`** (*"buy the 62–79% retracement"*, from ep38:1298's *"pull your fib
up 62 to 79 level"*). So the two adjacent Part 6 lessons print different bands and
**each is correct against its own episode**. Not a fidelity finding; a consistency
one, and per §1 the resolution is to *note* rather than normalise — ICT almost
certainly said 70 for 70.5, but the audit cannot assert that. Batch N item.

**L44 · nit ·
[p6-08/lesson.html:143](../content/s2-2022-mentorship/p6/p6-08/lesson.html#L143)** —
**a distinction collapsed into a pronoun.** ep41:1221-1231: *"if it does you that
favour of protecting and limiting risk, it's your job **as the trader to listen to
the analyst** — next trade it provides, you'll have to manage the trade with less
risk."* The lesson: *"If the stop gets hit, it did you a favour. Your job then is to
listen to **it**."* The trader-versus-analyst split is ICT's own framing for the two
roles one person plays, and the substitution turns it into listening to the stop.
The actionable content (*less risk next trade*) survives intact, which is why this
is a nit.

**L45 · nit · `p6-08` coverage, and it makes L20 a Part 6 pattern** — **the
live-account warning is stated in a third Part 6 episode and dropped a second
time.** ep41:1380-1389: *"I knew invariably some of you are waiting there with a
live account ready to click a button because I've said something, so **that weighs
heavily on me** when I comment on Twitter … I just want you to be careful, okay?
**Do it in a demo, don't do it in a live account.**"* Plus ep41:1956-1968's warning
against speculating with live funds on a *"$50 account or a $100 account"*. Tally
for the part: the warning is in **ep37** (dropped by `p6-04`, **L20**), **ep39**
(kept by `p6-06`) and **ep41** (dropped by `p6-08`). Three sources, one lesson. It
is the most-repeated instruction in Part 6's sources and it reaches the reader once.

**L46 · nit · `p6-08` coverage** — **the escalation fantasy keeps its punchline and
loses its conclusion.** `p6-08:123` carries the doubling-up ladder (2% → 3% → 4% →
widen or remove the stop → 10% drawdown). ICT's version runs further and ends
somewhere the lesson does not: *"if I can do 3% risk and I get a multiple of five R
… I can make 15% in one trade, and what if I do that every day … morning session
and afternoon, and if I can do that why not lose sleep and trade London too — well
that's 45% in one day, good grief, I could probably quit my job next Sunday. **I did
that kind of stuff, folks. It doesn't work like that** … so you have to use **low
threshold objectives and work your way up from that**"* (ep41:1282-1306). The
low-threshold conclusion is the direct link back to `p6-06`'s five-point rule — the
same principle stated at the two ends of the part — and it is the sentence that
converts the anecdote into an instruction.

#### The `p6-07` / `p6-08` technique — F14's three, and a fourth that generates them

The brief asked what `p6-07` does that the others don't. Measured per question, it
uses **all three of F14's techniques** and rests on a fourth that the Section 1 exam
also uses but F14 did not name.

| `p6-07` | correct (chars) | longest distractor | margin |
|---|---|---|---|
| Q1 | Accept that a bias every day is unrealistic (43) | 43, 43, 43 | **0 — four-way exact tie** |
| Q2 | The direction the week is likely to reach for (45) | 49 | −4 |
| Q3 | High or medium impact events only (33) | 44 | **−11** |
| Q4 | There is no central measure of volume in forex (46) | 48 | −2 |
| Q5 | After an energetic London move and a retrace to its low (55) | 57 | −2 |
| Q6 | It has already taken sell side and rebalanced the gap (53) | 54 | −1 |
| Q7 | Risk on — a lower dollar makes it easier to rally (49) | 53 | −4 |

- **F14's technique 1 — whole-set parallel construction.** Every question runs its
  four options through one grammar: Q1 four verb-initial clauses about the bias, Q5
  four conditional clauses (*After… / Whenever… / Any day… / Once…*), Q7 four
  consequences for the S&P.
- **F14's technique 2 — deliberate exact ties.** Q1 is a **four-way tie at 43
  characters**, which is tighter than anything in the Section 1 exam (whose tightest
  was spread 0 on two questions).
- **F14's technique 3 — letting the correct option be the short one.** Six of seven,
  and Q3's answer is **11 characters shorter** than its longest distractor — the
  mirror image of `p6-05:Q10`'s +14 (**L26**), and the two extremes sit in the same
  part.
- **The fourth, and it is the generative one: every distractor is a wrong
  *mechanism*, not an absurdity.** Q4's three wrong answers are *"Because forex
  brokers must match every order"*, *"Because London close always reverses the
  move"* and *"To reset the daily range before the next session"* — each a
  plausible-sounding explanation, two of them built from the lesson's own vocabulary
  and wrong by over-generalisation (*always*) rather than by silliness. Compare
  `p6-04`, the corpus's worst set (**L25**), whose distractors are *"The data feed
  printed bad candles"* and *"The exchange filters noise out"*. **A plausible
  distractor naturally costs as many words as the answer**, so it produces the ties
  and the negative margins by itself. F14's three techniques are what this one looks
  like once applied; this is the instruction a fix pass actually needs — *write each
  distractor as a mechanism a reader could believe*, and the length metric follows.

`p6-08` uses the same recipe (86% not-longest, one tie, one +1 margin), which points
at the real explanation for Part 6's spread, and it is **build order**. Plan §7
built this part in three sessions, and the expected-score figures track them:

| build session (plan §7) | lessons | n | expected score |
|---|---|---|---|
| batch 13 (eps 34–38) | `p6-01`–`p6-05` | 44 | **41%** |
| batch 14 (ep 39) | `p6-06` | 6 | 33% |
| batch 15 (eps 40–41) | `p6-07`–`p6-08` | 14 | **12.5%** |

The two best-constructed quizzes in the corpus were written in the **last content
session of the whole build**, and the worst (`p6-04`, 80%) in the part's first. That
is a within-part, session-granular improvement, and it is the strongest evidence in
the audit that quiz construction is a **skill the author acquired during the build**
rather than a property of any part's subject matter.

**Instalment 4 — what came back clean, including one thing this instalment nearly
logged as a defect.**

- **All 14 quiz questions traceable** (7 + 7), and `p6-08`'s Q4 is the only question
  in the corpus that tests an *arithmetic* chain end to end ($10,000 → 1% → $100 ÷
  9 points → $11 a point → the E-mini's $50 fails → two micros).
- **Every figure in `p6-08`'s worked example reconciles.** 3805 objective
  (ep41:48), stopped out **plus two points** (66-67), entry **3754.75** a quarter
  below the candle's low (552-556), stop **3745.75** = **nine points** (558-563),
  first objective **3780.25** = **25.5 points** (574-582), *"better than two and a
  half"* (583), $100 ÷ 9 → **$11** (680-682), micro **$5** → **two** (695-703),
  **$90** risked (746-749), **$255** = **2.25%** (750-762), **22%** a month against
  a flat 20 (799-805), professional **12–15%** a year (811-813), the two-order case
  → **6.75%** in a day (876-886), funded target **10–15%** a month (989-993), the
  ladder **1% → 0.5% → 0.25%** with **50%** to be recovered (911-950), three losses
  = **1.75%** (1015-1017), competition leverage **3%–4.5%** (1407-1409), and the
  stop rules **50% → trim 25%**, **75% → break even** (1354-1381). The lesson even
  follows ICT's own rounding — *"what is that, 12 and three quarters points,
  something like that, let's round it to 12 and a half"* — printing *"about 12.5
  points"* rather than silently correcting 25.5 ÷ 2.
- **C9 gets its final answer, and it is the one batch K predicted.** Episode 40
  contains the **only currency-pair SMT reading in Section 2** and ICT states it as
  a **general rule**, in the **bullish** direction: *"if EURUSD had a high impact
  news event I would compare GBPUSD and EURUSD for correlation … if they both went
  down prior to the news event coming out for euro and **if GBPUSD failed to make a
  lower low, I'm buying GBPUSD**, because they're going to most likely move in
  sympathy with one another because they're **closely correlated**"*, with
  AUDUSD/NZDUSD given as a second instance (ep40:1310-1366). `p6-07:180-184`
  carries it in full, including *"relative strength leader"* (from 1320). So:
  **batch J's item (b) gets its strongest yes** — this is the second bullish SMT
  reading in Section 2 after `p5-03`'s and the **only one stated as a rule rather
  than as one trade**. But **C9 does not close.** The pairs here are *positively*
  correlated by ICT's own word; `m3-05`'s SMT is **DXY against a foreign currency**,
  which is *inverse*; and **`dxy` and `dollar index` appear zero times in all eight
  Part 6 transcripts** (mechanically confirmed). Every SMT reading in Section 2 —
  `p4-03`, `p5-03`, `p6-02`, `p6-05`, `p6-07` — is between positively correlated
  instruments. **C9 is a required rewrite of `m3-05` with no cross-reference
  available anywhere in the corpus.** That is the final answer on it.
- **The rebalancing cross-check closes clean, and `p6-07` uses ICT's own
  discriminating word.** `p6-07:39` says the algorithm comes back to **"overlap"**
  the one-sided move — which is ICT's word (ep40:403-407, *"come back up and
  **overlap** this down move and offer buyers an opportunity"*) and precisely not
  Laurie's *"fill all that area in"* (**L14**). `p6-07:160`'s *"the only fair value
  gap there had already been rebalanced"* is a description of one gap
  (ep40:1155-1158), not a rule. **All five Part 6 lesson mentions check out against
  ep38:142-165; there is no Part 6 contradiction of ICT's differentiation.**
- **The largest note page in Section 2 produced no structural defect — and one thing
  this instalment nearly logged as one is corroborated by Section 1.** `ep-40.md`
  (2532 B, structured with its own *"Keys to daily bias"* heading) was the brief's
  first real test of the thin-notes hypothesis *from the thick end*. Result: **zero
  H5 instances** — the family stays at three. It supplies *"protected lows"*
  (**L36**) and *"strongest"* (**L39**); the lesson correctly **declines** its one
  generalisation, following the transcript's *"crude oil inventory numbers … the
  loonie"* (ep40:513-524) over the note's flatter *"if there's a news event"*; and
  its one apparent addition turns out not to be one. The note says the three-bar
  swing *"gets confirmed when the 4th candle trades lower"*, which ep40's transcript
  does not state (162-164 stops at *"the next day I'm going to be expecting the
  market to trade lower"*) — **but the 3-candle swing with 4th-candle confirmation
  is an established Month 1 teaching**, stated at `m1-04:14`, `m1-04/quiz.js`,
  `m1-05:13`, `s1 exam.js:24` and `s1 summary.html:75`. So `p6-07:17`'s confirmation
  step is accurate, corpus-consistent and cross-section coherent. **Logged
  explicitly because the reading went the other way first**: the tell that a note
  line is an import is **D1/E1**'s (an attribution or date belonging to another
  teaching), not the mere fact that the day's transcript does not repeat it.
- **Hedge test: 11 of 17 across the two episodes.** ep40 keeps *"usually — not all
  the time but usually"* on the London close hour (`:52`, from 507-509), the
  *"waiting for the news … is a little bit more conservative"* framing and *"it
  takes a little bit more experience to find those setups and trust them"* (`:190`,
  from 288-294), and *"it may not have presented it"*'s substance; it loses
  **L37**'s two and *"I didn't look at the Australian dollar and the kiwi this
  morning"* (1333-1337). ep41 keeps *"one percent every single day is unrealistic …
  for a seasoned trader one percent average per day is really easy"* (`:96`),
  *"those numbers are achievable **but** you have to know what you're doing and how
  to weather drawdown"* (`:106`), *"don't let me give you static rules cast in
  stone"* (`:174`) and *"you may have short-term hardships"* (`:216`); it loses
  **L42**'s, *"I'm not 100% but I'm generally on par better than the average bear"*
  (1322-1325) and *"had I seen that I may have — I'm not going to go out on a limb
  and say absolutely"* (361-364).
- **De-garbling: seven more, all correct.** *"pull a shoulder block"* / *"bull
  shoulder block"* → **bullish** order block (ep40:959, 972 — the fifth and sixth
  instances of the *"shoulder block"* family in this batch alone), *"fair value gap
  with an **overblock**"* → order block (ep41:486), *"37 54 75"* → **3754.75**,
  *"37 45 0.75"* → **3745.75**, *"37 80 and a quarter"* → **3780.25**, *"38.05"* →
  **3805**, and the note's *"Forex is very **saleable**"* → **scalable**, confirmed
  by ep40:427-428. **Running total across Parts 1-6: 56, all correct**, thirty of them in this batch.
- **ICT's own count corroborates the plan's.** *"Technically there's 41 videos that
  make up this mentorship, so if you take away the introductory video it's basically
  **40** even"* (ep41:81-85). Section 2 is 40 lessons.

#### Batch L summary

| | |
|---|---|
| Lessons audited | 8 (episodes 34–41; **304 KB of transcript — the heaviest batch in the audit**, ahead of batch I's 291 KB and nearly 3× batch K) |
| Findings | **46** — 0 blockers, **13** should-fix, **33** nits |
| Fidelity findings | **3** (**L1**, **L11**, **L36**) |
| Quiz questions traceable | **64 of 64** |
| Fixed in flight | none (one *doc* repair: batch K's commit had deleted the `## Fixed in flight` heading) |

**The headline is that Part 6's weak dimension is the hedge — and for the first time
in the audit, three specific hedges are dropped at *every* site rather than at one.**
The raw ratio is mid-range: **36 of 52 hedges reached the lesson (69%)**, between
Part 4's 19-of-32 (59%) and Part 5's 42-of-55 (76%), and the per-lesson spread is
wide (`p6-05` keeps 9 of 10, `p6-03` 3 of 3, `p6-04` 2 of 4, `p6-06` 7 of 13). So
batch I's *"per lesson, not per part"* correction still holds on frequency. What is
new is the **recurrence**: three hedges appear in two or three separate episodes and
are dropped at nearly every lesson that could carry them. The **no-timetable** hedge
is present in ep37 *and* ep39 and is dropped
by both `p6-04` and `p6-06` (**L22**); the **live-funds** warning is in ep37, ep39
*and* ep41 and reaches only `p6-06` (**L20** + **L45**), and the **authorship
caveat** is in ep34, ep38 ×2 and ep39 and is dropped every time (**L2**, **L15**,
**L31**). Coverage — the weak dimension in Parts 1, 2, 3 and 4 — is otherwise
healthy: 33 of 46 findings are nits and the two heaviest lessons (`p6-05` at 52 KB,
`p6-08` at 52 KB) carry their sources almost completely.

**Findings per lesson, which is where the concentration shows:**

| Lesson | Ep | Transcript | Findings | of which should-fix |
|---|---|---|---|---|
| p6-01 | 34 | 17.3 KB | 3 | — |
| p6-02 | 35 | 15.9 KB | 7 | 1 |
| p6-03 | 36 | 8.8 KB | 2 | 1 |
| p6-04 | 37 | 25.1 KB | 7 | 4 |
| p6-05 | 38 | 52.4 KB | 8 | 3 |
| p6-06 | 39 | 84.1 KB | 8 | 3 |
| p6-07 | 40 | 48.7 KB | 6 | 2 |
| p6-08 | 41 | 52.1 KB | 5 | 1 |

`p6-04` is the batch's problem lesson on two independent counts: **four of the
thirteen should-fix findings** and **the worst-constructed quiz in the corpus**.
`p6-06` is second, and its issues are proportionality and absolutism rather than
omission.

**Option length, reported the D15/E19/F14 way (leading with F14's not-longest
column). All eight lesson figures reproduce the brief's exactly:**

| Lesson | not-longest | strict | expected | median margin | spread > 10 |
|---|---|---|---|---|---|
| **p6-01** | **100%** | 0% | **14%** | n/a | 14% |
| p6-02 | 89% | 11% | 17% | 4 | 22% |
| p6-03 | 67% | 33% | 33% | 4.0 | 17% |
| **p6-04** | **20%** | **80%** | **80%** | 1.5 | 10% |
| p6-05 | 58% | 42% | 46% | **7** | 17% |
| p6-06 | 67% | 33% | 33% | 1.5 | 0% |
| **p6-07** | **100%** | 0% | **4%** | n/a | 14% |
| p6-08 | 86% | 14% | 21% | 1 | 0% |
| **Part 6** | **70%** | **30%** | **34%** | **2** | **12%** |
| *Part 6 less p6-04* | *80%* | *20%* | *26%* | *3* | *13%* |

**E19's measurement caveat applies to two rows.** `p6-01` and `p6-07` have **no
strict-longest question at all**, so their median margin is **undefined** — printed
`n/a`, not 0, because a 0 would read as "longest by nothing" when the truth is
"never longest".

The brief asked three things of this table, and all three are answerable.

1. **The second-half decline hypothesis is dead, and Part 6's 64 questions kill
   it.** The series is **46 → 29 → 50 → 43 → 54 → 34**. Split it: the first half
   (Parts 1–3, n=140) averages **41%**; the second half (Parts 4–6, n=166) averages
   **43%**. Two points apart on samples of 140 and 166 is no difference at all.
   Batch I hypothesised a decline, batch K left it *"not confirmed but no longer
   contradicted"*; **it is now contradicted, and the arithmetic was against it all
   along.** What replaces it is better: the real structure is **build order inside a
   part**, not part order — see the session table in instalment 4, where Part 6's
   three build sessions run 41% → 33% → **12.5%**. Construction improved as the
   author wrote, and the part-level series is noise on top of that.
2. **`p6-05` does not overturn batch K's *"Part 4's severity problem was a Part 4
   problem"*.** Its median margin of 7 rests on **five** strict-longest questions out
   of twelve, with margins +1, +2, +7, +8 and **+14** — and the other **seven are
   shorter than their longest distractor**. Part 4's median of 6 came from a *broad*
   shift (40% strict, spread-over-10 at 24%, the correct option consistently longer);
   `p6-05` is three bad questions inside a set that is otherwise better than the part
   average. One lesson at margin 7 inside a part at margin 2 is variance with a
   nameable cause (**L26**: compound two-part reasons in the option instead of `e`),
   not Part 4's pattern. **Part 4 remains the outlier.**
3. **The two extremes of the entire corpus are eight lessons apart.** `p6-04` at
   80%/80% and `p6-07` at 0%/4% sit in the same part — and `p6-05:Q10` (+14) and
   `p6-07:Q3` (−11) are the corpus's widest margins in each direction. Part 6 is by
   some distance **the most bimodal part in the audit**; Part 4 was bimodal across
   two lessons, Part 5 uniformly mediocre.

**Quiz-count proportionality (D14/E18/I11/K), both denominators:**

| | KB of transcript per question | Questions per KB of lesson |
|---|---|---|
| Part 3 | 6.2 (failures at 10.8 and **19.1**) | — |
| Part 4 | 5.0 (worst 7.4 — passed) | 0.62 |
| Part 5 | 1.86 (worst 2.6 — passed both ways) | 1.03 |
| **Part 6** | **4.75** (worst **14.0**) | **0.77** |

Per lesson: 2.5 / 1.8 / 1.5 / 2.5 / 4.4 / **14.0** / 7.0 / 7.4 KB per question, and
0.91 / 1.29 / 0.98 / 0.97 / 0.78 / **0.45** / 0.65 / 0.56 questions per KB of
lesson. **`p6-06` is the only lesson that fails both denominators** and it is the
second-worst case in the corpus after `p3-06` — six questions on the section's
largest transcript, against `p6-05`'s **twelve** on 52 KB, which is the highest
question count of any lesson in the corpus. `p6-07` (7.0) and `p6-08` (7.4) are
above Part 4's worst on the transcript denominator but comfortably above `p6-06` on
the lesson denominator, so they pass. **C18**'s floor of four is not breached
anywhere. So the answer to the I11 question is **yes, the distribution is inverse to
the material again** — but at one site, not across the part, and **L28** lists the
+4 questions that fix it from material already in the lesson.

**Do the Part 1–5 conclusions replicate? All four, and the second one at its
strongest in the audit:**

1. **One episode per lesson prevents migration defects — replicates, sixth time,
   and Section 2 is now complete on it.** All eight `video.txt` files match their row
   in `s2-2022-mentorship-videos.md` on both halves (episode *and* lesson id), no
   lesson cites an episode number, and no claim in any Part 6 lesson traces to a
   neighbouring episode. **Forty Section 2 lessons audited, no leakage.** **L11** is
   the closest thing and it is not migration — two trades from the *same* episode
   merged behind one subject, the **K1/J1** shape.
2. **The transcript beats the notes — replicates, and the thin-notes hypothesis is
   now dead from both ends.** Batch J retired it on page *length*, batch K on page
   *existence*; batch L tests it on page *structure*. **`ep-40.md` is the largest
   note page in Section 2 (2532 B) and the only one with its own internal heading,
   and it produced no structural defect** — zero **H5** instances, one generalisation
   the lesson correctly **declined** in favour of the transcript's specific version
   (crude oil / the loonie over *"a news event"*), one superlative (**L39**), one
   coinage (**L36**), and one apparent addition that turns out to be an accurate
   restatement of a Month 1 teaching. Elsewhere `p6-02` declines the note's four
   extra SMT clock times in favour of the transcript's three (**L8**). **The H5
   family stays at three** (H5, p3-02, J2); **the K10 family reaches two** (K10,
   **L6**).
3. **The de-garbling is sound — replicates, 30 more times, all correct.** Ten in
   instalment 1, ten in instalment 3 (including a nine-site systematic *"470"* →
   4070), seven in instalment 4, plus instalment 2's arithmetic reconciliations.
   **Fifty-six across Parts 1–6.** The *"shoulder block"* → **bearish/bullish order
   block** family alone accounts for six of them in this batch. Two more
   **H1**-shaped sentence repairs went the right way (ep35's *"two — did you try to
   sell short"*, ep38's *"three seconds late"* meaning early), and — the batch's best
   single result — **a K3-shaped self-correction resolved correctly**: `p6-05:55`
   takes 4110.50 from the corrected half of ep38:1119-1131 and checks it against its
   own printed *"a quarter point below"*, which is exactly the check **K3** failed.
   No new declines-to-guess on figures; **one on a name** (ep34's Hannah/Anna, the
   second name-level decline after batch K's), against **one that went wrong**
   (**L13**, *"Chris Lorie"*).
4. **Hedges are dropped lesson-by-lesson, not by policy — replicates, fourth
   confirmation, but with the qualification above.** The per-lesson test still holds
   (`p6-05` 9 of 10, `p6-03` 3 of 3, `p6-04` 2 of 4, `p6-06` 7 of 13), so batch I's
   correction stands. What is new is that **three specific hedges recur across
   episodes and are dropped at every site**, which makes them part-level rather than
   lesson-level — and therefore batch-M items rather than per-lesson nits.

**What contradicts an earlier conclusion — four things, and the first is this
batch's own headline lead:**

- **The Chris Laurie lead was wrong on its central claim.** The brief called
  episode 38's passage *"a fourth source, fourth omission, still zero appearances"*
  and *"the corpus's most consistent omission"*. **`p6-05:26` carries the passage in
  full** — the differentiation, the *"not likely to occur most times"* qualifier, the
  nod, the no-business-relationship disclaimer. The grep returned zero only because
  the lesson spells the name **"Chris Lorie"** (**L13**). So the **B4 / H20 family is
  retired, not extended**: one appearance, in the one place the material is
  load-bearing. The lead's *second* and *third* tasks did pay out — see the next two
  items.
- **The E1 cross-check pays out at half the strength the lead claimed, and the
  distinction matters.** Episode 38 **does** corroborate **E1** independently, from a
  Section 2 source, in ICT's own words: he uses *liquidity void* and *imbalance*
  interchangeably and refuses to insist they fully rebalance, which is incompatible
  with `m4-11`'s *"absolutely no trading took place"*. But it **does not supply the
  replacement definition** — *"one side offered, the other not"* exists only in
  `m4-11`'s own transcript. So **E1/F1 can now be *justified* from Section 2 but
  still has to be *rewritten* from Month 4**; the shape of the fix is unchanged and
  its evidential basis is stronger. What *is* new is a defect **F1 did not record**:
  `summary.html:240` states the fill unconditionally where ICT explicitly refuses to,
  and `p6-05`'s own quiz marks the absolute form **wrong** — so **the built page
  grades a reader wrong in Section 2 for the position it teaches in Section 1**
  (**L14**). That is a live cross-section contradiction and it goes to batch M.
- **The rebalancing contradiction the brief predicted does not exist inside Part 6,
  and the real one is somewhere else.** All five Part 6 lesson mentions were checked
  against ep38:142-165 individually. Two describe what one range did (`p6-03:18`,
  `p6-07:160`) — and ICT says the same kind of thing himself twice in Part 6
  (*"we completely rebalanced all that"*, ep35:291; *"comes back down in here and
  rebalances"*, ep38:289), which is the *"there's times when that can occur"* half of
  his own position. `p6-05:24-26` states the differentiation explicitly. And
  `p6-07:39` uses ICT's discriminating verb — **"overlap"**, not *fill* — which is
  the whole distinction from Laurie. **No B12/C8 drift after six parts**; the
  contradiction is cross-section, and it is **L14**.
- **One of this batch's own readings was withdrawn mid-instalment.** `ep-40.md` adds
  a confirmation step the ep40 transcript does not state — *"this gets confirmed when
  the 4th candle trades lower"* — and `p6-07:17` follows it. That was on its way to
  being logged as a **K10** instance until the corpus check: the **3-candle swing with
  4th-candle confirmation is an established Month 1 teaching**, at `m1-04:14`,
  `m1-04/quiz.js`, `m1-05:13`, `s1 exam.js:24` and `s1 summary.html:75`. The note is
  accurate and the lesson is cross-section coherent. Recorded because it reconfirms
  the **D1/E1** tell: a note line is an import when it carries **an attribution or a
  date belonging to another teaching**, not merely when the day's transcript omits it.

**Two verdicts stay closed, as instructed — and both had something to check.**

- **Pyramiding — six sites, no drift.** `pyramid` is 0 in all eight lessons, which
  the brief read as nothing to check; but the *sources* carry three statements
  (ep39 once, ep40 twice) and all three are re-adding or adding into strength, with
  no ladder and no size increase beyond the initial position. They agree with p2-06,
  p3-03, p4-03, p5-01 and `summary.html`. **Do not reopen** — but **L33/L40** record
  that Part 6 declines the technique three times.
- **G10 / the four-way order block definition — no contradiction.** Part 6's 22
  order-block mentions were checked against the definition p2-02, p2-05, p2-06,
  p3-05, p5-01 and p5-05 agree on. `p6-02` (10 mentions) *extends* it with the three
  sensitive prices and the mean threshold and contradicts nothing; `p6-04`'s *"the
  down-close candle prior to the move up"* and `p6-07`'s three-candle bullish block
  are the same definition. **Closed.**

**Everything else that came back clean, stated so a fix pass does not hunt for it:**
8 of 8 video URLs verified on both halves; charts **18 / 18 / 18** on notes → `raw/`
→ `images/` with **all eight lessons carrying a live `.fig-slot`** (Part 6 is the
only Section 2 part with no chart-free lesson, so **K17**'s cosmetic family does not
extend here); **no duplicate question** (the **K11** grep's one hit, `p6-02` Q2/Q3,
is a definition and its implication); `intermediate term` **0/0**; `build.py` still
emits **zero warnings**; and nothing in `content/` was edited.

**Five items to batch N:**

1. **`intermediate term` — the table is now complete. Corpus total: 10 hyphenated /
   33 unhyphenated** (corrected from 7/29 by **N3**, which recounted across all 160
   files; the distribution claim below is unaffected), and the hyphenated form survives **only** in Section 1, Part 1
   and the section-level pages. Part 6 contributes 0/0. That is the final figure.
2. **The `a` index is a per-section constant** (**L27**): Section 1's quizzes are
   `a:1` 136/145, Section 2's are `a:0` 305/306, both exams `a:0`. Harmless at
   render (§3 shuffles) but it is the authoring habit behind **A10 → F14 → L25** —
   the correct option was always written first and never compared with the three that
   followed. A single pass varying `a` makes the imbalance visible while writing.
3. **The OTE band is stated two ways** (**L43**): `p6-08:50` has 62–70%, every other
   site (nine of them, including `p6-05:59` one lesson earlier) has 62–79% with 70.5
   as the middle level — and **each is faithful to its own episode**. §1 says note it,
   do not normalise.
4. **The H5 family closes at three** (H5, p3-02, J2) and the **K10 family at two**
   (K10, **L6**). Both are now fully measured across Sections 1 and 2 — no further
   sites exist to find.
5. **The Section 2 exam is the worse-constructed of the two exams**: 63%
   not-longest / 38% strict / **45%** expected against Section 1's 69% / 31% / 42%,
   with zero questions over spread 10 in both. Measured here so batch M starts from
   the number rather than deriving it.

### Section 2 roll-up — batches G–L

Section 2 is now fully audited on its lessons: **40 lessons, 306 quiz questions,
1.42 MB of transcript and 39 note pages read across six batches.** `summary.html`
and the 40-question `exam.js` remain, and are batch M.

**Findings: 140 across the six lesson batches** (Section 1's comparable figure was
72 across A–E, plus 11 for its summary and exam).

| Batch | Part | Eps | Lessons | Transcript | Qs | blocker | should-fix | nit | total | fidelity |
|---|---|---|---|---|---|---|---|---|---|---|
| G | 1 | 1–7 | 7 | 294 KB | 44 | — | 6 | 10 | 16 | **0** |
| H | 2 | 8–13 | 6 | 256 KB | 49 | — | 9 | 11 | 20 | 1 |
| I | 3 | 14–19 | 6 | 291 KB | 47 | — | 9 | 8 | 17 | 1 |
| J | 4 | 20–25 | 6 | 224 KB | 45 | — | 6 | 18 | 24 | 2 |
| K | 5 | 26–33 | 7 | 106 KB | 57 | — | 5 | 12 | 17 | 3 |
| L | 6 | 34–41 | 8 | 304 KB | 64 | — | 13 | 33 | 46 | 3 |
| **Total** | | **40** | **40** | **1.42 MB** | **306** | **0** | **48** | **92** | **140** | **10** |

**Zero blockers in forty lessons, and that is the single most important number in
this roll-up.** Section 1 produced three distinct blockers at four sites across 38
lessons (**C1**, **C2**, **E1**, plus **F1**'s propagation). Section 2 produced
none. Ten fidelity findings across 306 quiz questions and 40 lessons, none of which
inverts a definition, invents a mechanism or imports another teaching's example —
the four failure modes that produced every Section 1 blocker (**A2**, **C1**, **C2**,
**D1**, **E1**) do not occur once. **306 of 306 quiz questions traceable**, against
Section 1's 145 of 145 but with two of those testing an invented mechanism (**C2**)
and an inverted definition (**E1**).

**The structural reason is knowable and it is the build rule.** Section 2 was built
**one episode per lesson, no thematic re-cutting** (plan §1). Every Section 1 blocker
is a *migration* defect — material arriving from a neighbouring lesson, another
video, or a note page citing a different year. Section 2's 1:1 mapping removes the
mechanism, and the audit tested it six times, including once under the exact
structural condition that produced the Section 1 failures (Part 5's episode-number
offset, `p5-03` = episode 29). It held every time.

**Weakest dimension, per part. It moves, which is the useful part:**

| Part | Weakest dimension | Shape of it |
|---|---|---|
| 1 | **Coverage** | 16 findings, zero fidelity — the first clean-fidelity batch in the audit. Losses are material ICT states once and the lesson does not restate. |
| 2 | **Coverage, of one specific kind: hedges** | 18 of 20 findings are omissions and the four largest are qualifications (**H14**, **H19**). The best-constructed quizzes in Section 2 (84/16/29). |
| 3 | **The quiz** | First batch where content is not the weak dimension. 51/49/50 on option length, and **I11**: question counts run inverse to the material (`p3-06`, 19.1 KB per question). |
| 4 | **Coverage, but mildly — the real defect is quiz *severity*** | Highest nit share of any batch until L. Passes proportionality at both denominators, best hedge ratio to that point, but median margin **6** and spread-over-10 **24%** — the outlier in Section 2, still. |
| 5 | **The quiz, on two unrelated counts** | Best coverage in Section 2 (one load-bearing hedge dropped in seven lessons) and its worst expected score (54%), plus the audit's only **duplicate question** (**K11**). |
| 6 | **The hedge, at part level** | 31 of 62 kept — the worst ratio measured — and three hedges recur across episodes and are dropped at every site (**L20/L45**, **L22**, **L15/L31**). Second-best option-length figures in Section 2. |

**Option length across all six parts, final Section 2 figures:**

| | n | not-longest | strict | expected | median margin | spread > 10 |
|---|---|---|---|---|---|---|
| p1 | 44 | 66% | 34% | 46% | 3 | 2% |
| **p2** | 49 | **84%** | **16%** | **29%** | 2.0 | **0%** |
| p3 | 47 | 51% | 49% | 50% | 2 | 11% |
| p4 | 45 | 60% | 40% | 43% | **6** | **24%** |
| p5 | 57 | 51% | 49% | **54%** | 2.5 | 12% |
| p6 | 64 | 70% | 30% | 34% | 2 | 12% |
| **S2 quizzes** | **306** | **64%** | **36%** | **43%** | **3** | **10%** |
| S2 exam | 40 | 63% | 38% | 45% | 2 | 0% |
| *S1 quizzes* | *145* | *29%* | *71%* | *76%* | *4* | *26%* |
| *S1 exam* | *45* | *69%* | *31%* | *42%* | *1* | *0%* |

**Section 2's quizzes hand a knowledge-free guesser 43%; Section 1's hand them
76%.** That is the roll-up's second headline. Section 2 is **34 points better** on
the same metric, it is within one point of the Section 1 *exam* — the corpus's
best-constructed set until Part 6 — and every one of its six parts beats every one
of Section 1's four months. The worst part in Section 2 (Part 5, 54%) is better than
the best month in Section 1 (Month 3, 61%). **§3's "within ~5 characters" rule is
still necessary but not sufficient** — that is **D15**'s conclusion, confirmed a
fifth time by **L25**, where five of `p6-04`'s eight tells are longest by a *single
character* and the set still scores 80%.

**And the mechanism behind the improvement is now identified.** It is not the
subject matter and not the part: it is **build order**. Part 6's three build
sessions run 41% → 33% → **12.5%** in expected score, and the two best-constructed
quizzes in the entire corpus (`p6-07` at 4%, `p6-08` at 21%) were written in the
**last content session of the whole build**. Read against the part series
(46 → 29 → 50 → 43 → 54 → 34), which has no trend, the honest conclusion is that
construction quality tracked the author's accumulating skill in bursts rather than
smoothly — which is why batch I's *"second-half decline"* and batch G's
*"p1-01 is the best in the corpus"* were both wrong, and why the fix instruction is
a technique (**instalment 4**'s fourth: *write each distractor as a mechanism a
reader could believe*) rather than a target.

**The quiz-count verdict for the whole section: two failures in forty lessons.**
`p3-06` (19.1 KB per question) and `p6-06` (14.0) are the only lessons that fail
both denominators. **C18**'s floor of four is never breached in Section 2 — the
range is 5 to 12 — against **eleven of Section 1's 38 lessons** under-tested. Parts
1, 2, 4 and 5 pass outright; Parts 3 and 6 each have one site. Recommended
additions: **+4 for `p6-06`** (**L28**) and **+3 for `p3-05`** (**I11**), both from
material already in the lesson. (**N14**: this sentence named `p3-06`; I11 is filed
against `p3-05`, and batch I judged `p3-06`'s seven questions adequate.) Section 1 needed roughly **+18**.

**Four conclusions that replicated in all six batches**, and are therefore settled:

1. **One episode per lesson prevents migration defects.** Six for six; zero
   leakage in 40 lessons; the four Section 1 blocker mechanisms never recur.
2. **The transcript beats the notes.** Every conflict was resolved toward the
   transcript. The **thin-notes hypothesis is dead three ways** — page length (J),
   page existence (K) and page structure (L). The signal for a note-page import is
   **D1/E1**'s: an attribution or a date belonging to another teaching.
3. **The de-garbling is sound.** **56 silent corrections, all correct**, plus **three
   correct declines-to-guess** (ep12's *"14,500 points"*, ep16's *"the 45 32 the 45
   40 level"*, ep33's *"the robins leaderboard"*) and a fourth on a name (ep34's
   Hannah/Anna). Against that: **three repairs went wrong** — **H1** (`p2-01`, tell =
   a reversed verb), **K3** (`p5-03`, tell = a self-correction) and **L13**
   (`p6-05`, tell = a garbled proper name). Two of the three tells now have a
   successful counter-example in a later batch (**J**'s ep23 for H1's,
   instalment 2's ep38 for K3's); L13's does not, which is why names go to batch N.
4. **Hedges are dropped lesson-by-lesson, not by policy.** Batch I's correction
   holds at lesson level in all six parts. **Batch L adds the qualification** that a
   hedge recurring across several episodes can be dropped at every site, which makes
   it a section-level fix — three such hedges exist, all in Part 6.

**What feeds batch M** (`summary.html` + the 40-question `exam.js`, tested against
the lessons per the method note, not against the transcripts):

1. **L14 — the cross-section liquidity-void contradiction.** `p6-05`'s quiz marks
   *"imbalances always rebalance completely"* wrong; Section 1's `summary.html:240`
   and `exam.js:235-237` teach it. Batch M must check whether **Section 2's** summary
   states the void/imbalance relation, and in which direction.
2. **L36 — "protected lows" has already propagated to `summary.html:306`.** A
   note-taker's coinage carrying an `<h3>`, a quiz question and a summary row. It is
   the first note-page coinage in the audit to reach a section-level page, and batch
   M's natural job is to decide whether the summary keeps the label or the
   formulation.
3. **The three part-level hedges** — the authorship caveat (**L15/L31**), the
   no-timetable qualifier (**L22**), the live-funds warning (**L20/L45**). Each is
   stated in two or three episodes and dropped at every lesson site bar one. If the
   summary carries any of the three, that is where they can be restored once.
4. **The S2 exam already measures at 63/38/45** — worse than the S1 exam on all
   three columns. Batch F found Section 1's exam was its *best*-constructed set;
   batch M should expect the opposite relationship in Section 2, where the quizzes
   are already at 42%.
5. **Material batch L found the lessons carry inconsistently and the summary may
   arbitrate**: pyramiding (declined three times in Part 6's sources, taught at five
   sites elsewhere — **L33/L40**), the OTE band (**L43**), the two killzone windows
   (**L38** — six agreeing sites already), and the journaling method's overlap
   between `p5-02` and `p6-04` (**L22**).

**What feeds batch N**, on top of Section 1's carried items: the five listed in the
batch L summary above, plus **J24**'s two-site `.src` misuse at `p4-05:37,47`,
**K17**'s missing no-fig-slot comment in `p5-01`, **K11**'s duplicate-question grep
across all 80 files, and the naming question **L13** opens — every garbled proper
name in the corpus should be either verified or declined, never re-spelled.

### Batch M — Section 2, revision summary + final exam

Read in full: `content/s2-2022-mentorship/summary.html` (389 lines, **11 `<h3>` +
37 `<h4>` = 48 blocks**, **48** `.src` cross-references) and
`content/s2-2022-mentorship/exam.js` (**40** questions, 247 lines). Per the batch
method (and **F**'s precedent) the reference set was **all 40 Section 2 lessons —
430 KB, 3.5× batch F's 121 KB — read in full**, plus findings G–L. No transcripts
and no note pages were opened: every claim resolved against a lesson.

The reading load was budgeted in four instalments cut along the summary's own part
sections (p1+p2 / p3+p4 / p5+p6 / the five cross-cutting sections + all 40 exam
questions). It held; nothing had to be re-read.

**Headline, and it is the opposite of batch F's.** Batch F found that Section 1's
summary and exam were *the best-constructed content in the section* and that their
defects were **inherited**. Section 2's are the reverse on both counts: the forty
lessons produced **zero blockers**, and these two pages produce **two** — **M1**
(the midnight-open rule stated backwards, self-contradicting inside one sentence)
and **M2** (a confluence claim with no source in any of the forty lessons). Both
are **native defects**, present in no lesson. So the section-level pages are the
*only* place in Section 2 where the §1/§3 line is crossed, and after 140 findings
across six batches that is where the audit's first Section 2 blockers turn up.

**Three of the four headline leads came back the other way from the brief's
expectation, and one came back exactly as measured.**

- **The L14 lead resolves clean, in the summary's favour.** `liquidity void` is
  **0/0** across both pages (predicted), *and* all **14** `rebalanc*` occurrences
  are conditional or hedged — **not one states the fill unconditionally** (**M6**).
  So **F1 does not propagate into Section 2 in any form**, and the cross-section
  contradiction stays exactly what batch L said it was: S2 lessons against S1
  pages. What the summary does do is *drop* ICT's own differentiation, which is a
  coverage finding, not a fidelity one.
- **The exam-construction lead is right on the numbers and wrong on the
  diagnosis.** 62/38/45 reproduces to the digit. But the S1 exam is **42%** and the
  S2 exam **45%** — three points apart on n=45 and n=40, which is nothing. The S2
  exam is **not** the worse of the two; it uses **all three of F14's techniques at
  the S1 exam's own rate** (correct-option-shorter 45% vs 44%) **and batch L's
  fourth throughout** (**M13**). What produced F14's *"best in Section 1 by a wide
  margin"* was not the S1 exam's quality but **the S1 quizzes' 76%**. Section 2's
  quizzes are already at 43%, so there was no margin available to win.
- **The `summary.html:347` OTE reconciliation is real, deliberate and correct
  (M16)** — the first one in the corpus, and it closes **L43** at section level.
- **The cross-reference lead — the highest-yield mechanical check, and the one the
  brief expected to fire — did not fire.** All **48** resolve, the mixed
  relative/absolute scheme **never once mis-resolves a bare `(Ln)` to the wrong
  part**, and the *Fixed in flight* exception for dead cross-references stays
  unfired for the second and last time (**M7**).

Eighteen findings: **2 blockers, 8 should-fix, 8 nits.**

#### Content fidelity — the §3 "re-states the lessons" test

**M1 · blocker · FIXED ·
[summary.html:165](../content/s2-2022-mentorship/summary.html#L165) against
[p3-06/lesson.html:57](../content/s2-2022-mentorship/p3/p3-06/lesson.html#L57)** —
**the midnight-opening-price rule is stated backwards, and the sentence
contradicts itself two clauses later.** `p3-06` states the rule ICT was
specifically asked to clarify:

> *"**Midnight opening price is the price you preferably want to be buying
> below** when bullish. But if the midnight opening price is **lower** than where
> price is trading at or after **8:30**, it's likely not going to be a factor —
> **so you use 8:30**."*

The summary inverts the condition:

> *"If the midnight open sits **above** price around 8:30 on a bullish day it isn't
> a factor — **use the 8:30 open**; still below the midnight open after 8:30 means
> a **heavy discount**."*

Three things make this a blocker rather than a drift:

- **It reverses the instruction.** The lesson's case is *price already far above
  the midnight open*, so buying below it is unreachable and you fall back to 8:30.
  The summary's case is *price already below the midnight open* — which is
  precisely the case where the midnight open **is** the operative level.
- **It self-contradicts inside one sentence.** The second half of the same line
  says being *"still below the midnight open after 8:30"* is a **heavy discount** —
  i.e. meaningful. The first half has just said that condition makes the midnight
  open *"not a factor"*. This is **F1**'s exact shape (a self-contradiction inside
  a single cell, on the page designed for side-by-side revision), reproduced in
  Section 2 by a different route.
- **The correct half is verbatim.** *"still below the midnight open after 8:30
  means a heavy discount"* is `p3-06:58` word for word. So the block holds the
  right words and the reversed ones simultaneously — again **F1**'s shape.

*Scope, measured:* the correct formulation of the same rule is stated **three**
other times on the page and is right every time — `summary.html:152` (the FX
8:30/midnight tiebreak, `p3-04:52`), `:286` (*"you want to be buying at or below
the midnight open"*, `p6-05:39` / `p6-06:45`) and `:327`. So **the repair is one
clause, not a rewrite**, and the wording to paste into it already exists two lines
away. Nothing in `exam.js` tests it, so no exam question needs re-marking — which
is the one respect in which this is narrower than **F1**.

**M2 · blocker · FIXED ·
[summary.html:253](../content/s2-2022-mentorship/summary.html#L253)** — **"a gap
and a breaker together is a big confluence — likely to tap in and take off" is not
in any of the forty lessons.** Measured across all 40 lesson files: **"big
confluence" 0, "breaker together" 0, "and a breaker" 0, "take off" 0.** The block
carries `.src` **(L7)** = `p5-07`, whose confluence section
([p5-07:20-27](../content/s2-2022-mentorship/p5/p5-07/lesson.html#L20)) is four
conditions and **contains no breaker at all**:

> *break below the level → a fair value gap formed with that break → the next
> level breaks → and gets another fair value gap.*
> *"A confluence, not just one thing."*

`breaker` does appear in Section 2 — `p2-03:59-61` (the bearish breaker and where
its stop goes), `p6-04:8,12` (a gap that is *also* a breaker) and `p6-06:76` (a PM
bearish breaker) — but **none of the four pairs it with a gap, and none makes a
claim about what such a pairing is likely to do.** The summary is therefore
asserting a mechanism (*"likely to tap in and take off"*) and a probability grade
(*"a big confluence"*) that the course never states.

This is **C2**'s shape — an invented mechanism on a page that §3 forbids from
adding material — and it is graded the same way. It is narrower than C2 in one
respect (**no quiz or exam question tests it**, where C2's own quiz did) and
broader in another (**C2 was in a lesson; this is on the revision page a reader
reads last, immediately before the exam**). *Fix:* delete the clause, or restate
`p5-07`'s actual four-condition stack, which the same block already has room for.

**M3 · should-fix · FIXED ·
[summary.html:71](../content/s2-2022-mentorship/summary.html#L71) against
[p1-05/lesson.html:46](../content/s2-2022-mentorship/p1/p1-05/lesson.html#L46)** —
**the three-drives line waives the one condition the summary states 26 lines
earlier.** The summary: *"In **three drives**, the third need not clear the old
high, and **the pattern needs no high taken out before you look for entries**."*
The first clause is `p1-05:46` exactly. The second is not in it — and the lesson
says something close to the opposite:

> *"When three drives run up into an old high, that third high does not have to
> take the old high out. **Every time it makes a swing high and turns down, bears
> sell it and place buy stops above the previous high — and those keep getting
> taken.** The liquidity is already being built in."*

The lesson's point is that liquidity **is** being taken, just at the *previous*
swing highs rather than the old high. The summary's phrasing generalises that into
a blanket exemption from the liquidity condition — and
[summary.html:45](../content/s2-2022-mentorship/summary.html#L45) states that
condition as the section's central filter: *"Breaking a short-term high is
significant **only if** the run down before it traded into sell stops… **No
liquidity taken, no shift.**"* A reader revising from this page meets the rule and
its exemption six blocks apart. *Fix:* replace with the lesson's own reason — *the
buy stops above each previous drive are what get taken.*

**M4 · should-fix · FIXED ·
[summary.html:54](../content/s2-2022-mentorship/summary.html#L54)** — **a
break-even trigger and a term neither of which exists in the section, in place of
the rule the lesson gives.** The summary: *"Only once price has genuinely
**swing-mitigated your entry** does it go to **break even**."* Measured:
**`swing-mitigat` appears 0 times in all 40 lessons**, and **`break even` appears
in exactly one lesson — `p6-08`** (at
[:152-156](../content/s2-2022-mentorship/p6/p6-08/lesson.html#L152), a
*different* rule: 50% of the expected range trims the stop 25%, 75% takes it to
break even). The lesson this block summarises says something else again:

> *"Only once a **significant intermediate-term low** has been taken out can you
> roll the stop **down to it** — not before."* — `p1-06:64`

Three substitutions in one clause: an unsourced term for *intermediate-term low*,
*break even* for *roll the stop down to that low*, and a Part 6 rule imported into
a Part 1 block. The advice that survives (*don't roll the stop early*) is right and
is `p1-06:64`'s; the trigger and the destination are both wrong. This is the same
family as **M1** — a mechanism restated rather than re-stated — and the fix is the
lesson's own sentence.

**M5 · should-fix · FIXED ·
[summary.html:231](../content/s2-2022-mentorship/summary.html#L231) and
[:176](../content/s2-2022-mentorship/summary.html#L176)** — **two load-bearing
clauses attributed to the wrong part.** Neither reference is *dead* — both point at
real, topically-adjacent lessons — but a reader who follows either will not find
the line.

- **`:231`** carries the counter-trend warning *"**You can and will absolutely
  lose money trading this style.** Material for back testing, not live risk"* under
  `.src` **(L1, L2)** = `p5-01` / `p5-02`. Measured: the string *"absolutely lose
  money"* appears in **exactly one lesson — `p3-06:29`**, and the *"material for
  back testing, not for live risk"* half is `p3-06:29` too. `p5-02:31` says only
  that the displacement was *"counter-trend to the higher timeframe"*. The correct
  reference is **(P3 L6)**. This matters more than the average mis-citation
  because it is the **only unqualified you-will-lose-money warning on either
  page**, and it is the hedge attached to the one block that teaches trading
  against the bias.
- **`:176`** carries *"Lower USDCAD, higher S&P"* under `.src` **(L2)** = `p4-02`.
  It is `p6-07:174`. The correct reference is **(L2, P6 L7)**.

*Fix:* one span each. Recorded at should-fix rather than nit because in both cases
the cited lesson is topically right, so the error is invisible until a reader
actually goes looking — the failure mode **F12** was watching for, arriving by a
different route than predicted.

**M6 · should-fix · FIXED · the Part 6 L5 block
([summary.html:279-286](../content/s2-2022-mentorship/summary.html#L279))** —
**ICT's own differentiation on rebalancing is dropped, and this was the batch's
designated site for it.** `p6-05:26` carries the passage batch L identified
(**L14**), spelled *Chris Lorie*:

> *"Chris Lorie teaches **liquidity voids — that the market wants to come back and
> fill all of that area in**. **'I don't teach that. There are times when that can
> occur, but because I understand the algorithm, that is not likely to occur most
> times.'** … **the imbalance does not have to completely rebalance.**"*

The summary's `p6-05` block covers the bias abandonment, the narrative definition
and the lunch-hour cases, and **stops one section short of this one**. Measured
scope of what *is* there: **`rebalanc*` appears 9 times in the summary and 5 in the
exam, and every one of the fourteen is conditional** — *"returning into one to
rebalance it"* (`:12`), *"**every time price rebalances** an imbalance…"* (`:108`,
`exam.js:83-85`), *"a retracement **can** reach to rebalance the entire move"*
(`:220`, `exam.js:171`). **Not one states the fill unconditionally.** `p6-07`'s
discriminating verb **overlap** is **0/0**, and so is `liquidity void`.

So the good news is complete: **E1/F1's defect does not reach Section 2 at all**,
and the summary is not merely silent but consistently hedged. What is lost is the
positive teaching — ICT naming the position he *rejects* and why. Since **L14**
established that fixing **F1** means adding the *"not likely to occur most times"*
qualifier to `s1 summary.html:240`, and since that qualifier exists in Section 2's
own source, this block is the cheapest place to state it once for the whole
corpus. *Fix:* one line in the `p6-05` block.

#### The 48 cross-references — M7, and the failure mode that never fired

**M7 · nit — all 48 resolve; the mixed scheme never mis-resolves; five blocks
carry a clause no ref names.** This was the brief's highest-yield mechanical check
and the one place the *Fixed in flight* exception was expected to fire. It did not.

The scheme is genuinely two-tier, where Section 1's was one: **bare `(Ln)` is
relative to the enclosing `<h3>` part**, and cross-part refs are explicit
(`(P1 L4)`, `(P3 L5–L6)`, `(P6 L2)`, and the four-part `(L2, L5, L6, P3 L5–L6)`).
The predicted failure — *a bare `(Ln)` under the wrong `<h3>` resolving silently to
the wrong part* — **occurs zero times in 48.** Every bare reference resolves inside
its own part, and every explicit one resolves to the part it names. Spot-checks on
the four that looked most likely to slip all held:

| Ref | Sits under | Resolves to | |
|---|---|---|---|
| `(P3 L3)` at `:12` | *The one idea underneath everything* | `p3-03:72` — *"All the algorithm does… discount to premium and premium to discount… on the basis of time, then price"*, **verbatim** | ✓ |
| `(L4)` at `:99` | Part 2 | `p2-04:36-42` — the halos, and the Larry Williams attribution | ✓ |
| `(L2, L5, L6, P3 L5–L6)` at `:90` | Part 2 | `p2-02:29` (definition), `p2-05:52` (*the series, not the last candle*), `p2-06:41` (three ingredients), `p3-05:53` (*without the imbalance there is no order block*), `p3-06:34` (**the bookmark analogy — the block's only other distinctive claim**) | ✓ |
| `(L2, L4)` at `:233` | Part 5 | `p5-02:24-28` (the 9:30 / 12:10 / 1:30 table), `p5-04:15` (the lunch-lows rule) | ✓ |

The four-part reference at `:90` is the best-constructed one on the page and the
direct analogue of **F12**'s praised `(L3–L12)`: **five refs, five distinct claims,
each in the lesson named.**

What the check *did* find is a weaker version of the same thing — **five blocks
where one clause comes from a lesson none of the block's refs names.** Two are
load-bearing and are logged separately as **M5**; the other three are cosmetic and
belong here:

| Site | Clause | Actually from | Block's refs |
|---|---|---|---|
| `:24` | *"$20 on NQ"* and *"Not a scalping course: the model looks for a whole intraday leg"* | `p1-02:15`, `p1-02:19` | (L1) |
| `:38` | *"For indices the 1, 2 and 3-minute charts are where these show up"* | `p1-02:50` | (L6) |
| `:69` | *"London 2–5 am, New York 7–10 am, Asia 7–9 pm"* | `p1-03:50-53` | (L5) |

All three stay inside Part 1, so no reader is sent to the wrong part; they are
recorded because the same slippage in two other blocks (**M5**) crosses a part
boundary, and a fix pass should treat them as one class.

**M8 · nit — three of the 48 render in the wrong style (F11b, ×3).**
`engine/head.html:182` scopes the styling as `.lesson h4 .src`, so **45 of 48 get
the small dim uppercase treatment and 3 do not**:

- `:12` sits inside a `<span class="tag">` in a `.callout.rule` — it inherits the
  uppercase gold label and reads as part of it (*"ALL THE ALGORITHM DOES (P3 L3)"*).
  Exactly **F11b**'s single Section 1 instance.
- `:14` and `:15` sit inside `.kv` `<div>`s and get **no `.src` styling at all** —
  they render as plain body text at body size, which **F11b** did not have.

All three resolve correctly, so none is a dead reference and none is a *Fixed in
flight* item. Section 1 had one instance of this; Section 2 has three, and two are
of a new kind. Batch N item, alongside **J24**'s `p4-05:37,47` — which makes four
`.src`-placement sites in the corpus, all cosmetic.

#### Exam quality (review dimension 3)

**M9 · nit — every one of the 40 citations is correct, and dimension 3 is clean.**
Tabulated by reading all 40 questions, identifying the lesson each actually draws
on, and only then comparing that against the `(Part N, Lesson N)` label in its `e`
field:

**40 of 40 labels name the lesson the question actually tests.** Not one
mis-citation. This is the first question set in the corpus to score that — contrast
**C16** (four sites naming "the notes" for something the notes don't contain) and
**F9**, its only Section 1 instance outside a lesson. `"the notes"` appears **zero**
times in both Section 2 pages.

Dimension 3 is likewise clean: **every one of the 40 tests a claim the summary
states.** The nearest thing to an exception is **Q21** (the 11:30 rule), whose
claim appears only in the reference table at `summary.html:334` and not in the
Part 3 body — which still satisfies the rule. There is no **F6** here.

**M10 · should-fix · FIXED — Part 6 is under-sampled on all three denominators, and Part 1
over-sampled.** Running the **D14 / E18 / I11** proportionality test at exam level:

| Part | Qs | Lessons | Lesson KB | Summary KB | Qs/lesson | Qs/lesson-KB | Qs/summary-KB |
|---|---|---|---|---|---|---|---|
| 1 | **8** | 7 | 78 | 8.0 | **1.14** | **0.103** | 1.00 |
| 2 | 6 | 6 | 73 | 6.4 | 1.00 | 0.082 | 0.94 |
| 3 | 7 | 6 | 76 | 6.1 | 1.17 | 0.092 | **1.15** |
| 4 | 7 | 6 | 74 | 8.0 | 1.17 | 0.095 | 0.88 |
| 5 | 6 | 7 | 57 | 5.9 | 0.86 | 0.105 | 1.02 |
| **6** | **6** | **8** | **83** | **9.1** | **0.75** | **0.072** | **0.66** |

**Part 6 is the largest part on every measure of material — most lessons (8), most
lesson bytes (83 KB), largest summary section (9.1 KB) — and gets the joint-fewest
questions.** It carries 20% of the lessons, 20% of the lesson bytes and 21% of the
summary, and receives **15%** of the exam. Part 1 carries 17.5% of the lessons and
receives 20%.

This is the same shape **I11** found inside Part 3 and **E18** inside Month 4b, now
at exam level, and unlike **F8** — where Section 1's sampling tracked lesson count
to within 0.12 questions per lesson — it does **not** wash out. Recommended:
**+2 to +3 for Part 6**, from the untested material named in **M11**; nothing needs
removing elsewhere.

**M11 · should-fix · FIXED — ten lessons are uncited, and six of them are genuinely
untested.** Per **F8**'s mandatory caveat, a lesson absent from the citation labels
is not evidence it is untested; each of the ten was checked against what the 40
questions actually test.

**Four are defensibly untested:**

| Lesson | Why it is fine |
|---|---|
| `p1-01` | Mindset and contract arithmetic; the handle values reach `summary.html:342` but there is no rule to examine. |
| `p1-04` | *"no new theory, just Wednesday's and Thursday's trading"* — the lesson says so itself (`p1-04:8`). Its journal items are adjacent to **Q34**. |
| `p3-01` | 5 KB, no charts, a narrated trade with no new teaching. The audit's smallest lesson. |
| `p4-01` | Its risk-on/off half is examined by **Q22**; what is missing (the dollar-index bias for EURUSD/GBPUSD) is one clause. |

**Six carry a named, summarised rule that no question reaches:**

| Lesson | Untested rule | Summary site |
|---|---|---|
| **`p6-07`** | **The six keys to daily bias** — the topic ICT calls his most requested, given six numbered `.callout rule` blocks in the lesson and an 18-line block in the summary | `:291-300` |
| **`p6-05`** | **The definition of narrative**, and the evidence that justifies abandoning a bias | `:280-281` |
| **`p3-06`** | **When not to trade** — *"if you cannot reasonably outline where price is going next, you are gambling"* — plus **purge and revert** and **think in pairings** | `:163-169` |
| `p5-01` | The condition that makes a counter-bias long permissible (sell side taken **and** the downside objective reached) | `:229` |
| `p2-01` | Framing a cross from its component futures (euro strong + yen weak → EUR/JPY higher) | `:114` |
| `p5-05` | The trigger — three candles forming a swing high **inside** a five-minute gap | `:256` |

**The two the brief flagged both confirm, for different reasons than predicted.**
`p3-06` sits on the corpus's largest transcript (131 KB) and its *mean threshold*
and *dealing range* content **is** examined — by **Q35** and **Q36**, cited to
Part 6, which is why the citation grep missed it. What is untested is its
headline: the stand-aside rule. `p6-05` carries the corpus's highest question count
(12) and its narrative definition — the single most-quoted line in the Part 6
block — is examined zero times.

**The three worst gaps are all in Part 6**, which is exactly what **M10** predicts
independently, and the fix for both findings is the same 2–3 questions.

**M12 · nit — no duplicates; all three grep candidates rule clean, and a fourth
pair is a refinement.** Running the **K11** check on `exam.js`:

| Pair | Ruling |
|---|---|
| **Q5 / Q21** — *noon-to-one rule* vs *the 11:30 rule* | **Not duplicates.** Different times, different subjects (session structure vs order management), `e` fields share no content and cite different parts. The grep matched on *"what is the rule"*. |
| **Q16 / Q36** — *what makes an order block valid* vs *the mean threshold of an order block* | **Not duplicates.** Validity (an imbalance must follow) and internal geometry (50% of the candle) are unrelated claims from different parts. This is `p6-02` Q2/Q3's shape — a **definition-and-refinement pair**, and legitimate. |
| **Q21 / Q24** — *the 11:30 rule* vs *what is SMT divergence* | **Not duplicates.** A spurious grep hit; the two share no subject matter. |

A **fourth** pair the grep did not surface is the closest call on the page and also
rules clean: **Q5** (*"the noon-to-one hour"* → *no-trade period, not even in
demo*, `p1-05:32`) and **Q18** (*"the lunch-hour rule for a position that is
already open"* → *no new entries, but you can take profits*, `p3-03:61`). Both
concern the lunch hour, but **Q18 adds the exception Q5's answer does not carry**,
their `e` fields do not paraphrase each other, and they cite different parts. The
**K11** tell — two `e` fields that paraphrase each other — is absent from all four.
**`p5-05` Q3/Q4 remains the audit's only confirmed duplicate.**

**M13 · nit — the exam re-measured, and the brief's diagnosis needs correcting.**
Run the **D15 / E19 / F14** way (tie counted as *not* a tell per **C17**; margin
over the **second-longest** option per **D15**; leading with **F14**'s
not-longest column):

| | n | not-longest | strict | expected | median margin | **max margin** | spread > 10 | ties | correct **shorter** |
|---|---|---|---|---|---|---|---|---|---|
| **S2 exam** | 40 | **62%** | 38% | **45%** | 2 | **+2** | **0%** | 7 (18%) | 18 (**45%**) |
| S1 exam | 45 | 69% | 31% | 42% | 1 | +5 | 0% | 11 (24%) | 20 (**44%**) |
| S2 quizzes | 306 | 64% | 36% | 43% | 3 | +20 | 10% | 42 | 153 (50%) |
| S1 quizzes | 145 | 29% | 71% | 76% | 4 | +8 | 26% | 14 | 28 (19%) |

The brief's figures reproduce (62 vs 63 is rounding). But the two conclusions it
draws from them do not survive the comparison:

- **(a) "The S2 exam is no better than the S2 quizzes it examines" is true and
  uninformative.** 45% against 43% — but the S1 exam is **42%**, three points from
  the S2 exam on samples of 45 and 40. **Both exams sit in the same 42–45% band.**
  What made **F14** call the S1 exam *"the best question set in Section 1 by a wide
  margin"* was not that exam's quality; it was that **Section 1's quizzes hand a
  guesser 76%**. Section 2's quizzes are already at 43%, so the margin **F14**
  measured was never available here. The S2 exam is built to the S1 exam's
  standard and has nothing to beat.
- **(b) "The failure is `p6-04`'s shape, not Month 4's" — the premise is right and
  there is no failure.** The **maximum margin in the entire exam is +2** and the
  **maximum spread is 6** (Q30; 39 of 40 are within §3's ~5 characters). Checked
  against **F14**'s three techniques and batch L's fourth, **all four are present
  throughout:**

  1. **Whole-set parallel construction.** Q3's four options are four permutations
     of the same two candle references (*"Candle 1's low and candle 3's high" /
     "Candle 1's high and candle 3's low" / "Candle 2's open and candle 2's close" /
     "Candle 2's high and candle 3's close"*, spread **2**). Q26 runs four
     *"A sweep is X; a run is Y"* clauses (spread 3). Q39 runs four time quartets
     (spread **1**).
  2. **Deliberate exact ties.** 7 of 40 (18%), against the S1 exam's 24%. Q9, Q13,
     Q17, Q24, Q25, Q28 and Q32 are dead heats.
  3. **Letting the correct option be the short one.** **18 of 40 (45%)**, against
     the S1 exam's 44% — **the same rate**. Q30's answer is **6 characters
     shorter** than its longest distractor, Q22's 5, Q35's 5.
  4. **Batch L's fourth — every distractor a wrong mechanism, not an absurdity.**
     **No absurdity-distractor exists in the 40.** Q40's wrong answers are *"Two
     percent, to win the loss back"* (the exact anti-pattern `p6-08:123` names),
     *"The same one percent every time"* and *"Nothing at all for a whole week"*.
     Q6's include *"Five — the standard fractal drawn on MT4"*, a real competing
     definition the lessons name and reject. Q31's *"An outside day, **always**"*
     is wrong by over-generalisation, which is precisely the `p6-07` construction
     batch L praised. Nothing resembles `p6-04`'s *"The data feed printed bad
     candles"*.

So the 45% is not produced by any technique the exam is missing; it is produced by
**15 questions that are longest by exactly +1 or +2**. Converting those to ties or
inverting them is a one-character edit each, and would take the set to roughly
**18%** — better than anything in the corpus. That, not a technique, is the
instruction for a fix pass.

**Part-level, and it agrees with M10:** Part 6 is the exam's worst-constructed part
(67% strict, 67% expected, n=6) and Part 1 its best (25%/25%, n=8) — so **the part
that is under-sampled is also the part whose questions leak most**, and the +2/+3
recommended in **M10** would fix both.

**Not re-flagged:** every one of the 40 questions marks `a: 0` (mechanically
confirmed, 40/0/0/0), the same authoring template as the S1 exam. **D14/D15** and
**L27** settled that this is harmless — options Fisher-Yates shuffle at render time
(§3).

#### The carried-forward items the brief named

**M14 · should-fix · FIXED — the three part-level hedges: one is restored, two are absent,
and the summary is a viable single fix site for both.** Measured across both pages:

| Hedge | Sources | In the summary? |
|---|---|---|
| **The no-timetable qualifier** (**L22**) | ep37, ep39; kept by `p5-02:54`, dropped by `p6-04` and `p6-06` | **Yes — restored, verbatim.** `summary.html:261`: *"You're going to develop at your own pace and arrive at full understanding right on time."* |
| **The live-funds warning** (**L20** / **L45**) | ep37, ep39, ep41; reaches only `p6-06` | **No.** `live account` **0/0**, `live fund` **0/0**. `demo` appears 3× in the summary but always as a *substitute activity* (`:67` no trades in lunch even in demo, `:118` switch to demo after a big overnight run, `:289` the afternoon is demo if the morning made money) — never as *don't risk live funds while learning*. The nearest thing is `:231`'s *"material for back testing, not live risk"*, which is counter-trend-specific (and mis-referenced — **M5**). |
| **The authorship caveat** (**H14** / **K4** / **L15** / **L31**) | ep34, ep38 ×2, ep39 — five sources | **No.** `author` **0/0**. **Five sources, zero appearances anywhere in Section 2** — not in a lesson, not in the summary, not in the exam. |

So the answer to the brief is: **the summary already proves it works as a
single-fix site** — it restored **L22**'s hedge that two lessons dropped — and the
other two are one line each. The authorship caveat is the more consequential of
the two, because it is what marks abandoning a live bias mid-session (`p6-05`, the
`:279` block) as something ICT can do *because he wrote the concepts*. Its natural
home is that block, one line from **M6**'s.

**M15 · nit · FIXED — pyramiding: the sizing rule is carried, the placement rule is not,
and a third ladder is unreconciled.** `pyramid` appears **4 times in the summary
and 0 in the exam** (`:116`, `:117`, `:351`, `:367`). The five-site verdict
(*biggest position first*) stays **closed** — **L40** confirmed Part 6's sources
invite the technique three times and every Part 6 lesson declines it, and nothing
here reopens it. Two observations:

- **J's carried item confirms.** `p4-03:59-65` states a **placement** rule
  alongside the sizing one: the first fill goes *"at the largest part of the
  framework"*, the second *"at the next fair value gap"*, the third *"after a
  retrace into the bearish order block"* — *"it's not randomness, it's not
  willy-nilly, it's not flipping a coin."* **None of the summary's four mentions
  carries it**; all four are sizing only (*3 + 2 + 1*, *biggest first*, *never one
  then two then three*). A reader learns how big each add is and not where it goes.
- **A third ladder exists and the summary silently picks one.** `p2-06:59` and
  `p4-03:59-61` both run **3 + 2 + 1**; `p3-03:100` runs **five, then three, then
  two**. All three agree on the principle, so this is not a contradiction — but
  `summary.html:351` presents *"3 + 2 + 1"* as **the** rule in the
  numbers-to-memorise table, where the numbers elsewhere are exact. Batch N item.

**M16 · nit — `summary.html:347` is a deliberate, correct reconciliation, and it is
the first one in the corpus.** **L43** found the OTE band stated as **62–70%** at
`p6-08:50` against **62–79%** at nine other sites, each faithful to its own
episode, and left it as a batch N item on the reasoning that §1 permits noting but
not normalising. **The Section 2 summary has already done exactly the right
thing** — it carries both and flags the discrepancy in line:

- `:190` — *"0.62 & 0.79 — the **optimal trade entry** levels"* (`p4-03:81`)
- `:317` — *"Which is **also an optimal trade entry, 62–70%, below equilibrium**"*,
  inside the gold-standard setup (`p6-08:50`, verbatim)
- `:347` — *"**62–79%** | The optimal trade entry zone **(the gold-standard setup
  cites 62–70%)**"*

That parenthesis is the only place in either section where a known internal
discrepancy is disclosed to the reader rather than silently resolved, and it is
precisely the disposition §1 prescribes: *note it, don't normalise it.* **This
closes L43 at section level**, and it narrows the batch N item to a single
statement — **Section 1's pages carry no equivalent note**, and `s1
summary.html:80,267` and `s1 exam.js:35` state 62/70.5/79 with no mention that
Section 2 states it differently.

**M17 · should-fix · FIXED — "protected lows" (L36): the summary is where the label gets
fixed, and the fix is one clause.** `protected` appears **once in the summary
(`:306`) and zero times in the exam**. **L36** established the phrase is the
note-taker's coinage — **zero occurrences in all fourteen Part 6 transcripts**,
one occurrence in `ep-40.md`, in the note-taker's own emphasis — while **the
teaching it labels is fully sourced** (`p6-07:159-161`, from ICT's *"it's already
rebalanced this, there's no reason for it to go down"*).

The summary states it as settled terminology: *"A low that already took sell side
needn't be taken again — **those are protected lows, and that is where stops
go**."* Of the three dispositions **L36** offered, **the third is available at no
cost here**, because the summary row already contains ICT's own reasoning in the
clause immediately before the label. *Recommended:* drop the coinage and let the
sourced sentence stand, or keep it with an attribution. The exam does not use it,
so **the summary and `p6-07` are the only two sites** — down from L36's four, since
`p6-07`'s `<h3>` and quiz question are the other two.

**M18 · nit — `intermediate term`: the section-level half of the corpus tally
confirms.** Batch L's table is complete at **10 hyphenated / 33 unhyphenated**
(**N3**'s recount; M18 published 7/29), and
**4 of the 7 are on these two pages**: `summary.html:102,108` and
`exam.js:84,85`, all hyphenated; `intermediate term` unhyphenated is **0/0** here.
So batch L's finding holds exactly — the hyphenated form survives **only** in
Section 1, Part 1 and the section-level pages, and this batch confirms the
section-level half. Nothing to fix in this batch; batch N normalises.

#### What does *not* propagate — checked explicitly

Recorded in batch F's shape, because it tells a fix pass which of Section 2's **48
should-fix and 10 fidelity findings** need a page edit and which do not. **The
answer is: almost none of them.**

| Finding | Reaches summary/exam? | |
|---|---|---|
| **E1 / F1** — liquidity void defined as its opposite | **No, in any form.** `liquidity void` **0/0**; all 14 `rebalanc*` occurrences conditional or hedged (**M6**). Section 2's pages are clean on the corpus's only surviving blocker. | ✓ |
| **L14** — the cross-section contradiction | **Not created here.** The summary neither asserts nor denies the unconditional fill; it drops the teaching (**M6**). The contradiction stays S2-lessons-vs-S1-pages. | ~ |
| **L36** — "protected lows", the note-taker's coinage | **Yes**, one row (**M17**). The first note-page coinage in the audit to reach a section-level page — confirmed, and the content is right. | ✗ |
| **L43** — the two OTE bands | **Yes, and correctly reconciled in line** (**M16**). The only disclosed discrepancy in the corpus. | ✓✓ |
| **L15 / L31 / H14 / K4** — the authorship caveat | **No.** `author` **0/0**. Five sources, zero sites anywhere in Section 2 (**M14**). | ✗ |
| **L20 / L45** — the live-funds warning | **No.** `live account` / `live fund` **0/0** (**M14**). | ✗ |
| **L22** — the no-timetable qualifier | **Yes — restored verbatim** at `:261`, after `p6-04` and `p6-06` both dropped it (**M14**). The one hedge the summary repairs. | ✓ |
| **L33 / L40** — pyramiding | **Yes, sizing only.** The closed five-site verdict is stated correctly; `p4-03`'s placement rule is not carried (**M15**). | ~ |
| **L38** — the two killzone windows | **Yes, and correct.** `:148-149` gives FX 7:00–10:00 and index futures 8:30–11:00 separately, `:329-331` repeats both — agreeing with all six existing sites. `p6-07`'s explanation of *why* they differ is still absent, as **L38** noted. | ✓ |
| **L25** — `p6-04`'s option-length shape, the corpus's worst | **No.** The exam's max margin is **+2** and max spread **6** (**M13**). Nothing resembling `p6-04` reaches it. | ✓ |
| **K11** — the duplicate question | **No.** Four candidate pairs checked, all rule clean (**M12**). | ✓ |
| **C16 / F9** — "the notes" cited for something the notes lack | **No.** `"the notes"` **0/0**; 40 of 40 exam citations correct (**M9**). | ✓ |
| **F6** — an exam question testing something the summary omits | **No.** All 40 are present in the summary (**M9**). | ✓ |
| **F7** — the summary miscounting its own exam | **No.** `summary.html:385` says *"40 questions across all six parts"*; `exam.js` holds **40**. Section 2 gets right what Section 1 got wrong. | ✓ |
| **I11 / E18** — question counts running inverse to the material | **Yes, at part level** (**M10**): Part 6 is largest on every measure and joint-lowest on questions. | ✗ |
| **F11b** — `.src` outside `<h4>` | **Yes, ×3**, two of a new kind (**M8**). | ✗ |

**Two Section 1 defects that Section 2 fixed by construction**, worth stating
because they were the leads: **F7**'s stale question count and **F6**'s
summary/exam mismatch are both absent, and **F8**'s citation-label caveat did not
need invoking once because all 40 labels are right.

#### Consistency — clean

- HTML is **well-formed**: checked mechanically over all 389 lines — **zero**
  unclosed elements, **zero** mismatched closers, tags balanced.
- `id="s2-review"`, `data-kind="review"`, `data-section="s2"` and the
  `<div class="review-footer"></div>` slot are all present and correct per §3.
- The exam page is generated by `build.py` from `section.js`, so there is no
  `exam.html` to drift, and the hand-written count at `:385` agrees with it (40).
- `python build.py` reports *"78 lessons, 67 image sets, 78 quizzes, 4 review
  page(s) across 2 section(s)"* with **zero warnings**, and `python verify.py`
  passes: *"78 lessons, 339 images, 78 video links, 451 quiz questions, 2 summary
  page(s), 85 exam questions across 2 exam(s), 0 JS errors."*
- **Nothing in `content/` was edited in this batch.** The *Fixed in flight*
  exception for dead cross-references never fired (**M7**), so that section still
  holds one entry.

#### Noted, not a finding

**The nine-step "checklist before any trade" (`:357-368`) is a synthesis with no
single lesson behind it, and every step traces.** Checked individually, exactly as
batch F checked Section 1's: draw → `p1-02:23`; weekly and daily bias →
`p6-07:73`, `p3-06:40`; right time → `p6-06:127-130`, `p2-03:17`; liquidity taken →
`p1-03:19`; displacement → `p1-05:49`, `p1-06:45`; gap inside the leg →
`p1-06:47`, `p2-03:56`; premium or discount → `p1-02:64-66`, `p4-06:45`; stop and
target → `p1-02:57`, `p3-04:55`; risk → `p4-01:46`, `p6-08:72-77`. §3 bars new
*material*, not new *arrangement*, and the page's own `desc` says *"re-ordered"* —
so this is inside the rule. Same disposition as **F**'s.

**The same applies to "What the mentorship keeps warning you about"
(`:370-383`).** All nine warnings trace — `p1-02:58`; `p6-04:30`; `p1-05:32` +
`p4-04:41`; `p4-06:23` (verbatim); `p6-03:27`; `p2-05:38`; `p6-08:113-123`;
`p4-06:65`; `p6-04:51` (verbatim, *"If you fail under my tutelage, it's because you
don't do this"*). Five of the nine are the lesson's own phrasing rather than a
paraphrase.

**"The times worth memorising" (`:325-338`) checks out row by row**, which is the
**F13** analogue and the block the lead would have called highest-risk. All eleven
rows trace: midnight `p4-02:31`; 2–5 am `p1-03:50`, `p4-01:19`; 7–10 am `p3-04:34`;
8:30 `p2-03:17`; 8:30–11 `p3-04:35`; 9:30 `p4-02:47`; 10–11 `p6-07:52`; 11:30
`p3-05:66`; noon–1 `p1-05:32`; 1:30 `p6-06:129`; 3–4 pm `p6-06:130`. **No drift of
the summary's own** — and the only number on the page that is wrong is not in this
table but in **M4**'s stop rule, which is not a time at all.

**"The numbers worth memorising" (`:340-355`) — thirteen rows, twelve correct.**
The exception is `:351`'s *3 + 2 + 1*, discussed at **M15**, which is correct for
two lessons and silently overrides `p3-03:100`'s 5-3-2. One row deserves a note
rather than a finding: *"1 handle — four ticks, **$5** on the micros"* (`p1-01:46`)
is the micro **ES** figure; `p2-06:62` gives the micro **NQ** at **$2 a point**.
Both lessons are right; the summary's unqualified *"the micros"* generalises the
ES one. `p4-06:51` and `p6-08:75` both say $5, so the summary follows the
three-to-one majority — recorded for batch N, not logged as a finding.

**`content/s2-2022-mentorship/section.js` was checked for the stray-semicolon
hazard `CLAUDE.md` §3 warns about and is clean**, unlike Section 1's. `build.py`
and `verify.py` pass either way.

**Corrections to this batch's own scoping estimates.** The summary has **48**
`<h3>`/`<h4>` blocks and **389** lines; the brief's eleven-section table is
correct. The `.src` count of 48 is exact.

#### Batch M summary

| | |
|---|---|
| Pages audited | 2 (`summary.html` 52.0 KB, `exam.js` 21.0 KB) |
| Reference set | **all 40 Section 2 lessons, 430 KB — 3.5× batch F's** |
| Findings | **18** — **2 blockers**, 8 should-fix, 8 nits |
| Fidelity findings | **2** (**M1**, **M2**) — both native, neither inherited |
| Cross-references | **48 of 48 resolve**; 0 dead; 0 mis-resolved by part |
| Exam citations | **40 of 40 correct** — the first clean set in the corpus |
| Exam questions traceable | **40 of 40**, and all 40 present in the summary |
| Fixed in flight | none |

**Weakest dimension: content fidelity — and that is the first time it has been the
weakest dimension since batch C.** Across G–L, fidelity was Section 2's *strongest*
dimension in every part (10 fidelity findings in 306 questions, zero blockers).
These two pages reverse it: 2 of 18 findings are fidelity, both are blockers, and
**both are native**. Coverage and quiz construction — the weak dimensions in every
Section 2 lesson batch — are the strong ones here.

**The contradiction of an earlier conclusion, stated plainly.** The Section 2
roll-up's headline was *"zero blockers in forty lessons, and that is the single
most important number in this roll-up"*, with the structural explanation that
**one episode per lesson removes the migration mechanism** that produced every
Section 1 blocker. **That explanation survives and is in fact reinforced: both of
this batch's blockers arise precisely where the 1:1 mapping does not apply.** A
summary is by construction a *many-episodes-to-one-page* artefact — the same
re-cutting operation that produced C1, C2 and E1 in Section 1. **M1** is a rule
carried across from one lesson and inverted in transit; **M2** is a claim
assembled from two lessons' vocabulary that neither makes. So the roll-up's
conclusion should now read: *one episode per lesson prevents migration defects **in
lessons**, and the section-level pages are the one place in Section 2 where the
mechanism still operates.* That is a strengthening, not a retraction — but the
roll-up's "zero blockers" headline was about the lessons and must not be quoted as
being about Section 2 as a whole.

**Three of the brief's four headline leads came back differently than framed** —
recorded because saying so has been the useful part every batch:

1. **The exam is not "the worse of the two exams."** 45% vs 42% on n=40 and n=45 is
   noise. **F14**'s "wide margin" was a fact about Section 1's *quizzes*, not about
   its exam (**M13**).
2. **The cross-reference check, named the highest-yield mechanical check in the
   batch, found nothing dead and nothing mis-resolved** in 48 spans across a
   two-tier scheme (**M7**). What it found instead was five clauses sourced outside
   their block — a weaker, different defect.
3. **`summary.html:347` had already resolved L43 correctly**, as the brief
   suspected (**M16**), and it is the only such reconciliation in the corpus.
4. The one that landed exactly as measured: **the three part-level hedges** —
   one restored, two absent, `author` and `live account` both **0/0** (**M14**).

**What a fix pass should do with these two pages**, in order of cost:

- **Two one-clause blocker repairs.** `:165` (paste the correct condition, which
  `:286` already states) and `:253` (delete, or restate `p5-07`'s four conditions).
- **Four one-line should-fix repairs.** `:71` (**M3**), `:54` (**M4**), two `.src`
  spans (**M5**), and one clause for **M17**.
- **Three one-line additions**, all with the source already in Section 2:
  ICT's rebalancing differentiation (**M6**), the authorship caveat and the
  live-funds warning (**M14**).
- **+2 to +3 exam questions for Part 6**, drawn from `p6-07`'s six keys, `p6-05`'s
  narrative definition and `p3-06`'s stand-aside rule — which fixes **M10** and the
  three worst gaps in **M11** at once.
- **15 one-character option edits** to take the exam from 45% to roughly 18%
  (**M13**). Optional; the set already passes.

### Disposition of the whole audit going into batch N

Twelve lesson batches and two page batches are complete: **78 lessons, 451 quiz
questions, 2 summaries, 85 exam questions, ~2.4 MB of transcript and 78 note
pages.** Batch N — the cross-cutting sweep — is the last.

**Findings: 241.** 83 in Section 1 (A–F), 140 in Section 2's lessons (G–L), 18
here.

| | Lessons | Pages | blocker | should-fix | nit | total |
|---|---|---|---|---|---|---|
| Section 1 (A–F) | 38 | 2 | **4** | 37 | 42 | 83 |
| Section 2 (G–L) | 40 | — | 0 | 48 | 92 | 140 |
| Section 2 (M) | — | 2 | **2** | 8 | 8 | 18 |
| **Total** | **78** | **4** | **6** | **93** | **142** | **241** |

**Closed, and not to be reopened:**

- **The pyramiding verdict** (*biggest position first*, five sites) — closed at
  **L40**, confirmed here (**M15**). Only the placement rule remains open, as a
  coverage item.
- **The thin-notes hypothesis** — dead three ways (J, K, L). The reliable signal for
  a note-page import is **D1/E1**'s: an attribution or a date belonging to another
  teaching.
- **The second-half-decline hypothesis** — contradicted by batch L's arithmetic.
- **`a: 0` as a defect** — settled at **D14/D15**, re-confirmed at **L27** and here.
  Options shuffle at render time.
- **The duplicate-question sweep of both exams** — **M12** clears `exam.js`;
  `p5-05` Q3/Q4 (**K11**) remains the corpus's only duplicate. Batch N still owes
  the sweep across the remaining quiz files.
- **L43, the OTE band** — resolved at section level by **M16**. Batch N's item
  shrinks to *Section 1's pages carry no equivalent note.*

**Open, and what batch N must still count:**

1. **Six blockers at eight sites.** **C1** and **C2** (`m3-07`/`m3-08`), **E1**
   (`m4-11`) and its propagation **F1** (`s1 summary.html:240` + `s1
   exam.js:235-237`), and **M1** and **M2** (`s2 summary.html:165` and `:253`).
   **E1's repair now touches five files, not three** — **L14** added the
   *"not likely to occur most times"* qualifier, and **M6** identifies where the
   sourced wording for it lives.
2. **The cross-section contradiction (L14) is confirmed live and one-sided.**
   `p6-05/quiz.js:4` grades *"Imbalances always rebalance completely"* **wrong**
   while `s1 summary.html:240` and `s1 exam.js:235-237` teach it. **M6** establishes
   that Section 2's pages take no position, so **the fix is entirely in Section 1**.
3. **Terminology normalisation**, now fully measured: `intermediate-term`
   **7 hyphenated / 29 unhyphenated**, with **4 of the 7 on the Section 2 pages**
   (**M18**); the two OTE bands (note, don't normalise — and Section 1 needs
   **M16**'s parenthesis); the two pyramid ladders (**M15**); the micro-contract
   $5/$2 split.
4. **The one-sidedness family** — **A8, C9, C10, D13, E18, F10** — six sites across
   four Section 1 months. Section 2 produced no new instances, including here.
5. **The citation-label family** — **C16, F9**, four sites, all in Section 1.
   **M9** confirms Section 2 adds none.
6. **`.src` placement** — **F11b** ×1, **J24** ×2, **M8** ×3 = **six cosmetic sites**
   across the corpus, all resolving correctly. A single CSS-scope change to
   `engine/head.html:182` may be cheaper than six content edits.
7. **The three part-level hedges** — **M14** gives their exact status; two need one
   line each and the summary is the proven fix site.
8. **Quiz-count proportionality** — 11 of Section 1's 38 lessons under-tested
   (~+18 questions), 2 of Section 2's 40 (**+4** for `p6-06`, Part 3's one site),
   and now **Part 6 of the S2 exam** (**M10**, +2 to +3).
9. **Option length** — Section 1's quizzes at 76% expected remain the corpus's one
   real construction problem. **F14**'s three techniques plus batch L's fourth are
   the instruction, and **M13** shows the S2 exam applies all four already.
10. **Batch N's own carried items**: **K17**'s missing no-fig-slot comment in
    `p5-01`; **K11**'s duplicate grep across the remaining files; and **L13**'s
    naming question — every garbled proper name in the corpus verified or declined,
    never re-spelled.

**What batch N does not need to look for**, because it has been checked and is
clean: chart counts against `images/` (A12 → E, 1:1 and in order); dead
cross-references (**F12**, **M7** — 72 of 72 across both summaries resolve);
`data-kind` / `data-section` / slot correctness on all four review pages; and the
build itself, which emits zero warnings and zero JS errors.

### Batch N — the cross-cutting sweep

The last batch, and a **synthesis** one: no lesson and no transcript was read
whole. The work was eight corpus-wide mechanical scans over all **160 content
files** (78 `lesson.html`, 78 `quiz.js`, 2 `summary.html`, 2 `exam.js`) plus
targeted reads of the ~30 lines each reconciliation actually turned on. Every
number published below was re-derived in this batch; where a re-derivation
disagrees with a published one, the disagreement is stated and the earlier figure
corrected.

**Headline: the audit's single most consequential finding is not a new defect but
a new *repair path* for the oldest one.** Section 1 already contains the correct
definition of a liquidity void — in **`m1-06`, thirty-three lessons before
`m4-11` gets it wrong** — and `m1-06/quiz.js` grades it as the right answer while
`s1 exam.js` grades the opposite as the right answer to the same question
(**N1**). So **E1/F1** is not a gap to be filled from outside; it is an internal
contradiction with its own fix already written, in Section 1's own words. That
also retires **M6**'s suggestion that Section 2's `p6-05` is the cheapest source
for the wording — using it would have imported one section's material into the
other, which is the thing §1 forbids.

**Four of the brief's own figures did not reproduce.** The `intermediate-term`
tally is **10/33, not 7/29** (**N3**); `kill zone` is **not** 0 (**N5**); the
exam-repeats-a-quiz-stem count is **5, not 4** (**N2**); and *fourteen* Section 1
lessons below the four-question floor are **fifteen** (**N13**). Three of the
four are the last batch catching the arithmetic of earlier ones, which is what
the brief asked it to do.

**Eighteen findings: 0 blockers, 2 should-fix, 16 nits.** No new blocker exists
anywhere in the corpus — the six are the six.

#### The four declared dimensions of the batch, disposed of first

**Slugs, ids, `data-month`, crumbs — re-verified from scratch, 78 of 78 clean.**
Not taken on trust: a fresh scan checked, for every lesson, that `id` equals the
folder name, that `data-month` equals both `id[:2]` and the containing
directory, that every `data-slug`'s first five characters equal `id[:5]`, and
that the `.crumb`'s *"Month N · Lesson M"* / *"Part N · Lesson M"* parses and
matches the id in both fields. **Zero problems, four checks, 78 lessons.** This
dimension is closed and should not be re-litigated.

**Cross-references — closed at 72 of 72** (**F12** 24, **M7** 48), confirmed by
the *Fixed in flight* exception never firing in either batch. Not re-run; nothing
in `content/` changed since.

**Terminology — the whole "split" is one fact, and it is not a defect (N4).**
Every large variant pair in the corpus resolves to the same thing: **Section 1
and Section 2 use different vocabularies, and each is internally consistent.**
Measured across all 160 files:

| Variant A | S1 | S2 | Variant B | S1 | S2 | |
|---|---|---|---|---|---|---|
| `orderblock` | **115** | **0** | `order block` | **1** | **201** | a clean divide, one leak |
| `FVG` | **27** | 4 | `fair value gap` | 15 | **315** | the same divide, inverted |
| `short-term` | 33 | 188 | `short term` | **0** | 4 | S2 tail only |
| `long-term` | 9 | 17 | `long term` | **0** | 4 | S2 tail only |
| `killzone` | 2 | 41 | `kill zone` | **0** | 2 | both quoted speech (**N5**) |
| `intermediate-term` | 3 | 7 | `intermediate term` | **0** | 33 | (**N3**) |
| `back testing` etc. | **0** | 44 | — | | | five variants, all S2 (**N6**) |

Read down the S1 columns and the picture is unambiguous: **Section 1 never once
uses `order block`, `short term`, `long term`, `kill zone` or `intermediate term`
in its own prose.** The one exception is a single quiz question (**N4**). So there
is no corpus-wide inconsistency to normalise — there are two house styles, one
per section, and normalising them would be a cosmetic rewrite of 300+ sites for
no reader benefit. The residue worth fixing is small and named in **N4**–**N6**.

**`data-month`, chart counts, review-page structure, the build** — all confirmed
clean and not re-derived beyond the scan above. `python build.py` emits **zero
warnings**; `python verify.py` passes: *78 lessons, 339 images, 78 video links,
451 quiz questions, 2 summary page(s), 85 exam questions across 2 exam(s), 0 JS
errors.* **Nothing in `content/` was edited in this batch.**

#### N1 — the liquidity-void repair path, and it changes E1/F1's scope

**N1 · should-fix ·
[m1-06/lesson.html:17](../content/s1-ict-core/m1/m1-06/lesson.html#L17),
[m1-06/quiz.js:4](../content/s1-ict-core/m1/m1-06/quiz.js#L4) and
[m4-02/lesson.html:37](../content/s1-ict-core/m4/m4-02/lesson.html#L37) against
**E1**/**F1**'s four sites** — **Section 1 teaches the liquidity void correctly in
Month 1 and incorrectly in Month 4, and its two exams grade mutually exclusive
answers to the same question.**

The correct definition is already there, in Section 1's own voice, from Section
1's own source:

> *"A **liquidity void**: sudden movement with large ranges, very little wicks,
> quick — price spent very little time at those levels. It will want to trade
> back up into that area and **close it in** later **(not always immediately)**."*
> — `m1-06:17`

and its quiz key is unambiguous:

> *"What defines a liquidity void?"* → **`"Fast, one-sided, wickless range"`**,
> `e:` *"Big-range, quick, one-sided movement."* — `m1-06/quiz.js:4`

`m4-02:37` presupposes the same reading — *"a liquidity void / **big one-candle
range** beneath your long"*. Against those three sites stand **E1**'s two
(`m4-11:9`, `m4-11/quiz.js:2`) and **F1**'s two (`s1 summary.html:240`,
`s1 exam.js:235-237`), all four asserting *"absolutely no trading took place"*.

Three consequences, and they are what makes this worth a finding of its own:

- **Two quiz keys in one section grade contradictory answers to the same
  question.** `m1-06/quiz.js:4` marks *"fast, one-sided, wickless range"*
  correct; `s1 exam.js` q39 marks *"a range where no trading took place"*
  correct. The cross-file stem scan (**N2**) puts them at Jaccard 0.67 — near
  enough that a reader meets both. This is the most concrete statement the audit
  can make about **E1**, and no per-batch scope could have made it: `m1-06` is
  batch A and `m4-11` is batch E.
- **The repair needs no new sourcing and no cross-section import.** `m1-06`'s
  wording drops straight into `m4-11:9`, `s1 summary.html:240` and
  `s1 exam.js:235-237`. **M6** proposed `p6-05`'s *"not likely to occur most
  times"* as the cheapest source for the qualifier; that remains true for the
  *qualifier*, but for the **definition** — the part that is actually wrong —
  Section 1 supplies itself. Taking `p6-05`'s wording into a Section 1 page would
  be a §1 breach dressed as a fix.
- **`m1-06:17`'s own hedge covers the `L14` contradiction too.** *"(not always
  immediately)"* is Section 1 declining, in Month 1, to claim the unconditional
  fill that `s1 summary.html:240` asserts in Month 4. So **the cross-section
  contradiction L14 identified has an intra-Section-1 witness**, and the fix
  stays entirely in Section 1 exactly as **M6** concluded — but for a stronger
  reason than M6 had.

*Scope, restated:* **E1/F1 is four files** — `m4-11/lesson.html`,
`m4-11/quiz.js`, `s1 summary.html:240`, `s1 exam.js:235-237` — and `s1 exam.js`
q39 needs a **new option set**, not a re-marked `a`, because **F1** established
none of its four options states the correct definition. `m1-06/quiz.js:4`'s four
options are the model.

#### N2 — five exam questions reproduce their own lesson's quiz stem, and only one of them matters

**N2 · nit — the cross-file stem sweep, and the ruling.** Run over all **536**
questions in all **80** files, comparing question stems by token-set Jaccard
(stopwords removed, hyphens split). At **≥ 0.75** it returns **6 pairs — one more
than the brief's scan, which missed `m2-06`/`s1-exam` because it treated
*"high-reward"* and *"high reward"* as different tokens**:

| Pair | j | |
|---|---|---|
| `m2-06:Q1` / `s1-exam:Q16` | **1.00** | *"How many things in agreement make a high-reward setup?"* — **the pair the brief's scan missed** |
| `m4-06:Q1` / `s1-exam:Q34` | **1.00** | *"How is a bearish rejection block framed?"* |
| `m4-11:Q1` / `s1-exam:Q39` | **1.00** | *"What is a liquidity void?"* — the **E1/F1** pair |
| `m4-13:Q2` / `s1-exam:Q41` | **1.00** | *"What is Type 2 (hidden) divergence?"* |
| `p6-02:Q2` / `s2-exam:Q36` | **1.00** | *"What is the mean threshold of an order block?"* |
| `m1-04:Q1` / `p2-04:Q2` | 0.75 | *"What defines a swing high?"* — the only cross-**section** pair (**N8**) |

So the count is **4 in the S1 exam (of 45) and 1 in the S2 exam (of 40)**, not
3 and 1. Dropping the threshold to 0.65 adds three more near-misses in the S1
exam (`Q11`, `Q18`, and `m1-06:Q3`/`Q39`) and three inside Section 2's lessons
(three different lessons asking *"what is an order block?"* from three different
episodes) — the latter are correct by construction under one-episode-per-lesson
and are not findings.

**Ruling, stated once because the brief asks for it: re-using a lesson's quiz
stem in the exam is not a defect.** An exam exists to re-test the section; the
rate is 9% and 2.5%; and in every one of the five pairs the **option sets are
entirely different**, so nothing is answerable from memory of the option
positions. Two of the five are in fact *improvements* — `s1-exam:Q41`'s four
options are four parallel price/momentum permutations (spread 2) against
`m4-13:Q2`'s *"Equal highs"* / *"A gap"*, which are the absurdity-distractors
batch L's fourth technique names. **A fix pass should copy the exam's option set
back into the quiz, not remove the exam question.**

**The one exception is `m4-11:Q1` / `s1-exam:Q39`.** Both carry **E1**'s inverted
definition, so **E1's fix must rewrite two questions with the same stem**, and
`m1-06/quiz.js:4` is the third question on the same subject and the one that is
right (**N1**). That is the widening the brief asked to be checked, and it does
not extend **F1** beyond the four files already named — `m4-11/quiz.js` was
always in **E1**'s scope.

#### N3–N6 — terminology, recounted

**N3 · nit · FIXED — `intermediate-term` is 10 hyphenated / 33 unhyphenated. Batch L's
7/29 is wrong, and `M18` consumed it unchecked.** The recount covers all 160
files. The earlier figure excluded the 80 quiz/exam files, which hold **2**
hyphenated and **12** unhyphenated occurrences, and undercounted the rest.

| | hyphenated | unhyphenated |
|---|---|---|
| S1 lessons (`m3-03`, `m4-06`) | 2 | 0 |
| S1 `summary.html` | 1 | 0 |
| S2 lessons (`p1-06`) | 1 | 0 |
| S2 lessons (`p2-04/05/06`, `p3-04/05/06`, `p4-03`) | 0 | 21 |
| S2 quizzes (`p1-06`) | 2 | 0 |
| S2 quizzes (`p2-04/05/06`, `p4-03`) | 0 | 12 |
| S2 `summary.html` + `exam.js` | 4 | 0 |
| **Total** | **10** | **33** |

**M18's conclusion survives intact and only its arithmetic fails.** The
distribution claim — *the hyphenated form survives only in Section 1, Part 1 and
the section-level pages* — is exactly right: all 10 hyphenated occurrences sit in
`m3-03`, `m4-06`, `s1 summary.html`, `p1-06` (lesson + quiz), `s2 summary.html`
and `s2 exam.js`, and **nowhere else**. Correct both figures in place; the
finding stands.

**N4 · nit · FIXED (the one leak) — the `orderblock` / `order block` split is a section boundary, not an
inconsistency, and it leaks exactly once.** `orderblock` is **115 occurrences,
all in Section 1, 0 in Section 2**. `order block` is **202, of which 201 are in
Section 2**. The single leak is
[`m4-07/quiz.js:3`](../content/s1-ict-core/m4/m4-07/quiz.js#L3), and it is the
worst possible shape for one — **the question uses both forms inside itself**:

> *"What is a **reclaimed order block**?"* → options *"A brand-new
> **orderblock**"*, *"A failed **orderblock** entirely"*

Section 1's slugs, `months.js` titles and lesson headings all use *Orderblocks*,
and changing a slug renames files in `images/`, so **prose and slugs are separate
questions and only the prose one is open**. *Recommendation:* leave the section
house styles alone; align the two option strings in `m4-07/quiz.js:3` to the
stem's form (or the stem to theirs). One line, one file, and it is the only
`order block`/`orderblock` edit the corpus needs.

**N5 · nit — `kill zone` is not 0; it occurs twice, and both are correct.** The
brief's scan reported 0 because it excluded quiz files. Both occurrences are in
[`p4-01/quiz.js`](../content/s2-2022-mentorship/p4/p4-01/quiz.js) and both sit
**inside verbatim ICT quotations** in the `e` field — *"that's the **kill zone**
for London open"*, *"the **kill zone** for London open is still open"* — while
the same file's own prose (both question stems, one option) says `killzone`. So
the file is internally consistent and the exception is a quotation being quoted
accurately. **Do not normalise it**: §1 makes the quoted form the right one.
Recorded so a future find-and-replace does not "fix" it.

**N6 · nit — `back test` has five variants, all in Section 2, and no lesson uses
more than one.** `back testing` 28 · `backtest` 7 · `backtesting` 5 · `back-test`
2 · `back-testing` 2 — **44 occurrences, 0 of them in Section 1**. The dominant
form is `back testing` (64%). Per-file the usage is consistent, so no reader
meets two forms in one place; this is the corpus's most fragmented term and its
least consequential one. *Recommendation:* normalise to `back testing` in a fix
pass, or leave it — it is a nit either way.

**N7 · nit · FIXED — `FVG` is used ten times in Section 1 before it is ever glossed.**
Section 1 uses the abbreviation **27** times and expands it exactly once, in
`m4-12`'s **title** (*"ICT Fair Value Gaps (FVG)"*) — the 34th of its 38 lessons.
**Ten uses precede it**, in course order: `m1-06/lesson.html` (1),
`m2-04/quiz.js` (2), `m4-01/quiz.js` (1), `m4-03/quiz.js` (1), `m4-06/quiz.js`
(1) and `m4-09` (2 + 2). Two of those lessons do spell *fair value gap* in their
own body first (`m1-06:18`, `m2-04:17`) without ever tying the two strings
together. Section 2 does not have
the problem: `p1-02` names the concept in its title and defines *"the **fair
value gap**"* in the body at `:54`, and Section 2 then uses the long form 315
times against 4. *Fix:* one parenthesis at `m1-06:18` — *"a fair value gap
(FVG)"* — which is the first site in reading order.

#### N8 — the swing high, and an explicit refusal

**N8 · nit — the two sections' definitions of a swing high agree, and Section 2's
qualifier must NOT be carried into Section 1.** This is the corpus's only
cross-section near-duplicate question (**N2**), so it is the one place a
consistency sweep could do real harm.

| | Definition | Extra |
|---|---|---|
| `m1-04:14` (S1) | *"A swing high is **3 candles** — a high with a lower candle on the left and a lower candle on the right."* | *"Then you wait for the **4th candle** to be lower…"* |
| `p2-03:28`, `p3-03:20`, `p6-07:21` (S2) | *"a high with a **lower high candle to the left** and a lower high candle to the right"* | *"**Not a fractal** — this is not a Williams fractal on MT4… **this is not five candles**"* |

**They agree.** Three candles, middle highest, in both. Section 1 adds a
confirmation step Section 2 does not; Section 2 adds a rejection of the
five-candle MT4 fractal, at **three lesson sites plus `s2 summary.html:345`
plus an exam distractor** — and Section 1 carries it **nowhere**.

*Ruling: leave Section 1 alone.* Section 2's qualifier comes from episodes 10,
16 and 40 — **Section 2's sources**. Adding it to `m1-04` because Section 2
says it would be importing one mentorship's material into another, which is the
exact failure mode §1 exists to prevent and the mechanism behind **A2**, **D1**
and **E1**. Section 1 already rejects the five-candle reading implicitly and
correctly, by grading *"5 candles plus rising volume"* wrong in
[`m1-04/quiz.js:2`](../content/s1-ict-core/m1/m1-04/quiz.js#L2). **If Month 1's
own transcript states the qualifier it may be added on that authority and no
other** — which is a question for a fix pass with the Month 1 source open, not
for this sweep. Flagged, not filled (§1).

#### N9 — proper names: L13 discharged, one decline

**N9 · nit — every proper name in the corpus is verified except one, and that one
cannot be verified from the permitted sources.** A two-capitalised-word scan
across all 160 files (HTML tags and entities stripped) returns exactly five
person names, which confirms the brief's inventory is complete:

**Linda Raschke** and **Larry Connors** (`p1-05`), **George Angell** (`p1-07`),
**John Murphy** (`p2-05`), **Chris Lorie** (`p6-05`). Single-name references
—`Elliott` (6), `Powell` (3), `Wyckoff`, `Gann`, `Barnum`, `Camtasia`,
`TradingView` (15), `thinkorswim`, `forexfactory`, `Ameritrade`, `Baby Pips` — are
each spelled **one way, every time**. `barchart` is lower-case at all three sites
because all three are the domain `barchart.com`. **No garbled or drifting name
exists in the corpus apart from the one L13 named.**

**`Chris Lorie` (`p6-05:26`) — declined, deliberately.** The permitted sources do
not settle it. `transcripts/2022 Mentorship/…Episode 38.txt` is an auto-caption
and renders the name **three different ways in twenty-nine lines** — *"chris
laurie"* (137), *"chris laurie"* (165), *"now i'm not knocking **chris lord**
because"* (166) — and `notes/2022-mentorship/` does not contain the name at all
(0 hits across all 39 pages). So *Lorie* is neither supported nor refuted by the
sources; it is the lesson author's choice. Establishing the real spelling would
require outside knowledge, which §1 forbids.

*Disposition (the §1 one — flag the gap, don't fill it):* either drop the name and
keep the teaching, which loses nothing — the passage's substance is ICT naming a
position he rejects — or keep it with an inline note that the source is an
auto-caption. **What must not happen is a silent re-spelling**, in either
direction. This closes **L13**, and it closes it as an *unresolved* item on
purpose.

> **Scan hygiene, recorded for the next person:** a naive `grep -i amp` reports
> hits in 52 files. That is the HTML entity `&amp;`, not the broker AMP
> (`p5-06`/`p5-07` only). Any corpus-wide name scan must strip entities and tags
> first — the scan above does.

#### N10–N12 — the cosmetic and numeric reconciliations

**N10 · nit · FIXED — the `.src` CSS-scope fix covers four of the six sites, not six, and
the other two are a different defect.** `class="src"` occurs in exactly **three
files**: `s1 summary.html` (24), `s2 summary.html` (48), `p4-05/lesson.html` (2)
— 74 spans. `engine/head.html:182` scopes the style as **`.lesson h4 .src`**, so:

- **Four spans sit outside an `<h4>` and mis-render**: `s1 summary.html:33`
  (**F11b**, inside a `.callout.rule`'s `<span class="tag">`) and
  `s2 summary.html:12, 14, 15` (**M8**; `:12` in a tag, `:14`/`:15` in `.kv`
  divs, unstyled). **Changing `.lesson h4 .src` to `.lesson .src` fixes all
  four in one line** and is safe: the other 70 spans are already inside `.lesson
  h4` and gain nothing, no `.src` exists outside a `.lesson`, and the two
  tag-nested spans win on specificity (`.lesson .src` = 0-2-0 against `.tag`'s
  0-1-0), so they stop inheriting the gold uppercase label styling.
- **`p4-05:37` and `:47` (J24) are not affected by that change and are not a
  rendering bug at all.** Both are correctly inside `<h4>` and render correctly.
  Their defect is **semantic**: `.src` means *a lesson cross-reference*
  everywhere else in the corpus, and these two use it for a **parenthetical
  label** — `(bearish)` and `(bearish; reverse it for longs)`. That needs a
  content edit or a second class, and the CSS change does nothing for it.

So the brief's *"a single CSS-scope change may be cheaper than six content
edits"* is **two-thirds right**: one line replaces four content edits, and two
content edits remain. That is still the best trade in the repair plan.

**N11 · nit · FIXED —
[`s2 summary.html:342`](../content/s2-2022-mentorship/summary.html#L342) collapses
a distinction it draws in the same sentence.** The row reads *"1 handle | Four
ticks — **$50** on ES, **$20** on NQ, **$5** on the micros."* It separates ES from
NQ at full size and then merges them at micro size, where the lessons separate
them too: `p1-01:46` and `p4-06:51` give **$5 per handle** for the micro **ES**
(both in explicit contrast to the $50 e-mini ES), `p6-08:75` gives **$5 a point**
for a micro against *"an E-mini contract is $50 a point"* — also ES — and
`p2-06:62` gives **"Micro E-mini NASDAQ — 1 point = 4 ticks = $2"**. All four
lessons are right; the summary's *"$5 on the micros"* is right for micro ES and
**wrong for the micro NQ its own row has just named**. **M** recorded this as
*noted, not a finding*; the row's internal ES/NQ split is what promotes it to
one. *Fix:* *"$5 on micro ES, $2 on micro NQ"* — six words, and both numbers are
already in the lessons.

**N12 · nit — M16's Section 1 OTE item should be closed as no-action, not carried
forward.** **M16** narrowed **L43** to *"Section 1's pages carry no equivalent
note"*, implying a fix. Re-checked: Section 1 states the OTE band at four sites —
`s1 summary.html:75, 80-81, 267` and `s1 exam.js:35-36` — and **every one says
62 / 70.5 / 79. There is no discrepancy inside Section 1 to disclose.** (`70.5`
appears exactly once in all of Section 2, at `p4-03/quiz.js:8`, and `62–70`
appears nowhere in Section 1.)

**M16** is right that `s2 summary.html:347` is the corpus's only disclosed
internal discrepancy and right to praise it — but that is because **Section 2
genuinely contradicts itself** (`p6-08:50`'s 62–70% against nine sites' 62–79%)
and Section 1 does not. Adding *"(Section 2 states 62–70%)"* to a Section 1 page
would put Section 2's material on a Section 1 page for no reason a Section 1
reader can act on, and the two sections are different mentorships taught six
years apart. *Ruling: no action. **L43** is fully closed by **M16**, and this
batch closes the residue it left open.*

#### N13–N15 — the audit's own arithmetic

**N13 · nit · FIXED — the corpus finding total is right by convention and the doc's own
severity markers count 240, not 241.** Re-derived by parsing every
`**<Batch><n> · <severity>**` header in this document:

| Batch | blocker | should-fix | nit | total | published |
|---|---|---|---|---|---|
| A | — | 2 | 9 | 11 | 11 ✓ |
| B | — | 4 | 8 | 12 | 12 ✓ |
| **C** | **2** | **5** | **9** | **16** | **17 ✗** |
| D | — | 8 | 6 | 14 | 14 ✓ |
| E | 1 | 11 | 6 | 18 | 18 ✓ |
| F | 1 | 6 | 4 | 11 | 11 ✓ |
| G–M | — | 46 | 100 | 146 | 146 ✓ |
| **Total** | **6** | **92** | **142** | **240** | **241** |

**Twelve of thirteen batches reconcile exactly.** The single divergence is batch
C, and it is not a miscount: **C18** (*"Quiz-count verdict for Month 3: it is a
defect"*) is a genuine should-fix that was written with a descriptive header
carrying no `· should-fix` marker, so it is invisible to a grep. **C17** is
correctly excluded — it is a re-measurement, not a finding. *Fix:* add the
severity marker to **C18**'s header; the published 241 / 6 / 93 / 142 is then
correct as it stands. Numbering is otherwise contiguous in all thirteen batches
(A's two gaps are **A1**, withdrawn, and **A12**, an open question resolved).

**Section 1's option-length table also re-derives to the digit** — every cell of
the roll-up's seven-row table and of **C17**'s corpus table reproduces exactly
(536 questions, 45% strict, 52% expected). Two one-point rounding slips are worth
correcting in place because they are quoted against each other elsewhere: the
Section 2 roll-up gives S2 quizzes **42%** expected where **M13** and this
re-derivation give **43%**, and gives spread-over-10 as **11%** where both give
**10%**.

**N14 · nit · FIXED — the Section 2 roll-up names the wrong Part 3 lesson.** The roll-up
reads *"`p3-06` (19.1 KB per question) and `p6-06` (14.0) are the only lessons
that fail both denominators… Recommended additions: **+4** for `p6-06` (**L28**)
and **Part 3's**."* But **I11** is filed *against `p3-05`*, its recommendation is
**+3 for `p3-05`**, and it explicitly declines to make count the defect
(*"`p3-01` carries the same six questions and they cover every beat of its
lesson"*). `p3-06` has the worse ratio and **seven** questions that batch I found
adequate. So **Part 3's outstanding site is `p3-05`, +3** — correct the roll-up's
sentence, not I11.

**N15 · nit · FIXED — F1's row arithmetic is off in both directions.** **F1** says the
vacuum-block row sits *"four rows above"* the liquidity-void row and the correct
FVG formulation *"two rows below"*. In the ten-array table at
[`s1 summary.html:231-241`](../content/s1-ict-core/summary.html#L231) the rows
run … 7 Vacuum block · 8 Liquidity pool · **9 Liquidity void** · 10 Fair value
gap. So it is **two rows above** and **one row below** — which makes **F1**'s
point *stronger*, not weaker: the contradictory definition and its own correction
are adjacent rows on a revision table. Substance unchanged; correct the two
numbers.

#### N16–N18 — the families, closed

**N16 · should-fix · FIXED — the one-sidedness family (A8, C9, C10, D13, E18, F10) is a
real Section 1 defect, and the cause is compression.** Both readings the brief
offered are partly right, and the measurement separates them:

| | lessons | total | per lesson | *"reverse"* | *"flip it"* | *"vice versa"* |
|---|---|---|---|---|---|---|
| Section 1 | 38 | **118 KB** | **3.1 KB** | 17 | 5 | 2 |
| Section 2 | 40 | **430 KB** | **10.8 KB** | 17 | 0 | 0 |

**Section 1's lessons are 3.5× smaller and use the reverse-it shorthand at the
same absolute rate — so per byte they lean on it 3.5× harder**, and `flip it` and
`vice versa` are Section 1 idioms that Section 2 never uses. That is the
mechanism: Section 1 was thematically re-cut into ~3 KB lessons and the mirror
side is what compression drops first. Section 2 produced no instances in seven
batches not because its author was more careful but because a 10.8 KB lesson has
room to state both sides.

So: **a real defect, whose cause is structural rather than a lapse of care, and
whose fix is cheap.** Batches A–F established the mirror is present in Section
1's own source at all six sites, so the repair is roughly six sentences and needs
no new sourcing. **Section 1 owns it entirely**; no Section 2 file is involved.

**N17 · nit — the citation-label family (C16, F9) is closed at four sites, all
Section 1, and the corpus-wide sweep confirms it for the first time.** The
Section 2 roll-up and **M9** asserted *"Section 2 adds none"*, but M9 measured
only the two section-level pages. Swept across all 160 files: `"the notes"`
occurs in **fourteen** files, and **all four Section 2 occurrences are the HTML
comment** `<!-- no fig-slot: the notes carry no charts for this episode -->`
(`p1-01:66`, `p2-01:54`, `p2-04:45`, `p3-01:39`) — invisible to a reader and not
a citation. Section 2's reader-facing *"For your notes"* / *"Record this in your
notes"* (`p1-02:44`, `p1-03:41,44`, `p2-03:68`) are instructions to the student,
a different construction entirely. **The family stays at four sites — `m3-02:23`,
`m3-04:17`, `m3-05:28` (C16) and `s1 exam.js:79` (F9) — and there is no fifth.**

**N18 · nit · FIXED — `p5-01` is the only `.fig-slot` omission that is inconsistent with
its own section, and the Section 1 six should be left silent.** Re-measured:
**11 lessons carry no `.fig-slot`.** Four annotate the omission (`p1-01`,
`p2-01`, `p2-04`, `p3-01`) and seven are silent — `m1-04`, `m1-05`, `m1-06`,
`m1-08`, `m2-03`, `m2-05` and `p5-01`.

The right frame is per-section, not corpus-wide: **Section 1 omits silently in
6 of 6 cases and Section 2 annotates in 4 of 5.** So `p5-01` is the only file
out of step with its own section's convention, and **K17** already established
its chart-free status is the most thoroughly confirmed in the corpus (no
`ep-26.md`, no `raw/ep-26-*.png`, no `images/p5-01-*.png`). *Fix:* one comment
line in `p5-01`. **Leave Section 1's six alone** — they are consistent with each
other and with every other Section 1 lesson, and six edits to satisfy a
convention Section 1 never adopted is churn.

#### The remaining carried items — status, no new findings

| Item | Status going out of the audit |
|---|---|
| **The three part-level hedges** (**M14**) | Unchanged and verified here. The **authorship caveat has zero sites in the whole corpus**: the string `author` occurs three times in all 160 files and all three are `m2-05`'s verb *authorize*. `live account` / `live fund` are **0 on both S2 pages** (the one near-hit is `:231`'s *"not live risk"*, counter-trend-specific and mis-referenced per **M5**) while occurring 16 times across **eleven Section 2 lessons and one quiz** — so the warning exists in the section and reaches neither page. The no-timetable qualifier is restored at `:261`. Two one-line additions to `s2 summary.html`, as **M14** said. |
| **The two pyramid ladders** (**M15**) | Confirmed verbatim: `p2-06:59` *"three micros, then two, then one"*, `p4-03:59-61` *"3 / 2 / 1"*, `p3-03:100` *"five, then three, then two"*, and `s2 summary.html:351` *"3 + 2 + 1"* presented as **the** rule in the numbers table. All three agree on the principle (biggest first), so this is **not a contradiction and must not be normalised** — the honest fix is `s2 summary.html:351` naming the sizes as an example rather than a constant. **Deliberately unresolved**, per §1. |
| **`p4-03`'s placement rule** (**M15**, J's carried item) | Confirmed absent. All four `pyramid` mentions in `s2 summary.html` are sizing; `p4-03:59-61`'s *"largest part of the framework → next fair value gap → after a retrace into the bearish order block"* reaches no summary. One row in the Part 4 block. **Closed as a coverage item.** |
| **"Protected lows"** (**L36**, **M17**) | Confirmed: `protected` occurs **once** in `s2 summary.html` (`:306`) and **zero** times in `s2 exam.js`. Two sites total with `p6-07`. **M17**'s disposition stands unchanged. |
| **Quiz-count proportionality** | Re-derived; see the repair plan below. |
| **Option length** | Re-derived to the digit; see the repair plan below. |

#### Batch N summary

| | |
|---|---|
| Scope | **all 160 content files** — 78 lessons, 78 quizzes, 2 summaries, 2 exams |
| Method | 8 corpus-wide mechanical scans + targeted reads; **no lesson or transcript read whole** |
| Findings | **18** — **0 blockers**, 2 should-fix, 16 nits |
| Structural re-verification | **78/78 clean** on id, `data-month`, `data-slug`, crumb (4 checks each) |
| Published figures re-derived | **11**; **4 corrected** (**N2**, **N3**, **N5**, **N13**) |
| New blockers | **none** — the corpus has six, and they are the six |
| Fixed in flight | none; `content/` unchanged, build and verify pass |

**Weakest dimension: consistency — by construction, since it is the only
dimension left.** And the useful result is that it is the corpus's *strongest*
dimension by some distance. Slugs, ids, `data-month` and crumbs are 78/78 clean
on four independent checks; cross-references are 72/72; exam citations are 85/85
resolvable and 40/40 semantically correct in Section 2; the terminology "splits"
turn out to be two internally-consistent house styles rather than drift. **Not
one of batch N's eighteen findings misleads a reader about the market.** The
sixteen nits are the audit auditing itself.

**Contradictions of earlier conclusions — five, and one of them is this batch's
own headline.**

1. **The E1/F1 repair path is not what M6 proposed.** M6 offered `p6-05` as *"the
   cheapest place to state it once for the whole corpus"*. For the definition —
   the part that is actually wrong — the fix is in `m1-06`, in Section 1, and
   taking Section 2's wording instead would have been the §1 breach the audit
   spent 258 findings guarding against (**N1**).
2. **Batch L's `intermediate-term` count, and M18's confirmation of it, are both
   wrong** — 10/33, not 7/29. M18's *conclusion* is exactly right; only its
   arithmetic fails (**N3**). This is the specific error the brief predicted the
   last batch might catch, and it was there.
3. **The Section 2 roll-up names `p3-06` where I11 names `p3-05`** (**N14**), and
   gives S2 quizzes' expected score as 42% where M13 and this re-derivation give
   43%.
4. **F1's row arithmetic is wrong in both directions, and wrong in F1's favour**
   (**N15**).
5. **The brief's own scans were right about almost everything and wrong about
   four numbers** — the missed sixth stem pair, the `kill zone` zero, the
   `intermediate-term` tally, and *fourteen* lessons below the floor where there
   are fifteen. Recorded because the brief asked for it, and because three of the
   four came from the same cause: **a scan that excluded the 80 quiz files.**

---

## Closing the audit

Fourteen batches, **2026-08-07 to 2026-08-08**. **78 lessons, 451 quiz questions,
2 revision summaries, 85 exam questions, ~2.4 MB of transcript and 78 note pages**
read against `CLAUDE.md` §1 and §3.

**259 findings — 6 blockers, 95 should-fix, 158 nits.**

| | Lessons | Pages | blocker | should-fix | nit | total |
|---|---|---|---|---|---|---|
| Section 1 (A–F) | 38 | 2 | **4** | 37 | 42 | 83 |
| Section 2 (G–L) | 40 | — | 0 | 48 | 92 | 140 |
| Section 2 (M) | — | 2 | **2** | 8 | 8 | 18 |
| Cross-cutting (N) | — | — | 0 | 2 | 16 | 18 |
| **Total** | **78** | **4** | **6** | **95** | **158** | **259** |

*(258 of the 259 carry an explicit severity marker; **C18** is a should-fix whose
header lacks one — see **N13**.)*

### The complete blocker list, with every file each one touches

| # | Defect | Files | Notes |
|---|---|---|---|
| **C1** | Inverse head & shoulders taught backwards — faded **long at a discount** where ICT fades it **short from a premium** | `m3-08/lesson.html:18` | **Does not propagate.** Absent from `s1 summary.html` (**F**). One bullet; the source supports the rewrite sentence by sentence. |
| **C2** | Triangle/wedge apex mechanism invented — *"apex"* and *"wedge"* occur nowhere in Month 3's sources; ICT explicitly **defers** the topic | `m3-07/lesson.html:19`, `m3-07/quiz.js:5`, `s1 summary.html:222` | **The only blocker tested by its own quiz.** Summary residue is one clause (*"Triangles and wedges are the same mechanism"*, **F2**). |
| **E1** | Liquidity void defined as its **opposite** — *"absolutely no trading took place"* for a **one-sided range** | `m4-11/lesson.html:9`, `m4-11/quiz.js:2` | Traces to a note page citing a **2022** chart on a **2016** teaching. Corroborated from Section 2 by ep38 (**L14**). |
| **F1** | **E1** reaching the section-level pages | `s1 summary.html:240`, `s1 exam.js:235-237` | q39 needs a **new option set**, not a re-marked `a`. |
| **M1** | Midnight-open rule **stated backwards** and self-contradicting inside one sentence | `s2 summary.html:165` | One clause. The correct wording is already at `:286`, `:152` and `:327`. Nothing in `exam.js` tests it. |
| **M2** | *"A gap and a breaker together is a big confluence"* — **zero support in any of the 40 Section 2 lessons** | `s2 summary.html:253` | Delete, or restate `p5-07:20-27`'s actual four conditions. No question tests it. |

**Eight sites, six files.** Four of the six blockers are Section 1's, and **E1 is
the only one that propagated** to a section-level page.

### The prioritised repair plan

**Tier 1 — the blockers, in cost order (six edits, ~1 hour).**

1. **`s2 summary.html:253` (M2)** — delete one clause. No dependency.
2. **`s2 summary.html:165` (M1)** — replace the reversed condition; **paste the
   correct wording from `:286`**, two hundred lines up in the same file.
3. **`m3-07/lesson.html:19` + `quiz.js:5` (C2)** — cut the bullet and the
   question, or reduce both to what ICT actually says (*the triangle appears, its
   breakout failed, the mentorship treats it later*). Then delete the six-word
   residue at `s1 summary.html:222`.
4. **`m3-08/lesson.html:18` (C1)** — rewrite as the short-side mirror.
5. **E1/F1, four files, in this order** (**N1**): fix `m4-11/lesson.html:9`
   using **`m1-06:17`'s own wording**; then `m4-11/quiz.js:2`; then
   `s1 summary.html:240`; then re-author `s1 exam.js` q39 with a new option set
   modelled on `m1-06/quiz.js:4`. Optionally add ICT's *"not likely to occur most
   times"* qualifier — **but source it, per §1, from Section 1's material, not
   from `p6-05`**.

**Tier 2 — one-line edits (fourteen, ~1 hour).**

| Fix | Site | Finding |
|---|---|---|
| CSS scope `.lesson h4 .src` → `.lesson .src` | `engine/head.html:182` | **N10** — fixes 4 sites at once |
| Two `.src` cross-references pointing at the wrong part | `s2 summary.html:231, 176` | **M5** |
| Three-drives exemption → the lesson's own reason | `s2 summary.html:71` | **M3** |
| Break-even trigger → `p1-06:64`'s actual rule | `s2 summary.html:54` | **M4** |
| Drop or attribute *"protected lows"* | `s2 summary.html:306` | **M17** |
| Add ICT's rebalancing differentiation | `s2 summary.html`, Part 6 L5 block | **M6** |
| ~~Add the authorship caveat~~ → add it to **`p6-05/lesson.html:8`**, not the summary | `s2 summary.html`, same block | **M14** |
| Add the live-funds warning | `s2 summary.html` | **M14** |
| Add `p4-03`'s pyramid **placement** rule | `s2 summary.html`, Part 4 block | **M15** |
| *"$5 on micro ES, $2 on micro NQ"* | `s2 summary.html:342` | **N11** |
| Exam question count 40 → 45 | `s1 summary.html:311` | **F7** |
| Align the two `orderblock` options to the stem | `m4-07/quiz.js:3` | **N4** |
| Gloss the abbreviation once — *"a fair value gap (FVG)"* | `m1-06:18` | **N7** |
| Add the no-charts comment | `p5-01/lesson.html` | **K17**, **N18** |
| Add the missing severity marker | `docs/content-audit.md`, **C18**'s header | **N13** |
| Correct four figures in this document | roll-ups: `intermediate-term` 7/29→10/33; S2 quizzes 42%→43%; *"p3-06"*→*"p3-05"*; **F1**'s row counts | **N3**, **N13**, **N14**, **N15** |

> **Correction to this table, made during the fix pass (see *Fixes applied*).**
> **M14**'s *"add the authorship caveat to `s2 summary.html`"* was **unsafe under
> §3**, and this plan should not have carried it. The caveat — ICT's *"because I'm
> the author of these concepts…"* — exists **only in ep38's transcript**; `author`
> is **0 across all 40 Section 2 lessons** (**N** confirmed this), and **L15**
> records that `p6-05:8` and `:80` reproduce the material either side of it and
> stop short. §3 permits a summary to **re-state existing lessons only**, so adding
> it there would have made the summary carry material no lesson does — the exact
> defect **M2** is graded a blocker for. The safe order is **lesson first**:
> `p6-05/lesson.html:8`, where §1 permits the transcript. Done that way in the fix
> pass; **not** propagated to the summary.

**Tier 3 — new question authoring: 30 questions, and every one is writable from
material already in the lessons.**

| Where | Add | Basis |
|---|---|---|
| **Section 1 quizzes** — `m3-01` +2, `m3-03` +1, `m3-04` +2, `m3-05` +2, `m4-04` +1, `m4-05` +1, `m4-06` +1, `m4-10` +2, `m4-11` +2, `m4-12` +1, `m4-14` +1 | **+16** | **C18** / **D14** / **E18** — a floor of 4 for the 11 under-tested lessons |
| `m4-08` (at the margin) | +2 | **E18** |
| **Section 2 quizzes** — `p3-05` +3 (**I11**, **N14**), `p6-06` +4 (**L28**) | **+7** | both from untested material in the lesson |
| **S2 exam, Part 6** | **+2 to +3** | **M10**/**M11** — `p6-07`'s six keys, `p6-05`'s narrative definition, `p3-06`'s stand-aside rule; fixes the under-sampling and the three worst coverage gaps together |
| **S1 exam** q39 | rewrite (not add) | **F1** |
| **Total new** | **≈ 28** | plus 2 rewrites |

Re-derived here: the floor-of-4 repair is **+16 across the 11 named lessons**
(**not** +18 — that figure includes `m4-08`, which the roll-up listed *at the
margin*). **Fifteen** Section 1 lessons sit below the floor, of which the audit
judged **11 under-tested**, 1 marginal (`m4-08`) and 3 proportionate (`m2-03`,
`m3-02`, `m4-07`). Section 2 breaches the floor **zero** times — its range is
5 to 12.

**Tier 4 — option-length construction, the corpus's one real quality problem.**

Final figures, re-derived in this batch across all 536 questions (**D15**'s way:
ties count as *not* a tell per **C17**, margin over the second-longest, led by
**F14**'s not-longest column):

| | n | **not-longest** | strict | expected | median margin | max | spread > 10 |
|---|---|---|---|---|---|---|---|
| **S1 quizzes** | 145 | **29%** | **71%** | **76%** | 4 | +8 | **26%** |
| — Month 1 | 39 | 28% | 72% | 76% | 5 | +8 | **36%** |
| — Month 2 | 37 | 35% | 65% | 68% | 4 | +7 | 27% |
| — Month 3 | 25 | 48% | 52% | 61% | 4 | +7 | 24% |
| — **Month 4** | 44 | **14%** | **86%** | **90%** | 3 | +7 | 18% |
| S1 exam | 45 | 69% | 31% | 42% | 1 | +5 | 0% |
| S2 quizzes | 306 | 64% | 36% | **43%** | 3 | +20 | 10% |
| S2 exam | 40 | 62% | 38% | 45% | 2 | **+2** | 0% |
| **Corpus** | **536** | **55%** | **45%** | **52%** | 3 | +20 | 13% |

**The metric to move is *not-longest*: the share of questions where the correct
option is not the longest. Chance is ~75%.** Section 1's quizzes sit at **29%**
and Month 4's at **14%**, which hands a knowledge-free guesser **90%** — past the
80% exam pass mark. Every other set in the corpus is between 62% and 69%.

The fix is a known quantity, not a research problem — **F14**'s three techniques
plus batch L's fourth, all four demonstrated at scale by the S2 exam (**M13**):

1. **Whole-set parallel construction** — four permutations of the same terms.
2. **Deliberate exact ties** (S1 exam 24%, S2 exam 18%).
3. **Let the correct option be the short one** (both exams ≈ 45%).
4. **Every distractor a wrong *mechanism*, not an absurdity** — the technique
   that generates the other three.

**Order of work: Month 4's 44 questions first** (14% → the exam's 69% is the
target), then Months 1–2. §3's *"within ~5 characters"* rule is **necessary but
not sufficient** — that is **D15**'s conclusion, confirmed five times since, and
Month 4 is the proof: its median margin is 3 characters and it still scores 90%.

> **Correction to this tier, made during the fix pass (see *Fixes applied*).**
> **The not-longest column is a *two-tailed* metric and this table reads as though
> it were one-tailed.** *"Chance is ~75%"* is stated correctly above, but the target
> is then given as *"the S1 exam's 69%"* and every framing treats higher as better.
> It is not: at **100%** not-longest, *"eliminate the longest option"* lifts a blind
> guess from 25% to **33%** — the same exploitable tell as 14%, mirrored. Building
> Month 4 the obvious way produced exactly that, and it had to be tuned **back down**
> to 75%. **Read the target as ~75% from either side.** A future set reporting 90%+
> here is as defective as one reporting 14%.
>
> Two smaller corrections to the Tier 3 table above: **`m4-08` is not marginal** —
> it fails **C18**/**E18**'s proportionality test like the other eleven, and was
> added (+2); and **`p3-06`'s stand-aside rule is a Part 3 lesson**, so it was filed
> in the exam's Part 3 block rather than under this table's *"S2 exam, Part 6"*
> heading, which would have broken **M9**. Items 4–6 under *Contradicting the audit*.

### What the audit certifies as clean — do not re-litigate

Each of these was **measured**, not assumed, and several were re-derived in batch
N specifically so a fix pass can trust them:

- **Slugs, ids, `data-month`, crumbs — 78 of 78, on four independent checks.**
- **Cross-references — 72 of 72 resolve** (**F12** 24, **M7** 48), including
  Section 2's two-tier relative/absolute scheme, which never once mis-resolves a
  bare `(Ln)` to the wrong part. The *Fixed in flight* exception for dead
  cross-references was tested twice and **never fired**.
- **Exam citations — 85 of 85 resolve to an existing lesson**, and Section 2's
  **40 of 40 name the lesson the question actually tests** (**M9**), the first
  clean set in the corpus.
- **Source traceability — 536 of 536 questions traceable**, with exactly three
  exceptions, all already logged as blockers or their consequences (**C2**'s
  `m3-07` q4 and q1, **E1**'s `m4-11` q1 / **F1**'s exam q39).
- **Duplicates — one in the corpus** (fixed in the unscheduled pass; the
  certification that there is only one is what made it a closed, single-instance
  defect). `p5-05` Q3/Q4 (**K11**). The sweep is
  complete: same-file `e`-field Jaccard ≥ 0.40 over all 80 files returns that pair
  and nothing else; identical correct-option text within a file returns **0**.
- **Chart counts against `images/`** — 1:1 and in order for all 38 Section 1 note
  pages (**A12** → E) and every Section 2 part (G, H, I, K).
- **Review-page structure** — `id`, `data-kind`, `data-section` and the
  `.review-footer` slot correct on all four pages.
- **Proper names** — every name in the corpus spelled one way, every time, except
  the one that cannot be settled (**N9**).
- **The build** — `python build.py` **zero warnings**; `python verify.py` passes
  with **0 JS errors**. `content/` was edited **once** in fourteen batches
  (*Fixed in flight*, batch I).

### Deliberately unresolved — flagged, not filled (§1)

These are **not oversights.** In each case the sources are ambiguous or silent,
and §1 requires under-claiming over inventing. A fix pass that "tidies" them
would be introducing the exact defect the audit exists to find.

| Item | Why it stays open |
|---|---|
| **The two OTE bands** — 62–79% at nine sites, 62–70% at `p6-08:50` (**L43**) | Both are faithful to their own episode. `s2 summary.html:347` already discloses the discrepancy in line — the **only** such disclosure in the corpus and the right disposition. **Section 1 needs no equivalent** (**N12**). |
| **`Chris Lorie` / `Laurie` (`p6-05:26`)** (**L13**, **N9**) | The transcript is an auto-caption giving three renderings in 29 lines; the notes are silent. The permitted sources cannot settle it, and settling it would need outside knowledge. **Drop the name or annotate it — never re-spell it.** |
| **The two pyramid ladders** — `3+2+1` vs `5-3-2` (**M15**, **N**) | All three sites agree on the **principle** (biggest first) and differ only in the example's sizes. Not a contradiction; `s2 summary.html:351` should present them as an example, not a constant. |
| **The five-candle-fractal qualifier** (**N8**) | Section 2 states it at four sites; Section 1 nowhere. The definitions **agree**, so this is a coverage question — and adding it to Section 1 on Section 2's authority would be a cross-mentorship import. Only Month 1's own source can authorise it. |
| **The `back test` variants** (**N6**) | Five forms, 44 occurrences, all Section 2, each file internally consistent. Normalising is optional polish. |
| **The two section house styles** — `orderblock`/`order block`, `FVG`/`fair value gap` (**N4**) | Internally consistent per section; slugs and `images/` filenames are coupled to Section 1's. Not worth 300 edits. |
| **Whether the exam may re-use a lesson quiz's stem** (**N2**) | Ruled **not a defect** at 9% / 2.5%, with different option sets throughout. Recorded so it is not "found" again. |

### Method — the six things worth carrying to any future section

1. **Read both sources.** Batch A ran on transcripts alone and produced a false
   positive (**A1**) as a direct result.
2. **The transcript beats the notes**, every time there was a conflict; and the
   reliable signal that a note line is an import is **not** the page's length but
   **an attribution or a date that does not belong to this teaching**
   (**D1**, **E1**). The thin-notes hypothesis died three ways (J, K, L).
3. **One episode per lesson prevents migration defects — in lessons.** Zero
   blockers in Section 2's 40. The section-level pages are the one place the
   many-to-one re-cutting operation still runs, and that is exactly where
   Section 2's two blockers are (**M**).
4. **A review page is tested against the lessons, not the transcripts** (§3), and
   every exam question is checked **both** ways — traceable to a lesson *and*
   present in the summary.
5. **Measure option length the D15/F14 way** and lead with *not-longest*. The
   `\s*` in the parsing regex is load-bearing — there are **three** quiz-file
   formats and a literal `grep -c '{ q:'` returns 0 for 46 of the 80 files
   (**I17**).
6. **Run the mechanical sweeps across *all 160* files, including the 80 quiz
   files.** Three of batch N's four corrections to published figures come from
   scans that had excluded them.

---

## Fixes applied

The fix pass, **2026-08-08**, run against the repair plan above. **All four tiers
are complete.** Tiers 1 and 2 ran first (below); Tiers 3 and 4 followed in the same
pass. A fifth, **unscheduled** pass followed the tiers and closed the four items
the plan never owned — **K11**, **N16**, **M14**'s summary half and **F7**'s
missing enforcement — and a **Tier 5** then authored 31 of the findings the plan
never scheduled at all. Both have their own sections at the end, and the "not
done" notes inside the Tier 3/4 sections below are the record as it stood then,
not now.

**Running total, counted off the `· FIXED` marks in this document: 6 blockers,
55 should-fix and 14 nits repaired**, against the audit's 6 / 95 / 158. What
remains open is **~40 should-fix and ~143 nits**, and the Tier 5 section states
which of them were declined and why. (The mechanical count finds 6 / 94 / 157
`**ID · severity` headers — two findings are recorded inside prose or tables
rather than as headers, which is the same ±2 reconciliation gap the audit's own
roll-ups carry.)

Every replacement below is quoted from the source named in its last column.
`python build.py` emits **zero warnings** and `python verify.py` reports
**78 lessons, 339 images, 78 video links, 476 quiz questions, 2 summary pages,
88 exam questions across 2 exams, 0 JS errors**.

Only the two question counts moved, which is the Tier 3 deliverable: **451 → 476**
quiz (+25) and **85 → 88** exam (+3), 28 new questions in total. Every other figure
is the pre-fix baseline unchanged — 78 lessons, 339 images, 78 video links, 2
summary pages, 2 exams, 0 JS errors — so nothing was added or dropped structurally
and no chart, video or page was disturbed. All 28 additions are **appends**, so the
`ict-quiz` keys (`"{quizKey}-{qIndex}"`) of existing questions still point at the
same questions.

### Tier 1 — the six blockers, all closed

| # | File · line (post-fix) | What changed | Source of the replacement |
|---|---|---|---|
| **C1** | `m3-08/lesson.html:18` | *"the mirror trap at a discount — sell stops below the 'head' are the target before the real move up"* → the **short-side mirror**: faded short from a premium when the HTF reads bearish, the neckline break is a **run on buy stops**, and the sell stops below the head are the **objective to cover into**. | `Market Maker Trap Head Shoulders Pattern.txt:190-206`, worked example 399-445 (both quoted in **C1**) |
| **C2** | `m3-07/lesson.html:19` | The invented apex mechanism bullet → what ICT actually says: a **classic chart pattern, a triangle**, prints here, its **breakout was false** (*"they would have been wrong even trading with that"*), and it is a pattern **not yet covered**, to be treated later. | `Market Maker Trap Trendline Phantoms.txt:528-534`; `notes/ict-core/m3-07.md` (*"Classic chart pattern, triangle"*) |
| **C2** | `m3-07/quiz.js:5` (q4) | Q4 rewritten rather than cut, so the lesson keeps four questions. New stem *"What happened to the triangle's breakout on this chart?"* → **"Its breakout was false"**. Options 21–25 chars; correct option is not the longest. | same transcript line |
| **C2** | `s1 summary.html:222` | The six-word residue *"Triangles and wedges are the same mechanism."* deleted. The sentence before it is intact and sourced. | **F2** |
| **E1** | `m4-11/lesson.html:9` | *"where absolutely no trading took place… neither buyside nor sellside was offered"* → *"a range in price delivery where **one side** of the market's liquidity is shown — wide or long one-sided ranges or candles, quick, with very little wick. A run down is **a void of buy-side liquidity**."* | `m4-11` transcript 7-11, 111-114, 125-126; the *quick / very little wick* half from `m1-06:17`, per **N1** |
| **E1** | `m4-11/lesson.html:5` (the hero `desc`) | **Not in the plan** — the lesson's one-line summary carried the same reversed definition (*"Where no trading took place at all"*). Fixed with the bullet; see *Contradicting the audit*, item 1. | same |
| **E1** | `m4-11/quiz.js:2` (q1) | Correct option *"Where no trading took place"* → **"A one-sided, wide range"**; the self-contradicting `e` replaced. Options 20–23 chars. | same |
| **F1** | `s1 summary.html:240` | The liquidity-void cell restated: *"A range where **only one side of liquidity was shown**… a run down is a **void of buy-side liquidity**."* The rest of the cell (no specific time, covered back over, fake-out first) is untouched and sourced. The other nine `liquidity void` mentions left alone, per **F1**'s measurement. | same |
| **F1** | `s1 exam.js:236` (q39) | **New option set**, as **F1** required: `["A wide range delivered to one side", "A range traded heavily by both sides", "A tight consolidation at equilibrium", "The wick left by a single big candle"]`, `a:0`. Modelled on `m1-06/quiz.js:4`; 34–36 chars, correct option the **shortest**. `e` rewritten. | `m4-11` transcript 7-11, 111-114, 125-126 |
| **M1** | `s2 summary.html:165` | Reversed clause → *"the midnight open is the price **you preferably want to be buying below** — but if it sits **below** where price is trading at or after 8:30 it isn't likely to be a factor, so **use the 8:30 open**"*. The correct second half (*"still below the midnight open after 8:30 means a heavy discount"*) left verbatim. | `p3-06:57` (the rule ICT was asked to clarify), a lesson — §3 satisfied |
| **M2** | `s2 summary.html:256` (was `:253`) | *"A gap and a breaker together is a big confluence — likely to tap in and take off."* → `p5-07`'s actual four-condition stack: break below the level → a fair value gap formed with that break → the next level breaks → and gets another gap; *"a confluence, not just one thing."* | `p5-07:20-27`, a lesson — §3 satisfied |

**All six blockers are closed.** Nothing in Tier 1 needed a source the audit had
not already located, and no replacement crossed a section boundary — **N1**'s
constraint held: the liquidity-void repair is Section 1's own wording throughout,
and `p6-05` was not read into it.

### Tier 2 — the one-line edits

| Site (post-fix line) | What changed | Finding |
|---|---|---|
| `engine/head.html:182` | `.lesson h4 .src` → **`.lesson .src`**. Four mis-rendering spans fixed in one line (`s1 summary.html:33`; `s2 summary.html:12, 14, 15`). `p4-05:37,47` deliberately untouched (**J24** is semantic, out of scope). | **N10** |
| `s2 summary.html:234` | The *"you can and will absolutely lose money"* warning gets its own `.src` **(P3 L6)**, nested in the tag — the `:12` pattern, which the CSS fix above now renders correctly. The block's `<h4>` keeps **(L1, L2)**, which is right for the counter-trend rule itself. | **M5** |
| `s2 summary.html:174` | `.src` **(L2)** → **(L2, P6 L7)**. | **M5** |
| `s2 summary.html:71` | *"the pattern needs no high taken out before you look for entries"* → the lesson's own reason: *"every time a swing high turns down, bears sell it and place **buy stops above the previous high**, and those keep getting taken."* | **M3**, from `p1-05:46` |
| `s2 summary.html:54` | *"swing-mitigated your entry… goes to break even"* → *"Use the **first partial to quench the urge to move your stop**: only once a **significant intermediate-term low** has been taken out can you roll the stop down to it — not before."* | **M4**, from `p1-06:64` |
| `s2 summary.html:311` | *"those are protected lows, and that is where stops go"* → the sourced reasoning alone: *"A low that already took sell side, with its gap closed in, has **no reason left to go down** — that is why stops go under it."* The `kv` **label** *"Protected lows"* is kept: it is `p6-07`'s own `<h3>`, so it reads as a pointer to the lesson rather than as asserted terminology. | **M17**, **L36**, from `p6-07:159-161` |
| `s2 summary.html:285` | **Added** ICT's rebalancing differentiation to the Part 6 L5 block — the position he rejects (*"the market comes back and fills all of a liquidity void in"*), *"that is not likely to occur most times"*, *"the imbalance does not have to completely rebalance"*, and what replaces it. **The disputed name is omitted, not re-spelled** (**N9**). | **M6**, from `p6-05:26`, a lesson |
| `s2 summary.html:196` | **Added** a Part 4 block, *"Where each pyramid add goes"* `.src` **(L3)** — first fill at the largest part of the framework, second at the next fair value gap, third after a retrace into the bearish order block; *"it's not randomness, it's not willy-nilly, it's not flipping a coin."* | **M15**, from `p4-03:59-65` |
| `s2 summary.html:294` | **Added** the live-funds warning to the *"daily target, and when to stop"* block: his son coached minute by minute, *"you are not ready to do this with live funds while you are still learning the concepts"*, and don't expect five points every day. | **M14**, from `p6-06:158-163`, a lesson |
| `s2 summary.html:347` | *"$5 on the micros"* → **"$5 on micro ES, $2 on micro NQ"**. | **N11** |
| `s2 summary.html:24` | **Not in the plan** — the Part 1 block carried the identical *"$5 on the micros"* after the identical ES/NQ split. Fixed with `:347`; see *Contradicting the audit*, item 2. | **N11**, extended |
| `s1 summary.html:311` | *"40 questions across all four months"* → **45**. | **F7** |
| `m4-07/quiz.js:3` | Stem *"reclaimed order block"* → *"reclaimed **orderblock**"*, matching its own two options and Section 1's house style. This was the corpus's only `order block` occurrence in Section 1; it is now **0**. | **N4** |
| `m1-06/lesson.html:18` | *"A **fair value gap**"* → *"A **fair value gap (FVG)**"* — the first site in reading order, ten uses ahead of `m4-12`'s title. | **N7** |
| `p5-01/lesson.html:51` | Added `<!-- no fig-slot: the notes carry no charts for this episode -->`. Section 1's six silent omissions left alone. | **K17**, **N18** |
| `p6-05/lesson.html:10` | **Added** the authorship caveat as a `.callout.warn` — *"because I'm the author of these concepts I have a lot of tools at my disposal… a little bit better understanding of price delivery than the average student of mine"*, plus its restatement at the end of the episode. **Added to the lesson, not to the summary** — see the correction under the Tier 2 table above. | **L15**, **M14**, from `ep38:73-82` and `807-809` |
| `docs/content-audit.md` | **C18**'s header gains `· should-fix`; the four published figures corrected in place (`intermediate-term` 7/29 → **10/33** in both the batch L text and **M18**; S2 quizzes expected **42% → 43%** and spread-over-10 **11% → 10%**; *"p3-06"* → **`p3-05`, +3** in the roll-up's Part 3 recommendation; **F1**'s row counts to **two above / one below**). All repaired findings marked `· FIXED` in place. | **N13**, **N3**, **N14**, **N15** |

### Tier 3 — the new questions (28: 25 quiz + 3 exam)

**The floor of 4 (C18) is now met by every lesson the audit named.** The twelve
targeted lessons all sit at exactly 4; Section 2's two sit at 9 and 10.

**Section 1 — +18 across twelve lessons.** Each new question's correct option and
`e` is traceable to that lesson's own transcript or notes, per §1; the distractors
are wrong *mechanisms* and are not sourced (they are wrong on purpose).

| Lesson | + | What the new questions test | Source of the correct option and `e` |
|---|---|---|---|
| **E2** · `m4-11/lesson.html:10` | — | **Not a question — the bullet.** *"Voids where there was **no trading at all** are the best draw on liquidity"* → *"price typically wants to **revisit this porous range** — a void of contrarian liquidity is itself **the draw on price**."* This was the last surviving site of the note-only framing **E1** was graded a blocker for. | `m4-11` transcript **12-14** (*"price typically will want to revisit this porous range or void of contrarian liquidity"*) and **176-178** (*"the ultimate draw on price was to get up to that 104.76 level closing in that liquidity void"*) |
| `m3-01` | +2 | Whose sell stops sit below the clean equal monthly lows; and *"you only need one good pattern — don't force it."* | transcript **916-925** (*"large funds… long-term trend following funds will have stop loss orders right below that low… they will leave stops in for a very very long time"*); **1304** + **1378** |
| `m3-03` | +1 | When classic support/resistance actually works on a retracement. | `notes/ict-core/m3-03.md` (*"it will retrace back to an old high, thats when support and resistance does work, because it has an unfullfilled objective to the upside"*) |
| `m3-04` | +2 | How far back the monthly OHLC study goes; which of two down candles begins the block. | `notes/ict-core/m3-04.md` (*"Study every open high low and close of the last 3 months"*; *"He uses the left orderblock because its larger then the one to the right"*) |
| `m3-05` | +2 | What to do with reversal patterns in a symmetrical condition; how institutional market structure is identified in forex. | transcript **55-66** / **105-114** (*"the idea of stalking reversal patterns in this condition is not high probability and it should be avoided"*); **20-38** (*"we compare every price swing in the dollar index with the foreign currency that we trade"*) |
| `m4-04` | +1 | Which candle at the short-term low is the focus once structure shifts. | `notes/ict-core/m4-04.md` (*"we will be focusing on the last down candle, because thats where the last orders where placed before the short rally up"*) |
| `m4-05` | +1 | How a breaker differs from a mitigation block. | `notes/ict-core/m4-05.md` (*"a breaker is a 1 time thing, where as a mitigation block can form constantly"*) |
| `m4-06` | +1 | What the swing high or low must have for a rejection block. | `notes/ict-core/m4-06.md`, the one line **bold + underlined** in the notes (*"The key is it has to be a swing low/high that has a wick or wicks"*) |
| `m4-08` | +2 | What a mean-threshold break gives you; how the bearish version forms. **Added despite being listed *at the margin*** — see *Contradicting the audit*, item 2. | `notes/ict-core/m4-08.md` (*"If it breaks the mean threshold of the propulsion block, chances are its not a good trade"*); `m4-08/lesson.html:12` |
| `m4-10` | +2 | What a run beyond 25 pips means; the choppy Friday after a trending week. | `notes/ict-core/m4-10.md` (*"If it starts moving beyond 25 pips its probably not a sweep and its likely a contuniuation of the decline"*; *"the market will likely see a choppy day on friday because they want to take profit"*) |
| `m4-11` | +2 | How long a void takes to fill; selling inside the gap with a limit order. | transcript **38-53** (*"there's no specific time limit… it's all going to be relative to what you see in price action around that void"*); **295-303** (*"in that price Gap we can be a seller at that specific price level"*) |
| `m4-12` | +1 | What made the example FVG a high-probability trade. | `notes/ict-core/m4-12.md` (*"we already took SSL beneath that low with a turtle soup, we have EQH there and above the EQH we have a FVG. High probability trade"*) |
| `m4-14` | +1 | What replaces the 10–20 pip stop-run rule on the hourly. | `notes/ict-core/m4-14.md` (*"Normally we think of 10-20 pip sweeps but thats on the 15m, on the 1h we can use this to get more precise"*) |

**Section 2 — +7 across two lessons** (**I11**, **L28**; `p3-05` 6 → 9, `p6-06` 6 → 10).

| Lesson | + | What the new questions test | Source |
|---|---|---|---|
| `p3-05` | +3 | How many days' highs and lows to mark; whether you can enter a new position from a phone; what sets the money at risk on the low threshold entry. | ep-18 transcript **566-578** (*"do that for the last three days… you're never going to run out of trades ever"*); **640-666** (*"entering a brand new position on your phone no — you don't see enough data it's just too compressed"*); **1055-1090** (*"that higher risk in terms of number of pips not in terms of the amount of money… you can manage the amount of leverage you're using"*) |
| `p6-06` | +4 | What 8:30 is in the model; what removes the daily range's programmed boundaries; the one-contract arithmetic; what to do after a losing trade. | ep-39 transcript **1165-1169** (*"at 8 30 that's when the news embargo lifts"*); **1340-1360** (*"the daily range has those limitations programmed into it as well until manual intervention is brought in"*); **1560-1580** (*"one point… is worth fifty dollars… that's 250 dollars a day… that's 1250 a week"*); **2350-2375** (*"losing trades is like getting a flat tire"*) |

**S2 exam — +3** (**M10**, **M11**; 40 → 43). All three name the lesson they test,
preserving **M9**'s 40-of-40 certification.

| Block | Question | Source |
|---|---|---|
| **Part 3** | *"The market you follow is sloppy… what is the response?"* → close the charts and go do something else. **Filed under Part 3, not Part 6** — see *Contradicting the audit*, item 3. | `p3-06/lesson.html:11-12`, a lesson (*"there's absolutely zero, nothing in this chart, nothing to trade on, not one thing"*) — cited `(Part 3, Lesson 6)` |
| **Part 6** | *"Which chart gives the strongest daily bias, and what do you ask of it?"* → the weekly, and where it will **reach for**. | `p6-07/lesson.html:71-75`, Rule 2 of the keys to daily bias — cited `(Part 6, Lesson 7)` |
| **Part 6** | *"How does ICT define narrative?"* | `p6-05/lesson.html:32`, the definition verbatim — cited `(Part 6, Lesson 5)` |

**`s2 summary.html:390`** — *"40 questions across all six parts"* → **43**. This is
**F7**'s exact defect at its second site, and it only became a defect when the three
exam questions landed; see *Contradicting the audit*, item 4.

#### Which lessons reached the floor, and which did not

**All twelve targeted lessons reached 4. Nothing was blocked by a §1 gap** — every
one of the eighteen Section 1 additions came from material the lesson already
carried and the notes or transcript already stated, and in no case did a lesson run
out of sourced material before the fourth question. Section 2's two had a large
surplus (`p3-05` and `p6-06` are among the corpus's densest lessons).

**Three lessons remain below the floor and were deliberately not touched:**
`m2-03` (3), `m3-02` (3), `m4-07` (3). These are the three the audit judged
**proportionate** — the finding is that their coverage matches their material, not
that their material is missing. They were left alone on the audit's own instruction,
so **no §1 reason is claimed for them and their sources were not re-read**; that
judgement stands unre-litigated.

Section 1's per-lesson range is now **3–6**; Section 2's is unchanged at **5–12**.

### Tier 4 — option-length construction

**Re-measured first.** The published figures were reproduced exactly, on all six
columns and all nine rows, before any edit — confirming the fix pass's four changed
option sets (`m3-07` q4, `m4-11` q1, `s1 exam.js` q39, `m4-07` q3) had not moved
them. The script reconciles to **451 quiz + 85 exam = 536** on the pre-Tier-3 tree
and **476 + 88 = 564** after, using **D15**'s method with **F14**'s leading column
and the `\s*` regex from the method notes (**I17**). It is throwaway and lives in the
session scratchpad, not the repo.

**91 option sets were rewritten** (Month 1: 21, Month 2: 18, Month 3: 9,
Month 4: 39, Section 2: 4). **No `q`, no `a` and no `e` was changed by Tier 4** — only
option text, so no stored `ict-quiz` result changed meaning. Distractors were
lengthened into plausible wrong *mechanisms* (technique 4) rather than the correct
option being padded, and whole-set parallel construction (technique 1) was used
wherever four permutations of the same terms existed — `m4-13`'s Type-2 divergence
question is the clearest case, going from a 36-character spread with two
one-word throwaways (*"Equal highs"*, *"A gap"*) to four same-shape statements
spanning 2 characters.

| | n (before → after) | **not-longest** | expected | median margin | max margin | spread > 10 |
|---|---|---|---|---|---|---|
| **S1 quizzes** | 145 → 163 | **29% → 75%** | **76% → 32%** | 4 → 2 | 8 → 5 | 26% → **1%** |
| — Month 1 | 39 → 39 | 28% → **74%** | 76% → 29% | 5 → 2 | 8 → 4 | 36% → **0%** |
| — Month 2 | 37 → 37 | 35% → **76%** | 68% → 27% | 4 → 2 | 7 → 4 | 27% → 3% |
| — Month 3 | 25 → 32 | 48% → **75%** | 61% → 33% | 4 → 3 | 7 → 5 | 24% → **0%** |
| — **Month 4** | 44 → 55 | **14% → 75%** | **90% → 37%** | 3 → 1.5 | 7 → 3 | 18% → 2% |
| S1 exam | 45 → 45 | 69% *(untouched)* | 42% | 1 | 5 | 0% |
| S2 quizzes | 306 → 313 | 64% → 65% | 43% → 41% | 3 → 3 | **20 → 9** | 10% → 9% |
| S2 exam | 40 → 43 | 62% → 65% | 45% → 43% | 2 → 2 | 2 → 2 | 0% |
| **Corpus** | 536 → 564 | **55% → 68%** | **52% → 39%** | 3 → 2 | **20 → 9** | 13% → **5%** |

**Month 4 was the target and is now the corpus's best-constructed quiz set**: a
knowledge-free guesser picking the longest option scores **37%**, down from **90%**,
against the 80% exam pass mark it used to clear. Its median margin is 1.5 characters
and its widest is 3.

**All four Section 1 months landed at 74–76%, not higher, on purpose** — the metric's
optimum is chance, not its maximum. See *Contradicting the audit*, item 1; this is
the one place the plan's framing had to be corrected rather than followed.

**Month 3 was finished too**, though the plan's work order stopped at Months 1–2.
Leaving one month of a section at 59% while its three siblings sat at 75% would have
left the inconsistency the tier exists to remove, and it cost sixteen option edits.

**Section 2 was left at its aggregate**, as the audit scoped it — 65% is within a
rounding of chance and it was never the problem. But **its four questions with a
margin ≥ 10 were repaired** (`p3-03` at 20, `p4-04` at 13, `p6-05` at 14, `p4-03` at
10), which is what drops its max margin from 20 to 9 while the aggregate barely
moves. See *Contradicting the audit*, item 5.

**N16 was not done.** The one-sidedness family (**A8**, **C9**, **C10**, **D13**,
**E18**, **F10**) is still open — six Section 1 sites where the mirror side is
dropped. It is a should-fix in no tier, it is genuinely *"roughly six sentences and
needs no new sourcing"*, and nothing in Tier 3 or Tier 4 touched it. It remains the
cheapest unclaimed item in the document. **→ Done in the unscheduled pass below,
where it cost six sentences at five sites; `E18` turned out not to be one of them.**

### What was deliberately not done

- **M14's summary recommendation was not carried out**, and the Tier 2 table in the
  closing section is amended to say why. §3 restricts a summary to re-stating
  **existing lessons**; the authorship caveat existed **only in ep38's transcript**
  (`author` is 0 across all 40 Section 2 lessons). Putting it on the summary would
  have made the summary carry material no lesson does — **M2**'s exact shape. The
  caveat went into `p6-05/lesson.html:10` instead, where §1 permits the transcript,
  and was **not** propagated onward. A later pass may now add it to the summary
  legitimately, because a lesson carries it. **→ Taken up in the unscheduled pass
  below; `s2 summary.html:280` now carries it and M14 is closed.**
- **Every item on the *deliberately unresolved* list was left alone** — the two OTE
  bands, the disputed name at `p6-05:26` (omitted from the new summary clause
  rather than spelled), the two pyramid ladders, the five-candle-fractal qualifier,
  the `back test` variants, the two section house styles, and the exam/quiz stem
  re-use.
- **Tier 3 and Tier 4 were untouched at the end of the Tier 1–2 pass**; both were
  completed afterwards and are recorded in their own sections above. The one thing
  carried across is that the Tier 1–2 pass moved no question count: its single
  allowed exception, `m3-07`'s q4, was rewritten rather than cut. All 28 additions
  belong to Tier 3.
- **E2** (`m4-11/lesson.html:10`) was left in place by the Tier 1–2 pass and flagged
  there as the thing that **should lead Tier 3's Section 1 work**. It did — it is the
  first row of the Tier 3 table, and it is now repaired.
- **N16 was not done** (the one-sidedness family, six Section 1 sites). It is a
  should-fix in no tier and remains open; see the note closing the Tier 4 section.
  **→ Done in the unscheduled pass below.**
- **Section 2's quizzes were not rewritten for option length**, only its four
  margin ≥ 10 outliers. Its aggregate was never the defect.

### Nothing was blocked by a §1 gap

No replacement in Tiers 1 or 2 required a source the audit had not already quoted,
and none needed new authoring beyond `m3-07` q4 and `s1 exam.js` q39 — both of
which the plan specified and both of which are traceable to their own lesson's
transcript.

**Tier 3 held to the same standard, and this is the tier where a §1 gap would have
shown up**, because it is the only one that authors new material. It did not:
each of the 28 questions was written after re-reading that lesson's own notes or
transcript, every correct option and `e` is quoted or paraphrased from a line
recorded in the Tier 3 table, and **no lesson exhausted its sourced material before
reaching the floor of 4**. Nothing had to be capped at 3 for want of a source, and
nothing was invented to reach the floor. Tier 4 authored no new claims at all — it
changed only distractor and option wording, never a `q`, an `a` or an `e`.

There is nothing in any tier to flag as unfixable.

#### One state-model correction, caught on the final check

**`ict-exam`'s `picks` are keyed by question *index*, not by option text — only the
*value* is text.** `CLAUDE.md` §3 reads *"`picks` are stored by **option text**,
since options re-shuffle on every render"*, which is true of the value and easy to
read as true of the key. `app.js:300` is `picks[qi] = o.text`.

This matters because the Part 3 exam question was first filed **inside the Part 3
block**, mid-array, which read as the tidy choice. Doing so shifted the index of
**19** later questions and would have silently re-pointed the stored picks of anyone
holding an un-submitted exam — the exact failure the append-only rule exists to
prevent, in the one file where the documented state model appeared to permit an
insertion. **All three exam additions are now appended**, under a comment in
`exam.js` recording why they sit outside their part blocks.

A mechanical check confirms the final state: **536 pre-existing questions verified in
place** (same stem, same correct option, same order) and **28 appended**, across all
80 quiz and exam files. The only in-place changes are six correct-option *rewordings*
from Tier 4, all in `quiz.js` files — which `ict-quiz` keys by index, so no stored
result moves — and each preserves its meaning with the precision pushed into `e`,
per §3.

### Contradicting the audit — eight things

Each batch found at least one. The Tier 1–2 pass found three, two of them the same
class of error batch N found in the plan itself — **a defect measured at one site
when it exists at two**. Tiers 3 and 4 found five more, and the most important is
the first: **a metric the whole tier is built on is two-tailed, and the plan treats
it as one-tailed.**

*Items 1–3 are the Tier 1–2 pass; items 4–8 are Tiers 3 and 4.*

1. **E1 is two sites in `m4-11/lesson.html`, not one.** The audit names `:9`, the
   first bullet. The **hero `desc` at `:5`** carried the identical reversed
   definition — *"Where no trading took place at all — big one-sided candles that
   price returns to balance out"* — and it is the line a reader meets **before** the
   bullet, in the nav card and at the top of the page. Repairing `:9` alone would
   have left the lesson asserting the blocker in its own summary line. Both fixed.
   The likely cause is the same one batch N diagnosed for its four figure
   corrections: a scan scoped to the finding's own quoted line.

2. **N11 is two sites in `s2 summary.html`, not one.** N11 promotes the *"$5 on the
   micros"* row at `:342` to a finding specifically because *"the row's internal
   ES/NQ split is what promotes it"* — but **`:24` has the identical split in the
   identical sentence**: *"$50 on ES, $20 on NQ, $5 on the micros."* Fixing only
   `:342` would have left one page stating two different micro figures eighteen
   screens apart, which is worse than either error alone. Both fixed, from the same
   four lessons N11 cites.

3. **M5's `:231` fix is an *addition*, not a substitution — and the plan's phrasing
   would have made it worse.** The plan reads *"`.src` **(L1, L2)** → **(P3 L6)**"*,
   which reads as re-marking the reference. But that `.src` sits on the block's
   `<h4>` and is **correct for the counter-trend rule the block is about**; only the
   warning at `:231` comes from `p3-06`. Re-marking the heading would have
   mis-attributed three sourced clauses to fix one. The warning got its own nested
   `.src` instead — which is exactly why **N10**'s CSS fix had to land first, since
   a `.src` inside a `.tag` did not render before it. **The two Tier 2 items are
   coupled, and the plan lists them as independent.**

4. **The not-longest metric is *two-tailed*, and Tier 4 treats it as one-tailed.
   This is the most consequential correction in the fix pass.** The plan states the
   chance level correctly — *"the share of questions where the correct option is not
   the longest. **Chance is ~75%**"* — and then sets the goal as *"14% → **the S1
   exam's 69%** is the target"*, with every surrounding sentence reading as
   *higher is better* (*"the metric to move"*, *"every other set is between 62% and
   69%"*).

   Built the obvious way — lengthening every conspicuous distractor — **Month 4 went
   to 100% not-longest**, and that is not the fix. At 100%, *"eliminate the longest
   option"* converts a blind 25% guess into a **33%** one: the same exploitable
   regularity as before, pointing the other way. The 44 original questions handed a
   longest-picker 90%; a 100% set hands an eliminator a third. **Only ~75% — chance
   — is unexploitable in both directions**, which is why an unbiased corpus lands
   there and why the S1 exam's 69% looked good in the first place. It is not a
   ceiling to climb toward; it is the value the exam happens to sit near.

   So Month 4 was deliberately **tuned back down from 100% to 75%**, by restoring a
   uniquely-longest correct option on 14 of its 55 questions at margins of 1–3
   characters — margins at the S1 exam's own median of 1, far too small to read off
   a screen. Months 1, 2 and 3 were built to the same target and landed at 74%, 76%
   and 75%. **The published table should be read as a two-sided target of ~75%, and
   any future section that reports 90%+ on this column has the same defect as one
   reporting 14%.**

5. **`m4-08` is not *at the margin* — it is the twelfth instance of the same
   defect.** The plan lists the eleven under-tested lessons, then `m4-08` separately
   with *"+2 if you want it"*, and records that the audit *"did not commit"*. But the
   basis for the eleven is **C18**/**E18**'s test — coverage out of proportion to
   material — and `m4-08` fails it the same way: two questions against a five-bullet
   lesson carrying at least two untested sourced claims (the mean-threshold break as
   *immediate feedback to reverse or stand aside*, and the bearish mirror). Both were
   written from the lesson's own note page without difficulty. **The marginal call
   appears to come from the lesson being short, not from its material being thin** —
   which is the same length-versus-content confusion batches C and D settled for note
   pages. Added; `m4-08` is at 4.

6. **The plan files `p3-06`'s stand-aside rule under *"S2 exam, Part 6"*, and it is a
   Part 3 lesson.** All three named exam candidates sit under a heading reading
   *"S2 exam, Part 6 — +2 to +3"*, but `p3-06` is Part 3, Lesson 6. Adding it to the
   Part 6 block would have broken **M9** — the audit's own certification that
   Section 2's **40 of 40** exam questions name the lesson the question actually
   tests, *"the first clean set in the corpus"*. The two genuinely-Part-6 candidates
   (`p6-07`'s keys to daily bias, `p6-05`'s narrative definition) went to Part 6,
   fixing **M10**'s under-sampling; `p3-06`'s went to the Part 3 block cited
   `(Part 3, Lesson 6)`, fixing that **M11** coverage gap where it belongs. **The two
   findings are separable and the plan's heading fuses them.**

7. **F7 is a coupling, not a typo — and its second site was correct until Tier 3
   made it wrong.** The Tier 1–2 pass fixed `s1 summary.html:311` (*"40 questions"* →
   45) and could not have found a second site, because `s2 summary.html:390`'s
   *"40 questions across all six parts"* **was accurate** at the time. Adding three
   exam questions broke it, and it was fixed in the same pass. This is a different
   shape from items 1 and 2: not a defect measured at one site when it exists at two,
   but **a latent dependency between `exam.js` and the summary page that nothing
   enforces**. `verify.py` counts exam questions and checks the summary renders, but
   never compares the two, so the next exam edit will silently desynchronise them
   again. Both pages are correct today (45 and 43). **If one check is ever added to
   `verify.py`, this is the one** — it is the only content figure in the corpus that
   a build can already compute and doesn't. **→ Added in the unscheduled pass below,
   and negative-tested; the desynchronisation this paragraph predicts can no longer
   reach a commit.**

8. **An aggregate near chance can still hide a fat tail, and Section 2's did.** The
   audit grades S2's quizzes acceptable at 64% not-longest and moves on — correctly,
   as an aggregate. But **F14**'s column is a *count*, and the method notes report
   median margin only conditionally, so neither figure sees magnitude. Section 2 held
   four questions with the correct option longer than every distractor by **10 to 20
   characters** — `p3-03` at 20 (a 58-character correct option against a 38-character
   runner-up), `p6-05` at 14, `p4-04` at 13, `p4-03` at 10. Any one of those is
   readable at a glance, and they were invisible in a 306-question mean. All four
   fixed: S2's **max margin falls 20 → 9** while its not-longest moves 64% → 65%,
   which is precisely the point. **A future measurement should report the max margin
   and the count over 10, not just the share and the median.**

### The unscheduled pass — the four items no tier owned

Run **2026-08-08**, after Tiers 1–4 were committed, against the work the repair
plan never scheduled. **Four items closed, one triage proposal opened and
deliberately not authored.**

`python build.py` emits **zero warnings** and `python verify.py` reports
**78 lessons, 339 images, 78 video links, 476 quiz questions, 2 summary pages,
88 exam questions across 2 exams, 0 JS errors** — the post-Tier-4 baseline
unchanged on **every** figure, including both question counts. Nothing was added
or removed anywhere; the pass's only quiz edit is an in-place re-authoring, and
its only new code is a check in `verify.py`.

#### K11 — the corpus's only duplicate question. Re-authored in place, not cut.

| Site | What changed | Source |
|---|---|---|
| `p5-05/quiz.js:5` (index 3) | The duplicate of Q3 — *"What does he say to students who only watch for the opening setup?"* — replaced by **"Why are the examples index futures rather than forex?"** → *"It is where the volatility is right now"*. Options 37–39 chars; the correct one is **not** the longest. | ep31:22-33 (*"I'm pushing this asset class because this is where the volatility is — price is price, it doesn't make a difference"*, *"when forex starts moving around big again… index futures will get slower and quiet in comparison"*) and 44-59 (*"we have to look for volatility where we can find it"*, *"learn from it because it works the same way in forex"*) |

**Replaced, not cut** — the lesson's whole opening block (*"Why the examples are
index futures, not forex"*, `p5-05/lesson.html:11`) was untested by all eight
questions, so the material to replace with was already there and §1-clean, and
cutting would have taken the quiz to seven for no gain.

**Q4 was re-authored in its own slot rather than cut-and-appended**, which is a
deliberate departure from the brief's *"append if you replace; do not reorder"*.
The reason the brief gives for that rule is `ict-quiz`'s index keying, and
in-place re-authoring serves it **strictly better**: cutting index 3 and
appending would have re-pointed **four** stored keys (old indices 4–7 sliding to
3–6) plus created a new one, where re-authoring re-points exactly **one** — the
unavoidable minimum, since one of the two duplicates must change meaning either
way. Nothing moved, so Q1–Q3 and Q5–Q8 still key to the same questions. Q3 was
kept because it is the tighter of the two stems.

#### N16 — the one-sidedness family. Done, at the third time of asking.

Five sites, all Section 1, all mirrors already present in Section 1's own source:

| Site | What was added | Source |
|---|---|---|
| `m1-06/lesson.html:30` (**A8**) | The bullish orderblock's stated counterpart: the **up candle before the market drops** — *"that up candle is exactly where resistance is on an institutional basis, so that's where selling occurs."* | `Fair Valuation.txt:471-474` |
| `m1-06/lesson.html:34` (**A8**) | A new `.callout` — *the same thing for a short*: look for where **the market in the past has moved up a great deal with speed**, for the **lows where stops would be building up below** them (sell-stop pools), and take **the lower end of the most recent range** as the valuation. | `Fair Valuation.txt:569-578` |
| `m3-05/lesson.html:22` (**C9**) | The **fourth SMT cell**, the one that lets a reader diagnose a dollar *top*: USDX **fails to make a higher high** while FX makes a lower low → underlying dollar weakness, the FX low accumulating sell stops, then the rally, the dollar selling off, *"which would support foreign currency long positions."* | `Institutional Market Structure.txt:156-183` |
| `m3-07/lesson.html:22` (**C10**) | A new `.callout.rule` giving the **buy-side phantom play**: retail adopts trendline *resistance* in a falling market, *"the chart may appear bearish but the underpinnings are in fact the opposite"*; the target is the **low between point 2 and point 3**, *"I'm looking for a bullish orderblock at that low in between the two points"*, **or a break just below it for a turtle soup long entry**. | `Market Maker Trap Trendline Phantoms.txt:221-259` |
| `m4-02/lesson.html:18` (**D13**) | A new `.callout`: bearish on the monthly or weekly and you look for the opposite — **retracements higher**, **low-resistance liquidity runs to break below a swing low** — with the pip thresholds unchanged (40+ for the day trade, 75–100 on the hourly). | `Reinforcing Liquidity Concepts & Price Delivery.txt:960-976` |
| `s1 summary.html:209` (**F10**) | A third `kv` row restoring **both** non-symmetrical mirrors the summary had dropped — USDX fails to make a lower low while FX makes a higher high (dollar strength), and the new C9 cell (dollar weakness). §3 is satisfied because `m3-05` now carries both. | `m3-05/lesson.html:21-22`, a lesson |

**D13 is marked PARTLY FIXED**: only its third drop, the bearish mirror, is in
scope for **N16**. Its other two (the drop-to-a-weekly fallback, the
position-trader averaging passage) are coverage items and stand.

#### M14's summary half — now permitted, and taken

| Site | What was added | Source |
|---|---|---|
| `s2 summary.html:280` | A `.callout.warn` opening the Part 6 L5 block, mirroring the lesson's own *"Read the caveat before the lecture"*: *"because **I'm the author of these concepts** I have a lot of tools at my disposal, and I have **a little bit better understanding of price delivery than the average student** of mine"* — an **advanced manoeuvre**, not a technique to copy off a 15-minute chart. | `p6-05/lesson.html:10`, **a lesson** — which is the whole basis on which §3 now permits it |

Tier 2's refusal was correct when it was made and is not retracted: the caveat
then existed only in ep38's transcript, and a summary may not carry material no
lesson does. Tier 2's own fix — putting it in `p6-05` — is what made this legal.
**M14 is now FIXED**, not partly: all three part-level hedges reach the summary
(no-timetable at `:261`, live-funds at `:294`, authorship at `:280`).

#### F7 — the coupling is now enforced

| Site | What changed |
|---|---|
| `verify.py` | New check. For each section carrying `summary.html` + `exam.js` + `section.js`, the question count the summary states in prose is parsed (`Final Exam …(\d+) questions`) and compared against the exam that actually renders, matched by `data-exam`. A summary stating **no** count passes; one stating a **wrong** count fails, as does a stated count with no exam behind it. |
| `CLAUDE.md` §5 | Its bullet list of what `verify.py` checks gains the new line. |

**Negative-tested, not merely added.** `s1 summary.html`'s 45 was perturbed to 44
and `verify.py` failed with `exam s1: summary.html says 44 question(s), exam.js
renders 45`, exit 1; reverting restored the clean run. Both pages are correct
today (45 and 43), so the check passes on the current tree.

#### The Tier 5 triage — proposed, not authored

The remaining **77 should-fix / 147 nits** were read via the two roll-ups and
batch N and sorted by *whether the corpus says something the source does not*
(a §1 defect) rather than *whether the source says more than the corpus*
(condensation, which is what a lesson is). Four groups were proposed —
**5A** fidelity, **5B** dropped hedges, **5C** taught-but-not-tradeable, **5D**
option length — and agreement was given for 5A, 5B and 5D. **They were authored
in the same session and are recorded in the Tier 5 section below.** Two
housekeeping results from that read are recorded here as contradictions.

#### Contradicting the audit — five more things

1. **`p5-05` is episode 31, not 32.** The brief for this pass named
   *"ep-32 transcript + `notes/2022-mentorship/ep-32.md`"* as **K11**'s
   re-authoring source. Part 5 carries the episode-number offset the audit
   itself flagged (`p5-03` = episode 29), so `p5-01`…`p5-07` map to 26, 27, 29,
   30, 31, 32, 33 — `p5-05` is **episode 31**, which is also what **K11**'s own
   entry cites (`ep31:154-161`) and what `p5-05/video.txt` points at. The
   replacement question was written from **ep31**. Sourcing it from ep-32 would
   have been a `p5-06` import — precisely the migration defect that produced
   every Section 1 blocker, arriving through a plan document rather than through
   a note page.

2. **The one-sidedness family has five lesson-level sites, not six — `E18` is
   not one of them.** The family list *"A8, C9, C10, D13, E18, F10"* is repeated
   six times in the document, but **E18**'s own entry is the *quiz-count*
   proportionality finding for Month 4b, and the one-sidedness inside it is
   **quiz**-level: *m4-14's double-bottom mirror is untested* and *m4-08's
   bearish mirror is untested*. Those are not lesson prose with a missing mirror
   — and **both were already closed by Tier 3**, which added +1 to `m4-14` and
   +2 to `m4-08` for exactly that material. So N16 was **five sites plus two
   already-fixed quiz gaps**, and the estimate that survives is the useful one:
   *"roughly six sentences and needs no new sourcing"* was accurate — it took six.

3. **`B11` and `I7` were closed by Tier 4 and never marked.** Both are named in
   the open should-fix list, and both are quiz-construction findings that Tier 4's
   sweep repaired without crediting. Re-measured on the current tree with the
   **I17** regex: `m2-02` q2 (**B11**, *"the worst single question in Months 1-2"*,
   36/30/17/10 with the correct option longest) now runs 28/36/37/27 with the
   correct option **not** longest — the file is 3/4 not-longest, max margin 3.
   `p3-03` q7 (**I7**, *"the worst-constructed question in Section 2 so far"*,
   58/38/34/28) now runs 53/44/50/44, margin 3 — it was one of the four margin-≥10
   outliers Tier 4 repaired. Both are marked `· FIXED by Tier 4` in place. **The
   open-findings count is therefore 75 should-fix, not 77**, before this pass's
   own five.

4. **`G16` and `L25` are the two option-length findings that genuinely remain,
   and they are one-tailed in the safe direction.** The caution against re-running
   Tier 4 is that the not-longest metric is two-tailed and Section 1's months sit
   at 74–76%, which is chance. That caution does not reach these two: `p1-06`
   (**G16**) measures **25%** not-longest, max margin 8, max spread 15, and
   `p6-04` (**L25**) measures **20%**, max margin 7 — i.e. the correct option is
   the longest **three or four times in five**, a long way *below* chance on the
   same scale. Moving them toward 75% is not the mirror-direction over-correction
   the caution warns about; it is the correction the caution assumes has already
   happened everywhere else. They are the only two per-file sets in the corpus
   still in that state.

5. **The `.src` fix's blast radius reached this pass.** Nothing new was found in
   `engine/`, but the F7 check had to read `section.js` to get each section's id,
   and `content/s1-ict-core/section.js` still carries the stray `;` before its
   closing brace that §3 warns a formatter inserts. `build.py`'s `parse_objs`
   neutralises it, and the new check's `id\s*:\s*"([^"]+)"` regex is likewise
   indifferent to it — but **any future tooling that reads these files as JS will
   trip on it**, and the audit records the hazard without ever recording that a
   live instance of it is sitting in the tree.

### Tier 5 — the triage, authored

Run **2026-08-08**, immediately after the unscheduled pass above, on the triage it
opened. The remaining 75 should-fix were sorted by *does the corpus say something
the source does not* (a §1 defect) rather than *does the source say more than the
corpus* (condensation, which is what a lesson is). **Three of the four proposed
groups were authored — 31 findings across 26 files. 5C was not** (see below).

`python build.py` emits **zero warnings** and `python verify.py` reports
**78 lessons, 339 images, 78 video links, 476 quiz questions, 2 summary pages,
88 exam questions across 2 exams, 0 JS errors** — unchanged on every figure,
including both question counts. **No question was added, removed or reordered**;
two quizzes had option text rewritten and two had a single question re-authored
in place.

#### 5A — fidelity: eighteen sites where the corpus said what the source did not

| Finding | Site | What changed | Source |
|---|---|---|---|
| **C3** | `m3-07/lesson.html:10` | The **manufactured quotation** — *"If everyone's looking at the same thing and everyone can't win, the majority has to be wrong"* — replaced by the three real lines C3 identified: *"price has no awareness of your trendline… price only respects where the actual liquidity is"*, the banks *"don't care what you're scribbling all over your charts"*, and confidence in a line being *"really associated closely to flipping a coin."* | `Trendline Phantoms.txt:68-76`, `127-134`, `285-292` |
| **F3** | `s1 summary.html:222` | C3's propagation, which had been **promoted from quotation to assertion**. *"the majority has to be wrong"* → *"price has no awareness of the line — it only respects where the liquidity actually is."* | same |
| **F4** | `s1 summary.html:223` | *"the **single worst thing** a trader can do"* → ICT's actual register: *"**one of the worst games to play**, especially for the new trader — even seasoned pros don't do it."* | `Head Shoulders Pattern.txt:108-120` |
| **B1** | `m2-02/lesson.html:22` | The invented comparison *"the same move that gives the hourly trader 1:1 gives you 3:1"* → what the source says: by the time price reaches **7542**, where the hourly trader is **only just being filled**, the refined trade is already at **3R**. The overstatement was a full R. | `Framing Low Risk Trade Setups.txt:209-217` |
| **F5** | `s1 summary.html:123` | B1's propagation, same replacement. | same |
| **B2** | `m2-02/lesson.html:19` | *"buyer at 7520, stop 7507 — 17 pips"* (7520 − 7507 = **13**) → *"buyer at 7520, with ICT's stated **17-pip stop**"*. The explicit level is dropped rather than guessed, per §1; the 5-minute row keeps 7507, which is the reading that makes **its** arithmetic right. | B2's own analysis; transcript renders the level `757` at both sites |
| **C4** | `m3-01/lesson.html:31` | The lesson's three flip cards and its own quiz named **two different triads**, so a reader could not answer the quiz from the lesson. Added ICT's second naming — *orderblocks, stop runs (turtle soup), liquidity voids* — as the same three from the other end. Quiz untouched. | `Timeframe Selection.txt:1345-1362` |
| **D1** | `m4-05/lesson.html:26` | *"A breaker uses the **entire candle range and the bodies**"* — two rules asserted as one. Now the entire candle range only, with ICT's stated reason for the candle choice. **The "bodies" half is dropped, not demoted**: its only source is the note-taker's *"that's what I saw in another video"*, an outside-teaching import §1 does not permit. | `ICT Breaker Block.txt:230-236` |
| **D1** | `m4-05/quiz.js:3` | The `e` that repeated the merged phrase. Options, `q` and `a` untouched. | same |
| **H1** | `p2-01/lesson.html:16` | The **reversed verb**. *"they tend to **lack** the double return"* → *"they **tend to give** a double return to a specific level"*, plus the demonstration that settles the ambiguous sentence: swing high, rally through it, no fair value out there, drop back in, run again and take it. | `ep8:50-64` |
| **H3** | `p2-02/lesson.html:49` | The $85-on-six-micros figure implies **$1 per handle** and contradicts `p2-06`'s **$2**. The number is ICT's own rough maths, so it stays — with the hedge he attaches to it (*"I'm roughing, I don't have a calculator"*), the two harder figures from the same breath ($54 of heat on six micros; **$20 per handle** on the mini), and a pointer to Lesson 6's **1 point = 4 ticks = $2**. | `ep9:536-562`; `ep13:344-352` via `p2-06` |
| **I1** | `p3-01/lesson.html:22` | The unsourced purpose clause *"Anticipating the pause is what stops the pause from shaking you out"* deleted. | — |
| **I1** | `p3-01/quiz.js:4` (index 2) | The question built on it re-pointed at what ICT does say: *"What does he expect price to do around 14,120–14,140?"* → **"Consolidate and reaccumulate for new longs"**. Re-authored **in its own slot** (one `ict-quiz` key re-points, not four). | `ep14:38-45` |
| **J1** | `p4-02:70` | *"roughly **$8,000 to $12,000**"* — a range manufactured by putting two position sizes behind one subject. Split: **$12,000** for what he was actually carrying, **$8,000** for one contract held and let run. | `ep21:539-542`, `655-660` |
| **K1** | `p5-03/lesson.html:27-28` | **Three fills where the episode has two.** *Second fill* and *The add* merged into one row — the 3996.25 seven-tick fill **is** the limit-order add. | `ep29:226-239`, `196-198`, `262-272` |
| **K2** | `p5-03/lesson.html:31` | The close-proximity characterisation moved from the second fill back to the **first**, where the source puts it — and where it belongs, because the first is the one the Camtasia restart cost him, which is what motivates the rule. | `ep29:272-285`, `164-174` |
| **K3** | `p5-03/lesson.html:27` | *"less than one handle of heat"* printed beside 3994.50 and 3993.25, which give **1.25**. Now states 1.25 and records that ICT talks himself down to *"less than one handle"* mid-sentence — the self-correction the same lesson resolved correctly one row below. | `ep29:276-277` |
| **L11** | `p6-03/lesson.html:23` | Two trades presented as one. The management callout keeps the entry-and-partials chain; a new callout reports that ICT names **a second trade** and that **which figures belong to which is not resolvable from the episode** — flagged, not resolved, per §1. | `ep36:100-119`, `197-218` |
| **L29** | `p6-06/lesson.html:98` | *"support and resistance is a fallacy"* stated flat, with ICT conceding the opposite twenty lines later. The concession restored, conditional as he states it: *"Can you make money with retail concepts? Yes. Yes you can — <strong>if</strong> you understand how to reprice like I'm teaching it."* | `ep39:1199-1207` |

#### 5B — the dropped hedges: twelve sites where omission strengthened the claim

Removing a qualifier makes the surviving claim stronger than the source, which is
an over-claim by omission and cuts directly against §1's prefer-under-claiming.

| Finding | Site | What was restored | Source |
|---|---|---|---|
| **H14** | `p2-05/lesson.html:38-39` | Both halves: **(a)** the algorithmic rationale that makes the taxonomy a stop-location forecast — *"it cannot see your stop… <strong>but it knows where people will have their stops based on these ideas</strong>"*; **(b)** ICT's epistemic hedge — *"I'm creating a language… <strong>not exactly like the algorithm does, but very, very close</strong>"*. | `ep12:806-841`, `851-862`, `1066-1075` |
| **H19** | `p2-06/lesson.html:10` | The **$256,000** context behind the 21% morning, and both failure modes ICT names it to avoid: disbelief, and imitation with a live account. *"Either one of those things are not my goal."* Plus H19's third statement of the create-a-language hedge. | `ep13:17-31`, `863-883`, `1141-1165` |
| **I4** | `p3-03/lesson.html:9` | Both **hindsight caveats** on a lesson that presents six setups found in review: *"obviously I have the benefit of hindsight here"*, and *"it's not contrived, it's not form-fitted, it's not cherry-picked."* | `ep16:81-84`, `1137-1150` |
| **I10** | `p3-05/lesson.html:8-9` | *"**there is no method that hits every single time**… it's imperfect"*, the operator-ownership clause, *"if I had a way that I would never lose, I would have never came out publicly"* — plus the win-rate teaching that was **absent from Part 3 entirely**: *"a risk-to-reward model is essential for you to be net profitable. **That's not true.**"* | `ep18:117-135`, `377-380`, `388-401` |
| **J2** | `p4-02:40` | The hindsight qualifier on the lesson's strongest read: *"obviously **with the benefit of hindsight**, it's extremely bearish."* The lesson had followed `ep-21.md`, which drops it — the third instance of preferring the note over the transcript, and the only one with a consequence. | `ep21:499-512` |
| **J13** | `p4-05` tail | *"**If it doesn't fit you, folks, there's a lot of other ways to trade. You don't need to trade my way.**"* | `ep24:768-773` |
| **J13** | `p4-06` tail | *"**If it doesn't fit you there's no harm in that**… What's the difference? Personality and capacity."* | `ep25:1596-1608` |
| **K4** | `p5-02` tail | The authorship asymmetry: *"**I'm the author of this algorithm, so I can operate in it very efficiently. You, as a student of mine, you have to understand my language first.**"* | `ep27:421-434` |
| **L5** | `p6-02/lesson.html:9` | That the whole example **sits outside the model** — raised twice, unprompted: *"teaching you something that is outside the model"*, *"I'm not limited to this model."* | `ep35:146-153`, `413-423` |
| **L20** | `p6-04/lesson.html:9` | The **live-money warning** that frames the lesson: *"if you're out here trying to gamble with live money — which is what none of you should be doing"*, the paper-then-demo sequence, *"you've done that on your own — I've done nothing to instigate that"*, and *"I try to be responsible as a mentor."* | `ep37:71-85`, `151-153` |
| **L22** | `p6-04/lesson.html:51` | The two qualifiers on the timetable: *"weeks and months — <strong>how much time I don't know</strong>, maybe half a year or so, certainly by the first year"*. Removes the cross-lesson conflict with `p5-02:54`'s no-timetable statement. | `ep37:637-645` |
| **L30** | `p6-06/lesson.html:126` | The son's model's **two brakes**, both conditions for standing down: no medium/high-impact news → *"he shouldn't be engaging with his normal risk percentage"*; and no pattern → *"he has to just move to the sidelines and do nothing."* | `ep39:1259-1268`, `856-866` |
| **L37** | `p6-07/lesson.html:63` | The qualifier on the six-rule bias procedure, from the same breath as Rule 1: *"**I'm not a hero**… a procedure and process that will lead to an outcome that **generally — not all the time, but generally** — yields a specific result"*, plus *"sometimes I get it wrong."* | `ep40:591-607`, `658-659` |

#### 5D — the two option sets still below chance

| Finding | File | Before | After |
|---|---|---|---|
| **G16** | `p1-06/quiz.js` | 8 questions, **25%** not-longest, max margin **8**, max spread **15** | **75%**, max margin **1**, max spread **6** |
| **L25** | `p6-04/quiz.js` | 10 questions, **20%** not-longest, max margin **7**, max spread **13** | **70%**, max margin **1**, max spread **7** |

Tier 4's discipline was kept exactly: **no `q`, no `a` and no `e` changed** — only
option text — verified mechanically against `HEAD` for both files, so no stored
`ict-quiz` result changed meaning. Distractors were lengthened into plausible wrong
*mechanisms* rather than the correct option being padded.

**Both were deliberately landed at chance, not at the maximum.** A first draft
reached **100%** on both, which is the two-tailed over-correction Tier 4 warned
about: at 100% *"eliminate the longest option"* turns a 25% guess into 33%. Four
options were walked back to put the correct answer marginally longest again.

#### What 5C was, and why it was not done

**5C — "taught, but not tradeable"** (`D3`, `D4`, `E5`, `E6`, `E9`, `E11`, `E12`,
`E17`, ~8 findings) was proposed with the honest caveat that it is *debatable as a
defect*: batch E's shape is that four of seven Month 4b lessons teach what a thing
**is** and never how to trade it, and `m4-02` never defines the two terms its own
bullets carry. It is real, but it is a **completeness** judgement rather than a §1
one — the lesson does not say anything the source doesn't.

**It was put to the author and declined**, in those terms: *"I am okay with the
content of the lessons, no need to throw extra stuff in."* That is a scope
decision, not a fidelity one, and it closes 5C — **`D3`, `D4`, `E5`, `E6`, `E9`,
`E11`, `E12` and `E17` stay open and should not be re-proposed.** **The ~37
remaining coverage findings were declined for the stronger version of the same
reason**: the source saying more than the lesson is condensation working as
designed, and authoring them all would roughly double Section 1's lesson lengths
for no fidelity gain.

**Where that leaves the corpus.** Everything the audit found where **the course
says something its source does not** is now repaired — all 6 blockers and every
5A/5B site. What remains open is, by construction, **material the source carries
and the lessons chose not to**. That is a different class of finding, and the
decision on it has been made.

#### Contradicting the audit — three more things

1. **The published option-length figures use "not *uniquely* longest", and a
   plausible reading of the method note gives the wrong answer by ~15 points.**
   Re-measuring with `L[correct] < max(L)` — the obvious reading, "the correct
   option is strictly shorter than the longest" — returns **S1 quizzes 60%, S1 exam
   44%, corpus 54%**, against the published **75% / 69% / 68%**. The definition that
   reproduces every published figure to the digit is **`L[correct] <= max(others)`**:
   a correct option **tied** for longest counts as *not longest*. That is defensible
   — a tie gives a guesser nothing — but it is nowhere stated, and Tier 4 drove
   margins toward zero, which manufactures exactly the ties the two definitions
   disagree about. **Any future measurement must state which it is using**; the
   `I17` regex note is necessary but not sufficient.
2. **`p3-03` is a third set below chance, and it is not a logged finding.**
   Measured now: **27%** not-longest across 11 questions, max margin **7**. `I7`
   filed only its single margin-20 question, which Tier 4 fixed, so the *set* was
   never logged and appears in no list. It was left alone deliberately — it is
   outside the agreed Tier 5 scope — but it means **G16 and L25 were not the only
   two**, as the unscheduled pass's contradiction 4 asserted. The right statement is
   that they were the only two *logged* ones.
3. **`D1`'s fix is a deletion, and the audit's suggested alternative was unsafe.**
   D1 offers *"if the body variant is worth keeping, mark it as the alternative the
   note calls it."* But the note's own words are *"that's what I saw in **another
   video**"* — an explicit import from a different teaching, which §1 forbids
   regardless of how it is labelled. Marking it as an alternative would have kept
   outside material in the lesson with a citation attached. It was dropped instead,
   and the space filled with ICT's stated reason for the candle choice from this
   lesson's own transcript. **A note page is a permitted source; a note page
   reporting another teaching is not.**

## Fixed in flight

Genuinely-broken things repaired during the audit rather than logged.

### 1. The `p3-01` spurious `.fig-slot` — batch I, 2026-08-08

**The only entry through batch I, and the only edit made to `content/` in nine
batches.**

**What was wrong.** `content/s2-2022-mentorship/p3/p3-01/lesson.html` declared
`<div class="fig-slot" data-slug="p3-01-a-requested-execution-the-model-in-real-time">`
with no matching `images/p3-01-…-NN.png`, so the slot rendered nothing and
`build.py` emitted a warning on **every** build:

```text
warning: content\s2-2022-mentorship\p3\p3-01: data-slug="p3-01-a-requested-execution-the-model-in-real-time"
         has no images/p3-01-a-requested-execution-the-model-in-real-time-NN.png (no charts render)
```

**Why it qualified for repair rather than logging.** Three reasons, all of which
had to hold:

1. **It was the repo's only build warning**, and `CLAUDE.md` §5 records that CI
   runs `build.py` on every PR — so this was noise sitting in the one place a real
   regression would show up.
2. **The source genuinely has no charts, so it is not a scrape gap.** `ep-14.md`
   contains **0** image references and `notes/2022-mentorship/raw/ep-14-*.png` is
   **empty**. Confirmed independently by the batch-wide chart count (0/1/7/2/2/1 =
   13, matching on all three of notes → `raw/` → `images/`). There is nothing
   missing to restore.
3. **It was inconsistent, not merely empty.** p1-01, p2-01 and p2-04 also have no
   charts and each carries **no `data-slug` at all** plus an annotating comment —
   which the structural observations call the Section 2 convention. p3-01 was the
   one lesson carrying a live slot that renders nothing.

**The fix**, one line, matching the existing convention verbatim:

```diff
-  <div class="fig-slot" data-slug="p3-01-a-requested-execution-the-model-in-real-time"></div>
+  <!-- no fig-slot: the notes carry no charts for this episode -->
```

**Verification.** `python build.py` now reports `78 lessons, 67 image sets, 78
quizzes, 4 review page(s) across 2 section(s)` with **zero warnings** — the image
set count is unchanged at 67, confirming the slot was rendering nothing before.
`python verify.py` passes with 0 console/page JS errors.

**This resolves the "S1 · `p3-01` slug with no images" item** in *Structural
observations*, which was deferred to this batch.

### Nothing else

*None through batch N — the audit is complete.* Nothing else in `content/` has
been edited. `build.py` and
`verify.py` pass at every batch, the page has 0 JS errors, and all Section 1 HTML
is well-formed (`summary.html` checked mechanically in batch F: zero unclosed
tags, zero mismatched closers). Every video link spot-checked resolves to the
right video.

The exception the constraints reserve for **dead cross-references never fired**:
all 24 `(Lx)` references in `content/s1-ict-core/summary.html` resolve to the
lesson that teaches the thing (**F12**). The two number-level discrepancies found
in batch F are *content* errors, not broken references, and are logged rather than
fixed — the summary's "40 questions" against the exam's 45 (**F7**) and the
`(L2)` reference that renders in the callout-tag style instead of the `.src` style
(**F11**b, cosmetic, resolves correctly).

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
  with `\{\s*q\s*:\s*"…"\s*,\s*o\s*:\s*\[…\]\s*,\s*a\s*:\s*(\d+)` and reports, per batch,
  how often the option at index `a` is the longest of the four and how often the
  max-min spread exceeds 10 characters. It is not committed (throwaway
  exploration belongs in the scratchpad per `CLAUDE.md` §5); the regex above is
  enough to reconstruct it. **Report it D15's way, not A10's** — count a tie as
  *not* a tell (**C17**), and take the margin over the **second-longest** option
  rather than as a max-min spread (**D15**). D15's "median margin" column is
  conditional on the correct option being uniquely longest; see the measurement
  note in **E19**. **Add F14's column — the share of questions where the correct
  option is *not* the longest** (ties + shorter). That is the metric that
  separates the corpus's best question set from its worst (S1 exam 69%, Month 4
  14%, chance ~75%), and neither spread nor strict-longest does.
  **The `\s*` around each colon is load-bearing** — see **I17**. Quiz files exist
  in **three** formats: `{q:"…"` (39 files, all of Section 1), `{ q:"…"` (34, most
  of Section 2) and multi-line pretty-printed (7: `p1-07`, `p3-06`, `p6-06/07/08`
  and **both** `exam.js`). A literal `grep -c '{ q:'` returns **0** for 46 of the
  80 files, so never count questions that way. The regex above handles all three
  and reconciles to **451 quiz + 85 exam**.
- **A review page (`summary.html`) is tested against the *lessons*, not the
  transcripts** — §3 narrows §1 there: it "re-states the existing lessons, it
  never adds new material". Batch F's method: read all of that section's lessons
  in full (Section 1's 38 came to ~121 KB), then test each summary claim twice —
  *does it appear in some lesson?* and *is it stated the way that lesson states
  it?* Drop to notes/transcripts only to settle a claim found in no lesson. Then
  check every exam question **both** ways: traceable to a lesson **and** present
  in the summary (dimension 3). Tabulate which lesson each exam question draws on
  — a term appearing zero times is not evidence a lesson is untested (**F8**:
  `"vacuum"` is absent from `exam.js` yet m4-09 is examined).
- **Video links** are checked by fetching the YouTube watch page and comparing
  its `<title>` to the lesson's `data-title`.
- **Grep a new note page for dated examples.** Batch E's blocker (**E1**) came
  from a note page citing a **2022** chart on a **2016** teaching — the
  note-taker's own addition, and it contradicted the transcript. Together with
  **D1**'s *"that's what i saw in another video"*, the reliable signal that a note
  line is an import is not the page's length (batches C and D settled that) but
  an **attribution or a date that does not belong to this teaching**.
- **Section 2 video URLs** are checked against
  [`docs/s2-2022-mentorship-videos.md`](s2-2022-mentorship-videos.md), which the
  plan calls the **only** permitted source. Check both halves: that the URL
  appears in the table **and** that its row maps to the right episode *and* the
  right lesson id. Batch I found a third corroborating source for two of them —
  some `ep-NN.md` note pages carry the episode's video link inline (ep-14, ep-15).
- Nothing in `content/` was edited in batches A–H. **Batch I made one edit** — the
  `p3-01` `.fig-slot`, recorded under *Fixed in flight*. **Batches J, K and L made
  none**; `build.py` still emits zero warnings, so that entry remains the only one.
  Batch L did repair the audit *doc*: batch K's commit (`d508fa1`) had accidentally
  deleted the `## Fixed in flight` heading, orphaning its body text. Restored.
  **Batches M and N made none either**, so that entry is still the only one and
  the audit closes with `content/` edited exactly once in fourteen batches.
- **Run every corpus-wide scan over all 160 content files, not just the 78
  lessons and the 4 section-level pages.** Batch N's four corrections to published
  figures (**N2**, **N3**, **N5**, **N13**) trace to scans that had excluded the 80
  `quiz.js` / `exam.js` files, which hold a fifth of the corpus's prose. Strip HTML
  entities and tags before any word-level scan — `&amp;` otherwise reports as the
  broker *AMP* in 52 files (**N9**).
- **Grep each quiz file for duplicate questions.** Batch K found the audit's first
  (**K11**, `p5-05` Q3 and Q4 — same claim, same answer, same transcript line).
  Nothing in the method through batch J would have surfaced it; the option-length
  measurement is blind to it and question counts read a duplicate as coverage. Two
  questions whose `e` fields paraphrase each other is the tell.
