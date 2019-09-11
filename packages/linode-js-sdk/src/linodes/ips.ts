import { API_ROOT } from 'src/constants';
import { IPAddress } from '../networking/types';
import Request, { setData, setMethod, setURL } from '../request';
import { IPAllocationSchema } from './linodes.schema';
import { IPAllocationRequest, LinodeIPsResponse } from './types';

/**
 * getLinodeIPs
 *
 * Return a list of IP addresses allocated to this Linode.
 *
 * @param linodeId { number } The id of the Linode whose addresses you would like to retrieve.
 */
export const getLinodeIPs = (id: number) =>
  Request<LinodeIPsResponse>(
    setURL(`${API_ROOT}/linode/instances/${id}/ips`),
    setMethod('GET')
  ).then(response => response.data);

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
  data: IPAllocationRequest
) =>
  Request<IPAddress>(
    setURL(`${API_ROOT}/linode/instances/${linodeID}/ips`),
    setMethod('POST'),
    setData(data, IPAllocationSchema)
  ).then(response => response.data);

/**
 * removeIPAddress
 *
 * Deletes a Linode's public IP Address. This request will fail if this is the last IP
 * address allocated to the Linode. This request cannot be invoked on a private IP Address
 *
 * @param {linodeID: number, IPAddress: string} payload - the linode ID and IP Address for
 * which you'd like the delete request to be invoked
 */
export const removeIPAddress = (payload: {
  linodeID: number;
  IPAddress: string;
}) => {
  return Request<{}>(
    setURL(
      `${API_ROOT}/linode/instances/${payload.linodeID}/ips/${payload.IPAddress}`
    ),
    setMethod('DELETE')
  );
};
