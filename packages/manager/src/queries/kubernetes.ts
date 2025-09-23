import {
  createKubernetesCluster,
  createNodePool,
  deleteKubernetesCluster,
  deleteNodePool,
  getKubeConfig,
  getKubernetesCluster,
  getKubernetesClusterControlPlaneACL,
  getKubernetesClusterDashboard,
  getKubernetesClusterEndpoints,
  getKubernetesClusters,
  getKubernetesTieredVersions,
  getKubernetesTypes,
  getKubernetesVersions,
  getNodePool,
  getNodePools,
  recycleAllNodes,
  recycleClusterNodes,
  recycleNode,
  resetKubeConfig,
  updateKubernetesCluster,
  updateKubernetesClusterControlPlaneACL,
  updateNodePool,
} from '@linode/api-v4';
import { profileQueries, queryPresets } from '@linode/queries';
import { getAll } from '@linode/utilities';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  CreateKubeClusterPayload,
  CreateNodePoolData,
  KubeNodePoolResponse,
  KubernetesCluster,
  KubernetesControlPlaneACLPayload,
  KubernetesDashboardResponse,
  KubernetesEndpointResponse,
  KubernetesTieredVersion,
  KubernetesVersion,
  UpdateNodePoolData,
} from '@linode/api-v4';
import type {
  APIError,
  Filter,
  Params,
  PriceType,
  ResourcePage,
} from '@linode/api-v4/lib/types';

