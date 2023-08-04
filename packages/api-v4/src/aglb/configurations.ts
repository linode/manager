import Request, { setData, setMethod, setURL } from '../request';
import { ResourcePage } from 'src/types';
import { BETA_API_ROOT } from 'src/constants';
import type { Configuration, ConfigurationPayload } from './types';

/**
 * getLoadbalancerConfigurations
 *
 * Returns a paginated list of Akamai Global Load Balancer entry points
 */
export const getLoadbalancerConfigurations = (loadbalancerId: number) =>
  Request<ResourcePage<Configuration>>(
    setURL(`${BETA_API_ROOT}/aglb/${loadbalancerId}/configurations`),
    setMethod('GET')
  );

/**
 * getLoadbalancerConfiguration
 *
 * Returns an Akamai Global Load Balancer entry point
 */
export const getLoadbalancerConfiguration = (
  loadbalancerId: number,
  configurationId: number
) =>
  Request<Configuration>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/configurations/${encodeURIComponent(configurationId)}`
    ),
    setMethod('GET')
  );

/**
 * createLoadbalancerConfiguration
 *
 * Creates an Akamai Global Load Balancer entry point
 */
export const createLoadbalancerConfiguration = (
  loadbalancerId: number,
  data: ConfigurationPayload
) =>
  Request<Configuration>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/configurations`
    ),
    setData(data),
    setMethod('POST')
  );

/**
 * updateLoadbalancerConfiguration
 *
 * Updates an Akamai Global Load Balancer entry point
 */
export const updateLoadbalancerConfiguration = (
  loadbalancerId: number,
  configurationId: number,
  data: Partial<ConfigurationPayload>
) =>
  Request<Configuration>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/configurations/${encodeURIComponent(configurationId)}`
    ),
    setData(data),
    setMethod('PUT')
  );

/**
 * deleteEntrypoint
 *
 * Deletes an Akamai Global Load Balancer entry point
 */
export const deleteLoadbalancerEntrypoint = (
  loadbalancerId: number,
  configurationId: number
) =>
  Request<{}>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/configurations/${encodeURIComponent(configurationId)}`
    ),
    setMethod('DELETE')
  );
