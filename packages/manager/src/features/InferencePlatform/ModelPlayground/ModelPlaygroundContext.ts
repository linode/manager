import React from 'react';

export interface Message {
  content: string;
  id: string;
  role: 'assistant' | 'user';
  thinking?: string;
}

export interface ModelPlaygroundContextValue {
  inputValue: string;
  isLoading: boolean;
  messages: Message[];
  onInputChange: (value: string) => void;
  onModelChange: (model: string) => void;
  onSend: () => void;
  selectedModel: string;
}

export const ModelPlaygroundContext =
  React.createContext<ModelPlaygroundContextValue>({
    inputValue: '',
    isLoading: false,
    messages: [],
    onInputChange: () => undefined,
    onModelChange: () => undefined,
    onSend: () => undefined,
    selectedModel: 'qwen3-8b',
  });
