import { getVlans } from '@linode/api-v4/lib/vlans';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import type { APIError, Filter, ResourcePage, VLAN } from '@linode/api-v4';

const getAllVLANs = (): Promise<VLAN[]> =>
  getAll<VLAN>((params) => getVlans(params))().then(({ data }) => data);

export const vlanQueries = createQueryKeys('vlans', {
  all: {
    queryFn: getAllVLANs,
    queryKey: null,
  },
  infinite: (filter: Filter = {}) => ({
    queryFn: ({ pageParam = 1 }) =>
      getVlans({ page: pageParam as number, page_size: 25 }, filter),
    queryKey: [filter],
  }),
});

export const useVlansQuery = () => {
  return useQuery<VLAN[], APIError[]>(vlanQueries.all);
};

export const useVLANsInfiniteQuery = (filter: Filter = {}, enabled = true) => {
  return useInfiniteQuery<ResourcePage<VLAN>, APIError[]>({
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    ...vlanQueries.infinite(filter),
    enabled,
  });
};
