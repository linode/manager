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
  getNodeBalancers,
  updateNodeBalancer,
  updateNodeBalancerConfig,
} from '@linode/api-v4';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { DateTime } from 'luxon';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import { EventWithStore } from 'src/events';
import { queryKey as firewallsQueryKey } from 'src/queries/firewalls';
import { parseAPIDate } from 'src/utilities/date';
import { getAll } from 'src/utilities/getAll';

import { queryPresets } from './base';
import { itemInListCreationHandler, itemInListMutationHandler } from './base';
import { profileQueries } from './profile';

export const queryKey = 'nodebalancers';

export const NODEBALANCER_STATS_NOT_READY_API_MESSAGE =
  'Stats are unavailable at this time.';

const getIsTooEarlyForStats = (created?: string) => {
  if (!created) {
    return false;
  }

  return parseAPIDate(created) > DateTime.local().minus({ minutes: 5 });
};

export const useNodeBalancerStats = (id: number, created?: string) => {
  return useQuery<NodeBalancerStats, APIError[]>(
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
  useQuery<ResourcePage<NodeBalancer>, APIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getNodeBalancers(params, filter),
    { keepPreviousData: true }
  );

export const useNodeBalancerQuery = (id: number, enabled = true) =>
  useQuery<NodeBalancer, APIError[]>(
    [queryKey, 'nodebalancer', id],
    () => getNodeBalancer(id),
    { enabled }
  );

export const useNodebalancerUpdateMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<NodeBalancer, APIError[], Partial<NodeBalancer>>(
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
  return useMutation<{}, APIError[]>(() => deleteNodeBalancer(id), {
    onSuccess() {
      queryClient.removeQueries([queryKey, 'nodebalancer', id]);
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export const useNodebalancerCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<NodeBalancer, APIError[], CreateNodeBalancerPayload>(
    createNodeBalancer,
    {
      onSuccess(data) {
        queryClient.invalidateQueries([queryKey]);
        queryClient.setQueryData([queryKey, 'nodebalancer', data.id], data);
        // If a restricted user creates an entity, we must make sure grants are up to date.
        queryClient.invalidateQueries(profileQueries.profile().grants.queryKey);
      },
    }
  );
};

export const useNodebalancerConfigCreateMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<NodeBalancerConfig, APIError[], CreateNodeBalancerConfig>(
    (data) => createNodeBalancerConfig(id, data),
    itemInListCreationHandler(
      [queryKey, 'nodebalancer', id, 'configs'],
      queryClient
    )
  );
};

export const useNodebalancerConfigUpdateMutation = (nodebalancerId: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    NodeBalancerConfig,
    APIError[],
    Partial<CreateNodeBalancerConfig> & { configId: number }
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
  return useMutation<{}, APIError[], { configId: number }>(
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
  useQuery<NodeBalancerConfig[], APIError[]>(
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
  useQuery<NodeBalancer[], APIError[]>([queryKey, 'all'], getAllNodeBalancers, {
    enabled,
  });

export const useInfiniteNodebalancersQuery = (filter: Filter) =>
  useInfiniteQuery<ResourcePage<NodeBalancer>, APIError[]>(
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
}: EventWithStore) => {
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
  useQuery<ResourcePage<Firewall>, APIError[]>(
    [queryKey, 'nodebalancer', nodebalancerId, 'firewalls'],
    () => getNodeBalancerFirewalls(nodebalancerId),
    queryPresets.oneTimeFetch
  );
