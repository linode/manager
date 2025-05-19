import {
  createNodeBalancer,
  createNodeBalancerBeta,
  createNodeBalancerConfig,
  deleteNodeBalancer,
  deleteNodeBalancerConfig,
  updateNodeBalancer,
  updateNodeBalancerConfig,
} from '@linode/api-v4';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryPresets } from '../base';
import { firewallQueries } from '../firewalls';
import { profileQueries } from '../profile';
import { vpcQueries } from '../vpcs';
import { nodebalancerQueries } from './keys';

import type { EventHandlerData } from '../eventHandlers';
import type {
  APIError,
  CreateNodeBalancerConfig,
  CreateNodeBalancerPayload,
  Filter,
  Firewall,
  NodeBalancer,
  NodeBalancerConfig,
  NodeBalancerStats,
  Params,
  PriceType,
  ResourcePage,
} from '@linode/api-v4';

export const useNodeBalancerStatsQuery = (id: number) => {
  return useQuery<NodeBalancerStats, APIError[]>({
    ...nodebalancerQueries.nodebalancer(id)._ctx.stats,
    refetchInterval: 20000,
    retry: false,
  });
};

export const useNodeBalancersQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<NodeBalancer>, APIError[]>({
    ...nodebalancerQueries.nodebalancers._ctx.paginated(params, filter),
    placeholderData: keepPreviousData,
  });

export const useNodeBalancerQuery = (id: number, enabled = true) => {
  return useQuery<NodeBalancer, APIError[]>({
    ...nodebalancerQueries.nodebalancer(id),
    enabled,
  });
};

export const useNodebalancerUpdateMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<NodeBalancer, APIError[], Partial<NodeBalancer>>({
    mutationFn: (data) => updateNodeBalancer(id, data),
    onSuccess(nodebalancer) {
      // Invalidate paginated stores
      queryClient.invalidateQueries({
        queryKey: nodebalancerQueries.nodebalancers.queryKey,
      });
      // Update the NodeBalancer store
      queryClient.setQueryData<NodeBalancer>(
        nodebalancerQueries.nodebalancer(id).queryKey,
        nodebalancer,
      );
    },
  });
};

export const useNodebalancerDeleteMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteNodeBalancer(id),
    onSuccess() {
      // Remove NodeBalancer queries for this specific NodeBalancer
      queryClient.removeQueries({
        queryKey: nodebalancerQueries.nodebalancer(id).queryKey,
      });
      // Invalidate paginated stores
      queryClient.invalidateQueries({
        queryKey: nodebalancerQueries.nodebalancers.queryKey,
      });
    },
  });
};

export const useNodebalancerCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<NodeBalancer, APIError[], CreateNodeBalancerPayload>({
    mutationFn: createNodeBalancer,
    onSuccess(nodebalancer, variables) {
      // Invalidate paginated stores
      queryClient.invalidateQueries({
        queryKey: nodebalancerQueries.nodebalancers.queryKey,
      });
      // Prime the cache for this specific NodeBalancer
      queryClient.setQueryData<NodeBalancer>(
        nodebalancerQueries.nodebalancer(nodebalancer.id).queryKey,
        nodebalancer,
      );
      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries({
        queryKey: profileQueries.grants.queryKey,
      });

      // If a NodeBalancer is assigned to a firewall upon creation, make sure we invalidate that firewall
      // so it reflects the new entity.
      if (variables.firewall_id) {
        // Invalidate the paginated list of firewalls because GET /v4/networking/firewalls returns all firewall entities
        queryClient.invalidateQueries({
          queryKey: firewallQueries.firewalls.queryKey,
        });

        // Invalidate the affected firewall
        queryClient.invalidateQueries({
          queryKey: firewallQueries.firewall(variables.firewall_id).queryKey,
        });
      }
    },
  });
};

/**
 * duplicated function of useNodebalancerCreateMutation
 */

export const useNodebalancerCreateBetaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<NodeBalancer, APIError[], CreateNodeBalancerPayload>({
    mutationFn: createNodeBalancerBeta,
    onSuccess(nodebalancer, variables) {
      // Invalidate paginated stores
      queryClient.invalidateQueries({
        queryKey: nodebalancerQueries.nodebalancers.queryKey,
      });
      // Prime the cache for this specific NodeBalancer
      queryClient.setQueryData<NodeBalancer>(
        nodebalancerQueries.nodebalancer(nodebalancer.id).queryKey,
        nodebalancer,
      );
      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries({
        queryKey: profileQueries.grants.queryKey,
      });

      // If a NodeBalancer is assigned to a firewall upon creation, make sure we invalidate that firewall
      // so it reflects the new entity.
      if (variables.firewall_id) {
        // Invalidate the paginated list of firewalls because GET /v4/networking/firewalls returns all firewall entities
        queryClient.invalidateQueries({
          queryKey: firewallQueries.firewalls.queryKey,
        });

        // Invalidate the affected firewall
        queryClient.invalidateQueries({
          queryKey: firewallQueries.firewall(variables.firewall_id).queryKey,
        });
      }
      // If a Nodebalancer is created with a VPC, invalidate the related VPC queries
      // so it reflects the new entity.
      if (variables.vpcs?.length) {
        // Invalidating all vpc related queries since we don't have the specific vpc_id
        queryClient.invalidateQueries({ queryKey: vpcQueries._def });
      }
    },
  });
};

export const useNodebalancerConfigCreateMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<NodeBalancerConfig, APIError[], CreateNodeBalancerConfig>({
    mutationFn: (data) => createNodeBalancerConfig(id, data),
    onSuccess(config) {
      // Append new config to the configurations list
      queryClient.setQueryData<NodeBalancerConfig[]>(
        nodebalancerQueries.nodebalancer(id)._ctx.configurations.queryKey,
        (previousData) => {
          if (!previousData) {
            return [config];
          }
          return [...previousData, config];
        },
      );
    },
  });
};

interface CreateNodeBalancerConfigWithConfig
  extends Partial<CreateNodeBalancerConfig> {
  configId: number;
}

export const useNodebalancerConfigUpdateMutation = (nodebalancerId: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    NodeBalancerConfig,
    APIError[],
    CreateNodeBalancerConfigWithConfig
  >({
    mutationFn: ({ configId, ...data }) =>
      updateNodeBalancerConfig(nodebalancerId, configId, data),
    onSuccess(config) {
      // Update the config within the configs list
      queryClient.setQueryData<NodeBalancerConfig[]>(
        nodebalancerQueries.nodebalancer(nodebalancerId)._ctx.configurations
          .queryKey,
        (previousData) => {
          if (!previousData) {
            return [config];
          }
          const indexOfConfig = previousData.findIndex(
            (c) => c.id === config.id,
          );
          if (indexOfConfig === -1) {
            return [...previousData, config];
          }
          const newConfigs = [...previousData];
          newConfigs[indexOfConfig] = config;
          return newConfigs;
        },
      );
    },
  });
};

export const useNodebalancerConfigDeleteMutation = (nodebalancerId: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { configId: number }>({
    mutationFn: ({ configId }) =>
      deleteNodeBalancerConfig(nodebalancerId, configId),
    onSuccess(_, vars) {
      queryClient.setQueryData<NodeBalancerConfig[]>(
        nodebalancerQueries.nodebalancer(nodebalancerId)._ctx.configurations
          .queryKey,
        (oldData) => {
          return (oldData ?? []).filter(
            (config) => config.id !== vars.configId,
          );
        },
      );
    },
  });
};

export const useAllNodeBalancerConfigsQuery = (id: number) =>
  useQuery<NodeBalancerConfig[], APIError[]>({
    ...nodebalancerQueries.nodebalancer(id)._ctx.configurations,
    refetchInterval: 20000,
  });

// Please don't use
export const useAllNodeBalancersQuery = (enabled = true) =>
  useQuery<NodeBalancer[], APIError[]>({
    ...nodebalancerQueries.nodebalancers._ctx.all,
    enabled,
  });

export const useInfiniteNodebalancersQuery = (
  filter: Filter,
  enabled: boolean,
) =>
  useInfiniteQuery<ResourcePage<NodeBalancer>, APIError[]>({
    ...nodebalancerQueries.nodebalancers._ctx.infinite(filter),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    retry: false,
  });

export const useNodeBalancersFirewallsQuery = (nodebalancerId: number) =>
  useQuery<ResourcePage<Firewall>, APIError[]>(
    nodebalancerQueries.nodebalancer(nodebalancerId)._ctx.firewalls,
  );

export const useNodeBalancerTypesQuery = () =>
  useQuery<PriceType[], APIError[]>({
    ...queryPresets.oneTimeFetch,
    ...nodebalancerQueries.types,
  });

export const nodebalancerEventHandler = ({
  event,
  invalidateQueries,
}: EventHandlerData) => {
  const nodebalancerId = event.entity?.id;

  if (event.action.startsWith('nodebalancer_node')) {
    // We don't store NodeBalancer nodes is React Query currently, so just skip these events
    return;
  }

  if (nodebalancerId === undefined) {
    // Ignore events that don't have an associated NodeBalancer
    return;
  }

  if (event.action.startsWith('nodebalancer_config')) {
    // If the event is about a NodeBalancer's configs, just invalidate the configs
    invalidateQueries({
      queryKey:
        nodebalancerQueries.nodebalancer(nodebalancerId)._ctx.configurations
          .queryKey,
    });
  } else {
    // If we've made it here, the event is about a NodeBalancer

    // Invalidate the specific NodeBalancer
    invalidateQueries({
      exact: true,
      queryKey: nodebalancerQueries.nodebalancer(nodebalancerId).queryKey,
    });

    // Invalidate all paginated lists
    invalidateQueries({
      queryKey: nodebalancerQueries.nodebalancers.queryKey,
    });
  }
};
