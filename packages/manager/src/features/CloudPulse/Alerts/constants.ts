import type {
  AlertSeverityType,
  MetricAggregationType,
  MetricOperatorType,
} from '@linode/api-v4';

export interface Item<L extends string, T> {
  label: L;
  value: T;
}
export const alertSeverityOptions: Item<string, AlertSeverityType>[] = [
  { label: 'Info', value: 3 },
  { label: 'Low', value: 2 },
  { label: 'Medium', value: 1 },
  { label: 'Severe', value: 0 },
];

export const engineTypeOptions: Item<string, string>[] = [
  {
    label: 'MySQL',
    value: 'mysql',
  },
  {
    label: 'PostgreSQL',
    value: 'postgresql',
  },
];

export const MetricOperatorOptions: Item<string, MetricOperatorType>[] = [
  {
    label: '>',
    value: 'gt',
  },
  {
    label: '<',
    value: 'lt',
  },
  {
    label: '>=',
    value: 'gte',
  },
  {
    label: '<=',
    value: 'lte',
  },
  {
    label: '==',
    value: 'eq',
  },
];

export const MetricAggregationOptions: Item<string, MetricAggregationType>[] = [
  {
    label: 'Average',
    value: 'avg',
  },
  {
    label: 'Minimum',
    value: 'min',
  },
  {
    label: 'Maximum',
    value: 'max',
  },
  {
    label: 'Count',
    value: 'count',
  },
  {
    label: 'Sum',
    value: 'sum',
  },
];
