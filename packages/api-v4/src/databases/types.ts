import { BaseType } from '../linodes/types';

export type DatabaseTypeClass = 'standard' | 'dedicated' | 'nanode' | 'premium';

export interface DatabasePriceObject {
  monthly: number;
  hourly: number;
}

export interface DatabaseClusterSizeObject {
  quantity: number;
  price: DatabasePriceObject;
}

type Engines = Record<Engine, DatabaseClusterSizeObject[]>;
export interface DatabaseType extends BaseType {
  class: DatabaseTypeClass;
  engines: Engines;
}

export type Engine = 'mysql' | 'postgresql' | 'mongodb' | 'redis';

export interface DatabaseEngine {
  id: string;
  engine: Engine;
  version: string;
  deprecated: boolean;
}

export type DatabaseStatus =
  | 'provisioning'
  | 'active'
  | 'suspending'
  | 'suspended'
  | 'resuming'
  | 'restoring'
  | 'failed'
  | 'degraded';

export type DatabaseBackupType = 'snapshot' | 'auto';

export interface DatabaseBackup {
  id: number;
  type: DatabaseBackupType;
  label: string;
  created: string;
}

export interface DatabaseCredentials {
  username: string;
  password: string;
}

interface DatabaseHosts {
  primary: string;
  secondary: string;
}

export interface SSLFields {
  ca_certificate: string;
}

// DatabaseInstance is the interface for the shape of data returned by the /databases/instances endpoint.
export interface DatabaseInstance {
  id: number;
  label: string;
  engine: Engine;
  type: string;
  region: string;
  version: string;
  status: DatabaseStatus;
  cluster_size: ClusterSize;
  updated: string;
  created: string;
  instance_uri: string;
  hosts: DatabaseHosts;
}

export type ClusterSize = 1 | 3;
type ReadonlyCount = 0 | 2;

export type MySQLReplicationType = 'none' | 'semi_synch' | 'asynch';

export interface CreateDatabasePayload {
  label: string;
  region: string;
  type: string;
  cluster_size?: ClusterSize;
  engine?: Engine;
  encrypted?: boolean;
  ssl_connection?: boolean;
  replication_type?: MySQLReplicationType | PostgresReplicationType;
  allow_list?: string[];
}

type DriverTypes = 'jdbc' | 'odbc' | 'php' | 'python' | 'ruby' | 'node.js';
interface ConnectionStrings {
  driver: DriverTypes;
  value: string;
}

export type UpdatesFrequency = 'weekly' | 'monthly';
export interface UpdatesSchedule {
  frequency: UpdatesFrequency;
  duration: number;
  hour_of_day: number;
  day_of_week: number;
  week_of_month: number | null;
}

// Database is the base interface for the shape of data returned by /databases/{engine}/instances
export interface BaseDatabase {
  id: number;
  label: string;
  type: string;
  version: string;
  region: string;
  status: DatabaseStatus;
  cluster_size: ClusterSize;
  readonly_count?: ReadonlyCount;
  engine: Engine;
  encrypted: boolean;
  ssl_connection: boolean;
  allow_list: string[];
  connection_strings: ConnectionStrings[];
  created: string;
  updated: string;
  hosts: DatabaseHosts;
  port: number;
  updates: UpdatesSchedule;
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
  replication_type: MySQLReplicationType;
}

export type PostgresReplicationType = 'none' | 'synch' | 'asynch';

type ReplicationCommitTypes =
  | 'on'
  | 'local'
  | 'remote_write'
  | 'remote_apply'
  | 'off';

export interface PostgresDatabase extends BaseDatabase {
  replication_type: PostgresReplicationType;
  replication_commit_type: ReplicationCommitTypes;
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
  label?: string;
  allow_list?: string[];
  updates?: UpdatesSchedule;
}

export interface UpdateDatabaseResponse {
  label: string;
  allow_list: string[];
}
