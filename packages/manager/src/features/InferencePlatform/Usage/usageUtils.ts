import type { ChartPayload } from '../Dashboard/UsageSection/chartUtils';
import type { InferenceUsage } from '@linode/api-v4';

/**
 * The type of data to extract from usage time series entries.
 */
export type UsageDataType = 'input' | 'output' | 'request' | 'total';

/**
 * Result of transforming API data to all chart payloads in a single pass.
 */
export interface TransformedUsageData {
  /** All groups without aggregation - for dropdowns */
  allGroups: Array<{ id: string; label: string }>;
  input: ChartPayload;
  output: ChartPayload;
  request: ChartPayload;
  total: ChartPayload;
}

/** Number of top groups to show before aggregating the rest into "Other" */
const TOP_N = 5;

const noDataPayload = (): ChartPayload => ({
  series: [
    { id: 'no-data', label: 'No Data', values: [{ time: '00:00', value: 1 }] },
  ],
});

/**
 * All metrics for a single time-series bucket with locale-formatted
 * date and time strings.
 */
type GroupValue = {
  bucket: string;
  date: string;
  input: number;
  output: number;
  request: number;
  time: string;
  total: number;
  xAxisDate?: string;
};

/** A single group (model or API key) with its time-series bucket values. */
type GroupEntry = {
  id: string;
  label: string;
  /** Sorted chronologically by buildGroupMap. */
  values: GroupValue[];
};

/**
 * Parses raw time_series entries into per-group buckets and sorts
 * each group chronologically.
 */
const buildGroupMap = (
  timeSeries: InferenceUsage['time_series']
): GroupEntry[] => {
  const map = new Map<string, GroupEntry>();

  // The chart uses the "time" label ("HH:MM") as the X-axis category key.
  // When the data spans more than one calendar day, that label is no longer
  // unique per bucket (e.g. daily buckets all render as "00:00"), which causes
  // every bar to collapse onto a single X-axis position. Detect a multi-day
  // range up front so we can prefix the label with a compact date and keep
  // each bucket distinct.
  const distinctDays = new Set(
    timeSeries.map((entry) =>
      new Date(entry.bucket).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    )
  );
  const spansMultipleDays = distinctDays.size > 1;

  for (const entry of timeSeries) {
    let group = map.get(entry.group_id);
    if (!group) {
      group = { id: entry.group_id, label: entry.group_label, values: [] };
      map.set(entry.group_id, group);
    }

    const date = new Date(entry.bucket);
    const fullDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const clockTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
    });
    const compactDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
    });

    group.values.push({
      bucket: entry.bucket,
      // For multi-day ranges the compact date is shown as a sub-label below
      // the clock time on the X-axis tick; it is also included in the tooltip
      // label via the date field.
      date: spansMultipleDays ? compactDate : fullDate,
      input: entry.input_tokens,
      output: entry.output_tokens,
      request: entry.request_count,
      // time is used as the X-axis dataKey for bucketing - must be unique per bucket
      time: spansMultipleDays ? `${compactDate}\n${clockTime}` : clockTime,
      total: entry.total_tokens,
      xAxisDate: spansMultipleDays ? compactDate : undefined,
    });
  }

  const groups = Array.from(map.values());
  for (const group of groups) {
    group.values.sort((a, b) =>
      a.bucket < b.bucket ? -1 : a.bucket > b.bucket ? 1 : 0
    );
  }

  return groups;
};

/**
 * Aggregates groups into Top N + "Other" category.
 * Groups are ranked by total usage (sum of all total values).
 * If there are TOP_N or fewer groups, returns them as-is.
 */
