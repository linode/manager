import { queryPresets } from '@linode/queries';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

import { entitiesQueries } from './queries';

import type {
  AccountEntity,
  APIError,
  Filter,
  ResourcePage,
} from '@linode/api-v4';

export const useAccountEntities = () => {
  return useQuery<ResourcePage<AccountEntity>, APIError[]>({
    ...entitiesQueries.entities,
    ...queryPresets.shortLived,
  });
};

export const useAccountEntitiesInfinityQuery = (
  filter: Filter = {},
  enabled: true
) => {
  return useInfiniteQuery<ResourcePage<AccountEntity>, APIError[]>({
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    ...entitiesQueries.infinite(filter),
    enabled,
    placeholderData: keepPreviousData,
  });
};
