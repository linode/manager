export interface DatabaseType {
  id: string;
  label: string;
  price: {
    hourly: number;
    monthly: number;
  };
  memory: number;
  transfer: number;
  disk: number;
  vcpus: number;
  deprecated: boolean;
  addons: {
    fallover_node: {
      price: {
        monthly: number;
        hourly: number;
      };
    };
  };
}

export type Engine = 'mysql';
export interface DatabaseVersion {
  id: string;
  label: string;
  engine: Engine;
  version: string;
  deprecated: boolean;
}

export type DatabaseStatus =
  | 'creating'
  | 'running'
  | 'failed'
  | 'degraded'
  | 'updating';

export type DatabaseBackupType = 'snapshot' | 'auto';

export interface DatabaseBackup {
  id: string;
  type: DatabaseBackupType;
  label: string;
  created: string;
}

export interface DatabaseCredentials {
  username: string;
  password: string;
}

export interface SSLFields {
  public_key: string | null;
  certificate: string | null;
}

export interface Database {
  id: number;
  label: string;
  engine: Engine;
  type: DatabaseType;
  region: string;
  version: string;
  status: DatabaseStatus;
  updated: string;
  created: string;
  instance_uri: string;
}

type StandbyCount = 1 | 3;
export type ReplicationType = 'none' | 'semi-synch' | 'asynch';
export interface CreateDatabasePayload {
  label: string;
  region: string;
  type: string;
  standby_count?: StandbyCount;
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
export interface CreateDatabaseResponse {
  id: number;
  label: string;
  region: string;
  status: DatabaseStatus;
  type: string;
  standby_count: StandbyCount;
  engine: Engine;
  encrypted: boolean;
  ipv4_public: string[];
  port: string;
  ssl_connection: boolean;
  replication_type: ReplicationType;
  allow_list: string[];
  connection_strings: ConnectionStrings[];
  created: string;
  updated: string;
}

export interface UpdateDatabasePayload {
  label?: string;
  allow_list?: string[];
}

export interface UpdateDatabaseResponse {
  label: string;
  allow_list: string[];
}
