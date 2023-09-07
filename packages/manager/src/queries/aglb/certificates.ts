import { getLoadbalancerCertificates } from '@linode/api-v4';
import { useInfiniteQuery, useQuery } from 'react-query';

import { QUERY_KEY } from './loadbalancers';

import type {
  APIError,
  Certificate,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4';

export const useLoadBalancerCertificatesQuery = (
  id: number,
  params: Params,
  filter: Filter
) => {
  return useQuery<ResourcePage<Certificate>, APIError[]>(
    [QUERY_KEY, 'loadbalancer', id, 'certificates', params, filter],
    () => getLoadbalancerCertificates(id, params, filter),
    { keepPreviousData: true }
  );
};

export const useLoadBalancerCertificatesInfiniteQuery = (
  id: number,
  filter: Filter = {}
) => {
  return useInfiniteQuery<ResourcePage<Certificate>, APIError[]>(
    [QUERY_KEY, 'loadbalancer', id, 'certificates', 'infinite', filter],
    ({ pageParam }) =>
      getLoadbalancerCertificates(
        id,
        { page: pageParam, page_size: 25 },
        filter
      ),
    {
      getNextPageParam: ({ page, pages }) => {
        if (page === pages) {
          return undefined;
        }
        return page + 1;
      },
    }
  );
};
