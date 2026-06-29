/**
 * Service layer for the Inference Platform API.
 *
 * Uses a separate API key from the standard Linode API.
 * These calls use native `fetch` rather than the axios-based `Request()`
 * helper in `@linode/api-v4` because of the different base URL.
 *
 * Set REACT_APP_INFERENCE_BASE_URL in your .env file, e.g.:
 *   REACT_APP_INFERENCE_BASE_URL=http://us-sea-data-plane-dev.aic-si-alpha.armada.akaplat.net/v1
 */

// TODO: Replace with the real auth mechanism once the API key service is ready.
const INFERENCE_BASE_URL = import.meta.env.REACT_APP_INFERENCE_BASE_URL;
const INFERENCE_API_KEY = import.meta.env.REACT_APP_INFERENCE_API_KEY ?? '';

const inferenceHeaders = {
  Authorization: `Bearer ${INFERENCE_API_KEY}`,
  'Content-Type': 'application/json',
};

export interface InferenceChatMessage {
  content: string;
  role: 'assistant' | 'system' | 'user';
}

/**
 * Parameters forwarded to the chat completion API.
 * All fields are optional — omitted fields let the model use its own defaults.
 */
export interface ChatCompletionOptions {
  best_of?: null | number;
  chat_template_kwargs?: null | { enable_thinking?: boolean };
  frequency_penalty?: null | number;
  ignore_eos?: boolean | null;
  logit_bias?: null | Record<string, number>;
  logprobs?: null | number;
  max_tokens?: null | number;
  min_p?: null | number;
  min_tokens?: null | number;
  n?: null | number;
  presence_penalty?: null | number;
  prompt_logprobs?: null | number;
  reasoning_effort?: 'high' | 'low' | 'medium' | null;
  repetition_penalty?: null | number;
  seed?: null | number;
  skip_special_tokens?: boolean | null;
  spaces_between_special_tokens?: boolean | null;
  stop?: null | string | string[];
  stop_token_ids?: null | number[];
  stream?: boolean;
  stream_options?: null | { include_usage?: boolean };
  temperature?: null | number;
  tool_choice?: null | object | string;
  tools?: null | object[];
  top_k?: null | number;
  top_p?: null | number;
  user?: null | string;
}

export interface InferenceModel {
  /** Unix timestamp (seconds) when the model was registered in vLLM. */
  created?: number;
  id: string;
  /** Maximum context window in tokens as configured in vLLM at deploy time. */
  max_model_len?: number;
  object: string;
  /** Always "vllm" on this backend. */
  owned_by?: string;
  /** Full HuggingFace repo path, e.g. "moonshotai/Kimi-K2.6". */
  root?: string;
}

export interface InferenceModelsResponse {
  data: InferenceModel[];
  object: string;
}

/**
 * Fetch the list of models available on the inference endpoint.
 */
export const fetchInferenceModels = (): Promise<Response> =>
  fetch(`${INFERENCE_BASE_URL}/models`, { headers: inferenceHeaders });

/**
 * Send a chat completion request to the inference endpoint.
 */
export const requestInferenceChatCompletion = (
  messages: InferenceChatMessage[],
  model: string,
  options: ChatCompletionOptions = {},
  signal?: AbortSignal
): Promise<Response> =>
  fetch(`${INFERENCE_BASE_URL}/chat/completions`, {
    body: JSON.stringify({
      ...options,
      messages,
      model,
    }),
    headers: inferenceHeaders,
    method: 'POST',
    signal,
  });
