import { useCallback, useRef } from 'react';
import { throttle } from 'throttle-debounce';

import { requestInferenceChatCompletion } from '../inferenceService';
import {
  DEFAULT_PLAYGROUND_SETTINGS,
  mapSettingsToApiOptions,
} from '../ModelPlayground/types';
import { parseThinking, parseThinkingLive } from '../ModelPlayground/utils';

import type { InferenceChatMessage } from '../inferenceService';
import type { PlaygroundSettings } from '../ModelPlayground/types';

// Flush streaming UI updates at a fixed cadence to reduce render pressure
// from very small, high-frequency token chunks.
const STREAM_FLUSH_INTERVAL_MS = 50;

export interface StreamCallbacks {
  onChunk: (id: string, parsed: { content: string; thinking?: string }) => void;
  onComplete: (
    id: string,
    final: { content: string; thinking?: string }
  ) => void;
  onError: (id: string) => void;
  onStart: (id: string) => void;
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
      { onChunk, onComplete, onError, onStart }: StreamCallbacks,
      settings: PlaygroundSettings = DEFAULT_PLAYGROUND_SETTINGS
    ) => {
      const assistantId = crypto.randomUUID();
      let rawContent = '';
      let rawReasoning = '';

      const flush = () => {
        onChunk(
          assistantId,
          rawReasoning
            ? { content: rawContent, thinking: rawReasoning }
            : parseThinkingLive(rawContent)
        );
      };

      // Coalesce rapid chunk arrivals to at most one update per 30ms window.
      const scheduleFlush = throttle(STREAM_FLUSH_INTERVAL_MS, false, flush);
      throttledFlushRef.current = scheduleFlush;

      // A fresh controller per call so cancelling one stream doesn't affect
      // a subsequent one started immediately after.
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      onStart(assistantId);

      const apiOptions = mapSettingsToApiOptions(settings);
      const allMessages: InferenceChatMessage[] = settings.systemPrompt
        ? [{ content: settings.systemPrompt, role: 'system' }, ...messages]
        : messages;

      try {
        const response = await requestInferenceChatCompletion(
          allMessages,
          model,
          apiOptions,
          abortController.signal
        );

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        // lineBuffer carries any partial line left over between read() calls.
        let lineBuffer = '';
        let done = false;

        while (!done) {
          const result = await reader.read();
          done = result.done;

          if (done) {
            break;
          }

          lineBuffer += decoder.decode(result.value, { stream: true });
          const lines = lineBuffer.split('\n');
          // The last element may be an incomplete line; hold it for the next chunk.
          lineBuffer = lines.pop() ?? '';
          let stop = false;

          for (const line of lines) {
            if (!line.startsWith('data: ')) {
              continue;
            }

            // Remove the "data: " prefix and trim whitespace to get the raw JSON string.
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              stop = true;
              break;
            }

            try {
              const chunk = JSON.parse(data);
              const delta = chunk.choices?.[0]?.delta?.content ?? '';
              const reasoning = chunk.choices?.[0]?.delta?.reasoning ?? '';

              if (!delta && !reasoning) {
                continue;
              }

              if (delta) rawContent += delta;
              if (reasoning) rawReasoning += reasoning;
              scheduleFlush();
            } catch {
              // ignore malformed SSE chunks
            }
          }

          if (stop) {
            break;
          }
        }

        onComplete(
          assistantId,
          rawReasoning
            ? { content: rawContent, thinking: rawReasoning }
            : parseThinking(rawContent)
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // User cancelled — treat it as a normal completion so partial content
          // is kept rather than discarded.
          onComplete(
            assistantId,
            rawReasoning
              ? { content: rawContent, thinking: rawReasoning }
              : parseThinking(rawContent)
          );
        } else {
          onError(assistantId);
        }
      } finally {
        scheduleFlush.cancel();
        throttledFlushRef.current = null;
      }
    },
    []
  );

  return { cancel, stream };
};
