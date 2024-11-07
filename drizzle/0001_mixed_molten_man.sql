CREATE TABLE IF NOT EXISTS "geese-questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text,
	"answer" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);