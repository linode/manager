import { createKubeClusterSchema } from '@linode/validation/lib/kubernetes.schema';

import { BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params, PriceType } from '../types';
import type {
  CreateKubeClusterPayload,
  KubeConfigResponse,
  KubernetesCluster,
  KubernetesControlPlaneACLPayload,
  KubernetesDashboardResponse,
  KubernetesEndpointResponse,
  KubernetesTieredVersion,
  KubernetesVersion,
} from './types';

/**
 * getKubernetesClusters
 *
 * Gets a list of a user's Kubernetes clusters from beta API
 */
export const getKubernetesClusters = (params?: Params, filters?: Filter) =>
  Request<Page<KubernetesCluster>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${BETA_API_ROOT}/lke/clusters`),
  );

/**
 * getKubernetesCluster
 *
 * Return details about a single Kubernetes cluster from beta API
 */
export const getKubernetesCluster = (clusterID: number) =>
  Request<KubernetesCluster>(
    setMethod('GET'),
    setURL(`${BETA_API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}`),
  );

/**
 * createKubernetesCluster
 *
 * Create a new cluster with the beta API:
 * 1. When the feature flag for APL is enabled and APL is set to enabled in the UI
 * 2. When the LKE-E feature is enabled
 *
 */
export const createKubernetesCluster = (data: CreateKubeClusterPayload) => {
  return Request<KubernetesCluster>(
    setMethod('POST'),
    setURL(`${BETA_API_ROOT}/lke/clusters`),
    setData(data, createKubeClusterSchema),
  );
};

/**
 * updateKubernetesCluster
 *
 * Update an existing cluster.
 */
export const updateKubernetesCluster = (
  clusterID: number,
  data: Partial<KubernetesCluster>,
) =>
  Request<KubernetesCluster>(
    setMethod('PUT'),
    setURL(`${BETA_API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}`),
    setData(data),
  );

/**
 * deleteKubernetesCluster
 *
 * Delete the specified Cluster.
 */
export const deleteKubernetesCluster = (clusterID: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${BETA_API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}`),
  );

/**
 * getKubeConfig
 *
 * Returns a base64 encoded string of a cluster's kubeconfig.yaml
 *
 * @param clusterId
 */

export const getKubeConfig = (clusterId: number) =>
  Request<KubeConfigResponse>(
    setMethod('GET'),
    setURL(
      `${BETA_API_ROOT}/lke/clusters/${encodeURIComponent(clusterId)}/kubeconfig`,
    ),
  );

/**
 * resetKubeConfig
 *
 * Regenerates the cluster's kubeconfig.yaml
 *
 * @param clusterId
 */
export const resetKubeConfig = (clusterId: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(
      `${BETA_API_ROOT}/lke/clusters/${encodeURIComponent(clusterId)}/kubeconfig`,
    ),
  );

/** getKubernetesVersions
 *
 * Returns a paginated list of available Kubernetes versions.
 *
 */

export const getKubernetesVersions = (params?: Params, filters?: Filter) =>
  Request<Page<KubernetesVersion>>(
    setMethod('GET'),
    setXFilter(filters),
    setParams(params),
    setURL(`${BETA_API_ROOT}/lke/versions`),
  );

/** getKubernetesTieredVersions
 *
 * Returns a paginated list of available Kubernetes tiered versions from the beta API.
 *
 */

export const getKubernetesTieredVersions = (
  tier: string,
  params?: Params,
  filters?: Filter,
) =>
  Request<Page<KubernetesTieredVersion>>(
    setMethod('GET'),
    setXFilter(filters),
    setParams(params),
    setURL(`${BETA_API_ROOT}/lke/tiers/${encodeURIComponent(tier)}/versions`),
  );

/** getKubernetesVersion
 *
 * Returns a single Kubernetes version by ID.
 *
 */

export const getKubernetesVersion = (versionID: string) =>
  Request<KubernetesVersion>(
    setMethod('GET'),
    setURL(`${BETA_API_ROOT}/lke/versions/${encodeURIComponent(versionID)}`),
  );

/** getKubernetesTieredVersion
 *
 * Returns a single tiered Kubernetes version by ID from the beta API.
 *
 */

export const getKubernetesTieredVersion = (tier: string, versionID: string) =>
  Request<KubernetesTieredVersion>(
    setMethod('GET'),
    setURL(
      `${BETA_API_ROOT}/lke/tiers/${encodeURIComponent(
        tier,
      )}/versions/${encodeURIComponent(versionID)}`,
    ),
  );

/** getKubernetesClusterEndpoint
 *
 * Returns the endpoint URL for a single Kubernetes cluster by ID.
 *
 */

export const getKubernetesClusterEndpoints = (
  clusterID: number,
  params?: Params,
  filters?: Filter,
) =>
  Request<Page<KubernetesEndpointResponse>>(
    setMethod('GET'),
    setXFilter(filters),
    setParams(params),
    setURL(
      `${BETA_API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}/api-endpoints`,
    ),
  );

/** getKubernetesClusterDashboard
 * Returns the URL for a single Kubernetes Dashboard for a single Kubernetes Cluster by ID.
 *
 */

export const getKubernetesClusterDashboard = (clusterID: number) =>
  Request<KubernetesDashboardResponse>(
    setMethod('GET'),
    setURL(
      `${BETA_API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}/dashboard`,
    ),
  );

/** recycleClusterNodes
 *
 * Recycle all nodes in the target cluster (across all node pools)
 *
 */

export const recycleClusterNodes = (clusterID: number) =>
  Request<{}>(
    setMethod('POST'),
    setURL(
      `${BETA_API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}/recycle`,
    ),
  );

/**
 * getKubernetesTypesBeta
 *
 * Returns a paginated list of available Kubernetes types from beta API; used for dynamic pricing.
 */
export const getKubernetesTypes = (params?: Params) =>
  Request<Page<PriceType>>(
    setURL(`${BETA_API_ROOT}/lke/types`),
    setMethod('GET'),
    setParams(params),
  );

/**
 * getKubernetesClusterControlPlaneACL
 *
 * Return control plane access list about a single Kubernetes cluster
 */
export const getKubernetesClusterControlPlaneACL = (clusterId: number) =>
  Request<KubernetesControlPlaneACLPayload>(
    setMethod('GET'),
    setURL(
      `${BETA_API_ROOT}/lke/clusters/${encodeURIComponent(
        clusterId,
      )}/control_plane_acl`,
    ),
  );

/**
 * updateKubernetesClusterControlPlaneACL
 *
 * Update an existing ACL from a single Kubernetes cluster.
 */
export const updateKubernetesClusterControlPlaneACL = (
  clusterID: number,
  data: Partial<KubernetesControlPlaneACLPayload>,
) =>
  Request<KubernetesControlPlaneACLPayload>(
    setMethod('PUT'),
    setURL(
      `${BETA_API_ROOT}/lke/clusters/${encodeURIComponent(
        clusterID,
      )}/control_plane_acl`,
    ),
    setData(data),
  );
