/**
 * @files Cypress intercepts and mocks for Firewall API requests.
 */

import { apiMatcher } from 'support/util/intercepts';

/**
 * Intercepts POST request to create a Firewall.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateFirewall = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('firewalls'));
};
