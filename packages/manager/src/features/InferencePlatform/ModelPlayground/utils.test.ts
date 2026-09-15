import {
  buildApiOptionsForModel,
  getPlaygroundSettingsFromModelDetails,
  INITIAL_PLAYGROUND_SETTINGS,
  parseThinking,
  parseThinkingLive,
} from './utils';

import type { InferenceModel, InferenceParameterDef } from '@linode/api-v4';

const THE_ANSWER = 'The answer.';

describe('parseThinking', () => {
  it('returns content as-is when no <think> tag is present', () => {
    expect(parseThinking('Hello, world!')).toEqual({
      content: 'Hello, world!',
    });
  });

  it('extracts thinking and content from a complete <think> block', () => {
    const raw = '<think>My reasoning here</think>The answer is 42.';
    expect(parseThinking(raw)).toEqual({
      content: 'The answer is 42.',
      thinking: 'My reasoning here',
    });
  });

  it('trims whitespace from both thinking and content', () => {
    const raw = '<think>  reasoning  </think>  answer  ';
    expect(parseThinking(raw)).toEqual({
      content: 'answer',
      thinking: 'reasoning',
    });
  });

  it('returns no thinking property when think block is empty', () => {
    const raw = `<think></think>${THE_ANSWER}`;
    expect(parseThinking(raw)).toEqual({ content: THE_ANSWER });
  });

  it('returns no thinking property when think block contains only whitespace', () => {
    const raw = `<think>   </think>${THE_ANSWER}`;
    expect(parseThinking(raw)).toEqual({ content: THE_ANSWER });
  });

  it('returns content: "" and thinking when block is incomplete (stream cut off mid-think)', () => {
    const raw = '<think>still reasoning...';
    expect(parseThinking(raw)).toEqual({
      content: '',
      thinking: 'still reasoning...',
    });
  });

  it('returns no thinking property for an incomplete but empty think block', () => {
    expect(parseThinking('<think>')).toEqual({ content: '' });
  });

  it('handles multiline thinking content', () => {
    const raw = '<think>line one\nline two\nline three</think>Final answer.';
    expect(parseThinking(raw)).toEqual({
      content: 'Final answer.',
      thinking: 'line one\nline two\nline three',
    });
  });

  it('strips the think block and preserves content after it', () => {
    const raw = '<think>reasoning</think>answer';
    expect(parseThinking(raw)).toEqual({
      content: 'answer',
      thinking: 'reasoning',
    });
  });
});

describe('parseThinkingLive', () => {
  it('returns the raw string as content when no <think> tag is present', () => {
    expect(parseThinkingLive('Hello!')).toEqual({ content: 'Hello!' });
  });

  it('extracts thinking and content after </think> when block is complete', () => {
    const raw = '<think>My reasoning</think> The answer.';
    expect(parseThinkingLive(raw)).toEqual({
      content: 'The answer.',
      thinking: 'My reasoning',
    });
  });

  it('trims whitespace from thinking and content when block is complete', () => {
    const raw = '<think>  reasoning  </think>  answer  ';
    expect(parseThinkingLive(raw)).toEqual({
      content: 'answer',
      thinking: 'reasoning',
    });
  });

  it('returns no thinking property when complete think block is empty', () => {
    const raw = `<think></think>${THE_ANSWER}`;
    expect(parseThinkingLive(raw)).toEqual({ content: THE_ANSWER });
  });

  it('returns content: "" and thinking text when inside an open <think> block', () => {
    const raw = '<think>still thinking...';
    expect(parseThinkingLive(raw)).toEqual({
      content: '',
      thinking: 'still thinking...',
    });
  });

  it('preserves trailing whitespace in partial thinking text (live streaming)', () => {
    // parseThinkingLive does NOT trim the open block so the UI does not
    // jump as more tokens arrive mid-stream.
    const raw = '<think>reasoning so far ';
    expect(parseThinkingLive(raw)).toEqual({
      content: '',
      thinking: 'reasoning so far ',
    });
  });

  it('returns no thinking property for an open but empty think tag', () => {
    expect(parseThinkingLive('<think>')).toEqual({ content: '' });
  });

  it('handles multiline thinking during streaming', () => {
    const raw = '<think>line one\nline two\n';
    expect(parseThinkingLive(raw)).toEqual({
      content: '',
      thinking: 'line one\nline two\n',
    });
  });

  it('returns empty content when thinking block is complete but no following content yet', () => {
    const raw = '<think>reasoning</think>';
    expect(parseThinkingLive(raw)).toEqual({
      content: '',
      thinking: 'reasoning',
    });
  });
});

