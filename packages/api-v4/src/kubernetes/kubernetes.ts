import { createKubeClusterSchema } from '@linode/validation/lib/kubernetes.schema';

import { API_ROOT, BETA_API_ROOT } from '../constants';
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
 * Gets a list of a user's Kubernetes clusters
 */
export const getKubernetesClusters = (params?: Params, filters?: Filter) =>
  Request<Page<KubernetesCluster>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/lke/clusters`),
  );

/**
 * getKubernetesCluster
 *
 * Return details about a single Kubernetes cluster
 */
export const getKubernetesCluster = (clusterID: number) =>
  Request<KubernetesCluster>(
    setMethod('GET'),
    setURL(`${API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}`),
  );

/**
 * createKubernetesClusters
 *
 * Create a new cluster.
 */
export const createKubernetesCluster = (data: CreateKubeClusterPayload) => {
  return Request<KubernetesCluster>(
    setMethod('POST'),
    setURL(`${API_ROOT}/lke/clusters`),
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
    setURL(`${API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}`),
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
    setURL(`${API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}`),
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
      `${API_ROOT}/lke/clusters/${encodeURIComponent(clusterId)}/kubeconfig`,
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
      `${API_ROOT}/lke/clusters/${encodeURIComponent(clusterId)}/kubeconfig`,
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
    setURL(`${API_ROOT}/lke/versions`),
  );

/** getKubernetesTieredVersionsBeta
 *
 * Returns a paginated list of available Kubernetes tiered versions from the beta API.
 *
 */

export const getKubernetesTieredVersionsBeta = (
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
    setURL(`${API_ROOT}/lke/versions/${encodeURIComponent(versionID)}`),
  );

/** getKubernetesTieredVersionBeta
 *
 * Returns a single tiered Kubernetes version by ID from the beta API.
 *
 */

export const getKubernetesTieredVersionBeta = (
  tier: string,
  versionID: string,
) =>
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
      `${API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}/api-endpoints`,
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
      `${API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}/dashboard`,
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
    setURL(`${API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}/recycle`),
  );

/**
 * getKubernetesTypes
 *
 * Returns a paginated list of available Kubernetes types; used for dynamic pricing.
 */
export const getKubernetesTypes = (params?: Params) =>
  Request<Page<PriceType>>(
    setURL(`${API_ROOT}/lke/types`),
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
      `${API_ROOT}/lke/clusters/${encodeURIComponent(
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
      `${API_ROOT}/lke/clusters/${encodeURIComponent(
        clusterID,
      )}/control_plane_acl`,
    ),
    setData(data),
  );
