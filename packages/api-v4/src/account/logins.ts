import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

import type { Filter, Params, ResourcePage } from '../types';
import type { AccountLogin } from './types';

/**
 * getAccountLogins
 *
 * Retrieve a paginated list of logins on your account.
 *
 */
export const getAccountLogins = (params?: Params, filter?: Filter) =>
  Request<ResourcePage<AccountLogin>>(
    setURL(`${API_ROOT}/account/logins`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * getAccountLogin
 *
 * Retrieve details for a single login.
 *
 * @param loginId { number } The ID of the login to be retrieved
 *
 */
export const getAccountLogin = (loginId: number) =>
  Request<AccountLogin>(
    setURL(`${API_ROOT}/account/logins/${encodeURIComponent(loginId)}`),
    setMethod('GET'),
  );
