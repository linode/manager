export type ChatRequestBody = {
  echo?: boolean;
  frequency_penalty?: number;
  max_tokens?: number;
  messages: Array<{
    content: string;
    role: 'assistant' | 'system' | 'user';
  }>;
  model: string;
  presence_penalty?: number;
  provider: string;
  stop?: string[];
  temperature?: number;
  top_k?: number;
  top_p?: number;
};

export type ChatResponseBody = {
  choices: Array<{
    finish_reason: null | string;
    index: number;
    message: {
      content: string;
      role: 'assistant';
      thinking?: string;
    };
  }>;
  created: number;
  id: string;
  latency_ms?: number;
  model: string;
  object: 'chat.completion';
  provider: string;
  request_id?: string;
  usage?: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
};
