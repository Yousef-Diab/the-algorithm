CREATE TABLE "admin_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_user_id" text,
	"action" text NOT NULL,
	"lesson_id" text,
	"outcome" text NOT NULL,
	"detail" jsonb
);
--> statement-breakpoint
CREATE INDEX "admin_actions_at_idx" ON "admin_actions" USING btree ("at");