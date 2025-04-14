import { pickRandom, randomDate } from '@linode/utilities';
import { Factory } from '@linode/utilities';

import type {
  ClusterSize,
  Database,
  DatabaseBackup,
  DatabaseEngine,
  DatabaseEngineConfig,
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

export const databaseInstanceFactory =
  Factory.Sync.makeFactory<DatabaseInstance>({
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
  });

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

export const databaseEngineConfigFactory =
  Factory.Sync.makeFactory<DatabaseEngineConfig>({
    binlog_retention_period: {
      description:
        'The minimum amount of time in seconds to keep binlog entries before deletion. This may be extended for services that require binlog entries for longer than the default for example if using the MySQL Debezium Kafka connector.',
      example: 600,
      maximum: 86400,
      minimum: 600,
      requires_restart: false,
      type: 'integer',
    },
    wal_sender_timeout: {
      description:
        'Terminate replication connections that are inactive for longer than this amount of time, in milliseconds. Setting this value to zero disables the timeout.',
      type: 'integer',
      example: 60000,
      anyOf: [
        { minimum: 0, maximum: 0 },
        { minimum: 5000, maximum: 10800000 },
      ],
    },
    mysql: {
      connect_timeout: {
        description:
          'The number of seconds that the mysqld server waits for a connect packet before responding with Bad handshake',
        example: 10,
        maximum: 3600,
        minimum: 2,
        requires_restart: false,
        type: 'integer',
      },
      default_time_zone: {
        description:
          "Default server time zone as an offset from UTC (from -12:00 to +12:00), a time zone name, or 'SYSTEM' to use the MySQL server default.",
        example: '+03:00',
        maxLength: 100,
        minLength: 2,
        pattern: '^([-+][\\d:]*|[\\w/]*)$',
        requires_restart: false,
        type: 'string',
      },
      innodb_ft_min_token_size: {
        description:
          'Minimum length of words that are stored in an InnoDB FULLTEXT index. Changing this parameter will lead to a restart of the MySQL service.',
        example: 3,
        maximum: 16,
        minimum: 0,
        requires_restart: true,
        type: 'integer',
      },
      innodb_ft_server_stopword_table: {
        description:
          'This option is used to specify your own InnoDB FULLTEXT index stopword list for all InnoDB tables.',
        example: 'db_name/table_name',
        maxLength: 1024,
        pattern: '^.+/.+$',
        requires_restart: false,
        type: ['null', 'string'],
      },
      innodb_print_all_deadlocks: {
        description:
          'When enabled, information about all deadlocks in InnoDB user transactions is recorded in the error log. Disabled by default.',
        example: true,
        requires_restart: false,
        type: 'boolean',
      },
      log_output: {
        description:
          'The slow log output destination when slow_query_log is ON. To enable MySQL AI Insights, choose INSIGHTS. To use MySQL AI Insights and the mysql.slow_log table at the same time, choose INSIGHTS,TABLE. To only use the mysql.slow_log table, choose TABLE. To silence slow logs, choose NONE.',
        enum: ['INSIGHTS', 'NONE', 'TABLE', 'INSIGHTS,TABLE'],
        example: 'INSIGHTS',
        requires_restart: false,
        type: 'string',
      },
      long_query_time: {
        description:
          'The slow_query_logs work as SQL statements that take more than long_query_time seconds to execute.',
        example: 10,
        maximum: 3600,
        minimum: 0.0,
        requires_restart: false,
        type: 'number',
      },
      sql_mode: {
        description:
          'Global SQL mode. Set to empty to use MySQL server defaults. When creating a new service and not setting this field Aiven default SQL mode (strict, SQL standard compliant) will be assigned.',
        example: 'ANSI,TRADITIONAL',
        maxLength: 1024,
        pattern: '^[A-Z_]*(,[A-Z_]+)*$',
        requires_restart: false,
        type: 'string',
      },
      sql_require_primary_key: {
        description:
          'Require primary key to be defined for new tables or old tables modified with ALTER TABLE and fail if missing. It is recommended to always have primary keys because various functionality may break if any large table is missing them.',
        example: true,
        requires_restart: false,
        type: 'boolean',
      },
    },
    service_log: {
      description:
        'Store logs for the service so that they are available in the HTTP API and console.',
      example: true,
      requires_restart: false,
      type: ['boolean', 'null'],
    },
  });
