import { BETA_API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from 'src/request';
import { ResourcePage as Page } from '../types';
import { createKubeClusterSchema } from './kubernetes.schema';
import {
  CreateKubeClusterPayload,
  KubeConfigResponse,
  KubernetesCluster,
  KubernetesVersion
} from './types';

/**
 * getKubernetesClusters
 *
 * Gets a list of a user's Kubernetes clusters
 */
export const getKubernetesClusters = (params?: any, filters?: any) =>
  Request<Page<KubernetesCluster>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${BETA_API_ROOT}/lke/clusters`)
  ).then(response => response.data);

/**
 * getKubernetesCluster
 *
 * Return details about a single Kubernetes cluster
 */
export const getKubernetesCluster = (clusterID: string) =>
  Request<KubernetesCluster>(
    setMethod('GET'),
    setURL(`${BETA_API_ROOT}/lke/clusters/${clusterID}`)
  ).then(response => response.data);

/**
 * createKubernetesClusters
 *
 * Create a new Cluster.
 */
export const createKubernetesCluster = (data: CreateKubeClusterPayload) =>
  Request<KubernetesCluster>(
    setMethod('POST'),
    setURL(`${BETA_API_ROOT}/lke/clusters`),
    setData(data, createKubeClusterSchema)
  ).then(response => response.data);

/**
 * updateKubernetesCluster
 *
 * Create a new Cluster.
 */
export const updateKubernetesCluster = (
  clusterID: number,
  data: Partial<KubernetesCluster>
) =>
  Request<KubernetesCluster>(
    setMethod('PUT'),
    setURL(`${BETA_API_ROOT}/lke/clusters/${clusterID}`),
    setData(data)
  ).then(response => response.data);

/**
 * deleteKubernetesCluster
 *
 * Delete the specified Cluster.
 */
export const deleteKubernetesCluster = (clusterID: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${BETA_API_ROOT}/lke/clusters/${clusterID}`)
  ).then(response => response.data);

/** getKubeConfig
 *
 * Returns a base64 encoded string of a cluster's kubeconfig.yaml
 *
 * @param clusterId
 */

export const getKubeConfig = (clusterId: number) =>
  Request<KubeConfigResponse>(
    setMethod('GET'),
    setURL(`${BETA_API_ROOT}/lke/clusters/${clusterId}/kubeconfig`)
  ).then(response => response.data);

/** getKubernetesVersions
 *
 * Returns a paginated list of available Kubernetes versions.
 *
 */

export const getKubernetesVersions = () =>
  Request<Page<KubernetesVersion>>(
    setMethod('GET'),
    setURL(`${BETA_API_ROOT}/lke/versions`)
  ).then(response => response.data);

/** getKubernetesVersion
 *
 * Returns a single Kubernetes version by ID.
 *
 */

export const getKubernetesVersion = (versionID: string) =>
  Request<KubernetesVersion>(
    setMethod('GET'),
    setURL(`${BETA_API_ROOT}/lke/versions/${versionID}`)
  ).then(response => response.data);
