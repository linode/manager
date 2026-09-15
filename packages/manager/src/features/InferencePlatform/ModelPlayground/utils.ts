import type { ChatCompletionOptions } from '../inferenceService';
import type { PlaygroundSettings, SupportedNumericParameter } from './types';
import type { InferenceModel, InferenceParameterDef } from '@linode/api-v4';

export const INITIAL_PLAYGROUND_SETTINGS: PlaygroundSettings = {
  enableThinking: false,
  frequency_penalty: undefined,
  max_tokens: undefined,
  min_p: undefined,
  presence_penalty: undefined,
  reasoning_effort: undefined,
  repetition_penalty: undefined,
  seed: undefined,
  stop: undefined,
  stream: false,
  systemPrompt: '',
  temperature: undefined,
  top_k: undefined,
  top_p: undefined,
};

export const SUPPORTED_NUMERIC_PARAMETERS = [
  'frequency_penalty',
  'max_tokens',
  'min_p',
  'presence_penalty',
  'repetition_penalty',
  'seed',
  'temperature',
  'top_k',
  'top_p',
] as const satisfies ReadonlyArray<SupportedNumericParameter>;

export const isSupportedNumericParameter = (
  name: string
): name is SupportedNumericParameter =>
  SUPPORTED_NUMERIC_PARAMETERS.some((parameter) => parameter === name);

export const getPlaygroundSettingsFromModelDetails = (
  details?: InferenceModel
): PlaygroundSettings => {
  if (!details) {
    return INITIAL_PLAYGROUND_SETTINGS;
  }

  const settings = { ...INITIAL_PLAYGROUND_SETTINGS };

  for (const [name, definition] of Object.entries(
    details.inference_parameters ?? {}
  )) {
    if (!definition || typeof definition !== 'object') {
      continue;
    }

    const value =
      name === 'max_tokens' &&
      (definition.default === undefined || definition.default === null)
        ? (details.parameters?.max_output_tokens ?? definition.maximum ?? 8192)
        : definition.default;

    if (value === undefined || value === null) {
      continue;
    }

    switch (name) {
      case 'enable_thinking':
        if (typeof value === 'boolean') settings.enableThinking = value;
        break;
      case 'frequency_penalty':
      case 'max_tokens':
      case 'min_p':
      case 'presence_penalty':
      case 'repetition_penalty':
      case 'seed':
      case 'temperature':
      case 'top_k':
      case 'top_p':
        if (typeof value === 'number') settings[name] = value;
        break;
      case 'reasoning_effort':
        if (
          typeof value === 'string' &&
          Array.isArray(definition.enum) &&
          definition.enum.includes(value)
        ) {
          settings.reasoning_effort = value;
        }
        break;
      case 'stop':
        if (
          Array.isArray(value) &&
          value.every((item) => typeof item === 'string')
        ) {
          settings.stop = value;
        }
        break;
      case 'stream':
        if (typeof value === 'boolean') settings[name] = value;
        break;
    }
  }

  return settings;
};

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

const clampToDefinition = (
  value: number,
  definition: InferenceParameterDef,
  maximumOverride?: number
): number => {
  const exclusiveBoundOffset = (bound: number) =>
    definition.type === 'integer'
      ? 1
      : Math.max(Math.abs(bound) * Number.EPSILON, Number.MIN_VALUE);
  let result = value;
  if (definition.minimum !== undefined) {
    result = Math.max(result, definition.minimum);
  }
  if (definition.exclusiveMinimum !== undefined) {
    const offset = exclusiveBoundOffset(definition.exclusiveMinimum);
    result = Math.max(result, definition.exclusiveMinimum + offset);
  }
  const maximum = maximumOverride ?? definition.maximum;
  if (maximum !== undefined) {
    result = Math.min(result, maximum);
  }
  if (definition.exclusiveMaximum !== undefined) {
    const offset = exclusiveBoundOffset(definition.exclusiveMaximum);
    result = Math.min(result, definition.exclusiveMaximum - offset);
  }
  return result;
};

export const buildApiOptionsForModel = (
  settings: PlaygroundSettings,
  modelDetails?: InferenceModel
): ChatCompletionOptions => {
  const options = mapSettingsToApiOptions(settings);

  if (!modelDetails) {
    return {
      stream: options.stream,
      stream_options: options.stream_options,
    };
  }

  const schema = modelDetails.inference_parameters ?? {};
  const enableThinkingDefinition = schema.enable_thinking;
  const reasoningEffortDefinition = schema.reasoning_effort;
  const hasEnableThinking = Boolean(enableThinkingDefinition);
  const hasReasoningEffort = Boolean(reasoningEffortDefinition);

  if (!hasEnableThinking) {
    options.chat_template_kwargs = undefined;
  }

  if (!hasReasoningEffort) {
    options.reasoning_effort = undefined;
  } else {
    const reasoningEffort = settings.reasoning_effort;
    const isValidReasoningEffort =
      typeof reasoningEffort === 'string' &&
      Array.isArray(reasoningEffortDefinition?.enum) &&
      reasoningEffortDefinition.enum.includes(reasoningEffort);

    options.reasoning_effort =
      isValidReasoningEffort && (!hasEnableThinking || settings.enableThinking)
        ? reasoningEffort
        : null;
  }

  if (!schema.stop) {
    options.stop = undefined;
  }

  for (const field of SUPPORTED_NUMERIC_PARAMETERS) {
    const definition = schema[field];
    const value = options[field];

    if (!definition) {
      options[field] = undefined;
      continue;
    }

    if (typeof value === 'number') {
      options[field] = clampToDefinition(
        value,
        definition,
        field === 'max_tokens'
          ? modelDetails.parameters?.max_output_tokens
          : undefined
      );
    }
  }

  return options;
};

/** Splits a completed assistant response into the reasoning block and the visible content. */
export const parseThinking = (
  raw: string
): { content: string; thinking?: string } => {
  // Complete <think>...</think> block.
  const complete = raw.match(/<think>([\s\S]*?)<\/think>/);
  if (complete) {
    const thinking = complete[1].trim() || undefined;
    const content = raw.replace(/<think>[\s\S]*?<\/think>/, '').trim();
    return { content, thinking };
  }
  // Incomplete <think> block — stream was aborted or cut off mid-think.
  const open = raw.match(/^<think>([\s\S]*)/);
  if (open) {
    return { content: '', thinking: open[1].trim() || undefined };
  }
  return { content: raw };
};

/** Handles in-progress <think> blocks during streaming. */
export const parseThinkingLive = (
  raw: string
): { content: string; thinking?: string } => {
  const complete = raw.match(/<think>([\s\S]*?)<\/think>([\s\S]*)/);
  if (complete) {
    return {
      content: complete[2].trim(),
      thinking: complete[1].trim() || undefined,
    };
  }
  const open = raw.match(/^<think>([\s\S]*)/);
  if (open) {
    return { content: '', thinking: open[1] || undefined };
  }
  return { content: raw };
};
