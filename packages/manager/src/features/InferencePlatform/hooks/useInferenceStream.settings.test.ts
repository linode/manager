import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import * as inferenceService from '../inferenceService';
import { DEFAULT_PLAYGROUND_SETTINGS } from '../ModelPlayground/types';
import { useInferenceStream } from './useInferenceStream';

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

    await result.current.stream(userMessages, 'model-a', mockCallbacks(), {
      ...DEFAULT_PLAYGROUND_SETTINGS,
      systemPrompt: 'You are a helpful assistant.',
    });

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

    await result.current.stream(userMessages, 'model-a', mockCallbacks(), {
      ...DEFAULT_PLAYGROUND_SETTINGS,
      systemPrompt: '',
    });

    const calledWith = vi.mocked(
      inferenceService.requestInferenceChatCompletion
    ).mock.calls[0];
    expect(calledWith[0]).toEqual(userMessages);
  });

  it('forwards mapped api options as the third argument', async () => {
    const { result } = renderHook(() => useInferenceStream());

    await result.current.stream([], 'model-a', mockCallbacks(), {
      ...DEFAULT_PLAYGROUND_SETTINGS,
      max_tokens: 512,
      temperature: 0.9,
    });

    const apiOptions = vi.mocked(
      inferenceService.requestInferenceChatCompletion
    ).mock.calls[0][2];
    expect(apiOptions).toMatchObject({ max_tokens: 512, temperature: 0.9 });
  });

  it('uses DEFAULT_PLAYGROUND_SETTINGS when no settings are provided', async () => {
    const { result } = renderHook(() => useInferenceStream());

    await result.current.stream([], 'model-a', mockCallbacks());

    const apiOptions = vi.mocked(
      inferenceService.requestInferenceChatCompletion
    ).mock.calls[0][2];
    expect(apiOptions).toMatchObject({
      chat_template_kwargs: { enable_thinking: true },
      max_tokens: 4096,
      reasoning_effort: 'medium',
      stream: true,
      temperature: 0.6,
    });
  });

  it('maps enableThinking to chat_template_kwargs.enable_thinking', async () => {
    const { result } = renderHook(() => useInferenceStream());

    await result.current.stream([], 'model-a', mockCallbacks(), {
      ...DEFAULT_PLAYGROUND_SETTINGS,
      enableThinking: false,
    });

    const apiOptions = vi.mocked(
      inferenceService.requestInferenceChatCompletion
    ).mock.calls[0][2];
    expect(apiOptions).toMatchObject({
      chat_template_kwargs: { enable_thinking: false },
    });
  });
});
