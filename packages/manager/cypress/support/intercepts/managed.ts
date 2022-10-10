/**
 * @file Cypress intercepts and mocks for Linode Managed operations.
 */

import {
  ManagedContact,
  ManagedCredential,
  ManagedIssue,
  ManagedServiceMonitor,
  ManagedStats,
} from '@linode/api-v4/types';
import { managedStatsFactory } from 'src/factories/managed';
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
