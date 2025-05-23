import { IPAllocationSchema } from '@linode/validation/lib/linodes.schema';

import { API_ROOT } from '../constants';
import Request, { setData, setMethod, setURL } from '../request';

import type { IPAddress } from '../networking/types';
import type { IPAllocationRequest, LinodeIPsResponse } from './types';

/**
 * getLinodeIPs
 *
 * Return a list of IP addresses allocated to this Linode.
 *
 * @param linodeId { number } The id of the Linode whose addresses you would like to retrieve.
 */
export const getLinodeIPs = (id: number) =>
  Request<LinodeIPsResponse>(
    setURL(`${API_ROOT}/linode/instances/${encodeURIComponent(id)}/ips`),
    setMethod('GET'),
  );

/**
 * allocateIPAddress
 *
 * Allocates a public or private IPv4 address to a Linode
 *
 * @param linodeId { number } The id of the Linode to receive a new IP address.
 * @param data { object }
 * @param data.type { string } Must be "ipv4", as currently only IPv4 addresses can be allocated.
 * @param data.public { boolean } True for a public IP address, false for a private address.
 */
export const allocateIPAddress = (
  linodeID: number,
  data: IPAllocationRequest,
) =>
  Request<IPAddress>(
    setURL(`${API_ROOT}/linode/instances/${encodeURIComponent(linodeID)}/ips`),
    setMethod('POST'),
    setData(data, IPAllocationSchema),
  );

/**
 * removeIPAddress
 *
 * Deletes a Linode's public IP Address. This request will fail if this is the last IP
 * address allocated to the Linode. This request cannot be invoked on a private IP Address
 *
 * @param payload.linodeID {number} - the linode ID for which you'd like the delete request to be invoked
 * @param payload.address {string} - the IP Address for which you'd like the delete request to be invoked
 */
export const removeIPAddress = (payload: {
  address: string;
  linodeID: number;
}) => {
  return Request<{}>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        payload.linodeID,
      )}/ips/${encodeURIComponent(payload.address)}`,
    ),
    setMethod('DELETE'),
  );
};

/**
 * removeIPv6Range
 *
 * Deletes a Linode's IPv6 range.
 *
 * @param payload.range { string } - the IPv6 Range for which you'd like the delete request to be invoked
 */
export const removeIPv6Range = (payload: { range: string }) => {
  return Request<{}>(
    setURL(
      `${API_ROOT}/networking/ipv6/ranges/${encodeURIComponent(payload.range)}`,
    ),
    setMethod('DELETE'),
  );
};
