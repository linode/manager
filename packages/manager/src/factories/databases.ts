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
import { pickRandom, randomDate } from 'src/utilities/random';
import { v4 } from 'uuid';

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
  id: Factory.each((i) => `g6-standard-${i}`),
  label: Factory.each((i) => `Linode ${i} GB`),
  class: 'standard',
  engines: {
    mysql: [
      {
        quantity: 1,
        price: {
          hourly: 0.09,
          monthly: 60,
        },
      },
      {
        quantity: 2,
        price: {
          hourly: 0.15,
          monthly: 100,
        },
      },
      {
        quantity: 3,
        price: {
          hourly: 0.21,
          monthly: 140,
        },
      },
    ],
    postgresql: [
      {
        quantity: 1,
        price: {
          hourly: 0.05,
          monthly: 70,
        },
      },
      {
        quantity: 2,
        price: {
          hourly: 0.12,
          monthly: 116,
        },
      },
      {
        quantity: 3,
        price: {
          hourly: 0.25,
          monthly: 180,
        },
      },
    ],
    mongodb: [
      {
        quantity: 1,
        price: {
          hourly: 0.03,
          monthly: 50,
        },
      },
      {
        quantity: 2,
        price: {
          hourly: 0.08,
          monthly: 88,
        },
      },
      {
        quantity: 3,
        price: {
          hourly: 0.22,
          monthly: 116,
        },
      },
    ],
    redis: [
      {
        quantity: 1,
        price: {
          hourly: 0.08,
          monthly: 180,
        },
      },
      {
        quantity: 2,
        price: {
          hourly: 0.16,
          monthly: 360,
        },
      },
      {
        quantity: 3,
        price: {
          hourly: 0.32,
          monthly: 540,
        },
      },
    ],
  },
  memory: 2048,
  disk: 20480,
  vcpus: 2,
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
    cluster_size: Factory.each(() => pickRandom([1, 3])),
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
  cluster_size: Factory.each(() => pickRandom([1, 3])),
  engine: 'mysql',
  encrypted: false,
  ssl_connection: false,
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
  updates: {
    frequency: 'weekly',
    duration: 3,
    hour_of_day: 20,
    day_of_week: 1,
    week_of_month: null,
  },
});

export const databaseBackupFactory = Factory.Sync.makeFactory<DatabaseBackup>({
  id: Factory.each((i) => i),
  label: Factory.each(() => `backup-${v4()}`),
  type: pickRandom(['snapshot', 'auto']),
  created: Factory.each(() => randomDate().toISOString()),
});

export const databaseEngineFactory = Factory.Sync.makeFactory<DatabaseEngine>({
  id: Factory.each((i) => `test/${i}`),
  engine: 'mysql',
  version: Factory.each((i) => `${i}`),
  deprecated: false,
});
