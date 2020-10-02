import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../request';
import { ResourcePage as Page } from '../types';
import {
  createContactSchema,
  createCredentialSchema,
  createServiceMonitorSchema,
  updateCredentialSchema,
  updateManagedLinodeSchema,
  updatePasswordSchema
} from './managed.schema';
import {
  ContactPayload,
  CredentialPayload,
  ManagedContact,
  ManagedCredential,
  ManagedIssue,
  ManagedLinodeSetting,
  ManagedServiceMonitor,
  ManagedServicePayload,
  ManagedSSHPubKey,
  ManagedSSHSetting,
  ManagedStats,
  UpdateCredentialPayload,
  UpdatePasswordPayload
} from './types';

/**
 * enableManaged
 *
 * Enables the Managed feature
 * on your account. This service is billed at $100/month/Linode.
 *
 * Should this live in /account?
 *
 */

export const enableManaged = () =>
  Request<{}>(
    setMethod('POST'),
    setURL(`${API_ROOT}/account/settings/managed-enable`)
  );

/**
 * getServices
 *
 * Returns a paginated list of Managed Services on your account.
 */
export const getServices = (params?: any, filters?: any) =>
  Request<Page<ManagedServiceMonitor>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/managed/services`)
  );

/**
 * disableServiceMonitor
 *
 * Temporarily disables monitoring of a Managed Service.
 */
export const disableServiceMonitor = (serviceID: number) =>
  Request<ManagedServiceMonitor>(
    setMethod('POST'),
    setURL(`${API_ROOT}/managed/services/${serviceID}/disable`)
  );

/**
 * enableServiceMonitor
 *
 * Enables monitoring of a Managed Service that is currently disabled.
 */
export const enableServiceMonitor = (serviceID: number) =>
  Request<ManagedServiceMonitor>(
    setMethod('POST'),
    setURL(`${API_ROOT}/managed/services/${serviceID}/enable`)
  );

/**
 * deleteServiceMonitor
 *
 * Disables a Managed Service and removes it from your account.
 */
export const deleteServiceMonitor = (serviceID: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}/managed/services/${serviceID}`)
  );

/**
 * getLinodeSettings
 *
 * Returns a paginated list of Managed Settings for your Linodes. There will be one entry per Linode on your Account.
 */
export const getLinodeSettings = (params?: any, filters?: any) =>
  Request<Page<ManagedLinodeSetting>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/managed/linode-settings`)
  );

/**
 * createServiceMonitor
 *
 * Creates a Managed Service Monitor
 */
export const createServiceMonitor = (data: ManagedServicePayload) =>
  Request<ManagedServiceMonitor>(
    setMethod('POST'),
    setURL(`${API_ROOT}/managed/services`),
    setData(data, createServiceMonitorSchema)
  );

/**
 * updateServiceMonitor
 *
 * Update a Managed Service Monitor
 */
export const updateServiceMonitor = (
  monitorID: number,
  data: Partial<ManagedServicePayload>
) =>
  Request<ManagedServiceMonitor>(
    setMethod('PUT'),
    setURL(`${API_ROOT}/managed/services/${monitorID}`),
    setData(data, createServiceMonitorSchema)
  );

/**
 * getCredentials
 *
 * Returns a paginated list of Managed Credentials for your account.
 */
export const getCredentials = (params?: any, filters?: any) =>
  Request<Page<ManagedCredential>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/managed/credentials`)
  );

/**
 * updateCredential
 *
 * Update the label on a Managed Credential on your account.
 * Other fields (password and username) cannot be changed.
 */
export const updateCredential = (
  credentialID: number,
  data: UpdateCredentialPayload
) =>
  Request<Page<ManagedCredential>>(
    setMethod('PUT'),
    setData(data, updateCredentialSchema),
    setURL(`${API_ROOT}/managed/credentials/${credentialID}`)
  );

/**
 * updatePassword
 *
 * Update the username and/or password on a Managed Credential on your account.
 */
export const updatePassword = (
  credentialID: number,
  data: UpdatePasswordPayload
) =>
  Request<Page<ManagedCredential>>(
    setMethod('POST'),
    setData(data, updatePasswordSchema),
    setURL(`${API_ROOT}/managed/credentials/${credentialID}/update`)
  );

/**
 * deleteCredential
 *
 * Disables a Managed Credential and removes it from your account.
 */
export const deleteCredential = (credentialID: number) =>
  Request<{}>(
    setMethod('POST'),
    setURL(`${API_ROOT}/managed/credentials/${credentialID}/revoke`)
  );

/*
 * createCredential
 *
 * Creates a Managed Credential
 */
export const createCredential = (data: CredentialPayload) =>
  Request<ManagedCredential>(
    setMethod('POST'),
    setURL(`${API_ROOT}/managed/credentials`),
    setData(data, createCredentialSchema)
  );

/**
 * getSSHKey
 *
 * Returns the unique SSH public key assigned to your Linode account's Managed service.
 * If you add this public key to a Linode on your account, Linode special forces will be
 * able to log in to the Linode with this key when attempting to resolve issues.
 */
export const getSSHPubKey = () =>
  Request<ManagedSSHPubKey>(
    setMethod('GET'),
    setURL(`${API_ROOT}/managed/credentials/sshkey`)
  );

/**
 * updateLinodeSettings
 *
 * Updates a single Linode's Managed settings.
 *
 */
export const updateLinodeSettings = (
  linodeId: number,
  data: { ssh: Partial<ManagedSSHSetting> }
) =>
  Request<ManagedLinodeSetting>(
    setURL(`${API_ROOT}/managed/linode-settings/${linodeId}`),
    setMethod('PUT'),
    setData(data, updateManagedLinodeSchema)
  );

/**
 * getManagedContacts
 *
 * Returns a paginated list of Managed Contacts on your Account.
 */
export const getManagedContacts = (params?: any, filters?: any) =>
  Request<Page<ManagedContact>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/managed/contacts`)
  );

/**
 * createContact
 *
 * Creates a Managed Contact
 */
export const createContact = (data: ContactPayload) =>
  Request<ManagedContact>(
    setMethod('POST'),
    setURL(`${API_ROOT}/managed/contacts`),
    setData(data, createContactSchema)
  );

/**
 * updateContact
 *
 * Updates a Managed Contact
 */
export const updateContact = (
  contactId: number,
  data: Partial<ContactPayload>
) =>
  Request<ManagedContact>(
    setMethod('PUT'),
    setURL(`${API_ROOT}/managed/contacts/${contactId}`),
    setData(data, createContactSchema)
  );

/**
 * deleteContact
 *
 * Deletes a Managed Contact
 */
export const deleteContact = (contactId: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}/managed/contacts/${contactId}`)
  );

/**
 * getManagedIssues
 *
 * Returns a paginated list of Issues on a Managed customer's account.
 */
export const getManagedIssues = () =>
  Request<Page<ManagedIssue>>(
    setMethod('GET'),
    setURL(`${API_ROOT}/managed/issues`)
  );

/**
 * getManagedStats
 *
 * Returns usage data for all of the Linodes on a Managed customer's account.
 */
export const getManagedStats = () =>
  Request<ManagedStats>(setMethod('GET'), setURL(`${API_ROOT}/managed/stats`));
