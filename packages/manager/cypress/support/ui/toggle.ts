/**
 * Toggle button UI element.
 */
export const toggle = {
  /**
   * Find a toggle and returns the Cypress chainable.
   *
   * @returns Cypress chainable.
   */
  find: (): Cypress.Chainable => {
    return cy.get('[data-qa-toggle]');
  },

  /**
   * Finds a toggle by the given data attribute and returns the Cypress chainable.
   *
   * @returns Cypress chainable.
   */
  findByDataAttribute: (attributeName: string): Cypress.Chainable => {
    return cy.get(`[${attributeName}]`);
  },
};
