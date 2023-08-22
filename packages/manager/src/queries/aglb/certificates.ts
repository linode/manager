import { getLoadbalancerCertificates } from '@linode/api-v4';
import { useQuery } from 'react-query';

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
    [QUERY_KEY, 'paginated', params, filter],
    () => getLoadbalancerCertificates(id, params, filter),
    { keepPreviousData: true }
  );
};
