// tests/unit/import-question-ids.test.ts
//
// The importer used to delete-and-reinsert every quiz_questions row for each
// lesson it wrote, regenerating every question_id and cascading away every
// quiz_results row. matchQuestionIds is the pure half of the fix: it pairs the
// id-less questions parsed from content/**/quiz.js against the ids already in
// the database, so the write becomes an id-preserving upsert.
import { describe, it, expect } from "vitest";
import { matchQuestionIds } from "@/lib/content/import";
import type { PlannedQuestion } from "@/lib/content/import";

const q = (n: number, over: Partial<PlannedQuestion> = {}): PlannedQuestion => ({
  ord: n,
  q: `question ${n}?`,
  options: ["a", "b", "c", "d"],
  answer: 0,
  explanation: `because ${n}`,
  ...over,
});

const existing = (pairs: [string, string][]) => pairs.map(([id, text]) => ({ id, q: text }));

describe("matchQuestionIds", () => {
  it("carries every id through when the quiz is unchanged", () => {
    const rows = existing([
      ["id-0", "question 0?"],
      ["id-1", "question 1?"],
      ["id-2", "question 2?"],
    ]);
    const out = matchQuestionIds(rows, [q(0), q(1), q(2)]);
    expect(out.map((o) => o.id)).toEqual(["id-0", "id-1", "id-2"]);
  });

  it("keeps the ids attached to their TEXT when questions are reordered", () => {
    // The whole point of matching on text rather than ordinal: after a
    // reorder, id-2 must still be the id of "question 2?", not of whatever
    // now sits at index 2. Matching on ord would re-point every stored
    // answer at a different question (schema.ts invariant 4).
    const rows = existing([
      ["id-0", "question 0?"],
      ["id-1", "question 1?"],
      ["id-2", "question 2?"],
    ]);
    const out = matchQuestionIds(rows, [q(2), q(0), q(1)]);
    expect(out.map((o) => [o.q, o.id])).toEqual([
      ["question 2?", "id-2"],
      ["question 0?", "id-0"],
      ["question 1?", "id-1"],
    ]);
  });

  it("leaves a genuinely new question id-less so it inserts", () => {
    const rows = existing([["id-0", "question 0?"]]);
    const out = matchQuestionIds(rows, [q(0), q(9)]);
    expect(out[0].id).toBe("id-0");
    expect(out[1].id).toBeUndefined();
  });

  it("preserves surviving ids when a question is inserted at the front", () => {
    const rows = existing([
      ["id-0", "question 0?"],
      ["id-1", "question 1?"],
    ]);
    const out = matchQuestionIds(rows, [q(9), q(0), q(1)]);
    expect(out.map((o) => o.id)).toEqual([undefined, "id-0", "id-1"]);
  });

  it("preserves surviving ids when a question is removed", () => {
    const rows = existing([
      ["id-0", "question 0?"],
      ["id-1", "question 1?"],
      ["id-2", "question 2?"],
    ]);
    const out = matchQuestionIds(rows, [q(0), q(2)]);
    expect(out.map((o) => o.id)).toEqual(["id-0", "id-2"]);
  });

  it("treats an edited question as new — its id is dropped, not reused", () => {
    // A reworded question is a different question. Dropping the id loses that
    // one question's answers; reusing it would silently re-attribute answers
    // given to the OLD wording. Bounded loss beats silent mis-attribution.
    const rows = existing([["id-0", "question 0?"]]);
    const out = matchQuestionIds(rows, [q(0, { q: "question 0, reworded?" })]);
    expect(out[0].id).toBeUndefined();
  });

  it("consumes each existing row at most once when texts are duplicated", () => {
    // assertQuiz rejects a duplicate id within one call, so a duplicated
    // question text must not hand the same id to both copies.
    const rows = existing([["id-0", "same?"]]);
    const out = matchQuestionIds(rows, [q(0, { q: "same?" }), q(1, { q: "same?" })]);
    expect(out[0].id).toBe("id-0");
    expect(out[1].id).toBeUndefined();
  });

  it("pairs duplicated texts in order when both already exist", () => {
    const rows = existing([
      ["id-a", "same?"],
      ["id-b", "same?"],
    ]);
    const out = matchQuestionIds(rows, [q(0, { q: "same?" }), q(1, { q: "same?" })]);
    expect(out.map((o) => o.id)).toEqual(["id-a", "id-b"]);
  });

  it("passes the question payload through untouched", () => {
    const rows = existing([["id-0", "question 0?"]]);
    const [out] = matchQuestionIds(rows, [q(0)]);
    expect(out).toEqual({
      id: "id-0",
      q: "question 0?",
      options: ["a", "b", "c", "d"],
      answer: 0,
      explanation: "because 0",
    });
  });

  it("emits no id at all for a lesson with no existing questions", () => {
    const out = matchQuestionIds([], [q(0), q(1)]);
    expect(out.every((o) => o.id === undefined)).toBe(true);
  });
});
