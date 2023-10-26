import {
  Database,
  DatabaseBackup,
  DatabaseEngine,
  DatabaseInstance,
  DatabaseStatus,
  DatabaseType,
  MySQLReplicationType,
  PostgresReplicationType,
} from '@linode/api-v4/lib/databases/types';
import * as Factory from 'factory.ts';
import { v4 } from 'uuid';

import { pickRandom, randomDate } from 'src/utilities/random';

// These are not all of the possible statuses, but these are some common ones.
const possibleStatuses: DatabaseStatus[] = [
  'provisioning',
  'active',
  'failed',
  'degraded',
];

export const possibleMySQLReplicationTypes: MySQLReplicationType[] = [
  'none',
  'semi_synch',
  'asynch',
];

export const possiblePostgresReplicationTypes: PostgresReplicationType[] = [
  'none',
  'synch',
  'asynch',
];

export const IPv4List = ['192.0.2.1', '196.0.0.0', '198.0.0.2'];

export const databaseTypeFactory = Factory.Sync.makeFactory<DatabaseType>({
  class: 'standard',
  disk: 20480,
  engines: {
    mongodb: [
      {
        price: {
          hourly: 0.03,
          monthly: 50,
        },
        quantity: 1,
      },
      {
        price: {
          hourly: 0.08,
          monthly: 88,
        },
        quantity: 2,
      },
      {
        price: {
          hourly: 0.22,
          monthly: 116,
        },
        quantity: 3,
      },
    ],
    mysql: [
      {
        price: {
          hourly: 0.09,
          monthly: 60,
        },
        quantity: 1,
      },
      {
        price: {
          hourly: 0.15,
          monthly: 100,
        },
        quantity: 2,
      },
      {
        price: {
          hourly: 0.21,
          monthly: 140,
        },
        quantity: 3,
      },
    ],
    postgresql: [
      {
        price: {
          hourly: 0.05,
          monthly: 70,
        },
        quantity: 1,
      },
      {
        price: {
          hourly: 0.12,
          monthly: 116,
        },
        quantity: 2,
      },
      {
        price: {
          hourly: 0.25,
          monthly: 180,
        },
        quantity: 3,
      },
    ],
    redis: [
      {
        price: {
          hourly: 0.08,
          monthly: 180,
        },
        quantity: 1,
      },
      {
        price: {
          hourly: 0.16,
          monthly: 360,
        },
        quantity: 2,
      },
      {
        price: {
          hourly: 0.32,
          monthly: 540,
        },
        quantity: 3,
      },
    ],
  },
  id: Factory.each((i) => `g6-standard-${i}`),
  label: Factory.each((i) => `Linode ${i} GB`),
  memory: 2048,
  vcpus: 2,
});

export const databaseInstanceFactory = Factory.Sync.makeFactory<DatabaseInstance>(
  {
    cluster_size: Factory.each(() => pickRandom([1, 3])),
    created: '2021-12-09T17:15:12',
    engine: 'mysql',
    hosts: {
      primary: 'db-mysql-primary-0.b.linodeb.net',
      secondary: 'db-mysql-secondary-0.b.linodeb.net',
    },
    id: Factory.each((i) => i),
    instance_uri: '',
    label: Factory.each((i) => `database-${i}`),
    region: 'us-east',
    status: Factory.each(() => pickRandom(possibleStatuses)),
    type: databaseTypeFactory.build().id,
    updated: '2021-12-16T17:15:12',
    version: '5.8.13',
  }
);

export const databaseFactory = Factory.Sync.makeFactory<Database>({
  allow_list: [...IPv4List],
  cluster_size: Factory.each(() => pickRandom([1, 3])),
  connection_strings: [
    {
      driver: 'python',
      value: 'Testing',
    },
  ],
  created: '2021-12-09T17:15:12',
  encrypted: false,
  engine: 'mysql',
  hosts: {
    primary: 'db-mysql-primary-0.b.linodeb.net',
    secondary: 'db-mysql-secondary-0.b.linodeb.net',
  },
  id: Factory.each((i) => i),
  label: Factory.each((i) => `database-${i}`),
  port: 3306,
  region: 'us-east',
  ssl_connection: false,
  status: pickRandom(possibleStatuses),
  total_disk_size_gb: 15,
  type: 'g6-standard-0',
  updated: '2021-12-16T17:15:12',
  updates: {
    day_of_week: 1,
    duration: 3,
    frequency: 'weekly',
    hour_of_day: 20,
    week_of_month: null,
  },
  used_disk_size_gb: 5,
  version: '5.8.13',
});

export const databaseBackupFactory = Factory.Sync.makeFactory<DatabaseBackup>({
  created: Factory.each(() => randomDate().toISOString()),
  id: Factory.each((i) => i),
  label: Factory.each(() => `backup-${v4()}`),
  type: pickRandom(['snapshot', 'auto']),
});

export const databaseEngineFactory = Factory.Sync.makeFactory<DatabaseEngine>({
  deprecated: false,
  engine: 'mysql',
  id: Factory.each((i) => `test/${i}`),
  version: Factory.each((i) => `${i}`),
});
