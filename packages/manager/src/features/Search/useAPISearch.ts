import {
  useDomainsInfiniteQuery,
  useFirewallsInfiniteQuery,
  useInfiniteLinodesQuery,
  useInfiniteNodebalancersQuery,
  useInfiniteVolumesQuery,
  useStackScriptsInfiniteQuery,
} from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import { useDebouncedValue } from '@linode/utilities';

import { useDatabasesInfiniteQuery } from 'src/queries/databases/databases';
import { useImagesInfiniteQuery } from 'src/queries/images';
import { useKubernetesClustersInfiniteQuery } from 'src/queries/kubernetes';
import {
  databaseToSearchableItem,
  domainToSearchableItem,
  firewallToSearchableItem,
  imageToSearchableItem,
  kubernetesClusterToSearchableItem,
  linodeToSearchableItem,
  nodeBalToSearchableItem,
  stackscriptToSearchableItem,
  volumeToSearchableItem,
} from 'src/store/selectors/getSearchEntities';

import { emptyErrors, separateResultsByEntity } from './utils';

import type { SearchableEntityType, SearchableItem } from './search.interfaces';

interface Props {
  enabled: boolean;
  query: string;
}

const entities = [
  {
    getSearchableItem: linodeToSearchableItem,
    name: 'linode' as const,
    query: useInfiniteLinodesQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['id', 'label', 'tags', 'ipv4'],
    },
  },
  {
    getSearchableItem: volumeToSearchableItem,
    name: 'volume' as const,
    query: useInfiniteVolumesQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['label', 'tags'],
    },
  },
  {
    baseFilter: { mine: true },
    getSearchableItem: stackscriptToSearchableItem,
    name: 'stackscript' as const,
    query: useStackScriptsInfiniteQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['label'],
    },
  },
  {
    getSearchableItem: kubernetesClusterToSearchableItem,
    name: 'kubernetesCluster' as const,
    query: useKubernetesClustersInfiniteQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['label', 'tags'],
    },
  },
  {
    getSearchableItem: domainToSearchableItem,
    name: 'domain' as const,
    query: useDomainsInfiniteQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['domain', 'tags'],
    },
  },
  {
    getSearchableItem: firewallToSearchableItem,
    name: 'firewall' as const,
    query: useFirewallsInfiniteQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['label'],
    },
  },
  {
    getSearchableItem: databaseToSearchableItem,
    name: 'database' as const,
    query: useDatabasesInfiniteQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['label'],
    },
  },
  {
    baseFilter: { is_public: false },
    getSearchableItem: imageToSearchableItem,
    name: 'image' as const,
    query: useImagesInfiniteQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['label', 'tags'],
    },
  },
  {
    getSearchableItem: nodeBalToSearchableItem,
    name: 'nodebalancer' as const,
    query: useInfiniteNodebalancersQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['label', 'ipv4', 'tags'],
    },
  },
];

/**
 * Fetches entities on a user's account using server-side filtering
 * based on a user's seach query.
 *
 * We have to fetch the first page of each entity because API-v4
 * does not provide a dedicated search endpoint.
 *
 * The main advantage of this hook over useClientSideSearch is that it uses
 * server-side filtering (X-Filters) so that we don't need to fetch all entities
 * and do the filtering client-side.
 */
export const useAPISearch = ({ enabled, query }: Props) => {
  const deboundedQuery = useDebouncedValue(query);

  const result = entities.map((entity) => {
    const { error, filter } = getAPIFilterFromQuery(
      deboundedQuery,
      entity.searchOptions
    );

    return {
      ...entity,
      parseError: error,
      ...entity.query(
        entity.baseFilter ? { ...entity.baseFilter, ...filter } : filter,
        enabled && error === null && Boolean(deboundedQuery)
      ),
    };
  });

  const isLoading = result.some((r) => r.isLoading);

  const combinedResults = result.flatMap(
    (r) =>
      r.data?.pages.flatMap((p) =>
        p.data.map(r.getSearchableItem as (i: unknown) => SearchableItem)
      ) ?? []
  );

  const searchResultsByEntity = separateResultsByEntity(combinedResults);

  const entityErrors = result.reduce<
    Record<SearchableEntityType, null | string>
  >(
    (acc, r) => {
      if (r.parseError) {
        acc[r.name] = r.parseError.message;
      }
      if (r.error) {
        acc[r.name] = r.error[0].reason;
      }
      return acc;
    },
    { ...emptyErrors }
  );

  return {
    combinedResults,
    entityErrors,
    isLoading,
    searchResultsByEntity,
  };
};
