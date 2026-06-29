import { Factory } from '@linode/utilities';

import type { ApiKey, Model } from '@linode/api-v4';

export const apiKeyFactory = Factory.Sync.makeFactory<ApiKey>({
  allowed_models: ['*'],
  created: '2024-01-01T00:00:00Z',
  description: Factory.each((i) => `Test API Key ${i} description`),
  expiry: null,
  id: Factory.each((i) => i + 1),
  key: Factory.each((i) => `linf_${i}...`),
  key_prefix: Factory.each((i) => `linf_${i}`),
  key_type: 'user',
  label: Factory.each((i) => `Test API Key ${i}`),
  last_used: null,
  status: 'active',
  updated: '2024-01-01T00:00:00Z',
  usage_24h: [10, 20, 30, 40, 50],
});

export const modelFactory = Factory.Sync.makeFactory<Model>({
  id: Factory.each((i) => `model-${i}`),
  label: Factory.each((i) => `Model ${i}`),
  provider: 'openai',
});
