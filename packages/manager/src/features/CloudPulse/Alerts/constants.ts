import type { FieldPath } from 'react-hook-form';

import { PORTS_HELPER_TEXT } from '../Utils/constants';

import type { CreateAlertDefinitionForm } from './CreateAlert/types';
import type {
  AlertDefinitionScope,
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
    label: 'Avg',
    value: 'avg',
  },
  {
    label: 'Min',
    value: 'min',
  },
  {
    label: 'Max',
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
    label: 'Not Equal',
    value: 'neq',
  },
  {
    label: 'Starts with',
    value: 'startswith',
  },
  {
    label: 'Ends with',
    value: 'endswith',
  },
  {
    label: 'In',
    value: 'in',
  },
];

export const textFieldOperators = ['endswith', 'startswith'];

export const entityGroupingOptions: Item<string, AlertDefinitionScope>[] = [
  { label: 'Account', value: 'account' },
  { label: 'Region', value: 'region' },
  { label: 'Entity', value: 'entity' },
];

export const entityGroupMap: Record<AlertDefinitionScope, string> = {
  account: 'Account',
  region: 'Region',
  entity: 'Entity',
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
  provisioning: 'other',
  disabling: 'other',
  enabling: 'other',
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
  avg: 'Avg',
  count: 'Count',
  max: 'Max',
  min: 'Min',
  sum: 'Sum',
};
export const dimensionOperatorTypeMap: Record<
  DimensionFilterOperatorType,
  string
> = {
  endswith: 'ends with',
  eq: 'equal',
  neq: 'not equal',
  startswith: 'starts with',
  in: 'in',
};

export const alertStatuses: Record<AlertStatusType, string> = {
  disabled: 'Disabled',
  enabled: 'Enabled',
  failed: 'Failed',
  'in progress': 'In Progress',
  disabling: 'Disabling',
  enabling: 'Enabling',
  provisioning: 'Provisioning',
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

export const ACCOUNT_GROUP_INFO_MESSAGE =
  'This alert applies to all entities associated with your account, and will be applied to any new entities that are added. The alert is triggered per entity rather than being based on the aggregated data for all entities.';

export const REGION_GROUP_INFO_MESSAGE =
  'This alert applies to all entities associated with selected regions, and will be applied to any new entities that are added. The alert is triggered per entity rather than being based on the aggregated data for all entities.';

export const ALERT_SCOPE_TOOLTIP_TEXT =
  'The set of entities to which the alert applies: account-wide, specific regions, or individual entities.';

export const ALERT_SCOPE_TOOLTIP_CONTEXTUAL =
  'Indicates whether the alert applies to all entities in the account, entities in specific regions, or just this entity.';

export type AlertFormMode = 'create' | 'edit' | 'view';

export type SelectDeselectAll = 'Deselect All' | 'Select All';

export const DELETE_ALERT_SUCCESS_MESSAGE = 'Alert successfully deleted.';

export const PORTS_TRAILING_COMMA_ERROR_MESSAGE =
  'Trailing comma is not allowed.';

export const PORT_HELPER_TEXT = 'Enter a port number (1-65535).';

export const PORTS_PLACEHOLDER_TEXT = 'e.g., 80,443,3000';

export const PORT_PLACEHOLDER_TEXT = 'e.g., 80';

export const CONFIGS_HELPER_TEXT =
  'Enter one or more configuration IDs separated by commas.';

export const CONFIGS_ERROR_MESSAGE =
  'Enter valid configuration ID numbers as integers separated by commas without spaces.';

export const CONFIG_ERROR_MESSAGE = 'Enter a valid configuration ID number.';
export const CONFIG_HELPER_TEXT = 'Enter a configuration ID number.';
export const CONFIG_IDS_CONSECUTIVE_COMMAS_ERROR_MESSAGE =
  'Use a single comma to separate configuration IDs.';

export const CONFIG_IDS_LEADING_COMMA_ERROR_MESSAGE =
  'First character must be an integer.';
export const CONFIG_ID_PLACEHOLDER_TEXT = 'e.g., 12345';
export const CONFIGS_ID_PLACEHOLDER_TEXT = 'e.g., 1234,5678';

export const INTERFACE_ID_ERROR_MESSAGE = 'Enter a valid interface ID number.';
export const INTERFACE_ID_HELPER_TEXT = 'Enter an interface ID number.';
export const PLACEHOLDER_TEXT_MAP: Record<string, Record<string, string>> = {
  port: {
    in: PORTS_PLACEHOLDER_TEXT,
    default: PORT_PLACEHOLDER_TEXT,
  },
  config_id: {
    in: CONFIGS_ID_PLACEHOLDER_TEXT,
    default: CONFIG_ID_PLACEHOLDER_TEXT,
  },
};

export const HELPER_TEXT_MAP: Record<string, Record<string, string>> = {
  port: {
    in: PORTS_HELPER_TEXT,
    default: PORT_HELPER_TEXT,
  },
  config_id: {
    in: CONFIGS_HELPER_TEXT,
    default: CONFIG_ERROR_MESSAGE,
  },
};

export const entityLabelMap = {
  linode: 'Linode',
  nodebalancer: 'Node Balancer',
};
