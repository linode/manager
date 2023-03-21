/**
 * @file Cypress intercepts and mocks for Cloud Manager LKE operations.
 */

import { apiMatcher } from 'support/util/intercepts';

/**
 * Intercepts POST request to create an LKE cluster.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateCluster = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('lke/clusters'));
};
