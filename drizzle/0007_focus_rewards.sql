CREATE TABLE "checkpoint_rewards" (
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"completed_at" timestamp with time zone,
	"bonus_at" timestamp with time zone,
	"last_reward_at" timestamp with time zone,
	CONSTRAINT "checkpoint_rewards_user_id_lesson_id_pk" PRIMARY KEY("user_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "learner_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"avatar" text DEFAULT '◆' NOT NULL,
	"visible" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xp_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"kind" text NOT NULL,
	"amount" integer NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"legacy" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "checkpoint_rewards" ADD CONSTRAINT "checkpoint_rewards_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "xp_user_time_idx" ON "xp_events" USING btree ("user_id","earned_at");--> statement-breakpoint
CREATE UNIQUE INDEX "xp_once_idx" ON "xp_events" USING btree ("user_id","lesson_id","kind") WHERE kind IN ('completion', 'accuracy');
--> statement-breakpoint
-- One-time launch credit. Later local imports/toggle-complete cannot mint XP.
INSERT INTO checkpoint_rewards(user_id,lesson_id,completed_at,last_reward_at)
SELECT p.user_id,p.lesson_id,now(),now() FROM progress p JOIN lessons l ON l.id=p.lesson_id
WHERE l.kind='lesson' AND l.status='published' ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO xp_events(user_id,lesson_id,kind,amount,legacy)
SELECT user_id,lesson_id,'completion',20,true FROM checkpoint_rewards WHERE completed_at IS NOT NULL;
--> statement-breakpoint
-- Invoker rights: callable only by the application's DB connection. Authentication
-- and entitlement checks live in the server action; never expose this as an RPC.
CREATE FUNCTION claim_checkpoint(p_user text, p_lesson text) RETURNS integer
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
    INSERT INTO xp_events(user_id,lesson_id,kind,amount,earned_at) VALUES(p_user,p_lesson,'completion',20,moment);
    state.completed_at := moment;
    state.last_reward_at := moment;
    awarded := awarded+20;
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
  UPDATE checkpoint_rewards SET completed_at=state.completed_at,bonus_at=state.bonus_at,last_reward_at=state.last_reward_at
    WHERE user_id=p_user AND lesson_id=p_lesson;
  INSERT INTO progress(user_id,lesson_id,completed_at) VALUES(p_user,p_lesson,moment) ON CONFLICT DO NOTHING;
  RETURN awarded;
END;
$$;
