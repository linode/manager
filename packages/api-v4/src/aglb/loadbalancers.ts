import Request, { setData, setMethod, setURL } from '../request';
import { BETA_API_ROOT } from 'src/constants';
import { ResourcePage } from 'src/types';
import type {
  CreateLoadbalancerPayload,
  Loadbalancer,
  UpdateLoadbalancerPayload,
} from './types';

/**
 * getLoadbalancers
 *
 * Returns a paginated list of Akamai Global Load Balancers
 */
export const getLoadbalancers = () =>
  Request<ResourcePage<Loadbalancer>>(
    setURL(`${BETA_API_ROOT}/aglb`),
    setMethod('GET')
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
