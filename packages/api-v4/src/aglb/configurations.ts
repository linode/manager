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
  Configuration,
  ConfigurationPayload,
  UpdateConfigurationPayload,
} from './types';
import { UpdateConfigurationSchema } from '@linode/validation';

/**
 * getLoadbalancerConfigurations
 *
 * Returns a paginated list of Akamai Global Load Balancer configurations
 */
export const getLoadbalancerConfigurations = (
  loadbalancerId: number,
  params?: Params,
  filter?: Filter
) =>
  Request<ResourcePage<Configuration>>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/configurations`
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  );

/**
 * getLoadbalancerConfiguration
 *
 * Returns an Akamai Global Load Balancer configuration
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
 * Creates an Akamai Global Load Balancer configuration
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
    setData(data, UpdateConfigurationSchema),
    setMethod('POST')
  );

/**
 * updateLoadbalancerConfiguration
 *
 * Updates an Akamai Global Load Balancer configuration
 */
export const updateLoadbalancerConfiguration = (
  loadbalancerId: number,
  configurationId: number,
  data: UpdateConfigurationPayload
) =>
  Request<Configuration>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/configurations/${encodeURIComponent(configurationId)}`
    ),
    setData(data, UpdateConfigurationSchema),
    setMethod('PUT')
  );

/**
 * deleteLoadbalancerConfiguration
 *
 * Deletes an Akamai Global Load Balancer configuration
 */
export const deleteLoadbalancerConfiguration = (
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
