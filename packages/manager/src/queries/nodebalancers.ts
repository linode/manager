import {
  CreateNodeBalancerConfig,
  CreateNodeBalancerPayload,
  Firewall,
  NodeBalancer,
  NodeBalancerConfig,
  NodeBalancerStats,
  createNodeBalancer,
  createNodeBalancerConfig,
  deleteNodeBalancer,
  deleteNodeBalancerConfig,
  getNodeBalancer,
  getNodeBalancerConfigs,
  getNodeBalancerFirewalls,
  getNodeBalancerStats,
  getNodeBalancerTypes,
  getNodeBalancers,
  updateNodeBalancer,
  updateNodeBalancerConfig,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { DateTime } from 'luxon';

import { EventHandlerData } from 'src/hooks/useEventHandlers';
import { queryKey as firewallsQueryKey } from 'src/queries/firewalls';
import { FormattedAPIError } from 'src/types/FormattedAPIError';
import { parseAPIDate } from 'src/utilities/date';
import { getAll } from 'src/utilities/getAll';

import { queryPresets } from './base';
import { itemInListCreationHandler, itemInListMutationHandler } from './base';
import { profileQueries } from './profile';

import type {
  Filter,
  Params,
  PriceType,
  ResourcePage,
} from '@linode/api-v4/lib/types';

export const queryKey = 'nodebalancers';

export const NODEBALANCER_STATS_NOT_READY_API_MESSAGE =
  'Stats are unavailable at this time.';

const getAllNodeBalancerTypes = () =>
  getAll<PriceType>((params) => getNodeBalancerTypes(params))().then(
    (results) => results.data
  );

export const typesQueries = createQueryKeys('types', {
  nodebalancers: {
    queryFn: getAllNodeBalancerTypes,
    queryKey: null,
  },
});

const getIsTooEarlyForStats = (created?: string) => {
  if (!created) {
    return false;
  }

  return parseAPIDate(created) > DateTime.local().minus({ minutes: 5 });
};

export const useNodeBalancerStats = (id: number, created?: string) => {
  return useQuery<NodeBalancerStats, FormattedAPIError[]>(
    [queryKey, 'nodebalancer', id, 'stats'],
    getIsTooEarlyForStats(created)
      ? () =>
          Promise.reject([{ reason: NODEBALANCER_STATS_NOT_READY_API_MESSAGE }])
      : () => getNodeBalancerStats(id),
    // We need to disable retries because the API will
    // error if stats are not ready. If the default retry policy
    // is used, a "stats not ready" state can't be shown because the
    // query is still trying to request.
    { refetchInterval: 20000, retry: false }
  );
};

export const useNodeBalancersQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<NodeBalancer>, FormattedAPIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getNodeBalancers(params, filter),
    { keepPreviousData: true }
  );

export const useNodeBalancerQuery = (id: number, enabled = true) =>
  useQuery<NodeBalancer, FormattedAPIError[]>(
    [queryKey, 'nodebalancer', id],
    () => getNodeBalancer(id),
    { enabled }
  );

export const useNodebalancerUpdateMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<NodeBalancer, FormattedAPIError[], Partial<NodeBalancer>>(
    (data) => updateNodeBalancer(id, data),
    {
      onSuccess(data) {
        queryClient.invalidateQueries([queryKey]);
        queryClient.setQueryData([queryKey, 'nodebalancer', id], data);
      },
    }
  );
};

