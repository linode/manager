/**
 * @file Cypress intercepts and mocks for Cloud Manager StackScript operations.
 */

/**
 * Intercepts GET request to list StackScripts.
 *
 * @returns Cypress chainable.
 */
export const interceptGetStackScripts = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', '**/linode/stackscripts*');
};

/**
 * Intercepts POST request to create a StackScript.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateStackScript = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', '**/linode/stackscripts');
};
