import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../request';
import { ResourcePage as Page } from '../types';
import { nodePoolSchema } from './kubernetes.schema';
import { KubeNodePoolResponse, PoolNodeRequest } from './types';

/**
 * getNodePools
 *
 * Gets a list of all node pools associated with the specified cluster
 */
export const getNodePools = (clusterID: number, params?: any, filters?: any) =>
  Request<Page<KubeNodePoolResponse>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/lke/clusters/${clusterID}/pools`)
  ).then(response => response.data);

/**
 * getNodePool
 *
 * Returns a single node pool
 */
export const getNodePool = (clusterID: number, nodePoolID: number) =>
  Request<KubeNodePoolResponse>(
    setMethod('GET'),
    setURL(`${API_ROOT}/lke/clusters/${clusterID}/pools/${nodePoolID}`)
  ).then(response => response.data);

/**
 * createNodePool
 *
 * Adds a node pool to the specified cluster.
 */
export const createNodePool = (clusterID: number, data: PoolNodeRequest) =>
  Request<KubeNodePoolResponse>(
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
  clusterID: number,
  nodePoolID: number,
  data: PoolNodeRequest
) =>
  Request<KubeNodePoolResponse>(
    setMethod('PUT'),
    setURL(`${API_ROOT}/lke/clusters/${clusterID}/pools/${nodePoolID}`),
    setData(data, nodePoolSchema)
  ).then(response => response.data);

/**
 * deleteNodePool
 *
 * Delete a single node pool from the specified Cluster.
 */
export const deleteNodePool = (clusterID: number, nodePoolID: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}/lke/clusters/${clusterID}/pools/${nodePoolID}`)
  ).then(response => response.data);

/**
 * recycleAllNodes
 *
 * Recycles all nodes from the specified Cluster.
 */
export const recycleAllNodes = (clusterID: number, nodePoolID: number) =>
  Request<{}>(
    setMethod('POST'),
    setURL(`${API_ROOT}/lke/clusters/${clusterID}/pools/${nodePoolID}/recycle`)
  ).then(response => response.data);