const aggregateTopNWithOther = (
  groups: GroupEntry[],
  groupType: 'api-key' | 'model' = 'model'
): GroupEntry[] => {
  if (groups.length <= TOP_N) {
    return groups;
  }

  // Calculate total usage for each group to determine ranking
  const groupsWithTotals = groups.map((group) => ({
    group,
    total: group.values.reduce((sum, v) => sum + v.total, 0),
  }));

  // Sort by total usage descending
  groupsWithTotals.sort((a, b) => b.total - a.total);

  // Take top N groups
  const topGroups = groupsWithTotals.slice(0, TOP_N).map((g) => g.group);
  const remainingGroups = groupsWithTotals.slice(TOP_N).map((g) => g.group);

  // Create "Other" group by aggregating remaining groups
  const otherCount = remainingGroups.length;
  const otherLabel =
    groupType === 'api-key'
      ? `Other (${otherCount} keys)`
      : `Other (${otherCount} models)`;

  // Build a map of bucket -> aggregated values for "Other"
  const otherBucketMap = new Map<string, GroupValue>();

  for (const group of remainingGroups) {
    for (const value of group.values) {
      const existing = otherBucketMap.get(value.bucket);
      if (existing) {
        existing.input += value.input;
        existing.output += value.output;
        existing.request += value.request;
        existing.total += value.total;
      } else {
        otherBucketMap.set(value.bucket, { ...value });
      }
    }
  }

  const otherValues = Array.from(otherBucketMap.values()).sort((a, b) =>
    a.bucket < b.bucket ? -1 : a.bucket > b.bucket ? 1 : 0
  );

  const otherGroup: GroupEntry = {
    id: 'other',
    label: otherLabel,
    values: otherValues,
  };

  return [...topGroups, otherGroup];
};

/** Extracts a single metric from pre-built groups into a ChartPayload. */
const toChartPayload = (
  groups: GroupEntry[],
  metric: UsageDataType
): ChartPayload => ({
  series: groups.map((g) => ({
    id: g.id,
    label: g.label,
    values: g.values.map((v) => ({
      date: v.date,
      time: v.time,
      value: v[metric],
      ...(v.xAxisDate !== undefined && { xAxisDate: v.xAxisDate }),
    })),
  })),
});

/**
 * Transform API usage data to all chart formats.
 * - When selectedId is 'all': applies Top N + "Other" aggregation
 * - When selectedId is a specific ID: returns only that group's data (no aggregation)
 *
 * @param apiData - The usage data from the API
 * @param groupType - The type of grouping ('model' or 'api-key') for "Other" label
 * @param selectedId - The selected group ID ('all' for aggregated view, or a specific ID)
 * @returns All four ChartPayloads (input, output, request, total) plus allGroups for dropdown
 */
export const transformAllUsageData = (
  apiData: InferenceUsage | undefined,
  groupType: 'api-key' | 'model' = 'model',
  selectedId: string = 'all'
): TransformedUsageData => {
  if (!apiData || !apiData.time_series || apiData.time_series.length === 0) {
    return {
      allGroups: [],
      input: noDataPayload(),
      output: noDataPayload(),
      request: noDataPayload(),
      total: noDataPayload(),
    };
  }

  const rawGroups = buildGroupMap(apiData.time_series);

  // Determine which groups to use for charts
  let chartGroups: GroupEntry[];
  if (selectedId === 'all') {
    // Apply Top N + Other aggregation for "All" view
    chartGroups = aggregateTopNWithOther(rawGroups, groupType);
  } else {
    // Filter to just the selected group
    const selectedGroup = rawGroups.find((g) => g.id === selectedId);
    chartGroups = selectedGroup ? [selectedGroup] : [];
  }

  return {
    // All groups without aggregation - for dropdowns (sorted alphabetically)
    allGroups: rawGroups
      .map((g) => ({ id: g.id, label: g.label }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    input: toChartPayload(chartGroups, 'input'),
    output: toChartPayload(chartGroups, 'output'),
    request: toChartPayload(chartGroups, 'request'),
    total: toChartPayload(chartGroups, 'total'),
  };
};

/**
 * Transform API usage data to chart format for a single metric.
 * Applies Top N + "Other" aggregation when there are more than 5 groups.
 *
 * @param apiData - The usage data from the API
 * @param dataType - Which metric to extract (defaults to 'total')
 * @param groupType - The type of grouping ('model' or 'api-key') for "Other" label
 * @returns ChartPayload with series data, or a "no-data" placeholder if empty
 */
export const transformApiDataToChartPayload = (
  apiData: InferenceUsage | undefined,
  dataType: UsageDataType = 'total',
  groupType: 'api-key' | 'model' = 'model'
): ChartPayload => {
  if (!apiData || !apiData.time_series || apiData.time_series.length === 0) {
    return noDataPayload();
  }

  const rawGroups = buildGroupMap(apiData.time_series);
  const groups = aggregateTopNWithOther(rawGroups, groupType);

  return toChartPayload(groups, dataType);
};
