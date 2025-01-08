import type {
  AlertSeverityType,
  DimensionFilterOperatorType,
  AlertStatusType,
  DimensionFilterOperatorType,
  MetricAggregationType,
  MetricOperatorType,
} from '@linode/api-v4';
import type { Status } from 'src/components/StatusIcon/StatusIcon';

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

export const DimensionOperatorOptions: Item<
  string,
  DimensionFilterOperatorType
>[] = [
  {
    label: 'Equal',
    value: 'eq',
  },
  {
    label: 'Ends with',
    value: 'endswith',
  },
  {
    label: 'Not Equal',
    value: 'neq',
  },
  {
    label: 'Starts with',
    value: 'startswith',
  },
];

export const EvaluationPeriodOptions = {
  dbaas: [{ label: '5 min', value: 300 }],
  linode: [
    { label: '1 min', value: 60 },
    { label: '5 min', value: 300 },
    { label: '15 min', value: 900 },
    { label: '30 min', value: 1800 },
    { label: '1 hr', value: 3600 },
  ],
};

export const PollingIntervalOptions = {
  dbaas: [{ label: '5 min', value: 300 }],
  linode: [
    { label: '1 min', value: 60 },
    { label: '5 min', value: 300 },
    { label: '10 min', value: 600 },
  ],
};
 
export const severityMap: Record<AlertSeverityType, string> = {
  0: 'Severe',
  1: 'Medium',
  2: 'Low',
  3: 'Info',
};

export const alertStatusToIconStatusMap: Record<AlertStatusType, Status> = {
  disabled: 'inactive',
  enabled: 'active',
};
export const metricOperatorTypeMap: Record<MetricOperatorType, string> = {
  eq: '=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
};
export const aggregationTypeMap: Record<MetricAggregationType, string> = {
  avg: 'Average',
  count: 'Count',
  max: 'Maximum',
  min: 'Minimum',
  sum: 'Sum',
};
export const dimensionOperatorTypeMap: Record<
  DimensionFilterOperatorType,
  string
> = {
  endswith: 'ends with',
  eq: 'equals',
  neq: 'not equals',
  startswith: 'starts with',
};
