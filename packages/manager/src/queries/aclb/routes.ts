import {
  createLoadbalancerRoute,
  deleteLoadbalancerRoute,
  updateLoadbalancerRoute,
} from '@linode/api-v4';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { updateInPaginatedStore } from '../base';
import { aclbQueries } from './queries';

import type {
  APIError,
  CreateRoutePayload,
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
  return useQuery<ResourcePage<Route>, APIError[]>({
    ...aclbQueries
      .loadbalancer(id)
      ._ctx.routes._ctx.lists._ctx.paginated(params, filter),
    keepPreviousData: true,
  });
};

export const useLoadBalancerRouteCreateMutation = (loadbalancerId: number) => {
  const queryClient = useQueryClient();
  return useMutation<Route, APIError[], CreateRoutePayload>({
    mutationFn: (data) => createLoadbalancerRoute(loadbalancerId, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: aclbQueries.loadbalancer(loadbalancerId)._ctx.routes._ctx
          .lists.queryKey,
      });
    },
  });
};

export const useLoadBalancerRouteUpdateMutation = (
  loadbalancerId: number,
  routeId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<Route, APIError[], UpdateRoutePayload>({
    mutationFn: (data) =>
      updateLoadbalancerRoute(loadbalancerId, routeId, data),
    onError() {
      // On error, refetch to keep the client in sync with the API
      queryClient.invalidateQueries({
        queryKey: aclbQueries.loadbalancer(loadbalancerId)._ctx.routes._ctx
          .lists.queryKey,
      });
    },
    onMutate(variables) {
      const key = aclbQueries.loadbalancer(loadbalancerId)._ctx.routes._ctx
        .lists._ctx.paginated._def;
      // Optimistically update the route on mutate
      updateInPaginatedStore<Route>(key, routeId, variables, queryClient);
    },
    onSuccess() {
      // Invalidate the infinite store (the paginated store is optimistically updated already)
      queryClient.invalidateQueries({
        queryKey: aclbQueries.loadbalancer(loadbalancerId)._ctx.routes._ctx
          .lists._ctx.infinite._def,
      });
      // Invalidate configs because GET configs returns configuration labels
      queryClient.invalidateQueries({
        queryKey: aclbQueries.loadbalancer(loadbalancerId)._ctx.configurations
          ._ctx.lists.queryKey,
      });
    },
  });
};

export const useLoadBalancerRouteDeleteMutation = (
  loadbalancerId: number,
  routeId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteLoadbalancerRoute(loadbalancerId, routeId),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: aclbQueries.loadbalancer(loadbalancerId)._ctx.routes._ctx
          .lists.queryKey,
      });
    },
  });
};

export const useLoadBalancerRoutesInfiniteQuery = (
  id: number,
  filter: Filter = {}
) => {
  return useInfiniteQuery<ResourcePage<Route>, APIError[]>({
    ...aclbQueries
      .loadbalancer(id)
      ._ctx.routes._ctx.lists._ctx.infinite(filter),
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
  });
};
