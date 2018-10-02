import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL, setXFilter } from '../index';

export const updateIP = (address: string, payload: any) =>
  Request<Linode.IPAddress>(
    setURL(`${API_ROOT}/networking/ips/${address}`),
    setData(payload),
    setMethod('PUT'),
  )
    .then(response => response.data);

export const assignAddresses = (data: any) =>
  Request(
    setURL(`${API_ROOT}/networking/ipv4/assign`),
    setMethod('POST'),
    setData(data),
  );

export const getIPs = (region?: string) => {
  const requestOptions = [
    setURL(`${API_ROOT}/networking/ips`),
    setMethod('GET'),
  ]
  if (region) {
    requestOptions.push(setXFilter({ region }) as any);
  }
  return Request(...requestOptions)
    .then(response => response.data);
}

export const shareAddresses = (data: any) =>
  Request(
    setURL(`${API_ROOT}/networking/ipv4/share`),
    setMethod('POST'),
    setData(data),
  );
