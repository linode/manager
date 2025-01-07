import Factory from 'src/factories/factoryProxy';
import { pickRandom } from 'src/utilities/random';

import type { DimensionFilter } from '@linode/api-v4';
import type { AlertDefinitionMetricCriteria } from '@linode/api-v4';
import type { Alert } from '@linode/api-v4';

export const alertDimensionsFactory = Factory.Sync.makeFactory<DimensionFilter>(
  {
    dimension_label: 'operating_system',
    label: 'Operating System',
    operator: Factory.each(() => pickRandom(['neq', 'eq'])),
    value: Factory.each(() => pickRandom(['Windows', 'Linux'])),
  }
);

export const alertRulesFactory = Factory.Sync.makeFactory<AlertDefinitionMetricCriteria>(
  {
    aggregation_type: Factory.each(() => pickRandom(['avg', 'sum'])),
    dimension_filters: alertDimensionsFactory.buildList(1),
    label: Factory.each(() => pickRandom(['CPU Usage', 'Memory Usage'])),
    metric: Factory.each(() => pickRandom(['cpu_usage', 'memory_usage'])),
    operator: Factory.each(() => pickRandom(['eq', 'gt'])),
    threshold: 60,
    unit: Factory.each(() => pickRandom(['Bytes', 'Percentage'])),
  }
);

export const alertFactory = Factory.Sync.makeFactory<Alert>({
  channels: [],
  created: new Date().toISOString(),
  created_by: 'user1',
  description: 'Test description',
  entity_ids: ['0', '1', '2', '3'],
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
    evaluation_period_seconds: 240,
    polling_interval_seconds: 120,
    trigger_occurrences: 3,
  },
  type: 'user',
  updated: new Date().toISOString(),
  updated_by: 'user1',
});
