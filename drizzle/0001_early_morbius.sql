ALTER TABLE "lessons" DROP CONSTRAINT "lessons_month_id_months_id_fk";
--> statement-breakpoint
ALTER TABLE "months" ADD CONSTRAINT "months_id_section_id_uq" UNIQUE("id","section_id");--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_month_section_fk" FOREIGN KEY ("month_id","section_id") REFERENCES "public"."months"("id","section_id") ON DELETE cascade ON UPDATE no action;