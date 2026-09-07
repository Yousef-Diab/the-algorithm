# Focus rewards implementation plan

**Goal:** Deliver the approved end-of-lesson rewards, optional timer, and member leaderboard.
**Architecture:** Server actions authorize; a Postgres function serializes reward claims; an immutable ledger drives totals. React components integrate into existing lessons and home.
**Tech Stack:** Next.js, React, Drizzle, Postgres, Vitest, Playwright. PGlite is test-only.
**Spec:** ../specs/2026-09-06-focus-rewards-design.md

## Constraints
No lesson splitting or content changes. XP comes only from validated quiz checkpoints and one-time migration backfills. Never use the live database for tests. No deployment.

## Tasks
- [x] Reward storage: add schema tables, generate migration, add transactional SQL function and launch backfill. Test real SQL in disposable PGlite: incomplete quiz rejection, 20+10 awards, duplicate claims, seven-day review with fresh answers, reset and retry, user isolation, backfill exclusion.
- [x] Service: create lib/rewards/queries.ts for claim/status/summary/leaderboard queries and app/actions/rewards.ts for auth/access/profile validation. Test access refusal and ranking/privacy against fixtures.
- [x] Lesson: integrate an automatically claimed checkpoint into Quiz; surface answer-save and XP errors with targeted retries. Build persistent optional timer in components/rewards/FocusTimer.tsx and add to lesson route. Browser-test pause/resume, expiration, refresh, quiz save failure, automatic claim and duplicate protection.
- [x] Member pages: XP summary on home, /leaderboard with one all-time rank and editable identity/visibility. Add sidebar link. Test guest gate, zero/hidden scores, tie ranks and own-row inclusion.
- [x] Verify unit suite, TypeScript, lint, production build, browser behavior and responsive appearance. Document migration requirement and leave deployment separate.

Execution is inline in this task on codex/focus-xp-leaderboard. The conversation approval is the implementation authorization; no additional design gate is needed.
