import { BaseType } from '../linodes/types';

export type DatabaseTypeClass = 'standard' | 'dedicated' | 'nanode';

export interface DatabasePriceObject {
  monthly: number;
  hourly: number;
}

interface DatabaseClusterSizeObject {
  quantity: number;
  price: DatabasePriceObject;
}

interface Engines {
  [engineType: string]: DatabaseClusterSizeObject[];
}
export interface DatabaseType extends Omit<BaseType, 'transfer'> {
  class: DatabaseTypeClass;
  engines: Engines;
  transfer?: number;
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

export type ReplicationType = 'none' | 'semi_synch' | 'asynch';

export interface CreateDatabasePayload {
  label: string;
  region: string;
  type: string;
  cluster_size?: ClusterSize;
  engine?: Engine;
  encrypted?: boolean;
  ssl_connection?: boolean;
  replication_type: ReplicationType;
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

// Database is the interface for the shape of data returned by /databases/{engine}/instances
export interface Database {
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
  ipv4_public: string;
  ssl_connection: boolean;
  replication_type: ReplicationType;
  allow_list: string[];
  connection_strings: ConnectionStrings[];
  created: string;
  updated: string;
  hosts: DatabaseHosts;
  port: number;
  updates: UpdatesSchedule;
}

export interface UpdateDatabasePayload {
  label?: string;
  allow_list?: string[];
  updates?: UpdatesSchedule;
}

export interface UpdateDatabaseResponse {
  label: string;
  allow_list: string[];
}
