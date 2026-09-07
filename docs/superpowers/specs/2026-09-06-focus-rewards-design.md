# Focus, rewards, and member leaderboard

Approved in conversation: preserve short lessons; one checkpoint at the end using the existing quiz. No authored sub-checkpoints or mandatory notes.

- Optional 5/10/15/25-minute focus timer, pause/resume, hidden countdown, extend by five minutes, break and checkpoint actions. Wall-clock deadlines survive background tabs and refresh. Timer never awards XP.
- Automatic checkpoint claim after the final quiz answer saves: 20 XP once per lesson; 10 XP once for >=80%; another 5 XP when >=80% is reached on the immutable first complete attempt; a hidden 5 XP revealed for 100% on that first attempt; and 5 XP for a fresh full review at least seven days after the last completion/review. A retry action appears only if automatic claiming fails. No reset deletes XP. Existing progress receives 20 XP at migration, excluded from today's total and ineligible for unverifiable first-attempt rewards.
- Account XP, level (1 + floor(XP/100)), daily earned XP, completed checkpoint count, first/five-lesson/first-review badges.
- Member-only all-time leaderboard with tied XP sharing rank, top 100 plus own rank. Columns: rank, name/avatar, level, XP, completed checkpoints. No email, answers, notes, or raw user ids in client payloads.
- Default name comes from the account's name, with a pseudonym only for a missing/blank account name. Customized leaderboard names take precedence. Editable name and preset avatar; hide/show setting. Hidden users retain personal XP but are excluded before ranking.
- Server authenticates every action and checks lesson access. Database function locks per-user/per-lesson reward state and inserts immutable events atomically. Fresh review requires every saved answer at or after the previous completion/review claim plus seven days. Bonus and completion events unique per user/lesson. Reject drafts, exams, empty and incomplete quizzes.
- New reward tables and function via additive migration; no production migration or deployment during implementation. Tests run against disposable embedded Postgres, never the configured live database.
- Failed persistence is visible with retry; no success message before server confirmation. Existing course material and notes are untouched.

Implementation targets current Next.js/Neon app; README/CLAUDE legacy static instructions predate that app. No static lesson changes are required.
