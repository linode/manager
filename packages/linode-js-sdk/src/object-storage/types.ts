export interface ObjectStorageKey {
  access_key: string;
  id: number;
  label: string;
  secret_key: string;
}

export interface ObjectStorageKeyRequest {
  label: string;
}

export interface ObjectStorageBucketRequestPayload {
  label: string;
  cluster: string;
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

export interface ObjectStorageObjectURLOptions {
  expires_in?: number;
  // "Content-Type" is normally an HTTP header, but here it is used in the body
  // of a request to /object-url, to inform the API which kind of file it is
  // we're trying to upload.
  content_type?: string;
  content_disposition?: 'attachment';
}

// Enum containing IDs for each Cluster
export type ObjectStorageClusterID = 'us-east-1' | 'us-east';

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
