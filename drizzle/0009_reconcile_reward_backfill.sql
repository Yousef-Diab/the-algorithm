-- Reconcile published lesson completions created after the initial reward
-- migration but before automatic checkpoint claiming shipped.
INSERT INTO checkpoint_rewards(user_id, lesson_id, completed_at, last_reward_at)
SELECT p.user_id, p.lesson_id, coalesce(p.completed_at, now()), coalesce(p.completed_at, now())
FROM progress p
JOIN lessons l ON l.id = p.lesson_id
WHERE l.kind = 'lesson' AND l.status = 'published'
ON CONFLICT (user_id, lesson_id) DO UPDATE SET
  completed_at = coalesce(checkpoint_rewards.completed_at, excluded.completed_at),
  last_reward_at = coalesce(checkpoint_rewards.last_reward_at, excluded.last_reward_at);
--> statement-breakpoint
INSERT INTO xp_events(user_id, lesson_id, kind, amount, earned_at, legacy)
SELECT p.user_id, p.lesson_id, 'completion', 20, coalesce(p.completed_at, now()), true
FROM progress p
JOIN lessons l ON l.id = p.lesson_id
WHERE l.kind = 'lesson' AND l.status = 'published'
ON CONFLICT DO NOTHING;
