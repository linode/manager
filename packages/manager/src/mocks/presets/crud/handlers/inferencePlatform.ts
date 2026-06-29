import { http } from 'msw';

import {
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { ChatResponseBody } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';

// API Key types (local to mocks)
type ApiKeyStatus = 'active' | 'expired' | 'revoked';

type ApiKeyType = 'playground' | 'user';

interface ApiKey {
  allowed_models: string[];
  created: string;
  description: string;
  expiry: null | string;
  id: number;
  key: string;
  key_prefix: string;
  key_type: ApiKeyType;
  label: string;
  last_used: null | string;
  status: ApiKeyStatus;
  updated: string;
  usage_24h?: number[];
}

// Mock API Keys data
const mockApiKeys: ApiKey[] = [
  {
    id: 1,
    key: 'sk_aka_7x8K9mNpQr3sTuVw2xYz4aBcDeF5gHiJ6kLm',
    key_prefix: 'sk_aka_7x8K9mNp',
    key_type: 'user',
    label: 'Production Inference Key',
    allowed_models: ['qwen3-8b', 'qwen3-4b'],
    status: 'active',
    created: '2026-04-08T10:30:00Z',
    updated: '2026-04-10T10:30:00Z',
    description: 'API key for production inference workloads',
    expiry: '2026-07-07T10:30:00Z',
    last_used: '2026-05-14T10:30:00Z',
    usage_24h: [3, 5, 2, 6, 4, 7, 3, 5, 4, 6, 5, 4],
  },
  {
    id: 2,
    key_prefix: 'sk-aka-9pQ2rS',
    key: 'sk-aka-9pQ2rSQr3sTuVw2xYz4aBcDeF5gHiJ6kLm',
    key_type: 'user',
    label: 'Dev Team Key',
    allowed_models: ['qwen3-embedding-4b', 'gemma-4-26b-a4b-it', 'qwen3-8b'],
    status: 'active',
    created: '2026-02-15T10:30:00Z',
    updated: '2026-02-20T10:30:00Z',
    description: 'Development and testing key for the ML team',
    expiry: '2026-08-15T10:30:00Z',
    last_used: '2026-05-14T10:28:00Z',
    usage_24h: [2, 4, 3, 5, 6, 4, 5, 3, 4, 5, 6, 4],
  },
  {
    id: 3,
    key_prefix: 'sk-aka-3vWxYz',
    key: 'sk-aka-3vWxYzQr3sTuVw2xYz4aBcDeF5gHiJ6kLm',
    key_type: 'playground',
    allowed_models: ['gemma-4-26b-a4b-it'],
    status: 'expired',
    created: '2025-12-01T08:00:00Z',
    updated: '2026-12-20T10:30:00Z',
    description: 'Legacy key - migrated to new system',
    expiry: '2026-04-01T08:00:00Z',
    label: 'Legacy API Key',
    last_used: null,
    usage_24h: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 4,
    key_prefix: 'sk-aka-5kLmNo',
    key: 'sk-aka-5kLmNoQr3sTuVw2xYz4aBcDeF5gHiJ6kLm',
    key_type: 'user',
    allowed_models: ['*'],
    status: 'active',
    created: '2026-03-10T08:00:00Z',
    updated: '2026-04-20T10:30:00Z',
    description: 'Staging environment testing',
    expiry: '2026-09-10T08:00:00Z',
    label: 'Staging Key',
    last_used: '2026-05-13T15:45:00Z',
    usage_24h: [1, 2, 1, 3, 2, 1, 2, 1, 0, 0, 0, 0],
  },
  {
    id: 5,
    key_prefix: 'sk-aka-8rTuVw',
    key: 'sk-aka-8rTuVwQr3sTuVw2xYz4aBcDeF5gHiJ6kLm',
    key_type: 'user',
    allowed_models: ['qwen3-8b'],
    status: 'revoked',
    created: '2026-01-20T14:00:00Z',
    updated: '2026-04-20T10:30:00Z',
    description: 'Old testing key - access revoked',
    expiry: '2027-01-20T14:00:00Z',
    label: 'Revoked Test Key',
    last_used: '2026-03-15T09:20:00Z',
    usage_24h: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
];

// Canned markdown response returned by the mock inference endpoint.
const CANNED_RESPONSE_CONTENT = `Serverless inference is a great choice for **variable or bursty workloads**. Here's a quick breakdown:

### When it works well
- **Low to moderate traffic** — you only pay for what you use
- **Spiky usage patterns** — scales to zero between requests
- **Rapid prototyping** — no GPU cluster to provision or manage

### Example: calling a model endpoint

\`\`\`ts
const response = await fetch('https://api.inference.example.com/v1/chat', {
  method: 'POST',
  headers: { Authorization: \`Bearer \${API_KEY}\` },
  body: JSON.stringify({ model: 'gemma-4-31b', messages }),
});
\`\`\`

### Trade-offs to consider
| Factor | Serverless | Dedicated |
|---|---|---|
| Cold start | ~1–3s | None |
| Cost at scale | Higher | Lower |
| Ops overhead | None | High |`;

export const createChatCompletion = (_mockState: MockState) => [
  http.post(
    '*/v4beta/inference/chat/completions',
    async (): Promise<StrictResponse<ChatResponseBody>> => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const now = Math.floor(Date.now() / 1000);

      return makeResponse({
        choices: [
          {
            finish_reason: 'stop',
            index: 0,
            message: {
              content: CANNED_RESPONSE_CONTENT,
              role: 'assistant',
            },
          },
        ],
        created: now,
        id: `mock-${now}`,
        model: 'gemma-4-31b',
        object: 'chat.completion',
        provider: 'google',
      });
    }
  ),
];

/**
 * GET /v4beta/inference/api-keys
 * Returns paginated list of API keys
 */
export const getApiKeys = (_mockState: MockState) => [
  http.get('*/v4beta/inference/api-keys', async ({ request }) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return makePaginatedResponse({
      data: mockApiKeys,
      request,
    });
  }),
];

