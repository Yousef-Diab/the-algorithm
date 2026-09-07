ALTER TABLE "checkpoint_rewards" ADD COLUMN "first_attempt_score" integer;--> statement-breakpoint
ALTER TABLE "checkpoint_rewards" ADD COLUMN "first_attempt_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "xp_first_try_once_idx" ON "xp_events" USING btree ("user_id","lesson_id","kind") WHERE kind IN ('first_try', 'perfect_first_try');
--> statement-breakpoint
CREATE OR REPLACE FUNCTION claim_checkpoint(p_user text, p_lesson text) RETURNS integer
LANGUAGE plpgsql AS $$
DECLARE
  state checkpoint_rewards%ROWTYPE;
  total integer;
  answered integer;
  correct integer;
  oldest timestamptz;
  awarded integer := 0;
  moment timestamptz;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM lessons WHERE id=p_lesson AND kind='lesson' AND status='published') THEN
    RAISE EXCEPTION 'Lesson unavailable';
  END IF;
  INSERT INTO checkpoint_rewards(user_id,lesson_id) VALUES(p_user,p_lesson) ON CONFLICT DO NOTHING;
  SELECT * INTO state FROM checkpoint_rewards WHERE user_id=p_user AND lesson_id=p_lesson FOR UPDATE;
  moment := clock_timestamp();
  SELECT count(q.id),count(r.question_id),count(*) FILTER(WHERE r.selected=q.answer),min(r.answered_at)
    INTO total,answered,correct,oldest
    FROM quiz_questions q LEFT JOIN quiz_results r ON r.question_id=q.id AND r.user_id=p_user
    WHERE q.lesson_id=p_lesson;
  IF total=0 OR answered<>total THEN RAISE EXCEPTION 'Complete every quiz question first'; END IF;

  IF state.completed_at IS NULL THEN
    state.first_attempt_score := (correct*100)/total;
    state.first_attempt_at := moment;
    INSERT INTO xp_events(user_id,lesson_id,kind,amount,earned_at) VALUES(p_user,p_lesson,'completion',20,moment);
    state.completed_at := moment;
    state.last_reward_at := moment;
    awarded := awarded+20;
    IF state.first_attempt_score >= 80 THEN
      INSERT INTO xp_events(user_id,lesson_id,kind,amount,earned_at) VALUES(p_user,p_lesson,'first_try',5,moment);
      awarded := awarded+5;
    END IF;
    IF correct=total THEN
      INSERT INTO xp_events(user_id,lesson_id,kind,amount,earned_at) VALUES(p_user,p_lesson,'perfect_first_try',5,moment);
      awarded := awarded+5;
    END IF;
  ELSIF state.last_reward_at <= moment-interval '7 days' AND oldest >= state.last_reward_at+interval '7 days' THEN
    INSERT INTO xp_events(user_id,lesson_id,kind,amount,earned_at) VALUES(p_user,p_lesson,'review',5,moment);
    state.last_reward_at := moment;
    awarded := awarded+5;
  END IF;
  IF state.bonus_at IS NULL AND correct*100 >= total*80 THEN
    INSERT INTO xp_events(user_id,lesson_id,kind,amount,earned_at) VALUES(p_user,p_lesson,'accuracy',10,moment);
    state.bonus_at := moment;
    awarded := awarded+10;
  END IF;
  UPDATE checkpoint_rewards SET completed_at=state.completed_at,bonus_at=state.bonus_at,
    first_attempt_score=state.first_attempt_score,first_attempt_at=state.first_attempt_at,last_reward_at=state.last_reward_at
    WHERE user_id=p_user AND lesson_id=p_lesson;
  INSERT INTO progress(user_id,lesson_id,completed_at) VALUES(p_user,p_lesson,moment) ON CONFLICT DO NOTHING;
  RETURN awarded;
END;
$$;
