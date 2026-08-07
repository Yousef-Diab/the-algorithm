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

**D1 · should-fix · [m4-05/lesson.html:26](../content/s1-ict-core/m4/m4-05/lesson.html#L26)** —
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

**D13 · nit · m4-02** — three smaller drops: the fallback *"if you can't
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

**D14 · should-fix — the quiz counts are again inverse to the material, for three
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

**E1 · blocker · [m4-11/lesson.html:9](../content/s1-ict-core/m4/m4-11/lesson.html#L9)
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

**E2 · should-fix · [m4-11/lesson.html:10](../content/s1-ict-core/m4/m4-11/lesson.html#L10)** —
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

**E18 · should-fix — the counts are out of proportion again, for four lessons.**
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

**F1 · blocker ·
[summary.html:240](../content/s1-ict-core/summary.html#L240) and
[exam.js:235-237](../content/s1-ict-core/exam.js#L235)** —
**E1 propagates to both pages, in the one slot where it does most damage: the
definition.** The summary's liquidity-void row reads *"Where **absolutely no
trading took place** — big one-sided candles. There is no specific time for a
void to fill; it gets covered back over **once both sides have been offered**."*
Three things make this worse than E1 was in m4-11:

- **The self-contradiction is now inside a single table cell.** "No trading took
  place" and "once both sides have been offered" are one sentence apart.
- **The vacuum block's row sits four rows above it** and reads *"a gap from a
  volatility event … where **no trade could occur**."* So the summary hands the
  same definition to two different PD arrays inside one table. E1 noted that
  m4-11 collapses the m4-09 distinction; here the collapse is visible at a
  glance, on the page designed for side-by-side revision.
- **The correct formulation is two rows *below*.** The FVG row says *"**Only one
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

**F2 · should-fix ·
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

**F3 · should-fix ·
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

**F4 · should-fix ·
[summary.html:223](../content/s1-ict-core/summary.html#L223)** —
**C7 propagates verbatim.** *"trying to pick tops and bottoms is the **single
worst thing** a trader can do."* ICT: *"picking tops and bottoms is **one of the
worst games to play** especially the new trader"*
(`Market Maker Trap Head Shoulders Pattern.txt:112-116`). The same
over-tightening as **A3** and **C7**, now on the last page a reader reads before
the exam. (m3-08's other C7 half — "retail sells the right shoulder" — is **not**
carried over; the summary says only that the stops above the head and shoulders
are the engineered liquidity, which is correct.)

**F5 · should-fix ·
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

**F7 · should-fix ·
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

**F10 · nit ·
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

**G16 · should-fix — p1-06's quiz is the one badly-constructed set in Part 1, and
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

**H1 · should-fix ·
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

**H3 · should-fix · p2-02 and G7 — the micro risk figure implies $1 per handle,
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

**H14 · should-fix · p2-05 — the algorithmic rationale for the whole taxonomy is
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

**H19 · should-fix · p2-06 — the $256,000 context is dropped, and with it ICT's
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

---

## Fixed in flight

Genuinely-broken things repaired during the audit rather than logged.

*None through batch F.* Nothing in `content/` has been edited. `build.py` and
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
  with `\{\s*q:\s*"…"\s*,\s*o:\s*\[…\]\s*,\s*a:\s*(\d+)` and reports, per batch,
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
- Nothing in `content/` was edited in batches A–F.
