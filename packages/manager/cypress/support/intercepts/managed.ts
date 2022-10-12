/**
 * @file Cypress intercepts and mocks for Linode Managed operations.
 */

import {
  ManagedContact,
  ManagedCredential,
  ManagedIssue,
  ManagedServiceMonitor,
  ManagedServicePayload,
  ManagedStats,
  ManagedLinodeSetting,
} from '@linode/api-v4/types';
import {
  managedStatsFactory,
  managedSSHPubKeyFactory,
} from 'src/factories/managed';
import { makeResponse } from 'support/util/response';
import { makeErrorResponse } from 'support/util/errors';
import { paginateResponse } from 'support/util/paginate';

/**
 * Intercepts all requests to Managed endpoints and mocks 403 HTTP errors.
 */
export const mockUnauthorizedManagedRequests = (): Cypress.Chainable<null> => {
  return cy.intercept('*/managed/*', makeErrorResponse('Unauthorized', 403));
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
    '*/managed/services*',
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
    '*/managed/services',
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
  return cy.intercept('DELETE', `*/managed/services/${serviceId}`, {});
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
    `*/managed/services/${serviceId}`,
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
    `*/managed/services/${serviceId}/disable`,
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
    `*/managed/services/${serviceId}/enable`,
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
  return cy.intercept('GET', '*/managed/issues*', paginateResponse(issues));
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
    '*/managed/credentials*',
    paginateResponse(credentials)
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
  return cy.intercept('GET', '*/managed/contacts*', paginateResponse(contacts));
};

/**
 * Intercepts GET request to fetch Managed stats and mocks response.
 *
 * If no stats are provided for mocking, the default factory data will be used
 * as a default.
 *
 * @param stats - Stats with which to respond, or `undefined`.
 *
 * @returns Cypress chainable.
 */
export const mockGetStats = (
  stats?: ManagedStats | undefined
): Cypress.Chainable<null> => {
  const mockStats = stats ? stats : managedStatsFactory.build();
  return cy.intercept('GET', '*/managed/stats*', mockStats);
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
    '*/managed/credentials/sshkey',
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
    '*/managed/linode-settings*',
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
    `*/managed/linode-settings/${id}`,
    makeResponse(linodeSettings)
  );
};
