import { API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { Account } from './types'

/**
 * getAccountInfo
 *
 * Return account information,
 * including contact and billing info.
 *
 */
export const getAccountInfo = () =>
  Request<Account>(setURL(`${API_ROOT}/account`), setMethod('GET')).then(
    response => response.data
  );