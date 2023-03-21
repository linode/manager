/**
 * @file Cypress intercepts and mocks for Cloud Manager LKE operations.
 */

import { apiMatcher } from 'support/util/intercepts';

export const interceptCreateCluster = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('lke/clusters'));
};
