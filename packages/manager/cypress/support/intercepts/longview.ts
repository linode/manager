import { apiMatcher } from 'support/util/intercepts';

/**
 * Intercepts request to retrieve Longview status for a Longview client.
 *
 * @returns Cypress chainable.
 */
export const interceptFetchLongviewStatus = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', 'https://longview.linode.com/fetch');
};

/**
 * Intercepts GET request to fetch Longview clients.
 *
 * @returns Cypress chainable.
 */
export const interceptGetLongviewClients = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('longview/clients*'));
};
