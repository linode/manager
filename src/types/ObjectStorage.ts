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
    hostname: string;
  }
}
