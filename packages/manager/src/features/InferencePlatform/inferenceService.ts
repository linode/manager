/**
 * Service layer for the Inference Platform API.
 *
 * Uses playground API keys managed via the Linode API for authentication.
 * These calls use native `fetch` rather than the axios-based `Request()`
 * helper in `@linode/api-v4` because of the different base URL.
 *
 * Set REACT_APP_INFERENCE_BASE_URL in your .env file, e.g.:
 *   REACT_APP_INFERENCE_BASE_URL=https://api.alpha.akamai-inference.com/v1
 */

const INFERENCE_BASE_URL = import.meta.env.REACT_APP_INFERENCE_BASE_URL;

/**
 * Client-side request timeout in milliseconds. Set slightly above the
 * backend's 300s gateway timeout so the server's own error response has a
 * chance to arrive first, giving a more specific error message.
 */
export const INFERENCE_REQUEST_TIMEOUT_MS = 320_000;

/**
 * Builds the headers for inference API requests with the provided API key.
 */
const buildInferenceHeaders = (apiKey: string) => ({
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
});

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

/**
 * Send a chat completion request to the inference endpoint.
 */
export const requestInferenceChatCompletion = (
  messages: InferenceChatMessage[],
  model: string,
  apiKey: string,
  options: ChatCompletionOptions = {},
  signal?: AbortSignal
): Promise<Response> =>
  fetch(`${INFERENCE_BASE_URL}/chat/completions`, {
    body: JSON.stringify({
      ...options,
      messages,
      model,
    }),
    headers: buildInferenceHeaders(apiKey),
    method: 'POST',
    signal,
  });
