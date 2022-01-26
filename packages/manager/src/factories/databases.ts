import * as Factory from 'factory.ts';
import { pickRandom, randomDate } from 'src/utilities/random';
import { v4 } from 'uuid';
import {
  Database,
  DatabaseBackup,
  DatabaseInstance,
  DatabaseStatus,
  DatabaseType,
  DatabaseVersion,
  ReplicationType,
} from '@linode/api-v4/lib/databases/types';

// These are not all of the possible statuses, but these are some common ones.
const possibleStatuses: DatabaseStatus[] = [
  'provisioning',
  'active',
  'failed',
  'degraded',
];

const possibleReplicationTypes: ReplicationType[] = [
  'none',
  'semi_synch',
  'asynch',
];

export const IPv4List = ['192.0.2.1', '196.0.0.0', '198.0.0.2'];

export const databaseTypeFactory = Factory.Sync.makeFactory<DatabaseType>({
  id: Factory.each((i) => `g6-standard-${i}`),
  label: Factory.each((i) => `Linode ${i} GB`),
  class: 'standard',
  price: {
    hourly: 0.4,
    monthly: 60,
  },
  memory: 2048,
  transfer: 30,
  disk: 20480,
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
    version: '5.8.13',
    status: Factory.each(() => pickRandom(possibleStatuses)),
    failover_count: Factory.each(() => pickRandom([0, 2])),
    hosts: {
      primary: 'db-mysql-primary-0.b.linodeb.net',
      secondary: 'db-mysql-secondary-0.b.linodeb.net',
    },
    updated: '2021-12-16T17:15:12',
    created: '2021-12-09T17:15:12',
    instance_uri: '',
  }
);

export const databaseFactory = Factory.Sync.makeFactory<Database>({
  id: Factory.each((i) => i),
  label: Factory.each((i) => `database-${i}`),
  region: 'us-east',
  status: pickRandom(possibleStatuses),
  type: 'g6-standard-0',
  version: '5.8.13',
  failover_count: 2,
  engine: 'mysql',
  encrypted: false,
  ipv4_public: pickRandom(IPv4List),
  ssl_connection: false,
  replication_type: pickRandom(possibleReplicationTypes),
  hosts: {
    primary: 'db-mysql-primary-0.b.linodeb.net',
    secondary: 'db-mysql-secondary-0.b.linodeb.net',
  },
  port: 3306,
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
  type: pickRandom(['snapshot', 'auto']),
  created: Factory.each(() => randomDate().toISOString()),
});

export const databaseVersionFactory = Factory.Sync.makeFactory<DatabaseVersion>(
  {
    id: Factory.each((i) => `mysql/${i}`),
    engine: 'mysql',
    version: Factory.each((i) => `${i}`),
    deprecated: false,
  }
);
