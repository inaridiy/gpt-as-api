import { Context } from "hono";
import { SupportedLLM } from "./llms";
import { OpenAIChat } from "./llms/openai";
import { Tool } from "./tools/Tool";
import { extractHTML, extractJSON } from "./utils";

export interface LLMOptions {
  llm: SupportedLLM;
  prompt?: string;
  tools?: Tool[];
}

export type GenerateLLMHandler = (
  prompt: string,
  type?: "json" | "html" | string
) => (c: Context) => Promise<Response>;

export const initGenerator = (opt: LLMOptions): GenerateLLMHandler => {
  const { llm, prompt = "{{Domain}}", tools = [] } = opt;
  return (domainPrompt: string, type: "json" | "html" | string = "json") =>
    async <T extends { Bindings: { OPENAI_API_KEY: string } }>(c: Context<T>) => {
      const [path, query, body, headers] = [
        c.req.path,
        c.req.query(),
        c.req.parseBody(),
        Object.fromEntries(c.req.headers.entries()),
      ];
      const finalPrompt = `
    ${prompt.replace("{{Domain}}", domainPrompt)}

    path:
    ${path}

    method:
    ${c.req.method}

    headers:
    ${JSON.stringify(headers, null, 2)}

    query:
    ${JSON.stringify(query, null, 2)}

    body:
    ${JSON.stringify(body, null, 2)}  
    `;

      const res = await llm.call({ apiKey: c.env.OPENAI_API_KEY, prompt: finalPrompt });
      if (type === "json") {
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
  opt: Omit<LLMOptions, "llm"> & { model?: string } = {}
): GenerateLLMHandler => {
  const llm = new OpenAIChat({ model: opt.model || "gpt-3.5-turbo" });
  return initGenerator({ ...opt, llm });
};
