import { geeseQuestions, users } from "./src/db/schema";

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { geeseTrivia } from "./src/seeds/geese-questions"
import { neon } from "@neondatabase/serverless";
import { seedData } from "./src/seeds/users";

config({ path: ".dev.vars" });

// biome-ignore lint/style/noNonNullAssertion: error from neon client is helpful enough to fix
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

/* const seedData: NewUser[] = [
  { name: "Nikita Shamgunov", email: "nikita.shamgunov@example.com" },
  { name: "Heikki Linnakangas", email: "heikki.linnakangas@example.com" },
  { name: "Stas Kelvich", email: "stas.kelvich@example.com" },
  { name: "Dmitri Williams", email: "d.w@exmample.com" },
]; */

async function seed() {
  await db.insert(users).values(seedData);
  await db.insert(geeseQuestions).values(geeseTrivia);
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
