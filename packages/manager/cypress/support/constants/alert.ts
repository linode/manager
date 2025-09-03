import type {
  AlertSeverityType,
  AlertStatusType,
  DimensionFilterOperatorType,
  MetricAggregationType,
  MetricOperatorType,
} from '@linode/api-v4';

export const dimensionOperatorTypeMap: Record<
  DimensionFilterOperatorType,
  string
> = {
  endswith: 'ends with',
  eq: 'equals',
  neq: 'not equals',
  startswith: 'starts with',
  in: 'in',
};

export const metricOperatorTypeMap: Record<MetricOperatorType, string> = {
  eq: '=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
};
export const severityMap: Record<AlertSeverityType, string> = {
  0: 'Severe',
  1: 'Medium',
  2: 'Low',
  3: 'Info',
};

export const aggregationTypeMap: Record<MetricAggregationType, string> = {
  avg: 'Avg',
  count: 'Count',
  max: 'Max',
  min: 'Min',
  sum: 'Sum',
};

export const statusMap: Record<AlertStatusType, string> = {
  disabled: 'Disabled',
  enabled: 'Enabled',
  failed: 'Failed',
  'in progress': 'In Progress',
};
