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
  provider_icon?: string;
}

export interface InferenceModelModalities {
  input: string[];
  output: string[];
}

export interface InferenceModelParameters {
  architecture?: string;
  context_window: number;
  max_output_tokens: number;
  parameter_count_billions: number;
  precision?: string;
  total_params?: string;
}

export interface InferenceModelHighlight {
  item_text: string;
  title: string;
}

export interface InferenceModelMoreInfo {
  highlights: InferenceModelHighlight[];
  long_description: string;
}

export interface InferenceModelPriceValue {
  hourly: null | number;
  monthly: null | number;
}

export interface InferenceModelPrice {
  id: string;
  label: string;
  price: InferenceModelPriceValue;
  region_prices: InferenceModelPriceValue[];
  transfer: number;
}

export type InferenceParameterValue = boolean | number | string;

export interface InferenceParameterDef {
  default?: Array<InferenceParameterValue> | InferenceParameterValue | null;
  description?: string;
  enum?: InferenceParameterValue[];
  exclusiveMaximum?: number;
  exclusiveMinimum?: number;
  items?: {
    type: 'boolean' | 'integer' | 'number' | 'string';
  };
  label?: string;
  maximum?: number;
  minimum?: number;
  type: 'array' | 'boolean' | 'integer' | 'number' | 'string';
}

export interface InferenceModelPerformance {
  benchmark_date: string;
  latency_p50_ms: number;
  latency_p99_ms: number;
  throughput_tokens_per_sec: number;
  time_to_first_token_ms: number;
}

export interface InferenceModelLimits {
  max_concurrent_requests: number;
  max_requests_per_minute: number;
  max_tokens_per_minute: number;
  max_tokens_per_request: number;
}

export interface InferenceModelRegionalAvailability {
  capacity: string;
  operational_status: string;
  region: string;
}

export interface InferenceModelVersionInfo {
  current_version: string;
  deprecation_date: null | string;
  release_date: string;
  sunset_date: null | string;
  versions: string[];
}

export interface InferenceModelLicense {
  attribution_required: boolean;
  commercial_use: boolean;
  name: string;
  url: string;
}

export interface InferenceModel {
  api_reference_url?: string;
  capabilities: string[];
  created_at?: string;
  description: string;
  documentation_url?: string;
  id: string;
  /**
   * Object keyed by parameter name (e.g. `temperature`, `max_tokens`).
   * The UI should render each key as the parameter name.
   */
  inference_parameters?: Record<string, InferenceParameterDef>;
  label: string;
  license?: InferenceModelLicense;
  lifecycle_status: string;
  limits?: InferenceModelLimits;
  modalities: InferenceModelModalities;
  model_icon?: string;
  more_info?: InferenceModelMoreInfo;
  parameters: InferenceModelParameters;
  performance?: InferenceModelPerformance;
  playground_available: boolean;
  prices?: InferenceModelPrice[];
  provider: InferenceModelProvider;
  regional_availability?: InferenceModelRegionalAvailability[];
  regions: string[];
  tags: string[];
  type: string;
  updated_at?: string;
  use_cases: string[];
  version_info?: InferenceModelVersionInfo;
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

export interface InferenceUsageCredits {
  max_credits: number;
  used_credits: number;
}
