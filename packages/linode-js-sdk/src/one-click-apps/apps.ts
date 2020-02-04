import { BETA_API_ROOT } from 'src/constants';
import Request, {
  setMethod,
  setParams,
  setURL,
  setXFilter
} from 'src/request';
import { ResourcePage as Page } from '../types';
import { OneClickApp } from './types';

/**
 * Returns a paginated list of OneClickApps.
 *
 */
export const getOneClickApps = (params?: any, filter?: any) =>
  Request<Page<OneClickApp>>(
    setURL(`${BETA_API_ROOT}/linode/one-click-apps/`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  ).then(response => response.data);
