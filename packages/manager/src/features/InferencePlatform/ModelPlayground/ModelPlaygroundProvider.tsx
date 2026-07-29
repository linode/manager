import { createChatCompletion } from '@linode/api-v4';
import { useProfile } from '@linode/queries';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getExtraPresets, isMSWEnabled } from 'src/dev-tools/utils';

import { useInferenceStream } from '../hooks/useInferenceStream';
import {
  classifyNetworkError,
  extractApiErrorMessage,
  parseErrorBody,
} from '../inferenceErrors';
import {
  INFERENCE_REQUEST_TIMEOUT_MS,
  requestInferenceChatCompletion,
} from '../inferenceService';
import { getOrCreatePlaygroundKey } from '../playgroundKeyService';
import {
  type Message,
  type MessageMetadata,
  ModelPlaygroundInputContext,
  ModelPlaygroundModelContext,
  ModelPlaygroundOptionsContext,
  ModelPlaygroundOutputContext,
} from './ModelPlaygroundContext';
import { mapSettingsToApiOptions } from './types';
import { parseThinking } from './utils';

const MOCK_PROVIDER = 'google';

interface Props {
  children: React.ReactNode;
}

export const ModelPlaygroundProvider = ({ children }: Props) => {
  const search = useSearch({ strict: false }) as { model?: string };
  const modelFromUrl = search.model;
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<null | string>(
    null
  );
  const [selectedModel, setSelectedModel] = useState(modelFromUrl ?? '');

  const { settings } = useContext(ModelPlaygroundOptionsContext);

  const onModelChange = useCallback(
    (model: string) => {
      setSelectedModel(model);
      navigate({
        search: (prev) => ({ ...prev, model: model || undefined }),
        to: '/inference-platform/model-playground',
      });
    },
    [navigate]
  );

  const { cancel, stream } = useInferenceStream();
  const nonStreamAbortRef = useRef<AbortController | null>(null);

  // Abort any in-flight request if the user navigates away from the playground.
  useEffect(() => {
    return () => {
      cancel();
      nonStreamAbortRef.current?.abort();
    };
  }, [cancel]);

  // Refs keep onSend stable to avoid consumer rerenders during streaming
  const inputValueRef = useRef(inputValue);
  const isLoadingRef = useRef(isLoading);
  const messagesRef = useRef(messages);
  const selectedModelRef = useRef(selectedModel);
  const settingsRef = useRef(settings);

  inputValueRef.current = inputValue;
  isLoadingRef.current = isLoading;
  messagesRef.current = messages;
  selectedModelRef.current = selectedModel;
  settingsRef.current = settings;

  const applyStreamStart = useCallback((id: string, startedAt: number) => {
    setMessages((prev) => [
      ...prev,
      { content: '', id, role: 'assistant', startedAt },
    ]);
    setStreamingMessageId(id);
  }, []);

  const applyStreamChunk = useCallback(
    (
      id: string,
      parsed: { content: string; thinking?: string },
      timeToFirstTokenMs?: number
    ) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                ...parsed,
                ...(timeToFirstTokenMs !== undefined && { timeToFirstTokenMs }),
              }
            : m
        )
      );
    },
    []
  );

  const applyStreamComplete = useCallback(
    (
      id: string,
      final: { content: string; thinking?: string },
      metadata?: MessageMetadata
    ) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, ...final, ...(metadata && { metadata }) } : m
        )
      );
      setStreamingMessageId(null);
      setIsLoading(false);
    },
    []
  );

  const applyStreamError = useCallback((id: string, errorMessage?: string) => {
    const error = errorMessage ?? 'There was an error generating a response.';
    const now = Date.now();
    setMessages((prev) =>
      prev.map((m) =>
        m.id !== id
          ? m
          : {
              ...m,
              error,
              ...(m.startedAt !== undefined && {
                metadata: { durationMs: now - m.startedAt },
              }),
            }
      )
    );
    setStreamingMessageId(null);
    setIsLoading(false);
  }, []);

  const onSend = useCallback(async () => {
    const trimmed = inputValueRef.current.trim();
    if (!trimmed || isLoadingRef.current || !selectedModelRef.current) return;

    const userMessage: Message = {
      content: trimmed,
      id: crypto.randomUUID(),
      role: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Include all user messages; exclude errored/empty assistant responses. thinking is dropped.
    const conversationMessages = [...messagesRef.current, userMessage]
      .filter((m) => m.role === 'user' || (Boolean(m.content) && !m.error))
      .map(({ content, role }) => ({ content, role }));

    if (
      !isMSWEnabled ||
      !getExtraPresets().includes('inferencePlatform:chat-completions')
    ) {
      // Get or create a playground API key for authentication
      let apiKey: string;
      try {
        if (!profile?.username) {
          // Cannot create playground key without a valid username
          setIsLoading(false);
          return;
        }
        apiKey = await getOrCreatePlaygroundKey(profile.username);
      } catch {
        // TODO: Handle API key creation failure
        setIsLoading(false);
        return;
      }

      // Streaming path
      if (settingsRef.current.stream) {
        await stream(
          conversationMessages,
          selectedModelRef.current,
          apiKey,
          {
            onChunk: applyStreamChunk,
            onComplete: applyStreamComplete,
            onError: applyStreamError,
            onStart: applyStreamStart,
          },
          settingsRef.current
        );
        return;
      }

      // Non-streaming path
      const assistantId = crypto.randomUUID();
      const startTime = Date.now();
      applyStreamStart(assistantId, startTime);
      const nonStreamAbort = new AbortController();
      nonStreamAbortRef.current = nonStreamAbort;

      const nonStreamTimeoutId = setTimeout(() => {
        nonStreamAbort.abort('timeout');
      }, INFERENCE_REQUEST_TIMEOUT_MS);

      try {
        const apiOptions = mapSettingsToApiOptions(settingsRef.current);
        const requestMessages = settingsRef.current.systemPrompt
          ? [
              {
                content: settingsRef.current.systemPrompt,
                role: 'system' as const,
              },
              ...conversationMessages,
            ]
          : conversationMessages;

        const response = await requestInferenceChatCompletion(
          requestMessages,
          selectedModelRef.current,
          apiKey,
          apiOptions,
          nonStreamAbort.signal
        );

        // A non-ok status or a 200 with a non-JSON content-type (e.g. a
        // gateway HTML error page) both indicate an error body.
        const contentType = response.headers.get('content-type') ?? '';
        if (!response.ok || !contentType.includes('application/json')) {
          const msg = await extractApiErrorMessage(response);
          throw new Error(msg);
        }

        const data = await response.json();
        const durationMs = Date.now() - startTime;

        // Some gateways return 200 with an error body instead of a 4xx status.
        const bodyError = parseErrorBody(data);
        if (bodyError) {
          throw new Error(bodyError);
        }

        const raw = data.choices?.[0]?.message?.content ?? '';
        const rawReasoning = data.choices?.[0]?.message?.reasoning ?? '';

        if (!raw && !rawReasoning) {
          throw new Error('The inference service returned an empty response.');
        }

        const completionTokens: number | undefined =
          data.usage?.completion_tokens ?? undefined;
        const finishReason: string | undefined =
          data.choices?.[0]?.finish_reason ?? undefined;
        const stopReason: string | undefined =
          data.choices?.[0]?.stop_reason ?? undefined;
        const promptTokens: number | undefined =
          data.usage?.prompt_tokens ?? undefined;
        const { content: assistantContent, thinking } = rawReasoning
          ? { content: raw, thinking: rawReasoning }
          : parseThinking(raw);

        applyStreamComplete(
          assistantId,
          { content: assistantContent, thinking },
          {
            completionTokens,
            durationMs,
            finishReason,
            promptTokens,
            stopReason,
          }
        );
      } catch (err) {
        if (nonStreamAbort.signal.aborted) {
          if (nonStreamAbort.signal.reason === 'timeout') {
            applyStreamError(
              assistantId,
              'Request timed out. Please try again.'
            );
          } else {
            applyStreamComplete(
              assistantId,
              { content: '' },
              {
                cancelled: true,
                durationMs: Date.now() - startTime,
              }
            );
          }
        } else {
          applyStreamError(assistantId, classifyNetworkError(err));
        }
      } finally {
        clearTimeout(nonStreamTimeoutId);
        nonStreamAbortRef.current = null;
      }
      return;
    }

    // MSW mock path
    const assistantId = crypto.randomUUID();
    const startTime = Date.now();
    applyStreamStart(assistantId, startTime);
    try {
      const response = await createChatCompletion({
        messages: conversationMessages,
        model: selectedModelRef.current,
        provider: MOCK_PROVIDER,
      });
      const raw = response.choices[0]?.message.content ?? '';
      const { content: assistantContent, thinking } = parseThinking(raw);
      applyStreamComplete(
        assistantId,
        { content: assistantContent, thinking },
        {
          durationMs: Date.now() - startTime,
        }
      );
    } catch {
      applyStreamError(assistantId);
    }
  }, [
    applyStreamChunk,
    applyStreamComplete,
    applyStreamError,
    applyStreamStart,
    profile?.username,
    stream,
  ]);

  const onClearMessages = useCallback(() => setMessages([]), []);

  const inputContextValue = useMemo(
    () => ({
      inputValue,
      isLoading,
      onCancel: () => {
        cancel();
        nonStreamAbortRef.current?.abort();
      },
      onClearMessages,
      onInputChange: setInputValue,
      onSend,
    }),
    [cancel, inputValue, isLoading, onClearMessages, onSend]
  );

  const modelContextValue = useMemo(
    () => ({
      onModelChange,
      selectedModel,
    }),
    [onModelChange, selectedModel]
  );

  const outputContextValue = useMemo(
    () => ({
      isLoading,
      messages,
      streamingMessageId,
    }),
    [isLoading, messages, streamingMessageId]
  );

  return (
    <ModelPlaygroundInputContext.Provider value={inputContextValue}>
      <ModelPlaygroundModelContext.Provider value={modelContextValue}>
        <ModelPlaygroundOutputContext.Provider value={outputContextValue}>
          {children}
        </ModelPlaygroundOutputContext.Provider>
      </ModelPlaygroundModelContext.Provider>
    </ModelPlaygroundInputContext.Provider>
  );
};
