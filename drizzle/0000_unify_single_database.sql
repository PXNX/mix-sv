-- Hand-reviewed migration: brings the live DB in line with the unified
-- single-database schema. Purely additive except for dropping the now-dead
-- channel_avatars table (0 rows - was a workaround for a two-database split
-- that's no longer used).

CREATE TABLE "destinations" (
	"channel_id" bigint PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"group_id" bigint,
	"footer" text
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"account_id" bigint PRIMARY KEY NOT NULL,
	"api_id" bigint NOT NULL,
	"api_hash" text NOT NULL,
	"user_id" bigint NOT NULL,
	"name" text NOT NULL,
	"phone_number" text NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "display_name" text;
--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "api_id" bigint;
--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "description" text;
--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "rating" integer;
--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "destination" bigint;
--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "detail_id" integer;
--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "is_active" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "is_spread" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_api_id_accounts_account_id_fk" FOREIGN KEY ("api_id") REFERENCES "public"."accounts"("account_id");
--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_destination_destinations_channel_id_fk" FOREIGN KEY ("destination") REFERENCES "public"."destinations"("channel_id");
--> statement-breakpoint
DROP TABLE "channel_avatars";
