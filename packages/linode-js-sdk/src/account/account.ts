import { API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { Account, NetworkUtilization } from './types';

/**
 * getAccountInfo
 *
 * Return account information,
 * including contact and billing info.
 *
 */
export const getAccountInfo = () => {
  return Request<Account>(setURL(`${API_ROOT}/account`), setMethod('GET')).then(
    response => response.data,
  );
};

/**
 * getNetworkUtilization
 *
 * Return your current network transfer quota and usage.
 *
 */
export const getNetworkUtilization = () =>
  Request<NetworkUtilization>(
    setURL(`${API_ROOT}/account/transfer`),
    setMethod('GET'),
  ).then(response => response.data);
