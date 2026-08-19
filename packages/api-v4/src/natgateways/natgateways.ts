import {
  addNATGatewayAddressSchema,
  createNATGatewayValidationSchema,
  updateNATGatewaySchema,
} from '@linode/validation';

import { BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type {
  CreateNATGatewayPayload,
  NATGateway,
  NATGatewayAddress,
  NATGatewayAddressDetail,
  NATGatewayInterface,
  NATGatewaySettings,
  UpdateNATGatewayPayload,
} from './types';
import type { PriceType } from '@akamai/compute-ui-core/api';

/**
 * Get a paginated list of NAT Gateways
 *
 * @param params - Pagination and filtering parameters
 * @param filter - Additional filtering options
 */
export const getNATGateways = (params?: Params, filter?: Filter) =>
  Request<Page<NATGateway>>(
    setURL(`${BETA_API_ROOT}/networking/natgateways`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * Get a specific NAT Gateway by ID
 *
 * @param id - The ID of the NAT Gateway
 */
export const getNATGateway = (id: number) =>
  Request<NATGateway>(
    setURL(`${BETA_API_ROOT}/networking/natgateways/${id}`),
    setMethod('GET'),
  );

/**
 * Create a new NAT Gateway
 *
 * @param data - The NAT Gateway configuration
 */
export const createNATGateway = (data: CreateNATGatewayPayload) =>
  Request<NATGateway>(
    setURL(`${BETA_API_ROOT}/networking/natgateways`),
    setMethod('POST'),
    setData(data, createNATGatewayValidationSchema()),
  );

/**
 * Update a NAT Gateway's label
 *
 * @param id - The ID of the NAT Gateway
 * @param data - The updated label
 */
export const updateNATGateway = (id: number, data: UpdateNATGatewayPayload) =>
  Request<NATGateway>(
    setURL(`${BETA_API_ROOT}/networking/natgateways/${id}`),
    setMethod('PUT'),
    setData(data, updateNATGatewaySchema),
  );

/**
 * Delete a NAT Gateway
 * Note: The NAT Gateway must not be used by any VPC subnets
 *
 * @param id - The ID of the NAT Gateway to delete
 */
export const deleteNATGateway = (id: number) =>
  Request<{}>(
    setURL(`${BETA_API_ROOT}/networking/natgateways/${id}`),
    setMethod('DELETE'),
  );

/**
 * Add a new address to a NAT Gateway
 * Note: Only works on NAT Gateways not using autoscaling
 *
 * @param id - The ID of the NAT Gateway
 * @param data - The address to add (must be a reserved IP)
 */
export const addNATGatewayAddress = (id: number, data: NATGatewayAddress) =>
  Request<NATGatewayAddressDetail>(
    setURL(`${BETA_API_ROOT}/networking/natgateways/${id}/addresses`),
    setMethod('POST'),
    setData(data, addNATGatewayAddressSchema),
  );

/**
 * Get all addresses assigned to a NAT Gateway
 *
 * @param id - The ID of the NAT Gateway
 * @param params - Pagination parameters
 */
export const getNATGatewayAddresses = (id: number, params?: Params) =>
  Request<Page<NATGatewayAddressDetail>>(
    setURL(`${BETA_API_ROOT}/networking/natgateways/${id}/addresses`),
    setMethod('GET'),
    setParams(params),
  );

/**
 * Get details about a specific address on a NAT Gateway
 *
 * @param id - The ID of the NAT Gateway
 * @param address - The IP address (e.g., "203.0.113.42")
 */
export const getNATGatewayAddress = (id: number, address: string) =>
  Request<NATGatewayAddressDetail>(
    setURL(
      `${BETA_API_ROOT}/networking/natgateways/${id}/addresses/${address}`,
    ),
    setMethod('GET'),
  );

/**
 * Remove an address from a NAT Gateway
 * Note: The address must not be in use by any interfaces
 * Note: Only works on NAT Gateways not using autoscaling
 *
 * @param id - The ID of the NAT Gateway
 * @param address - The IP address to remove
 */
export const deleteNATGatewayAddress = (id: number, address: string) =>
  Request<{}>(
    setURL(
      `${BETA_API_ROOT}/networking/natgateways/${id}/addresses/${address}`,
    ),
    setMethod('DELETE'),
  );

/**
 * Get all interfaces using a specific address on a NAT Gateway
 * Note: Only available with the "natgateway-ports" customer tag
 *
 * @param id - The ID of the NAT Gateway
 * @param address - The IP address
 * @param params - Pagination parameters
 */
export const getNATGatewayAddressInterfaces = (
  id: number,
  address: string,
  params?: Params,
) =>
  Request<Page<NATGatewayInterface>>(
    setURL(
      `${BETA_API_ROOT}/networking/natgateways/${id}/addresses/${address}/interfaces`,
    ),
    setMethod('GET'),
    setParams(params),
  );

/**
 * Get all interfaces assigned to a NAT Gateway
 *
 * @param id - The ID of the NAT Gateway
 * @param params - Pagination parameters
 */
export const getNATGatewayInterfaces = (id: number, params?: Params) =>
  Request<Page<NATGatewayInterface>>(
    setURL(`${BETA_API_ROOT}/networking/natgateways/${id}/interfaces`),
    setMethod('GET'),
    setParams(params),
  );

/**
 * Get NAT Gateway pricing information
 */
export const getNATGatewayTypes = () =>
  Request<Page<PriceType>>(
    setURL(`${BETA_API_ROOT}/networking/natgateways/types`),
    setMethod('GET'),
  );

/**
 * Get NAT Gateway settings for the current user
 * Returns configuration limits and allowed port ranges
 */
export const getNATGatewaySettings = () =>
  Request<NATGatewaySettings>(
    setURL(`${BETA_API_ROOT}/networking/natgateways/settings`),
    setMethod('GET'),
  );
