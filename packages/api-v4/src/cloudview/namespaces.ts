import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';
import { Filter, Params, ResourcePage as Page } from '../types';
import { Namespace } from './types';

/**
 * getCloudViewNamespaces
 *
 * Returns a paginated list of CloudView Namespaces on your account.
 *
 */
export const getCloudViewNamespaces = (params?: Params, filter?: Filter) =>
  Request<Page<Namespace>>(
    setURL(`${API_ROOT}/cloudview/namespaces`),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params)
  );
