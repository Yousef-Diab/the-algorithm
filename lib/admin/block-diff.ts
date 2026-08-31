import type { Block } from "@/lib/content/blocks";

export type DiffTag = "same" | "added" | "removed" | "changed";

export interface DiffRow {
  tag: DiffTag;
  /** The live block, or null when this row exists only in the draft. */
  live: Block | null;
  /** The draft block, or null when this row exists only in the live body. */
  draft: Block | null;
}

/**
 * A plain longest-common-subsequence alignment over each block's JSON. Equal
 * JSON is the equality relation; nothing here attempts move detection, so a
 * reorder reports as a removal plus an insertion. That is truthful and is what
 * an LCS does — inventing a "moved" tag would claim more than the algorithm
 * knows.
 *
 * Pure in, pure out, no rendering knowledge, so the whole behaviour is
 * unit-testable without a browser.
 */
export function diffBlocks(live: Block[], draft: Block[]): DiffRow[] {
  const a = live.map((b) => JSON.stringify(b));
  const b = draft.map((x) => JSON.stringify(x));
  const n = a.length;
  const m = b.length;

  // lcs[i][j] = length of the LCS of a[i..] and b[j..]
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const raw: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      raw.push({ tag: "same", live: live[i], draft: draft[j] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      raw.push({ tag: "removed", live: live[i], draft: null });
      i++;
    } else {
      raw.push({ tag: "added", live: null, draft: draft[j] });
      j++;
    }
  }
  while (i < n) raw.push({ tag: "removed", live: live[i++], draft: null });
  while (j < m) raw.push({ tag: "added", live: null, draft: draft[j++] });

  return coalesce(raw);
}

/**
 * A run of removals immediately followed by a run of insertions is what an
 * edit-in-place looks like to an LCS. Pairing them index-wise into `changed`
 * rows is what makes the review readable: a reworded paragraph shows as one
 * row with both versions, not as two rows the reader has to correlate by eye.
 * Whatever does not pair stays honestly removed or added.
 */
function coalesce(rows: DiffRow[]): DiffRow[] {
  const out: DiffRow[] = [];
  let k = 0;
  while (k < rows.length) {
    if (rows[k].tag !== "removed") {
      out.push(rows[k]);
      k++;
      continue;
    }
    let r = k;
    while (r < rows.length && rows[r].tag === "removed") r++;
    let d = r;
    while (d < rows.length && rows[d].tag === "added") d++;

    const removed = rows.slice(k, r);
    const added = rows.slice(r, d);
    const paired = Math.min(removed.length, added.length);

    for (let x = 0; x < paired; x++) {
      out.push({ tag: "changed", live: removed[x].live, draft: added[x].draft });
    }
    for (let x = paired; x < removed.length; x++) out.push(removed[x]);
    for (let x = paired; x < added.length; x++) out.push(added[x]);
    k = d;
  }
  return out;
}
