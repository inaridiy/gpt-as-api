import { initChatGptGenerator } from "gpt-as-api";
import { Hono } from "hono";

const gpt = initChatGptGenerator({
  prompt:
    "これからTODOアプリとしてふるまってください。\n今からリクエストを行うので、そのアプリレスポンスをJSONで返してください。",
});
const app = new Hono();

app.all("/*", gpt("TODOアプリ"));

export default app;
