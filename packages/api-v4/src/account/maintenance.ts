import { BETA_API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';
import { ResourcePage } from '../types';
import { AccountMaintenance } from './types';

/**
 * getAccountMaintenance
 *
 * Returns a collection of Maintenance objects for any entity a user has permissions to view.
 *
 */
export const getAccountMaintenance = (params?: any, filter?: any) =>
  Request<ResourcePage<AccountMaintenance>>(
    setURL(`${BETA_API_ROOT}/account/maintenance`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  );
