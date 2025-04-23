import { BaseType } from '../linodes/types';

export type DatabaseTypeClass = 'standard' | 'dedicated' | 'nanode' | 'premium';

export type Platform = 'rdbms-default' | 'rdbms-legacy';

export interface DatabasePriceObject {
  monthly: number;
  hourly: number;
}

export interface DatabaseClusterSizeObject {
  quantity: number;
  price: DatabasePriceObject;
}

export type Engines = Record<Engine, DatabaseClusterSizeObject[]>;
export interface DatabaseType extends BaseType {
  class: DatabaseTypeClass;
  engines: Engines;
}

export type Engine = 'mysql' | 'postgresql';

export interface DatabaseEngine {
  id: string;
  engine: Engine;
  version: string;
  deprecated?: boolean;
}

export type DatabaseStatus =
  | 'active'
  | 'degraded'
  | 'failed'
  | 'migrating'
  | 'migrated'
  | 'provisioning'
  | 'resizing'
  | 'restoring'
  | 'resuming'
  | 'suspended'
  | 'suspending';
/** @deprecated TODO (UIE-8214) remove after migration */
export type DatabaseBackupType = 'snapshot' | 'auto';
/** @deprecated TODO (UIE-8214) remove after migration */
export interface DatabaseBackup {
  created: string;
  id: number;
  label: string;
  type: DatabaseBackupType;
}

export interface ConfigurationItem {
  description?: string;
  enum?: string[];
  example?: boolean | number | string;
  maximum?: number; // max value for the number input
  maxLength?: number; // max length for the text input
  minimum?: number; // min value for the number input
  minLength?: number; // min length for the text input
  pattern?: string;
  requires_restart?: boolean;
  type?: [string, null] | string | string[];
}

export type ConfigValue = boolean | number | string;

export type ConfigCategoryValues = Record<string, ConfigValue>;
export type DatabaseEngineConfig = Record<
  string,
  ConfigurationItem | Record<string, ConfigurationItem>
>;
export interface DatabaseInstanceAdvancedConfig {
  [category: string]: ConfigCategoryValues | ConfigValue;
}
export interface DatabaseFork {
  restore_time?: string;
  source: number;
}

export interface DatabaseCredentials {
  password: string;
  username: string;
}

interface DatabaseHosts {
  primary: string;
  secondary?: string;
  standby?: string;
}

export interface SSLFields {
  ca_certificate: string;
}

type MemberType = 'primary' | 'failover';

// DatabaseInstance is the interface for the shape of data returned by the /databases/instances endpoint.
export interface DatabaseInstance {
  allow_list: string[];
  cluster_size: ClusterSize;
  connection_strings: ConnectionStrings[];
  created: string;
  /** @Deprecated used by rdbms-legacy only, rdbms-default always encrypts */
  encrypted: boolean;
  engine: Engine;
  hosts: DatabaseHosts;
  id: number;
  instance_uri?: string;
  label: string;
  /**
   * A key/value object where the key is an IP address and the value is a member type.
   */
  members: Record<string, MemberType>;
  oldest_restore_time?: string;
  platform?: Platform;
  readonly_count?: ReadonlyCount;
  region: string;
  status: DatabaseStatus;
  type: string;
  updated: string;
  updates: UpdatesSchedule;
  version: string;
  engine_config: DatabaseInstanceAdvancedConfig;
}

export type ClusterSize = 1 | 2 | 3;

type ReadonlyCount = 0 | 2;

/** @deprecated TODO (UIE-8214) remove POST GA */
export type MySQLReplicationType = 'none' | 'semi_synch' | 'asynch';

export interface CreateDatabasePayload {
  allow_list?: string[];
  cluster_size?: ClusterSize;
  /** @Deprecated used by rdbms-legacy only, rdbms-default always encrypts */
  encrypted?: boolean;
  engine?: Engine;
  label: string;
  region: string;
  /** @Deprecated used by rdbms-legacy only */
  replication_type?: MySQLReplicationType | PostgresReplicationType;
  /** @Deprecated used by rdbms-legacy only, rdbms-default always uses TLS */
  ssl_connection?: boolean;
  type: string;
}

/** @deprecated TODO (UIE-8214) remove POST GA */
type DriverTypes = 'jdbc' | 'odbc' | 'php' | 'python' | 'ruby' | 'node.js';

/** @deprecated TODO (UIE-8214) remove POST GA */
interface ConnectionStrings {
  driver: DriverTypes;
  value: string;
}

export type UpdatesFrequency = 'weekly' | 'monthly';

export interface UpdatesSchedule {
  day_of_week: number;
  duration: number;
  frequency: UpdatesFrequency;
  hour_of_day: number;
  pending?: PendingUpdates[];
  week_of_month: number | null;
}

/**
 * Maintenance/patches for the next maintenance window
 * @since V2GA */
export interface PendingUpdates {
  /**
   * Optional ISO-8601 UTC timestamp
   * describing the point in time by which a mandatory update must be applied.
   * Not all updates have deadlines.
   */
  deadline: string | null;
  description: string;
  /**
   * Optional ISO-8601 UTC timestamp
   * describing the maintenance window in which the update is planned to be applied.
   * Users may trigger these updates outside a scheduled maintenance window by calling the patch API.
   */
  planned_for: string | null;
}

// Database is the base interface for the shape of data returned by /databases/{engine}/instances
interface BaseDatabase extends DatabaseInstance {
  port: number;
  /** @Deprecated used by rdbms-legacy only, rdbms-default always uses TLS */
  ssl_connection: boolean;
  total_disk_size_gb: number;
  used_disk_size_gb: number | null;
}

/** @deprecated TODO (UIE-8214) remove POST GA */
export interface MySQLDatabase extends BaseDatabase {
  /** @Deprecated used by rdbms-legacy only */
  replication_type?: MySQLReplicationType;
}

/** @deprecated TODO (UIE-8214) remove POST GA */
export type PostgresReplicationType = 'none' | 'synch' | 'asynch';

/** @deprecated TODO (UIE-8214) remove POST GA */
export type ReplicationCommitTypes =
  | 'on'
  | 'local'
  | 'remote_write'
  | 'remote_apply'
  | 'off';

/** @deprecated TODO (UIE-8214) remove POST GA */
export interface PostgresDatabase extends BaseDatabase {
  /** @Deprecated used by rdbms-legacy only */
  replication_type?: PostgresReplicationType;
  /** @Deprecated used by rdbms-legacy only */
  replication_commit_type?: ReplicationCommitTypes;
}

/** @deprecated TODO (UIE-8214) remove POST GA */
export type ComprehensiveReplicationType = MySQLReplicationType &
  PostgresReplicationType;

export type Database = BaseDatabase &
  Partial<MySQLDatabase> &
  Partial<PostgresDatabase>;

export interface UpdateDatabasePayload {
  cluster_size?: number;
  label?: string;
  allow_list?: string[];
  updates?: UpdatesSchedule;
  type?: string;
  version?: string;
  engine_config?: DatabaseInstanceAdvancedConfig;
}
