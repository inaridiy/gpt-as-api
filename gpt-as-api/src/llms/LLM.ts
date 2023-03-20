export abstract class LLM {
  // Cloudflare の環境変数はグローバルで参照できないため
  abstract call(call: { apiKey?: string; prompt: string }): Promise<string>;
}

export interface Message {
  role: string;
  name?: string;
  meta?: any;
  content: string;
}

export abstract class LLMChat implements LLM {
  abstract call(call: { apiKey?: string; prompt: string }): Promise<string>;

  abstract respond(call: { apiKey: string; messages: Message[] }): Promise<string>;
}

export type SupportedLLM = LLM | LLMChat;