export const useNodebalancerDeleteMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>(() => deleteNodeBalancer(id), {
    onSuccess() {
      queryClient.removeQueries([queryKey, 'nodebalancer', id]);
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export const useNodebalancerCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    NodeBalancer,
    FormattedAPIError[],
    CreateNodeBalancerPayload
  >(createNodeBalancer, {
    onSuccess(data) {
      queryClient.invalidateQueries([queryKey]);
      queryClient.setQueryData([queryKey, 'nodebalancer', data.id], data);
      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries(profileQueries.grants.queryKey);
    },
  });
};

export const useNodebalancerConfigCreateMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    NodeBalancerConfig,
    FormattedAPIError[],
    CreateNodeBalancerConfig
  >(
    (data) => createNodeBalancerConfig(id, data),
    itemInListCreationHandler(
      [queryKey, 'nodebalancer', id, 'configs'],
      queryClient
    )
  );
};

interface CreateNodeBalancerConfigWithConfig
  extends Partial<CreateNodeBalancerConfig> {
  configId: number;
}

export const useNodebalancerConfigUpdateMutation = (nodebalancerId: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    NodeBalancerConfig,
    FormattedAPIError[],
    CreateNodeBalancerConfigWithConfig
  >(
    ({ configId, ...data }) =>
      updateNodeBalancerConfig(nodebalancerId, configId, data),
    itemInListMutationHandler(
      [queryKey, 'nodebalancer', nodebalancerId, 'configs'],
      queryClient
    )
  );
};

export const useNodebalancerConfigDeleteMutation = (nodebalancerId: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[], { configId: number }>(
    ({ configId }) => deleteNodeBalancerConfig(nodebalancerId, configId),
    {
      onSuccess(_, vars) {
        queryClient.setQueryData<NodeBalancerConfig[]>(
          [queryKey, 'nodebalancer', nodebalancerId, 'configs'],
          (oldData) => {
            return (oldData ?? []).filter(
              (config) => config.id !== vars.configId
            );
          }
        );
      },
    }
  );
};

export const useAllNodeBalancerConfigsQuery = (id: number) =>
  useQuery<NodeBalancerConfig[], FormattedAPIError[]>(
    [queryKey, 'nodebalanacer', id, 'configs'],
    () => getAllNodeBalancerConfigs(id),
    { refetchInterval: 20000 }
  );

export const getAllNodeBalancerConfigs = (id: number) =>
  getAll<NodeBalancerConfig>((params) =>
    getNodeBalancerConfigs(id, params)
  )().then((data) => data.data);

export const getAllNodeBalancers = () =>
  getAll<NodeBalancer>((params) => getNodeBalancers(params))().then(
    (data) => data.data
  );

// Please don't use
export const useAllNodeBalancersQuery = (enabled = true) =>
  useQuery<NodeBalancer[], FormattedAPIError[]>(
    [queryKey, 'all'],
    getAllNodeBalancers,
    {
      enabled,
    }
  );

export const useInfiniteNodebalancersQuery = (filter: Filter) =>
  useInfiniteQuery<ResourcePage<NodeBalancer>, FormattedAPIError[]>(
    [queryKey, 'infinite', filter],
    ({ pageParam }) =>
      getNodeBalancers({ page: pageParam, page_size: 25 }, filter),
    {
      getNextPageParam: ({ page, pages }) => {
        if (page === pages) {
          return undefined;
        }
        return page + 1;
      },
    }
  );

export const nodebalanacerEventHandler = ({
  event,
  queryClient,
}: EventHandlerData) => {
  if (event.action.startsWith('nodebalancer_config')) {
    queryClient.invalidateQueries([
      queryKey,
      'nodebalancer',
      event.entity!.id,
      'configs',
    ]);
  } else if (event.action.startsWith('nodebalancer_delete')) {
    queryClient.invalidateQueries([firewallsQueryKey]);
  } else {
    queryClient.invalidateQueries([queryKey, 'all']);
    queryClient.invalidateQueries([queryKey, 'paginated']);
    queryClient.invalidateQueries([queryKey, 'infinite']);
    if (event.entity?.id) {
      queryClient.invalidateQueries([
        queryKey,
        'nodebalancer',
        event.entity.id,
      ]);
    }
  }
};

export const useNodeBalancersFirewallsQuery = (nodebalancerId: number) =>
  useQuery<ResourcePage<Firewall>, FormattedAPIError[]>(
    [queryKey, 'nodebalancer', nodebalancerId, 'firewalls'],
    () => getNodeBalancerFirewalls(nodebalancerId),
    queryPresets.oneTimeFetch
  );

export const useNodeBalancerTypesQuery = () =>
  useQuery<PriceType[], FormattedAPIError[]>({
    ...queryPresets.oneTimeFetch,
    ...typesQueries.nodebalancers,
  });
