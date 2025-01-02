import Factory from 'src/factories/factoryProxy';

import type { Alert } from '@linode/api-v4';

export const alertFactory = Factory.Sync.makeFactory<Alert>({
  channels: [],
  created: new Date().toISOString(),
  created_by: 'user1',
  description: 'Test',
  entity_ids: ['1', '2', '3'],
  has_more_resources: true,
  id: Factory.each((i) => i),
  label: Factory.each((id) => `Alert-${id}`),
  rule_criteria: {
    rules: [
      {
        aggregation_type: 'avg',
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
        aggregation_type: 'avg',
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
  type: 'user',
  updated: new Date().toISOString(),
  updated_by: 'user1',
});
