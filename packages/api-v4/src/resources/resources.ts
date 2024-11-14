import { BETA_API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { IamAccountResource } from './types';

/**
 * getAccountResources
 *
 * Return all resources for account.
 *
 */
export const getAccountResources = () => {
  return Request<IamAccountResource>(
    setURL(`${BETA_API_ROOT}/resources`),
    setMethod('GET')
  );
};
