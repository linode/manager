import { refinedSearch } from './refinedSearch';
import type {
    SearchResults,
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

export const search = (
  entities: SearchableItem[],
  inputValue: string
): SearchResults => {
  if (!inputValue || inputValue === '') {
    return { combinedResults: [], searchResultsByEntity: emptyResults };
  }

  const combinedResults = refinedSearch(inputValue, entities);

  return {
    combinedResults,
    searchResultsByEntity: separateResultsByEntity(combinedResults),
  };
};
