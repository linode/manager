/**
 * @file Cypress intercepts and mocks for Linode Managed operations.
 */

import {
  ManagedContact,
  ManagedCredential,
  ManagedIssue,
  ManagedLinodeSetting,
  ManagedServiceMonitor,
  ManagedServicePayload,
  ManagedStats,
} from '@linode/api-v4';
import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import {
  managedSSHPubKeyFactory,
  managedStatsFactory,
} from 'src/factories/managed';

/**
 * Intercepts all requests to Managed endpoints and mocks 403 HTTP errors.
 */
export const mockUnauthorizedManagedRequests = (): Cypress.Chainable<null> => {
  return cy.intercept(
    apiMatcher('managed/*'),
    makeErrorResponse('Unauthorized', 403)
  );
};

/**
 * Intercepts GET requests to fetch Managed service monitors and mocks response.
 *
 * @param serviceMonitors - Service monitors with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetServiceMonitor = (
  serviceMonitorId: number,
  serviceMonitor: ManagedServiceMonitor
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`managed/services/${serviceMonitorId}`),
    makeResponse(serviceMonitor)
  );
};

/**
 * Intercepts GET requests to fetch Managed service monitors and mocks response.
 *
 * @param serviceMonitors - Service monitors with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetServiceMonitors = (
  serviceMonitors: ManagedServiceMonitor[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('managed/services*'),
    paginateResponse(serviceMonitors)
  );
};

/**
 * Intercepts POST requests to create a Managed service monitor and mocks response.
 *
 * @param serviceMonitor - Service monitor payload with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateServiceMonitor = (
  serviceMonitor: ManagedServicePayload
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('managed/services'),
    makeResponse(serviceMonitor)
  );
};

/**
 * Intercepts DELETE request to delete a Managed service monitor and mocks response.
 *
 * @param serviceId - ID of service monitor whose DELETE request should be mocked.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteServiceMonitor = (
  serviceId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`managed/services/${serviceId}`),
    {}
  );
};

/**
 * Intercepts PUT requests to update Managed service monitors and mocks response.
 *
 * @param serviceId - ID of the monitor whose update request should be mocked.
 * @param serviceMonitor - Service monitor payload with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateServiceMonitor = (
  serviceId: number,
  serviceMonitor: ManagedServicePayload
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`managed/services/${serviceId}`),
    makeResponse(serviceMonitor)
  );
};

/**
 * Intercepts POST request to disable a Managed service monitor and mocks response.
 *
 * @param serviceId - ID of the monitor whose disable request should be mocked.
 * @param serviceMonitor - Service monitor payload with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockDisableServiceMonitor = (
  serviceId: number,
  serviceMonitor: ManagedServicePayload
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`managed/services/${serviceId}/disable`),
    makeResponse({
      ...serviceMonitor,
      status: 'disabled',
    })
  );
};

/**
 * Intercepts POST request to enable a Managed service monitor and mocks response.
 *
 * @param serviceId - ID of the monitor whose enable request should be mocked.
 * @param serviceMonitor - Service monitor payload with which to mock response.
 * @param serviceMonitorStatus - Optional status for monitor after being enabled; default is `'ok'`.
 *
 * @returns Cypress chainable.
 */
export const mockEnableServiceMonitor = (
  serviceId: number,
  serviceMonitor: ManagedServicePayload,
  serviceMonitorStatus: string = 'ok'
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`managed/services/${serviceId}/enable`),
    makeResponse({
      ...serviceMonitor,
      status: serviceMonitorStatus,
    })
  );
};

