/**
 * File upload input element.
 */
export const fileUpload = {
  /**
   * Finds the file upload input element and returns the Cypresss chainable.
   *
   * @returns Cypress chainable.
   */
  find: (): Cypress.Chainable => {
    return cy.get('input[type="file"]');
  },
};
