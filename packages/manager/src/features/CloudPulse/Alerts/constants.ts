import type { FieldPath } from 'react-hook-form';

import type { CreateAlertDefinitionForm } from './CreateAlert/types';
import type {
  AlertDefinitionGroup,
  AlertSeverityType,
  AlertStatusType,
  ChannelType,
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

export const metricOperatorOptions: Item<string, MetricOperatorType>[] = [
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
    label: '=',
    value: 'eq',
  },
];

export const metricAggregationOptions: Item<string, MetricAggregationType>[] = [
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

export const dimensionOperatorOptions: Item<
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

export const entityGroupingOptions: Item<string, AlertDefinitionGroup>[] = [
  { label: 'Account', value: 'per-account' },
  { label: 'Region', value: 'per-region' },
  { label: 'Entity', value: 'per-entity' },
];

export const entityGroupMap: Record<AlertDefinitionGroup, string> = {
  'per-account': 'Account',
  'per-region': 'Region',
  'per-entity': 'Entity',
};

export const textFieldOperators = ['endswith', 'startswith'];

export const evaluationPeriodOptions = {
  dbaas: [{ label: '5 min', value: 300 }],
  linode: [
    { label: '1 min', value: 60 },
    { label: '5 min', value: 300 },
    { label: '15 min', value: 900 },
    { label: '30 min', value: 1800 },
    { label: '1 hr', value: 3600 },
  ],
};

export const pollingIntervalOptions = {
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
  failed: 'error',
  'in progress': 'other',
};

export const channelTypeOptions: Item<string, ChannelType>[] = [
  {
    label: 'Email',
    value: 'email',
  },
];

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
export const alertStatuses: Record<AlertStatusType, string> = {
  disabled: 'Disabled',
  enabled: 'Enabled',
  failed: 'Failed',
  'in progress': 'In Progress',
};

export const alertStatusOptions: Item<string, AlertStatusType>[] =
  Object.entries(alertStatuses).map(([key, label]) => ({
    label,
    value: key as AlertStatusType,
  }));

export const engineTypeMap: Record<string, string> = {
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
};

export const CREATE_ALERT_ERROR_FIELD_MAP: Record<
  string,
  FieldPath<CreateAlertDefinitionForm>
> = {
  channel_ids: 'channel_ids',
  entity_ids: 'entity_ids',
  rule_criteria: 'rule_criteria.rules',
};

export const MULTILINE_ERROR_SEPARATOR = '|';
export const SINGLELINE_ERROR_SEPARATOR = '\t';

export const CREATE_ALERT_SUCCESS_MESSAGE =
  'Alert successfully created. It may take a few minutes for your changes to take effect.';

export const UPDATE_ALERT_SUCCESS_MESSAGE =
  'Alert successfully updated. It may take a few minutes for your changes to take effect.';

export const ACCOUNT_GROUP_WARNING_MESSAGE =
  'All entities associated with current account will be included in this alert definition. Any new entity created with this account will also be included.';

export type SelectDeselectAll = 'Deselect All' | 'Select All';