/**
 * Intercepts GET request to fetch Managed issues and mocks response.
 *
 * @param issues - Issues with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetIssues = (
  issues: ManagedIssue[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('managed/issues*'),
    paginateResponse(issues)
  );
};

export const mockGetCredential = (
  credential: ManagedCredential
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`managed/credentials/${credential.id}`),
    makeResponse(credential)
  );
};

/**
 * Intercepts GET request to fetch Managed credentials and mocks response.
 *
 * @param credentials - Credentials with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetCredentials = (
  credentials: ManagedCredential[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('managed/credentials*'),
    paginateResponse(credentials)
  );
};

/**
 * Intercepts POST request to create a Managed credential and mocks response.
 *
 * @param credential - Credential mock with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockCreateCredential = (
  credential: ManagedCredential
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('managed/credentials'),
    makeResponse(credential)
  );
};

/**
 * Intercepts PUT request to update a Managed credential and mocks response.
 *
 * @param id - ID of credential being updated.
 * @param credential - Credential mock with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateCredential = (
  id: number,
  credential: ManagedCredential
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`managed/credentials/${id}`),
    makeResponse(credential)
  );
};

/**
 * Intercepts POST request to update a Managed credential username/password pair and mocks response.
 *
 * @param id - ID of credential being updated.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateCredentialUsernamePassword = (
  id: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`managed/credentials/${id}/update`),
    makeResponse({})
  );
};

/**
 * Intercepts POST request to delete a Managed credential and mocks response.
 *
 * @param id - ID of the credential whose deletion is being mocked.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteCredential = (id: number): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`managed/credentials/${id}/revoke`),
    makeResponse({})
  );
};

/**
 * Intercepts GET request to fetch Managed contacts and mocks response.
 *
 * @param contacts - Contacts with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetContacts = (
  contacts: ManagedContact[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('managed/contacts*'),
    paginateResponse(contacts)
  );
};

/**
 * Intercepts POST request to create a Managed contact and mocks response.
 *
 * @param contact - Contact mock with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockCreateContact = (
  contact: ManagedContact
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('managed/contacts'),
    makeResponse(contact)
  );
};

/**
 * Intercepts PUT request to update a Managed contact and mocks response.
 *
 * @param id - ID of contact being updated.
 * @param contact - Contact mock with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateContact = (
  id: number,
  contact: ManagedContact
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`managed/contacts/${id}`),
    makeResponse(contact)
  );
};

/**
 * Intercepts DELETE request to delete a Managed contact and mocks response.
 *
 * @param id - ID of contact whose deletion is being mocked.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteContact = (id: number): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`managed/contacts/${id}`),
    makeResponse({})
  );
};

/**
 * Intercepts GET request to fetch Managed stats and mocks response.
 *
 * If no stats are provided for mocking, the default factory data will be used.
 *
 * @param stats - Stats with which to respond, or `undefined`.
 *
 * @returns Cypress chainable.
 */
export const mockGetStats = (
  stats?: ManagedStats | undefined
): Cypress.Chainable<null> => {
  const mockStats = stats ? stats : managedStatsFactory.build();
  return cy.intercept('GET', apiMatcher('managed/stats*'), mockStats);
};

/**
 * Intercepts GET request to fetch Managed SSH public key and mocks response.
 *
 * @param publicKey - Optional public key string to use for mocked value.
 *
 * @returns Cypress chainable.
 */
export const mockGetSshPublicKey = (
  publicKey?: string
): Cypress.Chainable<null> => {
  const publicKeyObject = publicKey
    ? managedSSHPubKeyFactory.build({
        ssh_key: publicKey,
      })
    : managedSSHPubKeyFactory.build();

  return cy.intercept(
    'GET',
    apiMatcher('managed/credentials/sshkey'),
    makeResponse(publicKeyObject)
  );
};

/**
 * Intercepts GET request to fetch Managed Linode settings and mocks response.
 *
 * @param linodeSettings - Array of Linode settings to use for mock.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeSettings = (
  linodeSettings: ManagedLinodeSetting[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('managed/linode-settings*'),
    paginateResponse(linodeSettings)
  );
};

/**
 * Intercepts PUT request to update a managed Linode's settings and mocks response.
 *
 * @param id - Linode ID whose settings update request will be mocked.
 * @param linodeSettings - Mock Linode settings with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateLinodeSettings = (
  id: number,
  linodeSettings: ManagedLinodeSetting
) => {
  return cy.intercept(
    'PUT',
    apiMatcher(`managed/linode-settings/${id}`),
    makeResponse(linodeSettings)
  );
};
