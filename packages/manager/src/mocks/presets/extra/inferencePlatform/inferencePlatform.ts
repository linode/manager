import {
  createApiKey,
  createChatCompletion,
  deleteApiKey,
  getApiKey,
  getApiKeys,
  getModels,
  getUsage,
  revokeApiKey,
  updateApiKey,
} from 'src/mocks/presets/crud/handlers/inferencePlatform';

import type { MockPresetExtra } from 'src/mocks/types';

export const inferencePlatformChatPreset: MockPresetExtra = {
  desc: 'Mocks the inference platform chat completions endpoint.',
  group: {
    id: 'Inference Platform',
    type: 'checkbox',
  },
  handlers: [createChatCompletion],
  id: 'inferencePlatform:chat-completions',
  label: 'Chat Completions',
};

export const inferencePlatformApiKeysPreset: MockPresetExtra = {
  desc: 'Mocks the inference platform API keys endpoints.',
  group: {
    id: 'Inference Platform',
    type: 'checkbox',
  },
  handlers: [
    getApiKeys,
    getApiKey,
    createApiKey,
    updateApiKey,
    revokeApiKey,
    deleteApiKey,
  ],
  id: 'inferencePlatform:api-keys',
  label: 'API Keys',
};

export const inferencePlatformModelsPreset: MockPresetExtra = {
  desc: 'Mocks the inference platform models endpoint for the Model Library.',
  group: {
    id: 'Inference Platform',
    type: 'checkbox',
  },
  handlers: [getModels],
  id: 'inferencePlatform:models',
  label: 'Model Library',
};

export const inferencePlatformUsagePreset: MockPresetExtra = {
  desc: 'Mocks the inference platform usage endpoint.',
  group: {
    id: 'Inference Platform',
    type: 'checkbox',
  },
  handlers: [getUsage],
  id: 'inferencePlatform:usage',
  label: 'Usage',
};

// Keep the old export for backward compatibility
export const inferencePlatformPreset = inferencePlatformChatPreset;