export const kubernetesQueries = createQueryKeys('kubernetes', {
  cluster: (id: number) => ({
    contextQueries: {
      acl: {
        queryFn: () => getKubernetesClusterControlPlaneACL(id),
        queryKey: [id],
      },
      cluster: {
        queryFn: () => getKubernetesCluster(id),
        queryKey: null,
      },
      dashboard: {
        queryFn: () => getKubernetesClusterDashboard(id),
        queryKey: null,
      },
      endpoints: {
        queryFn: () => getAllAPIEndpointsForCluster(id),
        queryKey: null,
      },
      kubeconfig: {
        queryFn: async () => {
          try {
            const result = await getKubeConfig(id);
            if (!result || !result.kubeconfig) {
              throw [{ reason: 'Invalid KubeConfig response' } as APIError];
            }

            let decodedKubeConfig;
            try {
              decodedKubeConfig = window.atob(result.kubeconfig);
            } catch (decodeError) {
              throw [{ reason: 'Failed to decode KubeConfig' } as APIError];
            }
            return decodedKubeConfig;
          } catch (error) {
            const err = error as {
              reason?: string;
              response?: { status?: number };
            };
            const serviceUnavailableStatus = 503;
            if (
              err?.response?.status === serviceUnavailableStatus ||
              (Array.isArray(err) &&
                err[0]?.reason?.includes('kubeconfig is not yet available'))
            ) {
              // Custom error to identify when KubeConfig is still provisioning
              const notReadyError = [
                {
                  reason:
                    'Cluster kubeconfig is not yet available. Please try again later.',
                } as APIError & { isKubeConfigNotReady: true },
              ];

              notReadyError[0].isKubeConfigNotReady = true;

              throw notReadyError;
            }

            if (Array.isArray(error)) {
              throw error;
            }

            if (error instanceof Error) {
              throw [{ reason: error.message } as APIError];
            }

            throw [{ reason: 'An unexpected error occurred' } as APIError];
          }
        },
        queryKey: null,
      },
      pools: {
        contextQueries: {
          pool: (poolId: number) => ({
            queryFn: () => getNodePool(id, poolId),
            queryKey: [poolId],
          }),
        },
        queryFn: () => getAllNodePoolsForCluster(id),
        queryKey: null,
      },
    },
    queryFn: () => getKubernetesCluster(id),
    queryKey: [id],
  }),
  lists: {
    contextQueries: {
      all: {
        queryFn: () => getAllKubernetesClusters(),
        queryKey: null,
      },
      infinite: (filter: Filter = {}) => ({
        queryFn: ({ pageParam }) =>
          getKubernetesClusters({ page: pageParam as number }, filter),
        queryKey: [filter],
      }),
      paginated: (params: Params, filter: Filter) => ({
        queryFn: () => getKubernetesClusters(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  tieredVersions: (tier: string) => ({
    queryFn: () => getAllKubernetesTieredVersions(tier),
    queryKey: [tier],
  }),
  types: {
    queryFn: () => getAllKubernetesTypes(),
    queryKey: null,
  },
  versions: {
    queryFn: () => getAllKubernetesVersions(),
    queryKey: null,
  },
});

export const useKubernetesClusterQuery = ({
  enabled = true,
  id = -1,
  options = {},
}) => {
  return useQuery<KubernetesCluster, APIError[]>({
    ...kubernetesQueries.cluster(id),
    enabled,
    ...options,
  });
};

export const useKubernetesClustersInfiniteQuery = (
  filter: Filter,
  enabled: boolean
) => {
  return useInfiniteQuery<ResourcePage<KubernetesCluster>, APIError[]>({
    ...kubernetesQueries.lists._ctx.infinite(filter),
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
};

interface KubernetesClustersQueryOptions {
  enabled?: boolean;
  filter: Filter;
  params: Params;
}

export const useKubernetesClustersQuery = ({
  enabled = true,
  filter,
  params,
}: KubernetesClustersQueryOptions) => {
  return useQuery<ResourcePage<KubernetesCluster>, APIError[]>({
    ...kubernetesQueries.lists._ctx.paginated(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });
};

export const useKubernetesClusterMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<KubernetesCluster, APIError[], Partial<KubernetesCluster>>(
    {
      mutationFn: (data) => updateKubernetesCluster(id, data),
      onSuccess(data) {
        queryClient.invalidateQueries({
          queryKey: kubernetesQueries.lists.queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: kubernetesQueries.cluster(id)._ctx.acl.queryKey,
        });
        queryClient.setQueryData<KubernetesCluster>(
          kubernetesQueries.cluster(id).queryKey,
          data
        );
      },
    }
  );
};

export const useAllKubernetesClusterAPIEndpointsQuery = (id: number) => {
  return useQuery<KubernetesEndpointResponse[], APIError[]>({
    ...kubernetesQueries.cluster(id)._ctx.endpoints,
    placeholderData: keepPreviousData,
    refetchOnMount: true,
    retry: true,
    retryDelay: 5000,
  });
};

export const useKubernetesKubeConfigQuery = (
  clusterId: number,
  enabled = false
) =>
  useQuery<string, APIError[]>({
    ...kubernetesQueries.cluster(clusterId)._ctx.kubeconfig,
    enabled,
    retry: (failureCount, error: any) => {
      // Skip retries when cluster is still provisioning
      if (Array.isArray(error) && error[0]?.isKubeConfigNotReady) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 5000,
    // Disable stale time to prevent caching of the kubeconfig
    // because it can take some time for config to get updated in the API
    staleTime: 0,
  });

export const useResetKubeConfigMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { id: number }>({
    mutationFn: ({ id }) => resetKubeConfig(id),
    onSuccess(_, { id }) {
      queryClient.removeQueries({
        queryKey: kubernetesQueries.cluster(id)._ctx.kubeconfig.queryKey,
      });
    },
  });
};

export const useDeleteKubernetesClusterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { id: number }>({
    mutationFn: ({ id }) => deleteKubernetesCluster(id),
    onSuccess(data, variables) {
      queryClient.removeQueries({
        queryKey: kubernetesQueries.cluster(variables.id).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: kubernetesQueries.lists.queryKey,
      });
    },
  });
};

export const useCreateKubernetesClusterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<KubernetesCluster, APIError[], CreateKubeClusterPayload>({
    mutationFn: createKubernetesCluster,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: kubernetesQueries.lists.queryKey,
      });
      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries({
        queryKey: profileQueries.grants.queryKey,
      });
    },
  });
};

export const useCreateNodePoolMutation = (clusterId: number) => {
  const queryClient = useQueryClient();
  return useMutation<KubeNodePoolResponse, APIError[], CreateNodePoolData>({
    mutationFn: (data) => createNodePool(clusterId, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: kubernetesQueries.cluster(clusterId)._ctx.pools.queryKey,
      });
    },
  });
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
  >({
    mutationFn: (data) => updateNodePool(clusterId, poolId, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: kubernetesQueries.cluster(clusterId)._ctx.pools.queryKey,
      });
    },
  });
};

