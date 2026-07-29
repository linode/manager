import type { ChatCompletionOptions } from '../inferenceService';

/**
 * UI-level settings owned by the Controls sidebar. Typed for form controls
 * (`number | undefined`) rather than the API schema (`null | number`).
 *
 * `systemPrompt` is a UI abstraction — it is prepended as a
 * `{ role: 'system' }` message by `buildRequestMessages` before the API call.
 */
export interface PlaygroundSettings {
  enableThinking: boolean;
  frequency_penalty: number | undefined;
  max_tokens: number | undefined;
  min_p: number | undefined;
  presence_penalty: number | undefined;
  reasoning_effort: 'high' | 'low' | 'medium';
  repetition_penalty: number | undefined;
  seed: number | undefined;
  stop: string[] | undefined;
  stream: boolean;
  systemPrompt: string;
  temperature: number | undefined;
  top_k: number | undefined;
  top_p: number | undefined;
}

export const DEFAULT_PLAYGROUND_SETTINGS: PlaygroundSettings = {
  enableThinking: true,
  frequency_penalty: undefined,
  max_tokens: 4096,
  min_p: undefined,
  presence_penalty: undefined,
  reasoning_effort: 'medium',
  repetition_penalty: undefined,
  seed: undefined,
  stop: undefined,
  stream: true,
  systemPrompt: '',
  temperature: 0.6,
  top_k: 40,
  top_p: 1,
};

/**
 * Maps UI settings to the vLLM API schema.
 * `undefined` becomes `null` to explicitly unset a field on the server.
 * `stream` and `stream_options` are included and derived from `settings.stream`.
 */
export const mapSettingsToApiOptions = (
  settings: PlaygroundSettings
): ChatCompletionOptions => ({
  chat_template_kwargs: { enable_thinking: settings.enableThinking },
  frequency_penalty: settings.frequency_penalty ?? null,
  max_tokens: settings.max_tokens ?? null,
  min_p: settings.min_p ?? null,
  presence_penalty: settings.presence_penalty ?? null,
  reasoning_effort: settings.enableThinking ? settings.reasoning_effort : null,
  repetition_penalty: settings.repetition_penalty ?? null,
  seed: settings.seed ?? null,
  stop: settings.stop ?? null,
  stream: settings.stream,
  stream_options: settings.stream ? { include_usage: true } : null,
  temperature: settings.temperature ?? null,
  top_k: settings.top_k ?? null,
  top_p: settings.top_p ?? null,
});
