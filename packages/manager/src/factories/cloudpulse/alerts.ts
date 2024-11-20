import Factory from 'src/factories/factoryProxy';

import type {
  Alert,
  AlertDefinitionType,
  AlertServiceType,
  AlertSeverityType,
  AlertStatusType,
} from '@linode/api-v4';

const types: AlertDefinitionType[] = ['custom', 'default'];
const status: AlertStatusType[] = ['enabled', 'disabled'];
const severity: AlertSeverityType[] = [0, 1, 2, 3];
const users = ['user1', 'user2', 'user3'];
const serviceTypes: AlertServiceType[] = ['linode', 'dbaas'];
export const alertFactory = Factory.Sync.makeFactory<Alert>({
  channels: [],
  created: new Date().toISOString(),
  created_by: Factory.each((i) => users[i % users.length]),
  description: '',
  id: Factory.each((i) => i),
  label: Factory.each((id) => `Alert-${id}`),
  resource_ids: ['0', '1', '2', '3'],
  rule_criteria: {
    rules: [],
  },
  service_type: Factory.each((i) => serviceTypes[i % serviceTypes.length]),
  severity: Factory.each((i) => severity[i % severity.length]),
  status: Factory.each((i) => status[i % status.length]),
  triggerCondition: {
    evaluation_period_seconds: 0,
    polling_interval_seconds: 0,
    trigger_occurrences: 0,
  },
  type: Factory.each((i) => types[i % types.length]),
  updated: new Date().toISOString(),
  updated_by: Factory.each((i) => users[(i + 3) % users.length]),
});
