import { initChatGptGenerator } from "gpt-as-api";
import { Hono } from "hono";
import { cache } from "hono/cache";

const gpt = initChatGptGenerator(
  "Please behave as a TODO app from now on.\nI am sending the request to you now, please follow these instructions to get a response back.\n\n{{Domain}}"
);
const app = new Hono();

app.get(
  "*",
  cache({
    cacheName: "my-app",
    cacheControl: "max-age=600",
  })
);

app.get(
  "/",
  gpt("Please return the page with appropriate HTML to allow management of the TODO.", "html")
);
app.all("/api/*", gpt("Return the response in JSON as the API for TODO.", "json"));

export default app;
