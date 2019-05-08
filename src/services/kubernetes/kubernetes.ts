import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../index';

import { createKubeClusterSchema } from './kubernetes.schema';

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
 * createKubernetesClusters
 *
 * Create a new Cluster.
 */
export const createKubernetesCluster = (data: CreateKubeClusterPayload) =>
  Request<Linode.KubernetesCluster>(
    setMethod('POST'),
    setURL(`${API_ROOT}/lke/clusters`),
    setData(data, createKubeClusterSchema)
  ).then(response => response.data)
 
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
