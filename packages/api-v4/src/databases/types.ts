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

export type Engine = 'mysql' | 'postgresql' | 'mongodb' | 'redis';

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
  | 'provisioning'
  | 'resizing'
  | 'restoring'
  | 'resuming'
  | 'suspended'
  | 'suspending';

export type DatabaseBackupType = 'snapshot' | 'auto';

export interface DatabaseBackup {
  id: number;
  type: DatabaseBackupType;
  label: string;
  created: string;
}

export interface DatabaseFork {
  source: number;
  restore_time?: string;
}

export interface DatabaseCredentials {
  username: string;
  password: string;
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
}

export type ClusterSize = 1 | 2 | 3;

type ReadonlyCount = 0 | 2;

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

type DriverTypes = 'jdbc' | 'odbc' | 'php' | 'python' | 'ruby' | 'node.js';
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
  /**
   * total_disk_size_gb is feature flagged by the API.
   * It may not be defined.
   */
  total_disk_size_gb?: number;
  /**
   * used_disk_size_gb is feature flagged by the API.
   * It may not be defined.
   */
  used_disk_size_gb?: number;
}

export interface MySQLDatabase extends BaseDatabase {
  /** @Deprecated used by rdbms-legacy only */
  replication_type?: MySQLReplicationType;
}

export type PostgresReplicationType = 'none' | 'synch' | 'asynch';

type ReplicationCommitTypes =
  | 'on'
  | 'local'
  | 'remote_write'
  | 'remote_apply'
  | 'off';

export interface PostgresDatabase extends BaseDatabase {
  /** @Deprecated used by rdbms-legacy only */
  replication_type?: PostgresReplicationType;
  /** @Deprecated used by rdbms-legacy only */
  replication_commit_type?: ReplicationCommitTypes;
}

type MongoStorageEngine = 'wiredtiger' | 'mmapv1';
type MongoCompressionType = 'none' | 'snappy' | 'zlib';
export interface MongoDatabase extends BaseDatabase {
  storage_engine: MongoStorageEngine;
  compression_type: MongoCompressionType;
  replica_set: string | null;
  peers: string[];
}

export type ComprehensiveReplicationType = MySQLReplicationType &
  PostgresReplicationType;

export type Database = BaseDatabase &
  Partial<MySQLDatabase> &
  Partial<PostgresDatabase> &
  Partial<MongoDatabase>;

export interface UpdateDatabasePayload {
  cluster_size?: number;
  label?: string;
  allow_list?: string[];
  updates?: UpdatesSchedule;
  type?: string;
  version?: string;
}
