import {
  NodeBalancerSchema,
  UpdateNodeBalancerSchema,
} from '@linode/validation/lib/nodebalancers.schema';
import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { ResourcePage as Page } from '../types';
import {
  CreateNodeBalancerPayload,
  NodeBalancer,
  NodeBalancerStats,
} from './types';
import { combineNodeBalancerConfigNodeAddressAndPort } from './utils';

/**
 * getNodeBalancers
 *
 * Returns a paginated list of NodeBalancers on your account.
 */
export const getNodeBalancers = (params?: any, filters?: any) =>
  Request<Page<NodeBalancer>>(
    setURL(`${API_ROOT}/nodebalancers`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
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
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}`),
    setMethod('GET')
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
  data: Partial<NodeBalancer>
) =>
  Request<NodeBalancer>(
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}`),
    setMethod('PUT'),
    setData(data, UpdateNodeBalancerSchema)
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
      combineNodeBalancerConfigNodeAddressAndPort
    )
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
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}`)
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
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/stats`),
    setMethod('GET')
  );
};
