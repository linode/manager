import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL } from '../index';
import {
  createNodeBalancerConfigSchema,
  UpdateNodeBalancerConfigSchema
} from './nodebalancers.schema';
import { combineConfigNodeAddressAndPort } from './utils';

type Page<T> = Linode.ResourcePage<T>;

export interface CreateNodeBalancerConfig {
  port?: number;
  protocol?: 'http' | 'https' | 'tcp';
  algorithm?: 'roundrobin' | 'leastconn' | 'source';
  stickiness?: 'none' | 'table' | 'http_cookie';
  check?: 'none' | 'connection' | 'http' | 'http_body';
  check_interval?: number;
  check_timeout?: number;
  check_attempts?: number;
  check_path?: string;
  check_body?: string;
  check_passive?: boolean;
  cipher_suite?: 'recommended' | 'legacy';
  ssl_cert?: string;
  ssl_key?: string;
}

/* tslint:disable-next-line:no-empty-interface */
export interface UpdateNodeBalancerConfig extends CreateNodeBalancerConfig {}

export interface NodeBalancerConfig {
  algorithm: 'roundrobin' | 'leastconn' | 'source';
  check_attempts: number;
  check_body: string;
  check_interval: number;
  check_passive: boolean;
  check_path: string;
  check_timeout: number;
  check: 'none' | 'connection' | 'http' | 'http_body';
  cipher_suite: 'recommended' | 'legacy';
  id: number;
  nodebalancer_id: number;
  nodes_status: {
    up: number;
    down: number;
  };
  port: number;
  protocol: 'http' | 'https' | 'tcp';
  ssl_cert: string;
  ssl_commonname: string;
  ssl_fingerprint: string;
  ssl_key: string;
  stickiness: 'none' | 'table' | 'http_cookie';
}

/**
 * getNodeBalancerConfigs
 *
 * Returns a list of configuration profiles for the specified NodeBalancer.
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer to view configs for.
 */
export const getNodeBalancerConfigs = (nodeBalancerId: number) =>
  Request<Page<NodeBalancerConfig>>(
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs`),
    setMethod('GET')
  ).then(response => response.data);

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
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}`),
    setMethod('GET')
  ).then(response => response.data);

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
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs`),
    setData(
      data,
      createNodeBalancerConfigSchema,
      combineConfigNodeAddressAndPort
    )
  ).then(response => response.data);

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
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}`),
    setData(data, UpdateNodeBalancerConfigSchema)
  ).then(response => response.data);

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
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}`)
  ).then(response => response.data);
