import {
  CreateRoutePayload,
  createLoadbalancerRoute,
  deleteLoadbalancerRoute,
  getLoadbalancerRoutes,
  updateLoadbalancerRoute,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { updateInPaginatedStore } from '../base';
import { QUERY_KEY } from './loadbalancers';

import type {
  APIError,
  Filter,
  Params,
  ResourcePage,
  Route,
  UpdateRoutePayload,
} from '@linode/api-v4';

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

export const useLoadBalancerRouteCreateMutation = (loadbalancerId: number) => {
  const queryClient = useQueryClient();
  return useMutation<Route, APIError[], CreateRoutePayload>(
    (data) => createLoadbalancerRoute(loadbalancerId, data),
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
        const key = [QUERY_KEY, 'loadbalancer', loadbalancerId, 'routes'];
        // Optimistically update the route on mutate
        updateInPaginatedStore<Route>(
          key,
          routeId,
          { rules: variables.rules },
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
