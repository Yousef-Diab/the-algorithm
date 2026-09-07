import { describe, it, expect } from "vitest";
import { planMerge } from "@/lib/db/merge-local";

describe("planMerge", () => {
  it("unions completed lessons, keeping the server's timestamps", () => {
    const out = planMerge(
      { done: ["m1-01", "m1-02"], quiz: {} },
      { done: ["m1-02", "m1-03"], answered: {} },
      { "m1-01": true, "m1-02": true, "m1-03": true },
      {},
    );
    expect(out.doneToInsert.sort()).toEqual(["m1-01"]);
  });

  it("drops a local completion for a lesson that no longer exists", () => {
    const out = planMerge({ done: ["gone-99"], quiz: {} }, { done: [], answered: {} }, { "m1-01": true }, {});
    expect(out.doneToInsert).toEqual([]);
    expect(out.dropped).toContain("gone-99");
  });

  it("maps a local q_index answer onto the question's uuid", () => {
    const out = planMerge(
      { done: [], quiz: { "m1-01-0": 2 } },
      { done: [], answered: {} },
      { "m1-01": true },
      { "m1-01": [{ id: "uuid-a", ord: 0, answer: 2 }, { id: "uuid-b", ord: 1, answer: 0 }] },
    );
    expect(out.answersToInsert).toEqual([{ questionId: "uuid-a", selected: 2, correct: true }]);
  });

  it("never overwrites an answer the server already has", () => {
    const out = planMerge(
      { done: [], quiz: { "m1-01-0": 1 } },
      { done: [], answered: { "uuid-a": 3 } },
      { "m1-01": true },
      { "m1-01": [{ id: "uuid-a", ord: 0, answer: 2 }] },
    );
    expect(out.answersToInsert).toEqual([]);
  });

  it("drops a local answer whose question index no longer exists", () => {
    const out = planMerge(
      { done: [], quiz: { "m1-01-7": 1 } },
      { done: [], answered: {} },
      { "m1-01": true },
      { "m1-01": [{ id: "uuid-a", ord: 0, answer: 2 }] },
    );
    expect(out.answersToInsert).toEqual([]);
    expect(out.dropped).toContain("m1-01-7");
  });

  it("tolerates malformed local storage without throwing", () => {
    expect(() => planMerge({ done: null as never, quiz: "nope" as never }, { done: [], answered: {} }, {}, {})).not.toThrow();
  });

  it("resolves a greedy lesson-id-with-digits suffix correctly and drops a bare key", () => {
    // m1-01 is itself "m1-0" + "1" shaped, but the regex must resolve the key
    // "m1-01-0" to lessonId "m1-01", ord 0 (the last -\d+ group), not split on
    // an earlier hyphenated digit run.
    const out = planMerge(
      { done: [], quiz: { "m1-01-0": 1, bareKey: 1 } },
      { done: [], answered: {} },
      { "m1-01": true },
      { "m1-01": [{ id: "uuid-a", ord: 0, answer: 1 }] },
    );
    expect(out.answersToInsert).toEqual([{ questionId: "uuid-a", selected: 1, correct: true }]);
    expect(out.dropped).toContain("bareKey");
  });

  it("marks a wrong local answer as incorrect and returns an empty plan for empty local state", () => {
    const wrong = planMerge(
      { done: [], quiz: { "m1-01-0": 3 } },
      { done: [], answered: {} },
      { "m1-01": true },
      { "m1-01": [{ id: "uuid-a", ord: 0, answer: 1 }] },
    );
    expect(wrong.answersToInsert).toEqual([{ questionId: "uuid-a", selected: 3, correct: false }]);

    const empty = planMerge({ done: [], quiz: {} }, { done: [], answered: {} }, { "m1-01": true }, {});
    expect(empty).toEqual({ doneToInsert: [], answersToInsert: [], dropped: [] });
  });
});
