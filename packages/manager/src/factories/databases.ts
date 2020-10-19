import { Database, DatabaseType } from '@linode/api-v4/lib/databases/types';
import * as Factory from 'factory.ts';

export const databaseFactory = Factory.Sync.makeFactory<Database>({
  id: Factory.each(i => i),
  label: Factory.each(i => `vlan-${i}`),
  status: 'ready',
  // region: 'us-east', @todo add this in when the API supports it
  maintenance_schedule: {
    day: 'Wednesday',
    window: 'W0'
  },
  tags: ['tag1', 'tag2'],
  availability: 'standard',
  vcpus: 1,
  memory: 1024,
  disk: 25,
  created: '2020-10-01T00:00:00',
  updated: '2020-10-20T17:15:12'
});

export const databaseTypeFactory = Factory.Sync.makeFactory<DatabaseType>({
  id: 'g1-mysql-ha-2',
  label: 'MySQL HA Tier 2',
  price: {
    hourly: 0.4,
    monthly: 60
  },
  memory: 2048,
  disk: 40,
  transfer: null,
  vcpus: 2,
  availability: 'high'
});
