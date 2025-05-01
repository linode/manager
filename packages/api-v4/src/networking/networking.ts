import {
  allocateIPSchema,
  assignAddressesSchema,
  shareAddressesSchema,
  updateIPSchema,
} from '@linode/validation/lib/networking.schema';

import { API_ROOT, BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type {
  CreateIPv6RangePayload,
  IPAddress,
  IPAssignmentPayload,
  IPRange,
  IPRangeInformation,
  IPSharingPayload,
} from './types';

/**
 * Returns a paginated list of IP Addresses on your Account, excluding private
 * addresses.
 *
 */
export const getIPs = (params?: Params, filters?: Filter) =>
  Request<Page<IPAddress>>(
    setURL(`${API_ROOT}/networking/ips`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );

/**
 * Returns information about a single IP Address on your Account.
 *
 * @param address { string } The address to operate on.
 */
export const getIP = (address: string) =>
  Request<IPAddress>(
    setURL(`${API_ROOT}/networking/ips/${encodeURIComponent(address)}`),
    setMethod('GET'),
  );

/**
 * Sets RDNS on an IP Address. Forward DNS must already be set up for reverse
 * DNS to be applied. If you set the RDNS to null for public IPv4 addresses,
 * it will be reset to the default members.linode.com RDNS value.
 *
 * @param address { string } The address to operate on.
 * @param rdns { string } The reverse DNS assigned to this address. For public
 * IPv4 addresses, this will be set to a default value provided by Linode if not
 * explicitly set.
 */
export const updateIP = (address: string, rdns: null | string = null) =>
  Request<IPAddress>(
    setURL(`${API_ROOT}/networking/ips/${encodeURIComponent(address)}`),
    setData({ rdns }, updateIPSchema),
    setMethod('PUT'),
  );

/**
 * Allocates a new IPv4 Address on your Account. The Linode must be configured
 * to support additional addresses - please open a support ticket requesting
 * additional addresses before attempting allocation
 *
 * @param payload { Object }
 * @param payload.type { string } The type of address you are requesting. Only
 * IPv4 addresses may be allocated through this endpoint.
 * @param payload.public { boolean } Whether to create a public or private IPv4
 * address.
 * @param payload.linode_id { number } The ID of a Linode you you have access to
 *  that this address will be allocated to.
 */
export const allocateIp = (payload: any) =>
  Request<IPAddress>(
    setURL(`${API_ROOT}/networking/ips/`),
    setData(payload, allocateIPSchema),
    setMethod('POST'),
  );

/**
 * Assign multiple IPs to multiple Linodes in one Region. This allows swapping,
 * shuffling, or otherwise reorganizing IPv4 Addresses/IPv6 Ranges to your Linodes.
 * When the assignment is finished, all Linodes must end up with at least one public
 * IPv4 and no more than one private IPv4.
 *
 * @param payload { Object }
 * @param payload.region { string } The ID of the Region in which these
 * assignments are to take place. All IPs and Linodes must exist in this Region.
 * @param payload.assignments { Object[] } The ID of the Region in which these
 * assignments are to take place. All IPs and Linodes must exist in this Region.
 */
export const assignAddresses = (payload: IPAssignmentPayload) =>
  Request<{}>(
    setURL(`${API_ROOT}/networking/ips/assign`),
    setMethod('POST'),
    setData(payload, assignAddressesSchema),
  );

/**
 * [Legacy endpoint used until IPv6 sharing is flagged on everywhere]
 * Configure shared IPs. A shared IP may be brought up on a Linode other than
 * the one it lists in its response. This can be used to allow one Linode to
 * begin serving requests should another become unresponsive.
 *
 * @param payload { Object }
 * @param payload.linode_id { number } The ID of the Linode that the addresses
 * will be shared with.
 * @param payload.ips { string[] } A list of IPs that will be shared with this
 * Linode. When this is finished, the given Linode will be able to bring up
 * these addresses in addition to the Linodes that these addresses belong to.
 * You must have access to all of these addresses and they must be in the same
 * Region as the Linode.
 */
export const shareAddressesv4 = (payload: IPSharingPayload) =>
  Request<{}>(
    setURL(`${API_ROOT}/networking/ipv4/share`),
    setMethod('POST'),
    setData(payload, shareAddressesSchema),
  );

/**
 * Configure shared IPs. A shared IP may be brought up on a Linode other than
 * the one it lists in its response. This can be used to allow one Linode to
 * begin serving requests should another become unresponsive.
 *
 * @param payload { Object }
 * @param payload.linode_id { number } The ID of the Linode that the addresses
 * will be shared with.
 * @param payload.ips { string[] } A list of IPs that will be shared with this
 * Linode. When this is finished, the given Linode will be able to bring up
 * these addresses in addition to the Linodes that these addresses belong to.
 * You must have access to all of these addresses and they must be in the same
 * Region as the Linode.
 */
export const shareAddresses = (payload: IPSharingPayload) =>
  Request<{}>(
    setURL(`${BETA_API_ROOT}/networking/ips/share`),
    setMethod('POST'),
    setData(payload, shareAddressesSchema),
  );

/**
 * Displays the IPv6 pools on your Account.
 *
 */
export const getIPv6Pools = (params?: Params) =>
  Request<Page<IPRange>>(
    setURL(`${API_ROOT}/networking/ipv6/pools`),
    setMethod('GET'),
    setParams(params),
  );

/**
 * View IPv6 range information.
 *
 */
export const getIPv6Ranges = (params?: Params, filter?: Filter) =>
  Request<Page<IPRange>>(
    setURL(`${API_ROOT}/networking/ipv6/ranges`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * Returns information about a single IPv6 range on your Account.
 *
 * @param range { string } The range address to operate on.
 */
export const getIPv6RangeInfo = (range: string, params?: Params) =>
  Request<IPRangeInformation>(
    setURL(`${API_ROOT}/networking/ipv6/ranges/${encodeURIComponent(range)}`),
    setMethod('GET'),
    setParams(params),
  );

/**
 * Allows self-serving range creation by the customer
 *
 */

export const createIPv6Range = (payload: CreateIPv6RangePayload) => {
  return Request<{}>(
    setURL(`${API_ROOT}/networking/ipv6/ranges`),
    setMethod('POST'),
    setData(payload),
  );
};
