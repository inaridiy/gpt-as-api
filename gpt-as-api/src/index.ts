import { Context } from "hono";
import { Agent } from "./agents/Agent";
import { SimpleAgent } from "./agents/SimpleAgent";
import { extractHTML, extractJSON } from "./utils";

export interface AgentExecuteEnv {
  apiKey: string;
  env: any;
}

export const defaultEnvSolver = (c: Context): AgentExecuteEnv => ({
  apiKey: c.env.OPENAI_API_KEY,
  env: c.env,
});

export type extractType = (input: string) => {
  contentType: string;
  value: string;
};

export const createAgentHandler =
  (agent: Agent, envSolver = defaultEnvSolver) =>
  (prompt: string, extract: "json" | "html" | extractType = "json") =>
  async (c: Context) => {
    const [method, path, header, query, body] = [
      c.req.method,
      c.req.path,
      c.req.header(),
      c.req.query(),
      c.req.parseBody(),
    ];
    const httpReqString = `method: ${method}
    path: ${path}

    header:
    ${JSON.stringify(header, null, 2)}
    
    query:
    ${JSON.stringify(query, null, 2)}

    body:
    ${JSON.stringify(body, null, 2)}`;

    const output = await agent.execute({
      ...envSolver(c),
      httpReqString,
      prompt,
    });

    if (typeof extract === "function") {
      const { contentType, value } = extract(output);
      c.header("Content-Type", contentType);
      return c.body(value);
    } else if (extract === "json") {
      const json = extractJSON(output);
      return c.json(json);
    } else if (extract === "html") {
      const html = extractHTML(output);
      return c.html(html);
    } else {
      throw new Error(`unknown extract type: ${extract}`);
    }
  };

export const createMockSimpleGptHandler = (
  prompt: string,
  model = "gpt-3.5-turbo",
  maxSteps = 1
) => {
  const simpleGptAgent = SimpleAgent.createOpenAISimpleAgent({
    model,
    prompt,
    maxSteps,
  });
  return createAgentHandler(simpleGptAgent);
};
