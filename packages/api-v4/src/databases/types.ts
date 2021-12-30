import { LinodeTypeClass } from '@linode/api-v4/lib/linodes/types';

export interface DatabaseType {
  id: string;
  label: string;
  class: LinodeTypeClass;
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
    failover: {
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
  id: number;
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

// DatabaseInstance is the interface for the shape of data returned by the /databases/instances endpoint.
export interface DatabaseInstance {
  id: number;
  label: string;
  engine: Engine;
  type: string;
  region: string;
  version: string;
  status: DatabaseStatus;
  failover_count: number;
  updated: string;
  created: string;
  instance_uri: string;
}

type FailoverCount = 1 | 3;

export type ReplicationType = 'none' | 'semi-synch' | 'asynch';

export interface CreateDatabasePayload {
  label: string;
  region: string;
  type: string;
  failover_count?: FailoverCount;
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

// Database is the interface for the shape of data returned by /databases/{engine}/instances
export interface Database {
  id: number;
  label: string;
  region: string;
  status: DatabaseStatus;
  type: string;
  failover_count: FailoverCount;
  engine: Engine;
  encrypted: boolean;
  ipv4_public: string;
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
