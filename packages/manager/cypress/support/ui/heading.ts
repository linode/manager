/**
 * Page heading UI element.
 */
export const heading = {
  /**
   * Finds the main page heading element.
   *
   * @returns Cypress chainable.
   */
  find: (): Cypress.Chainable => {
    return cy.get('[data-qa-header]');
  },

  /**
   * Finds the main page heading element with the given text.
   *
   * @param text - Text for heading to find.
   *
   * @returns Cypress chainable.
   */
  findByText: (text: string): Cypress.Chainable => {
    return cy.get(`[data-qa-header="${text}"]`);
  },
};
