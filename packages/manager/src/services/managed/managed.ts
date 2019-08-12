import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setParams, setURL, setXFilter } from '../index';

// Payload types

type Page<T> = Linode.ResourcePage<T>;

export interface ManagedServicePayload {
  label: string;
}

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

/**
 * disableServiceMonitor
 *
 * Temporarily disables monitoring of a Managed Service.
 */
export const disableServiceMonitor = (
  serviceID: number,
  params?: any,
  filters?: any
) =>
  Request<Linode.ManagedServiceMonitor>(
    setMethod('POST'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/managed/services/${serviceID}/disable`)
  ).then(response => response.data);

/**
 * createServiceMonitor
 *
 * Creates a Managed Service Monitor
 */
export const createServiceMonitor = (data: ManagedServicePayload) =>
  Request<Linode.ManagedServiceMonitor>(
    setMethod('POST'),
    setURL(`${API_ROOT}/managed/services`),
    setData(data)
  ).then(response => response.data);