/**
 * GET /v4beta/inference/api-keys/:id
 * Returns a single API key
 */
export const getApiKey = (_mockState: MockState) => [
  http.get('*/v4beta/inference/api-keys/:id', async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const keyId = Number(params.id);
    const apiKey = mockApiKeys.find((k) => k.id === keyId);

    if (!apiKey) {
      return new Response(
        JSON.stringify({ errors: [{ reason: 'Not found' }] }),
        {
          status: 404,
        }
      );
    }

    return makeResponse(apiKey);
  }),
];

/**
 * POST /v4beta/inference/api-keys
 * Creates a new API key
 */
export const createApiKey = (_mockState: MockState) => [
  http.post('*/v4beta/inference/api-keys', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const payload = (await request.json()) as Record<string, unknown>;
    const label = (payload?.label as string) || 'New API Key';
    const description = (payload?.description as string) || '';

    // Check for duplicate label
    const existingKey = mockApiKeys.find((k) => k.label === label);
    if (existingKey) {
      return new Response(
        JSON.stringify({
          errors: [
            { field: 'label', reason: 'A key with this label already exists' },
          ],
        }),
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const keyPrefix = `sk-aka-${Math.random().toString(36).substring(2, 8)}`;
    const fullApiKey = `${keyPrefix}${Math.random().toString(36).substring(2, 20)}${Math.random().toString(36).substring(2, 20)}`;

    const newKey: ApiKey = {
      allowed_models: (payload?.allowed_models as string[]) || ['*'],
      created: now,
      description,
      expiry: (payload?.expiry as string) || null,
      id: Date.now(),
      key: keyPrefix, // Store only the prefix, full key is returned separately on creation
      key_prefix: keyPrefix,
      key_type: 'user',
      label,
      last_used: null,
      status: 'active',
      updated: now,
      usage_24h: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    mockApiKeys.push(newKey);

    // Return the full key only on creation (it won't be shown again)
    return makeResponse({
      ...newKey,
      key: fullApiKey,
    });
  }),
];

/**
 * DELETE /v4beta/inference/api-keys/:id
 * Permanently deletes an API key
 */
export const deleteApiKey = (_mockState: MockState) => [
  http.delete('*/v4beta/inference/api-keys/:id', async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const keyId = Number(params.id);
    const index = mockApiKeys.findIndex((k) => k.id === keyId);

    if (index === -1) {
      return new Response(
        JSON.stringify({ errors: [{ reason: 'Not found' }] }),
        { status: 404 }
      );
    }

    // Remove the key from the list
    mockApiKeys.splice(index, 1);
    return new Response(null, { status: 204 });
  }),
];

/**
 * POST /v4beta/inference/api-keys/:id/revoke
 * Revokes an API key (sets status to 'revoked')
 */
export const revokeApiKey = (_mockState: MockState) => [
  http.post('*/v4beta/inference/api-keys/:id/revoke', async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const keyId = Number(params.id);
    const index = mockApiKeys.findIndex((k) => k.id === keyId);

    if (index === -1) {
      return new Response(
        JSON.stringify({ errors: [{ reason: 'Not found' }] }),
        { status: 404 }
      );
    }

    // Update status to revoked
    mockApiKeys[index] = {
      ...mockApiKeys[index],
      status: 'revoked',
      updated: new Date().toISOString(),
    };

    return makeResponse(mockApiKeys[index]);
  }),
];

/**
 * PUT /v4beta/inference/api-keys/:id
 * Updates an API key
 */
export const updateApiKey = (_mockState: MockState) => [
  http.put('*/v4beta/inference/api-keys/:id', async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const keyId = Number(params.id);
    const index = mockApiKeys.findIndex((k) => k.id === keyId);

    if (index === -1) {
      return new Response(
        JSON.stringify({ errors: [{ reason: 'Not found' }] }),
        { status: 404 }
      );
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const updatedKey = {
      ...mockApiKeys[index],
      ...(payload.allowed_models !== undefined && {
        allowed_models: payload.allowed_models as string[],
      }),
      ...(payload.description !== undefined && {
        description: payload.description as string,
      }),
      ...(payload.expiry !== undefined && {
        expiry: payload.expiry as null | string,
      }),
      ...(payload.label !== undefined && { label: payload.label as string }),
    };

    mockApiKeys[index] = updatedKey;
    return makeResponse(updatedKey);
  }),
];
