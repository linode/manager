import { createChatCompletion } from '@linode/api-v4';
import React, { useState } from 'react';

import { getExtraPresets, isMSWEnabled } from 'src/dev-tools/utils';

import { requestInferenceChatCompletion } from '../inferenceService';
import { type Message, ModelPlaygroundContext } from './ModelPlaygroundContext';

/** Splits a raw assistant response into the reasoning block and the visible content. */
const parseThinking = (raw: string): { content: string; thinking?: string } => {
  const match = raw.match(/<think>([\s\S]*?)<\/think>/);
  if (!match) return { content: raw };
  const thinking = match[1].trim() || undefined;
  const content = raw.replace(/<think>[\s\S]*?<\/think>/, '').trim();
  return { content, thinking };
};

// Placeholder model/provider until these are selectable from the Tuning sidebar.
const MOCK_MODEL = 'gemma-4-31b';
const MOCK_PROVIDER = 'google';

interface Props {
  children: React.ReactNode;
}

export const ModelPlaygroundProvider = ({ children }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');

  const onSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      content: trimmed,
      id: crypto.randomUUID(),
      role: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let raw = '';

      if (
        !isMSWEnabled ||
        !getExtraPresets().includes('inferencePlatform:chat-completions')
      ) {
        const response = await requestInferenceChatCompletion(
          [...messages, userMessage].map(({ content, role }) => ({
            content,
            role,
          })),
          selectedModel
        );
        const data = await response.json();
        raw = data.choices?.[0]?.message?.content ?? '';
      } else {
        const response = await createChatCompletion({
          messages: [...messages, userMessage].map(({ content, role }) => ({
            content,
            role,
          })),
          model: MOCK_MODEL,
          provider: MOCK_PROVIDER,
        });
        raw = response.choices[0]?.message.content ?? '';
      }

      const { content: assistantContent, thinking } = parseThinking(raw);
      setMessages((prev) => [
        ...prev,
        {
          content: assistantContent,
          id: crypto.randomUUID(),
          role: 'assistant',
          thinking,
        },
      ]);
    } catch {
      // No response if the endpoint is unreachable or the API is unavailable.
      // TODO: Error handling in future Jira case: HELIX-39
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModelPlaygroundContext.Provider
      value={{
        inputValue,
        isLoading,
        messages,
        onInputChange: setInputValue,
        onModelChange: setSelectedModel,
        onSend,
        selectedModel,
      }}
    >
      {children}
    </ModelPlaygroundContext.Provider>
  );
};
