import { useCallback, useRef } from 'react';
import { throttle } from 'throttle-debounce';

import {
  classifyNetworkError,
  extractApiErrorMessage,
  parseErrorBody,
} from '../inferenceErrors';
import {
  INFERENCE_REQUEST_TIMEOUT_MS,
  requestInferenceChatCompletion,
} from '../inferenceService';
import {
  DEFAULT_PLAYGROUND_SETTINGS,
  mapSettingsToApiOptions,
} from '../ModelPlayground/types';
import { parseThinking, parseThinkingLive } from '../ModelPlayground/utils';

import type { InferenceChatMessage } from '../inferenceService';
import type { MessageMetadata } from '../ModelPlayground/ModelPlaygroundContext';
import type { PlaygroundSettings } from '../ModelPlayground/types';

// Flush streaming UI updates at a fixed cadence to reduce render pressure
// from very small, high-frequency token chunks.
const STREAM_FLUSH_INTERVAL_MS = 50;

export interface StreamCallbacks {
  onChunk: (
    id: string,
    parsed: { content: string; thinking?: string },
    timeToFirstTokenMs?: number
  ) => void;
  onComplete: (
    id: string,
    final: { content: string; thinking?: string },
    metadata?: MessageMetadata
  ) => void;
  onError: (id: string, error?: string) => void;
  onStart: (id: string, startedAt: number) => void;
}

/**
 * Manages a single streaming SSE request to the inference chat completion
 * endpoint. Calls `onStart` immediately with the generated message ID, fires
 * `onChunk` on throttled updates, and settles with either `onComplete`
 * or `onError`.
 */
export const useInferenceStream = () => {
  const throttledFlushRef = useRef<null | ReturnType<typeof throttle>>(null);
  // Held in a ref so `cancel` can abort any in-flight request without needing
  // to be recreated when the ref value changes.
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    throttledFlushRef.current?.cancel();
    abortControllerRef.current?.abort();
  }, []);

  const stream = useCallback(
    async (
      messages: InferenceChatMessage[],
      model: string,
      apiKey: string,
      { onChunk, onComplete, onError, onStart }: StreamCallbacks,
      settings: PlaygroundSettings = DEFAULT_PLAYGROUND_SETTINGS
    ) => {
      const assistantId = crypto.randomUUID();
      let rawContent = '';
      let rawReasoning = '';
      let completionTokens: number | undefined;
      let finishReason: string | undefined;
      let firstTokenTime: number | undefined;
      let promptTokens: number | undefined;
      let stopReason: string | undefined;

      const startTime = Date.now();

      const flush = () => {
        onChunk(
          assistantId,
          rawReasoning
            ? { content: rawContent, thinking: rawReasoning }
            : parseThinkingLive(rawContent),
          firstTokenTime !== undefined ? firstTokenTime - startTime : undefined
        );
      };

      // Coalesce rapid chunk arrivals to at most one update per 50ms window.
      const scheduleFlush = throttle(STREAM_FLUSH_INTERVAL_MS, false, flush);
      throttledFlushRef.current = scheduleFlush;

      // A fresh controller per call so cancelling one stream doesn't affect
      // a subsequent one started immediately after.
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const timeoutId = setTimeout(() => {
        abortController.abort('timeout');
      }, INFERENCE_REQUEST_TIMEOUT_MS);

      onStart(assistantId, startTime);

      const apiOptions = mapSettingsToApiOptions(settings);
      const allMessages: InferenceChatMessage[] = settings.systemPrompt
        ? [{ content: settings.systemPrompt, role: 'system' }, ...messages]
        : messages;

      // Shared completion path — used for both normal end and user cancellation.
      const completeStream = (cancelled = false) => {
        const durationMs = Date.now() - startTime;
        onComplete(
          assistantId,
          rawReasoning
            ? { content: rawContent, thinking: rawReasoning }
            : parseThinking(rawContent),
          {
            cancelled: cancelled || undefined,
            completionTokens,
            durationMs,
            finishReason,
            promptTokens,
            stopReason,
          }
        );
      };

      try {
        const response = await requestInferenceChatCompletion(
          allMessages,
          model,
          apiKey,
          apiOptions,
          abortController.signal
        );

        // A non-ok status or a 200 with a non-streaming content type both
        // indicate an error body (some gateways return 200 for validation
        // failures instead of 4xx).
        const contentType = response.headers.get('content-type') ?? '';
        if (!response.ok || !contentType.includes('text/event-stream')) {
          const msg = await extractApiErrorMessage(response);
          throw new Error(msg);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        // lineBuffer carries any partial line left over between read() calls.
        let lineBuffer = '';

        outer: while (true) {
          const result = await reader.read();

          if (result.done) {
            break;
          }

          lineBuffer += decoder.decode(result.value, { stream: true });
          const lines = lineBuffer.split('\n');
          // The last element may be an incomplete line; hold it for the next chunk.
          lineBuffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) {
              continue;
            }

            // Remove the "data: " prefix and trim whitespace to get the raw JSON string.
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              break outer;
            }

            try {
              const chunk = JSON.parse(data);

              // vLLM can emit an error event inline in the stream instead of
              // closing with a non-200 status. Surface it as a real error.
              if (chunk.error) {
                const msg =
                  parseErrorBody(chunk) ??
                  'The inference service returned an error.';
                throw new Error(msg);
              }

              const delta = chunk.choices?.[0]?.delta?.content ?? '';
              const reasoning = chunk.choices?.[0]?.delta?.reasoning ?? '';

              completionTokens =
                chunk.usage?.completion_tokens ?? completionTokens;
              finishReason = chunk.choices?.[0]?.finish_reason ?? finishReason;
              stopReason = chunk.choices?.[0]?.stop_reason ?? stopReason;
              promptTokens = chunk.usage?.prompt_tokens ?? promptTokens;

              if (!delta && !reasoning) {
                continue;
              }

              firstTokenTime ??= Date.now();
              if (delta) rawContent += delta;
              if (reasoning) rawReasoning += reasoning;
              scheduleFlush();
            } catch (e) {
              if (!(e instanceof SyntaxError)) {
                throw e;
              }
              // SyntaxError means JSON.parse failed on a malformed chunk — skip it.
            }
          }
        }

        if (!rawContent && !rawReasoning) {
          throw new Error('The inference service returned an empty response.');
        }

        completeStream();
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          if (abortController.signal.reason === 'timeout') {
            onError(assistantId, 'Request timed out. Please try again.');
          } else {
            // User cancelled — keep partial content but mark as cancelled.
            completeStream(true);
          }
        } else {
          onError(assistantId, classifyNetworkError(err));
        }
      } finally {
        clearTimeout(timeoutId);
        scheduleFlush.cancel();
        throttledFlushRef.current = null;
      }
    },
    []
  );

  return { cancel, stream };
};
