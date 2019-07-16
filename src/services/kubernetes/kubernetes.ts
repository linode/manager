import { BETA_API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../index';

import { createKubeClusterSchema, nodePoolSchema } from './kubernetes.schema';

// Payload types
export interface CreateKubeClusterPayload {
  label?: string; // Label will be assigned by the API if not provided
  region?: string; // Will be caught by Yup if undefined
  node_pools: Linode.PoolNodeRequest[];
  version?: string; // Will be caught by Yup if undefined
  tags: string[];
}

type Page<T> = Linode.ResourcePage<T>;

/**
 * getKubernetesClusters
 *
 * Gets a list of a user's Kubernetes clusters
 */
export const getKubernetesClusters = (params?: any, filters?: any) =>
  Request<Page<Linode.KubernetesCluster>>(
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
  Request<Linode.KubernetesCluster>(
    setMethod('GET'),
    setURL(`${BETA_API_ROOT}/lke/clusters/${clusterID}`)
  ).then(response => response.data);

/**
 * createKubernetesClusters
 *
 * Create a new Cluster.
 */
export const createKubernetesCluster = (data: CreateKubeClusterPayload) =>
  Request<Linode.KubernetesCluster>(
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
  data: Partial<Linode.KubernetesCluster>
) =>
  Request<Linode.KubernetesCluster>(
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
  Request<Linode.KubeConfigResponse>(
    setMethod('GET'),
    setURL(`${BETA_API_ROOT}/lke/clusters/${clusterId}/kubeconfig`)
  ).then(response => response.data);
