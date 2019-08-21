import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../index';

import {
  createCredentialSchema,
  createServiceMonitorSchema,
  updateCredentialSchema,
  updateManagedLinodeSchema,
  updatePasswordSchema
} from './managed.schema';

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

export interface CredentialPayload {
  label: string;
  password?: string;
  username?: string;
}

export interface UpdateCredentialPayload {
  // Not using a Partial<> bc this is the only possible field to update
  label: string;
}

export interface UpdatePasswordPayload {
  password?: string;
  username?: string;
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
  Request<{}>(
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

/**
 * getCredentials
 *
 * Returns a paginated list of Managed Credentials for your account.
 */
export const getCredentials = (params?: any, filters?: any) =>
  Request<Page<Linode.ManagedCredential>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/managed/credentials`)
  ).then(response => response.data);

/**
 * updateCredential
 *
 * Update the label on a Managed Credential on your account.
 * Other fields (password and username) cannot be changed. (MAYBE? this is confusing)
 */
export const updateCredential = (credentialID: number, data: UpdateCredentialPayload) =>
  Request<Page<Linode.ManagedCredential>>(
    setMethod('PUT'),
    setData(data, updateCredentialSchema),
    setURL(`${API_ROOT}/managed/credentials/${credentialID}`)
  ).then(response => response.data);

/**
 * updatePassword
 *
 * Update the label on a Managed Credential on your account.
 * Other fields (password and username) cannot be changed. (MAYBE? this is confusing)
 */
export const updatePassword = (credentialID: number, data: UpdatePasswordPayload) =>
Request<Page<Linode.ManagedCredential>>(
  setMethod('POST'),
  setData(data, updatePasswordSchema),
  setURL(`${API_ROOT}/managed/credentials/${credentialID}/update`)
).then(response => response.data);

/**
 * deleteCredential
 *
 * Disables a Managed Credential and removes it from your account.
 */
export const deleteCredential = (credentialID: number) =>
  Request<{}>(
    setMethod('POST'),
    setURL(`${API_ROOT}/managed/credentials/${credentialID}/revoke`)
  ).then(response => response.data);

/*
 * createCredential
 *
 * Creates a Managed Credential
 */
export const createCredential = (data: CredentialPayload) =>
  Request<Linode.ManagedCredential>(
    setMethod('POST'),
    setURL(`${API_ROOT}/managed/credentials`),
    setData(data, createCredentialSchema)
  ).then(response => response.data);

/**
 * updateLinodeSettings
 *
 * Updates a single Linode's Managed settings.
 *
 */
export const updateLinodeSettings = (
  linodeId: number,
  data: { ssh: Partial<Linode.ManagedSSHSetting> }
) =>
  Request<Linode.ManagedLinodeSetting>(
    setURL(`${API_ROOT}/managed/linode-settings/${linodeId}`),
    setMethod('PUT'),
    setData(data, updateManagedLinodeSchema)
  ).then(response => response.data);

/**
 * getManagedContacts
 *
 * Returns a paginated list of Managed Contacts on your Account.
 */
export const getManagedContacts = (params?: any, filters?: any) =>
  Request<Page<Linode.ManagedContact>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/managed/contacts`)
  ).then(response => response.data);
