import {
  Database,
  DatabaseType,
  DatabaseStatus,
  DatabaseBackup,
  DatabaseBackupType,
} from '@linode/api-v4/lib/databases/types';
import * as Factory from 'factory.ts';
import { sample } from 'lodash';
import { v4 } from 'uuid';

const possibleStatuses = [
  'creating',
  'running',
  'failed',
  'degraded',
  'updating',
];

export const databaseTypeFactory = Factory.Sync.makeFactory<DatabaseType>({
  id: 'g1-mysql-ha-2',
  label: 'MySQL HA Tier 2',
  price: {
    hourly: 0.4,
    monthly: 60,
  },
  memory: 2048,
  transfer: 30,
  disk: 40,
  vcpus: 2,
  deprecated: false,
  addons: {
    fallover_node: {
      price: {
        monthly: 0.6,
        hourly: 80,
      },
    },
  },
});

export const databaseFactory = Factory.Sync.makeFactory<Database>({
  id: Factory.each((i) => i),
  label: Factory.each((i) => `database-${i}`),
  engine: 'mysql',
  type: databaseTypeFactory.build(),
  region: 'us-east',
  version: 'mysql/5.8.13',
  status: sample(possibleStatuses) as DatabaseStatus,
  updated: '2021-12-16T17:15:12',
  created: '2021-12-09T17:15:12',
  instance_uri: '',
});

export const databaseBackupFactory = Factory.Sync.makeFactory<DatabaseBackup>({
  id: Factory.each(() => v4()),
  label: Factory.each(() => `backup-${v4()}`),
  type: sample(['snapshot', 'auto']) as DatabaseBackupType,
  created: '2020-10-01T00:00:00',
});
