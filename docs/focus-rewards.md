# Focus and learning rewards

The current Next.js app adds an optional timer to each lesson, then uses its existing quiz as the only checkpoint. No course material or question authoring changes are needed.

## Member experience

- Start 5, 10, 15, or 25 minutes; pause, hide the countdown, extend when it ends, or take a five-minute break. A small dock keeps controls accessible while scrolling. Timer state stays in this browser per lesson; elapsed time never earns XP.
- Answer all quiz questions. After the final answer is successfully saved, the app automatically awards 20 XP once per lesson and 10 XP once for reaching at least 80%. Reaching 80% on the first complete attempt adds 5 XP; a perfect first attempt reveals another secret 5 XP. The first complete score is immutable, so resetting cannot recreate a first attempt. There is no confirmation button. Failed answer saves and failed XP calculations show targeted retry controls; checkpoint completion always waits for persistence.
- A completed checkpoint also marks the lesson complete. Resets and manual completion toggles never award additional XP or remove earned XP.
- After seven days, reset the quiz and answer every question again for 5 review XP, awarded automatically after the final saved answer. Every answer must be recorded after the cooldown. The next seven-day period begins when that review is claimed. The accuracy bonus can be earned on a later attempt independently.
- Home displays XP, level, today's XP, checkpoint count, and first-lesson/five-lesson/first-review badges. Each 100 XP advances one level, beginning at level 1.
- `/leaderboard` is members-only: one all-time XP ranking, shared ranks for ties, top 100 plus the viewer. XP, level, and lesson counts all use lifetime totals. Today's personal XP uses Riyadh time.
- Players initially use their account name. A customized leaderboard name takes precedence; a generated pseudonym is used only when the account name is missing or blank. They can edit a 2–24 character display name, select a preset avatar, or hide their entry. Emails, raw user ids, notes, and individual quiz answers are not returned in leaderboard rows.

## Storage and release

Apply `drizzle/0007_focus_rewards.sql`, `drizzle/0008_first_try_rewards.sql`, and `drizzle/0009_reconcile_reward_backfill.sql` through the normal migration journal **before deploying the new application**. They add reward storage and the checkpoint function, add immutable first-attempt scoring, and reconcile completions created during the staged rollout. Historical credits count toward all-time XP and badges, but not today's activity. Existing completions do not receive first-attempt or accuracy bonuses because their original attempts cannot be reconstructed.

For the configured `.env.local` environment, the migration command is:

```powershell
node --env-file=.env.local node_modules/drizzle-kit/bin.cjs migrate
```

This command changes the configured database. Migration `0007_focus_rewards` was applied on 2026-09-06; migrations `0008_first_try_rewards` and `0009_reconcile_reward_backfill` were applied on 2026-09-07 to the `.env.local` database. All three reward tables, the immutable first-attempt fields, indexes, and checkpoint function were verified. The initial backfill created 38 completion credits totaling 760 XP. Reconciliation added four staged-rollout completion credits, leaving 42 events totaling 840 XP with no missing published completions or duplicate one-time events. Deployment remains separate. An older app can run with these additive tables present; reverting application code does not require deleting reward history.

Do not grant browser/database RPC access to `claim_checkpoint`. The function uses invoker privileges; the authenticated server action establishes user identity and checks membership and lesson access before calling it. It locks one reward-state row and writes events in the same database transaction. Unique indexes protect one-time awards. The frontend never supplies XP, timestamps, or another player's identity.

## Verification

```powershell
pnpm test:unit
pnpm test:rewards-ui
pnpm lint
pnpm build
pnpm exec playwright test tests/e2e/rewards.spec.ts tests/e2e/quiz.spec.ts --project=chromium
```

Reward SQL tests execute the real migration/function and ranking queries against disposable embedded Postgres (PGlite). Browser fixture tests render actual components with isolated action responses to exercise failures, retries, refresh, timer controls, and mobile layout. The fixture's sample players are test data only. PGlite serializes connections, so the tests validate duplicate requests but do not simulate independent networked PostgreSQL transactions. Production uses the row lock and unique constraint for that guarantee.

The authenticated production flow still needs a smoke test after the migration in the target environment. Existing authenticated E2E/integration suites can write configured account/data state and were not run against production for this change.

Database status: migrations `0007`, `0008`, and `0009` were applied to the configured database. Existing XP ledger entries were preserved; earlier completions remain in the all-time standings without receiving reconstructed first-attempt bonuses.

Verified on 2026-09-07: 412 unit tests and four isolated browser tests passed. The production build (including TypeScript) passed. Lint reported no errors and one pre-existing unused-variable warning in `tests/unit/write.test.ts`.