const createModelDetails = (
  inferenceParameters: Record<string, InferenceParameterDef>,
  parameters: Partial<InferenceModel['parameters']> = {}
): InferenceModel =>
  ({
    inference_parameters: inferenceParameters,
    parameters,
  }) as InferenceModel;

const createParameter = (
  overrides: Partial<InferenceParameterDef> = {}
): InferenceParameterDef => ({
  label: 'Parameter',
  type: 'number',
  ...overrides,
});

describe('getPlaygroundSettingsFromModelDetails', () => {
  it('returns the playground defaults when model details are unavailable', () => {
    expect(getPlaygroundSettingsFromModelDetails()).toEqual(
      INITIAL_PLAYGROUND_SETTINGS
    );
  });

  it('returns the playground defaults when parameter metadata is unavailable', () => {
    const details = {} as InferenceModel;

    expect(getPlaygroundSettingsFromModelDetails(details)).toEqual(
      INITIAL_PLAYGROUND_SETTINGS
    );
  });

  it('hydrates recognized settings from model defaults', () => {
    const details = createModelDetails({
      enable_thinking: createParameter({ default: false, type: 'boolean' }),
      max_tokens: createParameter({ default: 2048, type: 'integer' }),
      reasoning_effort: createParameter({
        default: 'minimal',
        enum: ['minimal', 'high'],
        type: 'string',
      }),
      stop: createParameter({ default: ['END'], type: 'array' }),
      stream: createParameter({ default: true, type: 'boolean' }),
      temperature: createParameter({ default: 0.25 }),
    });

    expect(getPlaygroundSettingsFromModelDetails(details)).toEqual({
      ...INITIAL_PLAYGROUND_SETTINGS,
      enableThinking: false,
      max_tokens: 2048,
      reasoning_effort: 'minimal',
      stop: ['END'],
      stream: true,
      temperature: 0.25,
    });
  });

  it.each([
    {
      parameters: { max_output_tokens: 1024 },
      parameterMaximum: 2048,
      value: 1024,
    },
    {
      parameters: {},
      parameterMaximum: 2048,
      value: 2048,
    },
    {
      parameters: {},
      parameterMaximum: undefined,
      value: 8192,
    },
  ])(
    'defaults max tokens to $value when the parameter default is absent',
    ({ parameters, parameterMaximum, value }) => {
      const details = createModelDetails(
        {
          max_tokens: createParameter({
            default: null,
            maximum: parameterMaximum,
            type: 'integer',
          }),
        },
        parameters
      );

      expect(getPlaygroundSettingsFromModelDetails(details).max_tokens).toBe(
        value
      );
    }
  );

  it('ignores invalid and unrecognized defaults', () => {
    const details = createModelDetails({
      max_tokens: createParameter({ default: 'invalid', type: 'integer' }),
      reasoning_effort: createParameter({
        default: 'extreme',
        type: 'string',
      }),
      unsupported: createParameter({ default: 10 }),
    });

    expect(getPlaygroundSettingsFromModelDetails(details)).toEqual(
      INITIAL_PLAYGROUND_SETTINGS
    );
  });

  it('ignores reasoning effort defaults with malformed enum metadata', () => {
    const details = createModelDetails({
      reasoning_effort: createParameter({
        default: 'high',
        enum: {} as string[],
        type: 'string',
      }),
    });

    expect(getPlaygroundSettingsFromModelDetails(details)).toEqual(
      INITIAL_PLAYGROUND_SETTINGS
    );
  });
});

