import { geese, geeseQuestions } from "./src/db/schema";

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { geeseNames } from "./src/seeds/geese-names";
import { geeseTrivia } from "./src/seeds/geese-questions"
import { neon } from "@neondatabase/serverless";

config({ path: ".dev.vars" });

// biome-ignore lint/style/noNonNullAssertion: error from neon client is helpful enough to fix
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);



async function seed() {
  await db.delete(geeseQuestions);
  await db.delete(geese);
  await db.insert(geeseQuestions).values(geeseTrivia);
  await db.insert(geese).values(geeseNames);
}

async function main() {
  try {
    await seed();
    console.log("✅ Database seeded successfully!");
    console.log("🪿 Run `npm run fiberplane` to explore data with your api.");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}
main();
