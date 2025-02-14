import Factory from 'src/factories/factoryProxy';

import type {
  AlertDefinitionDimensionFilter,
  AlertDefinitionMetricCriteria,
  CreateAlertDefinitionPayload,
  MetricCriteria,
  TriggerCondition,
} from '@linode/api-v4';
import type { Alert } from '@linode/api-v4';

export const alertDimensionsFactory = Factory.Sync.makeFactory<AlertDefinitionDimensionFilter>(
  {
    dimension_label: 'operating_system',
    label: 'Operating System',
    operator: 'eq',
    value: 'Linux',
  }
);

export const alertRulesFactory = Factory.Sync.makeFactory<AlertDefinitionMetricCriteria>(
  {
    aggregate_function: 'avg',
    dimension_filters: alertDimensionsFactory.buildList(1),
    label: 'CPU Usage',
    metric: 'cpu_usage',
    operator: 'eq',
    threshold: 60,
    unit: 'Bytes',
  }
);

export const triggerConditionFactory = Factory.Sync.makeFactory<TriggerCondition>(
  {
    criteria_condition: 'ALL',
    evaluation_period_seconds: 300,
    polling_interval_seconds: 60,
    trigger_occurrences: 3,
  }
);
export const rulesFactory = Factory.Sync.makeFactory<MetricCriteria>({
  aggregate_function: 'avg',
  dimension_filters: [
    {
      dimension_label: 'region',
      operator: 'eq',
      value: 'us-ord',
    },
  ],
  metric: 'cpu_usage',
  operator: 'gte',
  threshold: 1000,
});
export const alertDefinitionFactory = Factory.Sync.makeFactory<CreateAlertDefinitionPayload>(
  {
    channel_ids: [1, 2, 3],
    description: 'This is a default alert description.',
    entity_ids: ['1', '2', '3', '4', '5'],
    label: 'Default Alert Label',
    rule_criteria: {
      rules: [rulesFactory.build()],
    },
    severity: 1,
    tags: ['tag1', 'tag2'],
    trigger_conditions: triggerConditionFactory.build(),
  }
);

export const alertFactory = Factory.Sync.makeFactory<Alert>({
  alert_channels: [
    {
      id: 1,
      label: 'sample1',
      type: 'alert-channel',
      url: '',
    },
    {
      id: 2,
      label: 'sample2',
      type: 'alert-channel',
      url: '',
    },
  ],
  class: 'dedicated',
  created: new Date().toISOString(),
  created_by: 'system',
  description: 'Test description',
  entity_ids: ['1', '2', '3', '50', '48'],
  has_more_resources: true,
  id: Factory.each((i) => i),
  label: Factory.each((id) => `Alert-${id}`),
  rule_criteria: {
    rules: [
      {
        aggregate_function: 'avg',
        dimension_filters: [
          {
            dimension_label: 'Test',
            label: 'Test',
            operator: 'eq',
            value: '40',
          },
        ],
        label: 'CPU Usage',
        metric: 'CPU Usage',
        operator: 'gt',
        threshold: 60,
        unit: 'Bytes',
      },
      {
        aggregate_function: 'avg',
        dimension_filters: [
          {
            dimension_label: 'OperatingSystem',
            label: 'OperatingSystem',
            operator: 'eq',
            value: 'MacOS',
          },
          {
            dimension_label: 'OperatingSystem',
            label: 'OperatingSystem',
            operator: 'eq',
            value: 'Windows',
          },
          {
            dimension_label: 'Test',
            label: 'Test',
            operator: 'neq',
            value: '40',
          },
        ],
        label: 'CPU Usage',
        metric: 'CPU Usage',
        operator: 'gt',
        threshold: 50,
        unit: 'Percentage',
      },
    ],
  },
  service_type: 'linode',
  severity: 0,
  status: 'enabled',
  tags: ['tag1', 'tag2'],
  trigger_conditions: {
    criteria_condition: 'ALL',
    evaluation_period_seconds: 240,
    polling_interval_seconds: 120,
    trigger_occurrences: 3,
  },
  type: 'system',
  updated: new Date().toISOString(),
  updated_by: 'system',
});
