import {
  nodePoolBetaSchema,
  nodePoolSchema,
} from '@linode/validation/lib/kubernetes.schema';

import { API_ROOT, BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type {
  CreateNodePoolData,
  CreateNodePoolDataBeta,
  KubeNodePoolResponse,
  KubeNodePoolResponseBeta,
  UpdateNodePoolData,
  UpdateNodePoolDataBeta,
} from './types';

/**
 * getNodePools
 *
 * Gets a list of all node pools associated with the specified cluster
 */
export const getNodePools = (
  clusterID: number,
  params?: Params,
  filters?: Filter,
) =>
  Request<Page<KubeNodePoolResponse>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}/pools`),
  );

/**
 * getNodePool
 *
 * Returns a single node pool
 */
export const getNodePool = (clusterID: number, nodePoolID: number) =>
  Request<KubeNodePoolResponse>(
    setMethod('GET'),
    setURL(
      `${API_ROOT}/lke/clusters/${encodeURIComponent(
        clusterID,
      )}/pools/${encodeURIComponent(nodePoolID)}`,
    ),
  );

/**
 * getNodePoolBeta
 *
 * Returns a single node pool with additional beta fields
 */
export const getNodePoolBeta = (clusterID: number, nodePoolID: number) =>
  Request<KubeNodePoolResponseBeta>(
    setMethod('GET'),
    setURL(
      `${BETA_API_ROOT}/lke/clusters/${encodeURIComponent(
        clusterID,
      )}/pools/${encodeURIComponent(nodePoolID)}`,
    ),
  );

/**
 * createNodePool
 *
 * Adds a node pool to the specified cluster.
 */
export const createNodePool = (clusterID: number, data: CreateNodePoolData) =>
  Request<KubeNodePoolResponse>(
    setMethod('POST'),
    setURL(`${API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}/pools`),
    setData(data, nodePoolSchema),
  );

/**
 * createNodePool
 *
 * Adds a node pool to the specified cluster with beta fields.
 */
export const createNodePoolBeta = (
  clusterID: number,
  data: CreateNodePoolDataBeta,
) =>
  Request<KubeNodePoolResponseBeta>(
    setMethod('POST'),
    setURL(
      `${BETA_API_ROOT}/lke/clusters/${encodeURIComponent(clusterID)}/pools`,
    ),
    setData(data, nodePoolBetaSchema),
  );

/**
 * updateNodePool
 *
 * Change the type or count of a node pool
 */
export const updateNodePool = (
  clusterID: number,
  nodePoolID: number,
  data: Partial<UpdateNodePoolData>,
) =>
  Request<KubeNodePoolResponse>(
    setMethod('PUT'),
    setURL(
      `${API_ROOT}/lke/clusters/${encodeURIComponent(
        clusterID,
      )}/pools/${encodeURIComponent(nodePoolID)}`,
    ),
    setData(data, nodePoolSchema),
  );

/**
 * updateNodePoolBeta
 *
 * Change the type, count, upgrade_strategy, or k8_version of a node pool
 */
export const updateNodePoolBeta = (
  clusterID: number,
  nodePoolID: number,
  data: Partial<UpdateNodePoolDataBeta>,
) =>
  Request<KubeNodePoolResponseBeta>(
    setMethod('PUT'),
    setURL(
      `${BETA_API_ROOT}/lke/clusters/${encodeURIComponent(
        clusterID,
      )}/pools/${encodeURIComponent(nodePoolID)}`,
    ),
    setData(data, nodePoolBetaSchema),
  );

/**
 * deleteNodePool
 *
 * Delete a single node pool from the specified Cluster.
 */
export const deleteNodePool = (clusterID: number, nodePoolID: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(
      `${API_ROOT}/lke/clusters/${encodeURIComponent(
        clusterID,
      )}/pools/${encodeURIComponent(nodePoolID)}`,
    ),
  );

/**
 * recycleAllNodes
 *
 * Recycles all nodes from the specified Node Pool.
 */
export const recycleAllNodes = (clusterID: number, nodePoolID: number) =>
  Request<{}>(
    setMethod('POST'),
    setURL(
      `${API_ROOT}/lke/clusters/${encodeURIComponent(
        clusterID,
      )}/pools/${encodeURIComponent(nodePoolID)}/recycle`,
    ),
  );

/**
 * recycleNode
 *
 * Recycles a single node by id.
 */
export const recycleNode = (clusterID: number, nodeID: string) =>
  Request<{}>(
    setMethod('POST'),
    setURL(
      `${API_ROOT}/lke/clusters/${encodeURIComponent(
        clusterID,
      )}/nodes/${encodeURIComponent(nodeID)}/recycle`,
    ),
  );
