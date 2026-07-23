import {
  type ClusterSize,
  type ConnectionPool,
  type Database,
  type DatabaseEngine,
  type DatabaseInstance,
  type DatabaseStatus,
  type DatabaseType,
  type Engine,
} from '@linode/api-v4';
import { pickRandom } from '@linode/utilities';
import { Factory } from '@linode/utilities';

export const possibleStatuses: DatabaseStatus[] = [
  'active',
  'degraded',
  'migrating',
  'migrated',
  'provisioning',
  'resizing',
  'restoring',
  'resuming',
  'suspended',
  'suspending',
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
  'g7-premium-2',
  'g7-premium-4',
  'g7-premium-8',
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
    valkey: [
      {
        price: {
          hourly: 0.08,
          monthly: 80,
        },
        quantity: 1,
      },
      {
        price: {
          hourly: 0.1,
          monthly: 114,
        },
        quantity: 2,
      },
      {
        price: {
          hourly: 0.2,
          monthly: 170,
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

const mysqlEngineConfig = {
  mysql: {
    connect_timeout: 10,
    default_time_zone: '+03:00',
    innodb_print_all_deadlocks: true,
    sql_mode:
      'ANSI,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION,NO_ZERO_DATE,NO_ZERO_IN_DATE,STRICT_ALL_TABLES',
  },
  binlog_retention_period: 600,
};

const postgresqlEngineConfig = {
  pg: {
    default_toast_compression: 'lz4',
  },
  pg_stat_monitor_enable: false,
  pglookout: {
    max_failover_replication_time_lag: 60,
  },
};

const valkeyEngineConfig = {
  valkey_number_of_databases: 5,
};

export const configsByEngine = {
  mysql: mysqlEngineConfig,
  postgresql: postgresqlEngineConfig,
  valkey: valkeyEngineConfig,
};

export const databaseInstanceFactory =
  Factory.Sync.makeFactory<DatabaseInstance>({
    allow_list: [],
    available_restore_times: null,
    cluster_size: Factory.each((i) =>
      adb10(i)
        ? ([1, 3][i % 2] as ClusterSize)
        : ([1, 2, 3][i % 3] as ClusterSize)
    ),
    created: '2021-12-09T17:15:12',
    engine: Factory.each(
      (i) => ['mysql', 'postgresql', 'valkey'][i % 3] as Engine
    ),
    engine_config: Factory.each(
      (i) =>
        [mysqlEngineConfig, postgresqlEngineConfig, valkeyEngineConfig][i % 3]
    ),
    hosts: Factory.each((i) =>
      adb10(i)
        ? {
            primary: 'db-primary-0.b.linodeb.net',
            secondary: 'db-secondary-0.b.linodeb.net',
            endpoints: [
              {
                address: 'public-db-primary-0.b.linodeb.net',
                role: 'primary',
                public_access: true,
                port: 3306,
              },
            ],
          }
        : {
            primary: 'db-primary-0.b.linodeb.net',
            standby: 'db-secondary-0.b.linodeb.net',
            endpoints: [
              {
                address: 'public-db-primary-0.b.linodeb.net',
                role: 'primary',
                public_access: true,
                port: 3306,
              },
            ],
          }
    ),
    id: Factory.each((i) => i),
    instance_uri: '',
    label: Factory.each((i) => `example.com-database-${i}`),
    members: {
      '2.2.2.2': 'primary',
      '2.2.2.3': 'failover',
      '2.2.2.4': 'failover',
    },
    platform: 'rdbms-default',
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
    version: Factory.each((i) => ['8.0.30', '15.7', '8.1'][i % 3]),
  });

export const databaseFactory = Factory.Sync.makeFactory<Database>({
  allow_list: [...IPv4List],
  available_restore_times: null,
  cluster_size: Factory.each(() => pickRandom([1, 3])),
  created: '2021-12-09T17:15:12',
  engine: 'mysql',
  engine_config: mysqlEngineConfig,
  hosts: Factory.each((i) =>
    adb10(i)
      ? {
          primary: 'db-primary-0.b.linodeb.net',
          secondary: 'db-secondary-0.b.linodeb.net',
          endpoints: [
            {
              address: 'public-db-primary-0.b.linodeb.net',
              role: 'primary',
              public_access: true,
              port: 3306,
            },
          ],
        }
      : {
          primary: 'db-primary-0.b.linodeb.net',
          standby: 'db-secondary-0.b.linodeb.net',
          endpoints: [
            {
              address: 'public-db-primary-0.b.linodeb.net',
              role: 'primary',
              public_access: true,
              port: 3306,
            },
          ],
        }
  ),
  id: Factory.each((i) => i),
  label: Factory.each((i) => `database-${i}`),
  members: {
    '2.2.2.2': 'primary',
    '2.2.2.3': 'failover',
    '2.2.2.4': 'failover',
  },
  oldest_restore_time: '2024-09-15T17:15:12',
  platform: 'rdbms-default',
  private_network: null,
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

export const databaseEngineFactory = Factory.Sync.makeFactory<DatabaseEngine>({
  deprecated: false,
  engine: 'mysql',
  id: Factory.each((i) => `test/${i}`),
  version: Factory.each((i) => `${i}`),
});

export const databaseConnectionPoolFactory =
  Factory.Sync.makeFactory<ConnectionPool>({
    database: 'defaultdb',
    mode: 'transaction',
    label: Factory.each((i) => `test-pool-${i}`),
    size: 10,
    username: null,
  });

export const mysqlConfigResponse = {
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
};

export const postgresConfigResponse = {
  pg: {
    autovacuum_analyze_scale_factor: {
      description:
        'Specifies a fraction of the table size to add to autovacuum_analyze_threshold when deciding whether to trigger an ANALYZE. The default is 0.2 (20% of table size)',
      maximum: 1,
      minimum: 0,
      requires_restart: false,
      type: 'number',
    },
    autovacuum_analyze_threshold: {
      description:
        'Specifies the minimum number of inserted, updated or deleted tuples needed to trigger an ANALYZE in any one table. The default is 50 tuples.',
      maximum: 2147483647,
      minimum: 0,
      requires_restart: false,
      type: 'integer',
    },
    autovacuum_max_workers: {
      description:
        'Specifies the maximum number of autovacuum processes (other than the autovacuum launcher) that may be running at any one time. The default is three. This parameter can only be set at server start.',
      maximum: 20,
      minimum: 1,
      requires_restart: true,
      type: 'integer',
    },
    default_toast_compression: {
      description:
        'Specifies the default TOAST compression method for values of compressible columns (the default is lz4).',
      enum: ['lz4', 'pglz'],
      example: 'lz4',
      requires_restart: false,
      type: 'string',
    },
    timezone: {
      description: 'PostgreSQL service timezone',
      example: 'Europe/Helsinki',
      maxLength: 64,
      pattern: '^[\\w/]*$',
      requires_restart: false,
      type: 'string',
    },
    wal_sender_timeout: {
      description:
        'Terminate replication connections that are inactive for longer than this amount of time, in milliseconds. Setting this value to zero disables the timeout.',
      example: 60000,
      requires_restart: false,
      type: 'integer',
    },
  },
  pg_stat_monitor_enable: {
    default: false,
    description:
      'Enable the pg_stat_monitor extension. Enabling this extension will cause the cluster to be restarted.When this extension is enabled, pg_stat_statements results for utility commands are unreliable',
    requires_restart: true,
    type: 'boolean',
  },
  pglookout: {
    max_failover_replication_time_lag: {
      default: 60,
      description:
        'Number of seconds of master unavailability before triggering database failover to standby',
      maximum: 999999,
      minimum: 10,
      requires_restart: false,
      type: 'integer',
    },
  },
  synchronous_replication: {
    description:
      'Synchronous replication type. Note that the service plan also needs to support synchronous replication.',
    enum: ['quorum', 'off'],
    example: 'quorum',
    requires_restart: false,
    default: 'off',
    type: 'string',
  },
};

export const valkeyConfigResponse = {
  backup_hour: {
    description:
      'The hour of day (in UTC) when backup for the service is started. New backup is only started if previous backup has already completed.',
    example: 3,
    maximum: 23,
    minimum: 0,
    requires_restart: false,
    type: ['integer', 'null'],
  },
  backup_minute: {
    description:
      'The minute of an hour when backup for the service is started. New backup is only started if previous backup has already completed.',
    example: 30,
    maximum: 59,
    minimum: 0,
    requires_restart: false,
    type: ['integer', 'null'],
  },
  frequent_snapshots: {
    default: true,
    description:
      'When enabled, Valkey will create frequent local RDB snapshots. When disabled, Valkey will only take RDB snapshots when a backup is created, based on the backup schedule. This setting is ignored when `valkey_persistence` is set to `off`.',
    requires_restart: false,
    type: 'boolean',
  },
  valkey_acl_channels_default: {
    description:
      "Determines default pub/sub channels' ACL for new users if ACL is not supplied. When this option is not defined, all_channels is assumed to keep backward compatibility. This option doesn't affect Valkey configuration acl-pubsub-default.",
    enum: ['allchannels', 'resetchannels'],
    requires_restart: false,
    type: 'string',
  },
  valkey_active_expire_effort: {
    default: 1,
    description:
      'Valkey reclaims expired keys both when accessed and in the background. The background process scans for expired keys to free memory. Increasing the active-expire-effort setting (default 1, max 10) uses more CPU to reclaim expired keys faster, reducing memory usage but potentially increasing latency.',
    maximum: 10,
    minimum: 1,
    requires_restart: false,
    type: 'integer',
  },
  valkey_io_threads: {
    description:
      'Set Valkey IO thread count. Changing this will cause a restart of the Valkey service.',
    example: 1,
    maximum: 256,
    minimum: 1,
    requires_restart: true,
    type: 'integer',
  },
  valkey_lfu_decay_time: {
    default: 1,
    description: 'LFU maxmemory-policy counter decay time in minutes',
    maximum: 120,
    minimum: 1,
    requires_restart: false,
    type: 'integer',
  },
  valkey_lfu_log_factor: {
    default: 10,
    description:
      'Counter logarithm factor for volatile-lfu and allkeys-lfu maxmemory-policies',
    maximum: 100,
    minimum: 0,
    requires_restart: false,
    type: 'integer',
  },
  valkey_maxmemory_policy: {
    default: 'noeviction',
    description: 'Valkey maxmemory-policy',
    enum: [
      'noeviction',
      'allkeys-lru',
      'volatile-lru',
      'allkeys-random',
      'volatile-random',
      'volatile-ttl',
      'volatile-lfu',
      'allkeys-lfu',
    ],
    requires_restart: false,
    type: ['string', 'null'],
  },
  valkey_notify_keyspace_events: {
    example: 'KEA',
    description: 'Set notify-keyspace-events option',
    maxLength: 32,
    pattern: '^[KEg\\$lshzxentdmA]*$',
    requires_restart: false,
    type: 'string',
  },
  valkey_number_of_databases: {
    description:
      'Set number of Valkey databases. Changing this will cause a restart of the Valkey service.',
    example: 16,
    maximum: 128,
    minimum: 1,
    requires_restart: true,
    type: 'integer',
  },
  valkey_persistence: {
    description:
      "When persistence is 'rdb', Valkey does RDB dumps each 10 minutes if any key is changed. Also RDB dumps are done according to backup schedule for backup purposes. When persistence is 'off', no RDB dumps and backups are done, so data can be lost at any moment if service is restarted for any reason, or if service is powered off. Also service can't be forked.",
    enum: ['off', 'rdb'],
    requires_restart: true,
    type: 'string',
  },
  valkey_pubsub_client_output_buffer_limit: {
    description:
      'Set output buffer limit for pub / sub clients in MB. The value is the hard limit, the soft limit is 1/4 of the hard limit. When setting the limit, be mindful of the available memory in the selected service plan.',
    example: 64,
    maximum: 512,
    minimum: 32,
    requires_restart: false,
    type: 'integer',
  },
  valkey_timeout: {
    default: 300,
    description: 'Valkey idle connection timeout in seconds',
    maximum: 2073600,
    minimum: 0,
    requires_restart: false,
    type: 'integer',
  },
};

export const databaseEngineConfigFactory = Factory.each(
  (i) =>
    [mysqlConfigResponse, postgresConfigResponse, valkeyConfigResponse][i - 1] // Access first config response by providing 0 to build. Factory index starts at 1 due to factoryProxyHandler
);
