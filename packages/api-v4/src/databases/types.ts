export type DatabaseAvailability = 'standard' | 'high';

export type DatabaseStatus = 'initializing' | 'ready' | 'error' | 'unknown';

export type DatabaseBackupStatus =
  | 'running'
  | 'started'
  | 'failed'
  | 'succeeded'
  | 'unknown';

export interface DatabaseMaintenanceSchedule {
  day:
    | 'Sunday'
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday';
  window: string;
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
