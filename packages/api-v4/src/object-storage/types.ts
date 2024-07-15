export type ObjEndpointTypes = 'E0' | 'E1' | 'E2' | 'E3';

export interface ObjAccessKeyRegionsResponse {
  id: string;
  s3_endpoint: string;
  endpoint_type?: ObjEndpointTypes;
}

export interface ObjectStorageKey {
  access_key: string;
  bucket_access: Scope[] | null;
  id: number;
  label: string;
  limited: boolean;
  regions: ObjAccessKeyRegionsResponse[];
  secret_key: string;
}

export type AccessType = 'read_only' | 'read_write' | 'none';

export interface Scope {
  bucket_name: string;
  permissions: AccessType;
  cluster: string;
  region?: string; // @TODO OBJ Multicluster: Remove optional indicator when API changes get released to prod
}

export interface ScopeRequest extends Omit<Scope, 'cluster'> {
  // @TODO OBJ Multicluster: Omit 'region' as well when API changes get released to prod
  cluster?: string;
  region?: string;
}

export interface ObjectStorageKeyRequest {
  label: string;
  bucket_access: Scope[] | null;
  regions?: string[];
}

export interface UpdateObjectStorageKeyRequest {
  label?: string;
  regions?: string[];
}

export interface ObjectStorageBucketRequestPayload {
  acl?: 'private' | 'public-read' | 'authenticated-read' | 'public-read-write';
  cluster?: string;
  cors_enabled?: boolean;
  label: string;
  region?: string;
  endpoint_type?: ObjEndpointTypes;
  /*
   @TODO OBJ Multicluster: 'region' will become required, and the 'cluster' field will be deprecated
   once the feature is fully rolled out in production as part of the process of cleaning up the 'objMultiCluster'
   feature flag.

   Until then, the API will accept either cluster or region, or both (provided they are the same value).
   The payload requires at least one of them though, which will be enforced via validation.
  */
}

export interface ObjectStorageDeleteBucketRequestPayload {
  cluster: string;
  label: string;
}

export interface ObjectStorageBucket {
  region: string;
  label: string;
  created: string;
  cluster: string;
  hostname: string;
  objects: number;
  size: number; // Size of bucket in bytes
  s3_endpoint?: string;
  endpoint_type?: ObjEndpointTypes;
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

export interface ObjectStorageEndpointsResponse {
  region: string;
  endpoint_type: ObjEndpointTypes;
  s3_endpoint: string | null;
}

export type ACLType =
  | 'private'
  | 'public-read'
  | 'authenticated-read'
  | 'public-read-write'
  | 'custom';

// Gen2 endpoints ('E2', 'E3') are not supported and will return null.
export interface ObjectStorageObjectACL {
  acl: ACLType | null;
  acl_xml: string | null;
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

// Gen2 endpoints ('E2', 'E3') are not supported and will return null.
export interface ObjectStorageBucketSSLResponse {
  ssl: boolean | null;
}

export interface ObjectStorageBucketAccessRequest {
  acl?: Omit<ACLType, 'custom'>;
  cors_enabled?: boolean;
}

export interface ObjBucketAccessPayload {
  acl: ACLType;
  cors_enabled?: boolean;
}

// Gen2 endpoints ('E2', 'E3') are not supported and will return null.
export interface ObjectStorageBucketAccessResponse {
  acl: ACLType;
  acl_xml: string;
  cors_enabled: boolean | null;
  cors_xml: string | null;
}
