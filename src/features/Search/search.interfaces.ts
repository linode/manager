export interface SearchResults {
  combinedResults: SearchableItem[];
  searchResultsByEntity: SearchResultsByEntity;
}

export interface SearchableItem<T = string | number> {
  value: T;
  label: string;
  entityType: SearchableEntityType;
  data?: any;
}

export type SearchableEntityType =
  | 'linode'
  | 'volume'
  | 'domain'
  | 'image'
  | 'nodebalancer';

// These are the properties on our entities we'd like to search
export type SearchField = 'tags' | 'label' | 'ips' | 'type';

export interface SearchResultsByEntity {
  linodes: SearchableItem[];
  volumes: SearchableItem[];
  nodebalancers: SearchableItem[];
  domains: SearchableItem[];
  images: SearchableItem[];
}
