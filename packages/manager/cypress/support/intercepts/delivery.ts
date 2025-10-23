/**
 * @file Cypress intercepts and mocks for Logs Delivery API requests.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type {
  Destination,
  UpdateDestinationPayloadWithId,
} from '@linode/api-v4';

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
 * @param destinations - an array of mock destination objects.
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
 * Intercepts DELETE request to delete Destination record.
 *
 * @returns Cypress chainable.
 */
export const interceptDeleteDestination = (): Cypress.Chainable<null> => {
  return cy.intercept('DELETE', apiMatcher(`monitor/streams/destinations/*`));
};

/**
 * Intercepts PUT request to update a destination and mocks response.
 *
 * @param destination - Destination data to update.
 * @param responseBody - Full updated destination object.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateDestination = (
  destination: UpdateDestinationPayloadWithId,
  responseBody: Destination
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`monitor/streams/destinations/${destination.id}`),
    makeResponse(responseBody)
  );
};

/**
 * Intercepts POST request to create a destination and mocks response.
 *
 * @param responseCode
 * @param responseBody - Full destination object returned when created.
 *
 * @returns Cypress chainable.
 */
export const mockCreateDestination = (
  responseBody = {},
  responseCode = 200
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`monitor/streams/destinations`),
    makeResponse(responseBody ?? {}, responseCode)
  );
};

/**
 * Intercepts POST request to verify destination connection.
 *
 * @param responseCode - status code of the response.
 * @param responseBody - response body content.
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

/**
 * Intercept DELETE mock request to delete a Destination record.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteDestination = (
  responseCode = 200
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`monitor/streams/destinations/*`),
    makeResponse({}, responseCode)
  );
};
