// Pure predicate — deliberately has NO imports. It is loaded both from
// Vitest (via the "@/" alias) and from the bulk importer, which runs under
// plain Node with no alias resolution and must never transitively reach
// lib/db (which pulls in the "server-only" package that isn't installed).
// Keep this file import-free; if it ever needs one, it must be a relative
// import, never "@/".

export interface ExistingRow {
  writeOrigin: string;
  bodyDraft: unknown;
}

export interface ImportDecision {
  write: boolean;
  reason?: string;
}

export function importDecision(existing: ExistingRow | null, force: boolean): ImportDecision {
  if (!existing) return { write: true };
  if (existing.bodyDraft != null)
    return { write: false, reason: "has a pending draft — promote or discard it first (--force will not override this)" };
  if (existing.writeOrigin === "cms" && !force)
    return { write: false, reason: "was edited in the CMS — re-run with --force to overwrite" };
  return { write: true };
}
