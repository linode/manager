import { API_ROOT } from 'src/constants';
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
    setURL(`${API_ROOT}/lke/clusters`)
  ).then(response => response.data);

/**
 * getKubernetesCluster
 *
 * Return details about a single Kubernetes cluster
 */
export const getKubernetesCluster = (clusterID: string) =>
  Request<Linode.KubernetesCluster>(
    setMethod('GET'),
    setURL(`${API_ROOT}/lke/clusters/${clusterID}`)
  ).then(response => response.data);

/**
 * createKubernetesClusters
 *
 * Create a new Cluster.
 */
export const createKubernetesCluster = (data: CreateKubeClusterPayload) =>
  Request<Linode.KubernetesCluster>(
    setMethod('POST'),
    setURL(`${API_ROOT}/lke/clusters`),
    setData(data, createKubeClusterSchema)
  ).then(response => response.data);

/**
 * updateKubernetesCluster
 *
 * Create a new Cluster.
 */
export const updateKubernetesCluster = (
  clusterID: string,
  data: Partial<Linode.KubernetesCluster>
) =>
  Request<Linode.KubernetesCluster>(
    setMethod('PUT'),
    setURL(`${API_ROOT}/lke/clusters/${clusterID}`),
    setData(data)
  ).then(response => response.data);

/**
 * deleteKubernetesCluster
 *
 * Delete the specified Cluster.
 */
export const deleteKubernetesCluster = (clusterID: string) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}/lke/clusters/${clusterID}`)
  ).then(response => response.data);

/**
 * createNodePool
 *
 * Adds a node pool to the specified cluster.
 */
export const createNodePool = (
  clusterID: string,
  data: Linode.PoolNodeRequest
) =>
  Request<Page<Linode.KubeNodePoolResponse>>(
    setMethod('POST'),
    setURL(`${API_ROOT}/lke/clusters/${clusterID}/pools`),
    setData(data, nodePoolSchema)
  ).then(response => response.data);

/**
 * updateNodePool
 *
 * Change the type or count of a node pool
 */
export const updateNodePool = (
  clusterID: string,
  nodePoolID: string,
  data: Linode.PoolNodeRequest
) =>
  Request<Page<Linode.KubeNodePoolResponse>>(
    setMethod('POST'),
    setURL(`${API_ROOT}/lke/clusters/${clusterID}/pools/${nodePoolID}`),
    setData(data, nodePoolSchema)
  ).then(response => response.data);

/**
 * deleteNodePool
 *
 * Delete a single node pool from the specified Cluster.
 */
export const deleteNodePool = (clusterID: string, nodePoolID: string) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}/lke/clusters/${clusterID}/pools/${nodePoolID}`)
  ).then(response => response.data);

/** getKubeConfig
 *
 * Returns a base64 encoded string of a cluster's kubeconfig.yaml
 *
 * @param clusterId
 */

export const getKubeConfig = (clusterId: string) =>
  Request<Linode.KubeConfigResponse>(
    setMethod('GET'),
    setURL(`${API_ROOT}/lke/clusters/${clusterId}/kubeconfig`)
  ).then(response => response.data);
