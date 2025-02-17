import Factory from 'src/factories/factoryProxy';

import type {
  AlertDefinitionDimensionFilter,
  AlertDefinitionMetricCriteria,
} from '@linode/api-v4';
import type { Alert } from '@linode/api-v4';

export const alertDimensionsFactory = Factory.Sync.makeFactory<AlertDefinitionDimensionFilter>(
  {
    dimension_label: 'state',
    label: 'State of memory',
    operator: 'eq',
    value: 'used',
  }
);

export const alertRulesFactory = Factory.Sync.makeFactory<AlertDefinitionMetricCriteria>(
  {
    aggregate_function: 'avg',
    dimension_filters: alertDimensionsFactory.buildList(1),
    label: 'Memory Usage',
    metric: 'system_memory_usage_by_resource',
    operator: 'eq',
    threshold: 60,
    unit: 'byte',
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
  created_by: 'user1',
  description: 'Test description',
  entity_ids: ['1', '2', '3'],
  has_more_resources: true,
  id: Factory.each((i) => i),
  label: Factory.each((id) => `Alert-${id}`),
  rule_criteria: {
    rules: [],
  },
  service_type: 'linode',
  severity: 0,
  status: 'enabled',
  tags: ['tag1', 'tag2'],
  trigger_conditions: {
    criteria_condition: 'ALL',
    evaluation_period_seconds: 900,
    polling_interval_seconds: 300,
    trigger_occurrences: 3,
  },

  type: 'system',
  updated: new Date().toISOString(),
  updated_by: 'user1',
});
