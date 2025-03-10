import { getAPIFilterFromQuery } from '@linode/search';
import { useDebouncedValue } from '@linode/utilities';

import { useInfiniteLinodesQuery } from 'src/queries/linodes/linodes';
import { useStackScriptsInfiniteQuery } from 'src/queries/stackscripts';
import { useInfiniteVolumesQuery } from 'src/queries/volumes/volumes';
import {
  linodeToSearchableItem,
  stackscriptToSearchableItem,
  volumeToSearchableItem,
} from 'src/store/selectors/getSearchEntities';

import { separateResultsByEntity } from './utils';

import type { SearchableItem } from './search.interfaces';

interface Props {
  enabled: boolean;
  query: string;
}

const entities = [
  {
    getSearchableItem: linodeToSearchableItem,
    name: 'linode',
    query: useInfiniteLinodesQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['id', 'label', 'tags', 'ipv4'],
    },
  },
  {
    getSearchableItem: volumeToSearchableItem,
    name: 'volume',
    query: useInfiniteVolumesQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['label', 'tags'],
    },
  },
  {
    baseFilter: { mine: true },
    getSearchableItem: stackscriptToSearchableItem,
    name: 'stackscript',
    query: useStackScriptsInfiniteQuery,
    searchOptions: {
      searchableFieldsWithoutOperator: ['label'],
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
        enabled && error === null
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

  return {
    combinedResults,
    isLoading,
    searchResultsByEntity,
  };
};
