import {
  deleteLoadbalancerRoute,
  getLoadbalancerRoutes,
  updateLoadbalancerRoute,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { QUERY_KEY } from './loadbalancers';

import type {
  APIError,
  Filter,
  Params,
  ResourcePage,
  Route,
  UpdateRoutePayload,
} from '@linode/api-v4';
import { updateInPaginatedStore } from '../base';

export const useLoadBalancerRoutesQuery = (
  id: number,
  params: Params,
  filter: Filter
) => {
  return useQuery<ResourcePage<Route>, APIError[]>(
    [QUERY_KEY, 'loadbalancer', id, 'routes', params, filter],
    () => getLoadbalancerRoutes(id, params, filter),
    { keepPreviousData: true }
  );
};

export const useLoadBalancerRouteUpdateMutation = (
  loadbalancerId: number,
  routeId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<Route, APIError[], UpdateRoutePayload>(
    (data) => updateLoadbalancerRoute(loadbalancerId, routeId, data),
    {
      onError() {
        // On error, refetch to keep the client in sync with the API
        queryClient.invalidateQueries([
          QUERY_KEY,
          'loadbalancer',
          loadbalancerId,
          'routes',
        ]);
      },
      onMutate(variables) {
        // Optimistically update the route on mutate
        updateInPaginatedStore<Route>(
          [QUERY_KEY, 'loadbalancer', loadbalancerId, 'routes'],
          routeId,
          variables,
          queryClient
        );
      },
    }
  );
};

export const useLoadBalancerRouteDeleteMutation = (
  loadbalancerId: number,
  routeId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(
    () => deleteLoadbalancerRoute(loadbalancerId, routeId),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          QUERY_KEY,
          'loadbalancer',
          loadbalancerId,
          'routes',
        ]);
      },
    }
  );
};
