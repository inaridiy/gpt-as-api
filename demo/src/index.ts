import { initChatGptGenerator } from "gpt-as-api";
import { Hono } from "hono";

const gpt = initChatGptGenerator({
  prompt:
    "これからTODOアプリとしてふるまってください。\n今からリクエストを行うので、そのアプリレスポンスを次の指示に従って返却してください。\n\n{{Domain}}",
});
const app = new Hono();

app.get("/", gpt("TODOアプリのフロントエンドをHTMLで適切に返してください。", "html"));
app.all("/api/*", gpt("TODOアプリのAPIとしてレスポンスをJSONで返してください。", "json"));

export default app;
