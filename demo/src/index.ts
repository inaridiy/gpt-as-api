import { initChatGptGenerator } from "gpt-as-api";
import { Hono } from "hono";

const gpt = initChatGptGenerator({
  prompt:
    "Please act as a TODO app from now on. I am now going to present you with a request, s please return its response according to the following instructions.\n\n{{Domain}}",
});
const app = new Hono();

app.get(
  "/",
  gpt(
    "Return the front end of the TODO application in HTML that can be executed as-is in the browser.",
    "html"
  )
);
app.all("/api/*", gpt("Return the response in JSON as the API for the TODO app.", "json"));

export default app;
