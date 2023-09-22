import {
  createLoadbalancerServiceTarget,
  deleteLoadbalancerServiceTarget,
  getLoadbalancerServiceTargets,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { QUERY_KEY } from './loadbalancers';

import type {
  APIError,
  Filter,
  Params,
  ResourcePage,
  ServiceTarget,
  ServiceTargetPayload,
} from '@linode/api-v4';

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

export const useServiceTargetCreateMutation = (loadbalancerId: number) => {
  const queryClient = useQueryClient();
  return useMutation<ServiceTarget, APIError[], ServiceTargetPayload>(
    (data) => createLoadbalancerServiceTarget(loadbalancerId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          QUERY_KEY,
          'aglb',
          loadbalancerId,
          'service-targets',
        ]);
      },
    }
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
          'aglb',
          loadbalancerId,
          'service-targets',
        ]);
      },
    }
  );
};
