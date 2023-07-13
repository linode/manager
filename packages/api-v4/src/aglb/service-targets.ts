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
 * getServiceTargets
 *
 * Returns a paginated list of Akamai Global Load Balancer service targets
 */
export const getServiceTargets = (params: Params, filter?: Filter) =>
  Request<ResourcePage<ServiceTarget>>(
    setURL(`${BETA_API_ROOT}/aglb/service-targets`),
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
 * createServiceTarget
 *
 * Creates an Akamai Global Load Balancer route
 */
export const createServiceTarget = (data: ServiceTargetPayload) =>
  Request<ServiceTarget>(
    setURL(`${BETA_API_ROOT}/aglb/service-targets`),
    setData(data),
    setMethod('POST')
  );

/**
 * updateServiceTarget
 *
 * Updates an Akamai Global Load Balancer route
 */
export const updateServiceTarget = (
  id: number,
  data: Partial<ServiceTargetPayload>
) =>
  Request<ServiceTarget>(
    setURL(`${BETA_API_ROOT}/aglb/service-targets/${encodeURIComponent(id)}`),
    setData(data),
    setMethod('POST')
  );

/**
 * deleteServiceTarget
 *
 * Deletes an Akamai Global Load Balancer service target
 */
export const deleteServiceTarget = (id: number) =>
  Request<{}>(
    setURL(`${BETA_API_ROOT}/aglb/service-targets/${encodeURIComponent(id)}`),
    setMethod('DELETE')
  );
