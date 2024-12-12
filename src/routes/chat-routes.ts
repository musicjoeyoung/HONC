import { Hono } from 'hono';

type Bindings = {
    DATABASE_URL: string;
};

const chat = new Hono<{ Bindings: Bindings }>();


chat.post('/', async (c) => {
    try {
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
    } catch (error) {
        return c.json({ error: 'Failed to process chat' }, 500);
    }
});

export default chat;