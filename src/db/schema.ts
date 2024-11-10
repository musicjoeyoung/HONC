import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type NewGooseQuestion = typeof geeseQuestions.$inferInsert;


export const geeseQuestions = pgTable("geese-questions", {
  id: serial("id").primaryKey(),
  question: text("question"),
  answer: text("answer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
