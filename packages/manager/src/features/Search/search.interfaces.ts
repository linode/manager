export interface SearchResults {
  combinedResults: SearchableItem[];
  searchResultsByEntity: SearchResultsByEntity;
}

export interface SearchableItem<T = number | string> {
  data?: any;
  entityType: SearchableEntityType;
  label: string;
  value: T;
}

export type SearchableEntityType =
  | 'bucket'
  | 'domain'
  | 'image'
  | 'kubernetesCluster'
  | 'linode'
  | 'nodebalancer'
  | 'volume';

// These are the properties on our entities we'd like to search
export type SearchField = 'ips' | 'label' | 'tags' | 'type';

export interface SearchResultsByEntity {
  buckets: SearchableItem[];
  domains: SearchableItem[];
  images: SearchableItem[];
  kubernetesClusters: SearchableItem[];
  linodes: SearchableItem[];
  nodebalancers: SearchableItem[];
  volumes: SearchableItem[];
}
