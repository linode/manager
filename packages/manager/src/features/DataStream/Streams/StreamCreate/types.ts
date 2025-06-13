export const destinationType = {
  CustomHttps: 'custom_https',
  LinodeObjectStorage: 'linode_object_storage',
} as const;

export type DestinationType =
  (typeof destinationType)[keyof typeof destinationType];

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

export const streamType = {
  AuditLogs: 'audit_logs',
  ErrorLogs: 'error_logs',
} as const;

export type StreamType = (typeof streamType)[keyof typeof streamType];

export const streamStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

export type StreamStatus = (typeof streamStatus)[keyof typeof streamStatus];

export const eventType = {
  Authentication: 'authn',
  Authorization: 'authz',
  Configuration: 'configuration',
} as const;

export type EventType = (typeof eventType)[keyof typeof eventType];

export interface CreateStreamForm extends CreateDestinationForm {
  [eventType.Authentication]: boolean;
  [eventType.Authorization]: boolean;
  [eventType.Configuration]: boolean;
  destination_id: number;
  label: string;
  status: StreamStatus;
  type: StreamType;
}
