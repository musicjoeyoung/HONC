import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/neon-http';
import { geeseQuestions } from '../db/schema';
import { neon } from '@neondatabase/serverless';

type Bindings = {
    DATABASE_URL: string;
};

const trivia = new Hono<{ Bindings: Bindings }>();

trivia.get('/', async (c) => {
    try {
        const sql = neon(c.env.DATABASE_URL);
        const db = drizzle(sql);
        const geeseTrivia = await db.select().from(geeseQuestions);
        return c.json({ geeseTrivia });
    } catch (error) {
        return c.json({ error: 'Failed to fetch trivia' }, 500);
    }
});

export default trivia;