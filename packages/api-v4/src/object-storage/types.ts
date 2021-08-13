export interface ObjectStorageKey {
  access_key: string;
  id: number;
  label: string;
  secret_key: string;
  limited: boolean;
  bucket_access: Scope[] | null;
}

export type AccessType = 'read_only' | 'read_write' | 'none';
export interface Scope {
  bucket_name: string;
  cluster: string;
  permissions: AccessType;
}

export interface ObjectStorageKeyRequest {
  label: string;
  bucket_access: Scope[] | null;
}

export interface UpdateObjectStorageKeyRequest {
  label: string;
}

export interface ObjectStorageBucketRequestPayload {
  label: string;
  cluster: string;
  acl?: 'private' | 'public-read' | 'authenticated-read' | 'public-read-write';
  cors_enabled?: boolean;
}

export interface ObjectStorageDeleteBucketRequestPayload {
  cluster: string;
  label: string;
}

export interface ObjectStorageBucket {
  label: string;
  created: string;
  cluster: string;
  hostname: string;
  size: number; // Size of bucket in bytes
  objects: number;
}

export interface ObjectStorageObject {
  size: number | null; // Size of object in bytes
  owner: string | null;
  etag: string | null;
  last_modified: string | null; // Date
  name: string;
}

export interface ObjectStorageObjectURL {
  exists: boolean;
  url: string;
}

export type ACLType =
  | 'private'
  | 'public-read'
  | 'authenticated-read'
  | 'public-read-write'
  | 'custom';

export interface ObjectStorageObjectACL {
  acl: ACLType;
  acl_xml: string;
}

export interface ObjectStorageObjectURLOptions {
  expires_in?: number;
  // "Content-Type" is normally an HTTP header, but here it is used in the body
  // of a request to /object-url, to inform the API which kind of file it is
  // we're trying to upload.
  content_type?: string;
  content_disposition?: 'attachment';
}

// Enum containing IDs for each Cluster
export type ObjectStorageClusterID =
  | 'us-east-1'
  | 'eu-central-1'
  | 'ap-south-1'
  | 'us-southeast-1';

export interface ObjectStorageCluster {
  region: string;
  status: string; // @todo: should be enum
  id: ObjectStorageClusterID;
  domain: string;
  static_site_domain: string;
}

export interface ObjectStorageObjectListParams {
  delimiter?: string;
  marker?: string;
  prefix?: string;
  page_size?: number;
}

export interface ObjectStorageObjectListResponse {
  data: ObjectStorageObject[];
  next_marker: string | null;
  is_truncated: boolean;
}

export interface ObjectStorageBucketSSLRequest {
  certificate: string;
  private_key: string;
}

export interface ObjectStorageBucketSSLResponse {
  ssl: boolean;
}

export interface ObjectStorageBucketAccessRequest {
  acl?: Omit<ACLType, 'custom'>;
  cors_enabled?: boolean;
}

export interface ObjectStorageBucketAccessResponse {
  acl: ACLType;
  acl_xml: string;
  cors_enabled: boolean;
  cors_xml: string;
}
