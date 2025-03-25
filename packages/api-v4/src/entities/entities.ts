import { BETA_API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { IamAccountEntities } from './types';

/**
 * getAccountEntities
 *
 * Return all entities for account.
 *
 */
export const getAccountEntities = () => {
  return Request<IamAccountEntities>(
    setURL(`${BETA_API_ROOT}/entities`),
    setMethod('GET')
  );
};
