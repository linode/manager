/**
 * @file Cypress intercepts and mocks for Logs Delivery API requests.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type {
  Destination,
  Stream,
  UpdateDestinationPayloadWithId,
  UpdateStreamPayloadWithId,
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
 * Intercepts POST request to create a stream and mocks response.
 *
 * @param responseCode
 * @param responseBody - Full stream object returned when created.
 *
 * @returns Cypress chainable.
 */
export const mockCreateStream = (
  responseBody = {},
  responseCode = 200
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`monitor/streams`),
    makeResponse(responseBody, responseCode)
  );
};

/**
 * Intercepts POST request to update a stream and mocks response.
 *
 * @param stream - Stream data to update.
 * @param responseBody - Full updated stream object.
 * @param responseCode
 *
 * @returns Cypress chainable.
 */
export const mockUpdateStream = (
  stream: UpdateStreamPayloadWithId,
  responseBody = {},
  responseCode = 200
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`monitor/streams/${stream.id}`),
    makeResponse(responseBody, responseCode)
  );
};

/**
 * Intercepts GET request to fetch stream instance and mocks response.
 *
 * @param stream - Response stream.
 *
 * @returns Cypress chainable.
 */
export const mockGetStream = (stream: Stream): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`monitor/streams/${stream.id}`),
    makeResponse(stream)
  );
};

/**
 * Intercepts GET request to mock stream data.
 *
 * @param streams - an array of mock stream objects.
 *
 * @returns Cypress chainable.
 */
export const mockGetStreams = (streams: Stream[]): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('monitor/streams*'),
    paginateResponse(streams)
  );
};

/**
 * Intercept DELETE mock request to delete a Stream record.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteStream = (
  responseCode = 200
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`monitor/streams/*`),
    makeResponse({}, responseCode)
  );
};
