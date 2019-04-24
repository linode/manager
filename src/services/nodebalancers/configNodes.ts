import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL } from '../index';
import { nodeBalancerConfigNodeSchema } from './nodebalancers.schema';
import { mergeAddressAndPort } from './utils';

type Page<T> = Linode.ResourcePage<T>;

export type NodeBalancerConfigNodeMode =
  | 'accept'
  | 'reject'
  | 'backup'
  | 'drain';

export interface CreateNodeBalancerConfigNode {
  address: string;
  label: string;
  mode?: NodeBalancerConfigNodeMode;
  weight?: number;
}

export interface UpdateNodeBalancerConfigNode {
  address?: string;
  label?: string;
  mode?: NodeBalancerConfigNodeMode;
  weight?: number;
}

export interface NodeBalancerConfigNode {
  address: string;
  config_id: number;
  id: number;
  label: string;
  mode: NodeBalancerConfigNodeMode;
  nodebalancer_id: number;
  status: 'unknown' | 'UP' | 'DOWN';
  weight: number;
}

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
 * Note: The Linode API does not accept separate port and IP address parameters. This method will join
 * the IP and port after validation:
 *
 * data: {
 *  address: '0.0.0.0',
 *  port: 80
 * }
 *
 * will become:
 *
 * data: {
 *  address: '0.0.0.0:80'
 * }
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer the config belongs to.
 * @param configId { number } The configuration profile to add a node to.
 * @param data
 */
export const createNodeBalancerConfigNode = (
  nodeBalancerId: number,
  configId: number,
  data: CreateNodeBalancerConfigNode
) =>
  Request<NodeBalancerConfigNode>(
    setMethod('POST'),
    setURL(
      `${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}/nodes`
    ),
    setData(data, nodeBalancerConfigNodeSchema, mergeAddressAndPort)
  ).then(response => response.data);

/**
 * createNodeBalancerConfigNode
 *
 * Updates a backend node for the specified NodeBalancer configuration profile.
 *
 * Note: The Linode API does not accept separate port and IP address parameters. This method will join
 * the IP and port after validation:
 *
 * data: {
 *  address: '0.0.0.0',
 *  port: 80
 * }
 *
 * will become:
 *
 * data: {
 *  address: '0.0.0.0:80'
 * }
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
    setData(data, nodeBalancerConfigNodeSchema, mergeAddressAndPort)
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
