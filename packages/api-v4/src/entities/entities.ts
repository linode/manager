import { BETA_API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

import type { AccountEntity } from './types';
import type { Filter, Params, ResourcePage } from 'src/types';

/**
 * getAccountEntities
 *
 * Return all entities for account.
 *
 */
export const getAccountEntities = (params?: Params, filters?: Filter) => {
  return Request<ResourcePage<AccountEntity>>(
    setURL(`${BETA_API_ROOT}/entities`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );
};
