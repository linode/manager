import {
  createSubnetSchemaIPv4,
  createVPCSchema,
  modifySubnetSchema,
  updateVPCSchema,
} from '@linode/validation/lib/vpcs.schema';

import { BETA_API_ROOT as API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type {
  CreateSubnetPayload,
  CreateVPCPayload,
  ModifySubnetPayload,
  Subnet,
  UpdateVPCPayload,
  VPC,
  VPCIP,
} from './types';

// VPC methods
/**
 * getVPCs
 *
 * Return a paginated list of VPCs on this account.
 *
 */
export const getVPCs = (params?: Params, filter?: Filter) =>
  Request<Page<VPC>>(
    setURL(`${API_ROOT}/vpcs`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getVPC
 *
 * Return details for a single specified VPC.
 *
 */
export const getVPC = (vpcID: number) =>
  Request<VPC>(
    setURL(`${API_ROOT}/vpcs/${encodeURIComponent(vpcID)}`),
    setMethod('GET'),
  );

/**
 * createVPC
 *
 * Create a new VPC in the specified region.
 *
 */
export const createVPC = (data: CreateVPCPayload) =>
  Request<VPC>(
    setURL(`${API_ROOT}/vpcs`),
    setMethod('POST'),
    setData(data, createVPCSchema),
  );

/**
 * updateVPC
 *
 * Update a VPC.
 *
 */
export const updateVPC = (vpcID: number, data: UpdateVPCPayload) =>
  Request<VPC>(
    setURL(`${API_ROOT}/vpcs/${encodeURIComponent(vpcID)}`),
    setMethod('PUT'),
    setData(data, updateVPCSchema),
  );

/**
 * deleteVPC
 *
 * Delete a single specified VPC.
 *
 */
export const deleteVPC = (vpcID: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/vpcs/${encodeURIComponent(vpcID)}`),
    setMethod('DELETE'),
  );

// Subnet methods
/**
 * getSubnets
 *
 * Return a paginated list of subnets under a specified VPC.
 *
 */
export const getSubnets = (vpcID: number, params?: Params, filter?: Filter) =>
  Request<Page<Subnet>>(
    setURL(`${API_ROOT}/vpcs/${encodeURIComponent(vpcID)}/subnets`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getSubnet
 *
 * Return details for a single specified subnet under a specified VPC.
 *
 */
export const getSubnet = (vpcID: number, subnetID: number) =>
  Request<Subnet>(
    setURL(
      `${API_ROOT}/vpcs/${encodeURIComponent(
        vpcID,
      )}/subnets/${encodeURIComponent(subnetID)}`,
    ),
    setMethod('GET'),
  );

/**
 * createSubnet
 *
 * Create a new subnet under an existing VPC.
 *
 */
export const createSubnet = (vpcID: number, data: CreateSubnetPayload) =>
  Request<Subnet>(
    setURL(`${API_ROOT}/vpcs/${encodeURIComponent(vpcID)}/subnets`),
    setMethod('POST'),
    setData(data, createSubnetSchemaIPv4),
  );

/**
 * modifySubnet
 *
 * Modify an existing subnet.
 *
 */
export const modifySubnet = (
  vpcID: number,
  subnetID: number,
  data: ModifySubnetPayload,
) =>
  Request<Subnet>(
    setURL(
      `${API_ROOT}/vpcs/${encodeURIComponent(
        vpcID,
      )}/subnets/${encodeURIComponent(subnetID)}`,
    ),
    setMethod('PUT'),
    setData(data, modifySubnetSchema),
  );

/**
 * deleteSubnet
 *
 * Delete a single specified subnet belonging to a specified VPC.
 *
 */
export const deleteSubnet = (vpcID: number, subnetID: number) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/vpcs/${encodeURIComponent(
        vpcID,
      )}/subnets/${encodeURIComponent(subnetID)}`,
    ),
    setMethod('DELETE'),
  );

/**
 * getVPCsIPs
 *
 * Get a paginated list of all VPC IP addresses and address ranges
 */
export const getVPCsIPs = (params?: Params, filter?: Filter) =>
  Request<Page<VPCIP>>(
    setURL(`${API_ROOT}/vpcs/ips`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getVPCIPs
 *
 * Get a paginated list of VPC IP addresses for the specified VPC
 */
export const getVPCIPs = (vpcID: number, params?: Params, filter?: Filter) =>
  Request<Page<VPCIP>>(
    setURL(`${API_ROOT}/vpcs/${encodeURIComponent(vpcID)}/ips`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );
