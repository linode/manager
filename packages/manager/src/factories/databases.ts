import { pickRandom, randomDate } from '@linode/utilities';
import { Factory } from '@linode/utilities';

import type {
  ClusterSize,
  Database,
  DatabaseBackup,
  DatabaseEngine,
  DatabaseInstance,
  DatabaseStatus,
  DatabaseType,
  Engine,
  MySQLReplicationType,
  PostgresReplicationType,
} from '@linode/api-v4';

export const possibleStatuses: DatabaseStatus[] = [
  'active',
  'degraded',
  'failed',
  'migrating',
  'migrated',
  'provisioning',
  'resizing',
  'restoring',
  'resuming',
  'suspended',
  'suspending',
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

export const possibleTypes: string[] = [
  'g6-nanode-1',
  'g6-standard-2',
  'g6-standard-4',
  'g6-standard-6',
  'g6-standard-20',
  'g6-dedicated-32',
  'g6-dedicated-50',
  'g6-dedicated-56',
  'g6-dedicated-64',
];

export const possibleRegions: string[] = [
  'ap-south',
  'ap-southeast',
  'ap-west',
  'ca-central',
  'eu-central',
  'fr-par',
  'us-east',
  'us-iad',
  'us-ord',
];

export const IPv4List = ['192.0.2.1', '196.0.0.0', '198.0.0.2'];

export const databaseTypeFactory = Factory.Sync.makeFactory<DatabaseType>({
  class: 'standard',
  disk: Factory.each((i) => i * 20480),
  engines: {
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
  },
  id: Factory.each((i) => possibleTypes[i % possibleTypes.length]),
  label: Factory.each((i) => `Linode ${i} GB`),
  memory: Factory.each((i) => i * 2048),
  vcpus: Factory.each((i) => i * 2),
});

const adb10 = (i: number) => i % 2 === 0;

export const databaseInstanceFactory = Factory.Sync.makeFactory<DatabaseInstance>(
  {
    allow_list: [],
    cluster_size: Factory.each((i) =>
      adb10(i)
        ? ([1, 3][i % 2] as ClusterSize)
        : ([1, 2, 3][i % 3] as ClusterSize)
    ),
    connection_strings: [],
    created: '2021-12-09T17:15:12',
    encrypted: false,
    engine: Factory.each((i) => ['mysql', 'postgresql'][i % 2] as Engine),
    engine_config: {
      advanced: {
        connect_timeout: 10,
        default_time_zone: '+03:00',
        group_concat_max_len: 4,
        information_schema_stats_expiry: 900,
        innodb_print_all_deadlocks: true,
        sql_mode:
          'ANSI,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION,NO_ZERO_DATE,NO_ZERO_IN_DATE,STRICT_ALL_TABLES',
      },
      binlog_retention_period: 600,
    },
    hosts: Factory.each((i) =>
      adb10(i)
        ? {
            primary: 'db-mysql-primary-0.b.linodeb.net',
            secondary: 'db-mysql-secondary-0.b.linodeb.net',
          }
        : {
            primary: 'db-mysql-primary-0.b.linodeb.net',
            standby: 'db-mysql-secondary-0.b.linodeb.net',
          }
    ),
    id: Factory.each((i) => i),
    instance_uri: '',
    label: Factory.each((i) => `example.com-database-${i}`),
    members: {
      '2.2.2.2': 'primary',
    },
    platform: Factory.each((i) =>
      adb10(i) ? 'rdbms-legacy' : 'rdbms-default'
    ),
    region: Factory.each((i) => possibleRegions[i % possibleRegions.length]),
    status: Factory.each((i) => possibleStatuses[i % possibleStatuses.length]),
    type: Factory.each((i) => possibleTypes[i % possibleTypes.length]),
    updated: '2021-12-16T17:15:12',
    updates: {
      day_of_week: 1,
      duration: 3,
      frequency: 'weekly',
      hour_of_day: 20,
      pending: [
        {
          deadline: null,
          description: 'Log configuration options changes required',
          planned_for: '2044-09-15T17:15:12',
        },
      ],
      week_of_month: null,
    },
    version: Factory.each((i) => ['8.0.30', '15.7'][i % 2]),
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
  engine_config: {
    advanced: {
      connect_timeout: 10,
      default_time_zone: '+03:00',
      group_concat_max_len: 4,
      information_schema_stats_expiry: 900,
      innodb_print_all_deadlocks: true,
      sql_mode:
        'ANSI,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION,NO_ZERO_DATE,NO_ZERO_IN_DATE,STRICT_ALL_TABLES',
    },
    binlog_retention_period: 600,
  },
  hosts: Factory.each((i) =>
    adb10(i)
      ? {
          primary: 'db-mysql-primary-0.b.linodeb.net',
          secondary: 'db-mysql-secondary-0.b.linodeb.net',
        }
      : {
          primary: 'db-mysql-primary-0.b.linodeb.net',
          standby: 'db-mysql-secondary-0.b.linodeb.net',
        }
  ),
  id: Factory.each((i) => i),
  label: Factory.each((i) => `database-${i}`),
  members: {
    '2.2.2.2': 'primary',
  },
  oldest_restore_time: '2024-09-15T17:15:12',
  platform: Factory.each((i) => (adb10(i) ? 'rdbms-legacy' : 'rdbms-default')),
  port: 3306,
  region: 'us-east',
  ssl_connection: false,
  status: pickRandom(possibleStatuses),
  total_disk_size_gb: 15,
  type: 'g6-nanode-1',
  updated: '2021-12-16T17:15:12',
  updates: {
    day_of_week: 1,
    duration: 3,
    frequency: 'weekly',
    hour_of_day: 20,
    pending: [
      {
        deadline: null,
        description: 'Log configuration options changes required',
        planned_for: '2044-09-15T17:15:12',
      },
    ],
    week_of_month: null,
  },
  used_disk_size_gb: 5,
  version: '5.8.13',
});

export const databaseBackupFactory = Factory.Sync.makeFactory<DatabaseBackup>({
  created: Factory.each(() => {
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    return randomDate(tenDaysAgo, now).toISOString();
  }),
  id: Factory.each((i) => i),
  label: Factory.each(() => `backup-${crypto.randomUUID()}`),
  type: pickRandom(['snapshot', 'auto']),
});

export const databaseEngineFactory = Factory.Sync.makeFactory<DatabaseEngine>({
  deprecated: false,
  engine: 'mysql',
  id: Factory.each((i) => `test/${i}`),
  version: Factory.each((i) => `${i}`),
});
