import React from 'react';

import { DEFAULT_PLAYGROUND_SETTINGS } from './types';

import type { PlaygroundSettings } from './types';

export interface MessageMetadata {
  cancelled?: boolean;
  completionTokens?: number;
  durationMs: number;
  finishReason?: string;
  promptTokens?: number;
  stopReason?: string;
}

export interface Message {
  content: string;
  error?: string;
  id: string;
  metadata?: MessageMetadata;
  role: 'assistant' | 'user';
  startedAt?: number;
  thinking?: string;
  timeToFirstTokenMs?: number;
}

export interface ModelPlaygroundInputContextValue {
  inputValue: string;
  isLoading: boolean;
  onCancel: () => void;
  onClearMessages: () => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export interface ModelPlaygroundModelContextValue {
  onModelChange: (model: string) => void;
  selectedModel: string;
}

export interface ModelPlaygroundOutputContextValue {
  isLoading: boolean;
  messages: Message[];
  streamingMessageId: null | string;
}

// Split contexts keep unrelated updates from forcing all Model Playground
// consumers to rerender on each keystroke, model change, or stream update.
export const ModelPlaygroundInputContext =
  React.createContext<ModelPlaygroundInputContextValue>({
    inputValue: '',
    isLoading: false,
    onCancel: () => undefined,
    onClearMessages: () => undefined,
    onInputChange: () => undefined,
    onSend: () => undefined,
  });

export const ModelPlaygroundModelContext =
  React.createContext<ModelPlaygroundModelContextValue>({
    onModelChange: () => undefined,
    selectedModel: 'qwen3-8b',
  });

export const ModelPlaygroundOutputContext =
  React.createContext<ModelPlaygroundOutputContextValue>({
    isLoading: false,
    messages: [],
    streamingMessageId: null,
  });

export interface ModelPlaygroundOptionsContextValue {
  onSettingsChange: (patch: Partial<PlaygroundSettings>) => void;
  settings: PlaygroundSettings;
}

export const ModelPlaygroundOptionsContext =
  React.createContext<ModelPlaygroundOptionsContextValue>({
    onSettingsChange: () => undefined,
    settings: DEFAULT_PLAYGROUND_SETTINGS,
  });
