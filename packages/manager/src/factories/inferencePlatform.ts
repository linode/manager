import { Factory } from '@linode/utilities';

import type {
  ApiKey,
  InferenceUsage,
  InferenceUsageBreakdown,
  InferenceUsageSummary,
  InferenceUsageTimeSeries,
} from '@linode/api-v4';

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

// Default time buckets for usage data
const DEFAULT_BUCKET_1 = '2026-06-21T15:00:00Z';
const DEFAULT_BUCKET_2 = '2026-06-21T16:00:00Z';
const DEFAULT_BUCKETS = [DEFAULT_BUCKET_1, DEFAULT_BUCKET_2];

export const inferenceUsageSummaryFactory =
  Factory.Sync.makeFactory<InferenceUsageSummary>({
    avg_latency_ms: 200,
    failed_requests: 100,
    input_tokens: 1000000,
    output_tokens: 2000000,
    successful_requests: 9900,
    total_requests: 10000,
    total_tokens: 3000000,
  });

export const inferenceUsageBreakdownFactory =
  Factory.Sync.makeFactory<InferenceUsageBreakdown>({
    id: Factory.each((i) => `model-${i}`),
    input_tokens: 500000,
    label: Factory.each((i) => `Model ${i}`),
    output_tokens: 1000000,
    percentage: 50,
    request_count: 5000,
    total_tokens: 1500000,
  });

export const inferenceUsageTimeSeriesFactory =
  Factory.Sync.makeFactory<InferenceUsageTimeSeries>({
    bucket: DEFAULT_BUCKET_1,
    group_id: 'model-1',
    group_label: 'Model 1',
    input_tokens: 50000,
    output_tokens: 100000,
    request_count: 500,
    total_tokens: 150000,
  });

export const inferenceUsageFactory = Factory.Sync.makeFactory<InferenceUsage>({
  breakdown: [],
  summary: inferenceUsageSummaryFactory.build(),
  time_series: [],
});

/**
 * Helper to create usage data with multiple groups and time buckets.
 *
 * @param groups - Array of { id, label, scale } objects. Scale controls token volume.
 * @param buckets - Array of ISO timestamp strings for time buckets.
 * @returns InferenceUsage with breakdown and time_series populated.
 */
export const createUsageData = (
  groups: Array<{ id: string; label: string; scale: number }>,
  buckets: string[] = DEFAULT_BUCKETS
): InferenceUsage => {
  const timeSeries: InferenceUsageTimeSeries[] = [];
  const breakdownMap = new Map<
    string,
    {
      id: string;
      input_tokens: number;
      label: string;
      output_tokens: number;
      request_count: number;
      total_tokens: number;
    }
  >();

  // Initialize breakdown entries
  for (const group of groups) {
    breakdownMap.set(group.id, {
      id: group.id,
      input_tokens: 0,
      label: group.label,
      output_tokens: 0,
      request_count: 0,
      total_tokens: 0,
    });
  }

  // Generate time series and accumulate breakdown totals
  for (const bucket of buckets) {
    for (const group of groups) {
      const inputTokens = Math.floor(group.scale * 0.4);
      const outputTokens = Math.floor(group.scale * 0.6);
      const totalTokens = inputTokens + outputTokens;
      const requestCount = Math.floor(group.scale * 0.001);

      timeSeries.push({
        bucket,
        group_id: group.id,
        group_label: group.label,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        request_count: requestCount,
        total_tokens: totalTokens,
      });

      const entry = breakdownMap.get(group.id)!;
      entry.input_tokens += inputTokens;
      entry.output_tokens += outputTokens;
      entry.total_tokens += totalTokens;
      entry.request_count += requestCount;
    }
  }

  // Calculate totals and percentages for breakdown
  const totalAllTokens = Array.from(breakdownMap.values()).reduce(
    (sum, e) => sum + e.total_tokens,
    0
  );

  const breakdown: InferenceUsageBreakdown[] = Array.from(
    breakdownMap.values()
  ).map((entry) => ({
    ...entry,
    percentage:
      totalAllTokens > 0
        ? Math.round((entry.total_tokens / totalAllTokens) * 1000) / 10
        : 0,
  }));

  const totalInput = breakdown.reduce((sum, e) => sum + e.input_tokens, 0);
  const totalOutput = breakdown.reduce((sum, e) => sum + e.output_tokens, 0);
  const totalRequests = breakdown.reduce((sum, e) => sum + e.request_count, 0);

  return {
    breakdown,
    summary: {
      avg_latency_ms: 200,
      failed_requests: Math.floor(totalRequests * 0.01),
      input_tokens: totalInput,
      output_tokens: totalOutput,
      successful_requests: totalRequests - Math.floor(totalRequests * 0.01),
      total_requests: totalRequests,
      total_tokens: totalAllTokens,
    },
    time_series: timeSeries,
  };
};

/**
 * Creates usage data with Top N groups plus an "Other" aggregation.
 *
 * @param topGroups - Array of top N groups to include individually.
 * @param otherCount - Number of groups aggregated into "Other".
 * @param otherScale - Combined scale for the "Other" category.
 * @param groupType - 'model' or 'api-key' for the label format.
 * @param buckets - Array of ISO timestamp strings for time buckets.
 * @returns InferenceUsage with "Other" aggregation.
 */
export const createUsageDataWithOther = (
  topGroups: Array<{ id: string; label: string; scale: number }>,
  otherCount: number,
  otherScale: number,
  groupType: 'api-key' | 'model' = 'model',
  buckets: string[] = DEFAULT_BUCKETS
): InferenceUsage => {
  const otherLabel =
    groupType === 'api-key'
      ? `Other (${otherCount} keys)`
      : `Other (${otherCount} models)`;

  const allGroups = [
    ...topGroups,
    { id: 'other', label: otherLabel, scale: otherScale },
  ];

  return createUsageData(allGroups, buckets);
};
