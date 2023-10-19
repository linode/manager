import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { Filter, Params, ResourcePage } from '../types';
import { BETA_API_ROOT } from '../constants';
import type { Route, CreateRoutePayload, UpdateRoutePayload } from './types';
import { UpdateRouteSchema, CreateRouteSchema } from '@linode/validation';

/**
 * getLoadbalancerRoutes
 *
 * Returns a paginated list of Akamai Global Load Balancer routes
 */
export const getLoadbalancerRoutes = (
  loadbalancerId: number,
  params?: Params,
  filter?: Filter
) =>
  Request<ResourcePage<Route>>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(loadbalancerId)}/routes`
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  );

/**
 * getLoadbalancerRoute
 *
 * Returns an Akamai Global Load Balancer route
 */
export const getLoadbalancerRoute = (loadbalancerId: number, routeId: number) =>
  Request<Route>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/routes/${encodeURIComponent(routeId)}`
    ),
    setMethod('GET')
  );

/**
 * createLoadbalancerRoute
 *
 * Creates an Akamai Global Load Balancer route
 */
export const createLoadbalancerRoute = (
  loadbalancerId: number,
  data: CreateRoutePayload
) =>
  Request<Route>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(loadbalancerId)}/routes`
    ),
    setData(data, CreateRouteSchema),
    setMethod('POST')
  );

/**
 * updateLoadbalancerRoute
 *
 * Updates an Akamai Global Load Balancer route
 */
export const updateLoadbalancerRoute = (
  loadbalancerId: number,
  routeId: number,
  data: UpdateRoutePayload
) =>
  Request<Route>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/routes/${encodeURIComponent(routeId)}`
    ),
    setData(data, UpdateRouteSchema),
    setMethod('PUT')
  );

/**
 * deleteLoadbalancerRoute
 *
 * Deletes an Akamai Global Load Balancer route
 */
export const deleteLoadbalancerRoute = (
  loadbalancerId: number,
  routeId: number
) =>
  Request<{}>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/routes/${encodeURIComponent(routeId)}`
    ),
    setMethod('DELETE')
  );
