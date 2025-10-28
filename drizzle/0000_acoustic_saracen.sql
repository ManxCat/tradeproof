CREATE TABLE "app_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"experience_id" text NOT NULL,
	"min_cancellation_characters" integer DEFAULT 20 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_experience_id_unique" UNIQUE("experience_id")
);
--> statement-breakpoint
CREATE TABLE "cancellation_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"experience_id" text NOT NULL,
	"membership_id" text NOT NULL,
	"user_id" text NOT NULL,
	"username" text NOT NULL,
	"feedback" text NOT NULL,
	"cancelled_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" text PRIMARY KEY NOT NULL,
	"experience_id" text NOT NULL,
	"user_id" text NOT NULL,
	"username" text,
	"symbol" text NOT NULL,
	"position_type" text DEFAULT 'long' NOT NULL,
	"asset_type" text DEFAULT 'stock' NOT NULL,
	"leverage" text DEFAULT '1' NOT NULL,
	"entry_price" text NOT NULL,
	"exit_price" text NOT NULL,
	"position_size" text NOT NULL,
	"pnl" text NOT NULL,
	"roi" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"screenshot" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
