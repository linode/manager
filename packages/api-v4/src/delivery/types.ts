export const streamStatus = {
  Active: 'active',
  Inactive: 'inactive',
  Provisioning: 'provisioning',
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
  destinations: DestinationCore[];
  details: StreamDetailsType;
  id: number;
  label: string;
  status: StreamStatus;
  type: StreamType;
  version: string;
}

export interface StreamDetails {
  cluster_ids?: number[];
  is_auto_add_all_clusters_enabled?: boolean;
}

export type StreamDetailsType = null | StreamDetails;

export const destinationType = {
  CustomHttps: 'custom_https',
  AkamaiObjectStorage: 'akamai_object_storage',
} as const;

export type DestinationType =
  (typeof destinationType)[keyof typeof destinationType];

export interface DestinationCore {
  details: DestinationDetails;
  id: number;
  label: string;
  type: DestinationType;
}

export interface Destination extends DestinationCore, AuditData {
  version: string;
}

export type DestinationDetails =
  | AkamaiObjectStorageDetails
  | CustomHTTPSDetails;

export interface AkamaiObjectStorageDetails {
  access_key_id: string;
  bucket_name: string;
  host: string;
  path: string;
}

export interface AkamaiObjectStorageDetailsExtended
  extends AkamaiObjectStorageDetails {
  access_key_secret: string;
}

export const contentType = {
  Json: 'application/json',
  JsonUtf8: 'application/json; charset=utf-8',
} as const;

export type ContentType = (typeof contentType)[keyof typeof contentType] | null;

export const dataCompressionType = {
  Gzip: 'gzip',
  None: 'None',
} as const;

export type DataCompressionType =
  (typeof dataCompressionType)[keyof typeof dataCompressionType];

export interface CustomHTTPSDetails {
  authentication: Authentication;
  client_certificate_details?: ClientCertificateDetails;
  content_type?: ContentType;
  custom_headers?: CustomHeader[];
  data_compression: DataCompressionType;
  endpoint_url: string;
}

export interface CustomHTTPSDetailsExtended extends CustomHTTPSDetails {
  authentication: Authentication & {
    details?: AuthenticationDetailsExtended;
  };
}

interface ClientCertificateDetails {
  client_ca_certificate?: string;
  client_certificate?: string;
  client_private_key?: string;
  tls_hostname?: string;
}

export const authenticationType = {
  Basic: 'basic',
  None: 'none',
} as const;

export type AuthenticationType =
  (typeof authenticationType)[keyof typeof authenticationType];

interface Authentication {
  details?: AuthenticationDetails;
  type: AuthenticationType;
}

interface AuthenticationDetails {
  basic_authentication_user: string;
}

interface AuthenticationDetailsExtended extends AuthenticationDetails {
  basic_authentication_password: string;
}

export interface CustomHeader {
  name: string;
  value: string;
}

export interface CreateStreamPayload {
  destinations: number[];
  details?: StreamDetailsType;
  label: string;
  status?: StreamStatus;
  type: StreamType;
}

export interface UpdateStreamPayload {
  destinations: number[];
  details?: StreamDetailsType;
  label: string;
  status: StreamStatus;
}

export interface UpdateStreamPayloadWithId extends UpdateStreamPayload {
  id: number;
}

export interface AkamaiObjectStorageDetailsPayload
  extends Omit<AkamaiObjectStorageDetailsExtended, 'path'> {
  path?: string;
}

export type DestinationDetailsPayload =
  | AkamaiObjectStorageDetailsPayload
  | CustomHTTPSDetailsExtended;

export interface CreateDestinationPayload {
  details: DestinationDetailsPayload;
  label: string;
  type: DestinationType;
}

export type UpdateDestinationPayload = Omit<CreateDestinationPayload, 'type'>;

export interface UpdateDestinationPayloadWithId
  extends UpdateDestinationPayload {
  id: number;
}
