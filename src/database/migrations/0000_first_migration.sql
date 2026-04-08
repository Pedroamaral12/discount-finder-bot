CREATE TABLE "message_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"level" text NOT NULL,
	"message" text NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"telegram_message_id" text,
	"channel_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "messages_telegram_message_id_unique" UNIQUE("telegram_message_id")
);
--> statement-breakpoint
CREATE TABLE "system_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_name" text NOT NULL,
	"status" text NOT NULL,
	"last_check" timestamp DEFAULT now() NOT NULL,
	"error_message" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_status_service_name_unique" UNIQUE("service_name")
);
--> statement-breakpoint
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;