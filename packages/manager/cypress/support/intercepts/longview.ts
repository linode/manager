import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';
import { LongviewClient } from '@linode/api-v4';
import { LongviewResponse } from 'src/features/Longview/request.types';

/**
 * Intercepts request to retrieve Longview status for a Longview client.
 *
 * @returns Cypress chainable.
 */
export const interceptFetchLongviewStatus = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', 'https://longview.linode.com/fetch');
};

/**
 * Mocks request to retrieve Longview status for a Longview client.
 *
 * @returns Cypress chainable.
 */
export const mockFetchLongviewStatus = (
  status: LongviewResponse
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    'https://longview.linode.com/fetch',
    makeResponse(status)
  );
};

/**
 * Intercepts GET request to fetch Longview clients.
 *
 * @returns Cypress chainable.
 */
export const interceptGetLongviewClients = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('longview/clients*'));
};

/**
 * Mocks GET request to fetch Longview clients.
 *
 * @returns Cypress chainable.
 */
export const mockGetLongviewClients = (
  clients: LongviewClient[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('longview/clients*'),
    paginateResponse(clients)
  );
};

/**
 * Mocks request to create a Longview client.
 *
 * @returns Cypress chainable.
 */
export const mockCreateLongviewClient = (
  client: LongviewClient
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('longview/clients*'),
    makeResponse(client)
  );
};
