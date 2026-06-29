import React from 'react';

import { DEFAULT_PLAYGROUND_SETTINGS } from './types';

import type { PlaygroundSettings } from './types';

export interface Message {
  content: string;
  id: string;
  role: 'assistant' | 'user';
  thinking?: string;
}

export interface ModelPlaygroundInputContextValue {
  inputValue: string;
  isLoading: boolean;
  onCancel: () => void;
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
