import { ChatCompletionResponseMessage, Configuration, OpenAIApi } from "openai";
import { LLMChat, Message } from "./LLM";

export class OpenAIChat extends LLMChat {
  public model: string;

  constructor(opt: { model: string }) {
    super();
    this.model = opt.model;
  }

  call(call: { apiKey: string; prompt: string }): Promise<string> {
    return this.respond({
      apiKey: call.apiKey,
      messages: [{ role: "user", content: call.prompt }],
    });
  }

  async respond(call: { apiKey: string; messages: Message[] }): Promise<string> {
    const openai = new OpenAIApi(new Configuration({ apiKey: call.apiKey }));
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${call.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: call.messages.map((m) => ({
          role: ["system", "user", "assistant"].includes(m.role)
            ? (m.role as "system" | "user" | "assistant")
            : "user",
          name: m.name,
          content: m.content,
        })),
      }),
    }).then((res) =>
      res.json<{
        choices: { message: ChatCompletionResponseMessage }[];
      }>()
    );

    return res.choices[0].message?.content || "";
  }
}
