import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import * as inferenceService from '../inferenceService';
import { useInferenceStream } from './useInferenceStream';

const MOCK_API_KEY = 'test-api-key';

const mockCallbacks = () => ({
  onChunk: vi.fn(),
  onComplete: vi.fn(),
  onError: vi.fn(),
  onStart: vi.fn(),
});

const SSE_HEADERS = new Headers({ 'content-type': 'text/event-stream' });

describe('useInferenceStream — cancellation', () => {
  beforeEach(() => {
    vi.spyOn(inferenceService, 'requestInferenceChatCompletion');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls onComplete (not onError) with partial content when cancelled', async () => {
    vi.mocked(
      inferenceService.requestInferenceChatCompletion
    ).mockImplementation((_messages, _model, _apiKey, _options, signal) => {
      const encoder = new TextEncoder();
      let readCount = 0;
      const stream = new ReadableStream<Uint8Array>({
        pull(controller): Promise<void> | void {
          if (readCount > 0) {
            // Hang until the abort signal fires, then error the stream so
            // reader.read() rejects with an AbortError.
            return new Promise<void>(() => {
              signal?.addEventListener('abort', () => {
                controller.error(
                  new DOMException('The user aborted a request.', 'AbortError')
                );
              });
            });
          }
          readCount++;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ choices: [{ delta: { content: 'partial' } }] })}\n`
            )
          );
        },
      });
      return Promise.resolve({
        body: stream,
        headers: SSE_HEADERS,
        ok: true,
      } as unknown as Response);
    });

    const { result } = renderHook(() => useInferenceStream());
    const cbs = mockCallbacks();

    const streamPromise = result.current.stream(
      [],
      'model-a',
      MOCK_API_KEY,
      cbs
    );
    // Let the first chunk be read before cancelling.
    await new Promise((resolve) => setTimeout(resolve, 50));
    result.current.cancel();
    await streamPromise;

    expect(cbs.onComplete).toHaveBeenCalledOnce();
    expect(cbs.onComplete.mock.calls[0][2]).toMatchObject({ cancelled: true });
    expect(cbs.onError).not.toHaveBeenCalled();
  });

  it('a new stream() call after cancel() works correctly', async () => {
    const encoder = new TextEncoder();

    // First call: a hanging stream that responds to abort
    vi.mocked(
      inferenceService.requestInferenceChatCompletion
    ).mockImplementationOnce((_messages, _model, _apiKey, _options, signal) => {
      let readCount = 0;
      const stream = new ReadableStream<Uint8Array>({
        pull(controller): Promise<void> | void {
          if (readCount > 0) {
            return new Promise<void>(() => {
              signal?.addEventListener('abort', () => {
                controller.error(
                  new DOMException('The user aborted a request.', 'AbortError')
                );
              });
            });
          }
          readCount++;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ choices: [{ delta: { content: 'first' } }] })}\n`
            )
          );
        },
      });
      return Promise.resolve({
        body: stream,
        headers: SSE_HEADERS,
        ok: true,
      } as unknown as Response);
    });

    // Second call: a normal completing stream
    const sseLines = (deltas: string[]): string[] => [
      ...deltas.map(
        (d) =>
          `data: ${JSON.stringify({ choices: [{ delta: { content: d } }] })}\n`
      ),
      'data: [DONE]\n',
    ];
    const makeStream = (lines: string[]): ReadableStream<Uint8Array> => {
      const enc = new TextEncoder();
      let i = 0;
      return new ReadableStream({
        pull(controller) {
          if (i < lines.length) controller.enqueue(enc.encode(lines[i++]));
          else controller.close();
        },
      });
    };
    vi.mocked(
      inferenceService.requestInferenceChatCompletion
    ).mockResolvedValueOnce({
      body: makeStream(sseLines(['second'])),
      headers: SSE_HEADERS,
      ok: true,
    } as unknown as Response);

    const { result } = renderHook(() => useInferenceStream());
    const firstCbs = mockCallbacks();
    const secondCbs = mockCallbacks();

    // Start first stream, cancel it, then immediately start second
    const firstPromise = result.current.stream(
      [],
      'model-a',
      MOCK_API_KEY,
      firstCbs
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    result.current.cancel();
    await firstPromise;

    await result.current.stream([], 'model-a', MOCK_API_KEY, secondCbs);

    expect(secondCbs.onComplete.mock.calls[0][1]).toEqual({
      content: 'second',
    });
    expect(secondCbs.onError).not.toHaveBeenCalled();
  });
});
