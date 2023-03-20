import { OpenAIChat, SupportedLLM } from "../llms";
import { Tool } from "../tools";
import { Agent, AgentRequestedAction, AgentStep } from "./Agent";

export interface SimpleAgentOptions<T = any> {
  prompt: string;
  llm: SupportedLLM;
  tools?: Tool<T>[];
  maxSteps?: number;
}

export class SimpleAgent<T = any> extends Agent {
  prompt: string;

  constructor(opt: SimpleAgentOptions<T>) {
    super(opt);
    this.prompt = opt.prompt;
  }

  static createOpenAISimpleAgent<T = any>(
    opt: Omit<SimpleAgentOptions<T>, "llm"> & { model?: string }
  ) {
    const llm = new OpenAIChat({ model: opt.model || "gpt-3.5-turbo" });
    return new SimpleAgent<T>({ ...opt, llm });
  }

  async createPrompt(prompt: string, httpReqString: string, steps: AgentStep[]): Promise<string> {
    const toolStrings = this.tools.map((tool) => `${tool.name}: ${tool.description}`).join("\n");
    const toolNames = this.tools.map((tool) => tool.name).join("\n");

    return (
      this.prompt
        .replaceAll("{{tools}}", toolStrings)
        .replaceAll("{{toolNames}}", toolNames)
        .replaceAll("{{httpReqString}}", httpReqString) +
      `\n\nPrompt: ${prompt}\n` +
      steps
        .map(
          (step) =>
            `Thought: ${step.response}` +
            step.actions
              .map(
                (action) =>
                  `ToolName: ${action.toolName}\nToolInput: ${action.toolInput}\n${action.toolOutput}`
              )
              .join("\n\n")
        )
        .join("\n\n") +
      "Thought: "
    );
  }

  async parseResponse(
    _prompt: string,
    _httpReqString: string,
    response: string
  ): Promise<AgentRequestedAction[]> {
    const toolActions = Array.from(response.matchAll(/ToolName: (.*)\nToolInput: (.*)\n(.*)/g));

    const actions: AgentRequestedAction[] = toolActions.map((toolAction) => {
      const toolName = toolAction[1];
      const toolInput = toolAction[2];
      return { toolName, toolInput };
    });

    return actions;
  }

  async isStepComplete(
    _prompt: string,
    _httpReqString: string,
    response: string
  ): Promise<boolean> {
    return response.includes("FinalAnswer: ");
  }
}