export const useDeleteNodePoolMutation = (
  clusterId: number,
  poolId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteNodePool(clusterId, poolId),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: kubernetesQueries.cluster(clusterId)._ctx.pools.queryKey,
      });
    },
  });
};

export const useRecycleNodePoolMutation = (
  clusterId: number,
  poolId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => recycleAllNodes(clusterId, poolId),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: kubernetesQueries.cluster(clusterId)._ctx.pools.queryKey,
      });
    },
  });
};

export const useRecycleNodeMutation = (clusterId: number, nodeId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => recycleNode(clusterId, nodeId),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: kubernetesQueries.cluster(clusterId)._ctx.pools.queryKey,
      });
    },
  });
};

export const useRecycleClusterMutation = (clusterId: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => recycleClusterNodes(clusterId),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: kubernetesQueries.cluster(clusterId)._ctx.pools.queryKey,
      });
    },
  });
};

export const useAllKubernetesNodePoolQuery = (
  clusterId: number,
  options?: { enabled?: boolean; refetchInterval?: number }
) => {
  return useQuery<KubeNodePoolResponse[], APIError[]>({
    ...kubernetesQueries.cluster(clusterId)._ctx.pools,
    ...options,
  });
};

export const useKubernetesDashboardQuery = (
  clusterId: number,
  enabled: boolean = true
) => {
  return useQuery<KubernetesDashboardResponse, APIError[]>({
    ...kubernetesQueries.cluster(clusterId)._ctx.dashboard,
    enabled,
  });
};

export const useKubernetesVersionQuery = () =>
  useQuery<KubernetesVersion[], APIError[]>({
    ...kubernetesQueries.versions,
    ...queryPresets.oneTimeFetch,
  });

export const useKubernetesTieredVersionsQuery = (
  tier: string,
  enabled = true
) => {
  return useQuery<KubernetesTieredVersion[], APIError[]>({
    ...kubernetesQueries.tieredVersions(tier),
    ...queryPresets.oneTimeFetch,
    enabled,
  });
};

/**
 * Avoiding fetching all Kubernetes Clusters if possible.
 * Before you use this, consider implementing infinite scroll instead.
 */
export const useAllKubernetesClustersQuery = ({ enabled = false }) => {
  return useQuery<KubernetesCluster[], APIError[]>({
    ...kubernetesQueries.lists,
    enabled,
  });
};

export const useKubernetesControlPlaneACLQuery = (
  clusterId: number,
  enabled: boolean = true
) => {
  return useQuery<KubernetesControlPlaneACLPayload, APIError[]>({
    enabled,
    retry: 1,
    ...kubernetesQueries.cluster(clusterId)._ctx.acl,
  });
};

export const useKubernetesControlPlaneACLMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<
    KubernetesControlPlaneACLPayload,
    APIError[],
    Partial<KubernetesControlPlaneACLPayload>
  >({
    mutationFn: (data) => updateKubernetesClusterControlPlaneACL(id, data),
    onSuccess(data) {
      queryClient.setQueryData(
        kubernetesQueries.cluster(id)._ctx.acl.queryKey,
        data
      );
    },
  });
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

const getAllKubernetesTieredVersions = (tier: string) =>
  getAll<KubernetesTieredVersion>((params, filters) =>
    getKubernetesTieredVersions(tier, params, filters)
  )().then((data) => data.data);

const getAllAPIEndpointsForCluster = (clusterId: number) =>
  getAll<KubernetesEndpointResponse>((params, filters) =>
    getKubernetesClusterEndpoints(clusterId, params, filters)
  )().then((data) => data.data);

const getAllKubernetesTypes = () =>
  getAll<PriceType>((params) => getKubernetesTypes(params))().then(
    (results) => results.data
  );

export const useKubernetesTypesQuery = () =>
  useQuery<PriceType[], APIError[]>({
    ...queryPresets.oneTimeFetch,
    ...kubernetesQueries.types,
  });
