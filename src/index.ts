import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/neon-http";
import { geeseQuestions } from "./db/schema";
import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(cors())

app.get("/", (c) => {
  return c.text("Honc! 🪿");
});

app.get("/welcome", (c) => {
  return c.text("Welcome to Honc! 🪿");
})

app.post("/api/chat", async (c) => {
  const body = await c.req.json();
  console.log("User message:", body?.message);

  const responses = [
    "Honc! ",
    "Honk! ",
    "Hooonc! 🪿",
    "Hoooonk! 🪿",
    "Honk honk honk!",
    "Honk honk honk honk honk honk honk honk!",
    "Honk honk honk honk honk honk honk honk honk honk honk honk honk honk honk honk honk",
    "Honk? 🪿",
    "Honkity honk honk!",
    "Honkkkkkkkkkkk!",
    "Hoooonk-a-doodle-doo 🪿",
    "Honkalicious! 🪿",
    "Honkity honk honk honk! 🪿",
    "Hoooonkity hoo! 🪿",
    "HONK! 🪿 Did you hear me?",
    "Hoooonk! Just honk it! 🪿",
    "Hoooonk? Maybe! 🪿",
    "You are speaking to a Goose Bot. What are you expecting me to say?",
    "DO YOU HAVE ANY BREAD"
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  return c.json({ message: randomResponse });
});


app.get("/api/geese-trivia", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json({
    geeseTrivia: await db.select().from(geeseQuestions),
  });
});

export default instrument(app);
