import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type NewUser = typeof users.$inferInsert;
export type NewGooseQuestion = typeof geeseQuestions.$inferInsert;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const geeseQuestions = pgTable("geese-questions", {
  id: serial("id").primaryKey(),
  question: text("question"),
  answer: text("answer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