describe('buildApiOptionsForModel', () => {
  it('only returns protocol options when model details are unavailable', () => {
    const options = buildApiOptionsForModel(INITIAL_PLAYGROUND_SETTINGS);

    expect(options).toEqual({
      stream: false,
      stream_options: null,
    });
  });

  it('only returns protocol options when parameter metadata is unavailable', () => {
    const options = buildApiOptionsForModel(
      INITIAL_PLAYGROUND_SETTINGS,
      {} as InferenceModel
    );

    expect(options).toEqual({
      stream: false,
      stream_options: null,
    });
  });

  it('omits options the selected model does not support', () => {
    const details = createModelDetails({
      max_tokens: createParameter({ type: 'integer' }),
      temperature: createParameter(),
    });

    const options = buildApiOptionsForModel(
      {
        ...INITIAL_PLAYGROUND_SETTINGS,
        max_tokens: 4096,
        temperature: 0.6,
      },
      details
    );

    expect(options.max_tokens).toBe(4096);
    expect(options.temperature).toBe(0.6);
    expect(options.chat_template_kwargs).toBeUndefined();
    expect(options.reasoning_effort).toBeUndefined();
    expect(options.stop).toBeUndefined();
    expect(options.top_k).toBeUndefined();
    expect(options.top_p).toBeUndefined();
    expect(JSON.stringify(options)).not.toContain('top_k');
  });

  it('clamps numeric options to inclusive and exclusive model bounds', () => {
    const details = createModelDetails({
      max_tokens: createParameter({ maximum: 2048, type: 'integer' }),
      temperature: createParameter({ minimum: 0.8 }),
      top_k: createParameter({ exclusiveMaximum: 40, type: 'integer' }),
      top_p: createParameter({ exclusiveMinimum: 1 }),
    });

    const options = buildApiOptionsForModel(
      {
        ...INITIAL_PLAYGROUND_SETTINGS,
        max_tokens: 4096,
        temperature: 0.6,
        top_k: 40,
        top_p: 1,
      },
      details
    );

    expect(options.max_tokens).toBe(2048);
    expect(options.temperature).toBe(0.8);
    expect(options.top_k).toBe(39);
    expect(options.top_p).toBeGreaterThan(1);
  });

  it('uses the model max output tokens before the parameter maximum', () => {
    const details = createModelDetails(
      {
        max_tokens: createParameter({ maximum: 2048, type: 'integer' }),
      },
      { max_output_tokens: 1024 }
    );

    const options = buildApiOptionsForModel(
      { ...INITIAL_PLAYGROUND_SETTINGS, max_tokens: 4096 },
      details
    );

    expect(options.max_tokens).toBe(1024);
  });

  it('keeps null values for supported settings the user cleared', () => {
    const details = createModelDetails({
      temperature: createParameter(),
    });

    const options = buildApiOptionsForModel(
      {
        ...INITIAL_PLAYGROUND_SETTINGS,
        temperature: undefined,
      },
      details
    );

    expect(options.temperature).toBeNull();
  });

  it('sends only enable_thinking for an on/off-only model', () => {
    const details = createModelDetails({
      enable_thinking: createParameter({ type: 'boolean' }),
    });

    const options = buildApiOptionsForModel(
      {
        ...INITIAL_PLAYGROUND_SETTINGS,
        enableThinking: true,
        reasoning_effort: 'high',
      },
      details
    );

    expect(options.chat_template_kwargs).toEqual({ enable_thinking: true });
    expect(options.reasoning_effort).toBeUndefined();
  });

  it('sends only reasoning_effort for an effort-only model', () => {
    const details = createModelDetails({
      reasoning_effort: createParameter({
        enum: ['minimal', 'high'],
        type: 'string',
      }),
    });

    const options = buildApiOptionsForModel(
      {
        ...INITIAL_PLAYGROUND_SETTINGS,
        enableThinking: false,
        reasoning_effort: 'minimal',
      },
      details
    );

    expect(options.chat_template_kwargs).toBeUndefined();
    expect(options.reasoning_effort).toBe('minimal');
  });

  it('rejects reasoning_effort outside an effort-only model enum', () => {
    const details = createModelDetails({
      reasoning_effort: createParameter({
        enum: ['minimal', 'high'],
        type: 'string',
      }),
    });

    const options = buildApiOptionsForModel(
      {
        ...INITIAL_PLAYGROUND_SETTINGS,
        reasoning_effort: 'medium',
      },
      details
    );

    expect(options.reasoning_effort).toBeNull();
  });

  it('ignores reasoning_effort when a model supports both and thinking is off', () => {
    const details = createModelDetails({
      enable_thinking: createParameter({ type: 'boolean' }),
      reasoning_effort: createParameter({
        enum: ['low', 'high'],
        type: 'string',
      }),
    });

    const disabledOptions = buildApiOptionsForModel(
      {
        ...INITIAL_PLAYGROUND_SETTINGS,
        enableThinking: false,
        reasoning_effort: 'high',
      },
      details
    );
    const enabledOptions = buildApiOptionsForModel(
      {
        ...INITIAL_PLAYGROUND_SETTINGS,
        enableThinking: true,
        reasoning_effort: 'high',
      },
      details
    );

    expect(disabledOptions.reasoning_effort).toBeNull();
    expect(enabledOptions.reasoning_effort).toBe('high');
  });

  it('rejects reasoning_effort outside a thinking model enum', () => {
    const details = createModelDetails({
      enable_thinking: createParameter({ type: 'boolean' }),
      reasoning_effort: createParameter({
        enum: ['low', 'high'],
        type: 'string',
      }),
    });

    const options = buildApiOptionsForModel(
      {
        ...INITIAL_PLAYGROUND_SETTINGS,
        enableThinking: true,
        reasoning_effort: 'medium',
      },
      details
    );

    expect(options.reasoning_effort).toBeNull();
  });
});
