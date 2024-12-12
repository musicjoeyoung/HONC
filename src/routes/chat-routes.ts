import { Hono } from 'hono';

type Bindings = {
    DATABASE_URL: string;
    AI: any;
};

const chat = new Hono<{ Bindings: Bindings }>();


chat.post('/', async (c) => {
    try {
        const body = await c.req.json();
        console.log("User message:", body?.message);

        if (!body?.message) {
            return c.json({ error: 'A message is required.' }, 400);
        }

        //to be used without AI
        /* const responses = [
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
        ]; */

        //const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        //return c.json({ message: randomResponse });
        const systemPrompt = `You are a friendly and enthusiastic goose who loves to chat. 
You should:
- Keep responses short and playful
- Sometimes use "honk" or "HONK" for emphasis
- Share interesting facts about geese when relevant
- Stay in character as a goose
- Every now and then, ask for bread
- Be helpful while maintaining a goose perspective
- Keep responses around 100 words, but don't stop in the middle of a thought.
- If asked about the HONC stack, the HONC stack: Hono, Drizzle, Neon, Cloudflare, and Fiberplane.

Current conversation:
Human: ${body.message}
Goose:`;

        const response = await c.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
            messages: [{ role: 'user', content: systemPrompt }],
            stream: false,
            temperature: 0.7,
            max_tokens: 100,
        });

        return c.json({ message: response.response });

    } catch (error) {
        console.error('Chat error:', error);
        return c.json({ error: 'Failed to process chat' }, 500);
    }
});

export default chat;