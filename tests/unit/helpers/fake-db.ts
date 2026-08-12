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

export function fakeDb(returning: unknown[] = [{ id: "m1-01" }]): FakeDb {
  const calls: FakeDbCall[] = [];

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
      return Promise.resolve(returning);
    },
    then(res: (v: unknown) => void, rej?: (e: unknown) => void) {
      return Promise.resolve(returning).then(res, rej);
    },
  };

  const db = {
    update: () => chain,
    select: () => chain,
    from: () => chain,
    insert: () => chain,
    delete: () => chain,
    batch: (queries: unknown[]) => Promise.all(queries),
  };

  return { db, calls };
}
