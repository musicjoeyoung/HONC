import { geeseQuestions, users } from "./db/schema";

import { Hono } from "hono";
import { drizzle } from "drizzle-orm/neon-http";
import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Honc! 🪿");
});

app.get("/welcome", (c) => {
  return c.text("Welcome to Honc! 🪿");
})

app.get("/api/users", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json({
    users: await db.select().from(users),
  });
});

app.get("/api/geese-trivia", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json({
    geeseTrivia: await db.select().from(geeseQuestions),
  });
});

export default instrument(app);
