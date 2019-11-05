import { API_ROOT } from '../constants';
import Request, { setData, setMethod, setURL } from '../request';
import { ResourcePage as Page } from '../types';
import { nodeBalancerConfigNodeSchema } from './nodebalancers.schema';
import {
  CreateNodeBalancerConfigNodePayload,
  NodeBalancerConfigNode,
  UpdateNodeBalancerConfigNode
} from './types';

/**
 * getNodeBalancerConfigNodes
 *
 * Returns a paginated list of nodes for the specified NodeBalancer configuration profile.
 * These are the backends that will be sent traffic for this port.
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer the config belongs to.
 * @param configId { number } The configuration profile to retrieve nodes for.
 */
export const getNodeBalancerConfigNodes = (
  nodeBalancerId: number,
  configId: number
) =>
  Request<Page<NodeBalancerConfigNode>>(
    setMethod('GET'),
    setURL(
      `${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}/nodes`
    )
  ).then(response => response.data);

/**
 * getNodeBalancerConfigNode
 *
 * Returns details about a specific node for the given NodeBalancer configuration profile.
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer the config belongs to.
 * @param configId { number } The configuration profile to retrieve nodes for.
 * @param nodeId { number } The Node to be retrieved.
 */
export const getNodeBalancerConfigNode = (
  nodeBalancerId: number,
  configId: number,
  nodeId: number
) =>
  Request<Page<NodeBalancerConfigNode>>(
    setMethod('GET'),
    setURL(
      `${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}/nodes/${nodeId}`
    )
  ).then(response => response.data);
/**
 * createNodeBalancerConfigNode
 *
 * Creates a NodeBalancer Node, a backend that can accept traffic for
 * this NodeBalancer Config. Nodes are routed requests on the configured port based on their status.
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer the config belongs to.
 * @param configId { number } The configuration profile to add a node to.
 * @param data
 */
export const createNodeBalancerConfigNode = (
  nodeBalancerId: number,
  configId: number,
  data: CreateNodeBalancerConfigNodePayload
) =>
  Request<NodeBalancerConfigNode>(
    setMethod('POST'),
    setURL(
      `${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}/nodes`
    ),
    setData(data, nodeBalancerConfigNodeSchema)
  ).then(response => response.data);

/**
 * createNodeBalancerConfigNode
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer the config belongs to.
 * @param configId { number } The configuration profile to add a node to.
 * @param data
 */
export const updateNodeBalancerConfigNode = (
  nodeBalancerId: number,
  configId: number,
  nodeId: number,
  data: UpdateNodeBalancerConfigNode
) =>
  Request<NodeBalancerConfigNode>(
    setMethod('PUT'),
    setURL(
      `${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}/nodes/${nodeId}`
    ),
    setData(data, nodeBalancerConfigNodeSchema)
  ).then(response => response.data);

/**
 * deleteNodeBalancerConfigNode
 *
 * Deletes a single backend Node form the specified NodeBalancer configuration profile.
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer the config belongs to.
 * @param configId { number } The configuration profile to delete a node from.
 * @param nodeId { number} The node to be deleted.
 */
export const deleteNodeBalancerConfigNode = (
  nodeBalancerId: number,
  configId: number,
  nodeId: number
) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(
      `${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}/nodes/${nodeId}`
    )
  ).then(response => response.data);
