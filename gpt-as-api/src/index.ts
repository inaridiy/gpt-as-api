import { Context } from "hono";
import { SupportedLLM } from "./llms";
import { OpenAIChat } from "./llms/openai";
import { Tool } from "./tools/Tool";

export interface LLMOptions {
  llm: SupportedLLM;
  prompt?: string;
  tools?: Tool[];
}

export type GenerateLLMHandler = (prompt: string) => (c: Context) => Promise<Response>;

const extractJSON = (input: string) => {
  const jsonRegex = /{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*}/g;
  const jsonMatches = input.match(jsonRegex);

  if (!jsonMatches) {
    throw new Error("No JSON found in the input string.");
  }

  const jsonArray = jsonMatches.map((jsonString) => JSON.parse(jsonString));
  return jsonArray.length === 1 ? jsonArray[0] : jsonArray;
};

export const initGenerator = (opt: LLMOptions): GenerateLLMHandler => {
  const { llm, prompt = "{{Domain}}", tools = [] } = opt;
  return (domainPrompt: string) =>
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
      return c.json(extractJSON(res));
    };
};

export const initChatGptGenerator = (
  opt: Omit<LLMOptions, "llm"> & { model?: string } = {}
): GenerateLLMHandler => {
  const llm = new OpenAIChat({ model: opt.model || "gpt-3.5-turbo" });
  return initGenerator({ ...opt, llm });
};
