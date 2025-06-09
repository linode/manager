export enum DestinationType {
  CustomHttps = 'custom_https',
  LinodeObjectStorage = 'linode_object_storage',
}

export interface LinodeObjectStorageDetails {
  access_key_id: string;
  access_key_secret: string;
  bucket_name: string;
  host: string;
  path: string;
  region: string;
}

export type DestinationDetails = LinodeObjectStorageDetails; // Later a CustomHTTPsDetails type will be added

export interface CreateDestinationForm extends DestinationDetails {
  destination_label: string;
  destination_type: DestinationType;
}

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

export interface CreateStreamForm extends CreateDestinationForm {
  [EventType.Authentication]: boolean;
  [EventType.Authorization]: boolean;
  [EventType.Configuration]: boolean;
  destination_id: number;
  label: string;
  status: StreamStatus;
  type: StreamType;
}
