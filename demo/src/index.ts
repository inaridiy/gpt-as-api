import { initChatGptGenerator } from "gpt-as-api";
import { Hono } from "hono";
import { cache } from "hono/cache";

const gpt = initChatGptGenerator({
  prompt:
    "これからTODOアプリとしてふるまってください。\nTODOは作成者と名前と達成済みかの情報を持っています。\n今からリクエストを行うので、そのアプリレスポンスを次の指示に従って返却してください。\n\n{{Domain}}",
});
const app = new Hono();

app.get(
  "*",
  cache({
    cacheName: "my-app",
    cacheControl: "max-age=600",
  })
);

app.get("/", gpt("TODOアプリのフロントエンドをHTMLで適切に返してください。", "html"));
app.all("/api/*", gpt("TODOアプリのAPIとしてレスポンスをJSONで返してください。", "json"));

export default app;
