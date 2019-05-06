import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../index';

// import { createKubeClusterSchema } from './kubernetes.schema';

// Payload types
export interface CreateKubeClusterPayload {
  label?: string; // Label will be assigned by the API if not provided
  region: string;
  node_pools: Linode.PoolNodeRequest;
  version: string;
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
    setData(data)
  ).then(response => response.data);
