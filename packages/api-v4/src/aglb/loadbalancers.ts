import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { BETA_API_ROOT } from '../constants';
import { Filter, Params, ResourcePage } from '../types';
import type {
  CreateBasicLoadbalancerPayload,
  CreateLoadbalancerPayload,
  LoadBalancerEndpointHealth,
  Loadbalancer,
  UpdateLoadbalancerPayload,
} from './types';
import { CreateBasicLoadbalancerSchema } from '@linode/validation';

/**
 * getLoadbalancers
 *
 * Returns a paginated list of Akamai Global Load Balancers
 */
export const getLoadbalancers = (params?: Params, filter?: Filter) =>
  Request<ResourcePage<Loadbalancer>>(
    setURL(`${BETA_API_ROOT}/aglb`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  );

/**
 * getLoadbalancer
 *
 * Returns an Akamai Global Load Balancer
 */
export const getLoadbalancer = (id: number) =>
  Request<Loadbalancer>(
    setURL(`${BETA_API_ROOT}/aglb/${encodeURIComponent(id)}`),
    setMethod('GET')
  );

/**
 * getLoadbalancerEndpointHealth
 *
 * Returns the general endpoint health of an Akamai Global Load Balancer
 */
export const getLoadbalancerEndpointHealth = (id: number) =>
  Request<LoadBalancerEndpointHealth>(
    setURL(`${BETA_API_ROOT}/aglb/${encodeURIComponent(id)}/endpoints-health`),
    setMethod('GET')
  );

/**
 * createLoadbalancer
 *
 * Creates an Akamai Global Load Balancer
 */
export const createLoadbalancer = (data: CreateLoadbalancerPayload) =>
  Request<Loadbalancer>(
    setURL(`${BETA_API_ROOT}/aglb`),
    setData(data),
    setMethod('POST')
  );

/**
 * createBasicLoadbalancer
 *
 * Creates an unconfigured Akamai Global Load Balancer
 */
export const createBasicLoadbalancer = (data: CreateBasicLoadbalancerPayload) =>
  Request<Loadbalancer>(
    setURL(`${BETA_API_ROOT}/aglb`),
    setData(data, CreateBasicLoadbalancerSchema),
    setMethod('POST')
  );

/**
 * updateLoadbalancer
 *
 * Updates an Akamai Global Load Balancer
 */
export const updateLoadbalancer = (
  id: number,
  data: UpdateLoadbalancerPayload
) =>
  Request<Loadbalancer>(
    setURL(`${BETA_API_ROOT}/aglb/${encodeURIComponent(id)}`),
    setData(data),
    setMethod('PUT')
  );

/**
 * deleteLoadbalancer
 *
 * Deletes an Akamai Global Load Balancer
 */
export const deleteLoadbalancer = (id: number) =>
  Request<{}>(
    setURL(`${BETA_API_ROOT}/aglb/${encodeURIComponent(id)}`),
    setMethod('DELETE')
  );
