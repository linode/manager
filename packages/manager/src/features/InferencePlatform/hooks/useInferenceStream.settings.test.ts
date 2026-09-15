import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import * as inferenceService from '../inferenceService';
import { INITIAL_PLAYGROUND_SETTINGS } from '../ModelPlayground/utils';
import { useInferenceStream } from './useInferenceStream';

import type { InferenceModel } from '@linode/api-v4';

const createModelDetails = (parameterNames: string[]): InferenceModel =>
  ({
    inference_parameters: Object.fromEntries(
      parameterNames.map((name) => [name, { label: name, type: 'number' }])
    ),
  }) as InferenceModel;

const makeStream = (lines: string[]): ReadableStream<Uint8Array> => {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < lines.length) {
        controller.enqueue(encoder.encode(lines[index]));
        index += 1;
      } else {
        controller.close();
      }
    },
  });
};

const sseLines = (deltas: string[]): string[] => [
  ...deltas.map(
    (d) => `data: ${JSON.stringify({ choices: [{ delta: { content: d } }] })}\n`
  ),
  'data: [DONE]\n',
];

const mockCallbacks = () => ({
  onChunk: vi.fn(),
  onComplete: vi.fn(),
  onError: vi.fn(),
  onStart: vi.fn(),
});

const MOCK_API_KEY = 'test-playground-api-key';

describe('useInferenceStream — settings forwarding', () => {
  beforeEach(() => {
    vi.spyOn(inferenceService, 'requestInferenceChatCompletion');
    vi.mocked(
      inferenceService.requestInferenceChatCompletion
    ).mockResolvedValue({
      body: makeStream(sseLines(['ok'])),
    } as unknown as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prepends systemPrompt as a system message when set', async () => {
    const { result } = renderHook(() => useInferenceStream());
    const userMessages = [{ content: 'Hello', role: 'user' as const }];

    await result.current.stream(
      userMessages,
      'model-a',
      MOCK_API_KEY,
      mockCallbacks(),
      {
        ...INITIAL_PLAYGROUND_SETTINGS,
        systemPrompt: 'You are a helpful assistant.',
      }
    );

    const calledWith = vi.mocked(
      inferenceService.requestInferenceChatCompletion
    ).mock.calls[0];
    expect(calledWith[0]).toEqual([
      { content: 'You are a helpful assistant.', role: 'system' },
      { content: 'Hello', role: 'user' },
    ]);
  });

  it('does not prepend a system message when systemPrompt is empty', async () => {
    const { result } = renderHook(() => useInferenceStream());
    const userMessages = [{ content: 'Hello', role: 'user' as const }];

    await result.current.stream(
      userMessages,
      'model-a',
      MOCK_API_KEY,
      mockCallbacks(),
      {
        ...INITIAL_PLAYGROUND_SETTINGS,
        systemPrompt: '',
      }
    );

    const calledWith = vi.mocked(
      inferenceService.requestInferenceChatCompletion
    ).mock.calls[0];
    expect(calledWith[0]).toEqual(userMessages);
  });

  it('forwards mapped api options as the third argument', async () => {
    const { result } = renderHook(() => useInferenceStream());

    await result.current.stream(
      [],
      'model-a',
      MOCK_API_KEY,
      mockCallbacks(),
      {
        ...INITIAL_PLAYGROUND_SETTINGS,
        max_tokens: 512,
        temperature: 0.9,
      },
      createModelDetails(['max_tokens', 'temperature'])
    );

    const apiOptions = vi.mocked(
      inferenceService.requestInferenceChatCompletion
    ).mock.calls[0][3];
    expect(apiOptions).toMatchObject({ max_tokens: 512, temperature: 0.9 });
  });

  it('uses neutral initial settings when no settings are provided', async () => {
    const { result } = renderHook(() => useInferenceStream());

    await result.current.stream([], 'model-a', MOCK_API_KEY, mockCallbacks());

    const apiOptions = vi.mocked(
      inferenceService.requestInferenceChatCompletion
    ).mock.calls[0][3];
    expect(apiOptions).toEqual({
      stream: false,
      stream_options: null,
    });
  });

  it('maps enableThinking to chat_template_kwargs.enable_thinking', async () => {
    const { result } = renderHook(() => useInferenceStream());

    await result.current.stream(
      [],
      'model-a',
      MOCK_API_KEY,
      mockCallbacks(),
      {
        ...INITIAL_PLAYGROUND_SETTINGS,
        enableThinking: false,
      },
      createModelDetails(['enable_thinking'])
    );

    const apiOptions = vi.mocked(
      inferenceService.requestInferenceChatCompletion
    ).mock.calls[0][3];
    expect(apiOptions).toMatchObject({
      chat_template_kwargs: { enable_thinking: false },
    });
  });

  it('omits unsupported reasoning_effort when enableThinking is false', async () => {
    const { result } = renderHook(() => useInferenceStream());

    await result.current.stream(
      [],
      'model-a',
      MOCK_API_KEY,
      mockCallbacks(),
      {
        ...INITIAL_PLAYGROUND_SETTINGS,
        enableThinking: false,
        reasoning_effort: 'high',
      },
      createModelDetails(['enable_thinking'])
    );

    const apiOptions = vi.mocked(
      inferenceService.requestInferenceChatCompletion
    ).mock.calls[0][3];
    expect(apiOptions?.reasoning_effort).toBeUndefined();
  });
});
