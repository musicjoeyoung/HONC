import { Hono } from "hono";
import chat from "./routes/chat-routes";
import { cors } from "hono/cors";
import images from "./routes/images-routes";
import { instrument } from "@fiberplane/hono-otel";
import trivia from "./routes/trivia-routes";

type Bindings = {
  DATABASE_URL: string;
  R2_BUCKET: R2Bucket;
  AI: Ai;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(cors())

app.get("/", (c) => {
  return c.text("Welcome to Honc! 🪿");
});

app.route('/api/geese-trivia', trivia);
app.route('/api/chat', chat);
app.route('/api/geese', images);


export default instrument(app);
