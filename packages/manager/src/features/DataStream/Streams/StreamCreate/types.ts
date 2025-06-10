export enum StreamType {
  AuditLogs = 'audit_logs',
  ErrorLogs = 'error_logs',
}

export enum StreamStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum EventType {
  Authentication = 'authn',
  Authorization = 'authz',
  Configuration = 'configuration',
}

export interface CreateStreamForm {
  [EventType.Authentication]: boolean;
  [EventType.Authorization]: boolean;
  [EventType.Configuration]: boolean;
  destination_id: number;
  label: string;
  status: StreamStatus;
  type: StreamType;
}
