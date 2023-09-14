import {
  ServiceTarget,
  deleteLoadbalancerServiceTarget,
  getLoadbalancerServiceTargets,
} from '@linode/api-v4';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { QUERY_KEY } from './loadbalancers';

export const useLoadBalancerServiceTargetsQuery = (
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

export const useLoadBalancerServiceTargetDeleteMutation = (
  loadbalancerId: number,
  serviceTargetId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(
    () => deleteLoadbalancerServiceTarget(loadbalancerId, serviceTargetId),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          QUERY_KEY,
          'loadbalancer',
          loadbalancerId,
          'service-targets',
        ]);
      },
    }
  );
};
