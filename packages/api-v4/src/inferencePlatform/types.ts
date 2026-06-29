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

// API Key types
export type ApiKeyStatus = 'active' | 'expired' | 'revoked';

export type ApiKeyType = 'playground' | 'user';

export interface ApiKey {
  allowed_models: string[];
  created: string;
  description: string;
  expiry: null | string;
  id: number;
  key: string;
  key_prefix: string;
  key_type: ApiKeyType;
  label: string;
  last_used: null | string;
  status: ApiKeyStatus;
  updated: string;
  usage_24h?: number[];
}

// Response when creating an API key - includes the full key (only shown once)
export interface CreateApiKeyResponse extends ApiKey {
  key: string;
}

export interface CreateApiKeyPayload {
  allowed_models?: string[];
  description?: string;
  expiry?: null | string;
  key_type: ApiKeyType;
  label: string;
}

export interface UpdateApiKeyPayload {
  allowed_models?: string[];
  description?: string;
  expiry?: null | string;
  label?: string;
}

// Model types
export interface Model {
  id: string;
  label: string;
  provider: string;
}
