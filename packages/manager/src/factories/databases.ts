import {
  Database,
  DatabaseBackup,
  DatabaseBackupType,
  DatabaseInstance,
  DatabaseStatus,
  DatabaseType,
  DatabaseVersion,
  ReplicationType,
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

const possibleReplicationTypes = ['none', 'semi-synch', 'asynch'];
const IPv4List = ['192.0.2.1', '196.0.0.0', '198.0.0.2'];

export const databaseTypeFactory = Factory.Sync.makeFactory<DatabaseType>({
  id: 'g6-standard-1',
  label: 'Linode 2 GB',
  class: 'standard',
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
    failover: {
      price: {
        monthly: 80,
        hourly: 0.6,
      },
    },
  },
});

export const databaseInstanceFactory = Factory.Sync.makeFactory<DatabaseInstance>(
  {
    id: Factory.each((i) => i),
    label: Factory.each((i) => `database-${i}`),
    engine: 'mysql',
    type: databaseTypeFactory.build().id,
    region: 'us-east',
    version: 'mysql/5.8.13',
    status: sample(possibleStatuses) as DatabaseStatus,
    failover_count: 3,
    updated: '2021-12-16T17:15:12',
    created: '2021-12-09T17:15:12',
    instance_uri: '',
  }
);

export const databaseFactory = Factory.Sync.makeFactory<Database>({
  id: Factory.each((i) => i),
  label: Factory.each((i) => `database-${i}`),
  region: 'us-east',
  status: sample(possibleStatuses) as DatabaseStatus,
  type: databaseTypeFactory.build().id,
  failover_count: 3,
  engine: 'mysql',
  encrypted: false,
  ipv4_public: sample(IPv4List) as string,
  ssl_connection: false,
  replication_type: sample(possibleReplicationTypes) as ReplicationType,
  allow_list: [...IPv4List],
  connection_strings: [
    {
      driver: 'python',
      value: 'Testing',
    },
  ],
  created: '2021-12-09T17:15:12',
  updated: '2021-12-16T17:15:12',
});

export const databaseBackupFactory = Factory.Sync.makeFactory<DatabaseBackup>({
  id: Factory.each((i) => i),
  label: Factory.each(() => `backup-${v4()}`),
  type: sample(['snapshot', 'auto']) as DatabaseBackupType,
  created: '2020-10-01T00:00:00',
});

export const databaseVersionFactory = Factory.Sync.makeFactory<DatabaseVersion>(
  {
    id: Factory.each((i) => `version-${i}`),
    label: Factory.each((i) => `MySQL v${i}`),
    engine: 'mysql',
    version: Factory.each((i) => `v${i}`),
    deprecated: false,
  }
);
