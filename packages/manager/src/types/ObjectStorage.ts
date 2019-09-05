namespace Linode {
  export interface ObjectStorageKey {
    access_key: string;
    id: number;
    label: string;
    secret_key: string;
  }

  export interface Bucket {
    label: string;
    objects: number;
    created: string;
    size: number;
    region: string;
    cluster: string;
    hostname: string;
  }

  export interface Cluster {
    region: string;
    status: string; // @todo: should be enum
    id: ClusterID;
    domain: string;
    static_site_domain: string;
  }

  export interface Object {
    size: number; // Size of object in bytes
    owner: string;
    etag: string;
    last_modified: string; // Date
    name: string;
  }

  // Enum containing IDs for each Cluster
  export type ClusterID = 'us-east-1' | 'alpha';
}
