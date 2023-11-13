import type { LongviewClient } from '@linode/api-v4';
// import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

export const interceptFetchLongviewStatus = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', 'https://longview.linode.com/fetch');
};

export const interceptGetLongviewClients = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('longview/clients*'));
};

export const mockGetLongviewClients = (
  clients: LongviewClient[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('longview/clients*'),
    paginateResponse(clients)
  );
};

export const mockCreateLongviewClient = (
  client: LongviewClient
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('longview/clients'),
    makeResponse(client)
  );
};
