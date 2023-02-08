/**
 * @file Cypress intercepts and mocks for Cloud Manager Linode operations.
 */

/**
 * Intercepts POST request to create a Linode.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateLinode = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', '**/linode/instances');
};
