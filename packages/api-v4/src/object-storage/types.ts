type ObjectStorageEndpointTypes = 'E0' | 'E1' | 'E2' | 'E3';

export interface ObjectStorageKeyRegions {
  id: string;
  s3_endpoint: string;
  endpoint_type?: ObjectStorageEndpointTypes;
}

export interface ObjectStorageKey {
  access_key: string;
  bucket_access: ObjectStorageKeyBucketAccess[] | null;
  id: number;
  label: string;
  limited: boolean;
  regions: ObjectStorageKeyRegions[];
  secret_key: string;
}

export type ObjectStorageKeyBucketAccessPermissions =
  | 'read_only'
  | 'read_write'
  | 'none';

export interface ObjectStorageKeyBucketAccess {
  bucket_name: string;
  permissions: ObjectStorageKeyBucketAccessPermissions;
  cluster: string;
  region?: string; // @TODO OBJ Multicluster: Remove optional indicator when API changes get released to prod
}

export interface CreateObjectStorageKeyPayload {
  label: string;
  bucket_access: ObjectStorageKeyBucketAccess[] | null;
  regions?: string[];
}

export interface UpdateObjectStorageKeyPayload {
  label?: string;
  regions?: string[];
}

export interface CreateObjectStorageBucketPayload {
  acl?: 'private' | 'public-read' | 'authenticated-read' | 'public-read-write';
  cluster?: string;
  cors_enabled?: boolean;
  label: string;
  region?: string;
  endpoint_type?: ObjectStorageEndpointTypes;
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
  /*
   @TODO OBJ Multicluster: 'region' will become required, and the 'cluster' field will be deprecated
   once the feature is fully rolled out in production as part of the process of cleaning up the 'objMultiCluster'
   feature flag.
  */
  region?: string;
  label: string;
  created: string;
  cluster: string;
  hostname: string;
  objects: number;
  size: number; // Size of bucket in bytes
  s3_endpoint?: string;
  endpoint_type?: ObjectStorageEndpointTypes;
}

export interface ObjectStorageObject {
  size: number | null; // Size of object in bytes
  owner: string | null;
  etag: string | null;
  last_modified: string | null; // Date
  name: string;
}

export interface ObjectStorageObjectURL {
  exists: boolean; // TODO: This doesn't appear documented in API docs
  url: string;
}

export interface ObjectStorageEndpoint {
  region: string;
  endpoint_type: ObjectStorageEndpointTypes;
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

export interface CreateObjectStorageObjectURLPayload {
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

export interface GetObjectStorageObjectListPayload {
  clusterId: string;
  bucket: string;
  params?: ObjectStorageObjectListParams;
}

interface ObjectStorageObjectListParams {
  delimiter?: string;
  marker?: string;
  prefix?: string;
  page_size?: number;
}

export interface ObjectStorageObjectList {
  data: ObjectStorageObject[];
  next_marker: string | null;
  is_truncated: boolean;
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
  clusterId: string;
  bucket: string;
  params: {
    name: string;
  };
}

// Gen2 endpoints ('E2', 'E3') are not supported and will return null.
export interface ObjectStorageBucketAccess {
  acl: ACLType;
  acl_xml: string;
  cors_enabled: boolean | null;
  cors_xml: string | null;
}
