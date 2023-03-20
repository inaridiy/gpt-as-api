import { SupportedLLM } from "../llms";
import { Tool } from "../tools";

export interface AgentOptions<T> {
  llm: SupportedLLM;
  tools?: Tool<T>[];
  maxSteps?: number;
}

export interface AgentRequestedAction {
  toolName: string;
  toolInput: string;
}

export interface AgentStep {
  prompt: string;
  response: string;
  actions: {
    toolName: string;
    toolInput: string;
    toolOutput: string | undefined;
  }[];
}

export abstract class Agent<T = any> {
  llm: SupportedLLM;
  tools: Tool<T>[];
  maxSteps: number;

  constructor(opt: AgentOptions<T>) {
    this.llm = opt.llm;
    this.tools = opt.tools || [];
    this.maxSteps = opt.maxSteps || 3;
  }

  abstract createPrompt(prompt: string, steps: AgentStep[]): Promise<string>;

  abstract parseResponse(prompt: string, response: string): Promise<AgentRequestedAction[]>;

  abstract isStepComplete(prompt: string, response: string): Promise<boolean>;

  async execute(opt: { apiKey: string; prompt: string; env: T }): Promise<string> {
    let steps: AgentStep[] = [];
    for (let i = 0; i < this.maxSteps; i++) {
      await Promise.all(this.tools.map((tool) => tool.init(opt.env)));
      const callPrompt = await this.createPrompt(opt.prompt, steps);
      const response = await this.llm.call({ apiKey: opt.apiKey, prompt: callPrompt });
      const actions = await this.parseResponse(callPrompt, response);
      const toolOutputs = await Promise.resolve(actions)
        .then((actions) =>
          actions.map(async (action) => {
            const toolOutput = await this.tools
              .find((t) => t.name.toLowerCase().includes(action.toolName.toLowerCase()))
              ?.use(action.toolInput);
            return { ...action, toolOutput };
          })
        )
        .then((outputs) => Promise.all(outputs));

      steps.push({
        prompt: callPrompt,
        response,
        actions: toolOutputs,
      } satisfies AgentStep);

      if (await this.isStepComplete(callPrompt, response)) {
        return response;
      }
    }

    return steps[steps.length - 1].response;
  }
}
