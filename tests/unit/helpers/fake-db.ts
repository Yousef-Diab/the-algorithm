/**
 * Minimal fake Drizzle handle shared by lib/content/write.ts's tests
 * (Tasks 3-6). Records `.set()` and `.values()` payloads so tests can
 * assert on exactly what a writer sent to the "database", and exposes the
 * chainable surface those writers need: update/insert/delete/select with
 * set/values/where/limit/orderBy/returning/batch, plus `then` so an
 * un-terminated chain (no `.returning()`) still awaits to `returning`.
 *
 * Tasks 4-6 extend this same helper rather than declaring divergent copies
 * — see task-3-report.md for the rationale.
 */

export interface FakeDbCall {
  set?: Record<string, unknown>;
  values?: Record<string, unknown> | Record<string, unknown>[];
  onConflictDoUpdate?: Record<string, unknown>;
}

export interface FakeDb {
  db: unknown;
  calls: FakeDbCall[];
}

/**
 * Task 6's createLesson issues TWO different `db.select()` queries (the
 * month/section precheck, then the slug-collision check) against ONE fake.
 * Passing a flat array reuses it for every select, which is fine when both
 * queries want the same shape of answer, but wrong when they don't (e.g. the
 * precheck must find a row while the collision check must find none).
 *
 * To cover that without a divergent fake, `returning` also accepts an array
 * of arrays — a queue consumed one entry per top-level `db.select()` call,
 * in call order. A plain `unknown[]` (the pre-existing shape) keeps behaving
 * exactly as before: the same array answers every select/update/insert.
 */
export function fakeDb(returning: unknown[] | unknown[][] = [{ id: "m1-01" }]): FakeDb {
  const calls: FakeDbCall[] = [];
  // The `.every()` on an empty array is vacuously true, so without the
  // length check `fakeDb([])` would be misclassified as sequence mode
  // (empty queue) instead of flat mode (same [] answers every select) —
  // harmless only because both modes happen to yield [] for the empty
  // case. Do not drop this guard "for simplicity".
  const isSequence =
    Array.isArray(returning) && returning.length > 0 && returning.every((r) => Array.isArray(r));
  const selectQueue = isSequence ? [...(returning as unknown[][])] : null;

  function makeChain(rows: unknown) {
    const chain = {
      set(v: Record<string, unknown>) {
        calls.push({ set: v });
        return chain;
      },
      values(v: Record<string, unknown> | Record<string, unknown>[]) {
        calls.push({ values: v });
        return chain;
      },
      /** Task 5's upsertQuiz uses `.insert(...).values(...).onConflictDoUpdate(...)`
       *  for the id-preserving upsert. Recorded like set/values so tests can
       *  assert on it; chainable so it composes with `.returning()`/`.then()`. */
      onConflictDoUpdate(v: Record<string, unknown>) {
        calls.push({ onConflictDoUpdate: v });
        return chain;
      },
      /** `db.select(...).from(...)` — select() returns this chain, so `.from`
       *  must live here too, not just on `db`. */
      from() {
        return chain;
      },
      where() {
        return chain;
      },
      limit() {
        return chain;
      },
      orderBy() {
        return chain;
      },
      returning() {
        return Promise.resolve(rows);
      },
      then(res: (v: unknown) => void, rej?: (e: unknown) => void) {
        return Promise.resolve(rows).then(res, rej);
      },
    };
    return chain;
  }

  // update/insert/delete keep the pre-existing behaviour: they always answer
  // with the flat `returning` (or, in sequence mode, the untouched queue —
  // no non-select caller in this codebase consumes it).
  const staticChain = makeChain(isSequence ? [] : returning);

  const db = {
    update: () => staticChain,
    select: () => makeChain(selectQueue ? (selectQueue.shift() ?? []) : returning),
    from: () => staticChain,
    insert: () => staticChain,
    delete: () => staticChain,
    batch: (queries: unknown[]) => Promise.all(queries),
  };

  return { db, calls };
}
