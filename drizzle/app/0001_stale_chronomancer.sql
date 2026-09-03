CREATE TABLE "channel_avatars" (
	"channel_id" bigint PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "channel_avatars" ADD CONSTRAINT "channel_avatars_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;