import {
  createLoadbalancerServiceTarget,
  getLoadbalancerServiceTargets,
} from '@linode/api-v4';
import { useMutation, useQuery } from 'react-query';

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
  return useMutation<ServiceTarget, APIError[], ServiceTargetPayload>((data) =>
    createLoadbalancerServiceTarget(loadbalancerId, data)
  );
};
