import { Hono } from "hono";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { geese } from "../db/schema";
import { neon } from "@neondatabase/serverless";

type Bindings = {
    DATABASE_URL: string;
    AI: any;
    R2_BUCKET: R2Bucket;
};

const images = new Hono<{ Bindings: Bindings }>();

//just the names--not images
images.get("/", async (c) => {
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    return c.json({
        geese: await db.select().from(geese),
    });
});

images.post("/:name", async (c) => {
    const { name } = c.req.param();

    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    console.log("checking if image exists");
    const maybeImage = await db.select().from(geese).where(eq(geese.name, name));
    console.log("database query completed");

    if (maybeImage.length !== 0) {
        return c.json(
            {
                error: "already_exists",
            },
            400
        );
    }

    try {
        const model = "@cf/black-forest-labs/flux-1-schnell" as BaseAiTextToImageModels;
        const prompt = `Generate a single image of a goose character named ${name} in an anime/comic style. CRITICAL ANATOMICAL REQUIREMENTS:
1. MUST have EXACTLY ONE HEAD - NO exceptions, NO mutations, NO extra heads
2. Basic goose anatomy required: ONE long neck, ONE head, ONE beak, TWO wings, TWO legs

Character customization based on ${name}:
- For animal hybrids: Blend the non-goose animal's features into the single goose (e.g., "Bear Goose" should have ONE head with bear fur texture and goose beak; "Dog" should have ONE head with dog ears and goose beak and maybe a dog tail)
- Never create multiple heads or split features
- Maintain goose silhouette while adding themed elements

Style modifications based on ${name}:
- Titles (Dr./Mr./Ms./etc.): Add formal wear and top hat
- Food words: Add chef hat and plated food
- Professions: Add job-specific uniform
- Vehicles: Show goose with vehicle
- Adjectives: Add visual representation (e.g., "sad" = forlorn expression; "happy" = big smile)
- Verbs: Show goose in action (e.g., "running" = goose running; "flying" = goose flying)

IMPORTANT: Create ONE unified character with ONE head, maintaining goose characteristics while incorporating thematic elements naturally.`;
        if (!c.env.AI) {
            console.error("AI binding is not configured.");
            return c.json({ error: "AI_not_configured" }, 500);
        }

        console.log("generating image...");
        const response = await c.env.AI.run(model, {
            prompt,
        });
        console.log("image generated");

        const base64image = response.image;
        const buffer = Buffer.from(base64image, "base64");

        console.log("Saving image to R2 bucket");
        await c.env.R2_BUCKET.put(`${name}.png`, buffer);
        console.log("image saved");

        const [image] = await db
            .insert(geese)
            .values({
                name,
            })
            .returning();

        return c.json({
            status: "OK",
            id: image.id,
        });
    } catch (error) {
        console.error("AI generation failed:", error);
        return c.json(
            {
                error: "ai_generation_failed",
            },
            500
        );
    }
});

images.get("/:name", async (c) => {
    const { name } = c.req.param();

    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const image = await db.select().from(geese).where(eq(geese.name, name));

    if (image.length === 0) {
        return c.json(
            {
                error: "doesnt_exist",
            },
            404
        );
    }

    const imageFile = await c.env.R2_BUCKET.get(`${name}.png`);

    if (!imageFile) {
        return c.json(
            {
                error: "image_not_found",
            },
            404
        );
    }

    c.header("Content-Type", "image/png");
    return c.body(imageFile.body);
});

images.delete("/:name", async (c) => {
    const { name } = c.req.param();

    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const image = await db.select().from(geese).where(eq(geese.name, name));

    if (image.length === 0) {
        return c.json(
            {
                error: "doesnt_exist",
            },
            404
        );
    }

    await db.delete(geese).where(eq(geese.name, name));
    await c.env.R2_BUCKET.delete(`${name}.png`);

    return c.json({
        status: "deleted",
    });
});

export default images;