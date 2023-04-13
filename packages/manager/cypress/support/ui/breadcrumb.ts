/**
 * Breadcrumb UI element.
 *
 * Useful for performing navigation and validating navigation display.
 */
export const breadcrumb = {
  /**
   * Finds a breadcrumb element.
   *
   * @returns Cypress chainable.
   */
  find: (): Cypress.Chainable => {
    return cy.get('[data-qa-breadcrumb]');
  },
};
