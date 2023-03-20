import { Context } from "hono";
import { OpenAIChat, SupportedLLM } from "./llms";
import { extractHTML, extractJSON } from "./utils";

export interface LLMOptions {
  llm: SupportedLLM;
  prompt?: string;
}

export type extractType = (res: string) => {
  contentType: string;
  content: string;
};

export type GenerateLLMHandler = (
  prompt: string,
  type?: "json" | "html" | extractType
) => (c: Context) => Promise<Response>;

export const initGenerator = (opt: LLMOptions): GenerateLLMHandler => {
  const { llm, prompt = "{{Domain}}" } = opt;
  return (domainPrompt, type = "json") =>
    async <T extends { Bindings: { OPENAI_API_KEY: string } }>(c: Context<T>) => {
      const [path, query, body, header] = [
        c.req.path,
        c.req.query(),
        c.req.parseBody(),
        c.req.header(),
      ];
      const finalPrompt = `
    ${prompt.replace("{{Domain}}", domainPrompt)}

    path:
    ${path}

    method:
    ${c.req.method}

    headers:
    ${JSON.stringify(header, null, 2)}

    query:
    ${JSON.stringify(query, null, 2)}

    body:
    ${JSON.stringify(body, null, 2)}  
    `;

      const res = await llm.call({ apiKey: c.env.OPENAI_API_KEY, prompt: finalPrompt });

      if (typeof type === "function") {
        const { contentType, content } = type(res);
        c.header("Content-Type", contentType);
        return c.body(content);
      } else if (type === "json") {
        const json = extractJSON(res);
        return c.json(json);
      } else if (type === "html") {
        const html = extractHTML(res);
        return c.html(html);
      } else {
        return c.text(res);
      }
    };
};

export const initChatGptGenerator = (
  prompt: string,
  opt: Omit<LLMOptions, "llm" | "prompt"> & { model?: string } = {}
): GenerateLLMHandler => {
  const llm = new OpenAIChat({ model: opt.model || "gpt-3.5-turbo" });
  return initGenerator({ ...opt, prompt, llm });
};
