import {
  createNodeBalancerConfigSchema,
  UpdateNodeBalancerConfigSchema,
} from '@linode/validation/lib/nodebalancers.schema';
import { API_ROOT } from '../constants';
import Request, { setData, setMethod, setParams, setURL } from '../request';
import { ResourcePage as Page, Params } from '../types';
import {
  CreateNodeBalancerConfig,
  NodeBalancerConfig,
  UpdateNodeBalancerConfig,
} from './types';
import { combineConfigNodeAddressAndPort } from './utils';

/**
 * getNodeBalancerConfigs
 *
 * Returns a list of configuration profiles for the specified NodeBalancer.
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer to view configs for.
 */
export const getNodeBalancerConfigs = (
  nodeBalancerId: number,
  params?: Params
) =>
  Request<Page<NodeBalancerConfig>>(
    setURL(
      `${API_ROOT}/nodebalancers/${encodeURIComponent(nodeBalancerId)}/configs`
    ),
    setMethod('GET'),
    setParams(params)
  );

/**
 * getNodeBalancerConfig
 *
 * Returns a list of configuration profiles for the specified NodeBalancer.
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer associated with the config.
 */
export const getNodeBalancerConfig = (
  nodeBalancerId: number,
  configId: number
) =>
  Request<Page<NodeBalancerConfig>>(
    setURL(
      `${API_ROOT}/nodebalancers/${encodeURIComponent(
        nodeBalancerId
      )}/configs/${encodeURIComponent(configId)}`
    ),
    setMethod('GET')
  );

/**
 * createNodeBalancerConfig
 *
 * Creates a NodeBalancer Config, which allows the NodeBalancer to accept traffic on a new port.
 * You will need to add NodeBalancer Nodes to the new Config before it can actually serve requests.
 *
 * @param nodeBalancerId { number } The NodeBalancer to receive the new config.
 */
export const createNodeBalancerConfig = (
  nodeBalancerId: number,
  data: CreateNodeBalancerConfig
) =>
  Request<NodeBalancerConfig>(
    setMethod('POST'),
    setURL(
      `${API_ROOT}/nodebalancers/${encodeURIComponent(nodeBalancerId)}/configs`
    ),
    setData(
      data,
      createNodeBalancerConfigSchema,
      combineConfigNodeAddressAndPort
    )
  );

/**
 * updateNodeBalancerConfig
 *
 * Updates the configuration for a single port on a NodeBalancer.
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer associated with the config.
 * @param configId { number } The ID of the configuration profile to be updated
 */
export const updateNodeBalancerConfig = (
  nodeBalancerId: number,
  configId: number,
  data: UpdateNodeBalancerConfig
) =>
  Request<NodeBalancerConfig>(
    setMethod('PUT'),
    setURL(
      `${API_ROOT}/nodebalancers/${encodeURIComponent(
        nodeBalancerId
      )}/configs/${encodeURIComponent(configId)}`
    ),
    setData(data, UpdateNodeBalancerConfigSchema)
  );

/**
 * deleteNodeBalancerConfig
 *
 * Delete a single NodeBalancer configuration profile.
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer associated with the config.
 * @param configId { number } The ID of the configuration profile to be deleted.
 */
export const deleteNodeBalancerConfig = (
  nodeBalancerId: number,
  configId: number
) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(
      `${API_ROOT}/nodebalancers/${encodeURIComponent(
        nodeBalancerId
      )}/configs/${encodeURIComponent(configId)}`
    )
  );
