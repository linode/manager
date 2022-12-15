import {
  CreateKubeClusterPayload,
  createKubernetesCluster,
  deleteKubernetesCluster,
  getKubernetesCluster,
  getKubernetesClusters,
  getNodePools,
  KubeNodePoolResponse,
  KubernetesCluster,
} from '@linode/api-v4';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryClient } from './base';

const queryKey = `kubernetes`;

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
