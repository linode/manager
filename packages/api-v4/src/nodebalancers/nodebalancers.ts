import {
  NodeBalancerSchema,
  UpdateNodeBalancerSchema,
} from '@linode/validation/lib/nodebalancers.schema';

import { API_ROOT, BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import {
  combineNodeBalancerConfigNodeAddressAndPort,
  combineNodeBalancerConfigNodeAddressAndPortBeta,
} from './utils';

import type { Firewall } from '../firewalls/types';
import type { Filter, ResourcePage as Page, Params, PriceType } from '../types';
import type {
  CreateNodeBalancerPayload,
  NodeBalancer,
  NodeBalancerStats,
  NodeBalancerVpcConfig,
} from './types';

/**
 * getNodeBalancers
 *
 * Returns a paginated list of NodeBalancers on your account.
 */
export const getNodeBalancers = (params?: Params, filters?: Filter) =>
  Request<Page<NodeBalancer>>(
    setURL(`${API_ROOT}/nodebalancers`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );

/**
 * getNodeBalancer
 *
 * Returns detailed information about a single NodeBalancer.
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer to retrieve.
 */
export const getNodeBalancer = (nodeBalancerId: number) =>
  Request<NodeBalancer>(
    setURL(`${API_ROOT}/nodebalancers/${encodeURIComponent(nodeBalancerId)}`),
    setMethod('GET'),
  );

/**
 * getNodeBalancerBeta
 *
 * Returns detailed information about a single NodeBalancer including type (only available for LKE-E).
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer to retrieve.
 */
export const getNodeBalancerBeta = (nodeBalancerId: number) =>
  Request<NodeBalancer>(
    setURL(
      `${BETA_API_ROOT}/nodebalancers/${encodeURIComponent(nodeBalancerId)}`,
    ),
    setMethod('GET'),
  );

/**
 * updateNodeBalancer
 *
 * Update an existing NodeBalancer on your account.
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer to update.
 * @param data { object } The fields to update. Values not included in this
 * parameter will be left unchanged.
 */
export const updateNodeBalancer = (
  nodeBalancerId: number,
  data: Partial<NodeBalancer>,
) =>
  Request<NodeBalancer>(
    setURL(`${API_ROOT}/nodebalancers/${encodeURIComponent(nodeBalancerId)}`),
    setMethod('PUT'),
    setData(data, UpdateNodeBalancerSchema),
  );

/**
 * createNodeBalancer
 *
 * Add a NodeBalancer to your account.
 */
export const createNodeBalancer = (data: CreateNodeBalancerPayload) =>
  Request<NodeBalancer>(
    setMethod('POST'),
    setURL(`${API_ROOT}/nodebalancers`),
    setData(
      data,
      NodeBalancerSchema,
      combineNodeBalancerConfigNodeAddressAndPort,
    ),
  );

/**
 * createNodeBalancerBeta
 *
 * Add a NodeBalancer to your account using the beta API
 */
export const createNodeBalancerBeta = (data: CreateNodeBalancerPayload) =>
  Request<NodeBalancer>(
    setMethod('POST'),
    setURL(`${BETA_API_ROOT}/nodebalancers`),
    setData(
      data,
      NodeBalancerSchema,
      combineNodeBalancerConfigNodeAddressAndPortBeta,
    ),
  );

/**
 * deleteNodeBalancer
 *
 * Remove a NodeBalancer from your account.
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer to delete.
 */
export const deleteNodeBalancer = (nodeBalancerId: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}/nodebalancers/${encodeURIComponent(nodeBalancerId)}`),
  );

/**
 * getNodeBalancerStats
 *
 * Returns detailed statistics about the requested NodeBalancer.
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer to view stats for.
 */
export const getNodeBalancerStats = (nodeBalancerId: number) => {
  return Request<NodeBalancerStats>(
    setURL(
      `${API_ROOT}/nodebalancers/${encodeURIComponent(nodeBalancerId)}/stats`,
    ),
    setMethod('GET'),
  );
};

/**
 * getNodeBalancerFirewalls
 *
 * View Firewall information for Firewalls associated with this NodeBalancer
 */

export const getNodeBalancerFirewalls = (
  nodeBalancerId: number,
  params?: Params,
  filter?: Filter,
) =>
  Request<Page<Firewall>>(
    setURL(
      `${API_ROOT}/nodebalancers/${encodeURIComponent(
        nodeBalancerId,
      )}/firewalls`,
    ),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params),
  );

/**
 * getNodeBalancerTypes
 *
 * Return a paginated list of available NodeBalancer types; used for pricing.
 * This endpoint does not require authentication.
 */
export const getNodeBalancerTypes = (params?: Params) =>
  Request<Page<PriceType>>(
    setURL(`${API_ROOT}/nodebalancers/types`),
    setMethod('GET'),
    setParams(params),
  );

/**
 * getNodeBalancerVPCConfigsBeta
 *
 * View all VPC Config information for this NodeBalancer
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer to view vpc config info for.
 */
export const getNodeBalancerVPCConfigsBeta = (
  nodeBalancerId: number,
  params?: Params,
  filter?: Filter,
) =>
  Request<Page<NodeBalancerVpcConfig>>(
    setURL(
      `${BETA_API_ROOT}/nodebalancers/${encodeURIComponent(
        nodeBalancerId,
      )}/vpcs`,
    ),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params),
  );
/**
 * getNodeBalancerVPCConfigBeta
 *
 * View VPC Config information for this NodeBalancer and VPC Config id
 *
 * @param nodeBalancerId { number } The ID of the NodeBalancer to view vpc config info for.
 */
export const getNodeBalancerVPCConfigBeta = (
  nodeBalancerId: number,
  nbVpcConfigId: number,
) =>
  Request<NodeBalancerVpcConfig>(
    setURL(
      `${BETA_API_ROOT}/nodebalancers/${encodeURIComponent(
        nodeBalancerId,
      )}/vpcs/${encodeURIComponent(nbVpcConfigId)}`,
    ),
    setMethod('GET'),
  );
