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
  | 'database'
  | 'domain'
  | 'firewall'
  | 'image'
  | 'kubernetesCluster'
  | 'linode'
  | 'nodebalancer'
  | 'stackscript'
  | 'volume';

// These are the properties on our entities we'd like to search
export type SearchField = 'ips' | 'label' | 'tags' | 'type' | 'value';

export interface SearchResultsByEntity {
  bucket: SearchableItem[];
  database: SearchableItem[];
  domain: SearchableItem[];
  firewall: SearchableItem[];
  image: SearchableItem[];
  kubernetesCluster: SearchableItem[];
  linode: SearchableItem[];
  nodebalancer: SearchableItem[];
  stackscript: SearchableItem[];
  volume: SearchableItem[];
}
