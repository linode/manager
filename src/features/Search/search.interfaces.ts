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

export interface SearchResultsByEntity {
  linodes: SearchableItem[];
  volumes: SearchableItem[];
  nodebalancers: SearchableItem[];
  domains: SearchableItem[];
  images: SearchableItem[];
}
