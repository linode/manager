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
  ConfigurationsEndpointHealth,
  UpdateConfigurationPayload,
} from './types';
import {
  CreateConfigurationSchema,
  UpdateConfigurationSchema,
} from '@linode/validation';

/**
 * getLoadbalancerConfigurations
 *
 * Returns a paginated list of Akamai Cloud Load Balancer configurations
 */
export const getLoadbalancerConfigurations = (
  loadbalancerId: number,
  params?: Params,
  filter?: Filter
) =>
  Request<ResourcePage<Configuration>>(
    setURL(
      `${BETA_API_ROOT}/aclb/${encodeURIComponent(
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
 * Returns an Akamai Cloud Load Balancer configuration
 */
export const getLoadbalancerConfiguration = (
  loadbalancerId: number,
  configurationId: number
) =>
  Request<Configuration>(
    setURL(
      `${BETA_API_ROOT}/aclb/${encodeURIComponent(
        loadbalancerId
      )}/configurations/${encodeURIComponent(configurationId)}`
    ),
    setMethod('GET')
  );

/**
 * getLoadbalancerConfigurationsEndpointHealth
 *
 * Returns endpoint health for an Akamai Cloud Load Balancer configuration
 */
export const getLoadbalancerConfigurationsEndpointHealth = (
  loadbalancerId: number
) =>
  Request<ConfigurationsEndpointHealth>(
    setURL(
      `${BETA_API_ROOT}/aclb/${encodeURIComponent(
        loadbalancerId
      )}/configurations/endpoints-health`
    ),
    setMethod('GET')
  );

/**
 * createLoadbalancerConfiguration
 *
 * Creates an Akamai Cloud Load Balancer configuration
 */
export const createLoadbalancerConfiguration = (
  loadbalancerId: number,
  data: ConfigurationPayload
) =>
  Request<Configuration>(
    setURL(
      `${BETA_API_ROOT}/aclb/${encodeURIComponent(
        loadbalancerId
      )}/configurations`
    ),
    setData(data, CreateConfigurationSchema),
    setMethod('POST')
  );

/**
 * updateLoadbalancerConfiguration
 *
 * Updates an Akamai Cloud Load Balancer configuration
 */
export const updateLoadbalancerConfiguration = (
  loadbalancerId: number,
  configurationId: number,
  data: UpdateConfigurationPayload
) =>
  Request<Configuration>(
    setURL(
      `${BETA_API_ROOT}/aclb/${encodeURIComponent(
        loadbalancerId
      )}/configurations/${encodeURIComponent(configurationId)}`
    ),
    setData(data, UpdateConfigurationSchema),
    setMethod('PUT')
  );

/**
 * deleteLoadbalancerConfiguration
 *
 * Deletes an Akamai Cloud Load Balancer configuration
 */
export const deleteLoadbalancerConfiguration = (
  loadbalancerId: number,
  configurationId: number
) =>
  Request<{}>(
    setURL(
      `${BETA_API_ROOT}/aclb/${encodeURIComponent(
        loadbalancerId
      )}/configurations/${encodeURIComponent(configurationId)}`
    ),
    setMethod('DELETE')
  );
