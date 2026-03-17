import { getSharegroup, getSharegroups } from '@linode/api-v4';
import { getAll } from '@linode/utilities';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

import type {
  APIError,
  Filter,
  Params,
  ResourcePage,
  Sharegroup,
} from '@linode/api-v4';
import type { UseQueryOptions } from '@tanstack/react-query';

export const getAllShareGroups = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<Sharegroup>((params, filter) =>
    getSharegroups(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);

export const shareGroupsQueries = createQueryKeys('sharegroups', {
  all: (params: Params = {}, filters: Filter = {}) => ({
    queryFn: () => getAllShareGroups(params, filters),
    queryKey: [params, filters],
  }),
  sharegroup: (sharegroupId: string) => ({
    queryFn: () => getSharegroup(sharegroupId),
    queryKey: [sharegroupId],
  }),
  infinite: (filters: Filter) => ({
    queryFn: ({ pageParam }) =>
      getSharegroups({ page: pageParam as number }, filters),
    queryKey: [filters],
  }),
  paginated: (params: Params, filters: Filter) => ({
    queryFn: () => getSharegroups(params, filters),
    queryKey: [params, filters],
  }),
});

export const useShareGroupsQuery = (
  params: Params,
  filters: Filter,
  options?: Partial<UseQueryOptions<ResourcePage<Sharegroup>, APIError[]>>,
) =>
  useQuery<ResourcePage<Sharegroup>, APIError[]>({
    ...shareGroupsQueries.paginated(params, filters),
    placeholderData: keepPreviousData,
    ...options,
  });

export const useShareGroupQuery = (sharegroupId: string, enabled = true) =>
  useQuery<Sharegroup, APIError[]>({
    ...shareGroupsQueries.sharegroup(sharegroupId),
    enabled,
  });

export const useAllShareGroupsQuery = (
  params: Params = {},
  filters: Filter = {},
  enabled: true,
) =>
  useQuery<Sharegroup[], APIError[]>({
    ...shareGroupsQueries.all(params, filters),
    enabled,
  });

export const useShareGroupsInfiniteQuery = (
  filters: Filter,
  enabled: boolean,
) =>
  useInfiniteQuery<ResourcePage<Sharegroup>, APIError[]>({
    ...shareGroupsQueries.infinite(filters),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    retry: false,
  });
