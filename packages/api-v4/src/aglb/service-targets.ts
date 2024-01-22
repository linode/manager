import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { Filter, Params, ResourcePage } from '../types';
import { BETA_API_ROOT } from '../constants';
import type {
  ServiceTarget,
  ServiceTargetPayload,
  ServiceTargetsEndpointHealth,
} from './types';
import {
  CreateServiceTargetSchema,
  UpdateServiceTargetSchema,
} from '@linode/validation';

/**
 * getLoadbalancerServiceTargets
 *
 * Returns a paginated list of Akamai Global Load Balancer service targets
 */
export const getLoadbalancerServiceTargets = (
  loadbalancerId: number,
  params?: Params,
  filter?: Filter
) =>
  Request<ResourcePage<ServiceTarget>>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/service-targets`
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  );

/**
 * getServiceTarget
 *
 * Returns an Akamai Global Load Balancer service target
 */
export const getServiceTarget = (
  loadbalancerId: number,
  serviceTargetId: number
) =>
  Request<ServiceTarget>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/service-targets/${encodeURIComponent(serviceTargetId)}`
    ),
    setMethod('GET')
  );

/**
 * getServiceTargetsEndpointHealth
 *
 * Returns endpoint health data for each service targets on an Akamai Global Load Balancer
 */
export const getServiceTargetsEndpointHealth = (loadbalancerId: number) =>
  Request<ServiceTargetsEndpointHealth>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/service-targets/endpoints-health`
    ),
    setMethod('GET')
  );

/**
 * createLoadbalancerServiceTarget
 *
 * Creates an Akamai Global Load Balancer service target
 */
export const createLoadbalancerServiceTarget = (
  loadbalancerId: number,
  data: ServiceTargetPayload
) =>
  Request<ServiceTarget>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/service-targets`
    ),
    setData(data, CreateServiceTargetSchema),
    setMethod('POST')
  );

/**
 * updateLoadbalancerServiceTarget
 *
 * Updates an Akamai Global Load Balancer service target
 */
export const updateLoadbalancerServiceTarget = (
  loadbalancerId: number,
  serviceTargetId: number,
  data: Partial<ServiceTargetPayload>
) =>
  Request<ServiceTarget>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/service-targets/${encodeURIComponent(serviceTargetId)}`
    ),
    setData(data, UpdateServiceTargetSchema),
    setMethod('PUT')
  );

/**
 * deleteLoadbalancerServiceTarget
 *
 * Deletes an Akamai Global Load Balancer service target
 */
export const deleteLoadbalancerServiceTarget = (
  loadbalancerId: number,
  serviceTargetId: number
) =>
  Request<{}>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/service-targets/${encodeURIComponent(serviceTargetId)}`
    ),
    setMethod('DELETE')
  );
