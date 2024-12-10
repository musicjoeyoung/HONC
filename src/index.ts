import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { geese } from "./db/schema";
import { geeseQuestions } from "./db/schema";
import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";

type Bindings = {
  DATABASE_URL: string;
  R2_BUCKET: R2Bucket;
  AI: Ai;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(cors())

app.get("/", (c) => {
  return c.text("Honc! 🪿");
});

app.get("/welcome", (c) => {
  return c.text("Welcome to Honc! 🪿");
})

app.get("/api/geese-trivia", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json({
    geeseTrivia: await db.select().from(geeseQuestions),
  });
});

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

app.get("/api/geese", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json({
    geese: await db.select().from(geese),
  });
});

app.post("/api/geese/:name", async (c) => {
  const { name } = c.req.param();

  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log("checking if goose exists");
  const maybeGoose = await db.select().from(geese).where(eq(geese.name, name));
  console.log("databe base query completed")

  if (maybeGoose.length !== 0) {
    return c.json(
      {
        error: "already_exists",
      },
      400,
    );
  }

  try {

    const model =
      "@cf/black-forest-labs/flux-1-schnell" as BaseAiTextToImageModels;
    const prompt = `Please generate a image of a goose. Its name is ${name}. Make it in the style of comic or anime please and related to the name it is given. Include imagery that is related to ${name}. If a title such as "Dr.", "Doctor", "Mr.", "Ms.", "Mrs.", "Mister", "Miss", "Misses", "Sir", "Ma'am", or "Madame" is included in their ${name}, give them fancy and regal clothing and some sort of top hat. If any part of ${name} is the name of some other type of animal, create a hybrid image of that animal and a goose. If any part of ${name} is a type of food, give the goose a chef's hat and a plate of that food. If any part of ${name} is a type of profession, give the goose a uniform or outfit related to that profession. If any part of ${name} is a type of vehicle, give the goose a vehicle. If any part of ${name} is an adjective, add imagery that represents that adjective. If any part of ${name} is a verb, add imagery that represents that verb. Combine all of these instructions into a single image.`;

    //check if AI is even configured
    if (!c.env.AI) {
      console.error("AI binding is not configured.");
      return c.json({ error: "AI_not_configured" }, 500);
    }

    console.log("generating image...")
    const response = await c.env.AI.run(model, {
      prompt,
    });
    console.log("image generated")

    // NOTE - The cloudflare types are wrong here. This code works.
    const base64image = response.image;
    const buffer = Buffer.from(base64image, "base64");

    console.log("Saving image to R2 bucket")
    await c.env.R2_BUCKET.put(`${name}.png`, buffer);
    console.log("image saved")

    const [goose] = await db
      .insert(geese)
      .values({
        name,
      })
      .returning();

    return c.json({
      status: "OK",
      id: goose.id,
    });
  } catch (error) {
    console.error("AI generation failed:", error);
    return c.json(
      {
        error: "ai_generation_failed",
      },
      500,
    );
  }
  /*   try {
      //check if AI is even configured
      if (!c.env.AI) {
        console.error("AI binding is not configured.");
        return c.json({ error: "AI_not_configured" }, 500);
      }
      const model = "@cf/black-forest-labs/flux-1-schnell" as BaseAiTextToImageModels;
      const prompt = `Please generate a simple test image.`;
      const response = await c.env.AI.run(model, { prompt });
      console.log("AI Response:", response);
    } catch (err) {
      console.error("AI generation failed:", err);
      return c.json({ error: "AI_generation_failed" }, 500);
    } */

});

app.get("/api/geese/:name", async (c) => {
  const { name } = c.req.param();

  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const goose = await db.select().from(geese).where(eq(geese.name, name));

  if (goose.length === 0) {
    return c.json(
      {
        error: "doesnt_exist",
      },
      404,
    );
  }

  const image = await c.env.R2_BUCKET.get(`${name}.png`);

  if (!image) {
    return c.json(
      {
        error: "image_not_found",
      },
      404,
    );
  }

  c.header("Content-Type", "image/png");
  return c.body(image.body);
});


app.delete("/api/geese/:name", async (c) => {
  const { name } = c.req.param();

  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const goose = await db.select().from(geese).where(eq(geese.name, name));

  if (goose.length === 0) {
    return c.json(
      {
        error: "doesnt_exist",
      },
      404,
    );
  }

  await db.delete(geese).where(eq(geese.name, name));
  await c.env.R2_BUCKET.delete(`${name}.png`);

  return c.json({
    status: "deleted",
  });
});


export default instrument(app);
