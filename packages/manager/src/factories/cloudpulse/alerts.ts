import Factory from 'src/factories/factoryProxy';

import type { Alert } from '@linode/api-v4';

export const alertFactory = Factory.Sync.makeFactory<Alert>({
  channels: [],
  created: new Date().toISOString(),
  created_by: 'user1',
  description: '',
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
    evaluation_period_seconds: 0,
    polling_interval_seconds: 0,
    trigger_occurrences: 0,
  },
  type: 'user',
  updated: new Date().toISOString(),
  updated_by: 'user1',
});
