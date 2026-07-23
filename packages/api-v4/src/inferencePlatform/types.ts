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

// Inference Model types from /v4beta/inference/models
export interface InferenceModelProvider {
  id: string;
  name: string;
}

export interface InferenceModelModalities {
  input: string[];
  output: string[];
}

export interface InferenceModelParameters {
  context_window: number;
  max_output_tokens: number;
  parameter_count_billions: number;
}

export interface InferenceModel {
  capabilities: string[];
  description: string;
  id: string;
  label: string;
  lifecycle_status: string;
  modalities: InferenceModelModalities;
  parameters: InferenceModelParameters;
  playground_available: boolean;
  price_input_per_million?: number;
  price_output_per_million?: number;
  provider: InferenceModelProvider;
  regions: string[];
  tags: string[];
  type: string;
  use_cases: string[];
}

export interface InferenceModelsResponse {
  data: InferenceModel[];
}

// Usage types
export interface InferenceUsageSummary {
  avg_latency_ms: number;
  failed_requests: number;
  input_tokens: number;
  output_tokens: number;
  successful_requests: number;
  total_requests: number;
  total_tokens: number;
}

export interface InferenceUsageTimeSeries {
  bucket: string;
  group_id: string;
  group_label: string;
  input_tokens: number;
  output_tokens: number;
  request_count: number;
  total_tokens: number;
}

export interface InferenceUsageBreakdown {
  id: string;
  input_tokens: number;
  label: string;
  output_tokens: number;
  percentage: number;
  request_count: number;
  total_tokens: number;
}

export interface InferenceUsage {
  breakdown: InferenceUsageBreakdown[];
  summary: InferenceUsageSummary;
  time_series: InferenceUsageTimeSeries[];
}

export interface InferenceUsageRequest {
  api_key_id?: number;
  end_date?: string;
  granularity?: string;
  group_by?: string;
  include_breakdown?: boolean;
  include_time_series?: boolean;
  model_id?: string;
  start_date?: string;
  top_n?: number;
}
