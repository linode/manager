import type {
  SearchResultsByEntity,
  SearchableItem,
} from './search.interfaces';

export const emptyResults: SearchResultsByEntity = {
  buckets: [],
  databases: [],
  domains: [],
  firewalls: [],
  images: [],
  kubernetesClusters: [],
  linodes: [],
  nodebalancers: [],
  volumes: [],
};

export const separateResultsByEntity = (
  searchResults: SearchableItem[]
): SearchResultsByEntity => {
  const separatedResults: SearchResultsByEntity = {
    buckets: [],
    databases: [],
    domains: [],
    firewalls: [],
    images: [],
    kubernetesClusters: [],
    linodes: [],
    nodebalancers: [],
    volumes: [],
  };

  searchResults.forEach((result) => {
    // EntityTypes are singular; we'd like the resulting keys to be plural
    const pluralizedEntityType = result.entityType + 's';
    separatedResults[
      pluralizedEntityType as keyof typeof separatedResults
    ].push(result);
  });
  return separatedResults;
};
