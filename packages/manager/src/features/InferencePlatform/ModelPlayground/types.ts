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
  reasoning_effort: string | undefined;
  repetition_penalty: number | undefined;
  seed: number | undefined;
  stop: string[] | undefined;
  stream: boolean;
  systemPrompt: string;
  temperature: number | undefined;
  top_k: number | undefined;
  top_p: number | undefined;
}

export type SupportedNumericParameter =
  | 'frequency_penalty'
  | 'max_tokens'
  | 'min_p'
  | 'presence_penalty'
  | 'repetition_penalty'
  | 'seed'
  | 'temperature'
  | 'top_k'
  | 'top_p';
