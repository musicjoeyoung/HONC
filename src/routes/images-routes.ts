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
        const prompt = `Please generate a image of a goose. Its name is ${name}. Make it in the style of comic or anime please and related to the name it is given. Include imagery that is related to ${name}. If a title such as "Dr.", "Doctor", "Mr.", "Ms.", "Mrs.", "Mister", "Miss", "Misses", "Sir", "Ma'am", or "Madame" is included in their ${name}, give them fancy and regal clothing and some sort of top hat. IF ANY PART OF ${name} is the name of some other type of animal, create a hybrid image of that animal and a goose--this is VERY important. For example, if ${name} includes "dog", produce a goose that looks like a dog. If any part of ${name} is a type of food, give the goose a chef's hat and a plate of that food. If any part of ${name} is a type of profession, give the goose a uniform or outfit related to that profession. If any part of ${name} is a type of vehicle, give the goose a vehicle. If any part of ${name} is an adjective, add imagery that represents that adjective. If any part of ${name} is a verb, add imagery that represents that verb. Combine all of these instructions into a single image.`;

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