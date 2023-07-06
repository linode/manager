import {
  createVPCSchema,
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
import { Filter, ResourcePage as Page, Params } from '../types';
import { CreateVPCPayload, UpdateVPCPayload, VPC } from './types';

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
    setXFilter(filter)
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
    setMethod('GET')
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
    setData(data, createVPCSchema)
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
    setData(data, updateVPCSchema)
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
    setMethod('DELETE')
  );

// Subnet methods
