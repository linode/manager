import Request, { setData, setMethod, setURL } from '../request';
import { ResourcePage } from 'src/types';
import { BETA_API_ROOT } from 'src/constants';
import type { Route, RoutePayload } from './types';

/**
 * getLoadbalancerRoutes
 *
 * Returns a paginated list of Akamai Global Load Balancer routes
 */
export const getLoadbalancerRoutes = (id: number) =>
  Request<ResourcePage<Route>>(
    setURL(`${BETA_API_ROOT}/aglb/${encodeURIComponent(id)}/routes`),
    setMethod('GET')
  );

/**
 * getLoadbalancerRoute
 *
 * Returns an Akamai Global Load Balancer route
 */
export const getLoadbalancerRoute = (loadbalancId: number, routeId: number) =>
  Request<Route>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancId
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
  data: RoutePayload
) =>
  Request<Route>(
    setURL(`${BETA_API_ROOT}/aglb/${loadbalancerId}/routes`),
    setData(data),
    setMethod('POST')
  );

/**
 * updateLoadbalanacerRoute
 *
 * Updates an Akamai Global Load Balancer route
 */
export const updateLoadbalanacerRoute = (
  loadbalancerId: number,
  routeId: number,
  data: Partial<RoutePayload>
) =>
  Request<Route>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/routes/${encodeURIComponent(routeId)}`
    ),
    setData(data),
    setMethod('POST')
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
