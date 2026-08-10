CREATE TABLE "lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"section_id" text NOT NULL,
	"month_id" text,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"heading" text NOT NULL,
	"crumb" text NOT NULL,
	"desc" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"video_url" text,
	"ord" integer NOT NULL,
	"kind" text DEFAULT 'lesson' NOT NULL,
	"access" text DEFAULT 'members' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"body" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" text NOT NULL,
	"kind" text DEFAULT 'image' NOT NULL,
	"ord" integer NOT NULL,
	"storage_key" text NOT NULL,
	"mime" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"bytes" integer NOT NULL,
	"variant_of" uuid,
	"alt" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "months" (
	"id" text PRIMARY KEY NOT NULL,
	"section_id" text NOT NULL,
	"title" text NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"ord" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" text NOT NULL,
	"ord" integer NOT NULL,
	"q" text NOT NULL,
	"options" jsonb NOT NULL,
	"answer" integer NOT NULL,
	"explanation" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" text PRIMARY KEY NOT NULL,
	"short" text NOT NULL,
	"title" text NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"label" text DEFAULT 'Month' NOT NULL,
	"ord" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_month_id_months_id_fk" FOREIGN KEY ("month_id") REFERENCES "public"."months"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_variant_of_media_id_fk" FOREIGN KEY ("variant_of") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "months" ADD CONSTRAINT "months_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lessons_section_ord_idx" ON "lessons" USING btree ("section_id","ord");--> statement-breakpoint
CREATE INDEX "lessons_month_ord_idx" ON "lessons" USING btree ("month_id","ord");--> statement-breakpoint
CREATE INDEX "lessons_access_status_idx" ON "lessons" USING btree ("access","status");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_slug_uq" ON "lessons" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "media_lesson_ord_idx" ON "media" USING btree ("lesson_id","ord");--> statement-breakpoint
CREATE INDEX "media_variant_idx" ON "media" USING btree ("variant_of");--> statement-breakpoint
CREATE UNIQUE INDEX "media_storage_key_uq" ON "media" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "months_section_ord_idx" ON "months" USING btree ("section_id","ord");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_questions_lesson_ord_uq" ON "quiz_questions" USING btree ("lesson_id","ord");