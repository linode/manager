export type ObjectStorageEndpointTypes = 'E0' | 'E1' | 'E2' | 'E3';

export interface ObjectStorageKeyRegions {
  /**
   * The type specifying which generation of endpoint this is.
   */
  endpoint_type?: ObjectStorageEndpointTypes;
  /**
   * Region ID (e.g. 'us-east')
   */
  id: string;
  /**
   * The hostname prefix for the region (e.g. 'us-east-1.linodeobjects.com')
   */
  s3_endpoint: string;
}

export interface ObjectStorageKey {
  /**
   * A unique string assigned by the API to identify this key, used as a username for S3 API requests.
   */
  access_key: string;
  /**
   * Settings that restrict access to specific buckets, each with defined permission levels.
   */
  bucket_access: null | ObjectStorageKeyBucketAccess[];
  /**
   * This Object Storage key's unique ID.
   */
  id: number;
  /**
   * The label given to this key. For display purposes only.
   */
  label: string;
  /**
   * Indicates if this Object Storage key restricts access to specific buckets and permissions.
   */
  limited: boolean;
  /**
   * Each region where this key is valid.
   */
  regions: ObjectStorageKeyRegions[];
  /**
   * The secret key used to authenticate this Object Storage key with the S3 API.
   */
  secret_key: string;
}

export type ObjectStorageKeyBucketAccessPermissions =
  | 'none'
  | 'read_only'
  | 'read_write';

export interface ObjectStorageKeyBucketAccess {
  bucket_name: string;
  cluster: string;
  permissions: ObjectStorageKeyBucketAccessPermissions;
  region?: string; // @TODO OBJ Multicluster: Remove optional indicator when API changes get released to prod
}

export interface CreateObjectStorageKeyPayload {
  bucket_access: null | ObjectStorageKeyBucketAccess[];
  label: string;
  regions?: string[];
}

export interface UpdateObjectStorageKeyPayload {
  label?: string;
  regions?: string[];
}

export interface CreateObjectStorageBucketPayload {
  acl?: 'authenticated-read' | 'private' | 'public-read' | 'public-read-write';
  cluster?: string;
  cors_enabled?: boolean;
  /**
   * To explicitly create a bucket on a specific endpoint type.
   */
  endpoint_type?: ObjectStorageEndpointTypes;
  label: string;
  region?: string;
  /**
   * Used to create a bucket on a specific already-assigned S3 endpoint.
   */
  s3_endpoint?: string;
  /*
   @TODO OBJ Multicluster: 'region' will become required, and the 'cluster' field will be deprecated
   once the feature is fully rolled out in production as part of the process of cleaning up the 'objMultiCluster'
   feature flag.

   Until then, the API will accept either cluster or region, or both (provided they are the same value).
   The payload requires at least one of them though, which will be enforced via validation.
  */
}

export interface DeleteObjectStorageBucketPayload {
  cluster: string;
  label: string;
}

export interface ObjectStorageBucket {
  cluster: string;
  created: string;
  endpoint_type?: ObjectStorageEndpointTypes;
  hostname: string;
  label: string;
  objects: number;
  region?: string;
  s3_endpoint?: string;
  size: number; // Size of bucket in bytes
}

export interface ObjectStorageObject {
  etag: null | string;
  last_modified: null | string; // Date
  name: string;
  owner: null | string;
  size: null | number; // Size of object in bytes
}

export interface ObjectStorageObjectURL {
  exists: boolean; // TODO: This doesn't appear documented in API docs
  url: string;
}

export interface ObjectStorageEndpoint {
  endpoint_type: ObjectStorageEndpointTypes;
  region: string;
  s3_endpoint: null | string;
}

export type ACLType =
  | 'authenticated-read'
  | 'custom'
  | 'private'
  | 'public-read'
  | 'public-read-write';

// Gen2 endpoints ('E2', 'E3') are not supported and will return null.
export interface ObjectStorageObjectACL {
  acl: ACLType | null;
  acl_xml: null | string;
}

export interface CreateObjectStorageObjectURLPayload {
  content_disposition?: 'attachment';
  // "Content-Type" is normally an HTTP header, but here it is used in the body
  // of a request to /object-url, to inform the API which kind of file it is
  // we're trying to upload.
  content_type?: string;
  expires_in?: number;
}

// Enum containing IDs for each Cluster
export type ObjectStorageClusterID =
  | 'ap-south-1'
  | 'eu-central-1'
  | 'pl-labkrk2-1'
  | 'us-east-1'
  | 'us-southeast-1';

export interface ObjectStorageCluster {
  domain: string;
  id: ObjectStorageClusterID;
  region: string;
  static_site_domain: string;
  status: string; // @todo: should be enum
}

export interface GetObjectStorageObjectListPayload {
  bucket: string;
  clusterId: string;
  params?: ObjectStorageObjectListParams;
}

interface ObjectStorageObjectListParams {
  delimiter?: string;
  marker?: string;
  page_size?: number;
  prefix?: string;
}

export interface ObjectStorageObjectList {
  data: ObjectStorageObject[];
  is_truncated: boolean;
  next_marker: null | string;
}

export interface CreateObjectStorageBucketSSLPayload {
  certificate: string;
  private_key: string;
}

// Gen2 endpoints ('E2', 'E3') are not supported and will return null.
export interface ObjectStorageBucketSSL {
  ssl: boolean | null;
}

export interface UpdateObjectStorageBucketAccessPayload {
  acl?: ACLType;
  cors_enabled?: boolean;
}

export interface GetObjectStorageACLPayload {
  bucket: string;
  clusterId: string;
  params: {
    name: string;
  };
}

// Gen2 endpoints ('E2', 'E3') are not supported and will return null.
export interface ObjectStorageBucketAccess {
  acl: ACLType;
  acl_xml: string;
  cors_enabled: boolean | null;
  cors_xml: null | string;
}
