ALTER TABLE "lessons" ADD COLUMN "body_draft" jsonb;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "source_ref" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "source_ref_draft" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "write_origin" text DEFAULT 'import' NOT NULL;