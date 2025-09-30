/**
 * @file Cypress intercepts and mocks for Logs Delivery API requests.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type { Destination } from '@linode/api-v4';

export const setLocalStorageLogsFlag = () =>
  cy.window().then((win) => {
    return win.localStorage.setItem(
      'devTools/mock-feature-flags',
      '{"aclpLogs": { "beta": true, "enabled": true }}'
    );
  });

/**
 * Intercepts GET request to fetch destination instance and mocks response.
 *
 * @param destination - Response destinations.
 *
 * @returns Cypress chainable.
 */
export const mockGetDestination = (
  destination: Destination
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`monitor/streams/destinations/${destination.id}`),
    makeResponse(destination)
  );
};

/**
 * Intercepts GET request to mock destination data.
 *
 * @param destinations - an array of mock destination objects
 *
 * @returns Cypress chainable.
 */
export const mockGetDestinations = (
  destinations: Destination[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('monitor/streams/destinations*'),
    paginateResponse(destinations)
  );
};

/**
 * Intercepts POST request to create a Destination record.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateDestination = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('monitor/streams/destinations*'));
};

/**
 * Intercepts POST request to create a Destination record.
 *
 * @returns Cypress chainable.
 */
export const interceptDeleteDestination = (
  destination: Destination
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`monitor/streams/destinations/${destination.id}`)
  );
};

/**
 * Intercepts PUT request to update a destination and mocks response.
 *
 * @param destination - Destination data to update.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateDestination = (
  destination: Destination
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`monitor/streams/destinations/${destination.id}`),
    makeResponse(destination)
  );
};

/**
 * Intercepts POST request to verify destination connection.
 *
 * @param responseCode - status code of the response
 * @param responseBody - response body content
 *
 * @returns Cypress chainable.
 */
export const mockTestConnection = (
  responseCode = 200,
  responseBody = {}
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`monitor/streams/destinations/verify`),
    makeResponse(responseBody, responseCode)
  );
};
