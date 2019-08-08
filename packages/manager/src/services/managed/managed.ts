import { API_ROOT } from 'src/constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../index';

// Payload types

type Page<T> = Linode.ResourcePage<T>;

/**
 * getServices
 *
 * Returns a paginated list of Managed Services on your account.
 */
export const getServices = (params?: any, filters?: any) =>
  Request<Page<Linode.ManagedServiceMonitor>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/managed/services`)
  ).then(response => response.data);
