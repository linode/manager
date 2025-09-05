export const streamStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

export type StreamStatus = (typeof streamStatus)[keyof typeof streamStatus];

export const streamType = {
  AuditLogs: 'audit_logs',
  LKEAuditLogs: 'lke_audit_logs',
} as const;

export type StreamType = (typeof streamType)[keyof typeof streamType];

export interface AuditData {
  created: string;
  created_by: string;
  updated: string;
  updated_by: string;
}

export interface Stream extends AuditData {
  destinations: Destination[];
  details: StreamDetails;
  id: number;
  label: string;
  primary_destination_id: number;
  status: StreamStatus;
  stream_audit_id: number;
  type: StreamType;
  version: string;
}

export interface StreamDetails {
  cluster_ids?: number[];
  is_auto_add_all_clusters_enabled?: boolean;
}

export const destinationType = {
  CustomHttps: 'custom_https',
  LinodeObjectStorage: 'linode_object_storage',
} as const;

export type DestinationType =
  (typeof destinationType)[keyof typeof destinationType];

export interface Destination extends AuditData {
  details: DestinationDetails;
  id: number;
  label: string;
  type: DestinationType;
  version: string;
}

export type DestinationDetails =
  | CustomHTTPsDetails
  | LinodeObjectStorageDetails;

export interface LinodeObjectStorageDetails {
  access_key_id: string;
  access_key_secret: string;
  bucket_name: string;
  host: string;
  path: string;
  region: string;
}

type ContentType = 'application/json' | 'application/json; charset=utf-8';
type DataCompressionType = 'gzip' | 'None';

export interface CustomHTTPsDetails {
  authentication: Authentication;
  client_certificate_details?: ClientCertificateDetails;
  content_type: ContentType;
  custom_headers?: CustomHeader[];
  data_compression: DataCompressionType;
  endpoint_url: string;
}

interface ClientCertificateDetails {
  client_ca_certificate: string;
  client_certificate: string;
  client_private_key: string;
  tls_hostname: string;
}

type AuthenticationType = 'basic' | 'none';

interface Authentication {
  details?: AuthenticationDetails;
  type: AuthenticationType;
}

interface AuthenticationDetails {
  basic_authentication_password: string;
  basic_authentication_user: string;
}

interface CustomHeader {
  name: string;
  value: string;
}

export interface CreateStreamPayload {
  destinations: number[];
  details: StreamDetails;
  label: string;
  status?: StreamStatus;
  type: StreamType;
}

export interface UpdateStreamPayload {
  destinations: number[];
  details: StreamDetails;
  label: string;
  status: StreamStatus;
  type: StreamType;
}

export interface UpdateStreamPayloadWithId extends UpdateStreamPayload {
  id: number;
}

export interface CreateDestinationPayload {
  details: CustomHTTPsDetails | LinodeObjectStorageDetails;
  label: string;
  type: DestinationType;
}

export type UpdateDestinationPayload = CreateDestinationPayload;

export interface UpdateDestinationPayloadWithId
  extends UpdateDestinationPayload {
  id: number;
}
