import { API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { ConfigOverride } from '../types';
import { Account } from './types';

/**
 * getAccountInfo
 *
 * Return account information,
 * including contact and billing info.
 *
 */
export const getAccountInfo = (config: ConfigOverride = {}) => {
  return Request<Account>(
    setURL(`${config.baseURL || API_ROOT}/account`),
    setMethod('GET'),
  ).then(response => response.data);
};
