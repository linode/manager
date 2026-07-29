import { http } from 'msw';

import {
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type {
  ApiKey,
  ApiKeyType,
  ChatResponseBody,
  InferenceModel,
  InferenceUsage,
  InferenceUsageTimeSeries,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';

// Mock API Keys data
// Note: The `key` field is always '[REDACTED]' after creation.
// The full key is only returned on POST (create) requests.
const mockApiKeys: ApiKey[] = [
  {
    id: 1,
    key: '[REDACTED]',
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
    key: '[REDACTED]',
    key_prefix: 'sk-aka-9pQ2rS',
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
    key: '[REDACTED]',
    key_prefix: 'sk-aka-3vWxYz',
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
    key: '[REDACTED]',
    key_prefix: 'sk-aka-5kLmNo',
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
    key: '[REDACTED]',
    key_prefix: 'sk-aka-8rTuVw',
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
  // Generate 150 additional keys for pagination testing
  ...Array.from({ length: 100 }, (_, i) => {
    const id = 6 + i;
    const statuses: Array<'active' | 'expired' | 'revoked'> = [
      'active',
      'active',
      'active',
      'expired',
      'revoked',
    ];
    const keyTypes: ApiKeyType[] = ['user', 'user', 'user', 'playground'];
    const models = [
      ['qwen3-8b'],
      ['qwen3-4b', 'qwen3-8b'],
      ['*'],
      ['gemma-4-26b-a4b-it'],
      ['qwen3-embedding-4b'],
    ];
    const descriptions = [
      'Auto-generated test key for pagination testing',
      'Development key for ML experiments',
      'Production workload key',
      'Staging environment key',
      'Testing and QA key',
    ];

    return {
      id,
      key: '[REDACTED]',
      key_prefix: `sk-aka-${String(id).padStart(4, '0')}`,
      key_type: keyTypes[i % keyTypes.length],
      label: `Test API Key ${id}`,
      allowed_models: models[i % models.length],
      status: statuses[i % statuses.length],
      created: new Date(
        Date.now() - (100 - i) * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated: new Date(
        Date.now() - (50 - (i % 50)) * 24 * 60 * 60 * 1000
      ).toISOString(),
      description: descriptions[i % descriptions.length],
      expiry: new Date(
        Date.now() + (i % 2 === 0 ? 90 : 180) * 24 * 60 * 60 * 1000
      ).toISOString(),
      last_used:
        i % 3 === 0
          ? null
          : new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      usage_24h: Array.from({ length: 12 }, () =>
        Math.floor(Math.random() * 10)
      ),
    } as ApiKey;
  }),
];

// Mock Models data
const mockModels: InferenceModel[] = [
  {
    capabilities: ['chat', 'completion'],
    description:
      'Qwen3 8B is a powerful language model with strong reasoning capabilities and multilingual support.',
    id: 'qwen3-8b',
    label: 'Qwen3 8B',
    lifecycle_status: 'active',
    modalities: {
      input: ['text'],
      output: ['text'],
    },
    parameters: {
      context_window: 32768,
      max_output_tokens: 8192,
      parameter_count_billions: 8,
    },
    playground_available: true,
    provider: {
      id: 'qwen',
      name: 'Qwen',
    },
    regions: ['us-ord', 'us-sea'],
    tags: ['instruction-tuned'],
    type: 'text-generation',
    use_cases: ['chatbots', 'content-generation'],
  },
  {
    capabilities: ['chat', 'completion'],
    description:
      'Qwen3 4B is a compact yet capable model optimized for efficient inference.',
    id: 'qwen3-4b',
    label: 'Qwen3 4B',
    lifecycle_status: 'active',
    modalities: {
      input: ['text'],
      output: ['text'],
    },
    parameters: {
      context_window: 32768,
      max_output_tokens: 8192,
      parameter_count_billions: 4,
    },
    playground_available: true,
    provider: {
      id: 'qwen',
      name: 'Qwen',
    },
    regions: ['us-ord', 'us-sea'],
    tags: ['instruction-tuned', 'efficient'],
    type: 'text-generation',
    use_cases: ['chatbots', 'content-generation'],
  },
  {
    capabilities: ['chat', 'completion'],
    description:
      "Google's Gemma 4 26B parameter instruction-tuned model with extended context window support up to 262K tokens.",
    id: 'gemma-4-26b-a4b-it',
    label: 'Gemma 4 26B A4B IT',
    lifecycle_status: 'active',
    modalities: {
      input: ['text'],
      output: ['text'],
    },
    parameters: {
      context_window: 262144,
      max_output_tokens: 8192,
      parameter_count_billions: 26,
    },
    playground_available: true,
    provider: {
      id: 'google',
      name: 'Google',
    },
    regions: ['us-ord', 'us-sea', 'eu-mil'],
    tags: ['instruction-tuned', 'long-context'],
    type: 'text-generation',
    use_cases: ['chatbots', 'content-generation', 'long-context'],
  },
  {
    capabilities: ['chat', 'completion'],
    description:
      'Meta Llama 3.3 70B Instruct is a large language model optimized for instruction following and complex reasoning.',
    id: 'llama-3.3-70b-instruct',
    label: 'Llama 3.3 70B Instruct',
    lifecycle_status: 'active',
    modalities: {
      input: ['text'],
      output: ['text'],
    },
    parameters: {
      context_window: 131072,
      max_output_tokens: 8192,
      parameter_count_billions: 70,
    },
    playground_available: true,
    provider: {
      id: 'meta',
      name: 'Meta',
    },
    regions: ['us-ord', 'us-sea'],
    tags: ['instruction-tuned', 'large'],
    type: 'text-generation',
    use_cases: ['chatbots', 'content-generation', 'reasoning'],
    price_input_per_million: 0.2,
    price_output_per_million: 0.5,
  },
  {
    capabilities: ['embedding'],
    description:
      'Qwen3 Embedding 4B is optimized for generating high-quality text embeddings.',
    id: 'qwen3-embedding-4b',
    label: 'Qwen3 Embedding 4B',
    lifecycle_status: 'active',
    modalities: {
      input: ['text'],
      output: ['embedding'],
    },
    parameters: {
      context_window: 8192,
      max_output_tokens: 0,
      parameter_count_billions: 4,
    },
    playground_available: false,
    provider: {
      id: 'qwen',
      name: 'Qwen',
    },
    regions: ['us-ord'],
    tags: ['embedding'],
    type: 'embedding',
    use_cases: ['semantic-search', 'rag'],
  },
  {
    capabilities: ['chat', 'completion'],
    description:
      'DeepSeek R1 is a reasoning-focused model with strong performance on complex tasks.',
    id: 'deepseek-r1-0528',
    label: 'DeepSeek R1',
    lifecycle_status: 'active',
    modalities: {
      input: ['text'],
      output: ['text'],
    },
    parameters: {
      context_window: 65536,
      max_output_tokens: 8192,
      parameter_count_billions: 67,
    },
    playground_available: true,
    provider: {
      id: 'deepseek',
      name: 'DeepSeek',
    },
    regions: ['us-ord', 'us-sea'],
    tags: ['reasoning'],
    type: 'text-generation',
    use_cases: ['reasoning', 'code-generation'],
    price_input_per_million: 0.2,
    price_output_per_million: 0.5,
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
 * GET /v4beta/inference/models
 * Returns list of available models
 */
export const getModels = (_mockState: MockState) => [
  http.get('*/v4beta/inference/models', async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return makeResponse({
      data: mockModels,
    });
  }),
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

    const keyType = (payload?.key_type as ApiKeyType) || 'user';

    // For playground keys, set a 15-minute expiry if not specified
    let expiry = (payload?.expiry as string) || null;
    if (keyType === 'playground' && !expiry) {
      const expiryDate = new Date(Date.now() + 15 * 60 * 1000);
      expiry = expiryDate.toISOString();
    }

    const newKey: ApiKey = {
      allowed_models: (payload?.allowed_models as string[]) || ['*'],
      created: now,
      description,
      expiry,
      id: Date.now(),
      key: '[REDACTED]', // Full key is only returned on creation response
      key_prefix: keyPrefix,
      key_type: keyType,
      label,
      last_used: null,
      status: 'active',
      updated: now,
      usage_24h: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    mockApiKeys.push(newKey);

    // Return the full key only on creation (subsequent requests return [REDACTED])
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
 * Updates an API key.
 * For playground keys: performs credential rotation with expiry reset.
 * For user keys: updates label/description/allowed_models.
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

    const existingKey = mockApiKeys[index];
    const payload = (await request.json()) as Record<string, unknown>;

    // For playground keys: rotation with new credentials and expiry reset
    if (existingKey.key_type === 'playground') {
      const now = new Date().toISOString();
      const newKeyPrefix = `sk-aka-${Math.random().toString(36).substring(2, 8)}`;
      const newFullKey = `${newKeyPrefix}${Math.random().toString(36).substring(2, 20)}${Math.random().toString(36).substring(2, 20)}`;
      const newExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const rotatedKey: ApiKey = {
        ...existingKey,
        expiry: newExpiry,
        key: '[REDACTED]', // Full key only returned in response
        key_prefix: newKeyPrefix,
        status: 'active', // Reactivate if expired
        updated: now,
      };

      mockApiKeys[index] = rotatedKey;

      // Return with full key (only on rotation response)
      return makeResponse({
        ...rotatedKey,
        key: newFullKey,
      });
    }

    // For user keys: normal update
    const updatedKey = {
      ...existingKey,
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
      updated: new Date().toISOString(),
    };

    mockApiKeys[index] = updatedKey;
    return makeResponse(updatedKey);
  }),
];

const generateMockUsage = (
  groupBy: 'api-key' | 'model' = 'model',
  apiKeyId?: number
): InferenceUsage => {
  // Usage scale mapping for API keys based on their characteristics
  const getApiKeyScale = (apiKey: ApiKey): number => {
    // Expired/revoked keys have no recent usage
    if (apiKey.status === 'expired' || apiKey.status === 'revoked') {
      return 0;
    }
    // Never-used keys should render as zero usage in UI details views.
    if (apiKey.last_used === null) {
      return 0;
    }
    // Scale based on key type and position (production keys have more usage)
    const scaleMap: Record<number, number> = {
      1: 800000, // Production Inference Key - highest usage
      2: 400000, // Dev Team Key - moderate usage
      4: 100000, // Staging Key - lower usage
    };
    return scaleMap[apiKey.id] || 50000; // Default scale for new keys
  };

  // Data sources based on groupBy
  // For API keys, use label as the id so it displays correctly in chart legends/filters
  // For models, derive usage scale from model parameters (larger models = more usage)
  const getModelScale = (model: InferenceModel): number => {
    const params = model.parameters.parameter_count_billions;
    // Scale usage based on model size: ~15k tokens per billion parameters
    // Embedding models get lower baseline usage
    const baseScale = model.type === 'embedding' ? 5000 : 15000;
    return params * baseScale;
  };

  let groups =
    groupBy === 'api-key'
      ? mockApiKeys.map((apiKey) => ({
          id: apiKey.label,
          label: apiKey.label,
          scale: getApiKeyScale(apiKey),
        }))
      : mockModels.map((model) => ({
          id: model.id,
          label: model.label,
          scale: getModelScale(model),
        }));

  // Filter by specific API key ID if provided (look up by numeric id, filter by label)
  if (apiKeyId !== undefined) {
    const apiKey = mockApiKeys.find((k) => k.id === apiKeyId);
    if (apiKey) {
      groups = groups.filter((g) => g.label === apiKey.label);
    } else {
      // If no match found, create a fallback entry
      groups = [
        {
          id: `API Key ${apiKeyId}`,
          label: `API Key ${apiKeyId}`,
          scale: 0,
        },
      ];
    }
  }

  // Note: The API returns ALL groups. Top N aggregation (e.g., "Top 5 + Other")
  // is handled by the UI/frontend, not by the API response.

  // Generate time series data (hourly for last 24 hours)
  const timeSeries: InferenceUsageTimeSeries[] = [];
  const now = new Date();
  // Start from 24 hours ago
  const startTime = new Date(now);
  startTime.setHours(startTime.getHours() - 23, 0, 0, 0);

  for (let hour = 0; hour < 24; hour++) {
    const bucket = new Date(startTime);
    bucket.setHours(startTime.getHours() + hour);

    for (const group of groups) {
      // Scale tokens based on group's usage pattern
      const inputTokens = Math.floor((Math.random() * 0.5 + 0.2) * group.scale);
      const outputTokens = Math.floor(
        (Math.random() * 1.5 + 0.5) * group.scale
      );
      // Request count scales with token usage - in similar magnitude to tokens
      const requestCount = Math.max(
        1,
        Math.floor((Math.random() * 0.3 + 0.1) * group.scale)
      );
      timeSeries.push({
        bucket: bucket.toISOString(),
        group_id: group.id,
        group_label: group.label,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        request_count: requestCount,
        total_tokens: inputTokens + outputTokens,
      });
    }
  }

  // Calculate totals from time series
  const totalInputTokens = timeSeries.reduce(
    (sum, t) => sum + t.input_tokens,
    0
  );
  const totalOutputTokens = timeSeries.reduce(
    (sum, t) => sum + t.output_tokens,
    0
  );
  const totalTokens = totalInputTokens + totalOutputTokens;
  const totalRequests = timeSeries.reduce((sum, t) => sum + t.request_count, 0);
  const failedRequests = Math.floor(totalRequests * 0.01);

  // Generate breakdown by group
  const breakdown = groups.map((group) => {
    const groupData = timeSeries.filter((t) => t.group_id === group.id);
    const inputTokens = groupData.reduce((sum, t) => sum + t.input_tokens, 0);
    const outputTokens = groupData.reduce((sum, t) => sum + t.output_tokens, 0);
    const groupTotalTokens = inputTokens + outputTokens;
    return {
      id: group.id,
      input_tokens: inputTokens,
      label: group.label,
      output_tokens: outputTokens,
      percentage: Math.round((groupTotalTokens / totalTokens) * 1000) / 10,
      request_count: groupData.reduce((sum, t) => sum + t.request_count, 0),
      total_tokens: groupTotalTokens,
    };
  });

  return {
    breakdown,
    summary: {
      avg_latency_ms: Math.round(Math.random() * 200 + 150),
      failed_requests: failedRequests,
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens,
      successful_requests: totalRequests - failedRequests,
      total_requests: totalRequests,
      total_tokens: totalTokens,
    },
    time_series: timeSeries,
  };
};

/**
 * POST /v4beta/inference/usage
 * Returns usage statistics
 *
 * Supported request parameters:
 * - group_by: 'model' | 'api_key' (defaults to 'model')
 * - api_key_id: number (optional, filters results to specific API key)
 * - model_id: string (optional, filters results to specific model)
 * - granularity: 'hourly' | 'daily' (defaults to 'hourly', for future use)
 * - start_date: string (ISO date, for future use)
 * - end_date: string (ISO date, for future use)
 * - include_breakdown: boolean (defaults to true)
 * - include_time_series: boolean (defaults to true)
 * - top_n: number (for future use, limits breakdown results)
 */
export const getUsage = (_mockState: MockState) => [
  http.post('*/v4beta/inference/usage', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      // The usage endpoint supports an empty POST body.
      // Default to an empty options object when no JSON body is provided.
      body = {};
    }

    // Extract and validate parameters with defaults
    const groupBy = (body?.group_by === 'api-key' ? 'api-key' : 'model') as
      | 'api-key'
      | 'model';
    const apiKeyId =
      typeof body?.api_key_id === 'number' ? body.api_key_id : undefined;
    const modelId =
      typeof body?.model_id === 'string' ? body.model_id : undefined;
    // Note: granularity, start_date, end_date, top_n parsed but not yet used
    const includeBreakdown = body?.include_breakdown !== false;
    const includeTimeSeries = body?.include_time_series !== false;

    let usage = generateMockUsage(groupBy, apiKeyId);

    // Apply optional model_id filter when grouping by model
    if (modelId && groupBy === 'model') {
      usage = {
        ...usage,
        breakdown: usage.breakdown.filter((item) => item.id === modelId),
        time_series: usage.time_series.filter(
          (entry) => entry.group_id === modelId
        ),
      };
    }

    // Conditionally include breakdown and time_series based on request params
    return makeResponse({
      breakdown: includeBreakdown ? usage.breakdown : [],
      summary: usage.summary,
      time_series: includeTimeSeries ? usage.time_series : [],
    });
  }),
];
