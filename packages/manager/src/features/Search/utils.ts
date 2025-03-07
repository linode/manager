import { refinedSearch } from './refinedSearch';

import type {
  SearchResults,
  SearchResultsByEntity,
  SearchableItem,
} from './search.interfaces';

export const emptyResults: SearchResultsByEntity = {
  bucket: [],
  database: [],
  domain: [],
  firewall: [],
  image: [],
  kubernetesCluster: [],
  linode: [],
  nodebalancer: [],
  stackscript: [],
  volume: [],
};

export const separateResultsByEntity = (
  searchResults: SearchableItem[]
): SearchResultsByEntity => {
  const separatedResults: SearchResultsByEntity = {
    bucket: [],
    database: [],
    domain: [],
    firewall: [],
    image: [],
    kubernetesCluster: [],
    linode: [],
    nodebalancer: [],
    stackscript: [],
    volume: [],
  };

  for (const result of searchResults) {
    separatedResults[result.entityType].push(result);
  }

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
