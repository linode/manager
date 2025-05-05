import Compute from 'src/assets/icons/entityIcons/compute.svg';
import Database from 'src/assets/icons/entityIcons/database.svg';
import Networking from 'src/assets/icons/entityIcons/networking.svg';
import Storage from 'src/assets/icons/entityIcons/storage.svg';

import { refinedSearch } from './refinedSearch';

import type {
  SearchableEntityType,
  SearchableItem,
  SearchResults,
  SearchResultsByEntity,
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

export const emptyErrors: Record<SearchableEntityType, null | string> = {
  bucket: null,
  database: null,
  domain: null,
  firewall: null,
  image: null,
  kubernetesCluster: null,
  linode: null,
  nodebalancer: null,
  stackscript: null,
  volume: null,
};

export const searchableEntityIconMap: Record<
  SearchableEntityType,
  React.ComponentType
> = {
  bucket: Storage,
  database: Database,
  domain: Networking,
  firewall: Networking,
  image: Storage,
  kubernetesCluster: Compute,
  linode: Compute,
  nodebalancer: Networking,
  stackscript: Compute,
  volume: Storage,
};

export const searchableEntityDisplayNameMap: Record<
  SearchableEntityType,
  string
> = {
  bucket: 'Buckets',
  database: 'Databases',
  domain: 'Domains',
  firewall: 'Firewalls',
  image: 'Images',
  kubernetesCluster: 'Kubernetes',
  linode: 'Linodes',
  nodebalancer: 'NodeBalancers',
  stackscript: 'StackScripts',
  volume: 'Volumes',
};

export const getErrorsFromErrorMap = (
  errorMap: Record<SearchableEntityType, null | string>
) => {
  const errors = [];
  for (const [entityName, error] of Object.entries(errorMap)) {
    if (error) {
      errors.push(
        `Unable to fetch ${
          searchableEntityDisplayNameMap[entityName as SearchableEntityType]
        }: ${error}`
      );
    }
  }
  return errors;
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
