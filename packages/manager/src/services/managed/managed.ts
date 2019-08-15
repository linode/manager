import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../index';
import { createServiceMonitorSchema } from './managed.schema';

// Payload types

type Page<T> = Linode.ResourcePage<T>;

export interface ManagedServicePayload {
  label: string;
  service_type: Linode.ServiceType;
  address: string;
  timeout: number;
  notes?: string;
  body?: string;
  consultation_group?: string;
  credentials?: number[];
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
export const disableServiceMonitor = (serviceID: number) =>
  Request<Linode.ManagedServiceMonitor>(
    setMethod('POST'),
    setURL(`${API_ROOT}/managed/services/${serviceID}/disable`)
  ).then(response => response.data);

/**
 * enableServiceMonitor
 *
 * Enables monitoring of a Managed Service that is currently disabled.
 */
export const enableServiceMonitor = (serviceID: number) =>
  Request<Linode.ManagedServiceMonitor>(
    setMethod('POST'),
    setURL(`${API_ROOT}/managed/services/${serviceID}/enable`)
  ).then(response => response.data);

/**
 * deleteServiceMonitor
 *
 * Disables a Managed Service and removes it from your account.
 */
export const deleteServiceMonitor = (serviceID: number) =>
  Request<Linode.ManagedServiceMonitor>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}/managed/services/${serviceID}`)
  ).then(response => response.data);

/**
 * getLinodeSettings
 *
 * Returns a paginated list of Managed Settings for your Linodes. There will be one entry per Linode on your Account.
 */
export const getLinodeSettings = (params?: any, filters?: any) =>
  Request<Page<Linode.ManagedLinodeSetting>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/managed/linode-settings`)
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
    setData(data, createServiceMonitorSchema)
  ).then(response => response.data);
