import { SearchableItem, SearchResultsByEntity } from './search.interfaces';

export const emptyResults: SearchResultsByEntity = {
  linodes: [],
  volumes: [],
  domains: [],
  images: [],
  nodebalancers: [],
  kubernetesClusters: []
};

export const separateResultsByEntity = (
  searchResults: SearchableItem[]
): SearchResultsByEntity => {
  const separatedResults: SearchResultsByEntity = {
    linodes: [],
    volumes: [],
    domains: [],
    images: [],
    nodebalancers: [],
    kubernetesClusters: []
  };

  searchResults.forEach(result => {
    // EntityTypes are singular; we'd like the resulting keys to be plural
    const pluralizedEntityType = result.entityType + 's';
    separatedResults[pluralizedEntityType].push(result);
  });
  return separatedResults;
};
