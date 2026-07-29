import type { BaseType } from '../linodes/types';

export type DatabaseTypeClass = 'dedicated' | 'nanode' | 'premium' | 'standard';

export interface DatabasePriceObject {
  hourly: number;
  monthly: number;
}

export interface DatabaseClusterSizeObject {
  price: DatabasePriceObject;
  quantity: number;
}

export type Engines = {
  mysql?: DatabaseClusterSizeObject[];
  postgresql?: DatabaseClusterSizeObject[];
  valkey?: DatabaseClusterSizeObject[];
};

export interface DatabaseType extends BaseType {
  class: DatabaseTypeClass;
  engines: Engines;
}

export type Engine = 'mysql' | 'postgresql' | 'valkey';

export interface DatabaseEngine {
  deprecated?: boolean;
  engine: Engine;
  id: string;
  version: string;
}

export type DatabaseStatus =
  | 'active'
  | 'degraded'
  | 'migrated'
  | 'migrating'
  | 'provisioning'
  | 'resizing'
  | 'restoring'
  | 'resuming'
  | 'suspended'
  | 'suspending';

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
  type?: [number, null] | [string, null] | string | string[];
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

export interface DatabaseBackupsPayload {
  fork: DatabaseFork;
  private_network?: null | PrivateNetwork;
  region?: string;
}

export interface DatabaseCredentials {
  password: string;
  username: string;
}

export type HostEndpointRole =
  | 'primary'
  | 'primary-connection-pool'
  | 'standby'
  | 'standby-connection-pool';

export interface HostEndpoint {
  address: string;
  port: number;
  public_access: boolean;
  role: HostEndpointRole;
}

interface DatabaseHosts {
  endpoints: HostEndpoint[];
  primary: string;
  secondary?: string;
  standby?: string;
}

export interface SSLFields {
  ca_certificate: string;
}

type MemberType = 'failover' | 'primary';

// DatabaseInstance is the interface for the shape of data returned by the /databases/instances endpoint.
export interface DatabaseInstance {
  allow_list: string[];
  available_restore_times: null | string[]; // Used by the Valkey database engine, will be returned as null for PostgreSQL and MySQL database engines
  cluster_size: ClusterSize;
  created: string;
  engine: Engine;
  engine_config: DatabaseInstanceAdvancedConfig;
  hosts: DatabaseHosts | null;
  id: number;
  instance_uri?: string;
  label: string;
  /**
   * A key/value object where the key is an IP address and the value is a member type.
   */
  members: Record<string, MemberType>;
  oldest_restore_time?: null | string; // Used by PostgreSQL and MySQL database engines, will be returned as null for the Valkey database engine
  platform?: 'rdbms-default';
  readonly_count?: ReadonlyCount;
  region: string;
  status: DatabaseStatus;
  type: string;
  updated: string;
  updates: UpdatesSchedule;
  version: string;
}

export type ClusterSize = 1 | 2 | 3;

export interface PrivateNetwork {
  public_access?: boolean;
  subnet_id: null | number;
  vpc_id: null | number;
}

type ReadonlyCount = 0 | 2;

export interface CreateDatabasePayload {
  allow_list: string[];
  cluster_size?: ClusterSize;
  engine?: Engine;
  label: string;
  private_network?: null | PrivateNetwork; //  TODO (UIE-8831): Remove optional (?) post VPC release, since it will always be in create payload
  region: string;
  type: string;
}

export interface UpdatesSchedule {
  day_of_week: number;
  duration: number;
  frequency: 'monthly' | 'weekly';
  hour_of_day: number;
  pending?: PendingUpdates[];
  week_of_month: null | number;
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
  deadline: null | string;
  description: string;
  /**
   * Optional ISO-8601 UTC timestamp
   * describing the maintenance window in which the update is planned to be applied.
   * Users may trigger these updates outside a scheduled maintenance window by calling the patch API.
   */
  planned_for: null | string;
}

// Database is the base interface for the shape of data returned by /databases/{engine}/instances
export interface Database extends DatabaseInstance {
  port: number;
  private_network?: null | PrivateNetwork; //  TODO (UIE-8831): Confirm whether this still needs to be optional (?) post VPC release.
  ssl_connection: boolean;
  total_disk_size_gb: number;
  used_disk_size_gb: null | number;
}

export interface UpdateDatabasePayload {
  allow_list?: string[];
  cluster_size?: number;
  engine_config?: DatabaseInstanceAdvancedConfig;
  label?: string;
  private_network?: null | PrivateNetwork;
  type?: string;
  updates?: UpdatesSchedule;
  version?: string;
}

export type PoolMode = 'session' | 'statement' | 'transaction';

export interface ConnectionPool {
  database: string;
  label: string;
  mode: PoolMode;
  size: number;
  username: null | string; // null represents reuse inbound user
}
