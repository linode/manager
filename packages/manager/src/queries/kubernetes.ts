import {
  CreateKubeClusterPayload,
  createKubernetesCluster,
  createNodePool,
  deleteKubernetesCluster,
  deleteNodePool,
  getKubernetesCluster,
  getKubernetesClusters,
  getNodePools,
  KubeNodePoolResponse,
  KubernetesCluster,
  PoolNodeRequest,
  recycleAllNodes,
  recycleClusterNodes,
  recycleNode,
  updateKubernetesCluster,
  updateNodePool,
} from '@linode/api-v4';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryClient, updateInPaginatedStore } from './base';

export const queryKey = `kubernetes`;

export const useKubernetesClustersQuery = (params: any, filter: any) => {
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
  return useMutation<KubernetesCluster, APIError[], Partial<KubernetesCluster>>(
    (data) => updateKubernetesCluster(id, data),
    {
      onSuccess(data) {
        updateInPaginatedStore<KubernetesCluster>(`${queryKey}-list`, id, data);
        queryClient.setQueryData([queryKey, 'cluster', id], data);
      },
    }
  );
};

export const useDeleteKubernetesClusterMutation = () => {
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
  return useMutation<KubernetesCluster, APIError[], CreateKubeClusterPayload>(
    createKubernetesCluster,
    {
      onSuccess() {
        queryClient.invalidateQueries([`${queryKey}-list`]);
      },
    }
  );
};

export const useCreateNodePoolMutation = (clusterId: number) => {
  return useMutation<KubeNodePoolResponse, APIError[], PoolNodeRequest>(
    (data) => createNodePool(clusterId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'pools', clusterId]);
      },
    }
  );
};

export const useUpdateNodePoolMutation = (
  clusterId: number,
  poolId: number
) => {
  return useMutation<
    KubeNodePoolResponse,
    APIError[],
    PoolNodeRequest & { id: number }
  >((data) => updateNodePool(clusterId, poolId, data), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'pools', clusterId]);
    },
  });
};

export const useDeleteNodePoolMutation = (
  clusterId: number,
  poolId: number
) => {
  return useMutation<{}, APIError[]>(() => deleteNodePool(clusterId, poolId), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'pools', clusterId]);
    },
  });
};

export const useRecycleNodePoolMutation = (
  clusterId: number,
  poolId: number
) => {
  return useMutation<{}, APIError[]>(() => recycleAllNodes(clusterId, poolId), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'pools', clusterId]);
    },
  });
};

export const useRecycleNodeMutation = (clusterId: number, nodeId: string) => {
  return useMutation<{}, APIError[]>(() => recycleNode(clusterId, nodeId), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'pools', clusterId]);
    },
  });
};

export const useRecycleClusterMutation = (clusterId: number) => {
  return useMutation<{}, APIError[]>(() => recycleClusterNodes(clusterId), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'pools', clusterId]);
    },
  });
};

export const useAllKubernetesNodePoolQuery = (
  clusterId: number,
  enabled = true
) => {
  return useQuery<KubeNodePoolResponse[], APIError[]>(
    [queryKey, 'pools', clusterId],
    () => getAllNodePoolsForCluster(clusterId),
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
