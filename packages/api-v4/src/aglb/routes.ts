import Request, { setData, setMethod, setURL } from '../request';
import { ResourcePage } from 'src/types';
import { BETA_API_ROOT } from 'src/constants';
import type { Route, RoutePayload } from './types';

/**
 * getRoutes
 *
 * Returns a paginated list of Akamai Global Load Balancer routes
 */
export const getRoutes = () =>
  Request<ResourcePage<Route>>(
    setURL(`${BETA_API_ROOT}/aglb/routes`),
    setMethod('GET')
  );

/**
 * getRoute
 *
 * Returns an Akamai Global Load Balancer route
 */
export const getRoute = (id: number) =>
  Request<Route>(
    setURL(`${BETA_API_ROOT}/aglb/routes/${encodeURIComponent(id)}`),
    setMethod('GET')
  );

/**
 * createRoute
 *
 * Creates an Akamai Global Load Balancer route
 */
export const createRoute = (data: RoutePayload) =>
  Request<Route>(
    setURL(`${BETA_API_ROOT}/aglb/routes`),
    setData(data),
    setMethod('POST')
  );

/**
 * updateRoute
 *
 * Updates an Akamai Global Load Balancer route
 */
export const updateRoute = (id: number, data: Partial<RoutePayload>) =>
  Request<Route>(
    setURL(`${BETA_API_ROOT}/aglb/routes/${encodeURIComponent(id)}`),
    setData(data),
    setMethod('POST')
  );

/**
 * deleteRoute
 *
 * Deletes an Akamai Global Load Balancer route
 */
export const deleteRoute = (id: number) =>
  Request<{}>(
    setURL(`${BETA_API_ROOT}/aglb/routes/${encodeURIComponent(id)}`),
    setMethod('DELETE')
  );
