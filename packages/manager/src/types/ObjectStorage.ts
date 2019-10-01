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
    size: number | null; // Size of object in bytes
    owner: string | null;
    etag: string | null;
    last_modified: string | null; // Date
    name: string;
  }

  export interface ObjectURL {
    url: string;
  }

  // Enum containing IDs for each Cluster
  export type ClusterID = 'us-east-1' | 'us-east';
}
