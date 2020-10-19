export interface DatabaseType {
  id: number;
  label: string;
  price: {
    hourly: number;
    monthly: number;
  };
  memory: number;
  disk: number;
  transfer: number | null;
  vcpus: number;
  availability: DatabaseAvailability;
}

export type DatabaseAvailability = 'standard' | 'high';

export type DatabaseStatus = 'initializing' | 'ready' | 'error' | 'unknown';

export type DatabaseBackupStatus =
  | 'running'
  | 'started'
  | 'failed'
  | 'succeeded'
  | 'unknown';

export interface DatabaseBackup {
  id: number;
  status: DatabaseBackupStatus;
  created: string;
  finished: string;
}

export interface DatabaseMaintenanceSchedule {
  day:
    | 'Sunday'
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday';
  window:
    | 'W0'
    | 'W2'
    | 'W4'
    | 'W6'
    | 'W8'
    | 'W10'
    | 'W12'
    | 'W14'
    | 'W16'
    | 'W18'
    | 'W20'
    | 'W22';
}

export interface DatabaseConnection {
  host: string;
  port: number;
}

export interface Database {
  id: number;
  label: string;
  tags: string[];
  status: DatabaseStatus;
  maintenance_schedule: DatabaseMaintenanceSchedule;
  vcpus: number;
  memory: number;
  disk: number;
  availability: DatabaseAvailability;
  updated: string;
  created: string;
}

export interface CreateDatabasePayload {
  label?: string;
  tags?: string[];
  maintenance_schedule?: DatabaseMaintenanceSchedule;
  type: string;
  root_password: string;
}

export interface UpdateDatabasePayload {
  label?: string;
  tags?: string[];
  maintenance_schedule?: DatabaseMaintenanceSchedule;
}
