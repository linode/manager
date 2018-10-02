import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '../index';

export const getLinodeIPs = (id: number) =>
  Request<Linode.LinodeIPsResponse>(
    setURL(`${API_ROOT}/linode/instances/${id}/ips`),
    setMethod('GET'),
  )
    .then(response => response.data);

/** @todo type. */
export const allocatePrivateIP = (linodeID: number) =>
  Request(
    setURL(`${API_ROOT}/linode/instances/${linodeID}/ips`),
    setMethod('POST'),
    setData({ type: 'ipv4', public: false }),
  ).then(response => response.data);

/** @todo type */
export const allocatePublicIP = (linodeID: number) =>
  Request(
    setURL(`${API_ROOT}/linode/instances/${linodeID}/ips`),
    setMethod('POST'),
    setData({ type: 'ipv4', public: true }),
  ).then(response => response.data);