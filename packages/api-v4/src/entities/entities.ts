import { BETA_API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';

import type { AccountEntity } from './types';
import type { ResourcePage } from 'src/types';

/**
 * getAccountEntities
 *
 * Return all entities for account.
 *
 */
export const getAccountEntities = () => {
  return Request<ResourcePage<AccountEntity>>(
    setURL(`${BETA_API_ROOT}/entities`),
    setMethod('GET'),
  );
};
