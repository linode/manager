import {
  createKubernetesCluster,
  createKubernetesClusterBeta,
  createNodePool,
  deleteKubernetesCluster,
  deleteNodePool,
  getKubeConfig,
  getKubernetesCluster,
  getKubernetesClusterBeta,
  getKubernetesClusterControlPlaneACL,
  getKubernetesClusterDashboard,
  getKubernetesClusterEndpoints,
  getKubernetesClusters,
  getKubernetesClustersBeta,
  getKubernetesTieredVersionsBeta,
  getKubernetesTypes,
  getKubernetesVersions,
  getNodePools,
  recycleAllNodes,
  recycleClusterNodes,
  recycleNode,
  resetKubeConfig,
  updateKubernetesCluster,
  updateKubernetesClusterControlPlaneACL,
  updateNodePool,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  useAPLAvailability,
  useIsLkeEnterpriseEnabled,
} from 'src/features/Kubernetes/kubeUtils';
import { getAll } from 'src/utilities/getAll';

import { queryPresets } from './base';
import { profileQueries } from './profile/profile';

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
      cluster: (useBetaEndpoint: boolean = false) => ({
        queryFn: useBetaEndpoint
          ? () => getKubernetesClusterBeta(id)
          : () => getKubernetesCluster(id),
        queryKey: [useBetaEndpoint ? 'v4beta' : 'v4'],
      }),
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
          const result = await getKubeConfig(id);
          return window.atob(result.kubeconfig);
        },
        queryKey: null,
      },
      pools: {
        queryFn: () => getAllNodePoolsForCluster(id),
        queryKey: null,
      },
    },
    queryFn: () => getKubernetesCluster(id),
    queryKey: [id],
  }),
  lists: {
    contextQueries: {
      all: (useBetaEndpoint: boolean = false) => ({
        queryFn: () =>
          useBetaEndpoint
            ? getAllKubernetesClustersBeta()
            : getAllKubernetesClusters(),
        queryKey: [useBetaEndpoint ? 'v4beta' : 'v4'],
      }),
      paginated: (
        params: Params,
        filter: Filter,
        useBetaEndpoint: boolean = false
      ) => ({
        queryFn: () =>
          useBetaEndpoint
            ? getKubernetesClustersBeta()
            : getKubernetesClusters(params, filter),
        queryKey: [params, filter, useBetaEndpoint ? 'v4beta' : 'v4'],
      }),
    },
    queryKey: null,
  },
  tieredVersions: (tier: string) => ({
    queryFn: () => getAllKubernetesTieredVersionsBeta(tier),
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

export const useKubernetesClusterQuery = (id: number) => {
  const { isLoading: isAPLAvailabilityLoading, showAPL } = useAPLAvailability();
  const { isLkeEnterpriseLAEnabled } = useIsLkeEnterpriseEnabled();
  const useBetaEndpoint = showAPL || isLkeEnterpriseLAEnabled;

  return useQuery<KubernetesCluster, APIError[]>({
    ...kubernetesQueries.cluster(id)._ctx.cluster(useBetaEndpoint),
    enabled: !isAPLAvailabilityLoading,
  });
};

export const useKubernetesClustersQuery = (
  params: Params,
  filter: Filter,
  enabled = true
) => {
  const { isLkeEnterpriseLAEnabled } = useIsLkeEnterpriseEnabled();
  const useBetaEndpoint = isLkeEnterpriseLAEnabled;

  return useQuery<ResourcePage<KubernetesCluster>, APIError[]>({
    ...kubernetesQueries.lists._ctx.paginated(params, filter, useBetaEndpoint),
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
        // queryClient.setQueryData<KubernetesCluster>(
        //   kubernetesQueries.cluster(id).queryKey,
        //   data
        // );
        // Temporary cache update logic for APL
        queryClient.setQueriesData<KubernetesCluster>(
          { queryKey: kubernetesQueries.cluster(id)._ctx.cluster._def },
          (oldData) => ({ ...oldData, ...data })
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

export const useKubenetesKubeConfigQuery = (
  clusterId: number,
  enabled = false
) =>
  useQuery<string, APIError[]>({
    ...kubernetesQueries.cluster(clusterId)._ctx.kubeconfig,
    enabled,
    refetchOnMount: true,
    retry: true,
    retryDelay: 5000,
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

/**
 * duplicated function of useCreateKubernetesClusterMutation
 * necessary to call BETA_API_ROOT in a separate function based on feature flag
 */

export const useCreateKubernetesClusterBetaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<KubernetesCluster, APIError[], CreateKubeClusterPayload>({
    mutationFn: createKubernetesClusterBeta,
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

export const useKubernetesDashboardQuery = (clusterId: number) => {
  return useQuery<KubernetesDashboardResponse, APIError[]>(
    kubernetesQueries.cluster(clusterId)._ctx.dashboard
  );
};

export const useKubernetesVersionQuery = () =>
  useQuery<KubernetesVersion[], APIError[]>({
    ...kubernetesQueries.versions,
    ...queryPresets.oneTimeFetch,
  });

export const useKubernetesTieredVersionQuery = (tier: string) => {
  useQuery<KubernetesTieredVersion[], APIError[]>({
    ...kubernetesQueries.tieredVersions(tier),
    ...queryPresets.oneTimeFetch,
  });
};

/**
 * Avoiding fetching all Kubernetes Clusters if possible.
 * Before you use this, consider implementing infinite scroll instead.
 */
export const useAllKubernetesClustersQuery = (enabled = false) => {
  const { isLkeEnterpriseLAEnabled } = useIsLkeEnterpriseEnabled();
  const useBetaEndpoint = isLkeEnterpriseLAEnabled;

  return useQuery<KubernetesCluster[], APIError[]>({
    ...kubernetesQueries.lists._ctx.all(useBetaEndpoint),
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

const getAllKubernetesClustersBeta = () =>
  getAll<KubernetesCluster>((params, filters) =>
    getKubernetesClustersBeta(params, filters)
  )().then((data) => data.data);

const getAllKubernetesVersions = () =>
  getAll<KubernetesVersion>((params, filters) =>
    getKubernetesVersions(params, filters)
  )().then((data) => data.data);

const getAllKubernetesTieredVersionsBeta = (tier: string) =>
  getAll<KubernetesTieredVersion>((params, filters) =>
    getKubernetesTieredVersionsBeta(tier, params, filters)
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
