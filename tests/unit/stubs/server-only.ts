// Vitest-only stub for the `server-only` package. Next.js aliases the real
// package internally at build time; Vitest doesn't have that bundler, and the
// package is intentionally not installed as a real dependency (see
// lib/db/index.ts). This empty module lets tests that transitively import
// lib/db (e.g. for pure functions living alongside cached DB queries) load
// without pulling in Next's build-time machinery. It has no runtime behavior.
export {};
