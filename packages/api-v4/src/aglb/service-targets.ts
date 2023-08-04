import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { Filter, Params, ResourcePage } from 'src/types';
import { BETA_API_ROOT } from 'src/constants';
import type { ServiceTarget, ServiceTargetPayload } from './types';

/**
 * getLoadbalancerServiceTargets
 *
 * Returns a paginated list of Akamai Global Load Balancer service targets
 */
export const getLoadbalancerServiceTargets = (
  loadbalancrId: number,
  params?: Params,
  filter?: Filter
) =>
  Request<ResourcePage<ServiceTarget>>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancrId
      )}/service-targets`
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  );

/**
 * getServiceTarget
 *
 * Returns an Akamai Global Load Balancer route
 */
export const getServiceTarget = (id: number) =>
  Request<ServiceTarget>(
    setURL(`${BETA_API_ROOT}/aglb/service-targets/${encodeURIComponent(id)}`),
    setMethod('GET')
  );

/**
 * createLoadbalancerServiceTarget
 *
 * Creates an Akamai Global Load Balancer route
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
    setData(data),
    setMethod('POST')
  );

/**
 * updateLoadbalancerServiceTarget
 *
 * Updates an Akamai Global Load Balancer route
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
    setData(data),
    setMethod('POST')
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
