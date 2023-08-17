import { ServiceTarget, getLoadbalancerServiceTargets } from '@linode/api-v4';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

import { QUERY_KEY } from './loadbalancers';

export const useServiceTargetsQuery = (
  loadbalancerId: number,
  params: Params,
  filter: Filter
) => {
  return useQuery<ResourcePage<ServiceTarget>, APIError[]>(
    [QUERY_KEY, 'aglb', loadbalancerId, 'service-targets', params, filter],
    () => getLoadbalancerServiceTargets(loadbalancerId, params, filter),
    { keepPreviousData: true }
  );
};
