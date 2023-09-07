import {
  CreateKubeClusterPayload,
  CreateNodePoolData,
  KubeNodePoolResponse,
  KubernetesCluster,
  KubernetesDashboardResponse,
  KubernetesEndpointResponse,
  KubernetesVersion,
  UpdateNodePoolData,
  createKubernetesCluster,
  createNodePool,
  deleteKubernetesCluster,
  deleteNodePool,
  getKubeConfig,
  getKubernetesCluster,
  getKubernetesClusterDashboard,
  getKubernetesClusterEndpoints,
  getKubernetesClusters,
  getKubernetesVersions,
  getNodePools,
  recycleAllNodes,
  recycleClusterNodes,
  recycleNode,
  resetKubeConfig,
  updateKubernetesCluster,
  updateNodePool,
} from '@linode/api-v4';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { getAll } from 'src/utilities/getAll';

import { queryPresets, updateInPaginatedStore } from './base';
import { queryKey as PROFILE_QUERY_KEY } from './profile';

export const queryKey = `kubernetes`;

export const useKubernetesClustersQuery = (params: Params, filter: Filter) => {
  return useQuery<ResourcePage<KubernetesCluster>, APIError[]>(
    [`${queryKey}-list`, params, filter],
    () => getKubernetesClusters(params, filter),
    { keepPreviousData: true }
  );
};

export const useKubernetesClusterQuery = (id: number) => {
  return useQuery<KubernetesCluster, APIError[]>(
    [queryKey, 'cluster', id],
    () => getKubernetesCluster(id)
  );
};

export const useKubernetesClusterMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<KubernetesCluster, APIError[], Partial<KubernetesCluster>>(
    (data) => updateKubernetesCluster(id, data),
    {
      onSuccess(data) {
        updateInPaginatedStore<KubernetesCluster>(
          `${queryKey}-list`,
          id,
          data,
          queryClient
        );
        queryClient.setQueryData([queryKey, 'cluster', id], data);
      },
    }
  );
};

export const useAllKubernetesClusterAPIEndpointsQuery = (id: number) => {
  return useQuery<KubernetesEndpointResponse[], APIError[]>(
    [queryKey, 'cluster', id, 'endpoints'],
    () => getAllAPIEndpointsForCluster(id),
    {
      keepPreviousData: true,
      refetchOnMount: true,
      retry: true,
      retryDelay: 5000,
    }
  );
};

const getAllAPIEndpointsForCluster = (clusterId: number) =>
  getAll<KubernetesEndpointResponse>((params, filters) =>
    getKubernetesClusterEndpoints(clusterId, params, filters)
  )().then((data) => data.data);

export const useKubenetesKubeConfigQuery = (
  clusterId: number,
  enabled = false
) =>
  useQuery<string, APIError[]>(
    [queryKey, 'cluster', clusterId, 'kubeconfig'],
    async () => {
      const result = await getKubeConfig(clusterId);
      return window.atob(result.kubeconfig);
    },
    {
      enabled,
      refetchOnMount: true,
      retry: true,
      retryDelay: 5000,
    }
  );

export const useResetKubeConfigMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { id: number }>(
    ({ id }) => resetKubeConfig(id),
    {
      onSuccess(_, { id }) {
        queryClient.removeQueries([queryKey, 'cluster', id, 'kubeconfig']);
      },
    }
  );
};

export const useDeleteKubernetesClusterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { id: number }>(
    ({ id }) => deleteKubernetesCluster(id),
    {
      onSuccess() {
        queryClient.invalidateQueries([`${queryKey}-list`]);
      },
    }
  );
};

export const useCreateKubernetesClusterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<KubernetesCluster, APIError[], CreateKubeClusterPayload>(
    createKubernetesCluster,
    {
      onSuccess() {
        queryClient.invalidateQueries([`${queryKey}-list`]);
        // If a restricted user creates an entity, we must make sure grants are up to date.
        queryClient.invalidateQueries([PROFILE_QUERY_KEY, 'grants']);
      },
    }
  );
};

export const useCreateNodePoolMutation = (clusterId: number) => {
  const queryClient = useQueryClient();
  return useMutation<KubeNodePoolResponse, APIError[], CreateNodePoolData>(
    (data) => createNodePool(clusterId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          queryKey,
          'cluster',
          clusterId,
          'pools',
        ]);
      },
    }
  );
};

export const useUpdateNodePoolMutation = (
  clusterId: number,
  poolId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<
    KubeNodePoolResponse,
    APIError[],
    Partial<UpdateNodePoolData>
  >((data) => updateNodePool(clusterId, poolId, data), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'cluster', clusterId, 'pools']);
    },
  });
};

export const useDeleteNodePoolMutation = (
  clusterId: number,
  poolId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteNodePool(clusterId, poolId), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'cluster', clusterId, 'pools']);
    },
  });
};

export const useRecycleNodePoolMutation = (
  clusterId: number,
  poolId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => recycleAllNodes(clusterId, poolId), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'cluster', clusterId, 'pools']);
    },
  });
};

export const useRecycleNodeMutation = (clusterId: number, nodeId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => recycleNode(clusterId, nodeId), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'cluster', clusterId, 'pools']);
    },
  });
};

export const useRecycleClusterMutation = (clusterId: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => recycleClusterNodes(clusterId), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'cluster', clusterId, 'pools']);
    },
  });
};

export const useAllKubernetesNodePoolQuery = (
  clusterId: number,
  options?: { enabled?: boolean; refetchInterval?: number }
) => {
  return useQuery<KubeNodePoolResponse[], APIError[]>(
    [queryKey, 'cluster', clusterId, 'pools'],
    () => getAllNodePoolsForCluster(clusterId),
    options
  );
};

export const useKubernetesDashboardQuery = (
  clusterID: number,
  enabled: boolean = false
) => {
  return useQuery<KubernetesDashboardResponse, APIError[]>(
    [queryKey, 'cluster', clusterID, 'dashboard'],
    () => getKubernetesClusterDashboard(clusterID),
    { enabled }
  );
};

const getAllNodePoolsForCluster = (clusterId: number) =>
  getAll<KubeNodePoolResponse>((params, filters) =>
    getNodePools(clusterId, params, filters)
  )().then((data) => data.data);

const getAllKubernetesClusters = () =>
  getAll<KubernetesCluster>((params, filters) =>
    getKubernetesClusters(params, filters)
  )().then((data) => data.data);

const getAllKubernetesVersions = () =>
  getAll<KubernetesVersion>((params, filters) =>
    getKubernetesVersions(params, filters)
  )().then((data) => data.data);

export const useKubernetesVersionQuery = () =>
  useQuery<KubernetesVersion[], APIError[]>(
    [queryKey, 'versions'],
    getAllKubernetesVersions,
    queryPresets.oneTimeFetch
  );

/**
 * Please avoid using thie fetch-all query
 */
export const useAllKubernetesClustersQuery = (enabled = false) => {
  return useQuery<KubernetesCluster[], APIError[]>(
    [`${queryKey}-all`],
    getAllKubernetesClusters,
    { enabled }
  );
};
