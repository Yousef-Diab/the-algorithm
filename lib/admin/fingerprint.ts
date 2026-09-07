import { createHash } from "node:crypto";

/**
 * JSON with object keys sorted at every depth, so two structurally identical
 * bodies hash the same regardless of the key order the driver happened to
 * return. Array order is preserved — for a Block[] it is the content order and
 * is absolutely meaningful.
 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}

/**
 * Identifies the exact draft body the review page rendered. Compared inside
 * promoteAction so a draft rewritten between page load and click is refused
 * rather than published unseen.
 *
 * NOT a lock: it narrows the race to the interval between the action's re-read
 * and the UPDATE, it does not close it. Closing it properly needs a conditional
 * UPDATE inside lib/content/write.ts, which is out of bounds here.
 */
export function fingerprint(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}
