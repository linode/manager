import { createChatCompletion } from 'src/mocks/presets/crud/handlers/inferencePlatform';

import type { MockPresetExtra } from 'src/mocks/types';

export const inferencePlatformPreset: MockPresetExtra = {
  desc: 'Mocks the inference platform chat completions endpoint.',
  group: {
    id: 'Inference Platform',
    type: 'checkbox',
  },
  handlers: [createChatCompletion],
  id: 'inferencePlatform:chat-completions',
  label: 'Chat Completions',
};
